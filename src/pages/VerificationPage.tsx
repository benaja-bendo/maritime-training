import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { findStudent, isVerificationOpen, ServiceUnavailableError } from '@/lib/data';
import { certificateStatus, normalizeIdentifier, todayInPanama } from '@/lib/verification';
import type { VerificationMethod } from '@/lib/verification';
import type { Certificate, VerifiedStudent } from '@/types';
import {
  ShieldCheck,
  Search,
  User,
  BadgeCheck,
  FileText,
  Calendar,
  Hash,
  XCircle,
  CheckCircle2,
  Lock,
  Clock,
  Anchor,
} from 'lucide-react';

const METHODS: {
  id: VerificationMethod;
  label: string;
  field: string;
  placeholder: string;
}[] = [
  {
    id: 'certificate_number',
    label: 'Numéro de certificat',
    field: 'Numéro de certificat',
    placeholder: 'ex. PMTS-2026-11-43289',
  },
  {
    id: 'national_id',
    label: 'Pièce d’identité',
    field: 'Numéro de carte d’identité',
    placeholder: 'ex. 8-123-456',
  },
  {
    id: 'passport',
    label: 'Passeport',
    field: 'Numéro de passeport',
    placeholder: 'ex. PA1234567',
  },
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const month = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', {
    month: 'long',
    timeZone: 'UTC',
  });
  return `${d} ${month} ${y}`;
}

export default function VerificationPage() {
  const [method, setMethod] = useState<VerificationMethod>('certificate_number');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ student: VerifiedStudent; checkedOn: string } | null>(
    null,
  );
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    isVerificationOpen().then(setOpen, () => setOpen(true));
  }, []);

  const current = METHODS.find((m) => m.id === method) ?? METHODS[0];

  const clear = () => {
    setResult(null);
    setNotFound(false);
    setError(null);
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    clear();
    if (normalizeIdentifier(value).length < 4) {
      setError('Veuillez saisir le numéro complet (4 caractères minimum).');
      return;
    }
    setLoading(true);
    try {
      const student = await findStudent(method, value);
      if (student) setResult({ student, checkedOn: todayInPanama() });
      else setNotFound(true);
    } catch (err) {
      setError(
        err instanceof ServiceUnavailableError
          ? err.message
          : 'Une erreur est survenue lors de la vérification. Vérifiez votre connexion et réessayez.',
      );
    }
    setLoading(false);
  };

  const reset = () => {
    setValue('');
    clear();
  };

  const certificates = result?.student.certificates ?? [];
  const today = result?.checkedOn ?? todayInPanama();
  const statusOf = (c: Certificate) => certificateStatus(c.valid_until, today, c.revoked);
  const groups: { title: string | null; number: string | null; items: { c: Certificate; i: number }[] }[] = [];
  certificates.forEach((c, i) => {
    const g = c.bundle && c.certificate_number
      ? groups.find((x) => x.title === c.bundle && x.number === c.certificate_number)
      : undefined;
    if (g) g.items.push({ c, i });
    else if (c.bundle && c.certificate_number) groups.push({ title: c.bundle, number: c.certificate_number, items: [{ c, i }] });
    else groups.push({ title: null, number: null, items: [{ c, i }] });
  });
  const validCount = certificates.filter((c) => statusOf(c) === 'valid').length;
  const expiredCount = certificates.filter((c) => statusOf(c) === 'expired').length;

  return (
    <div className="pt-16 md:pt-20">
      {/* Header Banner Bleu Royal */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-[#1b64b8] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/18442732/pexels-photo-18442732.jpeg?auto=compress&cs=tinysrgb&h=800&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#124b8f] via-[#1b64b8] to-[#206fcc] pointer-events-none" />

        <div className="container-app relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
            <Anchor className="w-3.5 h-3.5 text-amber-300" />
            Portail Officiel de Vérification des Certificats
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white">
            Vérification de Documents
          </h1>
          <p className="mt-4 text-sky-100 max-w-2xl text-lg font-normal">
            Contrôlez l'authenticité d'un certificat officiel délivré par Panama Maritime Training Services
            à l'aide du numéro de certificat, du numéro de pièce d'identité ou du passeport.
          </p>
        </div>
      </section>

      {/* Formulaire de recherche */}
      <section className="relative py-12 md:py-16 overflow-hidden bg-slate-50 dark:bg-[#0a192f] transition-colors duration-200">
        <div className="container-app relative z-10 max-w-2xl">
          {open === false && (
            <div className="card p-6 sm:p-8 flex items-start gap-4 bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-sm">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950 text-[#1b64b8] dark:text-sky-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Ouverture imminente</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Le service de vérification en ligne est en cours de synchronisation. En attendant, pour vérifier un document,{' '}
                  <Link to="/contact" className="text-[#1b64b8] font-bold hover:underline">
                    contactez notre secrétariat
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

          {open !== false && (
            <form onSubmit={handleSearch} className="card p-6 sm:p-8 bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-md rounded-2xl">
              <div
                role="radiogroup"
                aria-label="Méthode de vérification"
                className="grid grid-cols-3 gap-2 mb-6"
              >
                {METHODS.map((m) => {
                  const on = m.id === method;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        setMethod(m.id);
                        setValue('');
                        clear();
                      }}
                      className={`px-2 py-2.5 rounded-lg border text-xs sm:text-sm font-bold transition-all ${
                        on
                          ? 'bg-[#1b64b8] border-[#1b64b8] text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-[#0c1f38] border-sky-200 dark:border-sky-900 text-slate-700 dark:text-slate-300 hover:border-[#1b64b8] hover:text-[#1b64b8]'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              <label htmlFor="v_value" className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                {current.field}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="v_value"
                    type="text"
                    required
                    maxLength={40}
                    autoComplete="off"
                    placeholder={current.placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="input-field pl-11 font-mono shadow-xs"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-royal sm:w-auto disabled:opacity-60 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                  {loading ? 'Vérification...' : 'Vérifier'}
                </button>
              </div>

              <p className="mt-4 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                Seuls le nom de l'étudiant, sa photo et la liste de ses certificats officiels sont affichés.
                Le numéro saisi n'est pas stocké par ce site.
              </p>
            </form>
          )}

          {(error || notFound) && (
            <div
              role="alert"
              className="mt-6 card p-6 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 flex items-start gap-4 rounded-xl shadow-xs"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 dark:text-red-200">
                  {notFound ? 'Aucun certificat trouvé' : 'Échec de la vérification'}
                </h3>
                <p className="mt-1 text-sm text-red-800 dark:text-red-300 leading-relaxed">
                  {notFound ? (
                    <>
                      Aucun certificat officiel n'est associé à ce numéro. Vérifiez la saisie ou utilisez
                      une autre méthode. En cas de doute,{' '}
                      <Link to="/contact" className="underline font-bold hover:text-red-950 dark:hover:text-white">
                        contactez notre secrétariat
                      </Link>
                      .
                    </>
                  ) : (
                    error
                  )}
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-6">
              {/* Carte d'identité de l'étudiant vérifié */}
              <div className="card p-6 sm:p-8 bg-[#124077] text-white rounded-2xl border border-sky-400/30 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {result.student.photo_data_url ? (
                    <img
                      src={result.student.photo_data_url}
                      alt={`Photo de ${result.student.full_name}`}
                      className="w-28 aspect-[7/9] rounded-xl object-cover border-2 border-white/20 shrink-0 shadow-md"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 text-amber-300 shrink-0 border border-white/15">
                      <User className="w-9 h-9" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-amber-300 text-sm font-bold">
                      <BadgeCheck className="w-4 h-4" />
                      Étudiant identifié & enregistré
                    </div>
                    <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
                      {result.student.full_name}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-sky-100">
                      <span className="font-mono bg-white/10 px-2.5 py-1 rounded-md">
                        ID Étudiant : {result.student.student_code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des certificats */}
              <div className="card p-6 sm:p-8 bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 rounded-2xl shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-sky-50 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-[#1b64b8] dark:text-sky-400" />
                    Formations & Certificats
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm font-bold">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {validCount} valide{validCount > 1 ? 's' : ''}
                    </span>
                    {expiredCount > 0 && (
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
                        {expiredCount} expiré{expiredCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {certificates.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm py-4">
                    Aucune formation enregistrée pour cet étudiant.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {groups.map((g, gi) => {
                      const items = (
                        <ul className="space-y-3">
                          {g.items.map(({ c, i }) => {
                            const status = statusOf(c);
                            const expired = status !== 'valid';
                            return (
                              <li
                                key={`${c.certificate_number ?? c.course_name}-${c.course_name}-${i}`}
                                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-all ${
                                  expired
                                    ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900'
                                    : 'border-sky-100 dark:border-sky-950 bg-white dark:bg-[#0c1f38] hover:border-[#1b64b8] shadow-xs'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-slate-900 dark:text-white">{c.course_name}</span>
                                    {c.imo_number && (
                                      <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950 text-[#1b64b8] dark:text-sky-300 text-xs font-mono font-bold border border-sky-100 dark:border-sky-800">
                                        IMO {c.imo_number}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5 text-[#1b64b8] dark:text-sky-400" />
                                      Délivré le {formatDate(c.completed_on)}
                                    </span>
                                    {c.certificate_number && (
                                      <span className="inline-flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300 font-bold">
                                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                                        {c.certificate_number}
                                      </span>
                                    )}
                                  </div>
                                  <p className={`mt-1.5 text-sm font-semibold ${expired ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                                    {c.valid_until
                                      ? expired
                                        ? `Expiré le ${formatDate(c.valid_until)}`
                                        : `Valide jusqu'au ${formatDate(c.valid_until)}`
                                      : 'Valide permanent, sans date d’expiration'}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold w-fit border ${
                                    expired
                                      ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300'
                                      : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                  }`}
                                >
                                  {expired ? (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  )}
                                  {status === 'expired' ? 'Expiré' : 'Valide'}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      );
                      return g.title ? (
                        <div key={`g-${gi}`} className="rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20 p-4">
                          <p className="font-bold text-slate-900 dark:text-white">{g.title}</p>
                          <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                            Certificat n° <span className="font-mono font-bold text-[#1b64b8] dark:text-sky-300">{g.number}</span> · {g.items.length} modules inclus
                          </p>
                          {items}
                        </div>
                      ) : (
                        <div key={`g-${gi}`}>{items}</div>
                      );
                    })}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Statut officiel à la date du {formatDate(result.checkedOn)}. Un certificat reste valide jusqu'à la fin de sa date d'expiration.
              </p>

              <button onClick={reset} className="btn-secondary w-full sm:w-auto">
                Effectuer une nouvelle vérification
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
