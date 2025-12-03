import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAY0e7NjDu9hskB8iETY4VdMC_QhAB_Hh8",
  authDomain: "study-sync-tasks-8312d.firebaseapp.com",
  projectId: "study-sync-tasks-8312d",
  storageBucket: "study-sync-tasks-8312d.firebasestorage.app",
  messagingSenderId: "669331807298",
  appId: "1:669331807298:web:2c57cc0979d0192fb9a1db"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
