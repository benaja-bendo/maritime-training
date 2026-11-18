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
    q: 'How do I register for a course?',
    a: (
      <>
        Go to the{' '}
        <Link to="/register" className="text-amber-700 font-semibold hover:underline">
          Registration
        </Link>{' '}
        page, choose your courses and fill in the form with your details and your ID
        photo. Your registration is finalised once the {depositLabel} deposit has been
        paid. The balance is payable after the course.
      </>
    ),
  },
  {
    q: 'How are the online courses delivered?',
    a: 'The theory modules are hosted on our secure online learning platform, available 24/7 from any device. Blended programmes add focused practical sessions at our centre in Panama City.',
  },
  {
    q: 'Are Panama certificates valid internationally?',
    a: 'Every programme meets or exceeds IMO, STCW and AMP standards. For any question about whether a specific country or shipowner recognises your certificate, write to us using the form above.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'Our team will send you the deposit payment instructions after your pre-registration. If you have any questions before registering, write to us using the form above.',
  },
  {
    q: 'Can my company book a course for a group?',
    a: 'Write to us using the form above, stating the courses you want, the number of participants and your preferred dates: our team will get back to you.',
  },
  {
    q: 'How long does it take to receive my certificate?',
    a: 'Your documents are issued once the course is finished and the balance has been paid. To find out the timeframe, contact us.',
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
          : 'Something went wrong while sending. Check your connection and try again.',
      );
    }
    setLoading(false);
  };

  const whatsappDigits = SITE.whatsapp?.replace(/\D/g, '');

  return (
    <div className="pt-16 md:pt-20">
      {/* Page Header Banner */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-[#1b64b8] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/6499021/pexels-photo-6499021.jpeg?auto=compress&cs=tinysrgb&h=800&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#144f94] to-[#1b64b8]/90 pointer-events-none" />

        <div className="container-app relative z-10">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-3 py-1 rounded-full mb-3 backdrop-blur-sm">
            Support & Information
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Contact Us
          </h1>
          <p className="mt-3 text-sky-100 max-w-2xl text-base sm:text-lg">
            Our team is here to help you choose the right programme, arrange a practical
            session or answer any question about registration and certification.
          </p>
        </div>
      </section>

      {/* Office & Form Section */}
      <section className="relative py-12 md:py-16 overflow-hidden bg-slate-50 dark:bg-[#071326] transition-colors">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/18340568/pexels-photo-18340568.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1800')",
          }}
        />
        <div className="absolute inset-0 bg-slate-50/93 dark:bg-[#071326]/95 pointer-events-none" />

        <div className="container-app relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Bureau */}
          <div className="lg:col-span-2 card p-6 sm:p-8 bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-md rounded-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
              Our office
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#1b64b8] dark:text-sky-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Address</div>
                  <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                    {SITE.address ? `${SITE.address}, ${SITE.country}` : SITE.country}
                  </div>
                </div>
              </li>
              {SITE.emails.length > 0 && (
                <li className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-[#1b64b8] dark:text-sky-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">E-mail</div>
                    <div className="flex flex-col gap-1 mt-0.5">
                      {SITE.emails.map((e) => (
                        <a key={e} href={`mailto:${e}`} className="text-slate-800 dark:text-slate-200 font-medium hover:text-[#1b64b8] dark:hover:text-amber-300 transition-colors">
                          {e}
                        </a>
                      ))}
                    </div>
                  </div>
                </li>
              )}
              {SITE.phone && (
                <li className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-[#1b64b8] dark:text-sky-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Phone</div>
                    <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="text-slate-800 dark:text-slate-200 font-medium hover:text-[#1b64b8] dark:hover:text-amber-300 transition-colors mt-0.5 inline-block">
                      {SITE.phone}
                    </a>
                  </div>
                </li>
              )}
              {SITE.hours && (
                <li className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-[#1b64b8] dark:text-sky-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Office hours</div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{SITE.hours}</div>
                  </div>
                </li>
              )}
              {SITE.whatsapp && whatsappDigits && (
                <li className="flex items-start gap-4">
                  <MessageCircle className="w-5 h-5 text-[#1b64b8] dark:text-sky-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">WhatsApp support</div>
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-800 dark:text-slate-200 font-medium hover:text-[#1b64b8] dark:hover:text-amber-300 transition-colors mt-0.5 inline-block"
                    >
                      {SITE.whatsapp}
                    </a>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-3 card p-6 sm:p-8 bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-lg rounded-2xl">
            {sent ? (
              <div className="py-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-5">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Message sent</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                  Thank you. We will reply within one working day.
                </p>
                <button onClick={() => setSent(false)} className="btn-secondary mt-6">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send us a message</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Fill in the form below and we will reply within one working day.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="c_name" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                      Full name *
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
                    <label htmlFor="c_email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                      Email address *
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
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="c_subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    Subject
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
                  <label htmlFor="c_message" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
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
                  <p className="text-sm text-red-800 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 rounded-xl font-medium">{error}</p>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto disabled:opacity-60 shadow-md">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-12 md:py-16 overflow-hidden bg-white dark:bg-[#071326] border-t border-sky-100 dark:border-sky-950 transition-colors">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/5779747/pexels-photo-5779747.jpeg?auto=compress&cs=tinysrgb&h=800&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-white/92 dark:bg-[#071326]/95 pointer-events-none" />

        <div className="container-app relative z-10 max-w-3xl">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#1b64b8] dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full mb-2">
              Common questions
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="card group bg-white dark:bg-[#112240] border border-sky-100 dark:border-sky-950 shadow-sm rounded-xl overflow-hidden hover:border-sky-300 dark:hover:border-sky-800 transition-all">
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none font-semibold text-slate-900 dark:text-white [&::-webkit-details-marker]:hidden select-none">
                  {item.q}
                  <ChevronDown className="w-5 h-5 shrink-0 text-[#1b64b8] dark:text-sky-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
