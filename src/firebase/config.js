import { initializeApp } from "firebase/app";
import { getAuth }       from "firebase/auth";
import { getFirestore }  from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyCrd7WYvRIHmZNTXQCU8XKFSIpfCY_Cgw4",
  authDomain:        "mathquestion-c4d9b.firebaseapp.com",
  projectId:         "mathquestion-c4d9b",
  storageBucket:     "mathquestion-c4d9b.firebasestorage.app",
  messagingSenderId: "204576212562",
  appId:             "1:204576212562:web:25d2f4b51083d0c32d418b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
