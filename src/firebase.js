// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrZXpaNRtA2xDeLHF-BB_uZ_NKM0Kqre4",
  authDomain: "easyprop-0.firebaseapp.com",
  projectId: "easyprop-0",
  storageBucket: "easyprop-0.firebasestorage.app",
  messagingSenderId: "767804100026",
  appId: "1:767804100026:web:c70862d4511f4572d56183",
  measurementId: "G-CR0TTCT56L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
