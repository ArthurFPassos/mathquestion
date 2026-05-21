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
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function registerStudent({ name, email, password, grade }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;
  await updateProfile(credential.user, { displayName: name });
  await setDoc(doc(db, "students", uid), {
    name, email, grade, createdAt: serverTimestamp(),
  });
  return { uid, name, email, grade };
}

export async function loginStudent({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  const teacherSnap = await getDoc(doc(db, "users", uid));
  if (teacherSnap.exists()) {
    const data = teacherSnap.data();
    return { uid, name: data.name, email: data.email, school: data.school, role: "professor" };
  }

  const studentSnap = await getDoc(doc(db, "students", uid));
  if (!studentSnap.exists()) throw new Error("Perfil de usuário não encontrado.");
  const data = studentSnap.data();
  return { uid, name: data.name, email: data.email, grade: data.grade, role: "aluno" };
}

export async function logoutStudent() {
  await signOut(auth);
}

// ── Progresso ─────────────────────────────────────────────────────────────────

export async function loadProgress(uid) {
  const modulesSnap = await getDocs(collection(db, "students", uid, "modules"));
  const moduleResults = {};
  let totalXP = 0;
  modulesSnap.forEach((d) => {
    const data = d.data();
    moduleResults[d.id] = {
      score: data.score, xp: data.xp, correct: data.correct,
      total: data.total, timeMs: data.timeMs, completed: data.completed,
    };
    totalXP += data.xp || 0;
  });

  const diagSnap = await getDocs(collection(db, "students", uid, "diagnostics"));
  const diagnostics = [];
  diagSnap.forEach((d) => diagnostics.push({ id: d.id, ...d.data() }));
  diagnostics.sort((a, b) => a.attempt - b.attempt);

  return { moduleResults, totalXP, diagnostics };
}

export async function saveModuleResult(uid, moduleId, result) {
  const ref  = doc(db, "students", uid, "modules", moduleId);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().score >= result.score) return;
  await setDoc(ref, { ...result, completedAt: serverTimestamp() });
}

export async function saveDiagnostic(uid, attempt, score, correct, total) {
  await setDoc(doc(db, "students", uid, "diagnostics", `attempt_${attempt}`), {
    attempt, score, correct, total, completedAt: serverTimestamp(),
  });
}

export async function saveDemoCompleted(uid, unitId) {
  await setDoc(doc(db, "students", uid), { [`demoCompleted_${unitId}`]: true }, { merge: true });
}

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

export async function registerTeacher({ name, email, password, school }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;
  await updateProfile(credential.user, { displayName: name });
  await setDoc(doc(db, "users", uid), {
    name, email, school, role: "professor", createdAt: serverTimestamp(),
  });
  return { uid, name, email, school, role: "professor" };
}

export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return "aluno";
  return snap.data().role || "aluno";
}

// ── Módulos do Professor ──────────────────────────────────────────────────────

export function generateModuleCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits  = "23456789";
  const positions = [0, 1, 2, 3, 4];
  const digitPositions = [];
  while (digitPositions.length < 2) {
    const idx = Math.floor(Math.random() * positions.length);
    digitPositions.push(positions.splice(idx, 1)[0]);
  }
  const code = Array(5).fill(null);
  digitPositions.forEach((p) => { code[p] = digits[Math.floor(Math.random() * digits.length)]; });
  positions.forEach((p)      => { code[p] = letters[Math.floor(Math.random() * letters.length)]; });
  return code.join("");
}

export async function saveTeacherModule({ teacherUid, title, questions }) {
  let finalCode = generateModuleCode();
  let ref  = doc(db, "modules", finalCode);
  let snap = await getDoc(ref);
  while (snap.exists()) {
    finalCode = generateModuleCode();
    ref  = doc(db, "modules", finalCode);
    snap = await getDoc(ref);
  }
  await setDoc(ref, {
    title, teacherUid, code: finalCode, questions, createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, "users", teacherUid, "modules", finalCode), {
    title, code: finalCode, questionCount: questions.length, createdAt: serverTimestamp(),
  });
  return finalCode;
}

export async function updateTeacherModule({ teacherUid, moduleCode, title, questions }) {
  await updateDoc(doc(db, "modules", moduleCode), {
    title, questions, updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "users", teacherUid, "modules", moduleCode), {
    title, questionCount: questions.length, updatedAt: serverTimestamp(),
  });
}

export async function deleteTeacherModule({ teacherUid, moduleCode }) {
  await deleteDoc(doc(db, "modules", moduleCode));
  await deleteDoc(doc(db, "users", teacherUid, "modules", moduleCode));
}

export async function findModuleByCode(code) {
  const snap = await getDoc(doc(db, "modules", code.toUpperCase()));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addExtraModuleToStudent(studentUid, moduleCode) {
  await setDoc(
    doc(db, "users", studentUid, "extraModules", moduleCode),
    { code: moduleCode, addedAt: serverTimestamp() }
  );
}

export async function loadExtraModules(studentUid) {
  const snap = await getDocs(collection(db, "users", studentUid, "extraModules"));
  const codes = [];
  snap.forEach((d) => codes.push(d.data().code));
  const modules = await Promise.all(codes.map((code) => findModuleByCode(code)));
  return modules.filter(Boolean);
}

// ══════════════════════════════════════════════════════════════════════════════
// RF22 — Tentativas dos alunos em módulos do professor
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Salva a tentativa completa do aluno ao concluir um módulo do professor.
 *
 * Coleção: student_attempts
 * DocId:   {moduleCode}_{studentUid}   ← único por (módulo + aluno)
 *
 * Campos obrigatórios para as queries do professor:
 *   moduleCode  → filtro por módulo específico
 *   teacherUid  → filtro por todos os módulos do professor
 *
 * Cada item de answers inclui:
 *   { index, statement, type, correct, skipped, attempts, usedHint,
 *     xpEarned, scratchpadImage (PNG Base64 | null),
 *     studentAnswer, correctAnswer }
 *
 * NOTA sobre índices Firestore:
 *   As queries por "moduleCode" e "teacherUid" são simples (campo único),
 *   não requerem índice composto. Se o Firestore pedir criação de índice,
 *   siga o link no erro do console — é criado em ~1 minuto.
 */
export async function saveStudentAttempt({
  moduleCode,
  teacherUid,
  studentUid,
  studentName,
  answers,
  score,
  totalCorrect,
  total,
  timeMs,
}) {
  // DocId fixo por (aluno + módulo): retentativas sobrescrevem sem duplicar
  const docId = `${moduleCode}_${studentUid}`;

  await setDoc(doc(db, "student_attempts", docId), {
    moduleCode,
    teacherUid:  teacherUid || "",
    studentUid,
    studentName,
    answers,          // array com scratchpadImage por questão
    score,
    totalCorrect,
    total,
    timeMs,
    completedAt: serverTimestamp(),
  });
}

/**
 * FIX — Busca tentativas de UM módulo específico (getDocs, one-shot).
 * Usado pelo TeacherDashboard quando o professor seleciona um módulo.
 *
 * Query: student_attempts WHERE moduleCode == moduleCode
 * Índice: não é necessário (campo único, coleção simples).
 */
export async function getStudentAttemptsForModule(moduleCode) {
  try {
    const q    = query(
      collection(db, "student_attempts"),
      where("moduleCode", "==", moduleCode)
    );
    const snap = await getDocs(q);
    const attempts = [];
    snap.forEach((d) => attempts.push({ id: d.id, ...d.data() }));
    attempts.sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
    return attempts;
  } catch (e) {
    console.error("getStudentAttemptsForModule:", e);
    return [];
  }
}

/**
 * FIX — Busca tentativas de TODOS os módulos de um professor (getDocs, one-shot).
 * Query: student_attempts WHERE teacherUid == teacherUid
 *
 * Retorna um Map: { [moduleCode]: attempt[] } para fácil lookup por módulo.
 */
export async function getAllAttemptsForTeacher(teacherUid) {
  try {
    const q    = query(
      collection(db, "student_attempts"),
      where("teacherUid", "==", teacherUid)
    );
    const snap = await getDocs(q);
    const byModule = {};
    snap.forEach((d) => {
      const data = { id: d.id, ...d.data() };
      if (!byModule[data.moduleCode]) byModule[data.moduleCode] = [];
      byModule[data.moduleCode].push(data);
    });
    return byModule;
  } catch (e) {
    console.error("getAllAttemptsForTeacher:", e);
    return {};
  }
}

/**
 * FIX — Versão em tempo real com onSnapshot.
 * Subscreve todas as tentativas do professor e chama callback sempre
 * que o Firestore atualiza (novo aluno completa um módulo).
 *
 * Retorna a função de unsubscribe — chame-a no useEffect cleanup.
 *
 * Uso no TeacherDashboard:
 *   useEffect(() => {
 *     const unsub = subscribeToTeacherAttempts(teacherUid, (byModule) => {
 *       setAttemptsMap(byModule);
 *     });
 *     return unsub;
 *   }, [teacherUid]);
 */
export function subscribeToTeacherAttempts(teacherUid, callback) {
  if (!teacherUid) return () => {};

  const q = query(
    collection(db, "student_attempts"),
    where("teacherUid", "==", teacherUid)
  );

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      const byModule = {};
      snap.forEach((d) => {
        const data = { id: d.id, ...d.data() };
        if (!byModule[data.moduleCode]) byModule[data.moduleCode] = [];
        byModule[data.moduleCode].push(data);
      });
      // Ordena cada lista por data (mais recente primeiro)
      Object.keys(byModule).forEach((code) => {
        byModule[code].sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
      });
      callback(byModule);
    },
    (error) => {
      console.error("subscribeToTeacherAttempts:", error);
      callback({});
    }
  );

  return unsubscribe;
}