
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVvcxFMgYrIwNyCrcc2dJYjEQR0hz6GrY",
  authDomain: "tarefasplus-3a59f.firebaseapp.com",
  projectId: "tarefasplus-3a59f",
  storageBucket: "tarefasplus-3a59f.firebasestorage.app",
  messagingSenderId: "822800927257",
  appId: "1:822800927257:web:b77e3a30377c602365f888"
};

// Initialize Firebase
const firabaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firabaseApp)

export { db }