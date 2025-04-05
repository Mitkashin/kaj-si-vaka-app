// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  browserLocalPersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'; // works for both native & web

const firebaseConfig = {
  apiKey: "AIzaSyDrMtPxkrAJnmGBbdcP1TvawEyYrOsdEiM",
  authDomain: "kaj-si-vaka-4d2ed.firebaseapp.com",
  projectId: "kaj-si-vaka-4d2ed",
  storageBucket: "kaj-si-vaka-4d2ed.firebasestorage.app",
  messagingSenderId: "502911058432",
  appId: "1:502911058432:web:775c51b8cef2aa823ccee5"
};
const app = initializeApp(firebaseConfig);

// 🔥 Platform-specific Auth Persistence
let auth;

if (Platform.OS === 'web') {
  // Web uses browserLocalPersistence
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);
} else {
  // Native (iOS/Android) uses AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const db = getFirestore(app);
const storage = getStorage(app);
const realtimeDb = getDatabase(app);

export { app, auth, db, storage, realtimeDb };