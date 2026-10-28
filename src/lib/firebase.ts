import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

export function getDb() {
  const app = getApps().length ? getApp() : initializeApp(config);
  return getFirestore(app);
}
