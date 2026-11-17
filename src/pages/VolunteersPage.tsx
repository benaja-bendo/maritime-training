import { useState } from 'react';
import { submitVolunteer, ServiceUnavailableError } from '@/lib/data';
import {
  HeartHandshake,
  Send,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Phone,
  Briefcase,
  MessageSquare,
} from 'lucide-react';

const POSITIONS = [
  'Safety instructor',
  'Survival instructor',
  'Deck trainer',
  'Engine trainer',
  'Course coordinator',
  'Other',
];

export default function VolunteersPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      setError('Name and email are required.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await submitVolunteer({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        position: form.position || null,
        experience: form.experience || null,
        message: form.message || null,
      });
    } catch (err) {
      setLoading(false);
      if (err instanceof ServiceUnavailableError) {
        setError(err.message);
        return;
      }
      setError('Something went wrong while sending. Please try again.');
      return;
    }
    setLoading(false);
    setSuccess(true);
    setForm({
      full_name: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      message: '',
    });
  };

  return (
    <div className="pt-16 md:pt-20">
      {/* Page Header Banner */}
      <section className="relative py-16 md:py-20 overflow-hidden bg-white border-b border-slate-200">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/34104787/pexels-photo-34104787.jpeg?auto=compress&cs=tinysrgb&h=800&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-sky-50/80 pointer-events-none" />

        <div className="container-app relative z-10">
          <span className="section-label">Join us</span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-semibold text-slate-900">
            Volunteer Registration
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl text-lg">
            Share your maritime experience by becoming a volunteer instructor at
            our academy.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative py-12 md:py-16 overflow-hidden bg-slate-50">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/10290624/pexels-photo-10290624.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1800')",
          }}
        />
        <div className="absolute inset-0 bg-slate-50/93 pointer-events-none" />

        <div className="container-app relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="lg:sticky lg:top-28">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Why join us?
              </h2>
              <p className="text-slate-600 leading-relaxed text-base">
                Do you have maritime experience and the desire to pass on your
                knowledge? Become a volunteer instructor at our academy and help train
                the next generation of seafarers.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: HeartHandshake,
                    title: 'Share your expertise',
                    desc: 'Pass your skills on to motivated students from around the world.',
                  },
                  {
                    icon: Briefcase,
                    title: 'Total flexibility',
                    desc: 'Choose your modules and your availability. One-off or regular sessions.',
                  },
                  {
                    icon: CheckCircle2,
                    title: 'Recognised contribution',
                    desc: 'Your sessions are credited and added to your professional record.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/90 border border-slate-200/90 shadow-sm">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-0.5 text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 sm:p-8 bg-white border border-slate-200 shadow-lg rounded-2xl">
              {success ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-5">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Registration sent!</h3>
                  <p className="mt-2 text-slate-600 max-w-sm mx-auto">
                    Thank you for your interest. Our team will contact you in the
                    coming days to finalise your registration.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="btn-secondary mt-6"
                  >
                    Submit another application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="font-bold text-slate-900 text-xl pb-2 border-b border-slate-100">
                    Volunteer application
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Full name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={form.full_name}
                        onChange={(e) => update('full_name', e.target.value)}
                        className="input-field pl-10"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          className="input-field pl-10"
                          placeholder="john@email.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          className="input-field pl-10"
                          placeholder="+507 6000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Desired role
                    </label>
                    <select
                      value={form.position}
                      onChange={(e) => update('position', e.target.value)}
                      className="input-field"
                    >
                      <option value="">— Select —</option>
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Maritime experience
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <textarea
                        rows={2}
                        value={form.experience}
                        onChange={(e) => update('experience', e.target.value)}
                        className="input-field pl-10"
                        placeholder="e.g. 10 years as a deck officer on tankers…"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Message
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <textarea
                        rows={3}
                        value={form.message}
                        onChange={(e) => update('message', e.target.value)}
                        className="input-field pl-10"
                        placeholder="Availability, motivation, questions…"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-800 bg-red-50 border border-red-200 px-4 py-3 rounded-xl font-medium">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-60 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send my application
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
