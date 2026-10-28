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
  'Instructeur sécurité',
  'Instructeur survie',
  'Formateur pont',
  'Formateur machine',
  'Coordinateur de stage',
  'Autre',
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
      setError('Le nom et l\u2019email sont obligatoires.');
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
      setError("Une erreur est survenue lors de l\u2019envoi. Réessayez.");
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
      <section className="bg-[#172f4e] py-16 md:py-20 border-b border-[#294769]">
        <div className="container-app">
          <span className="text-[#e1b936] text-sm font-semibold uppercase tracking-wider">
            Rejoignez-nous
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-semibold text-white">
            Inscription Volontaires
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl text-lg">
            Partagez votre expérience maritime en devenant instructeur volontaire au
            sein de notre académie.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#0b1b30]">
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="lg:sticky lg:top-28">
              <h2 className="text-2xl font-bold text-white mb-4">
                Pourquoi nous rejoindre ?
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Vous avez une expérience maritime et l\u2019envie de transmettre votre
                savoir ? Devenez instructeur volontaire au sein de notre académie et
                participez à la formation de la prochaine génération de marins.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  {
                    icon: HeartHandshake,
                    title: 'Partagez votre expertise',
                    desc: 'Transmettez vos compétences à des étudiants motivés du monde entier.',
                  },
                  {
                    icon: Briefcase,
                    title: 'Flexibilité totale',
                    desc: 'Choisissez vos modules et votre disponibilité. Interventions ponctuelles ou régulières.',
                  },
                  {
                    icon: CheckCircle2,
                    title: 'Certification reconnue',
                    desc: 'Vos interventions sont créditées et ajoutées à votre dossier professionnel.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#e1b936] text-[#08182d] shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="mt-0.5 text-sm text-slate-300">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 sm:p-8">
              {success ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-5">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Inscription envoyée !</h3>
                  <p className="mt-2 text-slate-300 max-w-sm mx-auto">
                    Merci pour votre intérêt. Notre équipe vous contactera dans les
                    prochains jours pour finaliser votre inscription.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="btn-secondary mt-6"
                  >
                    Soumettre une autre candidature
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="font-semibold text-white text-lg">
                    Candidature volontaire
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={form.full_name}
                        onChange={(e) => update('full_name', e.target.value)}
                        className="input-field pl-10"
                        placeholder="Jean Dupont"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                          placeholder="jean@email.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Téléphone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          className="input-field pl-10"
                          placeholder="+33 6 00 00 00 00"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Poste souhaité
                    </label>
                    <select
                      value={form.position}
                      onChange={(e) => update('position', e.target.value)}
                      className="input-field"
                    >
                      <option value="">— Sélectionnez —</option>
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Expérience maritime
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <textarea
                        rows={2}
                        value={form.experience}
                        onChange={(e) => update('experience', e.target.value)}
                        className="input-field pl-10"
                        placeholder="Ex : 10 ans comme officier pont sur navires citernes…"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Message
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <textarea
                        rows={3}
                        value={form.message}
                        onChange={(e) => update('message', e.target.value)}
                        className="input-field pl-10"
                        placeholder="Disponibilités, motivations, questions…"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-300 bg-red-500/10 px-4 py-3 rounded-lg">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer ma candidature
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
