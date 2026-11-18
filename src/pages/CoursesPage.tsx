import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '@/lib/data';
import { formatUsd } from '@/lib/pricing';
import { formatDays, formatHours } from '@/lib/format';
import type { Course } from '@/types';
import {
  Search,
  Clock,
  Calendar,
  Filter,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const CATEGORY_ORDER = [
  'Basic Safety',
  'Medical',
  'Navigation',
  'Security',
  'Tanker',
  'Ratings',
  'Officer Upgrading',
  'Survival',
  'Resource Management',
  'Communications',
  'Cargo',
  'Fire Fighting',
  'Simulator',
  'Instructor',
  'Catering',
  'Environment',
  'Leadership',
  'Crowd & Crisis',
  'Yacht',
  'HSE Management',
  'Offshore',
  'Specialised Operations',
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => {
    const present = new Set(courses.map((c) => c.category));
    const known = CATEGORY_ORDER.filter((c) => present.has(c));
    const others = [...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
    return ['All', ...known, ...others];
  }, [courses]);

  useEffect(() => {
    (async () => {
      try {
        setCourses(await getCourses());
      } catch {
        setCourses([]);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.imo_number ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || c.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [courses, search, category]);

  return (
    <div className="pt-16 md:pt-20">
      {/* Header Banner Bleu Royal */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-[#1b64b8] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/14367433/pexels-photo-14367433.jpeg?auto=compress&cs=tinysrgb&h=800&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#124b8f] via-[#1b64b8] to-[#206fcc] pointer-events-none" />

        <div className="container-app relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            STCW Manila Amendments · Cours Certifiés OMI / AMP
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white">
            Catalogue des Cours Maritimes
          </h1>
          <p className="mt-4 text-sky-100 max-w-2xl text-lg font-normal">
            Plus de 50 formations STCW et MLC : de la sécurité de base aux compétences d'officiers supérieurs,
            disponibles en présentiel et sur notre plateforme e-learning 24/7.
          </p>
        </div>
      </section>

      {/* Liste des cours */}
      <section className="relative py-12 md:py-16 overflow-hidden bg-slate-50 dark:bg-[#0a192f] transition-colors duration-200">
        <div className="container-app relative z-10">
          {/* Recherche & Filtres */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par intitulé ou numéro OMI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-11 shadow-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#1b64b8] dark:text-sky-400 shrink-0" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field md:w-64 shadow-xs"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'Toutes les catégories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6 text-sm text-slate-600 dark:text-slate-300 font-semibold">
            {loading ? 'Chargement...' : `${filtered.length} ${filtered.length === 1 ? 'formation trouvée' : 'formations trouvées'}`}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="card overflow-hidden flex flex-col group bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 hover:border-[#1b64b8] shadow-sm hover:shadow-md transition-all rounded-xl"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-900">
                    {course.image_url && (
                      <img
                        src={course.image_url}
                        alt={course.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {course.imo_number && (
                        <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur text-white text-xs font-mono font-semibold">
                          IMO {course.imo_number}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-md bg-[#1b64b8] text-white text-xs font-bold shadow-xs">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white leading-snug mb-3 group-hover:text-[#1b64b8] dark:group-hover:text-sky-300 transition-colors text-base">
                      {course.name}
                    </h3>

                    <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400 border-t border-sky-50 dark:border-slate-800">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#1b64b8] dark:text-sky-400" />
                        {course.duration_days != null ? formatDays(course.duration_days) : '—'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#1b64b8] dark:text-sky-400" />
                        {course.duration_hours != null ? formatHours(course.duration_hours) : '—'}
                      </span>
                      {course.price_usd != null && (
                        <span className="ml-auto font-bold text-[#1b64b8] dark:text-sky-300">
                          {formatUsd(course.price_usd)}
                        </span>
                      )}
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-[#1b64b8] dark:text-sky-400 font-bold text-sm group-hover:gap-2.5 transition-all">
                      Détails de la formation
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-[#112240] rounded-xl border border-sky-200 dark:border-sky-900">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="text-base font-medium">Aucun cours ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
