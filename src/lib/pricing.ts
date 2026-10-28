import type { Course, Quote } from '@/types';

// Part du prix à régler à l'inscription ; le solde est dû après la formation,
// avant la remise des documents. Le client a indiqué entre 45 % et 50 % : à confirmer.
export const DEPOSIT_RATE = 0.5;

const usd = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'code',
});

export const formatUsd = (amount: number) => usd.format(amount);

export const depositLabel = `${Math.round(DEPOSIT_RATE * 100)} %`;

// Calcul en centimes pour éviter les erreurs d'arrondi des nombres flottants.
// Si une formation n'a pas encore de tarif, aucun montant n'est calculé.
export function computeQuote(courses: Pick<Course, 'price_usd'>[]): Quote {
  if (courses.length === 0 || courses.some((c) => c.price_usd == null)) {
    return { total: null, deposit: null, balance: null };
  }
  const totalCents = courses.reduce(
    (sum, c) => sum + Math.round((c.price_usd as number) * 100),
    0,
  );
  const depositCents = Math.ceil(Math.round(totalCents * DEPOSIT_RATE * 1e6) / 1e6);
  return {
    total: totalCents / 100,
    deposit: depositCents / 100,
    balance: (totalCents - depositCents) / 100,
  };
}
