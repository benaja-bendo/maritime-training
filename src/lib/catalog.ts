import { COURSES } from '@/data/courses';
import type { Course } from '@/types';

// Catalogue des formations. Source de vérité : le document Firestore `catalog/courses`
// (modifié depuis /admin). Tant qu'il n'existe pas, ou s'il est illisible, le site affiche la
// liste d'origine de `src/data/courses.ts`.
//
// Lecture publique par l'API REST de Firestore (une requête, sans charger le SDK Firebase) :
// les pages publiques restent légères et le quota gratuit n'est consommé qu'une fois par visite.

type Raw = Record<string, unknown>;

const FETCH_TIMEOUT_MS = 4000;

/** Décode une valeur typée de l'API REST Firestore (`{ stringValue: ... }`) en valeur JavaScript. */
export function decodeValue(v: unknown): unknown {
  if (!v || typeof v !== 'object') return null;
  const o = v as Raw;
  if ('stringValue' in o) return String(o.stringValue);
  if ('booleanValue' in o) return o.booleanValue === true;
  if ('integerValue' in o) return Number(o.integerValue);
  if ('doubleValue' in o) return Number(o.doubleValue);
  if ('timestampValue' in o) return String(o.timestampValue);
  if ('arrayValue' in o) {
    const values = ((o.arrayValue as Raw).values ?? []) as unknown[];
    return values.map(decodeValue);
  }
  if ('mapValue' in o) {
    const fields = ((o.mapValue as Raw).fields ?? {}) as Raw;
    return Object.fromEntries(Object.entries(fields).map(([k, x]) => [k, decodeValue(x)]));
  }
  return null;
}

const amount = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
const text = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Une formation lue dans la base, ou null si elle est inutilisable (sans identifiant ou sans nom). */
export function parseCourse(x: unknown): Course | null {
  if (!x || typeof x !== 'object') return null;
  const o = x as Raw;
  const id = text(o.id);
  const name = text(o.name).trim();
  if (!id || !name) return null;
  const course: Course = {
    id,
    imo_number: text(o.imo_number) || null,
    name,
    duration_days: amount(o.duration_days),
    duration_hours: amount(o.duration_hours),
    category: text(o.category) || 'Autre',
    image_url: text(o.image_url) || null,
    price_usd: amount(o.price_usd),
  };
  if (o.framework === 'industry') course.framework = 'industry';
  if (o.hidden === true) course.hidden = true;
  return course;
}

/** Liste de formations lue dans la base, ou null si la valeur n'est pas une liste exploitable. */
export function parseCourses(raw: unknown): Course[] | null {
  if (!Array.isArray(raw)) return null;
  const list = raw.map(parseCourse).filter((c): c is Course => c !== null);
  return list.length > 0 ? list : null;
}

async function fetchRemote(): Promise<Course[] | null> {
  const project = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (!project) return null;
  const emulator = import.meta.env.DEV ? import.meta.env.VITE_FIRESTORE_EMULATOR : undefined;
  const base = emulator ? `http://${emulator}` : 'https://firestore.googleapis.com';
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  const query = !emulator && key ? `?key=${encodeURIComponent(key)}` : '';
  const url = `${base}/v1/projects/${project}/databases/(default)/documents/catalog/courses${query}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) return null;
    const body = (await res.json()) as { fields?: Raw };
    return parseCourses(decodeValue(body.fields?.courses));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

let pending: Promise<Course[]> | null = null;

/** Toutes les formations, masquées comprises. Une seule lecture par chargement de page. */
export function loadCatalog(): Promise<Course[]> {
  pending ??= fetchRemote().then((remote) => remote ?? COURSES);
  return pending;
}

/** À appeler après une modification du catalogue pour que la prochaine lecture soit fraîche. */
export function resetCatalogCache(): void {
  pending = null;
}

// ---------- Journal des modifications ----------

const FIELD_LABELS: [keyof Course, string][] = [
  ['price_usd', 'prix'],
  ['duration_days', 'jours'],
  ['duration_hours', 'heures'],
  ['name', 'nom'],
  ['imo_number', 'n° IMO'],
  ['category', 'catégorie'],
  ['image_url', 'image'],
  ['hidden', 'masquée'],
  ['framework', 'hors STCW/MLC'],
];

const show = (v: unknown): string => (v === undefined || v === null || v === '' || v === false ? '—' : v === true ? 'oui' : String(v));

/** Vrai si deux formations ont les mêmes valeurs (undefined, null, vide et false se valent pour les options). */
export function sameCourse(a: Course, b: Course): boolean {
  return FIELD_LABELS.every(([k]) => show(a[k]) === show(b[k]));
}

/** Résumé lisible des différences entre deux versions du catalogue, pour le journal (2 000 caractères au plus). */
export function describeChanges(before: Course[], after: Course[]): string {
  const prev = new Map(before.map((c) => [c.id, c]));
  const lines: string[] = [];
  for (const c of after) {
    const old = prev.get(c.id);
    if (!old) {
      lines.push(`ajout « ${c.name} »`);
      continue;
    }
    const diffs = FIELD_LABELS.filter(([k]) => show(old[k]) !== show(c[k])).map(([k, label]) =>
      k === 'image_url' ? 'image modifiée' : `${label} ${show(old[k])} → ${show(c[k])}`,
    );
    if (diffs.length > 0) lines.push(`« ${old.name} » : ${diffs.join(', ')}`);
  }
  if (lines.length === 0) return 'enregistrement sans changement';
  const max = 1900;
  let out = '';
  for (let i = 0; i < lines.length; i++) {
    const next = out ? `${out} ; ${lines[i]}` : lines[i];
    if (next.length > max) return `${out} ; … et ${lines.length - i} autre(s)`;
    out = next;
  }
  return out;
}
