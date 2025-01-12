import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "./firebase"; // Import the firebase.js configuration
import { useDispatch } from "react-redux";
import { setUser } from "./authSlice";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore methods
import './Auth.css';

const Auth = () => {
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Dispatch the user information to the Redux store
      dispatch(setUser({
        name: user.displayName,
        photo: user.photoURL,
        email: user.email
      }));

      // Add user details to Firestore "users" collection if not already added
      const userRef = doc(db, "users", user.uid); // Reference to the user's document in Firestore

      // Set the user data in Firestore
      await setDoc(userRef, {
        name: user.displayName,
        photo: user.photoURL,
        email: user.email,
        uid: user.uid,
        createdAt: new Date() // Store the registration date
      });

    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="auth-container">
      <button className="google-btn" onClick={handleLogin}>
        <img src="/images/google_img.png" alt="Google logo" className="google-logo" />
        Sign in with Google
      </button>
    </div>
  );
};

export default Auth;
