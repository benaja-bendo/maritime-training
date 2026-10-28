import type {
  ContactInput,
  Course,
  RegistrationInput,
  RegistrationReceipt,
  VerificationResult,
  VolunteerInput,
} from '@/types';
import { COURSES } from '@/data/courses';
import { computeQuote, DEPOSIT_RATE } from '@/lib/pricing';

// Couche d'accès aux données : les pages n'importent que ce fichier.
// Les cours viennent du fichier statique ; les inscriptions sont enregistrées dans Firestore ;
// la vérification et les candidatures volontaires attendent Firestore (voir CLAUDE.md).

export class ServiceUnavailableError extends Error {
  constructor(message = "Ce service n'est pas encore disponible.") {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

export async function getCourses(): Promise<Course[]> {
  return COURSES;
}

export async function getCourse(id: string): Promise<Course | null> {
  return COURSES.find((c) => c.id === id) ?? null;
}

export async function findStudentByCode(
  _code: string,
): Promise<VerificationResult | null> {
  throw new ServiceUnavailableError(
    "La vérification de documents n'est pas encore disponible.",
  );
}

export async function submitVolunteer(_volunteer: VolunteerInput): Promise<void> {
  throw new ServiceUnavailableError(
    "L'envoi des candidatures n'est pas encore disponible.",
  );
}

// Alphabet sans caractères ambigus (ni 0/O, ni 1/I) ; 32 symboles = pas de biais avec un octet.
const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function newReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return 'PMTS-' + Array.from(bytes, (b) => REFERENCE_ALPHABET[b % 32]).join('');
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

// Crée une pré-inscription. Les montants enregistrés sont indicatifs : le personnel les
// recalcule à partir des tarifs en vigueur. Le public ne peut pas relire le dossier (règles Firestore).
export async function submitRegistration(
  input: RegistrationInput,
): Promise<RegistrationReceipt> {
  const { isFirebaseConfigured, getDb } = await import('@/lib/firebase');
  if (!isFirebaseConfigured) {
    throw new ServiceUnavailableError(
      "Les inscriptions en ligne ne sont pas encore disponibles.",
    );
  }
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

  const reference = newReference();
  const quote = computeQuote(input.courses);

  await withTimeout(
    setDoc(doc(getDb(), 'registrations', reference), {
      reference,
      last_name: input.last_name.trim(),
      first_names: input.first_names.trim(),
      email: input.email.trim(),
      nationality: input.nationality,
      id_type: input.id_type,
      id_number: input.id_number.trim(),
      photo_data_url: input.photo_data_url,
      courses: input.courses.map((c) => ({
        id: c.id,
        name: c.name,
        imo_number: c.imo_number,
        price_usd: c.price_usd,
      })),
      quote_total_usd: quote.total,
      quote_deposit_usd: quote.deposit,
      quote_discount_usd: quote.discount,
      deposit_rate: DEPOSIT_RATE,
      status: 'pending_deposit',
      consent_at: serverTimestamp(),
      created_at: serverTimestamp(),
    }),
    20_000,
  );

  return { reference, quote };
}

// Enregistre un message du formulaire de contact. Le personnel le lit dans la console Firebase.
export async function submitContactMessage(input: ContactInput): Promise<void> {
  const { isFirebaseConfigured, getDb } = await import('@/lib/firebase');
  if (!isFirebaseConfigured) {
    throw new ServiceUnavailableError(
      "L'envoi de messages n'est pas encore disponible.",
    );
  }
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

  await withTimeout(
    addDoc(collection(getDb(), 'contact_messages'), {
      name: input.name.trim(),
      email: input.email.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      created_at: serverTimestamp(),
    }),
    20_000,
  );
}
