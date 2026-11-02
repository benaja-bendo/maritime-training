// Informations de l'organisme, centralisées pour être modifiées à un seul endroit.

interface SiteInfo {
  name: string;
  shortName: string;
  country: string;
  tagline: string;
  hours: string | null;
  // À renseigner dès qu'ils sont confirmés : tant qu'ils valent null, ils ne sont pas affichés.
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  // Texte expliquant comment régler l'avance (virement, mobile money, etc.).
  paymentInstructions: string | null;
}

export const SITE: SiteInfo = {
  name: 'Panama Maritime Training Services',
  shortName: 'PMTS',
  country: 'Republic of Panama',
  tagline:
    'Panama’s leading maritime training centre – offering IMO-compliant, STCW-certified programmes for officers, cadets and seafarers around the world.',
  hours: 'Monday – Friday, 08:00 – 17:00 (EST)',
  address: 'Panama City',
  // En attente. Le client a fourni info@pmts.online, mais ce domaine appartient à un tiers
  // (enregistré en décembre 2025). Le domaine du client est p-mts.online (avec tiret).
  email: null,
  // En attente. Numéros fournis : +507 000 000 (invalide) et +507 6000 0000 (semble factice).
  phone: null,
  whatsapp: null,
  paymentInstructions: null,
};
