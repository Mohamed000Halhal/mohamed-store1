import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC0BjvQRGMxQMwksldcawRwQa54Q_h2XMc",
  authDomain: "mohamedemara-79f1a.firebaseapp.com",
  projectId: "mohamedemara-79f1a",
  storageBucket: "mohamedemara-79f1a.firebasestorage.app",
  messagingSenderId: "271024419210",
  appId: "1:271024419210:web:3e43ddec7c8aaeb8c85873",
  measurementId: "G-9ECM4W877L"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
