// Informations de l'organisme, centralisées pour être modifiées à un seul endroit.

interface SiteInfo {
  name: string;
  shortName: string;
  country: string;
  // À renseigner dès que le client les communique : tant qu'ils valent null, ils ne sont pas affichés.
  address: string | null;
  phone: string | null;
  email: string | null;
  // Texte expliquant comment régler l'avance (virement, mobile money, etc.).
  paymentInstructions: string | null;
}

export const SITE: SiteInfo = {
  name: 'Panama Maritime Training Services',
  shortName: 'PMTS',
  country: 'République du Panama',
  address: null,
  phone: null,
  email: null,
  paymentInstructions: null,
};
