import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Award, Users, Waves, BookOpen, ShieldCheck } from 'lucide-react';
import { SITE } from '@/config/site';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#1b64b8] text-white">
      {/* Background maritime photography softly blended into the royal blue brand */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/28656388/pexels-photo-28656388.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920')",
        }}
      />
      {/* Royal blue brand gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#12498b] via-[#1b64b8]/90 to-[#2272cd]/85 pointer-events-none" />

      <div className="container-app relative z-10 pt-28 pb-20 md:pt-36 md:pb-24">
        <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            {SITE.name} · Authorized Training Center
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight drop-shadow-sm">
            Cours STCW tel que modifié
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-sky-100 leading-relaxed max-w-2xl font-normal">
            Programmes de formation maritime structurés pour répondre à vos besoins spécifiques.
            Conforme aux normes internationales de l'OMI et aux amendements de Manille 2010.
          </p>

          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-transparent text-white font-bold border-2 border-white/90 hover:bg-white hover:text-[#1b64b8] shadow-sm transition-all active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              Vérifiez Nos Cours
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#dfa716] text-slate-950 font-bold shadow-md hover:bg-[#ebd06c] hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Inscrivez-vous aujourd'hui
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl border-t border-white/20 pt-6">
            {[
              { icon: Award, value: '50+', label: 'Cours certifiés' },
              { icon: Users, value: '2,000+', label: 'Diplômés certifiés' },
              { icon: Globe, value: '40+', label: 'Nationalités' },
              { icon: Waves, value: '1998', label: 'Fondé à Panama' },
            ].map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <stat.icon className="w-5 h-5 text-amber-300 mb-1.5 mx-auto md:mx-0" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-sky-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
