import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Ce module est chargé à la demande (import dynamique depuis data.ts) pour ne pas
// alourdir les pages qui n'utilisent pas Firebase.

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId,
);

let emulatorConnected = false;

export function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(config);
}

export function getDb() {
  const db = getFirestore(getFirebaseApp());

  // Tests locaux uniquement : `VITE_FIRESTORE_EMULATOR=127.0.0.1:8080 npm run dev`.
  // Ignoré dans le build de production (import.meta.env.DEV vaut false).
  const emulator = import.meta.env.DEV ? import.meta.env.VITE_FIRESTORE_EMULATOR : undefined;
  if (emulator && !emulatorConnected) {
    const [host, port] = String(emulator).split(':');
    connectFirestoreEmulator(db, host, Number(port));
    emulatorConnected = true;
  }
  return db;
}
