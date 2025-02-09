import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

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
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app); // Initialize Firebase Storage

export { db, auth, provider, storage }; 
