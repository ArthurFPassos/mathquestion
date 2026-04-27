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
import Navbar     from "./components/Navbar";      // RNF06
import DemoScreen from "./components/DemoScreen";
import QuizEngine from "./components/QuizEngine";

// ─── Protected route ──────────────────────────────────────────────────────────

function PrivateRoute({ children }) {
  const { state } = useApp();
  return state.isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ─── Module-1 placeholder (entry point after diagnostics) ─────────────────────
// Replace this with your real Módulo 1 component when ready.

// ─── Internal layout — wraps every protected screen with Navbar (RNF06) ──────

function InternalLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function Module1() {
  const { state } = useApp();

  if (state.screen === "demo") return <InternalLayout><DemoScreen /></InternalLayout>;
  if (state.screen === "quiz") return <InternalLayout><QuizEngine /></InternalLayout>;

  return <InternalLayout><Dashboard /></InternalLayout>;
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

        {/* ── /diagnostico: entry for NEW users (after Register) ── */}
        <Route
          path="/diagnostico"
          element={
            <PrivateRoute>
              <InternalLayout><DiagnosticScreen /></InternalLayout>
            </PrivateRoute>
          }
        />

        {/* ── /dashboard: entry for RETURNING users (after Login) ── */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Module1 />
            </PrivateRoute>
          }
        />

        {/* ── /app: legacy redirect — keeps old bookmarks working ── */}
        <Route
          path="/app"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* ── RF16: low score → review page ── */}
        <Route
          path="/revisao"
          element={
            <PrivateRoute>
              <InternalLayout><ReviewScreen /></InternalLayout>
            </PrivateRoute>
          }
        />

        {/* ── RF20: second diagnostic after review ── */}
        <Route
          path="/segundo-diagnostico"
          element={
            <PrivateRoute>
              <InternalLayout><SecondDiagnosticScreen /></InternalLayout>
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
