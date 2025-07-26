// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHHoUdYgpDlWqaIUc8l9rWgWXUSTABF4c",
  authDomain: "spot-a-john-1bb1e.firebaseapp.com",
  projectId: "spot-a-john-1bb1e",
  storageBucket: "spot-a-john-1bb1e.firebasestorage.app",
  messagingSenderId: "527977264499",
  appId: "1:527977264499:web:d155469eee924b120f8106",
  measurementId: "G-PNKYSREM26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider };