import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse } from '@/lib/data';
import { depositLabel, formatUsd } from '@/lib/pricing';
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
      <div className="pt-16 md:pt-20 min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="pt-16 md:pt-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-white">Formation introuvable</h1>
        <p className="mt-2 text-slate-500">Cette formation n’existe pas ou a été retirée.</p>
        <Link to="/formations" className="btn-primary mt-6">
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero with image */}
      <section className="relative h-[42vh] min-h-[320px] overflow-hidden">
        {course.image_url && (
          <img
            src={course.image_url}
            alt={course.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/40" />
        <div className="container-app relative z-10 h-full flex flex-col justify-end pb-10">
          <Link
            to="/formations"
            className="inline-flex items-center gap-1.5 text-[#e1b936] text-sm font-medium mb-4 hover:text-[#f0cc58] w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Catalogue
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            {course.imo_number && (
              <span className="px-3 py-1 rounded-md bg-[#e1b936] text-[#08182d] text-sm font-mono font-semibold">
                IMO {course.imo_number}
              </span>
            )}
            <span className="px-3 py-1 rounded-md bg-white/15 backdrop-blur text-white text-sm font-semibold">
              {course.category}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white max-w-3xl leading-tight">
            {course.name}
          </h1>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#0b1b30]">
        <div className="container-app max-w-4xl">
          {/* Quick facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Calendar, label: 'Durée', value: course.duration_days != null ? `${course.duration_days} jour${Number(course.duration_days) > 1 ? 's' : ''}` : '—' },
              { icon: Clock, label: 'Heures', value: course.duration_hours != null ? `${course.duration_hours} h` : '—' },
              { icon: Tag, label: 'Catégorie', value: course.category },
            ].map((fact) => (
              <div key={fact.label} className="card p-5 flex items-center gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#e1b936]/10 text-[#e1b936] shrink-0">
                  <fact.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">{fact.label}</div>
                  <div className="font-semibold text-white">{fact.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-white mb-3">Présentation</h2>
            <p className="text-slate-300 leading-relaxed">
              Cette formation est dispensée dans le respect des conventions
              internationales STCW et MLC 2006. Elle combine théorie et pratique
              pour garantir l’acquisition des compétences requises à bord des
              navires marchands. À l’issue du cours, les stagiaires reçoivent un
              certificat officiel enregistré dans notre base de données et
              vérifiable via le portail de vérification.
            </p>
          </div>

          {/* Highlights */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Certificat officiel enregistré et vérifiable en ligne',
              'Formateurs expérimentés du secteur maritime',
              'Théorie et exercices pratiques en conditions réelles',
              'Conforme aux standards STCW et MLC 2006',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-200 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Inscription */}
          <div className="mt-10 p-6 sm:p-8 rounded-2xl border border-[#e1b936]/40 bg-[#102641] text-white flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <GraduationCap className="w-8 h-8 text-[#e1b936] shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Suivre cette formation en ligne</h3>
                <p className="text-slate-300 text-sm mt-0.5">
                  {course.price_usd != null ? (
                    <>
                      Tarif :{' '}
                      <strong className="text-[#e1b936]">{formatUsd(course.price_usd)}</strong>.{' '}
                    </>
                  ) : (
                    'Tarif à confirmer par notre équipe. '
                  )}
                  Avance de {depositLabel} à l’inscription, solde à régler après la formation.
                </p>
              </div>
            </div>
            <Link
              to={`/inscription?cours=${course.id}`}
              className="btn-primary whitespace-nowrap"
            >
              <GraduationCap className="w-4 h-4" />
              S’inscrire
            </Link>
          </div>

          {/* CTA */}
          <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-[#172f4e] text-white flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-[#e1b936] shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Déjà inscrit ?</h3>
                <p className="text-slate-300 text-sm mt-0.5">
                  Vérifiez vos certificats dans le portail de vérification.
                </p>
              </div>
            </div>
            <Link
              to="/verification"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#e1b936] text-[#08182d] font-semibold hover:bg-[#f0cc58] transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4" />
              Portail vérification
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
