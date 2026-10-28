import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Award, Users, Waves, BookOpen } from 'lucide-react';
import { SITE } from '@/config/site';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0b1b30]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/28656388/pexels-photo-28656388.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')" }}
      />
      <div className="absolute inset-0 bg-[#08182d]/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#08182d] via-[#08182d]/75 to-[#08182d]/30" />
      {/* Decorative wave lines */}
      <svg
        className="absolute bottom-0 inset-x-0 w-full text-[#27466a]/40"
        viewBox="0 0 1440 320"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,160L48,170.7C96,181,192,203,288,202.7C384,203,480,181,576,160C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L0,320Z"
        />
      </svg>

      <div className="container-app relative z-10 pt-20 md:pt-28">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-[#e1b936] text-xs font-bold uppercase tracking-[0.18em] mb-6">
            <span className="gold-rule" />
            {SITE.name}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-semibold text-white leading-[0.98] tracking-tight max-w-4xl">
            Advance Your<br />
            <span className="text-[#f7f1e8]">Maritime Career</span>
          </h1>

          <p className="mt-7 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl">
            École de formation maritime du Panama : programmes conformes aux standards
            IMO pour officiers de la marine marchande, cadets et gens de mer — à
            distance et en présentiel.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/inscription" className="btn-primary">
              S’inscrire en ligne
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/formations"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/10 backdrop-blur text-white font-semibold border border-white/20 transition-all hover:bg-white/15 active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              Parcourir les formations
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl border-t border-[#6b7c91]/40 pt-6">
            {[
              { icon: Award, value: '50+', label: 'Formations' },
              { icon: Users, value: '2 000', label: 'Diplômés' },
              { icon: Globe, value: '40+', label: 'Nationalités' },
              { icon: Waves, value: '2014', label: 'Année de fondation' },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <stat.icon className="w-5 h-5 text-[#e1b936] mb-2 mx-auto sm:mx-0" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
