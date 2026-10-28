import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Mail,
  Clock,
  MessageCircle,
  Phone,
  User,
  Send,
  Loader2,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { submitContactMessage, ServiceUnavailableError } from '@/lib/data';
import { depositLabel } from '@/lib/pricing';
import { SITE } from '@/config/site';

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'Comment puis-je m’inscrire à un cours ?',
    a: (
      <>
        Rendez-vous sur la page{' '}
        <Link to="/inscription" className="text-[#e1b936] hover:underline">
          Inscription
        </Link>
        , choisissez vos formations et remplissez le formulaire avec vos informations et
        votre photo d’identité. Votre inscription est finalisée dès le règlement de
        l’avance de {depositLabel}. Le solde est à régler après la formation.
      </>
    ),
  },
  {
    q: 'Comment les cours en ligne sont-ils dispensés ?',
    a: 'Les modules théoriques sont hébergés sur notre plateforme d’apprentissage en ligne sécurisée, accessible 24h/24 et 7j/7 depuis n’importe quel appareil. Les programmes mixtes y ajoutent des sessions pratiques ciblées dans notre centre de Panama City.',
  },
  {
    q: 'Les certificats Panama sont-ils valables à l’international ?',
    a: 'Chaque programme répond ou dépasse les normes IMO, STCW et AMP. Pour toute question sur la reconnaissance de votre certificat par un pays ou un armateur précis, écrivez-nous via le formulaire ci-dessus.',
  },
  {
    q: 'Quels modes de paiement acceptez-vous ?',
    a: 'Les modalités de règlement de l’avance vous sont communiquées par notre équipe après votre pré-inscription. Pour toute question avant de vous inscrire, écrivez-nous via le formulaire ci-dessus.',
  },
  {
    q: 'Mon entreprise peut-elle réserver une formation pour un groupe ?',
    a: 'Écrivez-nous via le formulaire ci-dessus en précisant les formations souhaitées, le nombre de participants et les dates envisagées : notre équipe vous répondra.',
  },
  {
    q: 'Combien de temps faut-il pour recevoir mon certificat ?',
    a: 'Vos documents vous sont remis une fois la formation terminée et le solde réglé. Pour connaître le délai, contactez-nous.',
  },
];

const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof EMPTY, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitContactMessage(form);
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setError(
        err instanceof ServiceUnavailableError
          ? err.message
          : 'Une erreur est survenue lors de l’envoi. Vérifiez votre connexion et réessayez.',
      );
    }
    setLoading(false);
  };

  const whatsappDigits = SITE.whatsapp?.replace(/\D/g, '');

  return (
    <div className="pt-16 md:pt-20">
      <section className="bg-[#172f4e] py-16 md:py-20 border-b border-[#294769]">
        <div className="container-app">
          <span className="text-[#e1b936] text-sm font-semibold uppercase tracking-wider">
            Entrez en contact
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-semibold text-white">
            Contactez-nous
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl text-lg">
            Notre équipe est là pour vous aider à choisir le bon programme, organiser une
            session pratique ou répondre à toutes les questions sur l’inscription et la
            certification.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#0b1b30]">
        <div className="container-app grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Bureau */}
          <div className="lg:col-span-2 card p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Notre bureau</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#e1b936] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400">Adresse</div>
                  <div className="text-slate-100">
                    {SITE.address ? `${SITE.address}, ${SITE.country}` : SITE.country}
                  </div>
                </div>
              </li>
              {SITE.email && (
                <li className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-[#e1b936] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400">E-mail</div>
                    <a href={`mailto:${SITE.email}`} className="text-slate-100 hover:text-[#e1b936]">
                      {SITE.email}
                    </a>
                  </div>
                </li>
              )}
              {SITE.phone && (
                <li className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-[#e1b936] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400">Téléphone</div>
                    <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="text-slate-100 hover:text-[#e1b936]">
                      {SITE.phone}
                    </a>
                  </div>
                </li>
              )}
              {SITE.hours && (
                <li className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-[#e1b936] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400">Heures de bureau</div>
                    <div className="text-slate-100">{SITE.hours}</div>
                  </div>
                </li>
              )}
              {SITE.whatsapp && whatsappDigits && (
                <li className="flex items-start gap-4">
                  <MessageCircle className="w-5 h-5 text-[#e1b936] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400">Support WhatsApp</div>
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-100 hover:text-[#e1b936]"
                    >
                      {SITE.whatsapp}
                    </a>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-3 card p-6 sm:p-8">
            {sent ? (
              <div className="py-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-5">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white">Message envoyé</h2>
                <p className="mt-2 text-slate-300 max-w-sm mx-auto">
                  Merci. Nous vous répondrons dans un délai d’un jour ouvrable.
                </p>
                <button onClick={() => setSent(false)} className="btn-secondary mt-6">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-white">Envoyez-nous un message</h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Remplissez le formulaire ci-dessous et nous vous répondrons dans un
                    délai d’un jour ouvrable.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="c_name" className="block text-sm font-medium text-slate-200 mb-1.5">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="c_name"
                        type="text"
                        required
                        maxLength={120}
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="c_email" className="block text-sm font-medium text-slate-200 mb-1.5">
                      Adresse électronique *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="c_email"
                        type="email"
                        required
                        maxLength={120}
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        className="input-field pl-10"
                        placeholder="nom@exemple.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="c_subject" className="block text-sm font-medium text-slate-200 mb-1.5">
                    Sujet
                  </label>
                  <input
                    id="c_subject"
                    type="text"
                    maxLength={150}
                    value={form.subject}
                    onChange={(e) => update('subject', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="c_message" className="block text-sm font-medium text-slate-200 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="c_message"
                    required
                    rows={6}
                    maxLength={4000}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    className="input-field"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-300 bg-red-500/10 px-4 py-3 rounded-lg">{error}</p>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto disabled:opacity-60">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer un message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 bg-[#172f4e] border-t border-[#294769]">
        <div className="container-app max-w-3xl">
          <div className="text-center mb-10">
            <span className="section-label">Questions fréquentes</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
              Foire aux questions
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="card group">
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="w-5 h-5 shrink-0 text-[#e1b936] transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
