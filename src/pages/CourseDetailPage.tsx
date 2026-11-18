import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse } from '@/lib/data';
import { depositLabel, formatUsd } from '@/lib/pricing';
import { formatDays, formatHours } from '@/lib/format';
import type { Course } from '@/types';
import {
  GraduationCap,
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const data = await getCourse(id);
        if (data) setCourse(data);
        else setNotFound(true);
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-16 md:pt-20 min-h-[60vh] flex items-center justify-center bg-slate-50 dark:bg-[#0a192f]">
        <div className="w-8 h-8 border-3 border-[#1b64b8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="pt-16 md:pt-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-slate-50 dark:bg-[#0a192f]">
        <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Formation non trouvée</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Ce cours n'existe pas ou a été déplacé.</p>
        <Link to="/courses" className="btn-royal mt-6">
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero formation avec image & voile bleu royal */}
      <section className="relative h-[44vh] min-h-[340px] overflow-hidden bg-[#1b64b8]">
        {course.image_url && (
          <img
            src={course.image_url}
            alt={course.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12498b] via-[#1b64b8]/70 to-[#1b64b8]/40" />
        <div className="container-app relative z-10 h-full flex flex-col justify-end pb-10">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sky-200 text-sm font-bold mb-4 hover:text-white w-fit drop-shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            Catalogue des cours
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            {course.imo_number && (
              <span className="px-3 py-1 rounded-md bg-[#dfa716] text-slate-950 text-sm font-mono font-bold shadow">
                IMO {course.imo_number}
              </span>
            )}
            <span className="px-3 py-1 rounded-md bg-white/20 backdrop-blur-md text-white text-sm font-bold border border-white/20">
              {course.category}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white max-w-3xl leading-tight drop-shadow-md">
            {course.name}
          </h1>
        </div>
      </section>

      {/* Contenu de la formation */}
      <section className="relative py-12 md:py-16 overflow-hidden bg-slate-50 dark:bg-[#0a192f] transition-colors duration-200">
        <div className="container-app relative z-10 max-w-4xl">
          {/* Fiche technique */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              {
                icon: Calendar,
                label: 'Durée',
                value: course.duration_days != null ? formatDays(course.duration_days) : '—',
              },
              {
                icon: Clock,
                label: 'Heures',
                value: course.duration_hours != null ? formatHours(course.duration_hours) : '—',
              },
              { icon: Tag, label: 'Catégorie', value: course.category },
            ].map((fact) => (
              <div key={fact.label} className="card p-5 flex items-center gap-4 bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-sm">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-[#1b64b8] dark:text-sky-300 shrink-0">
                  <fact.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">{fact.label}</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{fact.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-[#112240] p-6 sm:p-8 rounded-2xl border border-sky-100 dark:border-sky-950 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Présentation du cours</h2>
            {course.framework === 'industry' ? (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                Ce cours est destiné aux fonctions d'opérations offshore et spécialisées. Le programme,
                la durée, le tarif ainsi que l'autorité de référence pour la délivrance du certificat
                sont validés par notre équipe avant votre inscription.
              </p>
            ) : (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                Ce cours est dispensé en stricte conformité avec les conventions internationales STCW et MLC 2006
                de l'OMI (amendements de Manille 2010). Il combine enseignement théorique et exercices pratiques.
                À l'issue de la formation, le stagiaire reçoit un certificat officiel enregistré dans notre base
                de données et vérifiable en ligne.
              </p>
            )}
          </div>

          {/* Points forts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {(course.framework === 'industry'
              ? [
                  'Programme et tarif confirmés avant inscription',
                  'Instructeurs professionnels seniors en activité',
                  'Exercices pratiques en conditions réalistes',
                  'Suivi administratif et vérification en ligne',
                ]
              : [
                  'Certificat officiel reconnu et vérifiable en ligne',
                  'Instructeurs certifiés capitaines et chefs mécaniciens',
                  'Conforme aux normes STCW 2010 et conventions OMI',
                  'Accès permanent aux modules e-learning',
                ]
            ).map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white dark:bg-[#112240] p-4 rounded-xl border border-sky-100 dark:border-sky-950 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-800 dark:text-slate-200 text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>

          {/* Boîte d'inscription */}
          <div className="p-6 sm:p-8 rounded-2xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-[#112240] shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950 text-[#1b64b8] dark:text-sky-300 flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-800">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Suivre cette formation</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                  {course.price_usd != null ? (
                    <>
                      Tarif officiel :{' '}
                      <strong className="text-[#1b64b8] dark:text-sky-300 font-bold">{formatUsd(course.price_usd)}</strong>.{' '}
                    </>
                  ) : (
                    'Tarif confirmé par notre équipe. '
                  )}
                  Acompte de {depositLabel} à la réservation, solde après formation.
                </p>
              </div>
            </div>
            <Link
              to={`/register?course=${course.id}`}
              className="btn-primary whitespace-nowrap shadow-md hover:shadow-lg"
            >
              <GraduationCap className="w-4 h-4" />
              S'inscrire
            </Link>
          </div>

          {/* Boîte de vérification */}
          <div className="p-6 sm:p-8 rounded-2xl bg-sky-50 dark:bg-[#0c1f38] border border-sky-200/80 dark:border-sky-950 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#112240] text-[#1b64b8] dark:text-sky-300 flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-900">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Déjà certifié ?</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">
                  Consultez l'authenticité de vos certificats sur notre portail officiel de vérification.
                </p>
              </div>
            </div>
            <Link
              to="/verification"
              className="btn-royal whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4" />
              Portail de vérification
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
