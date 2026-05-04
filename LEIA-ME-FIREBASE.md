# MathQuestion v4 — Setup Firebase (5 minutos)

O backend Flask foi **removido completamente**.
Autenticação e banco de dados agora rodam no Firebase (gratuito).

---

## 1. Criar o projeto no Firebase

1. Acesse https://console.firebase.google.com
2. Clique em **"Criar projeto"** → dê um nome (ex: `mathquestion`) → Continuar
3. Desative o Google Analytics se quiser → **Criar projeto**

---

## 2. Ativar Autenticação (Email/Senha)

1. Menu lateral → **Build → Authentication → Get started**
2. Aba **"Sign-in method"** → **Email/senha** → Ativar → **Salvar**

---

## 3. Criar o banco de dados (Firestore)

1. Menu lateral → **Build → Firestore Database → Create database**
2. Escolha **"Start in test mode"** (ideal para desenvolvimento)
3. Selecione uma região próxima (ex: `southamerica-east1`) → **Done**

> ⚠️ O modo "test mode" expira em 30 dias.
> Para produção, configure as regras de segurança (veja abaixo).

---

## 4. Copiar as credenciais

1. Clique na **engrenagem ⚙️** → **Project settings** → aba **"General"**
2. Em **"Your apps"**, clique em **</>** (Web App)
3. Dê um apelido (ex: `mathquestion-web`) → **Register app**
4. Copie o objeto `firebaseConfig` que aparecer

---

## 5. Colar as credenciais no projeto

Abra o arquivo:
```
mathquestion/src/firebase/config.js
```

Substitua os valores `SUA_*` pelos valores copiados:

```js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "mathquestion-xxxxx.firebaseapp.com",
  projectId:         "mathquestion-xxxxx",
  storageBucket:     "mathquestion-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123...",
};
```

---

## 6. Instalar e rodar

```bash
cd mathquestion
npm install
npm run dev
```

Acesse: http://localhost:5173 — pronto! 🎉

---

## Estrutura do banco de dados (Firestore)

```
students/
  {uid}/                        ← documento do aluno (name, email, grade)
    modules/
      {moduleId}/               ← resultado por módulo (score, xp, correct, total, timeMs)
    diagnostics/
      attempt_1/                ← 1º diagnóstico (score, correct, total)
      attempt_2/                ← 2º diagnóstico (score, correct, total)
```

---

## Regras de segurança (para produção)

No console do Firebase → **Firestore → Rules**, cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Isso garante que cada aluno só acessa os próprios dados.

---

## O que mudou em relação à versão anterior

| Antes | Agora |
|-------|-------|
| Backend Flask (`app.py`) | ❌ Removido |
| SQLite (`mathquestion.db`) | ❌ Removido |
| `pip install` + `python app.py` | ❌ Não necessário |
| `fetch("http://localhost:5000/...")` | ❌ Removido |
| Firebase Auth | ✅ Login/cadastro |
| Firestore | ✅ Progresso persistido |
| Sessão automática | ✅ Aluno continua logado ao reabrir |
