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
    title: 'Rigour',
    text: 'Every programme meets or exceeds IMO, STCW and AMP standards. We don’t cut corners.',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    text: 'Blended and fully online formats let seafarers train around their schedules and their contracts.',
  },
  {
    icon: ShieldCheck,
    title: 'Integrity',
    text: 'Our certificates are earned, not handed out. Every graduate has demonstrated real competence.',
  },
  {
    icon: Award,
    title: 'Excellence',
    text: 'Our instructors are active or recently retired maritime professionals – not classroom theorists.',
  },
];

const TIMELINE = [
  { year: '2014', text: 'Founded in Panama City by a team of experienced maritime officers' },
  { year: '2016', text: 'Received full accreditation from the Autoridad Marítima de Panamá (AMP)' },
  {
    year: '2018',
    text: 'Launched our blended online learning platform, the first of its kind in Panama',
  },
  {
    year: '2020',
    text: 'Expanded to more than 50 IMO-certified programmes; OPITO recognition for offshore courses',
  },
  { year: '2022', text: 'Reached 2,000 certified graduates across more than 40 nationalities' },
  {
    year: '2024',
    text: 'Opened advanced bridge and engine room simulator facilities in Panama City',
  },
];

const INSTRUCTORS = [
  {
    initials: 'AM',
    name: 'Capt. Alejandro Morales',
    role: 'Director of Training — Deck',
    credentials: 'Master Mariner (Unlimited), 22 years at sea',
    bio: 'Capt. Morales holds an unlimited Master Mariner certificate and spent 22 years at sea on bulk carriers and container ships before joining PMTS. He leads all deck officer programmes and the bridge simulator training.',
  },
  {
    initials: 'RV',
    name: 'Chief Eng. Ricardo Vásquez',
    role: 'Director of Training — Engine',
    credentials: 'Chief Engineer (Unlimited), 18 years at sea',
    bio: 'Chief Eng. Vásquez is a qualified unlimited chief engineer with 18 years of engine room experience across tankers and bulk carriers. He oversees all engineering programmes and the engine room simulator.',
  },
  {
    initials: 'MF',
    name: 'Dr. María Fernández',
    role: 'Head of Medical and Safety Training',
    credentials: 'MD, maritime health physician, STCW instructor',
    bio: 'Dr. Fernández combines a medical degree with specialised maritime medical training. She leads all medical care, first aid and fire fighting programmes at PMTS.',
  },
  {
    initials: 'JD',
    name: 'Capt. Jean-Pierre Dubois',
    role: 'Lead Instructor — Offshore & Survival',
    credentials: 'Master Mariner, OPITO Assessor, 15 years offshore',
    bio: 'Capt. Dubois brings 15 years of offshore rig experience and holds OPITO assessor certification. He leads all offshore safety and sea survival programmes.',
  },
];

const FACILITIES = [
  {
    icon: Compass,
    title: 'Bridge simulator suite',
    text: 'Full-mission bridge simulator with a 360° visual display, radar, ARPA, ECDIS and GMDSS – able to reproduce any type of vessel and sea state.',
  },
  {
    icon: Cog,
    title: 'Engine room simulator',
    text: 'High-fidelity engine room simulator covering diesel, steam and gas turbine propulsion systems – used for IMO 2.07 resource management and engine training.',
  },
  {
    icon: Flame,
    title: 'Fire fighting training ground',
    text: 'Dedicated outdoor fire fighting training area with live fire scenarios, foam systems and breathing apparatus – used for IMO 2.03 advanced fire fighting.',
  },
  {
    icon: LifeBuoy,
    title: 'Survival and rescue pool',
    text: 'Heated indoor pool for liferaft, immersion suit and lifeboat practical drills – used for the IMO 1.19, 1.23 and 1.24 survival courses.',
  },
  {
    icon: MonitorPlay,
    title: 'E-learning platform',
    text: 'Secure, SCORM-compliant e-learning platform available 24/7 from any device – hosts all the theory modules for blended and fully online programmes.',
  },
  {
    icon: Stethoscope,
    title: 'Medical training room',
    text: 'Fully equipped medical training room with manikins, defibrillators and medical supplies for the first aid and medical care courses.',
  },
];

const ACCREDITATIONS = [
  { code: 'AMP', name: 'Autoridad Marítima de Panamá', desc: 'Panama Maritime Authority' },
  { code: 'IMO', name: 'International Maritime Organization', desc: 'United Nations specialised agency' },
  { code: 'STCW', name: 'STCW Convention', desc: 'Standards of training, certification and watchkeeping' },
  { code: 'OPITO', name: 'OPITO', desc: 'Offshore oil and gas industry training' },
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
            Our story
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-semibold text-white max-w-3xl">
            About {SITE.name}
          </h1>
          <p className="mt-5 text-slate-300 max-w-3xl text-lg leading-relaxed">
            A dedicated maritime training centre built by seafarers, for seafarers,
            combining decades of experience at sea with modern blended learning technology.
          </p>
        </div>
      </section>

      {/* Mission et valeurs */}
      <section className="py-16 md:py-24 bg-[#0b1b30]">
        <div className="container-app grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <span className="section-label">Our mission</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
              World-class training, anywhere
            </h2>
            <p className="mt-5 text-slate-300 leading-relaxed">
              {SITE.name} was founded with a single purpose: to make world-class maritime
              education accessible to every seafarer, wherever they are in the world. We
              believe rigorous, internationally recognised training should not require
              months away from the sea – which is why we pioneered a blended learning model
              that combines flexible online theory with focused practical sessions at our
              centre in Panama.
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
            <span className="section-label">Our story</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
              Born from the reality of life at sea
            </h2>
            <p className="mt-5 text-slate-300 leading-relaxed">
              {SITE.name} was born from the recognition that the maritime industry needed a
              training provider that truly understood the realities of life at sea. Our
              founders – experienced deck and engineering officers – saw first-hand how hard
              it was for working seafarers to access quality refresher and upgrading courses
              without sacrificing their contracts or their families. We set out to change
              that.
            </p>
            <p className="mt-4 text-slate-300 leading-relaxed">
              Starting with a small portfolio of STCW safety courses, we have grown into a
              full training centre offering more than 50 IMO-certified programmes across all
              the major maritime disciplines. Today our graduates serve on vessels around the
              world – from bulk carriers and tankers to offshore platforms and passenger
              ships.
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
          <SectionHead label="Our team" title="Our instructors">
            Every PMTS instructor is a qualified maritime professional with real experience
            at sea. We don’t use classroom theorists.
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
          <SectionHead label="Panama City" title="Our facilities">
            Our training centre in Panama City is equipped with professional-grade
            simulators and hands-on training areas.
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
          <h2 className="text-center section-label">Accreditations and references</h2>
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
            Ready to advance your career?
          </h2>
          <p className="mt-4 text-slate-300">
            Choose your courses and register online, or write to us with any questions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary">
              <GraduationCap className="w-4 h-4" />
              Register online
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="btn-secondary">
              <MessageCircle className="w-4 h-4" />
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
