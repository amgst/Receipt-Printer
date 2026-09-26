import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmtmmjVZTZc7u_FWQiU3KZGSl3bZHS7rk",
  authDomain: "receipt-printer-4df14.firebaseapp.com",
  projectId: "receipt-printer-4df14",
  storageBucket: "receipt-printer-4df14.firebasestorage.app",
  messagingSenderId: "663791156046",
  appId: "1:663791156046:web:edc51b2723554790547c1f",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export async function currentUser() {
  await auth.authStateReady();
  return auth.currentUser;
}
