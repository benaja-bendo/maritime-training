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

// Ordre habituel des catégories ; celles que l'administration crée viennent ensuite.
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
      {/* Page header with background banner */}
      <section className="relative py-16 md:py-20 overflow-hidden bg-white border-b border-slate-200">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/14367433/pexels-photo-14367433.jpeg?auto=compress&cs=tinysrgb&h=800&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-sky-50/80 pointer-events-none" />

        <div className="container-app relative z-10">
          <span className="section-label">Catalogue</span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-semibold text-slate-900">
            Our Maritime Courses
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl text-lg">
            Over 50 courses: STCW and MLC training, from the basic certificate to
            chief officer level, plus offshore and specialised courses.
          </p>
        </div>
      </section>

      {/* Course list with subtle maritime texture */}
      <section className="relative py-12 md:py-16 overflow-hidden bg-slate-50">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/35757999/pexels-photo-35757999.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1800')",
          }}
        />
        <div className="absolute inset-0 bg-slate-50/93 pointer-events-none" />

        <div className="container-app relative z-10">
          {/* Search + filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or IMO number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-11 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500 shrink-0" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field md:w-60 shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6 text-sm text-slate-600 font-medium">
            {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'course' : 'courses'} found`}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="card overflow-hidden flex flex-col group bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/60 transition-all rounded-xl"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
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
                        <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur text-white text-xs font-mono font-semibold">
                          IMO {course.imo_number}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-md bg-[#e1b936] text-[#08182d] text-xs font-bold shadow-sm">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-slate-900 leading-snug mb-3 group-hover:text-amber-600 transition-colors text-base">
                      {course.name}
                    </h3>

                    <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {course.duration_days != null ? formatDays(course.duration_days) : '—'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {course.duration_hours != null ? formatHours(course.duration_hours) : '—'}
                      </span>
                      {course.price_usd != null && (
                        <span className="ml-auto font-bold text-amber-700">
                          {formatUsd(course.price_usd)}
                        </span>
                      )}
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-amber-600 font-semibold text-sm group-hover:gap-2.5 transition-all">
                      Details
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="text-base font-medium">No course matches your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
