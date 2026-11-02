import { Link } from 'react-router-dom';
import { Ship, Waves, Mail, MapPin, Phone, Clock } from 'lucide-react';
import LogoMark from '@/components/LogoMark';
import { SITE } from '@/config/site';

const COURSE_GROUPS = [
  'Basic STCW safety',
  'Officer programmes',
  'Tanker operations',
  'Navigation and simulators',
  'Medical and fire fighting',
  'Offshore and specialised operations',
];

const ACCREDITATIONS = ['AMP', 'IMO', 'STCW', 'OPITO'];

export default function Footer() {
  return (
    <footer className="bg-[#0b1b30] text-slate-300 border-t border-[#294769]">
      <div className="container-app py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <LogoMark className="h-16" />
            <span className="font-semibold text-sm text-white leading-tight">Panama Maritime<br />Training Services</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{SITE.tagline}</p>
        </div>

        <div>
          <h4 className="font-semibold text-[#e1b936] mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
            <Ship className="w-4 h-4 text-[#e1b936]" /> Navigation
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-[#e1b936] transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-[#e1b936] transition-colors">About</Link></li>
            <li><Link to="/courses" className="hover:text-[#e1b936] transition-colors">Courses</Link></li>
            <li><Link to="/register" className="hover:text-[#e1b936] transition-colors">Registration</Link></li>
            <li><Link to="/verification" className="hover:text-[#e1b936] transition-colors">Verification</Link></li>
            <li><Link to="/volunteers" className="hover:text-[#e1b936] transition-colors">Volunteers</Link></li>
            <li><Link to="/contact" className="hover:text-[#e1b936] transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[#e1b936] mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
            <Waves className="w-4 h-4 text-[#e1b936]" /> Courses
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            {COURSE_GROUPS.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#e1b936] mt-0.5 shrink-0" />
              <span>{SITE.address ? `${SITE.address}, ${SITE.country}` : SITE.country}</span>
            </li>
            {SITE.phone && (
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#e1b936] shrink-0" />
                <span>{SITE.phone}</span>
              </li>
            )}
            {SITE.email && (
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#e1b936] shrink-0" />
                <span>{SITE.email}</span>
              </li>
            )}
            {SITE.hours && (
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#e1b936] mt-0.5 shrink-0" />
                <span>{SITE.hours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#294769]">
        <div className="container-app py-6 text-center text-sm text-slate-400 space-y-2">
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest">
            <span className="text-slate-500">Accreditations</span>
            {ACCREDITATIONS.map((a) => (
              <span key={a} className="font-semibold text-[#e1b936]">{a}</span>
            ))}
          </p>
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved. Registered in
            the {SITE.country}.
          </p>
          <p className="text-xs text-slate-500">
            Certified under the STCW Convention and AMP regulations
          </p>
        </div>
      </div>
    </footer>
  );
}
