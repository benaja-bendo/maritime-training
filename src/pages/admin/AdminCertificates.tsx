import { useCallback, useEffect, useMemo, useState } from 'react';
import { Camera, FileUp, Plus, Save, Search, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { getAllCourses } from '@/lib/data';
import { COURSES } from '@/data/courses';
import { prepareIdPhoto, PhotoError } from '@/lib/image';
import { getCountries } from '@/lib/countries';
import {
  emptyStudent,
  listAdminStudents,
  missingForPublish,
  newCertificate,
  saveAdminStudent,
} from '@/lib/admin-data';
import { mergeParsed, parseCertificateCsv } from '@/lib/csv-import';
import type { CsvReport } from '@/lib/csv-import';
import { normalizeIdentifier, todayInPanama } from '@/lib/verification';
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

const START_CERT_NUMBER = 43289;

const MONTHS = [
  { value: '01', label: '01 - Janvier' },
  { value: '02', label: '02 - Février' },
  { value: '03', label: '03 - Mars' },
  { value: '04', label: '04 - Avril' },
  { value: '05', label: '05 - Mai' },
  { value: '06', label: '06 - Juin' },
  { value: '07', label: '07 - Juillet' },
  { value: '08', label: '08 - Août' },
  { value: '09', label: '09 - Septembre' },
  { value: '10', label: '10 - Octobre' },
  { value: '11', label: '11 - Novembre' },
  { value: '12', label: '12 - Décembre' },
] as const;

function getNextCertificateNumber(
  year: number | string,
  month: number | string,
  existingStudents: AdminStudent[],
  currentCertificates: AdminCertificate[] = [],
  excludeCertId?: string,
): string {
  const y = String(year).trim() || String(new Date().getFullYear());
  const m = String(month).trim().padStart(2, '0') || String(new Date().getMonth() + 1).padStart(2, '0');
  const used = new Set<string>();

  for (const s of existingStudents) {
    for (const c of s.certificates) {
      if (c.certificate_number && c.id !== excludeCertId) {
        used.add(c.certificate_number.trim().toUpperCase());
      }
    }
  }

  for (const c of currentCertificates) {
    if (c.certificate_number && c.id !== excludeCertId) {
      used.add(c.certificate_number.trim().toUpperCase());
    }
  }

  let maxSeq = START_CERT_NUMBER - 1;
  const prefixRegex = new RegExp(`^(?:PMTS-)?${y}-?${m}-(\\d+)$`, 'i');
  const generalRegex = /(\d{5,})$/;

  for (const num of used) {
    const matchPrefix = num.match(prefixRegex);
    if (matchPrefix) {
      const val = parseInt(matchPrefix[1], 10);
      if (val > maxSeq) maxSeq = val;
    } else {
      const matchGeneral = num.match(generalRegex);
      if (matchGeneral) {
        const val = parseInt(matchGeneral[1], 10);
        if (val >= START_CERT_NUMBER && val > maxSeq) {
          maxSeq = val;
        }
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidate = `PMTS-${y}-${m}-${nextSeq}`;
  while (used.has(candidate.toUpperCase())) {
    nextSeq++;
    candidate = `PMTS-${y}-${m}-${nextSeq}`;
  }

  return candidate;
}

function getCertYearAndMonth(
  c: AdminCertificate,
  fallbackYear: number,
  fallbackMonth: string,
): { year: number; month: string } {
  if (c.completed_on && c.completed_on.includes('-')) {
    const parts = c.completed_on.split('-');
    if (parts[0] && parts[1]) {
      return { year: Number(parts[0]), month: parts[1].padStart(2, '0') };
    }
  }
  const match = c.certificate_number.match(/\b(20\d{2})[-/]?(\d{2})\b/);
  if (match) {
    return { year: Number(match[1]), month: match[2].padStart(2, '0') };
  }
  return { year: fallbackYear, month: fallbackMonth };
}

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
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [defaultYear, setDefaultYear] = useState<number>(() => new Date().getFullYear());
  const [defaultMonth, setDefaultMonth] = useState<string>(() =>
    String(new Date().getMonth() + 1).padStart(2, '0'),
  );

  const countries = useMemo(() => getCountries('fr'), []);

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
    getAllCourses().then((courses) => {
      const hasBST = courses.some(
        (c) => c.name.toLowerCase().includes('basic safety training') || c.id === 'bst-bundle-stcw-vi-1',
      );
      if (!hasBST) {
        const bst = COURSES.find((c) => c.id === 'bst-bundle-stcw-vi-1');
        if (bst) {
          setCatalog([bst, ...courses]);
          return;
        }
      }
      setCatalog(courses);
    });
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
    setPhotoError(null);
    setRevokeId(null);
    setForm(s ? clone(s) : emptyStudent());
    setSaved(s ? clone(s) : null);
  };

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    try {
      const dataUrl = await prepareIdPhoto(file);
      setField('photo_data_url', dataUrl);
    } catch (err) {
      setPhotoError(err instanceof PhotoError ? err.message : 'Impossible de traiter cette photo.');
    } finally {
      e.target.value = '';
    }
  };

  const removePhoto = () => {
    setPhotoError(null);
    setField('photo_data_url', '');
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

  const isCertExpired = (c: AdminCertificate) =>
    Boolean(c.valid_until && c.valid_until < todayInPanama());

  const onValidityChange = (certId: string, value: 'valid' | 'expired') => {
    const today = todayInPanama();
    patchCert(certId, (c) => {
      if (value === 'expired') {
        if (!c.valid_until || c.valid_until >= today) {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          return { valid_until: todayInPanama(d) };
        }
        return {};
      } else {
        if (c.valid_until && c.valid_until < today) {
          if (c.completed_on) {
            const [y, m, day] = c.completed_on.split('-');
            if (y && m && day) {
              return { valid_until: `${Number(y) + 5}-${m}-${day}` };
            }
          }
          return { valid_until: '' };
        }
        return {};
      }
    });
  };

  const patchCert = (
    id: string,
    patch: Partial<AdminCertificate> | ((c: AdminCertificate) => Partial<AdminCertificate>),
  ) =>
    setForm((f) =>
      f
        ? {
            ...f,
            certificates: f.certificates.map((c) => {
              if (c.id !== id) return c;
              const p = typeof patch === 'function' ? patch(c) : patch;
              return { ...c, ...p };
            }),
          }
        : f,
    );

  /** Crée et ajoute un ou plusieurs certificats (bundle BST → 4 modules). */
  const addCert = () => {
    const course = catalog.find((c) => c.id === addCourse);
    if (!course || !form) return;

    const today = todayInPanama();
    const completedOn = today.startsWith(String(defaultYear))
      ? today
      : `${defaultYear}-${defaultMonth}-01`;

    const isBST =
      course.id === 'bst-bundle-stcw-vi-1' ||
      course.name.toLowerCase().includes('basic safety training');

    const moduleIds =
      course.module_course_ids && course.module_course_ids.length > 0
        ? course.module_course_ids
        : isBST
          ? [
              '2dacd0c1-0e5e-4b8d-ba76-3fbbfd24b942', // Elementary First Aid
              'c296411c-a883-4c15-addf-6641fe92d3ab', // Personal Survival Techniques at Sea
              'a6d1ab3b-3f0a-47c1-9733-f4deff52c7bc', // Fire Prevention And Fire Fighting
              'dba61102-d2f7-4365-ac5c-d31478616373', // Personal Safety And Social Responsibilities
            ]
          : null;

    const moduleCourses = moduleIds
      ? moduleIds
          .map((mid) => catalog.find((c) => c.id === mid))
          .filter((c): c is NonNullable<typeof c> => c !== undefined)
      : null;

    const coursesToAdd = moduleCourses && moduleCourses.length > 0 ? moduleCourses : [course];
    const newCerts = [...form.certificates];

    for (const c of coursesToAdd) {
      const cert = newCertificate(c);
      cert.certificate_number = getNextCertificateNumber(
        defaultYear,
        defaultMonth,
        students,
        newCerts,
      );
      cert.completed_on = completedOn;
      newCerts.push(cert);
    }

    setField('certificates', newCerts);
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
                  <button onClick={() => open(s)} className={`w-full text-left px-2 py-2.5 hover:bg-[#172f4e] flex items-center gap-2.5 ${form?.id === s.id ? 'bg-[#172f4e]' : ''}`}>
                    {s.photo_data_url ? (
                      <img src={s.photo_data_url} alt="" className="w-8 h-10 object-cover rounded-sm border border-[#294769] flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-10 rounded-sm border border-[#294769] bg-[#0b1b30] flex items-center justify-center flex-shrink-0 text-slate-500">
                        <Camera className="w-3.5 h-3.5 opacity-40" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white truncate">{s.full_name}</div>
                      <div className="text-xs text-slate-400 font-mono truncate">
                        {s.student_code}
                        {s.nationality && <span className="font-sans text-slate-400 ml-1">· {s.nationality}</span>}
                      </div>
                      <div className="mt-1 flex gap-2 text-[11px]">
                        <span className="text-slate-300">{n('draft')} brouillon(s)</span>
                        <span className="text-emerald-300">{n('published')} publié(s)</span>
                        {n('revoked') > 0 && <span className="text-red-300">{n('revoked')} révoqué(s)</span>}
                      </div>
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
            <div className="card p-5 sm:p-6 space-y-5">
              <h2 className="font-semibold text-white">{saved ? form.full_name || 'Fiche' : 'Nouvelle fiche'}</h2>

              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Zone photo */}
                <div className="flex flex-col items-center sm:items-start space-y-2 flex-shrink-0">
                  <span className="text-xs font-medium text-slate-300">Photo du candidat</span>
                  <div className="w-24 sm:w-28 aspect-[7/9] rounded-md border border-[#294769] bg-[#0b1b30] flex items-center justify-center overflow-hidden relative shadow-inner">
                    {form.photo_data_url ? (
                      <img src={form.photo_data_url} alt="Photo du candidat" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-500 text-center p-2">
                        <Camera className="w-7 h-7 mb-1 opacity-50" />
                        <span className="text-[10px] leading-tight">Aucune photo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="btn-secondary !py-1 !px-2.5 text-xs cursor-pointer inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{form.photo_data_url ? 'Changer' : 'Uploader'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={onPhotoChange}
                      />
                    </label>
                    {form.photo_data_url && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="p-1 text-slate-400 hover:text-red-300 rounded transition-colors"
                        title="Supprimer la photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {photoError && <p className="text-xs text-red-300 max-w-[13rem]">{photoError}</p>}
                </div>

                {/* Formulaire identité & nationalité */}
                <div className="flex-1 w-full space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Lbl label="Nom complet *"><input className={inputCls} value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} maxLength={120} /></Lbl>
                    <Lbl label="Identifiant étudiant"><input className={`${inputCls} font-mono`} value={form.student_code} onChange={(e) => setField('student_code', e.target.value)} readOnly={!!saved} placeholder="Généré automatiquement" /></Lbl>
                    <Lbl label="Nationalité">
                      <select
                        className={inputCls}
                        value={form.nationality}
                        onChange={(e) => setField('nationality', e.target.value)}
                      >
                        <option value="">— Sélectionner une nationalité —</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Lbl>
                    <Lbl label="N° de carte d’identité"><input className={`${inputCls} font-mono`} value={form.national_id} onChange={(e) => setField('national_id', e.target.value)} maxLength={30} /></Lbl>
                    <Lbl label="N° de passeport" className="sm:col-span-2"><input className={`${inputCls} font-mono`} value={form.passport} onChange={(e) => setField('passport', e.target.value)} maxLength={30} /></Lbl>
                  </div>
                </div>
              </div>

              <Lbl label="Notes internes (jamais publiques)"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => setField('notes', e.target.value)} /></Lbl>
            </div>

            <div className="card p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-end gap-3 justify-between">
                <div>
                  <h2 className="font-semibold text-white">Certificats</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Numéros générés : PMTS-AAAA-MM-NNNNN (départ : 43289, sans doublon).
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Année</label>
                    <input
                      type="number"
                      min="2000"
                      max="2099"
                      value={defaultYear}
                      onChange={(e) => setDefaultYear(Number(e.target.value) || new Date().getFullYear())}
                      className={`${inputCls} !w-24 text-center font-mono`}
                      title="Année désignée pour la génération automatique du numéro de certificat"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mois</label>
                    <select
                      value={defaultMonth}
                      onChange={(e) => setDefaultMonth(e.target.value)}
                      className={`${inputCls} !w-40 font-mono`}
                      title="Mois désigné pour la génération automatique"
                    >
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Formation</label>
                    <select
                      className={`${inputCls} max-w-xs`}
                      value={addCourse}
                      onChange={(e) => setAddCourse(e.target.value)}
                      aria-label="Formation à ajouter"
                    >
                      <option value="">— Ajouter une formation —</option>
                      {/* BST mis en avant au début de liste */}
                      {catalog
                        .filter(
                          (c) =>
                            c.id === 'bst-bundle-stcw-vi-1' ||
                            c.name.toLowerCase().includes('basic safety training'),
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            ★ {c.name} (Pack 4 modules STCW)
                          </option>
                        ))}
                      {catalog
                        .filter(
                          (c) =>
                            c.id !== 'bst-bundle-stcw-vi-1' &&
                            !c.name.toLowerCase().includes('basic safety training'),
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.imo_number ? `${c.imo_number} · ` : ''}{c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <button
                    onClick={addCert}
                    disabled={!addCourse}
                    className="btn-secondary !py-2 !px-3 text-sm disabled:opacity-50 inline-flex items-center gap-1.5 h-[38px]"
                  >
                    <Plus className="w-4 h-4" />
                    {addCourse === 'bst-bundle-stcw-vi-1' ||
                    catalog.find((c) => c.id === addCourse)?.name.toLowerCase().includes('basic safety training')
                      ? 'Ajouter les 4 modules BST'
                      : 'Ajouter'}
                  </button>
                </div>
              </div>

              {/* Énumération détaillée des modules quand Basic Safety Training (BST) est sélectionné */}
              {(() => {
                const sel = catalog.find((c) => c.id === addCourse);
                if (!sel) return null;
                const isBST =
                  sel.id === 'bst-bundle-stcw-vi-1' ||
                  sel.name.toLowerCase().includes('basic safety training');
                if (!isBST && !sel.module_course_ids?.length) return null;

                const moduleIds = sel.module_course_ids || [
                  '2dacd0c1-0e5e-4b8d-ba76-3fbbfd24b942',
                  'c296411c-a883-4c15-addf-6641fe92d3ab',
                  'a6d1ab3b-3f0a-47c1-9733-f4deff52c7bc',
                  'dba61102-d2f7-4365-ac5c-d31478616373',
                ];

                const modules = moduleIds
                  .map((mid) => catalog.find((c) => c.id === mid))
                  .filter((c): c is NonNullable<typeof c> => c !== undefined);

                return (
                  <div className="rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-[#0b1b30] p-4 space-y-3 shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-500/20 text-[#e1b936]">
                          <Sparkles className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            Basic Safety Training (BST) — STCW A-VI/1
                          </h4>
                          <p className="text-xs text-amber-200/90">
                            Cette formation se compose des <strong>4 modules</strong> suivants :
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                        4 modules STCW
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {modules.map((m, idx) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-3 rounded-lg border border-[#294769] bg-[#0b1b30]/90 p-3 text-xs text-slate-200 hover:border-amber-500/40 transition-colors"
                        >
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/30">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-white text-sm truncate">{m.name}</div>
                            {m.imo_number && (
                              <div className="text-[11px] font-mono text-slate-400">
                                IMO Model Course {m.imo_number}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#294769]/60 text-[11px] text-slate-400">
                      <span>
                        💡 En cliquant sur « <strong>Ajouter les 4 modules BST</strong> », les 4 certificats modulaires seront automatiquement créés avec des numéros séquentiels uniques (départ 43289, année {defaultYear}, mois {defaultMonth}).
                      </span>
                    </div>
                  </div>
                );
              })()}

              {form.certificates.length === 0 && <p className="text-sm text-slate-400">Aucun certificat.</p>}

              {form.certificates.map((c) => {
                const missing = missingForPublish(c);
                const locked = c.status !== 'draft';
                const badge = STATUS_BADGE[c.status];
                const expired = isCertExpired(c);
                const { year: certYear, month: certMonth } = getCertYearAndMonth(c, defaultYear, defaultMonth);
                return (
                  <div key={c.id} className="rounded-xl border border-[#294769] p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <div className="font-medium text-white">
                        {c.course_name} {c.imo_number && <span className="ml-1 text-xs font-mono text-slate-400">IMO {c.imo_number}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {expired ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-300 font-semibold">Expiré</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-300 font-semibold">En cours</span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Lbl label="N° de certificat *">
                        <div className="flex gap-1.5">
                          <input
                            className={`${inputCls} font-mono`}
                            disabled={locked}
                            value={c.certificate_number}
                            onChange={(e) => patchCert(c.id, { certificate_number: e.target.value })}
                            placeholder="ex: PMTS-2026-11-43289"
                          />
                          {!locked && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextNum = getNextCertificateNumber(
                                  certYear,
                                  certMonth,
                                  students,
                                  form.certificates,
                                  c.id,
                                );
                                patchCert(c.id, { certificate_number: nextNum });
                              }}
                              className="btn-secondary !py-1.5 !px-2.5 text-xs inline-flex items-center gap-1 flex-shrink-0"
                              title={`Régénérer automatiquement un numéro unique pour ${certYear}-${certMonth}`}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span className="hidden xl:inline">Auto</span>
                            </button>
                          )}
                        </div>
                      </Lbl>
                      <Lbl label="Obtenu le *">
                        <input
                          type="date"
                          className={inputCls}
                          disabled={locked}
                          value={c.completed_on}
                          onChange={(e) => patchCert(c.id, { completed_on: e.target.value })}
                        />
                      </Lbl>
                      <Lbl label="Validité *">
                        <select
                          className={inputCls}
                          disabled={locked}
                          value={expired ? 'expired' : 'valid'}
                          onChange={(e) => onValidityChange(c.id, e.target.value as 'valid' | 'expired')}
                        >
                          <option value="valid">En cours</option>
                          <option value="expired">Expiré</option>
                        </select>
                      </Lbl>
                      <Lbl label="Valide jusqu’au">
                        <input
                          type="date"
                          className={inputCls}
                          disabled={locked}
                          value={c.valid_until}
                          onChange={(e) => patchCert(c.id, { valid_until: e.target.value })}
                        />
                      </Lbl>
                      <Lbl label="Mode *">
                        <select
                          className={inputCls}
                          disabled={locked}
                          value={c.mode}
                          onChange={(e) => patchCert(c.id, { mode: e.target.value as AdminCertificate['mode'] })}
                        >
                          <option value="">—</option>
                          <option value="in_person">Présentiel</option>
                          <option value="online">En ligne</option>
                          <option value="blended">Mixte</option>
                        </select>
                      </Lbl>
                      <Lbl label="Résultat *">
                        <select
                          className={inputCls}
                          disabled={locked}
                          value={c.result}
                          onChange={(e) => patchCert(c.id, { result: e.target.value as AdminCertificate['result'] })}
                        >
                          <option value="">—</option>
                          <option value="passed">Réussi</option>
                        </select>
                      </Lbl>
                      <Lbl label="Évaluateur *" className="sm:col-span-2">
                        <input
                          className={inputCls}
                          disabled={locked}
                          value={c.assessor}
                          onChange={(e) => patchCert(c.id, { assessor: e.target.value })}
                        />
                      </Lbl>
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
