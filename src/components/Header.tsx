import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import LogoMark from '@/components/LogoMark';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/verification', label: 'Verification' },
  { to: '/volunteers', label: 'Volunteers' },
  { to: '/contact', label: 'Contact' },
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
        solid
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm'
          : 'bg-slate-950/60 backdrop-blur-md border-b border-white/10'
      }`}
    >
      <div className="container-app flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Panama Maritime Training Services, home">
          <LogoMark className="h-11 md:h-14 transition-transform group-hover:scale-105" />
          <span
            className={`font-semibold text-sm md:text-[15px] leading-tight transition-colors ${
              solid ? 'text-slate-900' : 'text-white'
            }`}
          >
            Panama Maritime<br />Training Services
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? solid
                      ? 'text-amber-600 font-bold bg-amber-50/80'
                      : 'text-[#e1b936] font-bold bg-white/10'
                    : solid
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/register"
          className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e1b936] text-[#08182d] text-sm font-bold shadow-sm hover:bg-[#ebd06c] hover:shadow transition-all"
        >
          <GraduationCap className="w-4 h-4" />
          Register
        </Link>

        <button
          className={`lg:hidden p-2 rounded-lg transition-colors ${
            solid ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-white/10'
          }`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div
          className={`lg:hidden border-t shadow-xl ${
            solid
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-900/95 backdrop-blur-md border-slate-800 text-white'
          }`}
        >
          <nav className="container-app py-4 flex flex-col gap-1">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    active
                      ? solid
                        ? 'bg-amber-50 text-amber-700 font-bold'
                        : 'bg-white/15 text-[#e1b936] font-bold'
                      : solid
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2"
            >
              <GraduationCap className="w-4 h-4" />
              Register
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
