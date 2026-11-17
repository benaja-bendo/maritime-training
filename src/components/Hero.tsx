import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Award, Users, Waves, BookOpen } from 'lucide-react';
import { SITE } from '@/config/site';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[92vh] flex items-center overflow-hidden bg-slate-900">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/28656388/pexels-photo-28656388.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920')",
        }}
      />
      {/* Atmospheric gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-900/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

      {/* Decorative wave transitioning into the light body below */}
      <svg
        className="absolute bottom-0 inset-x-0 w-full text-slate-50 translate-y-1"
        viewBox="0 0 1440 220"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,128L48,138.7C96,149,192,171,288,170.7C384,171,480,149,576,128C672,107,768,85,864,96C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,220L0,220Z"
        />
      </svg>

      <div className="container-app relative z-10 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-[#e1b936] text-xs font-bold uppercase tracking-[0.2em] mb-6">
            <span className="gold-rule" />
            {SITE.name}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-semibold text-white leading-[1.02] tracking-tight max-w-4xl drop-shadow-md">
            Advance Your<br />
            <span className="text-[#fbf4ea]">Maritime Career</span>
          </h1>

          <p className="mt-7 text-lg sm:text-xl text-slate-100 leading-relaxed max-w-2xl drop-shadow">
            Maritime training school in Panama: IMO-compliant programmes for merchant
            navy officers, cadets and seafarers — online and in person.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary">
              Register online
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/20 backdrop-blur-md text-white font-semibold border border-white/30 transition-all hover:bg-white/30 active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              Browse courses
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl border-t border-white/20 pt-6">
            {[
              { icon: Award, value: '50+', label: 'Courses' },
              { icon: Users, value: '2,000', label: 'Graduates' },
              { icon: Globe, value: '40+', label: 'Nationalities' },
              { icon: Waves, value: '2014', label: 'Year founded' },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <stat.icon className="w-5 h-5 text-[#e1b936] mb-2 mx-auto sm:mx-0" />
                <div className="text-2xl font-bold text-white drop-shadow">{stat.value}</div>
                <div className="text-sm text-slate-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
