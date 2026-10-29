import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getCourses,
  submitRegistration,
  ServiceUnavailableError,
} from '@/lib/data';
import { BST_PACK, computeQuote, depositLabel, findBstPack, formatUsd } from '@/lib/pricing';
import { formatDays } from '@/lib/format';
import { prepareIdPhoto, PhotoError } from '@/lib/image';
import { getCountries } from '@/lib/countries';
import { POSITION_GROUPS, getPosition, resolveRef, resolveRefs } from '@/data/positions';
import { SITE } from '@/config/site';
import type { Course, IdType, RegistrationReceipt } from '@/types';
import {
  User,
  Mail,
  Globe,
  FileText,
  Camera,
  Search,
  Loader2,
  Send,
  CheckCircle2,
  X,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Briefcase,
  Plus,
} from 'lucide-react';

// Limite des règles Firestore : 15 formations au plus par inscription.
const MAX_COURSES = 15;

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Inscrivez-vous',
    desc: 'Remplissez le formulaire et choisissez vos formations.',
  },
  {
    icon: CreditCard,
    title: `Réglez l’avance de ${depositLabel}`,
    desc: 'Elle finalise votre inscription et ouvre l’accès à vos modules en ligne.',
  },
  {
    icon: GraduationCap,
    title: 'Formez-vous, puis payez le solde',
    desc: 'Le solde est dû à la fin de la formation, pour recevoir vos documents.',
  },
];

const EMPTY_FORM = {
  last_name: '',
  first_names: '',
  email: '',
  nationality: '',
  id_type: 'national_id' as IdType,
  id_number: '',
};

function Field({
  label,
  htmlFor,
  icon: Icon,
  children,
}: {
  label: string;
  htmlFor: string;
  icon?: typeof User;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-200 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
        {children}
      </div>
    </div>
  );
}

function SectionTitle({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-semibold text-white mb-5">
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#e1b936] text-[#08182d] text-sm font-bold">
        {n}
      </span>
      {title}
    </h2>
  );
}

function PriceTag({ course }: { course: Pick<Course, 'price_usd'> }) {
  return course.price_usd != null ? (
    <span className="font-semibold text-[#e1b936] whitespace-nowrap">
      {formatUsd(course.price_usd)}
    </span>
  ) : (
    <span className="text-xs text-slate-400 whitespace-nowrap">Prix à confirmer</span>
  );
}

export default function RegistrationPage() {
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('cours');

  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [positionId, setPositionId] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    receipt: RegistrationReceipt;
    email: string;
    chosen: Course[];
    position: string | null;
  } | null>(null);

  const countries = useMemo(() => getCountries(), []);

  useEffect(() => {
    (async () => {
      try {
        const list = await getCourses();
        setCourses(list);
        if (preselected && list.some((c) => c.id === preselected)) {
          setSelected((s) => (s.includes(preselected) ? s : [...s, preselected]));
        }
      } catch {
        setCourses([]);
      }
    })();
  }, [preselected]);

  const position = getPosition(positionId);
  const recommended = useMemo(
    () => (position ? resolveRefs(courses, position.courses) : []),
    [position, courses],
  );
  const recommendedIds = useMemo(() => new Set(recommended.map((c) => c.id)), [recommended]);
  const optionalCourses = useMemo(
    () =>
      (position?.optional ?? []).flatMap((o) => {
        const course = resolveRef(courses, o.ref);
        return course ? [{ course, note: o.note }] : [];
      }),
    [position, courses],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      // Les formations de la fonction choisie passent en tête de liste.
      if (recommendedIds.size === 0) return courses;
      return [
        ...courses.filter((c) => recommendedIds.has(c.id)),
        ...courses.filter((c) => !recommendedIds.has(c.id)),
      ];
    }
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.imo_number ?? '').toLowerCase().includes(q),
    );
  }, [courses, search, recommendedIds]);

  const chosen = useMemo(
    () =>
      selected
        .map((id) => courses.find((c) => c.id === id))
        .filter((c): c is Course => !!c),
    [selected, courses],
  );
  const quote = useMemo(() => computeQuote(chosen), [chosen]);
  const pack = useMemo(() => findBstPack(courses), [courses]);
  const packOn = !!pack && pack.ids.every((id) => selected.includes(id));

  const update = (k: keyof typeof EMPTY_FORM, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // Choisir une fonction coche ses formations. Les formations que le candidat a ajoutées lui-même
  // (hors liste de l'ancienne fonction) sont conservées ; celles de l'ancienne fonction sont remplacées.
  const choosePosition = (id: string) => {
    const previous = new Set(recommended.map((c) => c.id));
    const next = resolveRefs(courses, getPosition(id)?.courses ?? []).map((c) => c.id);
    setSelected((s) => [...new Set([...next, ...s.filter((x) => !previous.has(x))])]);
    setPositionId(id);
  };

  const addPack = () => {
    if (pack) setSelected((s) => [...s, ...pack.ids.filter((id) => !s.includes(id))]);
  };

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError(null);
    try {
      setPhoto(await prepareIdPhoto(file));
    } catch (err) {
      setPhoto(null);
      setPhotoError(
        err instanceof PhotoError ? err.message : 'Impossible de traiter cette photo.',
      );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (chosen.length === 0) {
      setError('Choisissez au moins une formation.');
      return;
    }
    if (chosen.length > MAX_COURSES) {
      setError(`Une inscription porte sur ${MAX_COURSES} formations au plus. Retirez-en ${chosen.length - MAX_COURSES}.`);
      return;
    }
    if (!photo) {
      setError('Ajoutez votre photo d’identité.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const receipt = await submitRegistration({
        ...form,
        photo_data_url: photo,
        position: position?.label,
        courses: chosen.map(({ id, name, imo_number, price_usd }) => ({
          id,
          name,
          imo_number,
          price_usd,
        })),
      });
      setDone({ receipt, email: form.email.trim(), chosen, position: position?.label ?? null });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(
        err instanceof ServiceUnavailableError
          ? err.message
          : 'Une erreur est survenue lors de l’envoi. Vérifiez votre connexion et réessayez.',
      );
    }
    setLoading(false);
  };

  return (
    <div className="pt-16 md:pt-20">
      <section className="bg-[#172f4e] py-16 md:py-20 border-b border-[#294769]">
        <div className="container-app">
          <span className="text-[#e1b936] text-sm font-semibold uppercase tracking-wider">
            Formation en ligne
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-semibold text-white">
            Inscription aux formations
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl text-lg">
            Choisissez vos modules, consultez les tarifs et inscrivez-vous en ligne
            auprès de {SITE.name}.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#0b1b30]">
        <div className="container-app">
          {done ? (
            <div className="card p-6 sm:p-10 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-5">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Pré-inscription enregistrée
                </h2>
                <p className="mt-2 text-slate-300">
                  Elle sera finalisée dès réception de votre avance. Conservez votre
                  référence :
                </p>
                <div className="mt-5 inline-block px-6 py-3 rounded-sm border border-[#e1b936]/50 bg-[#0b1b30] font-mono text-2xl tracking-widest text-[#e1b936]">
                  {done.receipt.reference}
                </div>
              </div>

              {done.position && (
                <p className="mt-6 text-center text-sm text-slate-300">
                  Fonction : <span className="text-white">{done.position}</span>
                </p>
              )}

              <ul className="mt-6 divide-y divide-[#294769] border-y border-[#294769]">
                {done.chosen.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="text-slate-200">{c.name}</span>
                    <PriceTag course={c} />
                  </li>
                ))}
              </ul>

              {done.receipt.quote.total != null ? (
                <dl className="mt-5 space-y-2 text-sm">
                  {done.receipt.quote.discount > 0 && (
                    <div className="flex justify-between text-emerald-300">
                      <dt>Remise {BST_PACK.label}</dt>
                      <dd>−{formatUsd(done.receipt.quote.discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <dt>Total</dt>
                    <dd>{formatUsd(done.receipt.quote.total)}</dd>
                  </div>
                  <div className="flex justify-between text-white font-semibold text-base">
                    <dt>Avance à régler ({depositLabel})</dt>
                    <dd className="text-[#e1b936]">
                      {formatUsd(done.receipt.quote.deposit ?? 0)}
                    </dd>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <dt>Solde après la formation</dt>
                    <dd>{formatUsd(done.receipt.quote.balance ?? 0)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-5 text-sm text-slate-300">
                  Le montant exact de votre avance vous sera confirmé par notre équipe.
                </p>
              )}

              <div className="mt-6 rounded-sm border border-[#294769] bg-[#0b1b30] p-4 text-sm text-slate-300">
                <p className="font-semibold text-white mb-1">Étape suivante : l’avance</p>
                {SITE.paymentInstructions ? (
                  <p>{SITE.paymentInstructions}</p>
                ) : (
                  <p>
                    Les modalités de paiement de l’avance vous seront communiquées par
                    notre équipe à l’adresse {done.email}. Rappelez votre référence lors
                    du règlement.
                  </p>
                )}
                <p className="mt-2 text-slate-400">
                  Le solde est à régler à la fin de votre formation, avant la remise de
                  vos documents.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/" className="btn-primary">
                  Retour à l’accueil
                </Link>
                <Link to="/formations" className="btn-secondary">
                  Voir les formations
                </Link>
              </div>
            </div>
          ) : (
            <>
              <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="card p-5 flex items-start gap-4">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#e1b936]/10 text-[#e1b936] shrink-0">
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">
                        Étape {i + 1}
                      </div>
                      <h3 className="font-semibold text-white">{s.title}</h3>
                      <p className="mt-0.5 text-sm text-slate-300">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
              >
                <div className="lg:col-span-2 space-y-8">
                  {/* 1. Identité */}
                  <div className="card p-6 sm:p-8">
                    <SectionTitle n={1} title="Vos informations" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Nom *" htmlFor="last_name" icon={User}>
                        <input
                          id="last_name"
                          type="text"
                          required
                          maxLength={80}
                          autoComplete="family-name"
                          value={form.last_name}
                          onChange={(e) => update('last_name', e.target.value)}
                          className="input-field pl-10"
                        />
                      </Field>
                      <Field label="Prénoms *" htmlFor="first_names" icon={User}>
                        <input
                          id="first_names"
                          type="text"
                          required
                          maxLength={120}
                          autoComplete="given-name"
                          value={form.first_names}
                          onChange={(e) => update('first_names', e.target.value)}
                          className="input-field pl-10"
                        />
                      </Field>
                      <Field label="E-mail *" htmlFor="email" icon={Mail}>
                        <input
                          id="email"
                          type="email"
                          required
                          maxLength={120}
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          className="input-field pl-10"
                          placeholder="nom@exemple.com"
                        />
                      </Field>
                      <Field label="Nationalité *" htmlFor="nationality" icon={Globe}>
                        <select
                          id="nationality"
                          required
                          value={form.nationality}
                          onChange={(e) => update('nationality', e.target.value)}
                          className="input-field pl-10"
                        >
                          <option value="">— Sélectionnez —</option>
                          {countries.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>

                  {/* 2. Pièce d'identité et photo */}
                  <div className="card p-6 sm:p-8">
                    <SectionTitle n={2} title="Pièce d’identité et photo" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Type de pièce *" htmlFor="id_type">
                        <select
                          id="id_type"
                          value={form.id_type}
                          onChange={(e) => update('id_type', e.target.value)}
                          className="input-field"
                        >
                          <option value="national_id">Carte nationale d’identité</option>
                          <option value="passport">Passeport</option>
                        </select>
                      </Field>
                      <Field
                        label={
                          form.id_type === 'passport'
                            ? 'Numéro de passeport *'
                            : 'Numéro de carte d’identité *'
                        }
                        htmlFor="id_number"
                        icon={FileText}
                      >
                        <input
                          id="id_number"
                          type="text"
                          required
                          minLength={4}
                          maxLength={30}
                          autoComplete="off"
                          value={form.id_number}
                          onChange={(e) => update('id_number', e.target.value)}
                          className="input-field pl-10"
                        />
                      </Field>
                    </div>

                    <div className="mt-6">
                      <span className="block text-sm font-medium text-slate-200 mb-1.5">
                        Photo d’identité *
                      </span>
                      <div className="flex flex-col sm:flex-row gap-5 items-start">
                        <div className="w-28 shrink-0 aspect-[7/9] rounded-sm border border-dashed border-[#385371] bg-[#0b1b30] flex items-center justify-center overflow-hidden">
                          {photo ? (
                            <img
                              src={photo}
                              alt="Aperçu de votre photo d’identité"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Camera className="w-7 h-7 text-slate-500" />
                          )}
                        </div>
                        <div className="text-sm text-slate-300">
                          <label className="btn-secondary cursor-pointer">
                            <Camera className="w-4 h-4" />
                            {photo ? 'Changer la photo' : 'Choisir une photo'}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={onPhoto}
                              className="sr-only"
                            />
                          </label>
                          <p className="mt-3 text-slate-400">
                            Photo récente, visage de face et centré, fond clair uni, sans
                            lunettes de soleil ni couvre-chef. Elle est recadrée
                            automatiquement au format 35 × 45 mm. JPG, PNG ou WebP, 8 Mo
                            maximum.
                          </p>
                          {photoError && (
                            <p className="mt-2 text-red-300">{photoError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Formations */}
                  <div className="card p-6 sm:p-8">
                    <SectionTitle n={3} title="Choisissez vos formations" />

                    <div className="mb-5 rounded-sm border border-[#294769] bg-[#0b1b30] p-4">
                      <Field label="Votre fonction à bord (facultatif)" htmlFor="position" icon={Briefcase}>
                        <select
                          id="position"
                          value={positionId}
                          onChange={(e) => choosePosition(e.target.value)}
                          className="input-field pl-10"
                        >
                          <option value="">— Je choisis moi-même mes formations —</option>
                          {POSITION_GROUPS.map((g) => (
                            <optgroup key={g.label} label={g.label}>
                              {g.positions.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </Field>
                      <p className="mt-2 text-xs text-slate-400">
                        Vous ne savez pas quelles formations choisir ? Indiquez votre fonction :
                        nous cochons celles qui lui correspondent. Vous pouvez ensuite en retirer
                        ou en ajouter.
                      </p>

                      {position && (
                        <div className="mt-4 space-y-3 text-sm">
                          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-200">
                            <span>
                              <strong className="text-[#e1b936]">
                                {recommended.length} formations
                              </strong>{' '}
                              proposées pour cette fonction, cochées ci-dessous.
                            </span>
                            <button
                              type="button"
                              onClick={() => choosePosition(position.id)}
                              className="text-xs underline text-slate-300 hover:text-white"
                            >
                              Recocher les formations de cette fonction
                            </button>
                          </p>

                          {optionalCourses.length > 0 && (
                            <div>
                              <p className="text-xs uppercase tracking-wider text-slate-400 mb-1.5">
                                Selon votre cas
                              </p>
                              <ul className="space-y-1.5">
                                {optionalCourses.map(({ course, note }) => {
                                  const on = selected.includes(course.id);
                                  return (
                                    <li key={course.id}>
                                      <button
                                        type="button"
                                        onClick={() => toggle(course.id)}
                                        aria-pressed={on}
                                        className="inline-flex items-start gap-2 text-left text-slate-200 hover:text-white"
                                      >
                                        {on ? (
                                          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-300" />
                                        ) : (
                                          <Plus className="w-4 h-4 mt-0.5 shrink-0 text-[#e1b936]" />
                                        )}
                                        <span>
                                          {course.name}{' '}
                                          <span className="text-slate-400">({note})</span>
                                        </span>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}

                          {position.unavailable && (
                            <p className="text-xs text-slate-400 leading-relaxed">
                              <span className="text-slate-300">
                                Également demandé pour cette fonction, mais pas encore dans notre
                                catalogue :
                              </span>{' '}
                              {position.unavailable.join(' ; ')}.{' '}
                              <Link to="/contact" className="underline hover:text-white">
                                Écrivez-nous
                              </Link>{' '}
                              pour ces formations.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {pack && (
                      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between rounded-sm border border-[#e1b936]/40 bg-[#e1b936]/5 p-4">
                        <p className="text-sm text-slate-200">
                          <strong className="text-[#e1b936]">{BST_PACK.label}</strong> :
                          formations {BST_PACK.imoNumbers.join(', ')} pour{' '}
                          <strong>{formatUsd(BST_PACK.price)}</strong> au lieu de{' '}
                          {formatUsd(pack.regular)}.
                        </p>
                        {packOn ? (
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300 whitespace-nowrap">
                            <CheckCircle2 className="w-4 h-4" /> Pack appliqué
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={addPack}
                            className="btn-secondary whitespace-nowrap"
                          >
                            Ajouter le pack
                          </button>
                        )}
                      </div>
                    )}
                    <div className="relative mb-4">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Rechercher une formation…"
                        aria-label="Rechercher une formation"
                      />
                    </div>
                    <ul className="max-h-[28rem] overflow-y-auto rounded-sm border border-[#294769] divide-y divide-[#294769]">
                      {visible.map((c) => {
                        const on = selected.includes(c.id);
                        return (
                          <li key={c.id}>
                            <label
                              className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                                on ? 'bg-[#e1b936]/10' : 'hover:bg-[#172f4e]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => toggle(c.id)}
                                className="mt-1 h-4 w-4 shrink-0 accent-[#e1b936]"
                              />
                              <span className="flex-1 min-w-0">
                                <span className="block text-sm font-medium text-white">
                                  {c.name}
                                </span>
                                <span className="block text-xs text-slate-400">
                                  {c.category}
                                  {c.duration_days != null &&
                                    ` · ${formatDays(c.duration_days)}`}
                                  {recommendedIds.has(c.id) && (
                                    <span className="text-[#e1b936]">
                                      {' '}
                                      · Recommandée pour votre fonction
                                    </span>
                                  )}
                                </span>
                              </span>
                              <PriceTag course={c} />
                            </label>
                          </li>
                        );
                      })}
                      {visible.length === 0 && (
                        <li className="p-4 text-sm text-slate-400">
                          Aucune formation ne correspond à votre recherche.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Récapitulatif */}
                <aside className="card p-6 sm:p-8 lg:sticky lg:top-28">
                  <h2 className="text-lg font-semibold text-white mb-4">Récapitulatif</h2>

                  {chosen.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      Aucune formation sélectionnée. Cochez vos formations pour voir les
                      tarifs.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {chosen.map((c) => (
                        <li key={c.id} className="flex items-start gap-2 text-sm">
                          <span className="flex-1 text-slate-200">{c.name}</span>
                          <PriceTag course={c} />
                          <button
                            type="button"
                            onClick={() => toggle(c.id)}
                            aria-label={`Retirer ${c.name}`}
                            className="text-slate-400 hover:text-white shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {chosen.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-[#294769] space-y-2 text-sm">
                      {quote.total != null ? (
                        <>
                          {quote.discount > 0 && (
                            <div className="flex justify-between text-emerald-300">
                              <span>Remise {BST_PACK.label}</span>
                              <span>−{formatUsd(quote.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-300">
                            <span>Total</span>
                            <span>{formatUsd(quote.total)}</span>
                          </div>
                          <div className="flex justify-between text-white font-semibold text-base">
                            <span>Avance à l’inscription ({depositLabel})</span>
                            <span className="text-[#e1b936]">
                              {formatUsd(quote.deposit ?? 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Solde après la formation</span>
                            <span>{formatUsd(quote.balance ?? 0)}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-slate-400">
                          Le tarif de certaines formations sera confirmé par notre équipe,
                          ainsi que le montant de l’avance.
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-5 text-xs text-slate-400 leading-relaxed">
                    Une avance de {depositLabel} du prix total est à régler pour finaliser
                    votre inscription. Le solde est à régler à la fin de la formation, pour
                    recevoir vos documents.
                  </p>

                  <label className="mt-5 flex items-start gap-3 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#e1b936]"
                    />
                    <span>
                      J’accepte que mes données personnelles (identité, numéro de pièce
                      d’identité, photo) soient utilisées par {SITE.name} pour traiter mon
                      inscription, établir mes documents de formation et permettre la vérification en ligne de mes certificats (nom et formations suivies). *
                    </span>
                  </label>

                  {error && (
                    <p className="mt-4 text-sm text-red-300 bg-red-500/10 px-4 py-3 rounded-lg">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full mt-5 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer ma pré-inscription
                      </>
                    )}
                  </button>
                </aside>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
