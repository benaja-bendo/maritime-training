import type { Course, Quote } from '@/types';

// Part du prix à régler à l'inscription ; le solde est dû après la formation,
// avant la remise des documents. Le client a indiqué entre 45 % et 50 % : à confirmer.
export const DEPOSIT_RATE = 0.5;

// Pack complet BST : les quatre formations de base prises ensemble coûtent moins cher
// que la somme de leurs prix. La remise s'applique quand les quatre sont sélectionnées.
export const BST_PACK = {
  label: 'Pack complet BST',
  imoNumbers: ['1.13', '1.19', '1.20', '1.21'],
  price: 395,
};

const usd = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'code',
});

export const formatUsd = (amount: number) => usd.format(amount);

export const depositLabel = `${Math.round(DEPOSIT_RATE * 100)} %`;

type Priced = Pick<Course, 'imo_number' | 'price_usd'>;

const cents = (amount: number) => Math.round(amount * 100);

// Les quatre formations du pack dans le catalogue, avec la somme de leurs prix à l'unité.
export function findBstPack<T extends Course>(
  catalogue: T[],
): { ids: string[]; regular: number } | null {
  const items = BST_PACK.imoNumbers.map((n) => catalogue.find((c) => c.imo_number === n));
  if (items.some((c) => !c || c.price_usd == null)) return null;
  const found = items as T[];
  return {
    ids: found.map((c) => c.id),
    regular: found.reduce((sum, c) => sum + cents(c.price_usd as number), 0) / 100,
  };
}

// Calcul en centimes pour éviter les erreurs d'arrondi des nombres flottants.
// Si une formation n'a pas encore de tarif, aucun montant n'est calculé.
export function computeQuote(courses: Priced[]): Quote {
  if (courses.length === 0 || courses.some((c) => c.price_usd == null)) {
    return { total: null, deposit: null, balance: null, discount: 0 };
  }
  const grossCents = courses.reduce((sum, c) => sum + cents(c.price_usd as number), 0);

  let discountCents = 0;
  const pack = BST_PACK.imoNumbers.map((n) => courses.find((c) => c.imo_number === n));
  if (pack.every(Boolean)) {
    const packRegularCents = pack.reduce((sum, c) => sum + cents(c!.price_usd as number), 0);
    discountCents = Math.max(0, packRegularCents - cents(BST_PACK.price));
  }

  const totalCents = grossCents - discountCents;
  const depositCents = Math.ceil(Math.round(totalCents * DEPOSIT_RATE * 1e6) / 1e6);
  return {
    total: totalCents / 100,
    deposit: depositCents / 100,
    balance: (totalCents - depositCents) / 100,
    discount: discountCents / 100,
  };
}
