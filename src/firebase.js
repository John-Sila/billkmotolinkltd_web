import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// Same Firebase project the Flutter app talks to (billk1), pulled from
// lib/services/firebase_options.dart. Web API keys are not secrets — access
// is enforced by Firestore security rules, not by hiding this config — but
// it's still read from env vars first so a deployment can point elsewhere
// without a code change.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCuuQBY-oktLkfi3q6T7RwL4q_XsBJ-K3k',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'billk1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'billk1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'billk1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || '913993722547',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:913993722547:web:e90b28d36ee32a4be45ec6',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-M4V2210K36',
};

export const app = initializeApp(firebaseConfig);

// Persistent local cache (IndexedDB) + multi-tab sync mirrors the Flutter
// app's `persistenceEnabled: true` — the console loads instantly from cache
// on repeat visits and stays usable on flaky connections.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});
