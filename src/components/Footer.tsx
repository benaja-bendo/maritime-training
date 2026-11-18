import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Clock, CheckCircle2 } from 'lucide-react';
import LogoMark from '@/components/LogoMark';
import { SITE } from '@/config/site';

export default function Footer() {
  const [subEmail, setSubEmail] = useState('');
  const [subName, setSubName] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    setSubscribed(true);
  };

  return (
    <footer className="relative bg-[#1b64b8] text-white border-t border-sky-400/30 overflow-hidden">
      {/* Background subtle texture */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/209717/pexels-photo-209717.jpeg?auto=compress&cs=tinysrgb&h=800&w=1600')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1656a2] via-[#1b64b8] to-[#124b8f] pointer-events-none" />

      <div className="container-app relative z-10 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Colonne 1 : Présentation officielle (comme dans l'image 3) */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-5">
            <LogoMark className="h-14 brightness-0 invert" />
            <div>
              <span className="font-bold text-lg text-white leading-tight block">
                Panama Maritime
              </span>
              <span className="text-xs uppercase tracking-widest text-sky-200 block font-semibold">
                Training Services, Inc.
              </span>
            </div>
          </div>
          <p className="text-sm text-sky-100 leading-relaxed max-w-md">
            Panama Maritime Training Services, Inc. est une compagnie de formation maritime créée en 1998,
            autorisée par l'Autorité maritime du Panama (AMP) et d'autres administrations maritimes internationales
            à mener des formations conformes à la convention STCW, y compris les amendements de Manille de 2010.
          </p>

          <div className="mt-6 pt-5 border-t border-white/20 text-xs text-sky-200 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{SITE.address ? `${SITE.address}, ${SITE.country}` : SITE.country}</span>
            </div>
            {SITE.emails.length > 0 && (
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  {SITE.emails.map((e) => (
                    <a key={e} href={`mailto:${e}`} className="hover:underline text-white font-medium">
                      {e}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {SITE.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-300 shrink-0" />
                <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="hover:underline text-white font-medium">
                  {SITE.phone}
                </a>
              </div>
            )}
            {SITE.hours && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{SITE.hours}</span>
              </div>
            )}
          </div>
        </div>

        {/* Colonne 2 : Navigation avec flèches » (comme dans l'image 3) */}
        <div className="md:col-span-3">
          <h4 className="font-bold text-white mb-5 uppercase tracking-wider text-xs border-b border-white/20 pb-2">
            Liens rapides
          </h4>
          <ul className="space-y-3 text-sm text-sky-100">
            <li>
              <Link to="/courses" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>Cursos para marinos</span> <span className="text-amber-300 font-bold">»</span>
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>Postulez pour nos cours</span> <span className="text-amber-300 font-bold">»</span>
              </Link>
            </li>
            <li>
              <Link to="/verification" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>Vérification de documents</span> <span className="text-amber-300 font-bold">»</span>
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>À propos de PMTS</span> <span className="text-amber-300 font-bold">»</span>
              </Link>
            </li>
            <li>
              <Link to="/volunteers" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>Devenir un instructeur</span> <span className="text-amber-300 font-bold">»</span>
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>Contactez-Nous</span> <span className="text-amber-300 font-bold">»</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Colonne 3 : Newsletter (comme dans l'image 3) */}
        <div className="md:col-span-4">
          <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-xs border-b border-white/20 pb-2">
            Newsletter maritime
          </h4>
          <p className="text-sm text-sky-100 leading-relaxed mb-4">
            Abonnez-vous à notre newsletter pour recevoir des informations à jour sur les cours STCW et les nouvelles maritimes.
          </p>

          {subscribed ? (
            <div className="p-4 rounded-lg bg-white/20 border border-white/30 text-white text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>Merci pour votre inscription à la newsletter PMTS !</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Votre Email"
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <input
                type="text"
                placeholder="Votre Nom"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#0e3b6e] text-white font-bold text-sm border border-white/30 hover:bg-[#134988] transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="relative z-10 border-t border-white/15 bg-[#144f94]/60">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between text-xs text-sky-200 gap-3">
          <p>
            © Panama Maritime Training Services, Inc. 1998 - {new Date().getFullYear()}. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span>AMP · IMO · STCW · ISO 9001:2015</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
