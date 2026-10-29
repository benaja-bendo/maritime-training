import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2, LogOut, ShieldAlert } from 'lucide-react';
import LogoMark from '@/components/LogoMark';
import { isFirebaseConfigured } from '@/lib/firebase';
import { isAdminEmail, signInWithGoogle, signOutAdmin, watchAuth } from '@/lib/auth';
import AdminCertificates from '@/pages/admin/AdminCertificates';
import AdminCatalog from '@/pages/admin/AdminCatalog';
import AdminRegistrations from '@/pages/admin/AdminRegistrations';
import AdminMessages from '@/pages/admin/AdminMessages';
import AdminAudit from '@/pages/admin/AdminAudit';
import { ErrorBox } from '@/pages/admin/ui';

type Access =
  | { state: 'loading' }
  | { state: 'out' }
  | { state: 'denied'; email: string }
  | { state: 'ok'; email: string };

const TABS = [
  { to: 'certificats', label: 'Certificats' },
  { to: 'formations', label: 'Formations' },
  { to: 'inscriptions', label: 'Inscriptions' },
  { to: 'messages', label: 'Messages' },
  { to: 'journal', label: 'Journal' },
];

export default function AdminApp() {
  const [access, setAccess] = useState<Access>({ state: 'loading' });
  const [error, setError] = useState<string | null>(null);

  // Page interne : jamais indexée par les moteurs de recherche.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAccess({ state: 'out' });
      return;
    }
    return watchAuth(async (email) => {
      if (!email) return setAccess({ state: 'out' });
      try {
        setAccess((await isAdminEmail(email)) ? { state: 'ok', email } : { state: 'denied', email });
      } catch {
        setAccess({ state: 'denied', email });
      }
    });
  }, []);

  const login = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      const code = (e as { code?: string }).code ?? 'inconnue';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      const messages: Record<string, string> = {
        'auth/popup-blocked':
          'Le navigateur a bloqué la fenêtre de connexion. Autorisez les fenêtres surgissantes pour ce site, puis réessayez.',
        'auth/network-request-failed':
          'Problème de réseau. Vérifiez votre connexion internet, puis réessayez.',
        'auth/operation-not-allowed':
          'La connexion Google n’est pas activée pour ce site. Contactez le développeur.',
        'auth/configuration-not-found':
          'La connexion Google n’est pas activée pour ce site. Contactez le développeur.',
        'auth/unauthorized-domain':
          'Cette adresse de site n’est pas autorisée pour la connexion. Contactez le développeur.',
      };
      setError(messages[code] ?? `Connexion impossible (code : ${code}). Réessayez.`);
    }
  };

  if (access.state === 'loading') {
    return (
      <div className="min-h-screen bg-[#0b1b30] flex items-center justify-center text-slate-300">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (access.state !== 'ok') {
    return (
      <div className="min-h-screen bg-[#0b1b30] flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          {access.state === 'denied' ? (
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-[#e1b936] text-[#e1b936] mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
          ) : (
            <LogoMark className="h-20 mb-4 mx-auto" />
          )}
          <h1 className="text-xl font-semibold text-white">Espace administration</h1>
          {access.state === 'denied' ? (
            <>
              <p className="mt-3 text-sm text-slate-300">
                Le compte <strong className="text-white">{access.email}</strong> n’est pas autorisé.
                Demandez à un administrateur de l’ajouter.
              </p>
              <button onClick={signOutAdmin} className="btn-secondary mt-6 w-full">
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-slate-300">Réservé au personnel de {`PMTS`}.</p>
              {error && <div className="mt-4"><ErrorBox>{error}</ErrorBox></div>}
              <button onClick={login} className="btn-primary mt-6 w-full">
                Se connecter avec Google
              </button>
            </>
          )}
          <Link to="/" className="mt-5 inline-block text-sm text-slate-400 hover:text-white">
            Retour au site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1b30] text-slate-100">
      <header className="bg-[#08182d] border-b border-[#294769]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-2 text-white font-semibold text-sm">
            <LogoMark className="h-8" /> PMTS · Administration
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline text-slate-400">{access.email}</span>
            <button onClick={signOutAdmin} className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={`/admin/${t.to}`}
              className={({ isActive }) =>
                `px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap ${
                  isActive ? 'border-[#e1b936] text-[#e1b936]' : 'border-transparent text-slate-300 hover:text-white'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Routes>
          <Route index element={<Navigate to="certificats" replace />} />
          <Route path="certificats" element={<AdminCertificates email={access.email} />} />
          <Route path="formations" element={<AdminCatalog email={access.email} />} />
          <Route path="inscriptions" element={<AdminRegistrations email={access.email} />} />
          <Route path="messages" element={<AdminMessages email={access.email} />} />
          <Route path="journal" element={<AdminAudit />} />
          <Route path="*" element={<Navigate to="certificats" replace />} />
        </Routes>
      </main>
    </div>
  );
}
