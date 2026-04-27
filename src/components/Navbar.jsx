import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Navbar.css";

/**
 * Navbar — RNF06
 * Rendered on all internal screens (Dashboard, QuizEngine, DemoScreen,
 * ReviewScreen, DiagnosticScreen, SecondDiagnosticScreen).
 *
 * The logo / "MathQuestion" text acts as the Home button → /dashboard.
 */
export default function Navbar() {
  const { state, dispatch } = useApp();
  const navigate            = useNavigate();

  const goHome = () => {
    // If inside a quiz, reset screen state first so Dashboard renders cleanly
    if (state.screen === "quiz" || state.screen === "demo") {
      dispatch({ type: "SET_SCREEN", payload: "dashboard" });
    }
    navigate("/dashboard");
  };

  // Don't render on public pages (user not authenticated)
  if (!state.isAuthenticated) return null;

  return (
    <nav className="nb-nav" role="navigation" aria-label="Navegação principal">
      <div className="nb-inner">

        {/* ── Logo / Home button (RNF06) ── */}
        <button
          className="nb-home-btn"
          onClick={goHome}
          aria-label="Voltar para seleção de módulos"
          title="Voltar para seleção de módulos"
        >
          <span className="nb-logo-icon" aria-hidden="true">🧮</span>
          <span className="nb-logo-text">MathQuestion</span>
          <span className="nb-home-hint">Home</span>
        </button>

        {/* ── Right side: user info + XP ── */}
        <div className="nb-right">
          {state.totalXP > 0 && (
            <div className="nb-xp-badge" aria-label={`${state.totalXP} pontos de XP`}>
              ⭐ {state.totalXP} XP
            </div>
          )}

          {(state.user?.name || state.studentName) && (
            <div className="nb-user">
              <div className="nb-avatar" aria-hidden="true">
                {(state.user?.name || state.studentName).charAt(0).toUpperCase()}
              </div>
              <span className="nb-username">
                {state.user?.name || state.studentName}
              </span>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
