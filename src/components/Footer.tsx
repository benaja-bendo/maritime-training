import { Link } from 'react-router-dom';
import { Anchor, Ship, Waves, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0b1b30] text-slate-300 border-t border-[#294769]">
      <div className="container-app py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#e1b936] text-[#e1b936]">
              <Anchor className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm text-white leading-tight">Maritime<br />Training Services</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Centre de formation maritime certifié. Formations conformes aux standards
            internationaux STCW et MLC.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-[#e1b936] mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
            <Ship className="w-4 h-4 text-[#e1b936]" /> Navigation
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-[#e1b936] transition-colors">Accueil</Link></li>
            <li><Link to="/formations" className="hover:text-[#e1b936] transition-colors">Formations</Link></li>
            <li><Link to="/verification" className="hover:text-[#e1b936] transition-colors">Vérification</Link></li>
            <li><Link to="/volontaires" className="hover:text-[#e1b936] transition-colors">Volontaires</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[#e1b936] mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
            <Waves className="w-4 h-4 text-[#e1b936]" /> Formations
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>Sécurité de base</li>
            <li>Officiers pont & machine</li>
            <li>Tankers & cargaisons</li>
            <li>Sécurité & sauvetage</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#e1b936] mt-0.5 shrink-0" />
              <span>Port Maritime, Quai 12, Marseille, France</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#e1b936] shrink-0" />
              <span>+33 4 91 00 00 00</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#e1b936] shrink-0" />
              <span>contact@maritime-academy.fr</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#294769]">
        <div className="container-app py-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} MaritimeAcademy. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
