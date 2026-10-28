import type { RegistrationStatus } from '@/types/admin';

export const inputCls = 'input-field !py-2 text-sm';

export function fmtDateTime(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    timeZone: 'America/Panama',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const REGISTRATION_STATUS: Record<RegistrationStatus, { label: string; cls: string }> = {
  pending_deposit: { label: 'En attente d’avance', cls: 'bg-amber-500/10 text-amber-300' },
  deposit_paid: { label: 'Avance payée', cls: 'bg-sky-500/10 text-sky-300' },
  in_training: { label: 'En formation', cls: 'bg-indigo-500/10 text-indigo-300' },
  balance_due: { label: 'Solde à régler', cls: 'bg-orange-500/10 text-orange-300' },
  completed: { label: 'Terminée (documents remis)', cls: 'bg-emerald-500/10 text-emerald-300' },
  cancelled: { label: 'Annulée', cls: 'bg-red-500/10 text-red-300' },
};
