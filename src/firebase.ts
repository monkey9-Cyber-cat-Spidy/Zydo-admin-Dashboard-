import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDQmbfBGDYcTg-p05HueiWfzj4cvPPI_kI",
  authDomain: "main-database-44d65.firebaseapp.com",
  projectId: "main-database-44d65",
  storageBucket: "main-database-44d65.firebasestorage.app",
  messagingSenderId: "705093026337",
  appId: "1:705093026337:web:e059dd9e49707fc0c25960",
  measurementId: "G-LQQ08YN4C2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
