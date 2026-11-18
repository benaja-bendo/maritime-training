import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, Sun, Moon, Globe } from 'lucide-react';
import LogoMark from '@/components/LogoMark';
import { useTheme } from '@/context/ThemeContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'À propos' },
  { to: '/courses', label: 'Cours' },
  { to: '/verification', label: 'Vérification' },
  { to: '/volunteers', label: 'Volontaires' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 bg-white/95 dark:bg-[#07172b]/95 backdrop-blur-md border-b border-sky-100 dark:border-sky-950 transition-all duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      {/* Top micro-bar inspired by panamamaritimetraining.com */}
      <div className="bg-[#1b64b8] text-white text-xs py-1.5 px-4 hidden sm:block">
        <div className="container-app flex justify-between items-center">
          <span className="font-medium tracking-wide">
            STCW Manila Amendments · Authorized Maritime Training Center · AMP & IMO Compliant
          </span>
          <div className="flex items-center gap-4">
            <Link to="/courses" className="hover:underline flex items-center gap-1 font-semibold">
              <Globe className="w-3.5 h-3.5" />
              Cursos Para Marinos
            </Link>
          </div>
        </div>
      </div>

      <div className="container-app flex items-center justify-between h-16 md:h-18">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Panama Maritime Training Services, home">
          <LogoMark className="h-11 md:h-13 transition-transform group-hover:scale-105" />
          <span className="font-bold text-sm md:text-[15px] leading-tight text-[#1b64b8] dark:text-white">
            Panama Maritime<br />
            <span className="text-slate-800 dark:text-sky-300 font-semibold text-xs tracking-wider uppercase">
              Training Services
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? 'text-[#1b64b8] bg-sky-50 border border-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800 shadow-xs'
                    : 'text-slate-700 hover:text-[#1b64b8] hover:bg-sky-50/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {/* Theme toggle switch */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-sky-200 bg-sky-50/50 text-slate-700 hover:text-[#1b64b8] hover:border-[#1b64b8] dark:border-sky-900 dark:bg-[#112240] dark:text-slate-200 dark:hover:text-sky-300 transition-all"
            aria-label={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
            title={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#1b64b8]" />
            )}
          </button>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#dfa716] text-slate-950 text-sm font-bold shadow-sm hover:bg-[#ebd06c] hover:shadow transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            Inscrivez-vous
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-sky-200 bg-sky-50 text-slate-700 dark:border-sky-900 dark:bg-[#112240] dark:text-slate-200"
            aria-label={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#1b64b8]" />
            )}
          </button>

          <button
            className="p-2 rounded-lg text-slate-800 dark:text-slate-100 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#1b64b8]" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-sky-100 bg-white dark:bg-[#07172b] dark:border-sky-950 shadow-xl">
          <nav className="container-app py-4 flex flex-col gap-1">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                    active
                      ? 'bg-sky-50 text-[#1b64b8] border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800'
                      : 'text-slate-700 hover:bg-sky-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 text-center"
            >
              <GraduationCap className="w-4 h-4 inline mr-1" />
              Inscrivez-vous aujourd'hui
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
