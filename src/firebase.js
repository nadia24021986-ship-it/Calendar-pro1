import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Konfigurasi Firebase milik Smart calendar pro1
const firebaseConfig = {
  apiKey: "AIzaSyAMx5Rk8r5mi207VOXv-0lXWSOwLFK6gBM",
  authDomain: "smart-calendar-pro1.firebaseapp.com",
  projectId: "smart-calendar-pro1",
  storageBucket: "smart-calendar-pro1.firebasestorage.app",
  messagingSenderId: "619060382509",
  appId: "1:619060382509:web:68db1091373225a47421a4",
  measurementId: "G-PKG2PXFV7V"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Otomatis login anonim agar sinkron dengan fitur Authentication kamu
signInAnonymously(auth).catch((error) => console.error("Auth Error:", error));

export { db, auth };
