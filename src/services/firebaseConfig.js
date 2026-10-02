// ============================================================
//  Firebase Web SDK & Cloud Firestore Configuration
//  Project: sih-2026-16022
// ============================================================

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDfzKn5_3XFlo9h1Qvr39osQkIdxqfa5q4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sih-2026-16022.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sih-2026-16022",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sih-2026-16022.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "928835805505",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:928835805505:web:8fda3d1f5ef14670c0c1c0",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4LKTHVPBQ0"
};

export const DEFAULT_FIREBASE_CONFIG = firebaseConfig;

// Initialize Firebase App instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore database
export const db = getFirestore(app);

// Initialize Firebase Analytics (safe for browser environments)
export let analytics = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn("Firebase Analytics could not be initialized:", err.message);
    });
}

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("YOUR_")
  );
}

export default app;
