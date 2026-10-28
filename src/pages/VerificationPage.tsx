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
} from 'lucide-react';

const METHODS: {
  id: VerificationMethod;
  label: string;
  field: string;
  placeholder: string;
}[] = [
  {
    id: 'student_code',
    label: 'Identifiant étudiant',
    field: 'Identifiant étudiant',
    placeholder: 'Ex : STU-AB12CD34',
  },
  {
    id: 'national_id',
    label: 'Carte d’identité',
    field: 'Numéro de carte d’identité',
    placeholder: 'Ex : 8-123-456',
  },
  {
    id: 'passport',
    label: 'Passeport',
    field: 'Numéro de passeport',
    placeholder: 'Ex : PA1234567',
  },
];

// Les dates sont stockées au format AAAA-MM-JJ : on évite tout décalage de fuseau horaire.
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const month = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', {
    month: 'long',
    timeZone: 'UTC',
  });
  return `${d === 1 ? '1er' : d} ${month} ${y}`;
}

export default function VerificationPage() {
  const [method, setMethod] = useState<VerificationMethod>('student_code');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ student: VerifiedStudent; checkedOn: string } | null>(
    null,
  );
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // null = en cours de vérification. En cas d'échec de lecture, on laisse la recherche
  // ouverte : elle affichera elle-même une erreur de connexion si besoin.
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
      setError('Saisissez le numéro complet (4 caractères minimum).');
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
          : 'Une erreur est survenue. Vérifiez votre connexion et réessayez.',
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
  const validCount = certificates.filter((c) => statusOf(c) === 'valid').length;
  const expiredCount = certificates.filter((c) => statusOf(c) === 'expired').length;
  const revokedCount = certificates.filter((c) => statusOf(c) === 'revoked').length;

  return (
    <div className="pt-16 md:pt-20">
      <section className="bg-[#172f4e] py-16 md:py-20 border-b border-[#294769]">
        <div className="container-app">
          <span className="text-[#e1b936] text-sm font-semibold uppercase tracking-wider">
            Portail officiel
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-semibold text-white">
            Vérification de Documents
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl text-lg">
            Vérifiez l’authenticité des certificats d’un étudiant avec son identifiant, son
            numéro de carte d’identité ou son numéro de passeport.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#0b1b30]">
        <div className="container-app max-w-2xl">
          {open === false && (
            <div className="card p-6 sm:p-8 flex items-start gap-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#e1b936]/10 text-[#e1b936] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Ouverture prochaine</h2>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  Le service de vérification en ligne ouvre prochainement : les certificats
                  sont en cours d’enregistrement. En attendant, pour vérifier un document,{' '}
                  <Link to="/contact" className="text-[#e1b936] hover:underline">
                    contactez-nous
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

          {open !== false && (
          <form onSubmit={handleSearch} className="card p-6 sm:p-8">
            <div
              role="radiogroup"
              aria-label="Méthode de vérification"
              className="grid grid-cols-3 gap-2 mb-5"
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
                    className={`px-2 py-2.5 rounded-sm border text-xs sm:text-sm font-semibold transition-colors ${
                      on
                        ? 'bg-[#e1b936] border-[#e1b936] text-[#08182d]'
                        : 'border-[#385371] text-slate-300 hover:border-[#e1b936] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            <label htmlFor="v_value" className="block text-sm font-medium text-slate-200 mb-1.5">
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
                  className="input-field pl-11 font-mono"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary sm:w-auto disabled:opacity-60">
                <ShieldCheck className="w-4 h-4" />
                {loading ? 'Vérification…' : 'Vérifier'}
              </button>
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Seuls le nom, les formations suivies et leur statut sont affichés. Le numéro saisi
              n’est pas enregistré par ce site.
            </p>
          </form>
          )}

          {(error || notFound) && (
            <div
              role="alert"
              className="mt-6 card p-6 border-red-400/30 bg-red-500/10 flex items-start gap-4"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-500/15 text-red-300 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-200">
                  {notFound ? 'Aucun dossier trouvé' : 'Vérification impossible'}
                </h3>
                <p className="mt-1 text-sm text-red-200/90">
                  {notFound ? (
                    <>
                      Aucun certificat n’est associé à ce numéro. Vérifiez la saisie ou
                      choisissez une autre méthode. En cas de doute,{' '}
                      <Link to="/contact" className="underline hover:text-white">
                        contactez-nous
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
              <div className="card p-6 sm:p-8 bg-gradient-to-br from-[#08182d] to-[#172f4e]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 text-[#e1b936] shrink-0">
                    <User className="w-9 h-9" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-[#e1b936] text-sm font-medium">
                      <BadgeCheck className="w-4 h-4" />
                      Étudiant identifié
                    </div>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                      {result.student.full_name}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-300">
                      <span className="font-mono">ID : {result.student.student_code}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#e1b936]" />
                    Formations suivies
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm font-semibold">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300">
                      {validCount} valide{validCount > 1 ? 's' : ''}
                    </span>
                    {expiredCount > 0 && (
                      <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-300">
                        {expiredCount} expiré{expiredCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {revokedCount > 0 && (
                      <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-300">
                        {revokedCount} révoqué{revokedCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {certificates.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4">
                    Aucune formation enregistrée pour cet étudiant.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {certificates.map((c, i) => {
                      const status = statusOf(c);
                      const expired = status !== 'valid';
                      return (
                        <li
                          key={`${c.certificate_number ?? c.course_name}-${i}`}
                          className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-colors ${
                            expired
                              ? 'border-red-400/30 bg-red-500/5'
                              : 'border-[#294769] hover:border-[#e1b936]/50 hover:bg-[#172f4e]'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-white">{c.course_name}</span>
                              {c.imo_number && (
                                <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-xs font-mono">
                                  IMO {c.imo_number}
                                </span>
                              )}
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Obtenu le {formatDate(c.completed_on)}
                              </span>
                              {c.certificate_number && (
                                <span className="inline-flex items-center gap-1 font-mono">
                                  <Hash className="w-3.5 h-3.5" />
                                  {c.certificate_number}
                                </span>
                              )}
                            </div>
                            <p className={`mt-1.5 text-sm ${expired ? 'text-red-300' : 'text-emerald-300/90'}`}>
                              {status === 'revoked'
                                ? 'Ce certificat a été révoqué : il n’est plus valable.'
                                : c.valid_until
                                ? expired
                                  ? `Expiré depuis le ${formatDate(c.valid_until)}`
                                  : `En cours de validité jusqu’au ${formatDate(c.valid_until)}`
                                : 'En cours de validité, sans date d’expiration'}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold w-fit ${
                              expired
                                ? 'bg-red-500/10 text-red-300'
                                : 'bg-emerald-500/10 text-emerald-300'
                            }`}
                          >
                            {expired ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            {status === 'revoked' ? 'Révoqué' : status === 'expired' ? 'Expiré' : 'Valide'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Situation au {formatDate(result.checkedOn)}. Un certificat reste valide jusqu’à la
                fin de sa date d’échéance.
              </p>

              <button onClick={reset} className="btn-secondary w-full sm:w-auto">
                Nouvelle vérification
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
