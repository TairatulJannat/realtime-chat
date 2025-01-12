import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsZwpekd2SiqK9MbQVTa2mOajfd_VCPbc",
  authDomain: "real-time-chat-4a3ea.firebaseapp.com",
  projectId: "real-time-chat-4a3ea",
  storageBucket: "real-time-chat-4a3ea.firebasestorage.app",
  messagingSenderId: "841240775259",
  appId: "1:841240775259:web:81078601cd603de7404d7e",
  measurementId: "G-9B509YMNE9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the auth, provider, and db instances
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
