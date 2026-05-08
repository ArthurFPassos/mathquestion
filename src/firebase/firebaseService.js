// ─────────────────────────────────────────────────────────────────────────────
// Firebase Service — todas as operações de auth e banco em um só lugar
// ─────────────────────────────────────────────────────────────────────────────

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./config";

// ── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Cadastra novo aluno.
 * Cria conta no Firebase Auth e salva perfil no Firestore.
 * Retorna objeto { uid, name, email, grade } ou lança erro.
 */
export async function registerStudent({ name, email, password, grade }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  // Atualiza displayName no Auth
  await updateProfile(credential.user, { displayName: name });

  // Salva perfil completo no Firestore
  await setDoc(doc(db, "students", uid), {
    name,
    email,
    grade,
    createdAt: serverTimestamp(),
  });

  return { uid, name, email, grade };
}

/**
 * Autentica aluno existente.
 * Retorna { uid, name, email, grade } ou lança erro.
 */
export async function loginStudent({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  const snap = await getDoc(doc(db, "students", uid));
  if (!snap.exists()) throw new Error("Perfil de aluno não encontrado.");

  const data = snap.data();
  return { uid, name: data.name, email: data.email, grade: data.grade };
}

/**
 * Encerra sessão do aluno.
 */
export async function logoutStudent() {
  await signOut(auth);
}

// ── Progresso ─────────────────────────────────────────────────────────────────

/**
 * Carrega todo o progresso do aluno (módulos + diagnósticos) do Firestore.
 * Retorna { moduleResults, totalXP, diagnostics }
 */
export async function loadProgress(uid) {
  // Módulos
  const modulesSnap = await getDocs(collection(db, "students", uid, "modules"));
  const moduleResults = {};
  let totalXP = 0;

  modulesSnap.forEach((d) => {
    const data = d.data();
    moduleResults[d.id] = {
      score:     data.score,
      xp:        data.xp,
      correct:   data.correct,
      total:     data.total,
      timeMs:    data.timeMs,
      completed: data.completed,
    };
    totalXP += data.xp || 0;
  });

  // Diagnósticos
  const diagSnap = await getDocs(collection(db, "students", uid, "diagnostics"));
  const diagnostics = [];
  diagSnap.forEach((d) => diagnostics.push({ id: d.id, ...d.data() }));
  diagnostics.sort((a, b) => a.attempt - b.attempt);

  return { moduleResults, totalXP, diagnostics };
}

/**
 * Salva (ou atualiza se melhorou) o resultado de um módulo.
 */
export async function saveModuleResult(uid, moduleId, result) {
  const ref  = doc(db, "students", uid, "modules", moduleId);
  const snap = await getDoc(ref);

  // Só sobrescreve se for uma pontuação melhor
  if (snap.exists() && snap.data().score >= result.score) return;

  await setDoc(ref, {
    ...result,
    completedAt: serverTimestamp(),
  });
}

/**
 * Salva resultado de diagnóstico (1º ou 2º).
 * attempt: 1 | 2
 */
export async function saveDiagnostic(uid, attempt, score, correct, total) {
  await setDoc(doc(db, "students", uid, "diagnostics", `attempt_${attempt}`), {
    attempt,
    score,
    correct,
    total,
    completedAt: serverTimestamp(),
  });
}

/**
 * Salva flag de demo concluída por unidade.
 */
export async function saveDemoCompleted(uid, unitId) {
  const ref = doc(db, "students", uid);
  await setDoc(ref, { [`demoCompleted_${unitId}`]: true }, { merge: true });
}

/**
 * Traduz erro do Firebase para mensagem amigável em português.
 */
export function firebaseErrorMsg(error) {
  const code = error?.code || "";
  const map = {
    "auth/email-already-in-use":   "Este e-mail já está cadastrado.",
    "auth/invalid-email":          "E-mail inválido.",
    "auth/weak-password":          "A senha deve ter ao menos 6 caracteres.",
    "auth/user-not-found":         "E-mail ou senha incorretos.",
    "auth/wrong-password":         "E-mail ou senha incorretos.",
    "auth/invalid-credential":     "E-mail ou senha incorretos.",
    "auth/too-many-requests":      "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Sem conexão. Verifique sua internet.",
  };
  return map[code] || "Erro inesperado. Tente novamente.";
}

// ── Professor Auth ────────────────────────────────────────────────────────────

/**
 * Cadastra novo professor.
 */
export async function registerTeacher({ name, email, password, school }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  await updateProfile(credential.user, { displayName: name });

  await setDoc(doc(db, "users", uid), {
    name, email, school,
    role: "professor",
    createdAt: serverTimestamp(),
  });

  return { uid, name, email, school, role: "professor" };
}

/**
 * Busca o role do usuário no Firestore após login.
 * Retorna "aluno" | "professor"
 */
export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return "aluno";
  return snap.data().role || "aluno";
}

// ── Módulos do Professor ──────────────────────────────────────────────────────

/**
 * RF25 — Gera código único: 2 números + 3 letras em posições aleatórias.
 * Exemplo: A4X9B, 3BK7R
 */
export function generateModuleCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // sem I e O (confusos)
  const digits  = "23456789";                  // sem 0 e 1 (confusos)

  // Posições 0-4 → escolhe aleatoriamente 2 para dígitos, 3 para letras
  const positions = [0, 1, 2, 3, 4];
  const digitPositions = [];
  while (digitPositions.length < 2) {
    const idx = Math.floor(Math.random() * positions.length);
    digitPositions.push(positions.splice(idx, 1)[0]);
  }
  const letterPositions = positions;

  const code = Array(5).fill(null);
  digitPositions.forEach((p) => {
    code[p] = digits[Math.floor(Math.random() * digits.length)];
  });
  letterPositions.forEach((p) => {
    code[p] = letters[Math.floor(Math.random() * letters.length)];
  });

  return code.join("");
}

/**
 * RF26 + RNF07 — Salva módulo do professor no Firestore.
 * Estrutura: modules/{code} → { title, teacherUid, questions[], createdAt }
 */
export async function saveTeacherModule({ teacherUid, title, questions }) {
  const code = generateModuleCode();

  // Garante unicidade: se o código já existe, gera outro
  let ref  = doc(db, "modules", code);
  let snap = await getDoc(ref);
  let finalCode = code;
  while (snap.exists()) {
    finalCode = generateModuleCode();
    ref  = doc(db, "modules", finalCode);
    snap = await getDoc(ref);
  }

  await setDoc(ref, {
    title,
    teacherUid,
    code: finalCode,
    questions,
    createdAt: serverTimestamp(),
  });

  // Também salva referência na subcoleção do professor
  await setDoc(doc(db, "users", teacherUid, "modules", finalCode), {
    title,
    code: finalCode,
    questionCount: questions.length,
    createdAt: serverTimestamp(),
  });

  return finalCode;
}

/**
 * RF28 — Busca módulo por código.
 * Retorna o módulo ou null se não encontrado.
 */
export async function findModuleByCode(code) {
  const snap = await getDoc(doc(db, "modules", code.toUpperCase()));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * RF28 — Adiciona módulo extra ao perfil do aluno.
 */
export async function addExtraModuleToStudent(studentUid, moduleCode) {
  await setDoc(
    doc(db, "users", studentUid, "extraModules", moduleCode),
    { code: moduleCode, addedAt: serverTimestamp() }
  );
}

/**
 * Carrega módulos extras do aluno.
 */
export async function loadExtraModules(studentUid) {
  const snap = await getDocs(collection(db, "users", studentUid, "extraModules"));
  const codes = [];
  snap.forEach((d) => codes.push(d.data().code));

  // Busca os dados de cada módulo
  const modules = await Promise.all(
    codes.map(async (code) => {
      const m = await findModuleByCode(code);
      return m;
    })
  );
  return modules.filter(Boolean);
}
