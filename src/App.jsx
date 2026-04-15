import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";

// ── Public pages ──────────────────────────────────────────────────────────────
import Home     from "./components/Home";
import Login    from "./components/Login";
import Register from "./components/Register";

// ── App screens (post-login) ──────────────────────────────────────────────────
import Dashboard        from "./components/Dashboard";
import DemoScreen       from "./components/DemoScreen";
import QuizEngine       from "./components/QuizEngine";
import DiagnosticScreen from "./components/DiagnosticScreen";

// ─── Protected route wrapper ──────────────────────────────────────────────────

function PrivateRoute({ children }) {
  const { state } = useApp();
  return state.isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ─── Inner app router (quiz flow) ─────────────────────────────────────────────

function AppRouter() {
  const { state } = useApp();

  // Sub-screen routing handled by AppContext screen state
  if (!state.diagnosticDone)       return <DiagnosticScreen />;
  if (state.screen === "demo")     return <DemoScreen />;
  if (state.screen === "quiz")     return <QuizEngine />;
  return <Dashboard />;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/cadastro" element={<Register />} />

        {/* Protected */}
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <AppRouter />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
