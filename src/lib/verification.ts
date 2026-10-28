// Logique partagée entre le site et le script d'import (scripts/import-certificates.mjs).
// Syntaxe TypeScript « effaçable » uniquement (pas d'enum) : Node doit pouvoir l'exécuter tel quel.

export type VerificationMethod = 'student_code' | 'national_id' | 'passport';
export type CertificateStatus = 'valid' | 'expired';

// Majuscules, sans accents, sans espaces ni tirets : « 8-123-456 » et « 8123456 » donnent la même clé.
export function normalizeIdentifier(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

// Les numéros ne sont jamais utilisés en clair comme identifiants de documents :
// la clé est l'empreinte SHA-256 de « méthode:numéro normalisé ».
export async function lookupKey(method: VerificationMethod, raw: string): Promise<string> {
  const data = new TextEncoder().encode(`${method}:${normalizeIdentifier(raw)}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Date du jour au Panama (UTC-5, sans heure d'été) au format AAAA-MM-JJ.
export function todayInPanama(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Panama' }).format(now);
}

// Un certificat reste valide pendant toute la journée de sa date d'échéance.
// Sans date d'échéance, il n'expire pas.
export function certificateStatus(
  validUntil: string | null,
  today: string = todayInPanama(),
): CertificateStatus {
  return validUntil !== null && validUntil < today ? 'expired' : 'valid';
}
