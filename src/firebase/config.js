// ─────────────────────────────────────────────────────────────────────────────
// Firebase Configuration — MathQuestion
// ─────────────────────────────────────────────────────────────────────────────
//
// INSTRUÇÕES DE SETUP (faça uma vez, leva ~5 minutos):
//
// 1. Acesse https://console.firebase.google.com
// 2. Clique em "Criar projeto" → dê um nome (ex: mathquestion) → Continuar
// 3. Desative o Google Analytics se quiser simplificar → Criar projeto
//
// 4. AUTENTICAÇÃO:
//    Menu lateral → Build → Authentication → Get started
//    Aba "Sign-in method" → Email/senha → Ativar → Salvar
//
// 5. BANCO DE DADOS:
//    Menu lateral → Build → Firestore Database → Create database
//    Escolha "Start in test mode" → Selecione uma região → Done
//
// 6. CREDENCIAIS:
//    Engrenagem (⚙️) → Project settings → Aba "General"
//    Em "Your apps", clique em </> (Web) → registre o app → copie o firebaseConfig
//    Cole os valores abaixo substituindo os campos SUA_*
//
// ─────────────────────────────────────────────────────────────────────────────

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrd7WYvRIHmZNTXQCU8XKFSIpfCY_Cgw4",
  authDomain: "mathquestion-c4d9b.firebaseapp.com",
  projectId: "mathquestion-c4d9b",
  storageBucket: "mathquestion-c4d9b.firebasestorage.app",
  messagingSenderId: "204576212562",
  appId: "1:204576212562:web:25d2f4b51083d0c32d418b",
  measurementId: "G-QP9W5B25Q9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
