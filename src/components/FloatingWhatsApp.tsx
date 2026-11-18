import { MessageCircle } from 'lucide-react';
import { SITE } from '@/config/site';

export default function FloatingWhatsApp() {
  const number = (SITE.whatsapp ?? '+50760000000').replace(/\D/g, '');
  const url = `https://wa.me/${number}?text=Hello%2C%20I%20would%20like%20information%20about%20PMTS%20courses`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#20ba5a] hover:scale-105 active:scale-95 transition-all group"
      aria-label="Contactez-nous sur WhatsApp"
      title="Contactez-nous sur WhatsApp"
    >
      <MessageCircle className="w-8 h-8 fill-current" />
      <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
        WhatsApp PMTS
      </span>
    </a>
  );
}
