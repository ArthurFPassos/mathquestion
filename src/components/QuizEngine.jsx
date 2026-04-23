import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { UNITS } from "../data/units";
import Scratchpad from "./Scratchpad";
import ExitModal from "./ExitModal";
import "./QuizEngine.css";

export default function QuizEngine() {
  const { state, dispatch } = useApp();
  const navigate            = useNavigate();

  const module = UNITS.flatMap((u) => u.modules).find(
    (m) => m.id === state.currentModule
  );
  const unit = UNITS.find((u) =>
    u.modules.some((m) => m.id === state.currentModule)
  );

  const [qIndex,      setQIndex]      = useState(0);
  const [textAnswer,  setTextAnswer]  = useState("");
  const [selected,    setSelected]    = useState(null);
  const [feedback,    setFeedback]    = useState(null);
  const [showHint,    setShowHint]    = useState(false);
  const [scores,      setScores]      = useState([]);
  const [xpLog,       setXpLog]       = useState([]);
  const [startTime]                   = useState(Date.now());
  const [showExit,    setShowExit]    = useState(false);

  if (!module || !unit) return null;

  const q           = module.questions[qIndex];
  const isLastQ     = qIndex === module.questions.length - 1;
  const hintsLeft   = 3 - state.hintsUsedInBattery;
  const currentXP   = showHint ? Math.floor(q.xp * 0.5) : q.xp;
  const progressPct = (qIndex / module.questions.length) * 100;
  const isAnswering = feedback === null;
  const isCorrect   = feedback === "correct";
  const isWrong     = feedback === "wrong";
  const canShowHint = isWrong && !showHint && hintsLeft > 0;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const confirm = () => {
    const ans = q.type === "multiple" ? selected : textAnswer.trim();
    if (!ans) return;
    if (ans === q.answer) {
      setScores((s) => [...s, 1]);
      setXpLog((x)  => [...x, showHint ? Math.floor(q.xp * 0.5) : q.xp]);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }
  };

  const handleRetry = () => {
    setFeedback(null);
    setSelected(null);
    setTextAnswer("");
  };

  const handleUseHint = () => {
    if (!canShowHint) return;
    dispatch({ type: "USE_HINT" });
    setShowHint(true);
    setFeedback(null);
    setSelected(null);
    setTextAnswer("");
  };

  const handleSkip = () => {
    setScores((s) => [...s, 0]);
    setXpLog((x)  => [...x, 0]);
    advanceOrFinish(false);
  };

  const handleNext = () => advanceOrFinish(true);

  const advanceOrFinish = (lastCorrect) => {
    if (isLastQ) { finishModule(lastCorrect); }
    else {
      setQIndex((i)  => i + 1);
      setTextAnswer("");
      setSelected(null);
      setFeedback(null);
      setShowHint(false);
    }
  };

  const finishModule = () => {
    const totalCorrect = scores.reduce((a, b) => a + b, 0);
    const score        = totalCorrect / module.questions.length;
    dispatch({
      type: "COMPLETE_MODULE",
      payload: {
        moduleId:  module.id,
        score,
        xp:        xpLog.reduce((a, b) => a + b, 0),
        timeMs:    Date.now() - startTime,
        completed: true,
        correct:   totalCorrect,
        total:     module.questions.length,
      },
    });
  };

  const handleExitConfirm = () => {
    dispatch({ type: "SET_SCREEN", payload: "dashboard" });
    navigate("/modulo-1");
  };

  // ── Option styling ───────────────────────────────────────────────────────────

  const optStyle = (opt) => ({
    borderColor: selected === opt ? unit.color : "#e2e8f0",
    background:  selected === opt ? unit.light : "#f8fafc",
    color:       selected === opt ? unit.color : "#1e293b",
    fontWeight:  selected === opt ? 700 : 400,
    opacity:     !isAnswering && selected !== opt ? 0.55 : 1,
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="qe-wrapper">
      {showExit && (
        <ExitModal
          onConfirm={handleExitConfirm}
          onCancel={() => setShowExit(false)}
        />
      )}
      {state.scratchpadOpen && <Scratchpad />}

      <div className="qe-card">

        {/* Top bar */}
        <div className="qe-top-bar">
          <div className="qe-top-left">
            <div className="qe-unit-dot" style={{ background: unit.color }} />
            <span className="qe-module-label">{unit.emoji} {module.title}</span>
          </div>
          <div className="qe-top-right">
            <div className={`qe-hint-pill ${hintsLeft > 0 ? "qe-hint-pill--available" : "qe-hint-pill--empty"}`}>
              💡 {hintsLeft} dica{hintsLeft !== 1 ? "s" : ""}
            </div>
            <button className="qe-btn-sm" onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}>
              ✏️
            </button>
            <button
              className="qe-btn-sm qe-btn-sm--exit"
              onClick={() => setShowExit(true)}
              aria-label="Sair do exercício"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="qe-progress-track">
          <div
            className="qe-progress-fill"
            style={{ width: `${progressPct}%`, background: unit.color }}
          />
        </div>
        <p className="qe-q-counter">
          Questão <strong>{qIndex + 1}</strong> de {module.questions.length}
          <span
            className="qe-xp-pill"
            style={{ background: unit.light, color: unit.color }}
          >
            +{currentXP} XP
          </span>
        </p>

        {/* Statement */}
        <div
          className="qe-question-box"
          style={{ borderColor: unit.color + "44" }}
        >
          <p className="qe-statement">{q.statement}</p>
        </div>

        {/* Hint */}
        {showHint && (
          <div className="qe-hint-box">
            <span className="qe-hint-icon">💡</span>
            <div>
              <p className="qe-hint-label">Dica</p>
              <p className="qe-hint-text">{q.hint}</p>
            </div>
          </div>
        )}

        {/* Answer input */}
        {q.type === "multiple" ? (
          <div className="qe-options-grid">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`qe-option-btn${selected === opt ? " qe-option-btn--selected" : ""}`}
                style={optStyle(opt)}
                onClick={() => isAnswering && setSelected(opt)}
                disabled={!isAnswering}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            className={`qe-input${
              feedback === "correct" ? " qe-input--correct"
              : feedback === "wrong" ? " qe-input--wrong" : ""
            }`}
            placeholder="Digite sua resposta..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && isAnswering && confirm()}
            disabled={!isAnswering}
          />
        )}

        {/* ── Correct ── */}
        {isCorrect && (
          <>
            <div className="qe-feedback qe-feedback--correct">
              ✅ Correto! Muito bem!{" "}
              <strong>+{currentXP} XP</strong>
            </div>
            <button
              className="qe-btn-primary"
              style={{ background: unit.color }}
              onClick={handleNext}
            >
              {isLastQ ? "Finalizar módulo 🎉" : "Próxima questão →"}
            </button>
          </>
        )}

        {/* ── Wrong: 3-option panel ── */}
        {isWrong && (
          <>
            <div className="qe-feedback qe-feedback--wrong">
              ❌ Resposta incorreta. O que deseja fazer?
            </div>

            <div className="qe-error-panel">
              <button className="qe-error-opt-btn" onClick={handleRetry}>
                <span className="qe-error-opt-icon">🔄</span>
                <div className="qe-error-opt-text">
                  <span className="qe-error-opt-title">Tentar novamente</span>
                  <span className="qe-error-opt-sub">Sem usar dica</span>
                </div>
              </button>

              <button
                className={`qe-error-opt-btn qe-error-opt-btn--hint`}
                onClick={handleUseHint}
                disabled={!canShowHint}
              >
                <span className="qe-error-opt-icon">💡</span>
                <div className="qe-error-opt-text">
                  <span className="qe-error-opt-title">Ver dica</span>
                  <span className="qe-error-opt-sub">
                    {canShowHint
                      ? `−1 do contador (${hintsLeft} restante${hintsLeft !== 1 ? "s" : ""})`
                      : showHint
                        ? "Dica já utilizada"
                        : "Sem dicas disponíveis"}
                  </span>
                </div>
              </button>

              <button
                className="qe-error-opt-btn qe-error-opt-btn--skip"
                onClick={handleSkip}
              >
                <span className="qe-error-opt-icon">⏭</span>
                <div className="qe-error-opt-text">
                  <span className="qe-error-opt-title qe-error-opt-title--danger">
                    Pular questão
                  </span>
                  <span className="qe-error-opt-sub">Registra como errada (0 XP)</span>
                </div>
              </button>
            </div>
          </>
        )}

        {/* ── Answering: confirm button ── */}
        {isAnswering && (
          <button
            className="qe-btn-primary"
            style={{ background: unit.color }}
            disabled={q.type === "multiple" ? !selected : !textAnswer.trim()}
            onClick={confirm}
          >
            Confirmar resposta
          </button>
        )}

      </div>
    </div>
  );
}
