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
      <div className="pt-16 md:pt-20 min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="pt-16 md:pt-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-slate-50">
        <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Course not found</h1>
        <p className="mt-2 text-slate-600">This course does not exist or has been withdrawn.</p>
        <Link to="/courses" className="btn-primary mt-6">
          <ArrowLeft className="w-4 h-4" />
          Back to the catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero with image */}
      <section className="relative h-[44vh] min-h-[340px] overflow-hidden bg-slate-900">
        {course.image_url && (
          <img
            src={course.image_url}
            alt={course.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40" />
        <div className="container-app relative z-10 h-full flex flex-col justify-end pb-10">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-[#e1b936] text-sm font-semibold mb-4 hover:text-[#ebd06c] w-fit drop-shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            Catalogue
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            {course.imo_number && (
              <span className="px-3 py-1 rounded-md bg-[#e1b936] text-[#08182d] text-sm font-mono font-bold shadow">
                IMO {course.imo_number}
              </span>
            )}
            <span className="px-3 py-1 rounded-md bg-white/20 backdrop-blur-md text-white text-sm font-semibold border border-white/20">
              {course.category}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white max-w-3xl leading-tight drop-shadow-md">
            {course.name}
          </h1>
        </div>
      </section>

      {/* Main Content Section with Maritime Background */}
      <section className="relative py-12 md:py-16 overflow-hidden bg-slate-50">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/38602132/pexels-photo-38602132.jpeg?auto=compress&cs=tinysrgb&h=1000&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-slate-50/93 pointer-events-none" />

        <div className="container-app relative z-10 max-w-4xl">
          {/* Quick facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              {
                icon: Calendar,
                label: 'Duration',
                value: course.duration_days != null ? formatDays(course.duration_days) : '—',
              },
              {
                icon: Clock,
                label: 'Hours',
                value: course.duration_hours != null ? formatHours(course.duration_hours) : '—',
              },
              { icon: Tag, label: 'Category', value: course.category },
            ].map((fact) => (
              <div key={fact.label} className="card p-5 flex items-center gap-4 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <fact.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{fact.label}</div>
                  <div className="font-bold text-slate-900 mt-0.5">{fact.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Overview</h2>
            {course.framework === 'industry' ? (
              <p className="text-slate-600 leading-relaxed text-base">
                This course is aimed at offshore and specialised operations roles. The
                programme, duration, price and reference body for the course, as well
                as how the certificate is issued, are confirmed by our team before you
                register.
              </p>
            ) : (
              <p className="text-slate-600 leading-relaxed text-base">
                This course is delivered in line with the international STCW and MLC
                2006 conventions. It combines theory and practice to ensure trainees
                acquire the skills required on board merchant ships. On completion,
                trainees receive an official certificate recorded in our database and
                verifiable through the verification portal.
              </p>
            )}
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {(course.framework === 'industry'
              ? [
                  'Programme, duration and price confirmed before registration',
                  'Experienced maritime industry instructors',
                  'Theory and practical exercises in realistic conditions',
                  'Online registration and payment tracking',
                ]
              : [
                  'Official certificate, recorded and verifiable online',
                  'Experienced maritime industry instructors',
                  'Theory and practical exercises in realistic conditions',
                  'Compliant with STCW and MLC 2006 standards',
                ]
            ).map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-800 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>

          {/* Inscription Box */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/60 text-slate-900 shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900">Take this course online</h3>
                <p className="text-slate-600 text-sm mt-1">
                  {course.price_usd != null ? (
                    <>
                      Price:{' '}
                      <strong className="text-amber-700 font-bold">{formatUsd(course.price_usd)}</strong>.{' '}
                    </>
                  ) : (
                    'Price to be confirmed by our team. '
                  )}
                  {depositLabel} deposit on registration, balance payable after the course.
                </p>
              </div>
            </div>
            <Link
              to={`/register?course=${course.id}`}
              className="btn-primary whitespace-nowrap shadow-md hover:shadow-lg"
            >
              <GraduationCap className="w-4 h-4" />
              Register
            </Link>
          </div>

          {/* CTA Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Already registered?</h3>
                <p className="text-slate-600 text-sm mt-0.5">
                  Check your certificates in the official verification portal.
                </p>
              </div>
            </div>
            <Link
              to="/verification"
              className="btn-secondary whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4" />
              Verification portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
