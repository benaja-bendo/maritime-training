import type { Course, VerificationResult, VolunteerInput } from '@/types';
import { COURSES } from '@/data/courses';

// Couche d'accès aux données : les pages n'importent que ce fichier.
// Les cours viennent du fichier statique ; la vérification et les candidatures
// volontaires attendent Firestore (voir CLAUDE.md).

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
