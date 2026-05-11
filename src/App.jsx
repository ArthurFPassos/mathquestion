import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";

// ── Public pages ──────────────────────────────────────────────────────────────
import Home     from "./pages/public/Home";
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Sobre    from "./pages/public/Sobre";

// ── Diagnostic flow ───────────────────────────────────────────────────────────
import DiagnosticScreen       from "./pages/diagnostic/DiagnosticScreen";       // RF16
import ReviewScreen           from "./pages/diagnostic/ReviewScreen";            // RF17
import SecondDiagnosticScreen from "./pages/diagnostic/SecondDiagnosticScreen";  // RF20

// ── Main app ──────────────────────────────────────────────────────────────────
import Dashboard        from "./pages/student/Dashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import Navbar     from "./components/shared/Navbar";      // RNF06
import DemoScreen from "./pages/student/DemoScreen";
import QuizEngine from "./pages/student/QuizEngine";

// ─── Protected route ──────────────────────────────────────────────────────────

// Enquanto o Firebase verifica a sessão salva, mostra spinner
// Evita redirecionar para /login um aluno que já estava autenticado
// Rota exclusiva para professores
function TeacherRoute({ children }) {
  const { state } = useApp();
  if (state.authLoading) return null;
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  if (state.user?.role !== "professor") return <Navigate to="/dashboard" replace />;
  return children;
}

function PrivateRoute({ children }) {
  const { state } = useApp();

  if (state.authLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
        background: "#f8fafc", fontFamily: "inherit",
      }}>
        <div style={{
          width: 48, height: 48, border: "4px solid #e2e8f0",
          borderTop: "4px solid #6366f1", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>Carregando...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
        <Route path="/sobre"    element={<Sobre />} />

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

        {/* ── RF23: Painel do professor ── */}
        <Route
          path="/teacher-dashboard"
          element={
            <TeacherRoute>
              <TeacherDashboard />
            </TeacherRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
