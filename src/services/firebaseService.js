
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

export async function saveTeacherModule({ teacherUid, title, questions, maxAttempts = "unlimited" }) {
  let finalCode = generateModuleCode();
  let ref  = doc(db, "modules", finalCode);
  let snap = await getDoc(ref);
  while (snap.exists()) {
    finalCode = generateModuleCode();
    ref  = doc(db, "modules", finalCode);
    snap = await getDoc(ref);
  }
  await setDoc(ref, {
    title, teacherUid, code: finalCode, questions, maxAttempts, createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, "users", teacherUid, "modules", finalCode), {
    title, code: finalCode, questionCount: questions.length, maxAttempts, createdAt: serverTimestamp(),
  });
  return finalCode;
}

export async function updateTeacherModule({ teacherUid, moduleCode, title, questions, maxAttempts = "unlimited" }) {
  await updateDoc(doc(db, "modules", moduleCode), {
    title, questions, maxAttempts, updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "users", teacherUid, "modules", moduleCode), {
    title, questionCount: questions.length, maxAttempts, updatedAt: serverTimestamp(),
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
  
  const docId = `${moduleCode}_${studentUid}`;

  const payload = {
    moduleCode,
    teacherUid:  teacherUid || "",
    studentUid,
    studentName,
    answers,          
    score,
    totalCorrect,
    total,
    timeMs,
    completedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "student_attempts", docId), payload);

  const histRef = doc(collection(db, "student_attempts", docId, "history"));
  await setDoc(histRef, { ...payload, savedAt: serverTimestamp() });
}

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

export async function getStudentAttemptCount(moduleCode, studentUid) {
  try {
    const docId      = `${moduleCode}_${studentUid}`;
    const historyRef = collection(db, "student_attempts", docId, "history");
    const snap       = await getDocs(historyRef);
    if (snap.size > 0) return snap.size;
    
    const rootSnap = await getDoc(doc(db, "student_attempts", docId));
    return rootSnap.exists() ? 1 : 0;
  } catch {
    return 0;
  }
}
