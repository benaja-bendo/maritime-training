import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  runTransaction,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { COURSES } from '@/data/courses';
import { getDb } from '@/lib/firebase';
import { describeChanges as describeCatalogChanges, parseCourses, resetCatalogCache } from '@/lib/catalog';
import { emptyStudent, missingForPublish, newCertificate } from '@/lib/certificates';
import { lookupKey, normalizeIdentifier, todayInPanama } from '@/lib/verification';
import type { Course } from '@/types';
import type {
  AdminCertificate,
  AdminMessage,
  AdminRegistration,
  AdminStudent,
  AuditEntry,
  RegistrationPayments,
  RegistrationStatus,
} from '@/types/admin';

// Accès aux données de l'espace d'administration. Les règles Firestore font foi : sans
// compte autorisé, aucune de ces lectures ou écritures n'aboutit.

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const num = (v: unknown): number | null => (typeof v === 'number' ? v : null);
const iso = (v: unknown): string => (v instanceof Timestamp ? v.toDate().toISOString() : '');

// ---------- Certificats ----------

export { emptyStudent, newCertificate, missingForPublish };

// ---------- Dossiers ----------

function toStudent(id: string, d: Record<string, unknown>): AdminStudent {
  const certs = Array.isArray(d.certificates) ? d.certificates : [];
  return {
    id,
    student_code: str(d.student_code),
    full_name: str(d.full_name),
    national_id: str(d.national_id),
    passport: str(d.passport),
    notes: str(d.notes),
    certificates: certs.map((raw) => {
      const c = (raw ?? {}) as Record<string, unknown>;
      const status = c.status === 'published' || c.status === 'revoked' ? c.status : 'draft';
      const mode = c.mode === 'in_person' || c.mode === 'online' || c.mode === 'blended' ? c.mode : '';
      return {
        id: str(c.id) || crypto.randomUUID(),
        course_name: str(c.course_name),
        imo_number: str(c.imo_number) || null,
        certificate_number: str(c.certificate_number),
        completed_on: str(c.completed_on),
        valid_until: str(c.valid_until),
        session_start: str(c.session_start),
        session_end: str(c.session_end),
        mode,
        result: c.result === 'passed' ? 'passed' : '',
        assessor: str(c.assessor),
        status,
        revoked_reason: str(c.revoked_reason),
        published_by: str(c.published_by),
        published_on: str(c.published_on),
      } satisfies AdminCertificate;
    }),
  };
}

export async function listAdminStudents(): Promise<AdminStudent[]> {
  const snap = await getDocs(query(collection(getDb(), 'admin_students'), orderBy('full_name')));
  return snap.docs.map((d) => toStudent(d.id, d.data()));
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newStudentCode = () =>
  'STU-' +
  Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => CODE_ALPHABET[b % 32]).join('');

function describeChanges(prev: AdminStudent | null, next: AdminStudent): string {
  const parts: string[] = [];
  if (!prev) parts.push(`création de la fiche « ${next.full_name} »`);
  else if (
    prev.full_name !== next.full_name ||
    prev.national_id !== next.national_id ||
    prev.passport !== next.passport ||
    prev.notes !== next.notes
  ) {
    parts.push('modification de la fiche');
  }
  const before = new Map((prev?.certificates ?? []).map((c) => [c.id, c]));
  for (const c of next.certificates) {
    const old = before.get(c.id);
    const label = `« ${c.course_name} »${c.certificate_number ? ` n° ${c.certificate_number}` : ''}`;
    if (!old) parts.push(`ajout du brouillon ${label}`);
    else if (old.status !== c.status) {
      if (c.status === 'published') parts.push(`PUBLICATION ${label}`);
      else if (c.status === 'revoked') parts.push(`RÉVOCATION ${label} : ${c.revoked_reason}`);
    } else if (JSON.stringify(old) !== JSON.stringify(c)) parts.push(`modification du brouillon ${label}`);
    before.delete(c.id);
  }
  for (const c of before.values()) parts.push(`suppression du brouillon « ${c.course_name} »`);
  return (parts.join(' ; ') || 'enregistrement sans changement').slice(0, 1900);
}

// Enregistre le dossier de travail et, s'il contient au moins un certificat publié ou
// révoqué, sa version publique et ses clés de recherche. Le tout dans un seul lot, avec
// son entrée de journal.
export async function saveAdminStudent(
  next: AdminStudent,
  prev: AdminStudent | null,
  actor: string,
  action = 'certificats',
): Promise<AdminStudent> {
  const db = getDb();
  const full_name = next.full_name.trim();
  if (!full_name) throw new Error('Le nom complet est obligatoire.');
  const ident = { national_id: next.national_id.trim(), passport: next.passport.trim() };
  if (!normalizeIdentifier(ident.national_id) && !normalizeIdentifier(ident.passport)) {
    throw new Error('Renseignez au moins un numéro de carte d’identité ou de passeport.');
  }
  for (const [label, v] of [['carte d’identité', ident.national_id], ['passeport', ident.passport]] as const) {
    if (v && normalizeIdentifier(v).length < 4) throw new Error(`Numéro de ${label} trop court (4 caractères minimum).`);
  }

  const before = new Map((prev?.certificates ?? []).map((c) => [c.id, c]));
  const today = todayInPanama();
  const stamped = next.certificates.map((c) => {
    const old = before.get(c.id);
    if (old && old.status !== 'draft') {
      // Un certificat publié ou révoqué ne change plus, sauf sa révocation.
      if (c.status === 'published' && old.status === 'published') return old;
      if (c.status === 'revoked' && old.status === 'published') {
        if (!c.revoked_reason.trim()) throw new Error('Indiquez le motif de la révocation.');
        return { ...old, status: 'revoked' as const, revoked_reason: c.revoked_reason.trim() };
      }
      return old;
    }
    if (c.status === 'revoked') throw new Error('Seul un certificat publié peut être révoqué.');
    if (c.status === 'published') {
      const missing = missingForPublish(c, today);
      if (missing.length) {
        throw new Error(`« ${c.course_name} » ne peut pas être publié : ${missing.join(', ')}.`);
      }
      return { ...c, published_by: actor, published_on: today };
    }
    return c;
  });

  const id = next.id || doc(collection(db, 'admin_students')).id;
  const code = next.student_code.trim() || newStudentCode();
  const merged: AdminStudent = { ...next, id, full_name, student_code: code, ...ident, certificates: stamped };

  const isPublic = merged.certificates.some((c) => c.status !== 'draft');
  const wanted = isPublic
    ? await Promise.all(
        (
          [
            ['student_code', code],
            ['national_id', ident.national_id],
            ['passport', ident.passport],
          ] as const
        )
          .filter(([, v]) => normalizeIdentifier(v))
          .map(async ([method, v]) => ({ hash: await lookupKey(method, v) })),
      )
    : [];

  // Chaque clé doit pointer vers ce dossier ou être libre.
  const missingKeys: string[] = [];
  for (const { hash } of wanted) {
    const snap = await getDoc(doc(db, 'certificate_keys', hash));
    if (snap.exists() && snap.data().student_id !== id) {
      throw new Error('Un de ces numéros est déjà associé à un autre dossier.');
    }
    if (!snap.exists()) missingKeys.push(hash);
  }
  // Clés devenues obsolètes (numéro corrigé).
  const obsolete: string[] = [];
  if (prev && (await getDoc(doc(db, 'students', id))).exists()) {
    const old = await Promise.all(
      (
        [
          ['student_code', prev.student_code],
          ['national_id', prev.national_id],
          ['passport', prev.passport],
        ] as const
      )
        .filter(([, v]) => normalizeIdentifier(v))
        .map(async ([method, v]) => lookupKey(method, v)),
    );
    const keep = new Set(wanted.map((w) => w.hash));
    obsolete.push(...old.filter((h) => !keep.has(h)));
  }

  const auditRef = doc(collection(db, 'audit_log'));
  const batch = writeBatch(db);
  batch.set(auditRef, {
    actor,
    action,
    student_id: id,
    detail: describeChanges(prev, merged),
    at: serverTimestamp(),
  });
  const { id: _omit, ...fields } = merged; // eslint-disable-line @typescript-eslint/no-unused-vars
  batch.set(doc(db, 'admin_students', id), {
    ...fields,
    audit_id: auditRef.id,
    updated_by: actor,
    updated_at: serverTimestamp(),
  });
  if (isPublic) {
    batch.set(doc(db, 'students', id), {
      student_code: code,
      full_name,
      certificates: merged.certificates
        .filter((c) => c.status !== 'draft')
        .map((c) => ({
          course_name: c.course_name,
          imo_number: c.imo_number,
          certificate_number: c.certificate_number || null,
          completed_on: c.completed_on,
          valid_until: c.valid_until || null,
          revoked: c.status === 'revoked',
        })),
      audit_id: auditRef.id,
      updated_at: serverTimestamp(),
    });
    for (const hash of missingKeys) {
      batch.set(doc(db, 'certificate_keys', hash), { student_id: id, audit_id: auditRef.id });
    }
    batch.set(doc(db, 'site_status', 'verification'), { open: true, updated_at: serverTimestamp() });
  }
  for (const hash of obsolete) batch.delete(doc(db, 'certificate_keys', hash));
  await batch.commit();
  return merged;
}

// ---------- Inscriptions ----------

export async function listRegistrations(): Promise<AdminRegistration[]> {
  const snap = await getDocs(
    query(collection(getDb(), 'registrations'), orderBy('created_at', 'desc'), limit(200)),
  );
  return snap.docs.map((d) => {
    const x = d.data();
    const p = (x.payments ?? {}) as Record<string, unknown>;
    const courses = Array.isArray(x.courses) ? x.courses : [];
    return {
      reference: d.id,
      created_at: iso(x.created_at),
      last_name: str(x.last_name),
      first_names: str(x.first_names),
      email: str(x.email),
      nationality: str(x.nationality),
      id_type: x.id_type === 'passport' ? 'passport' : 'national_id',
      id_number: str(x.id_number),
      photo_data_url: str(x.photo_data_url),
      position: str(x.position),
      courses: courses.map((c) => {
        const r = (c ?? {}) as Record<string, unknown>;
        return { id: str(r.id), name: str(r.name), imo_number: str(r.imo_number) || null, price_usd: num(r.price_usd) };
      }),
      quote_total_usd: num(x.quote_total_usd),
      quote_deposit_usd: num(x.quote_deposit_usd),
      quote_discount_usd: num(x.quote_discount_usd) ?? 0,
      status: ((['pending_deposit', 'deposit_paid', 'in_training', 'balance_due', 'completed', 'cancelled'] as string[]).includes(str(x.status)) ? x.status : 'pending_deposit') as RegistrationStatus,
      payments: {
        deposit_usd: num(p.deposit_usd),
        deposit_on: str(p.deposit_on),
        balance_usd: num(p.balance_usd),
        balance_on: str(p.balance_on),
      },
      admin_notes: str(x.admin_notes),
    };
  });
}

export async function updateRegistration(
  reg: AdminRegistration,
  patch: { status: RegistrationStatus; payments: RegistrationPayments; admin_notes: string },
  actor: string,
): Promise<void> {
  const db = getDb();
  const auditRef = doc(collection(db, 'audit_log'));
  const batch = writeBatch(db);
  const changes: string[] = [];
  if (patch.status !== reg.status) changes.push(`statut ${reg.status} -> ${patch.status}`);
  if (JSON.stringify(patch.payments) !== JSON.stringify(reg.payments)) changes.push('paiements modifiés');
  if (patch.admin_notes !== reg.admin_notes) changes.push('notes modifiées');
  batch.set(auditRef, {
    actor,
    action: 'inscription',
    registration: reg.reference,
    detail: changes.join(' ; ') || 'enregistrement sans changement',
    at: serverTimestamp(),
  });
  batch.update(doc(db, 'registrations', reg.reference), {
    status: patch.status,
    payments: patch.payments,
    admin_notes: patch.admin_notes,
    audit_id: auditRef.id,
    updated_by: actor,
    updated_at: serverTimestamp(),
  });
  await batch.commit();
}

// ---------- Catalogue des formations ----------

export interface CatalogState {
  courses: Course[];
  /** 0 tant que le catalogue n'a jamais été enregistré dans la base (le site affiche alors la liste d'origine). */
  version: number;
}

export async function loadAdminCatalog(): Promise<CatalogState> {
  const snap = await getDoc(doc(getDb(), 'catalog', 'courses'));
  if (!snap.exists()) return { courses: structuredClone(COURSES), version: 0 };
  const data = snap.data();
  const courses = parseCourses(data.courses);
  if (!courses) throw new Error('Le catalogue enregistré est illisible : contactez le développeur avant de le modifier.');
  return { courses, version: Number(data.version) || 0 };
}

// Un document unique pour tout le catalogue : le site le lit en une requête. L'écriture est
// versionnée (deux administrateurs ne s'écrasent pas) et journalisée dans la même transaction.
export async function saveCatalog(next: Course[], base: CatalogState, actor: string): Promise<void> {
  const db = getDb();
  const ref = doc(db, 'catalog', 'courses');
  const auditRef = doc(collection(db, 'audit_log'));
  const courses = next.map((c) => ({
    id: c.id,
    imo_number: c.imo_number,
    name: c.name.trim(),
    duration_days: c.duration_days,
    duration_hours: c.duration_hours,
    category: c.category.trim() || 'Autre',
    image_url: c.image_url,
    price_usd: c.price_usd,
    ...(c.framework ? { framework: c.framework } : {}),
    ...(c.hidden ? { hidden: true } : {}),
  }));
  await runTransaction(db, async (tx) => {
    const current = await tx.get(ref);
    const version = current.exists() ? Number(current.data().version) || 0 : 0;
    if (version !== base.version) {
      throw new Error('Le catalogue a été modifié par quelqu’un d’autre entre-temps. Rechargez la page, puis refaites vos modifications.');
    }
    tx.set(auditRef, {
      actor,
      action: 'catalogue',
      detail: describeCatalogChanges(base.courses, next),
      at: serverTimestamp(),
    });
    tx.set(ref, {
      courses,
      version: version + 1,
      updated_at: serverTimestamp(),
      audit_id: auditRef.id,
    });
  });
  resetCatalogCache();
}

// ---------- Messages et journal ----------

export async function listMessages(): Promise<AdminMessage[]> {
  const snap = await getDocs(
    query(collection(getDb(), 'contact_messages'), orderBy('created_at', 'desc'), limit(200)),
  );
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      created_at: iso(x.created_at),
      name: str(x.name),
      email: str(x.email),
      subject: str(x.subject),
      message: str(x.message),
      handled: x.handled === true,
      handled_by: str(x.handled_by),
    };
  });
}

export async function setMessageHandled(id: string, handled: boolean, actor: string): Promise<void> {
  await updateDoc(doc(getDb(), 'contact_messages', id), {
    handled,
    handled_by: handled ? actor : '',
    handled_at: serverTimestamp(),
  });
}

export async function listAudit(): Promise<AuditEntry[]> {
  const snap = await getDocs(query(collection(getDb(), 'audit_log'), orderBy('at', 'desc'), limit(300)));
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      at: iso(x.at),
      actor: str(x.actor),
      action: str(x.action),
      student_id: str(x.student_id),
      registration: str(x.registration),
      detail: str(x.detail),
    };
  });
}
