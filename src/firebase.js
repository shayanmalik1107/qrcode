// Firebase SDK Initialization and Realtime Database helper utilities
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  increment, 
  serverTimestamp 
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDh3AgexQ7HVkDp1YtqFgvpPizVrHTuoGU",
  authDomain: "qrcode-d2c90.firebaseapp.com",
  projectId: "qrcode-d2c90",
  storageBucket: "qrcode-d2c90.firebasestorage.app",
  messagingSenderId: "308360169174",
  appId: "1:308360169174:web:4b6f3c82bcb5705a9beb77",
  measurementId: "G-CNRKP3PCJY",
  // Standard Realtime Database URL format
  databaseURL: "https://qrcode-d2c90-default-rtdb.firebaseio.com"
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);
export const analytics = typeof window !== "undefined" && firebaseConfig.measurementId ? getAnalytics(app) : null;

// Realtime Database Helper Functions

/**
 * Save a new QR Code record (Dynamic or Static) to Firebase RTDB
 */
export async function saveQrCodeToDb(qrData) {
  const qrRef = ref(db, `qrcodes/${qrData.id}`);
  const payload = {
    ...qrData,
    createdAt: qrData.createdAt || Date.now(),
    updatedAt: Date.now(),
    scans: qrData.scans || 0,
    active: qrData.active !== undefined ? qrData.active : true
  };
  await set(qrRef, payload);
  return payload;
}

/**
 * Update target destination URL for a Dynamic QR code
 * This updates the target link instantly across all existing printed QR codes!
 */
export async function updateQrDestinationUrl(qrId, newDestinationUrl) {
  const qrRef = ref(db, `qrcodes/${qrId}`);
  await update(qrRef, {
    destinationUrl: newDestinationUrl,
    updatedAt: Date.now()
  });
}

/**
 * Toggle Active/Paused state of a Dynamic QR Code
 */
export async function toggleQrActiveState(qrId, isActive) {
  const qrRef = ref(db, `qrcodes/${qrId}`);
  await update(qrRef, {
    active: isActive,
    updatedAt: Date.now()
  });
}

/**
 * Update full QR configuration (title, styles, colors, etc.)
 */
export async function updateQrCodeData(qrId, updates) {
  const qrRef = ref(db, `qrcodes/${qrId}`);
  await update(qrRef, {
    ...updates,
    updatedAt: Date.now()
  });
}

/**
 * Delete a QR Code from database
 */
export async function deleteQrCodeFromDb(qrId) {
  const qrRef = ref(db, `qrcodes/${qrId}`);
  await remove(qrRef);
}

/**
 * Fetch single QR Code by ID once
 */
export async function fetchQrCodeById(qrId) {
  const qrRef = ref(db, `qrcodes/${qrId}`);
  const snapshot = await get(qrRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
}

/**
 * Record a scan event for dynamic QR code (increments scan count & records last scan time)
 */
export async function recordQrScan(qrId) {
  try {
    const qrRef = ref(db, `qrcodes/${qrId}`);
    await update(qrRef, {
      scans: increment(1),
      lastScannedAt: Date.now()
    });
  } catch (err) {
    console.warn("Could not record scan count:", err);
  }
}

/**
 * Subscribe to all QR codes in real-time
 */
export function subscribeToAllQrCodes(callback) {
  const qrListRef = ref(db, 'qrcodes');
  return onValue(qrListRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      // Sort by creation time descending
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(list);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Firebase Realtime DB listener error:", error);
    callback(null, error);
  });
}
