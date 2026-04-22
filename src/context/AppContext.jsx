import { createContext, useContext, useReducer } from "react";

const initialState = {
  user: null,
  isAuthenticated: false,
  firstDiagnosticDone:  false,
  firstDiagnosticScore: 0,
  wentToReview:         false,
  secondDiagnosticDone: false,
  secondDiagnosticScore:0,
  screen:              "dashboard",
  currentModule:       null,
  moduleResults:       {},
  totalXP:             0,
  hintsUsedInBattery:  0,
  scratchpadOpen:      false,
  demoWatched:         {},
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload, isAuthenticated: true };

    case "REGISTER":
      return { ...state, user: action.payload, isAuthenticated: true };

    case "LOGOUT":
      return { ...initialState };

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





