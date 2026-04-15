import { createContext, useContext, useReducer } from "react";

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  // Auth
  user: null,            // { name, email, grade } | null
  isAuthenticated: false,

  // Quiz flow
  screen: "dashboard",  // dashboard | demo | quiz  (usado após login)
  currentModule: null,
  moduleResults: {},
  totalXP: 0,
  hintsUsedInBattery: 0,
  scratchpadOpen: false,
  demoWatched: {},
  diagnosticDone: false,
  diagnosticScore: 0,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    // ── Auth ──────────────────────────────────────────────────────────────────

    case "LOGIN":
      return { ...state, user: action.payload, isAuthenticated: true };

    case "REGISTER":
      return { ...state, user: action.payload, isAuthenticated: true };

    case "LOGOUT":
      return { ...initialState };

    // ── Legacy (quiz flow) ────────────────────────────────────────────────────

    case "SET_SCREEN":
      return { ...state, screen: action.payload };

    case "DIAGNOSTIC_DONE":
      return { ...state, diagnosticDone: true, diagnosticScore: action.payload, screen: "dashboard" };

    case "START_MODULE":
      return { ...state, screen: "demo", currentModule: action.payload, hintsUsedInBattery: 0 };

    case "DEMO_WATCHED":
      return { ...state, screen: "quiz", demoWatched: { ...state.demoWatched, [action.payload]: true } };

    case "COMPLETE_MODULE": {
      const prev = state.moduleResults[action.payload.moduleId];
      const isBetter = !prev || action.payload.score > prev.score;
      const newResult = isBetter ? action.payload : prev;
      const xpDiff = isBetter ? Math.max(0, (newResult.xp || 0) - (prev?.xp || 0)) : 0;
      return {
        ...state,
        moduleResults: { ...state.moduleResults, [action.payload.moduleId]: newResult },
        totalXP: state.totalXP + xpDiff,
        screen: "dashboard",
        currentModule: null,
      };
    }

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
