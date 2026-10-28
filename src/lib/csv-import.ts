import { normalizeIdentifier } from '@/lib/verification';
import type { AdminCertificate, AdminStudent, SessionMode } from '@/types/admin';

// Lecture et contrôle d'un CSV de certificats (une ligne par certificat).
// Tout ce qui est importé devient un BROUILLON : rien n'est visible du public tant qu'un
// certificat n'a pas été publié dans l'espace d'administration.

export const CSV_COLUMNS = [
  'student_code', 'full_name', 'national_id', 'passport', 'course_name', 'imo_number',
  'certificate_number', 'completed_on', 'valid_until',
  'session_start', 'session_end', 'mode', 'result', 'assessor',
] as const;

export interface ParsedCertificate {
  line: number;
  course_name: string;
  imo_number: string | null;
  certificate_number: string;
  completed_on: string;
  valid_until: string;
  session_start: string;
  session_end: string;
  mode: SessionMode | '';
  result: 'passed' | '';
  assessor: string;
}

export interface ParsedStudent {
  student_code: string;
  full_name: string;
  national_id: string;
  passport: string;
  certificates: ParsedCertificate[];
}

export interface CsvReport {
  rows: number;
  students: ParsedStudent[];
  errors: string[];
  warnings: string[];
}

type CatalogItem = { name: string; imo_number: string | null };

function parseTable(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const delim = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const endRow = () => {
    row.push(cell);
    cell = '';
    if (row.some((c) => c.trim() !== '')) rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      endRow();
    } else cell += ch;
  }
  if (cell !== '' || row.length) endRow();
  return rows;
}

export function parseDate(raw: string): string | null {
  const s = raw.trim();
  let y: string, m: string, d: string;
  let match = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) [, y, m, d] = match;
  else if ((match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) [, d, m, y] = match;
  else return null;
  const date = new Date(Date.UTC(+y, +m - 1, +d));
  if (date.getUTCFullYear() !== +y || date.getUTCMonth() !== +m - 1 || date.getUTCDate() !== +d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const nameKey = (s: string) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();

const MODES: Record<string, SessionMode> = {
  presentiel: 'in_person', in_person: 'in_person', 'en personne': 'in_person',
  'en ligne': 'online', en_ligne: 'online', online: 'online',
  mixte: 'blended', blended: 'blended',
};
const RESULTS = new Set(['reussi', 'passed', 'admis', 'ok']);

export function parseCertificateCsv(text: string, catalog: CatalogItem[]): CsvReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fail = (line: number, msg: string) => errors.push(`ligne ${line} : ${msg}`);
  const empty: CsvReport = { rows: 0, students: [], errors, warnings };

  const table = parseTable(text);
  if (table.length < 2) {
    errors.push('Fichier vide ou sans données.');
    return empty;
  }
  const header = table[0].map((h) => h.trim());
  const unknown = header.filter((h) => !(CSV_COLUMNS as readonly string[]).includes(h));
  if (unknown.length) {
    errors.push(`Colonnes inconnues : ${unknown.join(', ')}.`);
    return empty;
  }
  for (const need of ['full_name', 'completed_on']) {
    if (!header.includes(need)) {
      errors.push(`Colonne obligatoire absente : ${need}.`);
      return empty;
    }
  }

  const byImo = new Map(catalog.filter((c) => c.imo_number).map((c) => [c.imo_number as string, c]));
  const byName = new Map(catalog.map((c) => [nameKey(c.name), c]));

  type Row = {
    line: number;
    ids: { student_code: string; national_id: string; passport: string };
    raw: { student_code: string; national_id: string; passport: string; full_name: string };
    cert: ParsedCertificate | null;
  };
  const rows: Row[] = [];

  table.slice(1).forEach((cells, idx) => {
    const line = idx + 2;
    const r: Record<string, string> = Object.fromEntries(
      header.map((h, i) => [h, (cells[i] ?? '').trim()]),
    );
    const g = (k: string) => r[k] ?? '';

    if (!g('full_name')) fail(line, 'nom complet manquant');
    const raw = {
      student_code: g('student_code'),
      national_id: g('national_id'),
      passport: g('passport'),
      full_name: g('full_name'),
    };
    const ids = {
      student_code: normalizeIdentifier(raw.student_code),
      national_id: normalizeIdentifier(raw.national_id),
      passport: normalizeIdentifier(raw.passport),
    };
    for (const [k, v] of Object.entries(ids)) {
      if (v && v.length < 4) fail(line, `${k} trop court (4 caractères minimum)`);
    }
    if (!ids.student_code && !ids.national_id && !ids.passport) {
      fail(line, 'il faut au moins un identifiant, un numéro de carte d’identité ou un numéro de passeport');
    }

    let course: CatalogItem | null = null;
    if (g('imo_number')) {
      course = byImo.get(g('imo_number')) ?? null;
      if (!course) {
        fail(line, `n° IMO inconnu « ${g('imo_number')} » (Excel supprime parfois les zéros : 1.10 devient 1.1 ; écrivez le n° IMO comme du texte, ou utilisez course_name)`);
      }
    }
    if (g('course_name')) {
      const named = byName.get(nameKey(g('course_name')));
      if (!named) fail(line, `formation inconnue « ${g('course_name')} »`);
      else if (course && named !== course) fail(line, 'le n° IMO et le nom de formation désignent deux formations différentes');
      else course = course ?? named;
    }
    if (!g('imo_number') && !g('course_name')) fail(line, 'formation manquante (imo_number ou course_name)');

    const dateField = (k: string, label: string, required: boolean): string => {
      if (!g(k)) {
        if (required) fail(line, `${label} manquante`);
        return '';
      }
      const d = parseDate(g(k));
      if (!d) fail(line, `${label} invalide « ${g(k)} » (AAAA-MM-JJ ou JJ/MM/AAAA)`);
      return d ?? '';
    };
    const completed = dateField('completed_on', 'date d’obtention', true);
    const validUntil = dateField('valid_until', 'date d’échéance', false);
    const sessionStart = dateField('session_start', 'début de session', false);
    const sessionEnd = dateField('session_end', 'fin de session', false);
    if (completed && validUntil && validUntil < completed) fail(line, 'la date d’échéance précède la date d’obtention');
    if (sessionStart && sessionEnd && sessionEnd < sessionStart) fail(line, 'la fin de session précède son début');

    let mode: SessionMode | '' = '';
    if (g('mode')) {
      const m = MODES[nameKey(g('mode'))];
      if (!m) fail(line, `mode inconnu « ${g('mode')} » (présentiel, en ligne ou mixte)`);
      else mode = m;
    }
    let result: 'passed' | '' = '';
    if (g('result')) {
      if (RESULTS.has(nameKey(g('result')))) result = 'passed';
      else fail(line, `résultat inconnu « ${g('result')} » (réussi)`);
    }
    if (!g('certificate_number')) warnings.push(`ligne ${line} : pas de numéro de certificat (à compléter avant publication)`);

    rows.push({
      line,
      ids,
      raw,
      cert: course
        ? {
            line,
            course_name: course.name,
            imo_number: course.imo_number,
            certificate_number: g('certificate_number'),
            completed_on: completed,
            valid_until: validUntil,
            session_start: sessionStart,
            session_end: sessionEnd,
            mode,
            result,
            assessor: g('assessor'),
          }
        : null,
    });
  });

  // Regroupement par personne : deux lignes qui partagent un identifiant sont la même personne.
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x) as string) as string);
      x = parent.get(x) as string;
    }
    return x;
  };
  const tokensOf = (row: Row) =>
    Object.entries(row.ids).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`);
  for (const row of rows) {
    const tokens = tokensOf(row);
    tokens.forEach((t) => parent.has(t) || parent.set(t, t));
    tokens.slice(1).forEach((t) => parent.set(find(t), find(tokens[0])));
  }
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const first = tokensOf(row)[0];
    if (!first) continue;
    const key = find(first);
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  const students: ParsedStudent[] = [];
  for (const members of groups.values()) {
    const lines = members.map((m) => m.line).join(', ');
    if (new Set(members.map((m) => nameKey(m.raw.full_name))).size > 1) {
      fail(members[0].line, `noms différents pour la même personne (lignes ${lines})`);
    }
    const pick = (k: 'student_code' | 'national_id' | 'passport') => {
      const values = new Set(members.map((m) => m.ids[k]).filter(Boolean));
      if (values.size > 1) fail(members[0].line, `plusieurs valeurs de ${k} pour la même personne (lignes ${lines})`);
      return members.map((m) => m.raw[k]).find(Boolean) ?? '';
    };
    const seen = new Set<string>();
    const certificates: ParsedCertificate[] = [];
    for (const m of members) {
      if (!m.cert) continue;
      const dup = `${m.cert.course_name}|${m.cert.completed_on}`;
      if (seen.has(dup)) {
        fail(m.line, `certificat en double (${m.cert.course_name}, ${m.cert.completed_on})`);
        continue;
      }
      seen.add(dup);
      certificates.push(m.cert);
    }
    students.push({
      full_name: members[0].raw.full_name,
      student_code: pick('student_code'),
      national_id: pick('national_id'),
      passport: pick('passport'),
      certificates,
    });
  }

  return { rows: rows.length, students, errors, warnings };
}

// Fusionne les personnes lues dans les dossiers existants. Tout devient brouillon ; un
// certificat déjà publié ou révoqué n'est jamais modifié par un import.
export function mergeParsed(
  existing: AdminStudent[],
  parsed: ParsedStudent[],
  newId: () => string = () => crypto.randomUUID(),
): { students: AdminStudent[]; created: number; updated: number; notes: string[] } {
  const notes: string[] = [];
  const out: AdminStudent[] = [];
  let created = 0;
  let updated = 0;

  for (const p of parsed) {
    const pIds = [p.student_code, p.national_id, p.passport].map(normalizeIdentifier);
    const matches = existing.filter((e) =>
      [e.student_code, e.national_id, e.passport]
        .map(normalizeIdentifier)
        .some((v, i) => v && v === pIds[i]),
    );
    if (matches.length > 1) {
      notes.push(`${p.full_name} : plusieurs dossiers existants correspondent, ignoré.`);
      continue;
    }
    const base: AdminStudent = matches[0]
      ? { ...matches[0], certificates: matches[0].certificates.map((c) => ({ ...c })) }
      : {
          id: '',
          student_code: p.student_code,
          full_name: p.full_name,
          national_id: p.national_id,
          passport: p.passport,
          notes: '',
          certificates: [],
        };
    if (matches[0]) {
      if (!base.national_id && p.national_id) base.national_id = p.national_id;
      if (!base.passport && p.passport) base.passport = p.passport;
    }

    for (const c of p.certificates) {
      const idx = base.certificates.findIndex(
        (x) => nameKey(x.course_name) === nameKey(c.course_name) && x.completed_on === c.completed_on,
      );
      const fields = {
        certificate_number: c.certificate_number,
        valid_until: c.valid_until,
        session_start: c.session_start,
        session_end: c.session_end,
        mode: c.mode,
        result: c.result,
        assessor: c.assessor,
      };
      if (idx >= 0) {
        if (base.certificates[idx].status !== 'draft') {
          notes.push(`${p.full_name} : « ${c.course_name} » est déjà ${base.certificates[idx].status === 'published' ? 'publié' : 'révoqué'}, non modifié.`);
          continue;
        }
        const cur = base.certificates[idx];
        for (const [k, v] of Object.entries(fields)) if (v) (cur as unknown as Record<string, unknown>)[k] = v;
      } else {
        const cert: AdminCertificate = {
          id: newId(),
          course_name: c.course_name,
          imo_number: c.imo_number,
          completed_on: c.completed_on,
          ...fields,
          status: 'draft',
          revoked_reason: '',
          published_by: '',
          published_on: '',
        };
        base.certificates.push(cert);
      }
    }
    if (matches[0]) updated++;
    else created++;
    out.push(base);
  }
  return { students: out, created, updated, notes };
}
