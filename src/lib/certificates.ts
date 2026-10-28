import { todayInPanama } from '@/lib/verification';
import type { AdminCertificate, AdminStudent } from '@/types/admin';

// Règles métier des certificats, sans dépendance à Firebase (testables seules).

export const emptyStudent = (): AdminStudent => ({
  id: '',
  student_code: '',
  full_name: '',
  national_id: '',
  passport: '',
  notes: '',
  certificates: [],
});

export const newCertificate = (course: {
  name: string;
  imo_number: string | null;
}): AdminCertificate => ({
  id: crypto.randomUUID(),
  course_name: course.name,
  imo_number: course.imo_number,
  certificate_number: '',
  completed_on: '',
  valid_until: '',
  session_start: '',
  session_end: '',
  mode: '',
  result: '',
  assessor: '',
  status: 'draft',
  revoked_reason: '',
  published_by: '',
  published_on: '',
});

// Ce qu'il faut renseigner avant qu'un certificat puisse être vu du public.
export function missingForPublish(c: AdminCertificate, today = todayInPanama()): string[] {
  const out: string[] = [];
  if (!c.certificate_number.trim()) out.push('numéro de certificat');
  if (!c.completed_on) out.push('date d’obtention');
  if (!c.session_start) out.push('début de session');
  if (!c.session_end) out.push('fin de session');
  if (!c.mode) out.push('mode (présentiel, en ligne, mixte)');
  if (c.result !== 'passed') out.push('résultat « réussi »');
  if (!c.assessor.trim()) out.push('évaluateur');
  if (c.session_start && c.session_end && c.session_end < c.session_start) {
    out.push('fin de session antérieure au début');
  }
  if (c.completed_on && c.session_start && c.completed_on < c.session_start) {
    out.push('date d’obtention antérieure au début de session');
  }
  if (c.completed_on && c.completed_on > today) out.push('date d’obtention dans le futur');
  if (c.valid_until && c.completed_on && c.valid_until < c.completed_on) {
    out.push('échéance antérieure à l’obtention');
  }
  return out;
}
