// ============================================================
//  Firebase Web App Configuration
//  Project: sih-2026-16022
// ============================================================

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDfzKn5_3XFlo9h1Qvr39osQkIdxqfa5q4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sih-2026-16022.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sih-2026-16022",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sih-2026-16022.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "928835805505",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:928835805505:web:8fda3d1f5ef14670c0c1c0",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4LKTHVPBQ0"
};
