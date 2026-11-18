import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Search,
  BookOpen,
  GraduationCap,
  ChevronDown,
  CheckCircle2,
  Anchor,
  Globe2,
} from 'lucide-react';
import Hero from '@/components/Hero';

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const advantages = [
    {
      title: 'Plusieurs lieux à travers le monde',
      desc: 'Des sessions en présentiel à Panama City et un réseau de centres partenaires internationaux pour faciliter vos formations pratiques et vos certifications.',
    },
    {
      title: 'Entraînement personnel à votre convenance',
      desc: 'Formations adaptées aux plannings d’embarquement et de relève des marins. Possibilité de suivre la théorie en ligne à votre propre rythme.',
    },
    {
      title: 'Disponibilité immédiate du cours',
      desc: 'Inscriptions ouvertes en continu avec accès direct aux modules e-learning dès la validation de votre pré-inscription.',
    },
    {
      title: 'Accès à vie au matériel en ligne',
      desc: 'Tous nos diplômés conservent un accès permanent aux supports de cours mis à jour selon les dernières réglementations maritimes.',
    },
    {
      title: 'Approuvé par l’Autorité maritime du Panama',
      desc: 'Nos cours et certifications sont officiellement approuvés par la Dirección General de la Gente de Mar (AMP) et respectent scrupuleusement la convention STCW.',
    },
  ];

  return (
    <>
      <Hero />

      {/* SECTION 1 : Les 3 piliers officiels (exactement comme dans l'image 2) */}
      <section className="relative py-16 md:py-24 bg-white dark:bg-[#0a192f] transition-colors duration-200">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pilier 1 : STCW Manila Amendments */}
            <div className="card p-6 flex flex-col bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-sm hover:shadow-md transition-all rounded-xl">
              <div className="relative h-56 rounded-lg overflow-hidden mb-6 bg-slate-900">
                <img
                  src="https://images.pexels.com/photos/14844017/pexels-photo-14844017.jpeg?auto=compress&cs=tinysrgb&h=800&w=1200"
                  alt="STCW Manila Amendments"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4a154b]/80 via-transparent to-transparent flex items-end p-4">
                  <span className="px-3 py-1 rounded bg-fuchsia-900 text-white text-xs font-bold uppercase tracking-wider">
                    STCW 2010 Manila Amendments
                  </span>
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed flex-1">
                <strong className="text-slate-900 dark:text-white block font-bold mb-1">
                  Panama Maritime Training
                </strong>
                offre tous les cours de STCW tels que modifiés par l'OMI à Manille, afin d'assurer
                aux gens de mer les connaissances les plus récentes en matière de meilleures pratiques
                et techniques maritimes.
              </p>
            </div>

            {/* Pilier 2 : En classe & En ligne */}
            <div className="card p-6 flex flex-col bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-sm hover:shadow-md transition-all rounded-xl">
              <div className="relative h-56 rounded-lg overflow-hidden mb-6 bg-slate-900">
                <img
                  src="https://images.pexels.com/photos/16420237/pexels-photo-16420237.jpeg?auto=compress&cs=tinysrgb&h=800&w=1200"
                  alt="Plateforme maritime"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b64b8]/80 via-transparent to-transparent flex items-end p-4">
                  <span className="px-3 py-1 rounded bg-[#1b64b8] text-white text-xs font-bold uppercase tracking-wider">
                    Environnement mixte & e-learning
                  </span>
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed flex-1">
                <strong className="text-slate-900 dark:text-white block font-bold mb-1">
                  Accès à vie au matériel
                </strong>
                Panama Maritime Training offre tous les cours dans un environnement de classe moderne,
                ainsi que l'accès à vie à la plate-forme de formation en ligne, afin que les gens de mer
                puissent accéder à leurs cours n'importe où et à tout moment.
              </p>
            </div>

            {/* Pilier 3 : Certification ISO 9001 & Accréditation AMP */}
            <div className="card p-6 flex flex-col bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-sm hover:shadow-md transition-all rounded-xl">
              <div className="h-56 rounded-lg border-2 border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/30 flex flex-col items-center justify-center p-6 mb-6 text-center">
                <div className="font-extrabold text-2xl tracking-widest text-[#1b64b8] dark:text-sky-400">
                  GCL INTERNATIONAL
                </div>
                <div className="font-bold text-sm tracking-wide text-slate-800 dark:text-slate-200 mt-1">
                  ISO 9001:2015 · UKAS 5965
                </div>
                <div className="text-xs font-mono text-slate-500 mt-2 bg-white dark:bg-[#0a192f] px-2.5 py-1 rounded border border-sky-100 dark:border-sky-900">
                  Certificat n° 82Q17841
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed flex-1">
                <strong className="text-slate-900 dark:text-white block font-bold mb-1">
                  Agrément officiel & Qualité garantie
                </strong>
                La formation maritime de Panama est certifiée par Global Group selon la norme
                ISO 9001-2015 et est soutenue par l'Autorité maritime du Panama (AMP) et d'autres
                administrations pour la formation maritime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 : Avantages clés & Accordéon (comme dans l'image 2 & 3) */}
      <section className="relative py-16 md:py-20 bg-slate-50 dark:bg-[#0c1f38] border-y border-sky-100 dark:border-sky-950 transition-colors duration-200">
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <span className="section-label">Pourquoi choisir PMTS</span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 mb-8">
                Des formations flexibles conçues pour les gens de mer
              </h2>

              <div className="space-y-3">
                {advantages.map((item, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div
                      key={item.title}
                      className="border border-sky-200/80 dark:border-sky-900/80 rounded-xl bg-white dark:bg-[#112240] overflow-hidden shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-4.5 text-left font-bold text-slate-900 dark:text-white hover:text-[#1b64b8] transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#1b64b8] shrink-0" />
                          {item.title}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#1b64b8] transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-sky-50 dark:border-sky-950 pt-3">
                          {item.desc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logo officiel Authorized Training Center (comme dans l'image 2 & 3) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-[#112240] rounded-2xl border border-sky-200 dark:border-sky-900 shadow-sm">
              <div className="w-24 h-24 rounded-full bg-sky-50 dark:bg-sky-950/80 border-2 border-sky-200 dark:border-sky-800 flex items-center justify-center text-[#1b64b8] dark:text-sky-300 mb-4 shadow-inner">
                <Anchor className="w-12 h-12" />
              </div>
              <span className="text-xs uppercase tracking-widest text-[#1b64b8] dark:text-sky-400 font-bold block mb-1">
                Autoridad Marítima de Panamá
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Authorized Training Center
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs">
                Centre de formation maritime officiel certifié STCW et approuvé pour la délivrance des certificats maritimes internationaux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 : Services rapides & Catalogue */}
      <section className="relative py-16 md:py-24 bg-white dark:bg-[#0a192f] transition-colors duration-200">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-label">Nos modules</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Catalogue de cours & Inscriptions en ligne
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-lg">
              Explorez plus de 50 formations conformes aux exigences OMI / STCW.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                to: '/courses',
                title: 'Catalogue des cours',
                desc: 'Plus de 50 formations STCW et MLC, de la sécurité de base aux grades d’officiers.',
                cta: 'Voir les cours',
              },
              {
                icon: GraduationCap,
                to: '/register',
                title: 'Inscription en ligne',
                desc: 'Choisissez vos modules, consultez les tarifs officiels et finalisez votre inscription.',
                cta: 'S’inscrire',
              },
              {
                icon: ShieldCheck,
                to: '/verification',
                title: 'Vérification de documents',
                desc: 'Vérifiez l’authenticité d’un certificat officiel par son numéro ou document d’identité.',
                cta: 'Vérifier un certificat',
              },
              {
                icon: Globe2,
                to: '/volunteers',
                title: 'Devenir instructeur',
                desc: 'Partagez votre expertise maritime en rejoignant notre équipe d’instructeurs qualifiés.',
                cta: 'Postuler',
              },
            ].map((card) => (
              <Link
                key={card.to}
                to={card.to}
                className="card p-7 flex flex-col group hover:-translate-y-1 bg-white dark:bg-[#112240] border border-sky-200 dark:border-sky-900/70 hover:border-[#1b64b8] shadow-sm hover:shadow-md transition-all rounded-xl"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-[#1b64b8] dark:text-sky-300 mb-5 group-hover:bg-[#1b64b8] group-hover:text-white transition-all">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">{card.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[#1b64b8] dark:text-sky-400 font-bold text-sm group-hover:gap-2.5 transition-all">
                  {card.cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 : Portail de vérification officiel (CTA) */}
      <section className="relative py-16 md:py-24 bg-gradient-to-r from-sky-50 via-white to-sky-50 dark:from-[#0c1f38] dark:via-[#0a192f] dark:to-[#0c1f38] border-t border-sky-100 dark:border-sky-950 transition-colors duration-200">
        <div className="container-app text-center max-w-2xl mx-auto">
          <span className="section-label">Portail Officiel</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Vérifiez l’authenticité d’un certificat en ligne
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            Consultez instantanément les formations suivies par un étudiant et le statut de ses certificats
            (valide ou expiré) grâce à son numéro de certificat, carte d’identité ou passeport.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/verification" className="btn-royal">
              <Search className="w-4 h-4" />
              Accéder au portail de vérification
            </Link>
            <Link to="/courses" className="btn-secondary">
              <BookOpen className="w-4 h-4" />
              Consulter les cours
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
