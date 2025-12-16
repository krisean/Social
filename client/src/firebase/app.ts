import { initializeApp, getApps } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  connectAuthEmulator,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";

const fallbackConfig = {
  apiKey: "demo",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "0",
  appId: "demo-app",
  databaseURL: "https://demo-project.firebaseio.com",
} as const;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    fallbackConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL || fallbackConfig.databaseURL,
} as const;

const missingKeys = Object.entries({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}).filter(([, value]) => !value);

export const isPreviewMode = missingKeys.length > 0;

if (isPreviewMode) {
  console.warn(
    "Firebase configuration not found. Running in preview mode with mock credentials. Backend calls will fail until real config is provided.",
  );
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);
const functions = getFunctions(
  app,
  import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || "us-central1",
);
const database = getDatabase(app);

const useEmulators =
  !isPreviewMode && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";

if (useEmulators) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(firestore, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
  connectDatabaseEmulator(database, "localhost", 9000);
}

if (!isPreviewMode) {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Fallback to in-memory persistence if local storage unavailable
  });
}

export async function ensureAnonymousAuth() {
  if (isPreviewMode) {
    return null;
  }
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  return auth.currentUser;
}

export async function signInWithEmail(email: string, password: string) {
  if (isPreviewMode) {
    throw new Error("Authentication not available in preview mode");
  }
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function createUserWithEmail(
  email: string,
  password: string,
  displayName?: string,
) {
  if (isPreviewMode) {
    throw new Error("Authentication not available in preview mode");
  }
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
}

export async function signOutUser() {
  if (isPreviewMode) {
    return;
  }
  return await signOut(auth);
}

export async function signInAnonymouslyUser() {
  if (isPreviewMode) {
    return null;
  }
  return await signInAnonymously(auth);
}

export { app, auth, firestore, functions, database };
