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

import { initializeApp } from "firebase/app";
import { getAuth }       from "firebase/auth";
import { getFirestore }  from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
