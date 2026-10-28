import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileUp, Plus, Save, Search, Trash2, Upload, X } from 'lucide-react';
import { getCourses } from '@/lib/data';
import {
  emptyStudent,
  listAdminStudents,
  missingForPublish,
  newCertificate,
  saveAdminStudent,
} from '@/lib/admin-data';
import { mergeParsed, parseCertificateCsv } from '@/lib/csv-import';
import type { CsvReport } from '@/lib/csv-import';
import { certificateStatus, normalizeIdentifier } from '@/lib/verification';
import type { Course } from '@/types';
import type { AdminCertificate, AdminStudent } from '@/types/admin';
import { ErrorBox, Lbl, NoticeBox } from '@/pages/admin/ui';
import { inputCls } from '@/pages/admin/ui-helpers';

const STATUS_BADGE = {
  draft: { label: 'Brouillon', cls: 'bg-slate-500/20 text-slate-200' },
  published: { label: 'Publié', cls: 'bg-emerald-500/10 text-emerald-300' },
  revoked: { label: 'Révoqué', cls: 'bg-red-500/10 text-red-300' },
} as const;

const clone = (s: AdminStudent): AdminStudent => JSON.parse(JSON.stringify(s));
const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Une erreur est survenue.');

export default function AdminCertificates({ email }: { email: string }) {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [catalog, setCatalog] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<AdminStudent | null>(null);
  const [saved, setSaved] = useState<AdminStudent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [addCourse, setAddCourse] = useState('');
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [showImport, setShowImport] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setStudents(await listAdminStudents());
      setError(null);
    } catch (e) {
      setError(errMsg(e));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    getCourses().then(setCatalog);
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qn = normalizeIdentifier(search);
    if (!q) return students;
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.student_code.toLowerCase().includes(q) ||
        (qn.length >= 3 && [s.national_id, s.passport].some((v) => normalizeIdentifier(v).includes(qn))),
    );
  }, [students, search]);

  const open = (s: AdminStudent | null) => {
    setError(null);
    setNotice(null);
    setRevokeId(null);
    setForm(s ? clone(s) : emptyStudent());
    setSaved(s ? clone(s) : null);
  };

  const persist = async (next: AdminStudent, action: string, doneMsg: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await saveAdminStudent(next, saved, email, action);
      setForm(clone(res));
      setSaved(clone(res));
      setNotice(doneMsg);
      await refresh();
    } catch (e) {
      setError(errMsg(e));
    }
    setBusy(false);
  };

  const setField = <K extends keyof AdminStudent>(k: K, v: AdminStudent[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const patchCert = (id: string, patch: Partial<AdminCertificate>) =>
    setForm((f) =>
      f ? { ...f, certificates: f.certificates.map((c) => (c.id === id ? { ...c, ...patch } : c)) } : f,
    );

  const addCert = () => {
    const course = catalog.find((c) => c.id === addCourse);
    if (!course || !form) return;
    setField('certificates', [...form.certificates, newCertificate(course)]);
    setAddCourse('');
  };

  const publish = (id: string) =>
    form &&
    persist(
      { ...form, certificates: form.certificates.map((c) => (c.id === id ? { ...c, status: 'published' } : c)) },
      'publication',
      'Certificat publié : il est maintenant visible dans la vérification.',
    );

  const revoke = (id: string) =>
    form &&
    persist(
      {
        ...form,
        certificates: form.certificates.map((c) =>
          c.id === id ? { ...c, status: 'revoked', revoked_reason: revokeReason } : c,
        ),
      },
      'révocation',
      'Certificat révoqué : la vérification l’affiche comme révoqué.',
    ).then(() => setRevokeId(null));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Liste */}
      <aside className="card p-4">
        <div className="flex gap-2 mb-3">
          <button onClick={() => open(null)} className="btn-primary !py-2 !px-3 text-sm flex-1">
            <Plus className="w-4 h-4" /> Nouvelle personne
          </button>
          <button onClick={() => setShowImport((v) => !v)} className="btn-secondary !py-2 !px-3 text-sm" title="Importer un CSV">
            <FileUp className="w-4 h-4" /> CSV
          </button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, identifiant, n° de pièce…" className={`${inputCls} pl-9`} aria-label="Rechercher une personne" />
        </div>
        {loading ? (
          <p className="text-sm text-slate-400 p-2">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 p-2">Aucune personne. Créez une fiche ou importez un CSV.</p>
        ) : (
          <ul className="max-h-[32rem] overflow-y-auto divide-y divide-[#294769]">
            {filtered.map((s) => {
              const n = (st: string) => s.certificates.filter((c) => c.status === st).length;
              return (
                <li key={s.id}>
                  <button onClick={() => open(s)} className={`w-full text-left px-2 py-2.5 hover:bg-[#172f4e] ${form?.id === s.id ? 'bg-[#172f4e]' : ''}`}>
                    <div className="text-sm font-medium text-white">{s.full_name}</div>
                    <div className="text-xs text-slate-400 font-mono">{s.student_code}</div>
                    <div className="mt-1 flex gap-2 text-[11px]">
                      <span className="text-slate-300">{n('draft')} brouillon(s)</span>
                      <span className="text-emerald-300">{n('published')} publié(s)</span>
                      {n('revoked') > 0 && <span className="text-red-300">{n('revoked')} révoqué(s)</span>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* Détail */}
      <section className="lg:col-span-2 space-y-5">
        {showImport && (
          <ImportPanel
            existing={students}
            catalog={catalog}
            email={email}
            onDone={() => {
              refresh();
            }}
            onClose={() => setShowImport(false)}
          />
        )}

        {error && <ErrorBox>{error}</ErrorBox>}
        {notice && <NoticeBox>{notice}</NoticeBox>}

        {!form ? (
          <div className="card p-8 text-center text-slate-400 text-sm">
            Sélectionnez une personne, ou créez une nouvelle fiche.
            <p className="mt-3 text-xs text-slate-500">
              Tout certificat est d’abord un brouillon, invisible du public. Il n’apparaît dans la
              vérification qu’une fois publié, avec les informations de session complètes.
            </p>
          </div>
        ) : (
          <>
            <div className="card p-5 sm:p-6 space-y-4">
              <h2 className="font-semibold text-white">{saved ? form.full_name || 'Fiche' : 'Nouvelle fiche'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Lbl label="Nom complet *"><input className={inputCls} value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} maxLength={120} /></Lbl>
                <Lbl label="Identifiant étudiant"><input className={`${inputCls} font-mono`} value={form.student_code} onChange={(e) => setField('student_code', e.target.value)} readOnly={!!saved} placeholder="Généré automatiquement" /></Lbl>
                <Lbl label="N° de carte d’identité"><input className={`${inputCls} font-mono`} value={form.national_id} onChange={(e) => setField('national_id', e.target.value)} maxLength={30} /></Lbl>
                <Lbl label="N° de passeport"><input className={`${inputCls} font-mono`} value={form.passport} onChange={(e) => setField('passport', e.target.value)} maxLength={30} /></Lbl>
              </div>
              <Lbl label="Notes internes (jamais publiques)"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => setField('notes', e.target.value)} /></Lbl>
            </div>

            <div className="card p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-end gap-3 justify-between">
                <h2 className="font-semibold text-white">Certificats</h2>
                <div className="flex gap-2">
                  <select className={`${inputCls} max-w-xs`} value={addCourse} onChange={(e) => setAddCourse(e.target.value)} aria-label="Formation à ajouter">
                    <option value="">— Ajouter une formation —</option>
                    {catalog.map((c) => (
                      <option key={c.id} value={c.id}>{c.imo_number ? `${c.imo_number} · ` : ''}{c.name}</option>
                    ))}
                  </select>
                  <button onClick={addCert} disabled={!addCourse} className="btn-secondary !py-2 !px-3 text-sm disabled:opacity-50"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              {form.certificates.length === 0 && <p className="text-sm text-slate-400">Aucun certificat.</p>}

              {form.certificates.map((c) => {
                const missing = missingForPublish(c);
                const locked = c.status !== 'draft';
                const badge = STATUS_BADGE[c.status];
                const live = c.status === 'published' ? certificateStatus(c.valid_until || null) : null;
                return (
                  <div key={c.id} className="rounded-xl border border-[#294769] p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <div className="font-medium text-white">
                        {c.course_name} {c.imo_number && <span className="ml-1 text-xs font-mono text-slate-400">IMO {c.imo_number}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {live === 'expired' && <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-300">Expiré</span>}
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Lbl label="N° de certificat *"><input className={inputCls} disabled={locked} value={c.certificate_number} onChange={(e) => patchCert(c.id, { certificate_number: e.target.value })} /></Lbl>
                      <Lbl label="Obtenu le *"><input type="date" className={inputCls} disabled={locked} value={c.completed_on} onChange={(e) => patchCert(c.id, { completed_on: e.target.value })} /></Lbl>
                      <Lbl label="Valide jusqu’au"><input type="date" className={inputCls} disabled={locked} value={c.valid_until} onChange={(e) => patchCert(c.id, { valid_until: e.target.value })} /></Lbl>
                      <Lbl label="Mode *">
                        <select className={inputCls} disabled={locked} value={c.mode} onChange={(e) => patchCert(c.id, { mode: e.target.value as AdminCertificate['mode'] })}>
                          <option value="">—</option><option value="in_person">Présentiel</option><option value="online">En ligne</option><option value="blended">Mixte</option>
                        </select>
                      </Lbl>
                      <Lbl label="Début de session *"><input type="date" className={inputCls} disabled={locked} value={c.session_start} onChange={(e) => patchCert(c.id, { session_start: e.target.value })} /></Lbl>
                      <Lbl label="Fin de session *"><input type="date" className={inputCls} disabled={locked} value={c.session_end} onChange={(e) => patchCert(c.id, { session_end: e.target.value })} /></Lbl>
                      <Lbl label="Résultat *">
                        <select className={inputCls} disabled={locked} value={c.result} onChange={(e) => patchCert(c.id, { result: e.target.value as AdminCertificate['result'] })}>
                          <option value="">—</option><option value="passed">Réussi</option>
                        </select>
                      </Lbl>
                      <Lbl label="Évaluateur *"><input className={inputCls} disabled={locked} value={c.assessor} onChange={(e) => patchCert(c.id, { assessor: e.target.value })} /></Lbl>
                    </div>

                    {c.status === 'draft' && (
                      <div className="flex flex-wrap items-center gap-3">
                        <button disabled={busy || missing.length > 0 || !saved} onClick={() => publish(c.id)} className="btn-primary !py-2 !px-4 text-sm disabled:opacity-50">
                          Publier
                        </button>
                        <button onClick={() => setField('certificates', form.certificates.filter((x) => x.id !== c.id))} className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-red-300">
                          <Trash2 className="w-4 h-4" /> Retirer le brouillon
                        </button>
                        {!saved ? (
                          <span className="text-xs text-slate-400">Enregistrez d’abord la fiche pour pouvoir publier.</span>
                        ) : missing.length > 0 ? (
                          <span className="text-xs text-amber-300">À compléter avant publication : {missing.join(', ')}.</span>
                        ) : (
                          <span className="text-xs text-emerald-300">Complet : prêt à être publié.</span>
                        )}
                      </div>
                    )}
                    {c.status === 'published' && (
                      <div className="text-sm">
                        <p className="text-xs text-slate-400 mb-2">Publié le {c.published_on} par {c.published_by}. Un certificat publié ne se modifie plus : on le révoque.</p>
                        {revokeId === c.id ? (
                          <div className="flex flex-wrap gap-2 items-end">
                            <Lbl label="Motif de la révocation *" className="flex-1 min-w-[16rem]"><input className={inputCls} value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)} /></Lbl>
                            <button disabled={busy || !revokeReason.trim()} onClick={() => revoke(c.id)} className="btn-primary !py-2 !px-4 text-sm disabled:opacity-50">Confirmer la révocation</button>
                            <button onClick={() => setRevokeId(null)} className="btn-secondary !py-2 !px-3 text-sm"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setRevokeId(c.id); setRevokeReason(''); }} className="text-sm text-red-300 hover:underline">Révoquer ce certificat</button>
                        )}
                      </div>
                    )}
                    {c.status === 'revoked' && <p className="text-xs text-red-300">Révoqué : {c.revoked_reason}</p>}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button disabled={busy} onClick={() => persist(form, 'certificats', 'Fiche enregistrée.')} className="btn-primary disabled:opacity-60">
                <Save className="w-4 h-4" /> {busy ? 'Enregistrement…' : 'Enregistrer la fiche'}
              </button>
              <button onClick={() => { setForm(null); setSaved(null); }} className="btn-secondary">Fermer</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function ImportPanel({
  existing,
  catalog,
  email,
  onDone,
  onClose,
}: {
  existing: AdminStudent[];
  catalog: Course[];
  email: string;
  onDone: () => void;
  onClose: () => void;
}) {
  const [report, setReport] = useState<CsvReport | null>(null);
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    setResult(null);
    setError(null);
    if (!file) return;
    setFileName(file.name);
    setReport(parseCertificateCsv(await file.text(), catalog));
  };

  const run = async () => {
    if (!report || report.errors.length) return;
    setBusy(true);
    setError(null);
    try {
      const merged = mergeParsed(existing, report.students);
      let done = 0;
      for (const s of merged.students) {
        const prev = existing.find((e) => e.id && e.id === s.id) ?? null;
        await saveAdminStudent(s, prev, email, 'import csv');
        done++;
      }
      setResult(
        `${done} fiche(s) enregistrée(s) (${merged.created} créée(s), ${merged.updated} mise(s) à jour). Tout est en brouillon.` +
          (merged.notes.length ? ` Remarques : ${merged.notes.join(' ')}` : ''),
      );
      setReport(null);
      onDone();
    } catch (e) {
      setError(errMsg(e));
    }
    setBusy(false);
  };

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white flex items-center gap-2"><Upload className="w-4 h-4 text-[#e1b936]" /> Importer un CSV</h2>
        <button onClick={onClose} aria-label="Fermer"><X className="w-4 h-4 text-slate-400" /></button>
      </div>
      <p className="text-xs text-slate-400">
        Une ligne par certificat. Tout est importé en <strong>brouillon</strong> : rien n’est public tant que vous ne
        publiez pas chaque certificat. <a className="text-[#e1b936] underline" href="/modele-certificats.csv" download>Télécharger le modèle</a>
      </p>
      <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} className="text-sm text-slate-300" aria-label="Fichier CSV" />
      {report && (
        <div className="text-sm space-y-2">
          <p className="text-slate-200">{fileName} : {report.rows} ligne(s), {report.students.length} personne(s).</p>
          {report.errors.length > 0 && (
            <div className="text-red-300"><p className="font-medium">{report.errors.length} erreur(s), rien ne sera importé :</p><ul className="list-disc ml-5 max-h-40 overflow-y-auto">{report.errors.map((e) => <li key={e}>{e}</li>)}</ul></div>
          )}
          {report.warnings.length > 0 && <p className="text-amber-300">{report.warnings.length} avertissement(s), par exemple : {report.warnings[0]}</p>}
          {report.errors.length === 0 && report.students.length > 0 && (
            <button onClick={run} disabled={busy} className="btn-primary !py-2 text-sm disabled:opacity-60">{busy ? 'Import en cours…' : `Créer / mettre à jour ${report.students.length} fiche(s) en brouillon`}</button>
          )}
        </div>
      )}
      {error && <ErrorBox>{error}</ErrorBox>}
      {result && <NoticeBox>{result}</NoticeBox>}
    </div>
  );
}
