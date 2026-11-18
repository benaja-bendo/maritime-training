import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a192f] text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
