import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Anchor, Menu, X, GraduationCap } from 'lucide-react';

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/formations', label: 'Formations' },
  { to: '/verification', label: 'Vérification' },
  { to: '/volontaires', label: 'Volontaires' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const solid = scrolled || !isHome;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        solid ? 'bg-[#08182d]/95 backdrop-blur-md border-b border-[#294769]' : 'bg-[#08182d]/80 backdrop-blur-sm'
      }`}
    >
      <div className="container-app flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#e1b936] text-[#e1b936] group-hover:bg-[#e1b936] group-hover:text-[#08182d] transition-colors">
            <Anchor className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm text-white leading-tight">
              Panama Maritime<br />Training Services
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'text-[#e1b936]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <Link to="/inscription" className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#e1b936] text-[#08182d] text-sm font-bold hover:bg-[#f0cc58] transition-colors">
          <GraduationCap className="w-4 h-4" />
          S'inscrire
        </Link>

        <button
          className="md:hidden p-2 rounded-lg text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#08182d] border-t border-[#294769] shadow-lg">
          <nav className="container-app py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-sm text-slate-300 font-medium hover:bg-[#102641] hover:text-[#e1b936]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/inscription"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2"
            >
              <GraduationCap className="w-4 h-4" />
              S'inscrire
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
