import { createContext, useContext, useReducer } from "react";

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  user: null,            // { name, email, grade } | null
  isAuthenticated: false,

  // ── Diagnostic flow ───────────────────────────────────────────────────────
  firstDiagnosticDone:  false,
  firstDiagnosticScore: 0,      // 0–1
  wentToReview:         false,  // true if score < 60% on first diagnostic
  secondDiagnosticDone: false,
  secondDiagnosticScore:0,

  // ── Quiz flow ─────────────────────────────────────────────────────────────
  screen:              "dashboard", // dashboard | demo | quiz
  currentModule:       null,
  moduleResults:       {},   // { [moduleId]: { score, xp, timeMs, completed, correct, total } }
  totalXP:             0,
  hintsUsedInBattery:  0,
  scratchpadOpen:      false,
  demoWatched:         {},   // { [moduleId]: true }
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

    // ── Diagnostic (RF16 / RF20) ──────────────────────────────────────────────

    /**
     * FIRST_DIAGNOSTIC_DONE
     * Saves score. The routing decision (< 60% → /revisao, else → /modulo-1)
     * is made inside DiagnosticScreen.jsx using react-router navigate().
     */
    case "FIRST_DIAGNOSTIC_DONE":
      return {
        ...state,
        firstDiagnosticDone:  true,
        firstDiagnosticScore: action.payload,
        wentToReview:         action.payload < 0.6,
      };

    /**
     * SECOND_DIAGNOSTIC_DONE
     * RF20: after second diagnostic, user always goes to /modulo-1.
     * Routing is handled in SecondDiagnosticScreen.jsx.
     */
    case "SECOND_DIAGNOSTIC_DONE":
      return {
        ...state,
        secondDiagnosticDone:  true,
        secondDiagnosticScore: action.payload,
      };

    // ── Quiz flow ─────────────────────────────────────────────────────────────

    case "SET_SCREEN":
      return { ...state, screen: action.payload };

    case "START_MODULE":
      return { ...state, screen: "demo", currentModule: action.payload, hintsUsedInBattery: 0 };

    case "DEMO_WATCHED":
      return {
        ...state,
        screen: "quiz",
        demoWatched: { ...state.demoWatched, [action.payload]: true },
      };

    case "COMPLETE_MODULE": {
      const prev      = state.moduleResults[action.payload.moduleId];
      const isBetter  = !prev || action.payload.score > prev.score;
      const newResult = isBetter ? action.payload : prev;
      const xpDiff    = isBetter ? Math.max(0, (newResult.xp || 0) - (prev?.xp || 0)) : 0;
      return {
        ...state,
        moduleResults: { ...state.moduleResults, [action.payload.moduleId]: newResult },
        totalXP:        state.totalXP + xpDiff,
        screen:         "dashboard",
        currentModule:  null,
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
