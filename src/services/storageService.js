// ============================================================
//  Storage Service: Firebase Cloud Firestore + Local Cache
//  Provides persistent cloud synchronization for:
//  - Plant pathology detections & image analyses
//  - Field rover missions & boundary polygons
//  - Live inspection telemetry logs
// ============================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { DEFAULT_FIREBASE_CONFIG } from './firebaseConfig';
import { DETECTION_HISTORY } from '../data/mockData';

const LOCAL_STORAGE_DETECTIONS_KEY = 'kisan_ai_detection_history';
const LOCAL_STORAGE_MISSIONS_KEY = 'kisan_ai_saved_missions';

let db = null;
let firebaseInitialized = false;

// Check if valid Firebase configuration is present
export function isFirebaseConfigured() {
  const cfg = DEFAULT_FIREBASE_CONFIG;
  return Boolean(
    cfg &&
    cfg.projectId &&
    cfg.apiKey &&
    !cfg.apiKey.includes('YOUR_') &&
    !cfg.projectId.includes('demo')
  );
}

// Initialize Firebase App & Firestore if valid config exists
export function initFirebase() {
  if (firebaseInitialized && db) return db;
  try {
    const cfg = DEFAULT_FIREBASE_CONFIG;
    if (isFirebaseConfigured()) {
      const app = getApps().length === 0 ? initializeApp(cfg) : getApp();
      db = getFirestore(app);
      firebaseInitialized = true;
      console.log('✅ Firebase Cloud Firestore initialized for project:', cfg.projectId);
      return db;
    }
  } catch (err) {
    console.warn('⚠️ Firebase initialization deferred, using local persistent storage:', err.message);
  }
  return null;
}

// Trigger initial connection attempt
initFirebase();

// ─────────────────────────────────────────────
// Detection Records (Image Analysis History)
// ─────────────────────────────────────────────

export async function saveDetectionRecord(record) {
  const newRecord = {
    id: record.id || `DET-${Date.now().toString().slice(-6)}`,
    date: record.date || new Date().toISOString().slice(0, 10),
    time: record.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    module: record.module || 'Disease',
    crop: record.crop || 'Unknown',
    result: record.disease_name || record.result || 'Early Blight',
    confidence: record.confidence ? Number(record.confidence) : 94.8,
    severity: record.severity || 'High Severity',
    status: record.status || (record.severity === 'Healthy' ? 'Resolved' : 'Action Required'),
    cause: record.cause || '',
    cure: record.cure || '',
    imageUrl: record.imageUrl || null,
    pesticide_advisory: record.pesticide_advisory || null,
    nutrient_analysis: record.nutrient_analysis || null,
    createdAt: new Date().toISOString(),
  };

  // 1. Always persist to localStorage for instant offline access
  try {
    const stored = getLocalDetections();
    const updated = [newRecord, ...stored];
    localStorage.setItem(LOCAL_STORAGE_DETECTIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kisan_detections_updated', { detail: updated }));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  // 2. Persist to Firebase Cloud Firestore if configured
  const firestore = initFirebase();
  if (firestore) {
    try {
      const docRef = await addDoc(collection(firestore, 'detections'), {
        ...newRecord,
        serverTimestamp: serverTimestamp(),
      });
      console.log('☁️ Synced detection to Firestore document ID:', docRef.id);
      newRecord.firestoreId = docRef.id;
    } catch (err) {
      console.error('Failed to sync detection to Firebase Firestore:', err);
    }
  }

  return newRecord;
}

export function getLocalDetections() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_DETECTIONS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to parse local detections:', e);
  }
  // Initialize with initial mock history if brand new
  return DETECTION_HISTORY;
}

export async function fetchAllDetections() {
  const firestore = initFirebase();
  if (firestore) {
    try {
      const q = query(collection(firestore, 'detections'), orderBy('createdAt', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const cloudRecords = [];
      querySnapshot.forEach((docSnap) => {
        cloudRecords.push({ firestoreId: docSnap.id, ...docSnap.data() });
      });

      if (cloudRecords.length > 0) {
        // Cache to localStorage
        localStorage.setItem(LOCAL_STORAGE_DETECTIONS_KEY, JSON.stringify(cloudRecords));
        return cloudRecords;
      }
    } catch (err) {
      console.warn('Firestore fetch failed, using local cache:', err.message);
    }
  }

  return getLocalDetections();
}

// ─────────────────────────────────────────────
// Rover Missions Storage
// ─────────────────────────────────────────────

export async function saveRoverMission(missionPayload) {
  const missionId = missionPayload.mission_id || `mission_${Date.now()}`;
  const fullMission = {
    ...missionPayload,
    mission_id: missionId,
    created_at: missionPayload.created_at || new Date().toISOString(),
  };

  // Local storage
  try {
    const localMissions = getLocalMissions();
    const filtered = localMissions.filter(m => m.mission_id !== missionId);
    const updated = [fullMission, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_MISSIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kisan_missions_updated', { detail: updated }));
  } catch (e) {
    console.warn('Failed to save mission locally:', e);
  }

  // Firestore sync
  const firestore = initFirebase();
  if (firestore) {
    try {
      await addDoc(collection(firestore, 'missions'), {
        ...fullMission,
        serverTimestamp: serverTimestamp(),
      });
      console.log('☁️ Synced mission to Firestore');
    } catch (err) {
      console.warn('Failed to sync mission to Firestore:', err);
    }
  }

  return { success: true, mission_id: missionId };
}

export function getLocalMissions() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_MISSIONS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to parse local missions:', e);
  }
  return [];
}

export async function fetchAllMissions() {
  const firestore = initFirebase();
  if (firestore) {
    try {
      const q = query(collection(firestore, 'missions'), orderBy('created_at', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ firestoreId: docSnap.id, ...docSnap.data() });
      });
      if (list.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_MISSIONS_KEY, JSON.stringify(list));
        return list;
      }
    } catch (e) {
      console.warn('Firestore missions fetch failed, using local cache:', e.message);
    }
  }
  return getLocalMissions();
}
