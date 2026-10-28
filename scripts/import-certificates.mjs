// Import des certificats dans Firestore à partir d'un fichier CSV (une ligne par certificat).
//
//   npm run certificates:import -- data/certificats.csv                       contrôle seulement, n'écrit rien
//   npm run certificates:import -- data/certificats.csv --write               écrit dans l'émulateur local
//   npm run certificates:import -- data/certificats.csv --write --production  écrit dans la vraie base
//
// Cible : l'émulateur si FIRESTORE_EMULATOR_HOST est défini, sinon la production, qui exige
// GOOGLE_APPLICATION_CREDENTIALS (clé de compte de service : console Firebase > Paramètres du
// projet > Comptes de service). Ne jamais ajouter cette clé ni les CSV réels à git (dossier data/).
//
// Colonnes : student_code, full_name, national_id, passport, course_name, imo_number,
// certificate_number, completed_on, valid_until. Dates en AAAA-MM-JJ ou JJ/MM/AAAA.
// Voir scripts/example-certificats.csv.

import fs from 'node:fs';
import { randomInt } from 'node:crypto';
import { COURSES } from '../src/data/courses.ts';
import { lookupKey, normalizeIdentifier } from '../src/lib/verification.ts';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const write = args.includes('--write');
const production = args.includes('--production');
const emulator = process.env.FIRESTORE_EMULATOR_HOST;

if (!file) {
  console.error('Usage : npm run certificates:import -- fichier.csv [--write] [--production]');
  process.exit(1);
}

// ---------- lecture du CSV ----------
function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const delim = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
  const rows = [];
  let row = [];
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
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      endRow();
    } else cell += ch;
  }
  if (cell !== '' || row.length) endRow();
  return rows;
}

const COLUMNS = [
  'student_code', 'full_name', 'national_id', 'passport', 'course_name',
  'imo_number', 'certificate_number', 'completed_on', 'valid_until',
];

function parseDate(raw) {
  const s = raw.trim();
  let y, m, d;
  let match = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) [, y, m, d] = match;
  else if ((match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) [, d, m, y] = match;
  else return null;
  const date = new Date(Date.UTC(+y, +m - 1, +d));
  if (date.getUTCFullYear() !== +y || date.getUTCMonth() !== +m - 1 || date.getUTCDate() !== +d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const nameKey = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
const catalogByImo = new Map(COURSES.filter((c) => c.imo_number).map((c) => [c.imo_number, c]));
const catalogByName = new Map(COURSES.map((c) => [nameKey(c.name), c]));

const errors = [];
const warnings = [];
const fail = (line, msg) => errors.push(`ligne ${line} : ${msg}`);

const table = parseCsv(fs.readFileSync(file, 'utf8'));
if (table.length < 2) { console.error('Fichier vide ou sans données.'); process.exit(1); }
const header = table[0].map((h) => h.trim());
const unknownCols = header.filter((h) => !COLUMNS.includes(h));
if (unknownCols.length) { console.error(`Colonnes inconnues : ${unknownCols.join(', ')}\nColonnes attendues : ${COLUMNS.join(', ')}`); process.exit(1); }
for (const need of ['full_name', 'completed_on']) {
  if (!header.includes(need)) { console.error(`Colonne obligatoire absente : ${need}`); process.exit(1); }
}

const rows = [];
table.slice(1).forEach((cells, idx) => {
  const line = idx + 2;
  const r = Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? '').trim()]));

  if (!r.full_name) fail(line, 'nom complet manquant');
  const ids = {
    student_code: normalizeIdentifier(r.student_code ?? ''),
    national_id: normalizeIdentifier(r.national_id ?? ''),
    passport: normalizeIdentifier(r.passport ?? ''),
  };
  for (const [k, v] of Object.entries(ids)) {
    if (v && v.length < 4) fail(line, `${k} trop court (4 caractères minimum)`);
  }
  if (!ids.student_code && !ids.national_id && !ids.passport) {
    fail(line, 'il faut au moins un identifiant, un numéro de carte d’identité ou un numéro de passeport');
  }

  let course = null;
  if (r.imo_number) {
    course = catalogByImo.get(r.imo_number) ?? null;
    if (!course) fail(line, `n° IMO inconnu « ${r.imo_number} » (Excel supprime parfois les zéros, par exemple 1.10 devient 1.1 : écrivez le n° IMO comme du texte, ou utilisez course_name)`);
  }
  if (r.course_name) {
    const byName = catalogByName.get(nameKey(r.course_name));
    if (!byName) fail(line, `formation inconnue « ${r.course_name} »`);
    else if (course && byName !== course) fail(line, 'le n° IMO et le nom de formation désignent deux formations différentes');
    else course = course ?? byName;
  }
  if (!r.imo_number && !r.course_name) fail(line, 'formation manquante (imo_number ou course_name)');

  const completed = parseDate(r.completed_on ?? '');
  if (!completed) fail(line, `date d’obtention invalide « ${r.completed_on} » (AAAA-MM-JJ ou JJ/MM/AAAA)`);
  let validUntil = null;
  if (r.valid_until) {
    validUntil = parseDate(r.valid_until);
    if (!validUntil) fail(line, `date d’échéance invalide « ${r.valid_until} »`);
    else if (completed && validUntil < completed) fail(line, 'la date d’échéance précède la date d’obtention');
  }
  if (!r.certificate_number) warnings.push(`ligne ${line} : pas de numéro de certificat`);

  rows.push({ line, r, ids, course, completed, validUntil });
});

// ---------- regroupement par personne (identifiants communs) ----------
const parent = new Map();
const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
const union = (a, b) => { parent.set(find(a), find(b)); };
for (const row of rows) {
  const tokens = Object.entries(row.ids).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`);
  tokens.forEach((t) => { if (!parent.has(t)) parent.set(t, t); });
  tokens.slice(1).forEach((t) => union(tokens[0], t));
  row.token = tokens[0];
}
const groups = new Map();
for (const row of rows) {
  if (!row.token) continue;
  const g = find(row.token);
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(row);
}

const students = [];
for (const members of groups.values()) {
  const lines = members.map((m) => m.line).join(', ');
  const names = new Set(members.map((m) => nameKey(m.r.full_name)));
  if (names.size > 1) fail(members[0].line, `noms différents pour la même personne (lignes ${lines})`);
  const ids = {};
  for (const method of ['student_code', 'national_id', 'passport']) {
    const values = new Set(members.map((m) => m.ids[method]).filter(Boolean));
    if (values.size > 1) fail(members[0].line, `plusieurs valeurs de ${method} pour la même personne (lignes ${lines})`);
    ids[method] = [...values][0] ?? null;
  }
  const seen = new Set();
  const certificates = [];
  for (const m of members) {
    if (!m.course || !m.completed) continue;
    const dupKey = `${m.course.name}|${m.completed}`;
    if (seen.has(dupKey)) { fail(m.line, `certificat en double (${m.course.name}, ${m.completed})`); continue; }
    seen.add(dupKey);
    certificates.push({
      course_name: m.course.name,
      imo_number: m.course.imo_number,
      certificate_number: m.r.certificate_number || null,
      completed_on: m.completed,
      valid_until: m.validUntil,
    });
  }
  certificates.sort((a, b) => b.completed_on.localeCompare(a.completed_on));
  students.push({
    full_name: members[0].r.full_name,
    codeRaw: members.map((m) => m.r.student_code).find(Boolean) ?? null,
    ids,
    certificates,
  });
}

// ---------- rapport ----------
const certCount = students.reduce((s, st) => s + st.certificates.length, 0);
console.log(`Fichier : ${file}`);
console.log(`${rows.length} ligne(s) lue(s) : ${students.length} personne(s), ${certCount} certificat(s).`);
if (warnings.length) console.log(`\nAvertissements (${warnings.length}) :\n  ` + warnings.join('\n  '));
if (errors.length) {
  console.error(`\n${errors.length} erreur(s), rien n'a été écrit :\n  ` + errors.join('\n  '));
  process.exit(1);
}
if (!write) {
  console.log('\nContrôle réussi. Rien n’a été écrit (ajoutez --write pour importer).');
  process.exit(0);
}

// ---------- écriture ----------
if (!emulator && !production) {
  console.error('\nCible production : ajoutez --production pour confirmer, ou définissez FIRESTORE_EMULATOR_HOST pour viser l’émulateur.');
  process.exit(1);
}
if (!emulator && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('\nGOOGLE_APPLICATION_CREDENTIALS n’est pas défini (chemin vers la clé de compte de service).');
  process.exit(1);
}

const { initializeApp, applicationDefault } = await import('firebase-admin/app');
const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
const projectId =
  process.env.GCLOUD_PROJECT ?? JSON.parse(fs.readFileSync('.firebaserc', 'utf8')).projects.default;
initializeApp(emulator ? { projectId } : { credential: applicationDefault(), projectId });
const db = getFirestore();
console.log(`\nÉcriture dans : ${emulator ? `ÉMULATEUR (${emulator})` : `PRODUCTION (${projectId})`}`);

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => 'STU-' + Array.from({ length: 8 }, () => ALPHABET[randomInt(32)]).join('');

const report = [];
for (const st of students) {
  // 1. Retrouver un dossier existant par l'un de ses identifiants
  const wanted = [];
  for (const method of ['student_code', 'national_id', 'passport']) {
    if (st.ids[method]) wanted.push({ method, value: st.ids[method], hash: await lookupKey(method, st.ids[method]) });
  }
  let studentId = null;
  for (const k of wanted) {
    const snap = await db.collection('certificate_keys').doc(k.hash).get();
    if (!snap.exists) continue;
    const sid = snap.data().student_id;
    if (studentId && studentId !== sid) throw new Error(`${st.full_name} : ces identifiants appartiennent déjà à deux dossiers différents.`);
    studentId = sid;
  }
  let existingCode = null;
  if (studentId) {
    const snap = await db.collection('students').doc(studentId).get();
    existingCode = snap.exists ? snap.data().student_code : null;
  }
  // 2. Identifiant étudiant : celui du CSV, sinon celui déjà en base, sinon un nouveau
  let code = st.codeRaw ? st.codeRaw.trim() : null;
  if (code && existingCode && normalizeIdentifier(code) !== normalizeIdentifier(existingCode)) {
    throw new Error(`${st.full_name} : l’identifiant ${code} diffère de celui déjà enregistré (${existingCode}).`);
  }
  if (!code) code = existingCode;
  if (!code) {
    for (let attempt = 0; attempt < 10 && !code; attempt++) {
      const candidate = newCode();
      const taken = await db.collection('certificate_keys').doc(await lookupKey('student_code', candidate)).get();
      if (!taken.exists) code = candidate;
    }
    if (!code) throw new Error('Impossible de générer un identifiant étudiant libre.');
  }
  if (!st.ids.student_code) {
    const norm = normalizeIdentifier(code);
    wanted.push({ method: 'student_code', value: norm, hash: await lookupKey('student_code', norm) });
  }
  if (!studentId) studentId = db.collection('students').doc().id;

  // 3. Écrire le dossier et ses clés de recherche
  const batch = db.batch();
  batch.set(db.collection('students').doc(studentId), {
    student_code: code,
    full_name: st.full_name,
    certificates: st.certificates,
    updated_at: FieldValue.serverTimestamp(),
  });
  for (const k of wanted) batch.set(db.collection('certificate_keys').doc(k.hash), { student_id: studentId });
  await batch.commit();
  report.push({ identifiant: code, nom: st.full_name, certificats: st.certificates.length, cles: wanted.map((k) => k.method).join('+'), nouveau: existingCode ? 'mise à jour' : 'créé' });
}
// Ouvre le service de vérification sur le site (voir isVerificationOpen dans src/lib/data.ts).
await db.collection('site_status').doc('verification').set({ open: true, updated_at: FieldValue.serverTimestamp() });
console.table(report);
console.log(`${report.length} dossier(s) écrit(s). Le service de vérification est ouvert sur le site.`);
