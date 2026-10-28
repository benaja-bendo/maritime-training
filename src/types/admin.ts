import type { IdType } from '@/types';

export type CertStatus = 'draft' | 'published' | 'revoked';
export type SessionMode = 'in_person' | 'online' | 'blended';

export interface AdminCertificate {
  id: string;
  course_name: string;
  imo_number: string | null;
  certificate_number: string;
  completed_on: string;
  valid_until: string;
  session_start: string;
  session_end: string;
  mode: SessionMode | '';
  result: 'passed' | '';
  assessor: string;
  status: CertStatus;
  revoked_reason: string;
  published_by: string;
  published_on: string;
}

// Dossier de travail du personnel (collection admin_students) : contient les brouillons,
// les numéros de pièce et les notes. Jamais lisible par le public.
export interface AdminStudent {
  id: string;
  student_code: string;
  full_name: string;
  national_id: string;
  passport: string;
  notes: string;
  certificates: AdminCertificate[];
}

export type RegistrationStatus =
  | 'pending_deposit'
  | 'deposit_paid'
  | 'in_training'
  | 'balance_due'
  | 'completed'
  | 'cancelled';

export interface RegistrationPayments {
  deposit_usd: number | null;
  deposit_on: string;
  balance_usd: number | null;
  balance_on: string;
}

export interface AdminRegistration {
  reference: string;
  created_at: string;
  last_name: string;
  first_names: string;
  email: string;
  nationality: string;
  id_type: IdType;
  id_number: string;
  photo_data_url: string;
  courses: { id: string; name: string; imo_number: string | null; price_usd: number | null }[];
  quote_total_usd: number | null;
  quote_deposit_usd: number | null;
  quote_discount_usd: number;
  status: RegistrationStatus;
  payments: RegistrationPayments;
  admin_notes: string;
}

export interface AdminMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
  handled_by: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  student_id: string;
  registration: string;
  detail: string;
}
