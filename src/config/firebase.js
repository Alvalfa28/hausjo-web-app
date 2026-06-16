import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDzqh6tRqN70HRwjpycLBrJqjsvxbFCmao",
  authDomain: "hausjo-piutang.firebaseapp.com",
  projectId: "hausjo-piutang",
  storageBucket: "hausjo-piutang.firebasestorage.app",
  messagingSenderId: "162891450664",
  appId: "1:162891450664:web:48c73ae9b246eab816281d",
  measurementId: "G-4WRVRD4YRS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);