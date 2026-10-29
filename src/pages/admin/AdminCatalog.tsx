import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { loadAdminCatalog, saveCatalog } from '@/lib/admin-data';
import type { CatalogState } from '@/lib/admin-data';
import { sameCourse } from '@/lib/catalog';
import type { Course } from '@/types';
import { ErrorBox, Lbl, NoticeBox } from '@/pages/admin/ui';
import { inputCls } from '@/pages/admin/ui-helpers';

type Filter = 'all' | 'noprice' | 'hidden';

const EMPTY_NEW = {
  name: '',
  category: '',
  imo_number: '',
  duration_days: '',
  duration_hours: '',
  price_usd: '',
  image_url: '',
  industry: false,
};

const toNumber = (s: string): number | null => (s.trim() === '' ? null : Number(s.replace(',', '.')));
const fromInput = (value: string): number | null => toNumber(value);

// Contrôles faits avant d'écrire : le même nom ne doit pas servir deux fois (il sert de repère
// pour les fonctions de la page Inscription), et les montants doivent être des nombres positifs.
function validate(courses: Course[]): string | null {
  const names = new Set<string>();
  for (const c of courses) {
    const name = c.name.trim();
    if (!name) return 'Une formation n’a pas de nom.';
    if (names.has(name.toLowerCase())) return `Deux formations portent le nom « ${name} ».`;
    names.add(name.toLowerCase());
    for (const [label, v] of [['prix', c.price_usd], ['durée en jours', c.duration_days], ['durée en heures', c.duration_hours]] as const) {
      if (v !== null && (!Number.isFinite(v) || v < 0)) return `« ${name} » : ${label} invalide.`;
    }
    if (c.image_url && !/^(https:\/\/|\/)/.test(c.image_url)) return `« ${name} » : l’adresse de l’image doit commencer par https://.`;
  }
  return null;
}

export default function AdminCatalog({ email }: { email: string }) {
  const [base, setBase] = useState<CatalogState | null>(null);
  const [draft, setDraft] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [fresh, setFresh] = useState(EMPTY_NEW);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const state = await loadAdminCatalog();
      setBase(state);
      setDraft(structuredClone(state.courses));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lecture impossible.');
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const baseById = useMemo(() => new Map((base?.courses ?? []).map((c) => [c.id, c])), [base]);
  const isDirty = useCallback(
    (c: Course) => {
      const old = baseById.get(c.id);
      return !old || !sameCourse(old, c);
    },
    [baseById],
  );
  const dirtyCount = useMemo(() => draft.filter(isDirty).length, [draft, isDirty]);
  const noPrice = draft.filter((c) => c.price_usd === null && !c.hidden).length;
  const categories = useMemo(() => [...new Set(draft.map((c) => c.category))].sort(), [draft]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return draft.filter((c) => {
      if (filter === 'noprice' && !(c.price_usd === null && !c.hidden)) return false;
      if (filter === 'hidden' && !c.hidden) return false;
      return !q || c.name.toLowerCase().includes(q) || (c.imo_number ?? '').includes(q) || c.category.toLowerCase().includes(q);
    });
  }, [draft, search, filter]);

  const patch = (id: string, change: Partial<Course>) =>
    setDraft((d) => d.map((c) => (c.id === id ? { ...c, ...change } : c)));

  const addCourse = () => {
    const course: Course = {
      id: crypto.randomUUID(),
      imo_number: fresh.imo_number.trim() || null,
      name: fresh.name.trim(),
      duration_days: toNumber(fresh.duration_days),
      duration_hours: toNumber(fresh.duration_hours),
      category: fresh.category.trim() || 'Autre',
      image_url: fresh.image_url.trim() || null,
      price_usd: toNumber(fresh.price_usd),
      ...(fresh.industry ? { framework: 'industry' as const } : {}),
    };
    const problem = validate([...draft, course]);
    if (problem) return setError(problem);
    setError(null);
    setDraft((d) => [...d, course].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })));
    setFresh(EMPTY_NEW);
    setAdding(false);
    setNotice(`« ${course.name} » ajoutée à la liste : cliquez sur Enregistrer pour la publier.`);
  };

  const save = async () => {
    if (!base) return;
    const problem = validate(draft);
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await saveCatalog(draft, base, email);
      await load();
      setNotice('Catalogue enregistré. Le site affiche les nouvelles valeurs dès le prochain chargement de page.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.');
    }
    setBusy(false);
  };

  const cancel = () => {
    if (base) setDraft(structuredClone(base.courses));
    setError(null);
    setNotice(null);
  };

  if (loading) return <p className="text-sm text-slate-400">Chargement…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-white">
          Formations{' '}
          <span className="text-sm text-slate-400">
            ({draft.length} au total{noPrice > 0 && `, ${noPrice} sans prix`})
          </span>
        </h1>
        <button onClick={() => setAdding((v) => !v)} className="btn-secondary !py-2 text-sm">
          <Plus className="w-4 h-4" /> Ajouter une formation
        </button>
      </div>

      <p className="text-sm text-slate-400">
        Prix, durées et visibilité sont modifiables ici ; le site les affiche à la page suivante chargée.
        Une formation décochée est masquée du site (catalogue et inscription) mais reste connue des dossiers
        existants. Le prix du pack BST et le taux d’avance se règlent encore dans le code.
      </p>

      {base && base.version === 0 && (
        <NoticeBox>
          Le catalogue n’est pas encore enregistré dans la base : le site affiche la liste d’origine. Votre
          première modification l’enregistre en entier.
        </NoticeBox>
      )}
      {error && <ErrorBox>{error}</ErrorBox>}
      {notice && <NoticeBox>{notice}</NoticeBox>}

      {adding && (
        <div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Lbl label="Nom *" className="sm:col-span-2">
            <input className={inputCls} value={fresh.name} maxLength={160} onChange={(e) => setFresh({ ...fresh, name: e.target.value })} />
          </Lbl>
          <Lbl label="Catégorie">
            <input className={inputCls} list="catalog-categories" value={fresh.category} maxLength={60} onChange={(e) => setFresh({ ...fresh, category: e.target.value })} />
          </Lbl>
          <Lbl label="Prix (USD)">
            <input type="number" min="0" step="any" className={inputCls} value={fresh.price_usd} onChange={(e) => setFresh({ ...fresh, price_usd: e.target.value })} />
          </Lbl>
          <Lbl label="Durée (jours)">
            <input type="number" min="0" step="any" className={inputCls} value={fresh.duration_days} onChange={(e) => setFresh({ ...fresh, duration_days: e.target.value })} />
          </Lbl>
          <Lbl label="Durée (heures)">
            <input type="number" min="0" step="any" className={inputCls} value={fresh.duration_hours} onChange={(e) => setFresh({ ...fresh, duration_hours: e.target.value })} />
          </Lbl>
          <Lbl label="N° IMO (facultatif)">
            <input className={inputCls} value={fresh.imo_number} maxLength={12} onChange={(e) => setFresh({ ...fresh, imo_number: e.target.value })} />
          </Lbl>
          <Lbl label="Image (adresse https://, facultatif)" className="sm:col-span-2">
            <input className={inputCls} value={fresh.image_url} maxLength={400} onChange={(e) => setFresh({ ...fresh, image_url: e.target.value })} />
          </Lbl>
          <label className="sm:col-span-3 flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" className="accent-[#e1b936]" checked={fresh.industry} onChange={(e) => setFresh({ ...fresh, industry: e.target.checked })} />
            Formation du secteur (offshore, énergie…), hors cadre STCW / MLC
          </label>
          <div className="sm:col-span-3">
            <button onClick={addCourse} disabled={!fresh.name.trim()} className="btn-primary !py-2 text-sm disabled:opacity-60">
              Ajouter à la liste
            </button>
          </div>
        </div>
      )}
      <datalist id="catalog-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          className={`${inputCls} max-w-xs`}
          placeholder="Rechercher (nom, IMO, catégorie)…"
          aria-label="Rechercher une formation"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={`${inputCls} max-w-[14rem]`} value={filter} onChange={(e) => setFilter(e.target.value as Filter)} aria-label="Filtrer">
          <option value="all">Toutes</option>
          <option value="noprice">Sans prix ({noPrice})</option>
          <option value="hidden">Masquées</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="p-3 w-16">Visible</th>
              <th className="p-3">Formation</th>
              <th className="p-3 w-28">Jours</th>
              <th className="p-3 w-28">Heures</th>
              <th className="p-3 w-32">Prix (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#294769]">
            {shown.map((c) => {
              const open = openId === c.id;
              return (
                <Fragment key={c.id}>
                  <tr className={`align-top ${isDirty(c) ? 'bg-[#e1b936]/5' : ''} ${c.hidden ? 'opacity-60' : ''}`}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#e1b936]"
                        checked={!c.hidden}
                        onChange={(e) => patch(c.id, { hidden: e.target.checked ? undefined : true })}
                        aria-label={`Afficher « ${c.name} » sur le site`}
                      />
                    </td>
                    <td className="p-3">
                      <button onClick={() => setOpenId(open ? null : c.id)} className="flex items-start gap-1.5 text-left text-white hover:text-[#e1b936]">
                        {open ? <ChevronDown className="w-4 h-4 mt-0.5 shrink-0" /> : <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" />}
                        <span>
                          {c.name}
                          <span className="block text-xs text-slate-400">
                            {c.imo_number ? `IMO ${c.imo_number} · ` : ''}
                            {c.category}
                            {c.framework ? ' · hors STCW/MLC' : ''}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="p-3">
                      <input type="number" min="0" step="any" className={inputCls} value={c.duration_days ?? ''} onChange={(e) => patch(c.id, { duration_days: fromInput(e.target.value) })} aria-label={`Durée en jours de ${c.name}`} />
                    </td>
                    <td className="p-3">
                      <input type="number" min="0" step="any" className={inputCls} value={c.duration_hours ?? ''} onChange={(e) => patch(c.id, { duration_hours: fromInput(e.target.value) })} aria-label={`Durée en heures de ${c.name}`} />
                    </td>
                    <td className="p-3">
                      <input type="number" min="0" step="any" className={`${inputCls} ${c.price_usd === null && !c.hidden ? 'border-amber-400/60' : ''}`} value={c.price_usd ?? ''} onChange={(e) => patch(c.id, { price_usd: fromInput(e.target.value) })} placeholder="à fixer" aria-label={`Prix de ${c.name}`} />
                    </td>
                  </tr>
                  {open && (
                    <tr className="bg-[#0b1b30]">
                      <td />
                      <td colSpan={4} className="p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Lbl label="Nom" className="sm:col-span-2">
                            <input className={inputCls} value={c.name} maxLength={160} onChange={(e) => patch(c.id, { name: e.target.value })} />
                          </Lbl>
                          <Lbl label="Catégorie">
                            <input className={inputCls} list="catalog-categories" value={c.category} maxLength={60} onChange={(e) => patch(c.id, { category: e.target.value })} />
                          </Lbl>
                          <Lbl label="N° IMO">
                            <input className={inputCls} value={c.imo_number ?? ''} maxLength={12} onChange={(e) => patch(c.id, { imo_number: e.target.value.trim() || null })} />
                          </Lbl>
                          <Lbl label="Image (adresse https://)" className="sm:col-span-2">
                            <input className={inputCls} value={c.image_url ?? ''} maxLength={400} onChange={(e) => patch(c.id, { image_url: e.target.value.trim() || null })} />
                          </Lbl>
                          <label className="sm:col-span-3 flex items-center gap-2 text-sm text-slate-300">
                            <input type="checkbox" className="accent-[#e1b936]" checked={c.framework === 'industry'} onChange={(e) => patch(c.id, { framework: e.target.checked ? 'industry' : undefined })} />
                            Formation du secteur (offshore, énergie…), hors cadre STCW / MLC
                          </label>
                          <p className="sm:col-span-3 text-xs text-slate-400">
                            Le nom et le n° IMO servent aussi à rattacher la formation aux fonctions de la page
                            Inscription : après un changement de nom, vérifiez que la fonction concernée propose
                            toujours la formation.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-slate-400">Aucune formation ne correspond.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {dirtyCount > 0 && (
        <div className="card sticky bottom-4 p-3 flex flex-wrap items-center justify-between gap-3 border-[#e1b936]/50">
          <span className="text-sm text-slate-200">
            {dirtyCount} formation(s) modifiée(s), non enregistrée(s).
          </span>
          <span className="flex gap-2">
            <button onClick={cancel} disabled={busy} className="btn-secondary !py-2 text-sm">Annuler</button>
            <button onClick={save} disabled={busy} className="btn-primary !py-2 text-sm disabled:opacity-60">
              {busy ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
