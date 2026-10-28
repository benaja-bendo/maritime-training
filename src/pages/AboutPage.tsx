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
} from 'lucide-react';
import { SITE } from '@/config/site';

const VALUES = [
  {
    icon: Target,
    title: 'Rigueur',
    text: 'Chaque programme répond ou dépasse les normes IMO, STCW et AMP. Nous ne coupons pas les coins.',
  },
  {
    icon: Globe,
    title: 'Accessibilité',
    text: 'Les formats mixtes et entièrement en ligne permettent aux gens de mer de s’entraîner autour de leurs horaires et de leurs contrats.',
  },
  {
    icon: ShieldCheck,
    title: 'Intégrité',
    text: 'Nos certificats sont gagnés, pas délivrés. Chaque diplômé a fait preuve d’une véritable compétence.',
  },
  {
    icon: Award,
    title: 'Excellence',
    text: 'Nos instructeurs sont des professionnels maritimes actifs ou récemment retraités – et non des théoriciens de la classe.',
  },
];

const TIMELINE = [
  { year: '2014', text: 'Fondée à Panama City par une équipe d’officiers maritimes expérimentés' },
  { year: '2016', text: 'A reçu l’accréditation complète de l’Autoridad Marítima de Panamá (AMP)' },
  {
    year: '2018',
    text: 'Lancement de notre plateforme d’apprentissage en ligne mixte, la première du genre au Panama',
  },
  {
    year: '2020',
    text: 'Élargi à plus de 50 programmes certifiés OMI ; reconnaissance de l’OPITO pour les cours offshore',
  },
  { year: '2022', text: '2 000 diplômés certifiés atteints, dans plus de 40 nationalités' },
  {
    year: '2024',
    text: 'Lancement d’installations avancées de simulateur de pont et de salle des machines à Panama City',
  },
];

const INSTRUCTORS = [
  {
    initials: 'AM',
    name: 'Capt. Alejandro Morales',
    role: 'Directeur de la formation — Deck',
    credentials: 'Master Mariner (Illimité), 22 ans en mer',
    bio: 'Le Capt. Morales détient un certificat Master Mariner illimité et a passé 22 ans en mer sur les vraquiers et les porte-conteneurs avant de rejoindre PMTS. Il dirige tous les programmes d’officiers de pont et la formation de simulateur de pont.',
  },
  {
    initials: 'RV',
    name: 'Chef Eng. Ricardo Vásquez',
    role: 'Directeur de la formation — Moteur',
    credentials: 'Ingénieur en chef (Illimité), 18 ans en mer',
    bio: 'Chef Eng. Vásquez est un ingénieur en chef illimité qualifié avec 18 ans d’expérience dans la salle des machines à travers les pétroliers et les vraquiers. Il supervise tous les programmes d’ingénierie et le simulateur de salle des machines.',
  },
  {
    initials: 'MF',
    name: 'Dr. María Fernández',
    role: 'Responsable de la formation médicale et de sécurité',
    credentials: 'MD, médecin-hygiéniste maritime, instructeur STCW',
    bio: 'Dr. Fernández combine un diplôme de médecine avec une formation médicale maritime spécialisée. Elle dirige tous les programmes de soins médicaux, de premiers soins et de lutte contre les incendies au PMTS.',
  },
  {
    initials: 'JD',
    name: 'Capt. Jean-Pierre Dubois',
    role: 'Instructeur principal — Offshore & Survival',
    credentials: 'Master Mariner, Assesseur OPITO, 15 ans offshore',
    bio: 'Le Capt. Dubois apporte 15 ans d’expérience en plateforme offshore et détient la certification d’évaluateur OPITO. Il dirige tous les programmes de sécurité et de survie en mer.',
  },
];

const FACILITIES = [
  {
    icon: Compass,
    title: 'Suite de simulateur de pont',
    text: 'Simulateur de pont à mission complète avec affichage visuel à 360°, radar, ARPA, ECDIS et GMDSS – capable de reproduire tout type de navire et l’état de la mer.',
  },
  {
    icon: Cog,
    title: 'Simulateur de salle de machine',
    text: 'Simulateur de salle de machines haute fidélité couvrant les systèmes de propulsion diesel, vapeur et turbine à gaz – utilisé pour la formation de gestion des ressources de l’OMI 2.07 et du moteur.',
  },
  {
    icon: Flame,
    title: 'Terrain d’entraînement de lutte contre les incendies',
    text: 'Zone d’entraînement dédiée à la lutte contre les incendies en plein air avec des scénarios de feu en direct, des systèmes de mousse et des appareils respiratoires – utilisé pour la lutte contre les incendies avancée IMO 2.03.',
  },
  {
    icon: LifeBuoy,
    title: 'Piscine de survie et sauvetage',
    text: 'Piscine intérieure chauffée pour le radeau de sauvetage, la combinaison d’immersion et les exercices pratiques de bateau de sauvetage – utilisé pour les cours de survie IMO 1.19, 1.23 et 1.24.',
  },
  {
    icon: MonitorPlay,
    title: 'Plateforme E-Learning',
    text: 'Plateforme d’apprentissage en ligne sécurisée et conforme à la norme SCORM accessible 24h/24 et 7j/7 à partir de n’importe quel appareil — héberge tous les modules théoriques pour les programmes mixtes et entièrement en ligne.',
  },
  {
    icon: Stethoscope,
    title: 'Salle de formation médicale',
    text: 'Salle de formation médicale entièrement équipée avec mannequins, défibrillateurs et fournitures médicales pour les cours de premiers soins et de soins médicaux.',
  },
];

const ACCREDITATIONS = [
  { code: 'AMP', name: 'Autoridad Marítima de Panamá', desc: 'Autorité maritime du Panama' },
  { code: 'IMO', name: 'Organisation maritime internationale', desc: 'Agence spécialisée des Nations Unies' },
  { code: 'STCW', name: 'Convention STCW', desc: 'Normes de formation, certification et surveillance' },
  { code: 'OPITO', name: 'OPITO', desc: 'Formation de l’industrie pétrolière offshore' },
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
      <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">{title}</h2>
      {children && <p className="mt-4 text-slate-300 leading-relaxed">{children}</p>}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="pt-16 md:pt-20">
      <section className="bg-[#172f4e] py-16 md:py-24 border-b border-[#294769]">
        <div className="container-app">
          <span className="text-[#e1b936] text-sm font-semibold uppercase tracking-wider">
            Notre histoire
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-semibold text-white max-w-3xl">
            À propos de {SITE.name}
          </h1>
          <p className="mt-5 text-slate-300 max-w-3xl text-lg leading-relaxed">
            Un centre de formation maritime dédié construit par les gens de mer, pour les
            gens de mer, combinant des décennies d’expérience océanique avec la technologie
            moderne d’apprentissage mixte.
          </p>
        </div>
      </section>

      {/* Mission et valeurs */}
      <section className="py-16 md:py-24 bg-[#0b1b30]">
        <div className="container-app grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <span className="section-label">Notre mission</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
              Une formation de classe mondiale, partout
            </h2>
            <p className="mt-5 text-slate-300 leading-relaxed">
              {SITE.name} a été fondé dans un seul but : rendre l’éducation maritime de
              classe mondiale accessible à tous les gens de mer, quel que soit l’endroit où
              ils se trouvent dans le monde. Nous croyons que la formation rigoureuse et
              reconnue internationalement ne devrait pas nécessiter des mois loin de la mer
              – c’est pourquoi nous avons été les pionniers d’un modèle d’apprentissage
              mixte qui combine une théorie flexible en ligne avec des sessions pratiques
              ciblées dans notre centre de Panama.
            </p>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="card p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#e1b936]/10 text-[#e1b936] mb-4">
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Histoire et frise */}
      <section className="py-16 md:py-24 bg-[#172f4e] border-y border-[#294769]">
        <div className="container-app grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="section-label">Notre histoire</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
              Né de la réalité de la vie en mer
            </h2>
            <p className="mt-5 text-slate-300 leading-relaxed">
              {SITE.name} est né de la reconnaissance que l’industrie maritime avait besoin
              d’un fournisseur de formation qui comprenait vraiment les réalités de la vie en
              mer. Nos fondateurs – des officiers de pont et d’ingénierie expérimentés – ont
              vu de première main à quel point il était difficile pour les gens de mer qui
              travaillaient d’accéder à des cours de mise à jour et de mise à niveau de
              qualité sans sacrifier leurs contrats ou leur famille. Nous avons entrepris de
              changer cela.
            </p>
            <p className="mt-4 text-slate-300 leading-relaxed">
              En commençant par un petit portefeuille de cours de sécurité STCW, nous sommes
              devenus un centre de formation complet offrant plus de 50 programmes certifiés
              IMO dans toutes les grandes disciplines maritimes. Aujourd’hui, nos diplômés
              servent sur des navires dans le monde entier – des vraquiers et des pétroliers
              aux plates-formes offshore et aux navires à passagers.
            </p>
          </div>

          <ol className="relative border-l border-[#385371] ml-3 space-y-8">
            {TIMELINE.map((t) => (
              <li key={t.year} className="pl-8 relative">
                <span className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-[#e1b936] ring-4 ring-[#172f4e]" />
                <div className="text-xl font-semibold text-[#e1b936] tabular-nums">{t.year}</div>
                <p className="mt-1 text-slate-200 leading-relaxed">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Instructeurs */}
      <section className="py-16 md:py-24 bg-[#0b1b30]">
        <div className="container-app">
          <SectionHead label="Notre équipe" title="Nos instructeurs">
            Chaque instructeur au PMTS est un professionnel du secteur maritime qualifié avec
            une véritable expérience de la mer. Nous n’utilisons pas de théoriciens de la
            salle de classe.
          </SectionHead>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INSTRUCTORS.map((p) => (
              <article key={p.name} className="card p-6 sm:p-7 flex gap-5">
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-[#e1b936] text-[#08182d] font-bold text-lg shrink-0"
                >
                  {p.initials}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                  <p className="text-sm text-[#e1b936] mt-0.5">{p.role}</p>
                  <p className="mt-2 inline-block text-xs text-slate-200 bg-[#0b1b30] border border-[#294769] rounded-sm px-2.5 py-1">
                    {p.credentials}
                  </p>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">{p.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Installations */}
      <section className="py-16 md:py-24 bg-[#172f4e] border-y border-[#294769]">
        <div className="container-app">
          <SectionHead label="Panama City" title="Nos installations">
            Notre centre de formation de Panama City est équipé de simulateurs de qualité
            professionnelle et de zones de formation pratique.
          </SectionHead>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FACILITIES.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0b1b30] text-[#e1b936] mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accréditations */}
      <section className="py-14 bg-[#08182d]">
        <div className="container-app">
          <h2 className="text-center section-label">Accréditations et références</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ACCREDITATIONS.map((a) => (
              <div key={a.code} className="text-center px-4 py-5 border border-[#294769] rounded-sm">
                <div className="text-2xl font-bold tracking-widest text-[#e1b936]">{a.code}</div>
                <div className="mt-2 text-sm font-medium text-white">{a.name}</div>
                <div className="mt-1 text-xs text-slate-400">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="py-16 md:py-20 bg-[#0b1b30] border-t border-[#294769]">
        <div className="container-app text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white">
            Prêt à faire avancer votre carrière ?
          </h2>
          <p className="mt-4 text-slate-300">
            Choisissez vos formations et inscrivez-vous en ligne, ou écrivez-nous pour toute
            question.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/inscription" className="btn-primary">
              <GraduationCap className="w-4 h-4" />
              S’inscrire en ligne
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="btn-secondary">
              <MessageCircle className="w-4 h-4" />
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
