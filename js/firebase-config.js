// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyC9lITDXrnB25Z2KF-2MGWzFicNmSG3uMU",
  authDomain: "bharatcomfort-da7b8.firebaseapp.com",
  projectId: "bharatcomfort-da7b8",
  storageBucket: "bharatcomfort-da7b8.firebasestorage.app",
  messagingSenderId: "31739822460",
  appId: "1:31739822460:web:6ef474ead7177fd21f24f9"
};

// Init
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
