import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPJ65l2LhI092rS90DspW7WCOv_autSFo",
  authDomain: "chat-293b0.firebaseapp.com",
  projectId: "chat-293b0",
  storageBucket: "chat-293b0.appspot.com",
  messagingSenderId: "945986124318",
  appId: "1:945986124318:web:66c49099ee92b143568c0f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore()
