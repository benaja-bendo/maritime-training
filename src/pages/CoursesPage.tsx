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
} from 'lucide-react';

const CATEGORIES = [
  'Toutes',
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
  'Offshore',
  'Specialised Operations',
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes');

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
      const matchesCategory = category === 'Toutes' || c.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [courses, search, category]);

  return (
    <div className="pt-16 md:pt-20">
      {/* Page header */}
      <section className="bg-[#172f4e] py-16 md:py-20 border-b border-[#294769]">
        <div className="container-app">
          <span className="text-[#e1b936] text-sm font-semibold uppercase tracking-wider">
            Catalogue
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-semibold text-white">
            Nos Formations Maritimes
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl text-lg">
            Plus de 50 cours : formations STCW et MLC, du certificat de base à la
            formation d’officier chef, et formations offshore et spécialisées.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#0b1b30]">
        <div className="container-app">
          {/* Search + filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou numéro IMO…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-11"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400 shrink-0" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field md:w-56"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'Toutes' ? 'Toutes les catégories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6 text-sm text-slate-500">
            {loading ? 'Chargement…' : `${filtered.length} formation(s) trouvée(s)`}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => (
                <Link
                  key={course.id}
                  to={`/formations/${course.id}`}
                  className="card overflow-hidden flex flex-col group"
                >
                  <div className="relative h-44 overflow-hidden bg-[#102641]">
                    {course.image_url && (
                      <img
                        src={course.image_url}
                        alt={course.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {course.imo_number && (
                        <span className="px-2.5 py-1 rounded-md bg-slate-900/70 backdrop-blur text-white text-xs font-mono font-semibold">
                          IMO {course.imo_number}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-md bg-[#e1b936]/90 backdrop-blur text-white text-xs font-semibold">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-white leading-snug mb-3 group-hover:text-[#e1b936] transition-colors">
                      {course.name}
                    </h3>

                    <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {course.duration_days != null ? formatDays(course.duration_days) : '—'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {course.duration_hours != null ? formatHours(course.duration_hours) : '—'}
                      </span>
                      {course.price_usd != null && (
                        <span className="ml-auto font-semibold text-[#e1b936]">
                          {formatUsd(course.price_usd)}
                        </span>
                      )}
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-[#e1b936] font-semibold text-sm group-hover:gap-2.5 transition-all">
                      Détails
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Aucune formation ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
