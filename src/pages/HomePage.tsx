import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Award, Users, Waves, Globe, Search, HeartHandshake, BookOpen, GraduationCap } from 'lucide-react';
import Hero from '@/components/Hero';

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Features / quick access */}
      <section className="py-20 md:py-28 bg-[#172f4e]">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-label">Our services</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
              Your whole maritime journey in one place
            </h2>
            <p className="mt-4 text-slate-300">
              Browse the catalogue, register online, verify your documents
              and join our network of volunteers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                to: '/courses',
                title: 'Course catalogue',
                desc: 'Over 50 STCW and MLC certified courses, from basic safety to officer grade.',
                cta: 'View courses',
              },
              {
                icon: GraduationCap,
                to: '/register',
                title: 'Online registration',
                desc: 'Choose your modules, see the prices and pay a deposit to complete your registration.',
                cta: 'Register',
              },
              {
                icon: ShieldCheck,
                to: '/verification',
                title: 'Document verification',
                desc: 'Enter the student ID, ID card or passport number to look up certificates and their status.',
                cta: 'Verify a document',
              },
              {
                icon: HeartHandshake,
                to: '/volunteers',
                title: 'Volunteer registration',
                desc: 'Share your maritime experience by becoming a volunteer instructor.',
                cta: 'Become a volunteer',
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
              { icon: Award, value: '50+', label: 'Courses' },
              { icon: Users, value: '2,000', label: 'Graduates' },
              { icon: Globe, value: '40+', label: 'Nationalities' },
              { icon: Waves, value: '2014', label: 'Year founded' },
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
          <span className="section-label">Official portal</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
            Verify a certificate online
          </h2>
          <p className="mt-4 text-slate-300">
            Look up a student’s courses and the status of their certificates
            (valid or expired) using their student ID, ID card or passport.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/verification" className="btn-primary">
              <Search className="w-4 h-4" />
              Go to the portal
            </Link>
            <Link to="/courses" className="btn-secondary">
              <BookOpen className="w-4 h-4" />
              Browse the catalogue
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
