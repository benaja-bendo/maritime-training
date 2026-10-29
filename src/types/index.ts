export interface Course {
  id: string;
  imo_number: string | null;
  name: string;
  duration_days: number | null;
  duration_hours: number | null;
  category: string;
  image_url: string | null;
  price_usd: number | null;
  /** Formation du secteur (offshore, énergie, positionnement dynamique...), hors cadre STCW / MLC. */
  framework?: 'industry';
  /** Masquée du site (catalogue, inscription) par l'administration ; reste connue des dossiers existants. */
  hidden?: boolean;
}

export interface Volunteer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string | null;
  experience: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export type VolunteerInput = Pick<
  Volunteer,
  'full_name' | 'email' | 'phone' | 'position' | 'experience' | 'message'
>;

export interface Quote {
  total: number | null;
  deposit: number | null;
  balance: number | null;
  discount: number;
}

export type IdType = 'national_id' | 'passport';

export interface RegistrationInput {
  last_name: string;
  first_names: string;
  email: string;
  nationality: string;
  id_type: IdType;
  id_number: string;
  photo_data_url: string;
  /** Fonction à bord choisie (libellé), facultatif. */
  position?: string;
  courses: Pick<Course, 'id' | 'name' | 'imo_number' | 'price_usd'>[];
}

export interface RegistrationReceipt {
  reference: string;
  quote: Quote;
}

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Certificate {
  course_name: string;
  imo_number: string | null;
  certificate_number: string | null;
  completed_on: string;
  valid_until: string | null;
  revoked: boolean;
}

export interface VerifiedStudent {
  student_code: string;
  full_name: string;
  certificates: Certificate[];
}
