import { useState } from 'react';
import { findStudentByCode, ServiceUnavailableError } from '@/lib/data';
import type { VerificationResult } from '@/types';
import {
  ShieldCheck,
  Search,
  User,
  BadgeCheck,
  AlertCircle,
  FileText,
  Calendar,
  Hash,
  XCircle,
} from 'lucide-react';

export default function VerificationPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    try {
      const found = await findStudentByCode(trimmed);
      if (found) setResult(found);
      else setError(`Aucun étudiant trouvé avec le code « ${trimmed} ».`);
    } catch (err) {
      setError(
        err instanceof ServiceUnavailableError
          ? err.message
          : 'Une erreur est survenue. Réessayez.',
      );
    }
    setLoading(false);
  };

  const reset = () => {
    setCode('');
    setResult(null);
    setError(null);
    setSearched(false);
  };

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
            Entrez l\u2019identifiant d\u2019un étudiant pour consulter son dossier de
            formation et vérifier l\u2019authenticité de ses certificats.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#0b1b30]">
        <div className="container-app max-w-2xl">
          <form
            onSubmit={handleSearch}
            className="card p-6 sm:p-8 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Ex : MT-2024-001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-field pl-11 font-mono"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary sm:w-auto">
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Vérification…' : 'Vérifier'}
            </button>
          </form>

          {!searched && (
            <p className="mt-4 text-center text-sm text-slate-400">
              Astuce : essayez le code de démonstration{' '}
              <button
                type="button"
                onClick={() => setCode('MT-2024-001')}
                className="font-mono font-semibold text-[#e1b936] hover:underline"
              >
                MT-2024-001
              </button>
            </p>
          )}

          {error && (
            <div className="mt-6 card p-6 border-red-200 bg-red-50 flex items-start gap-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-100 text-red-600 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Vérification échouée</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <button onClick={reset} className="text-red-400 hover:text-red-600">
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-6 animate-[fadeIn_0.3s_ease]">
              <div className="card p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-sky-950 text-white border-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 text-[#e1b936] shrink-0">
                    <User className="w-9 h-9" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-[#e1b936] text-sm font-medium">
                      <BadgeCheck className="w-4 h-4" />
                      Étudiant vérifié
                    </div>
                    <h3 className="mt-1 text-2xl font-bold">{result.student.full_name}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-300">
                      <span className="font-mono">ID : {result.student.student_code}</span>
                      {result.student.nationality && <span>{result.student.nationality}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#e1b936]" />
                    Formations suivies
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-[#e1b936]/10 text-[#e1b936] text-sm font-semibold">
                    {result.courses.length} certificat(s)
                  </span>
                </div>

                {result.courses.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">
                    Aucune formation enregistrée pour cet étudiant.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {result.courses.map((sc) => (
                      <div
                        key={sc.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-[#294769] hover:border-[#e1b936]/50 hover:bg-[#172f4e] transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white">
                              {sc.course.name}
                            </span>
                            {sc.course.imo_number && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-mono">
                                IMO {sc.course.imo_number}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                            {sc.completion_date && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(sc.completion_date).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                            {sc.certificate_number && (
                              <span className="inline-flex items-center gap-1 font-mono">
                                <Hash className="w-3.5 h-3.5" />
                                {sc.certificate_number}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-sm font-semibold w-fit">
                          <BadgeCheck className="w-4 h-4" />
                          {sc.status === 'completed' ? 'Validé' : sc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
