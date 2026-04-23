import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";

// ── Public pages ──────────────────────────────────────────────────────────────
import Home     from "./components/Home";
import Login    from "./components/Login";
import Register from "./components/Register";

// ── Diagnostic flow ───────────────────────────────────────────────────────────
import DiagnosticScreen       from "./components/DiagnosticScreen";       // RF16
import ReviewScreen           from "./components/ReviewScreen";            // RF17
import SecondDiagnosticScreen from "./components/SecondDiagnosticScreen";  // RF20

// ── Main app ──────────────────────────────────────────────────────────────────
import Dashboard  from "./components/Dashboard";
import DemoScreen from "./components/DemoScreen";
import QuizEngine from "./components/QuizEngine";

// ─── Protected route ──────────────────────────────────────────────────────────

function PrivateRoute({ children }) {
  const { state } = useApp();
  return state.isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ─── Module-1 placeholder (entry point after diagnostics) ─────────────────────
// Replace this with your real Módulo 1 component when ready.

function Module1() {
  const { state, dispatch } = useApp();

  // If module screen state is active, render quiz flow
  if (state.screen === "demo") return <DemoScreen />;
  if (state.screen === "quiz") return <QuizEngine />;

  return <Dashboard />;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/cadastro" element={<Register />} />

        {/* ── Protected: entry point after login ── */}
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <DiagnosticScreen />
            </PrivateRoute>
          }
        />

        {/* ── RF16: low score → review page ── */}
        <Route
          path="/revisao"
          element={
            <PrivateRoute>
              <ReviewScreen />
            </PrivateRoute>
          }
        />

        {/* ── RF20: second diagnostic after review ── */}
        <Route
          path="/segundo-diagnostico"
          element={
            <PrivateRoute>
              <SecondDiagnosticScreen />
            </PrivateRoute>
          }
        />

        {/* ── RF20: entry into modules (after either diagnostic path) ── */}
        <Route
          path="/modulo-1"
          element={
            <PrivateRoute>
              <Module1 />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
