// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDrMtPxkrAJnmGBbdcP1TvawEyYrOsdEiM",
  authDomain: "kaj-si-vaka-4d2ed.firebaseapp.com",
  projectId: "kaj-si-vaka-4d2ed",
  storageBucket: "kaj-si-vaka-4d2ed.firebasestorage.app",
  messagingSenderId: "502911058432",
  appId: "1:502911058432:web:775c51b8cef2aa823ccee5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
