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
        <Link to="/register" className="text-[#e1b936] hover:underline">
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
      <section className="bg-[#172f4e] py-16 md:py-20 border-b border-[#294769]">
        <div className="container-app">
          <span className="text-[#e1b936] text-sm font-semibold uppercase tracking-wider">
            Get in touch
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-semibold text-white">
            Contact Us
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl text-lg">
            Our team is here to help you choose the right programme, arrange a practical
            session or answer any question about registration and certification.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#0b1b30]">
        <div className="container-app grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Bureau */}
          <div className="lg:col-span-2 card p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Our office</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#e1b936] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400">Address</div>
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
                    <div className="text-xs uppercase tracking-wider text-slate-400">Phone</div>
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
                    <div className="text-xs uppercase tracking-wider text-slate-400">Office hours</div>
                    <div className="text-slate-100">{SITE.hours}</div>
                  </div>
                </li>
              )}
              {SITE.whatsapp && whatsappDigits && (
                <li className="flex items-start gap-4">
                  <MessageCircle className="w-5 h-5 text-[#e1b936] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400">WhatsApp support</div>
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
                <h2 className="text-xl font-bold text-white">Message sent</h2>
                <p className="mt-2 text-slate-300 max-w-sm mx-auto">
                  Thank you. We will reply within one working day.
                </p>
                <button onClick={() => setSent(false)} className="btn-secondary mt-6">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-white">Send us a message</h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Fill in the form below and we will reply within one working day.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="c_name" className="block text-sm font-medium text-slate-200 mb-1.5">
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
                    <label htmlFor="c_email" className="block text-sm font-medium text-slate-200 mb-1.5">
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
                  <label htmlFor="c_subject" className="block text-sm font-medium text-slate-200 mb-1.5">
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
      <section className="py-12 md:py-16 bg-[#172f4e] border-t border-[#294769]">
        <div className="container-app max-w-3xl">
          <div className="text-center mb-10">
            <span className="section-label">Common questions</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
              Frequently Asked Questions
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
