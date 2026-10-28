import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getDb, getFirebaseApp } from '@/lib/firebase';

// Ce module n'est chargé que par l'espace d'administration.

let auth: Auth | null = null;

export function getAuthInstance(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    // Tests locaux uniquement : VITE_AUTH_EMULATOR=127.0.0.1:9099 npm run dev
    const emulator = import.meta.env.DEV ? import.meta.env.VITE_AUTH_EMULATOR : undefined;
    if (emulator) {
      connectAuthEmulator(auth, `http://${emulator}`, { disableWarnings: true });
      const instance = auth;
      (window as unknown as { __signInAs?: (email: string) => Promise<void> }).__signInAs = async (
        email,
      ) => {
        const fake = JSON.stringify({ sub: email, email, email_verified: true });
        await signInWithCredential(instance, GoogleAuthProvider.credential(fake));
      };
    }
  }
  return auth;
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(getAuthInstance(), new GoogleAuthProvider());
}

export async function signOutAdmin(): Promise<void> {
  await signOut(getAuthInstance());
}

export function watchAuth(cb: (email: string | null) => void): () => void {
  return onAuthStateChanged(getAuthInstance(), (user) =>
    cb(user?.email && user.emailVerified ? user.email.toLowerCase() : null),
  );
}

// Les règles Firestore font foi ; cette lecture sert seulement à choisir l'écran à afficher.
export async function isAdminEmail(email: string): Promise<boolean> {
  const snap = await getDoc(doc(getDb(), 'admins', email.toLowerCase()));
  return snap.exists();
}
