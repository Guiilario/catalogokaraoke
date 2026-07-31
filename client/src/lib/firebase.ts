// BarberPro — Firebase/Firestore configuration
// Theme: Dark Precision — amber accents on deep black
// Reads config from env vars (production) or localStorage (user-configured)
import { initializeApp, getApps, deleteApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

function getFirebaseConfig() {
  // Priority: env vars > localStorage > demo
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
    || localStorage.getItem("fb_apiKey")
    || "";
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    || localStorage.getItem("fb_authDomain")
    || "";
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
    || localStorage.getItem("fb_projectId")
    || "";
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
    || localStorage.getItem("fb_storageBucket")
    || "";
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    || localStorage.getItem("fb_messagingSenderId")
    || "";
  const appId = import.meta.env.VITE_FIREBASE_APP_ID
    || localStorage.getItem("fb_appId")
    || "";

  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

const config = getFirebaseConfig();

// Initialize Firebase (avoid duplicate app error)
const existingApps = getApps();
const app = existingApps.length > 0
  ? existingApps[0]
  : initializeApp(config);

export const db = getFirestore(app);
export const isConfigured = !!(config.apiKey && config.projectId);

export {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
};

// Firestore Collections:
// users/{phone} — { name, phone, createdAt }
// appointments/{id} — { userId, userName, userPhone, date, time, service, serviceName, price, status, createdAt }
// cashSessions/{id} — { date, openedAt, closedAt, status: 'open'|'closed', totalRevenue, totalAppointments }
