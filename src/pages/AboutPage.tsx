import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Target,
  Globe,
  ShieldCheck,
  Award,
  Compass,
  Cog,
  Flame,
  LifeBuoy,
  MonitorPlay,
  Stethoscope,
  ArrowRight,
  GraduationCap,
  MessageCircle,
  Anchor,
} from 'lucide-react';
import { SITE } from '@/config/site';

const VALUES = [
  {
    icon: Target,
    title: 'Rigueur & Conformité',
    text: 'Chaque programme respecte ou dépasse les exigences de l’OMI, de la convention STCW (amendements de Manille 2010) et de l’AMP.',
  },
  {
    icon: Globe,
    title: 'Accessibilité Mondiale',
    text: 'Formations en présentiel à Panama et plateforme e-learning 24/7 permettant aux gens de mer d’étudier selon leur rythme et leurs embarquements.',
  },
  {
    icon: ShieldCheck,
    title: 'Certification Authentique',
    text: 'Certificats officiels enregistrés dans notre base de données nationale et vérifiables instantanément en ligne via le portail officiel.',
  },
  {
    icon: Award,
    title: 'Excellence Pédagogique',
    text: 'Instructeurs professionnels en activité ou capitaines seniors cumulant des décennies d’expérience réelle à la mer.',
  },
];

const TIMELINE = [
  { year: '1998', text: 'Fondation à Panama City par une équipe d’officiers de marine marchande expérimentés' },
  { year: '2005', text: 'Obtention de l’accréditation officielle de l’Autorité maritime du Panama (AMP) en tant qu’Authorized Training Center' },
  { year: '2010', text: 'Mise en conformité complète avec les amendements de Manille de la convention STCW' },
  { year: '2015', text: 'Certification internationale de gestion de la qualité ISO 9001:2015 (Global Group / UKAS 5965)' },
  { year: '2020', text: 'Déploiement de la plateforme e-learning avec accès permanent et simulateurs de navigation 360°' },
  { year: '2026', text: 'Plus de 2 000 officiers et marins certifiés à travers plus de 40 nationalités à l’international' },
];

const INSTRUCTORS = [
  {
    initials: 'AM',
    name: 'Capt. Alejandro Morales',
    role: 'Directeur de la formation — Pont',
    credentials: 'Master Mariner (Illimité), 22 ans de navigation',
    bio: 'Le capitaine Morales est titulaire d’un brevet de capitaine au long cours illimité. Il supervise les programmes d’officiers de pont et la formation sur simulateur de passerelle.',
  },
  {
    initials: 'RV',
    name: 'Chief Eng. Ricardo Vásquez',
    role: 'Directeur de la formation — Machine',
    credentials: 'Chef mécanicien (Illimité), 18 ans en mer',
    bio: 'Le chef Vásquez cumule 18 années d’expérience sur pétroliers et porte-conteneurs. Il dirige l’ensemble des programmes machine et simulateurs de propulsion.',
  },
  {
    initials: 'MF',
    name: 'Dr. María Fernández',
    role: 'Responsable formation médicale & secours',
    credentials: 'MD, médecin maritime, instructrice STCW',
    bio: 'Le Dr Fernández associe son doctorat en médecine à une spécialisation de santé maritime pour diriger les formations de soins médicaux d’urgence et de premiers secours en mer.',
  },
  {
    initials: 'JD',
    name: 'Capt. Jean-Pierre Dubois',
    role: 'Instructeur principal — Offshore & Survie',
    credentials: 'Capitaine, Évaluateur OPITO, 15 ans offshore',
    bio: 'Le capitaine Dubois apporte 15 années d’expertise sur plates-formes pétrolières offshore et dirige les exercices de survie en mer et de lutte contre l’incendie.',
  },
];

const FACILITIES = [
  {
    icon: Compass,
    title: 'Simulateur de passerelle 360°',
    text: 'Simulateur complet de passerelle avec visuel panoramique 360°, radar, ARPA, ECDIS et SMDSM capable de reproduire tout type de navire et conditions météo.',
  },
  {
    icon: Cog,
    title: 'Simulateur salle des machines',
    text: 'Simulateur haute fidélité pour systèmes de propulsion diesel, vapeur et turbine à gaz – utilisé pour la gestion des ressources machine OMI 2.07.',
  },
  {
    icon: Flame,
    title: 'Terrain d’exercices incendie',
    text: 'Zone d’entraînement extérieure avec feux réels, systèmes à mousse et appareils respiratoires autonomes pour la lutte avancée contre l’incendie OMI 2.03.',
  },
  {
    icon: LifeBuoy,
    title: 'Bassin de survie & sauvetage',
    text: 'Bassin intérieur chauffé pour manœuvres pratiques d’embarcations de sauvetage, radeaux et combinaisons d’immersion (OMI 1.19, 1.23).',
  },
  {
    icon: MonitorPlay,
    title: 'Plateforme e-learning 24/7',
    text: 'Plateforme en ligne sécurisée permettant l’étude théorique à distance avec accès à vie pour tous les marins inscrits.',
  },
  {
    icon: Stethoscope,
    title: 'Salle de formation médicale',
    text: 'Équipée de mannequins de réanimation avancés, défibrillateurs et matériel de traumatologie pour les cours de premiers secours maritimes.',
  },
];

const ACCREDITATIONS = [
  { code: 'AMP', name: 'Autoridad Marítima de Panamá', desc: 'Authorized Training Center' },
  { code: 'IMO', name: 'Organisation Maritime Internationale', desc: 'Normes mondiales STCW' },
  { code: 'ISO 9001', name: 'Global Group · UKAS 5965', desc: 'Certification qualité ISO 9001:2015' },
  { code: 'STCW', name: 'Convention STCW 2010', desc: 'Amendements de Manille' },
];

function SectionHead({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl mb-12">
      <span className="section-label">{label}</span>
      <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{title}</h2>
      {children && <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{children}</p>}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="pt-16 md:pt-20">
      {/* Banner Bleu Royal */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-[#1b64b8] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/7971328/pexels-photo-7971328.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#124b8f] via-[#1b64b8] to-[#206fcc] pointer-events-none" />

        <div className="container-app relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
            <Anchor className="w-3.5 h-3.5 text-amber-300" />
            Depuis 1998 · Authorized Training Center
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white max-w-3xl">
            À propos de {SITE.name}
          </h1>
          <p className="mt-4 text-sky-100 max-w-3xl text-lg leading-relaxed font-normal">
            Compagnie de formation maritime autorisée par l'Autorité maritime du Panama (AMP)
            et certifiée ISO 9001:2015. Plus de 25 ans au service de la formation des gens de mer
            à travers le monde.
          </p>
        </div>
      </section>

      {/* Mission et valeurs */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-white dark:bg-[#0a192f] transition-colors duration-200">
        <div className="container-app grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <span className="section-label">Notre vocation</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Une formation d'excellence accessible partout
            </h2>
            <p className="mt-5 text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              Fondée en 1998, {SITE.name} a pour mission d'offrir aux officiers, cadets et marins
              des programmes de formation rigoureux répondant aux normes internationales les plus exigeantes.
              Grâce à notre formule hybride combinant e-learning moderne et sessions pratiques à Panama,
              chaque marin peut progresser sans interrompre sa carrière en mer.
            </p>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="card p-6 bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-sm hover:shadow-md rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-[#1b64b8] dark:text-sky-300 mb-4">
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Histoire et frise */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-slate-50 dark:bg-[#0c1f38] border-y border-sky-100 dark:border-sky-950 transition-colors duration-200">
        <div className="container-app grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="section-label">Notre histoire</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              25 ans d'engagement maritime
            </h2>
            <p className="mt-5 text-slate-600 dark:text-slate-300 leading-relaxed">
              Créée en 1998 par des officiers de la marine marchande, {SITE.name} s’est développée
              pour devenir l'un des centres de formation maritime les plus reconnus d'Amérique latine,
              accrédité par l'Autorité Maritime du Panama (AMP) et audité sous la norme ISO 9001:2015.
            </p>
            <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              Aujourd'hui, nos diplômés naviguent sur les plus grandes flottes internationales :
              porte-conteneurs, pétroliers, navires de servitude offshore et navires de passagers.
            </p>
          </div>

          <ol className="relative border-l-2 border-sky-200 dark:border-sky-800 ml-3 space-y-8">
            {TIMELINE.map((t) => (
              <li key={t.year} className="pl-8 relative">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#1b64b8] ring-4 ring-white dark:ring-[#0c1f38] shadow-sm" />
                <div className="text-xl font-bold text-[#1b64b8] dark:text-sky-300 tabular-nums">{t.year}</div>
                <p className="mt-1 text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Instructeurs */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-white dark:bg-[#0a192f] transition-colors duration-200">
        <div className="container-app">
          <SectionHead label="Notre équipe" title="Nos instructeurs maritimes">
            Tous les instructeurs de PMTS sont des officiers supérieurs brevetés ayant une longue expérience
            du commandement en mer.
          </SectionHead>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INSTRUCTORS.map((p) => (
              <article key={p.name} className="card p-6 sm:p-7 flex gap-5 bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-sm hover:shadow-md rounded-xl">
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-sky-50 dark:bg-sky-950 text-[#1b64b8] dark:text-sky-300 font-bold text-lg shrink-0 shadow-inner border border-sky-200 dark:border-sky-800"
                >
                  {p.initials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3>
                  <p className="text-sm text-[#1b64b8] dark:text-sky-300 font-semibold mt-0.5">{p.role}</p>
                  <p className="mt-2 inline-block text-xs font-semibold text-slate-700 dark:text-slate-200 bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 rounded-md px-2.5 py-1">
                    {p.credentials}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{p.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Installations */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-slate-50 dark:bg-[#0c1f38] border-y border-sky-100 dark:border-sky-950 transition-colors duration-200">
        <div className="container-app">
          <SectionHead label="Panama City" title="Nos installations d'entraînement">
            Notre centre de formation est doté de simulateurs de dernière génération et d'aires d'exercices pratiques.
          </SectionHead>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FACILITIES.map((f) => (
              <div key={f.title} className="card p-6 bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-sm hover:shadow-md rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-[#1b64b8] dark:text-sky-300 mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accréditations */}
      <section className="relative py-14 overflow-hidden bg-white dark:bg-[#0a192f] transition-colors duration-200">
        <div className="container-app">
          <h2 className="text-center section-label">Accréditations officielles</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ACCREDITATIONS.map((a) => (
              <div key={a.code} className="text-center px-4 py-5 bg-white dark:bg-[#112240] border border-sky-200 dark:border-sky-900/70 rounded-xl shadow-xs">
                <div className="text-2xl font-bold tracking-widest text-[#1b64b8] dark:text-sky-400">{a.code}</div>
                <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{a.name}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="relative py-16 md:py-20 overflow-hidden bg-gradient-to-r from-sky-50 via-white to-sky-50 dark:from-[#0c1f38] dark:via-[#0a192f] dark:to-[#0c1f38] border-t border-sky-100 dark:border-sky-950 transition-colors duration-200">
        <div className="container-app text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Prêt à faire évoluer votre carrière maritime ?
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-lg">
            Choisissez vos formations et inscrivez-vous en ligne, ou contactez notre équipe pour toute question.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary">
              <GraduationCap className="w-4 h-4" />
              S'inscrire en ligne
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="btn-secondary">
              <MessageCircle className="w-4 h-4" />
              Contactez-nous
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
