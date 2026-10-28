import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Award, Users, Waves, Search, HeartHandshake, BookOpen } from 'lucide-react';
import Hero from '@/components/Hero';

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Features / quick access */}
      <section className="py-20 md:py-28 bg-[#172f4e]">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-label">Nos services</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
              Tout votre parcours maritime en un seul lieu
            </h2>
            <p className="mt-4 text-slate-300">
              Consultez le catalogue, vérifiez vos documents et rejoignez notre réseau
              de volontaires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                to: '/formations',
                title: 'Catalogue de formations',
                desc: 'Plus de 50 cours certifiés STCW et MLC, de la sécurité de base au grade d’officier.',
                cta: 'Voir les formations',
              },
              {
                icon: ShieldCheck,
                to: '/verification',
                title: 'Vérification de documents',
                desc: 'Entrez un identifiant étudiant pour consulter son dossier et ses certificats.',
                cta: 'Vérifier un document',
              },
              {
                icon: HeartHandshake,
                to: '/volontaires',
                title: 'Inscription volontaires',
                desc: 'Partagez votre expérience maritime en devenant instructeur volontaire.',
                cta: 'Devenir volontaire',
              },
            ].map((card) => (
              <Link
                key={card.to}
                to={card.to}
                className="card p-8 flex flex-col group hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0b1b30] text-[#e1b936] mb-5 group-hover:bg-[#e1b936] group-hover:text-[#08182d] transition-colors">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">{card.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[#e1b936] font-semibold text-sm group-hover:gap-2.5 transition-all">
                  {card.cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="py-16 bg-[#08182d] border-y border-[#294769]">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Award, value: '50+', label: 'Formations' },
              { icon: Users, value: '1200+', label: 'Étudiants' },
              { icon: ShieldCheck, value: '100%', label: 'Certifiées' },
              { icon: Waves, value: '15 ans', label: "D'expérience" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 text-[#e1b936] mb-3 mx-auto" />
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#0b1b30] border-t border-[#294769]">
        <div className="container-app text-center max-w-2xl mx-auto">
          <span className="section-label">Portail officiel</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
            Vérifiez un certificat en ligne
          </h2>
          <p className="mt-4 text-slate-300">
            Chaque étudiant possède un identifiant unique. Entrez-le pour accéder
            instantanément à son dossier de formation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/verification" className="btn-primary">
              <Search className="w-4 h-4" />
              Accéder au portail
            </Link>
            <Link to="/formations" className="btn-secondary">
              <BookOpen className="w-4 h-4" />
              Parcourir le catalogue
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
