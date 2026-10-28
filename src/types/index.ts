export interface Course {
  id: string;
  imo_number: string | null;
  name: string;
  duration_days: number | null;
  duration_hours: number | null;
  category: string;
  image_url: string | null;
  price_usd: number | null;
}

export interface Student {
  id: string;
  student_code: string;
  full_name: string;
  nationality: string | null;
  date_of_birth: string | null;
  photo_url: string | null;
}

export interface StudentCourse {
  id: string;
  student_id: string;
  course_id: string;
  completion_date: string | null;
  certificate_number: string | null;
  status: string;
  course: Course;
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

export interface VerificationResult {
  student: Student;
  courses: StudentCourse[];
}

export type VolunteerInput = Pick<
  Volunteer,
  'full_name' | 'email' | 'phone' | 'position' | 'experience' | 'message'
>;

export interface Quote {
  total: number | null;
  deposit: number | null;
  balance: number | null;
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
  courses: Pick<Course, 'id' | 'name' | 'price_usd'>[];
}

export interface RegistrationReceipt {
  reference: string;
  quote: Quote;
}
