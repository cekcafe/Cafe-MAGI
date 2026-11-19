import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";

export const authReady = !!auth;
export const watchUser = (cb) => { if (auth) onAuthStateChanged(auth, cb); };
export const login = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
export const register = (email, pass) => createUserWithEmailAndPassword(auth, email, pass);
export const logout = () => signOut(auth);

const MESSAGES = {
  "auth/invalid-credential": "Email atau kata sandi salah.",
  "auth/email-already-in-use": "Email ini sudah terdaftar. Silakan masuk.",
  "auth/invalid-email": "Format email tidak valid.",
  "auth/weak-password": "Kata sandi terlalu lemah."
};
export const authError = (e) => MESSAGES[e.code] || "Gagal masuk. Periksa koneksi lalu coba lagi.";
