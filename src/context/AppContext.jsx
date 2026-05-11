import { createContext, useContext, useReducer, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { loadProgress } from "../services/firebaseService";

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  // Auth
  user:            null,   // { uid, name, email, grade, school, role }
  isAuthenticated: false,
  authLoading:     true,   // true enquanto Firebase verifica sessão salva

  // Diagnostic flow
  firstDiagnosticDone:   false,
  firstDiagnosticScore:  0,
  wentToReview:          false,
  secondDiagnosticDone:  false,
  secondDiagnosticScore: 0,

  // Quiz flow
  screen:             "dashboard",
  currentModule:      null,
  moduleResults:      {},
  totalXP:            0,
  hintsUsedInBattery: 0,
  scratchpadOpen:     false,
  demoWatched:        {},
  demoCompleted:      {},
  extraModule:        null,   // módulo criado por professor (não está em UNITS)
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    // Auth
    case "LOGIN":
    case "REGISTER":
      return {
        ...state,
        user:            action.payload,
        isAuthenticated: true,
        authLoading:     false,
      };

    case "LOGOUT":
      return { ...initialState, authLoading: false };

    case "AUTH_READY":
      // Firebase confirmou que não há sessão salva
      return { ...state, authLoading: false };

    // Carrega progresso salvo no Firestore após login
    case "LOAD_PROGRESS": {
      const { moduleResults, totalXP, diagnostics } = action.payload;
      const diag1 = diagnostics.find((d) => d.attempt === 1);
      const diag2 = diagnostics.find((d) => d.attempt === 2);
      return {
        ...state,
        moduleResults,
        totalXP,
        firstDiagnosticDone:   !!diag1,
        firstDiagnosticScore:  diag1?.score ?? 0,
        wentToReview:          diag1 ? diag1.score < 0.6 : false,
        secondDiagnosticDone:  !!diag2,
        secondDiagnosticScore: diag2?.score ?? 0,
      };
    }

    // Diagnostic
    case "FIRST_DIAGNOSTIC_DONE":
      return {
        ...state,
        firstDiagnosticDone:  true,
        firstDiagnosticScore: action.payload,
        wentToReview:         action.payload < 0.6,
      };

    case "SECOND_DIAGNOSTIC_DONE":
      return {
        ...state,
        secondDiagnosticDone:  true,
        secondDiagnosticScore: action.payload,
      };

    // Quiz flow
    case "SET_SCREEN":
      return { ...state, screen: action.payload };

    case "START_MODULE":
      return { ...state, screen: "demo", currentModule: action.payload, hintsUsedInBattery: 0 };

    case "DEMO_WATCHED":
      return {
        ...state,
        screen:         "quiz",
        currentModule:  action.payload,   // garante que o módulo está definido mesmo pulando a demo
        hintsUsedInBattery: 0,
        demoWatched:    { ...state.demoWatched, [action.payload]: true },
      };

    case "MARK_DEMO_COMPLETE":
      return {
        ...state,
        demoCompleted: { ...state.demoCompleted, [action.payload]: true },
      };

    case "COMPLETE_MODULE": {
      const prev     = state.moduleResults[action.payload.moduleId];
      const isBetter = !prev || action.payload.score > prev.score;
      const result   = isBetter ? action.payload : prev;
      const xpDiff   = isBetter ? Math.max(0, (result.xp || 0) - (prev?.xp || 0)) : 0;
      return {
        ...state,
        moduleResults:  { ...state.moduleResults, [action.payload.moduleId]: result },
        totalXP:        state.totalXP + xpDiff,
        screen:         "dashboard",
        currentModule:  null,
      };
    }

    case "SET_EXTRA_MODULE":
      return { ...state, extraModule: action.payload };

    case "USE_HINT":
      return { ...state, hintsUsedInBattery: state.hintsUsedInBattery + 1 };

    case "TOGGLE_SCRATCHPAD":
      return { ...state, scratchpadOpen: !state.scratchpadOpen };

    default:
      return state;
  }
}

// ─── Context & Provider ───────────────────────────────────────────────────────

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Observa estado de autenticação do Firebase.
  // Se o aluno já fez login antes (sessão salva no navegador),
  // ele é restaurado automaticamente aqui — sem precisar logar de novo.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const { uid, displayName, email } = firebaseUser;

        // Busca perfil completo do Firestore
        try {
          const { getDoc, doc } = await import("firebase/firestore");
          const { db } = await import("../services/firebaseConfig");
          
          // Tenta buscar como aluno primeiro
          let snap = await getDoc(doc(db, "students", uid));
          let profile = snap.exists() ? snap.data() : {};
          let role = "aluno";
          
          // Se não for aluno, tenta como professor
          if (!snap.exists()) {
            snap = await getDoc(doc(db, "users", uid));
            profile = snap.exists() ? snap.data() : {};
            role = profile.role || "aluno";
          }

          dispatch({
            type:    "LOGIN",
            payload: { 
              uid, 
              name: displayName || profile.name || "Aluno", 
              email, 
              grade: profile.grade || "",
              school: profile.school || "",
              role 
            },
          });

          // Carrega progresso salvo (apenas para alunos)
          if (role === "aluno") {
            const progress = await loadProgress(uid);
            dispatch({ type: "LOAD_PROGRESS", payload: progress });
          }
        } catch {
          dispatch({ type: "AUTH_READY" });
        }
      } else {
        // Nenhum usuário autenticado
        dispatch({ type: "AUTH_READY" });
      }
    });

    return unsubscribe; // cleanup ao desmontar
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
