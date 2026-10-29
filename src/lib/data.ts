import type {
  ContactInput,
  Course,
  RegistrationInput,
  RegistrationReceipt,
  VerifiedStudent,
  VolunteerInput,
} from '@/types';
import { loadCatalog } from '@/lib/catalog';
import { computeQuote, DEPOSIT_RATE } from '@/lib/pricing';
import { lookupKey } from '@/lib/verification';
import type { VerificationMethod } from '@/lib/verification';

// Couche d'accès aux données : les pages n'importent que ce fichier.
// Les cours viennent du catalogue (Firestore, modifiable depuis /admin, avec la liste de
// `src/data/courses.ts` en secours) ; les inscriptions, messages et vérifications passent par
// Firestore ; les candidatures volontaires attendent Firestore (voir CLAUDE.md).

export class ServiceUnavailableError extends Error {
  constructor(message = "Ce service n'est pas encore disponible.") {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

/** Formations visibles sur le site. */
export async function getCourses(): Promise<Course[]> {
  return (await loadCatalog()).filter((c) => !c.hidden);
}

/** Toutes les formations, masquées comprises (administration). */
export async function getAllCourses(): Promise<Course[]> {
  return loadCatalog();
}

export async function getCourse(id: string): Promise<Course | null> {
  return (await getCourses()).find((c) => c.id === id) ?? null;
}

const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);

// Recherche un étudiant par identifiant, numéro de carte d'identité ou numéro de passeport.
// Deux lectures par document exact (jamais de liste) : la clé (empreinte du numéro) renvoie
// l'identifiant du dossier, puis le dossier public. Renvoie null si aucun dossier n'existe.
export async function findStudent(
  method: VerificationMethod,
  value: string,
): Promise<VerifiedStudent | null> {
  const { isFirebaseConfigured, getDb } = await import('@/lib/firebase');
  if (!isFirebaseConfigured) {
    throw new ServiceUnavailableError(
      "La vérification de documents n'est pas encore disponible.",
    );
  }
  const { doc, getDoc } = await import('firebase/firestore');
  const db = getDb();

  const key = await lookupKey(method, value);
  const alias = await withTimeout(getDoc(doc(db, 'certificate_keys', key)), 15_000);
  const studentId = alias.exists() ? str(alias.data().student_id) : null;
  if (!studentId) return null;

  const snap = await withTimeout(getDoc(doc(db, 'students', studentId)), 15_000);
  if (!snap.exists()) return null;
  const d = snap.data();
  const fullName = str(d.full_name);
  const code = str(d.student_code);
  if (!fullName || !code) return null;

  const raw: unknown[] = Array.isArray(d.certificates) ? d.certificates : [];
  const certificates = raw
    .map((c) => {
      const r = (c ?? {}) as Record<string, unknown>;
      const name = str(r.course_name);
      const completed = str(r.completed_on);
      if (!name || !completed) return null;
      return {
        course_name: name,
        imo_number: str(r.imo_number),
        certificate_number: str(r.certificate_number),
        completed_on: completed,
        valid_until: str(r.valid_until),
        revoked: r.revoked === true,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => b.completed_on.localeCompare(a.completed_on));

  return { student_code: code, full_name: fullName, certificates };
}

// La vérification n'ouvre qu'une fois les certificats importés : le script d'import écrit
// ce marqueur. Tant qu'il est absent, « aucun dossier » ne voudrait rien dire (la base est vide).
export async function isVerificationOpen(): Promise<boolean> {
  const { isFirebaseConfigured, getDb } = await import('@/lib/firebase');
  if (!isFirebaseConfigured) return false;
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await withTimeout(getDoc(doc(getDb(), 'site_status', 'verification')), 15_000);
  return snap.exists() && snap.data().open === true;
}

export async function submitVolunteer(_volunteer: VolunteerInput): Promise<void> {
  throw new ServiceUnavailableError(
    "L'envoi des candidatures n'est pas encore disponible.",
  );
}

// Alphabet sans caractères ambigus (ni 0/O, ni 1/I) ; 32 symboles = pas de biais avec un octet.
const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function newReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return 'PMTS-' + Array.from(bytes, (b) => REFERENCE_ALPHABET[b % 32]).join('');
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

// Crée une pré-inscription. Les montants enregistrés sont indicatifs : le personnel les
// recalcule à partir des tarifs en vigueur. Le public ne peut pas relire le dossier (règles Firestore).
export async function submitRegistration(
  input: RegistrationInput,
): Promise<RegistrationReceipt> {
  const { isFirebaseConfigured, getDb } = await import('@/lib/firebase');
  if (!isFirebaseConfigured) {
    throw new ServiceUnavailableError(
      "Les inscriptions en ligne ne sont pas encore disponibles.",
    );
  }
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

  const reference = newReference();
  const quote = computeQuote(input.courses);

  await withTimeout(
    setDoc(doc(getDb(), 'registrations', reference), {
      reference,
      last_name: input.last_name.trim(),
      first_names: input.first_names.trim(),
      email: input.email.trim(),
      nationality: input.nationality,
      id_type: input.id_type,
      id_number: input.id_number.trim(),
      photo_data_url: input.photo_data_url,
      ...(input.position ? { position: input.position } : {}),
      courses: input.courses.map((c) => ({
        id: c.id,
        name: c.name,
        imo_number: c.imo_number,
        price_usd: c.price_usd,
      })),
      quote_total_usd: quote.total,
      quote_deposit_usd: quote.deposit,
      quote_discount_usd: quote.discount,
      deposit_rate: DEPOSIT_RATE,
      status: 'pending_deposit',
      consent_at: serverTimestamp(),
      created_at: serverTimestamp(),
    }),
    20_000,
  );

  return { reference, quote };
}

// Enregistre un message du formulaire de contact. Le personnel le lit dans la console Firebase.
export async function submitContactMessage(input: ContactInput): Promise<void> {
  const { isFirebaseConfigured, getDb } = await import('@/lib/firebase');
  if (!isFirebaseConfigured) {
    throw new ServiceUnavailableError(
      "L'envoi de messages n'est pas encore disponible.",
    );
  }
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

  await withTimeout(
    addDoc(collection(getDb(), 'contact_messages'), {
      name: input.name.trim(),
      email: input.email.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      created_at: serverTimestamp(),
    }),
    20_000,
  );
}
