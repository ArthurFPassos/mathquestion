import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { UNITS } from "../data/units";
import Scratchpad from "./Scratchpad";
import ExitModal from "./ExitModal";

// ─── Error action states ──────────────────────────────────────────────────────
// After a wrong answer the user picks one of three paths:
//   "idle"   → wrong banner just appeared, all 3 buttons visible
//   "retry"  → cleared selection, user can answer again (no hint shown yet from this attempt)
//   "hint"   → hint revealed, user can answer again
//   "skip"   → question recorded as 0 and we advance

export default function QuizEngine() {
  const { state, dispatch } = useApp();
  const navigate            = useNavigate();

  // ── Resolve module / unit ──────────────────────────────────────────────────
  const module = UNITS.flatMap((u) => u.modules).find(
    (m) => m.id === state.currentModule
  );
  const unit = UNITS.find((u) =>
    u.modules.some((m) => m.id === state.currentModule)
  );

  // ── Quiz state ─────────────────────────────────────────────────────────────
  const [qIndex,      setQIndex]      = useState(0);
  const [textAnswer,  setTextAnswer]  = useState("");
  const [selected,    setSelected]    = useState(null);
  const [feedback,    setFeedback]    = useState(null);   // null | "correct" | "wrong"
  const [errorAction, setErrorAction] = useState("idle"); // idle | retry | hint
  const [showHint,    setShowHint]    = useState(false);
  const [scores,      setScores]      = useState([]);
  const [xpLog,       setXpLog]       = useState([]);
  const [startTime]                   = useState(Date.now());
  const [showExit,    setShowExit]    = useState(false);  // RF18 / RF19

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!module || !unit) return null;

  const q             = module.questions[qIndex];
  const isLastQ       = qIndex === module.questions.length - 1;
  const hintsLeft     = 3 - state.hintsUsedInBattery;
  const currentXP     = showHint ? Math.floor(q.xp * 0.5) : q.xp;
  const progressPct   = (qIndex / module.questions.length) * 100;

  // ── Confirm answer ─────────────────────────────────────────────────────────
  const confirm = () => {
    const userAnswer = q.type === "multiple" ? selected : textAnswer.trim();
    if (!userAnswer) return;

    if (userAnswer === q.answer) {
      const xp = showHint ? Math.floor(q.xp * 0.5) : q.xp;
      setScores((s) => [...s, 1]);
      setXpLog((x)  => [...x, xp]);
      setFeedback("correct");
      setErrorAction("idle");
    } else {
      setFeedback("wrong");
      setErrorAction("idle"); // show the 3 option buttons
    }
  };

  // ── Error option 1: try again (no hint) ───────────────────────────────────
  const handleRetry = () => {
    setFeedback(null);
    setSelected(null);
    setTextAnswer("");
    setErrorAction("retry");
    // Note: showHint is NOT reset — if they already got a hint, keep it visible
  };

  // ── Error option 2: show hint ─────────────────────────────────────────────
  const handleUseHint = () => {
    if (hintsLeft <= 0) return;
    dispatch({ type: "USE_HINT" });
    setShowHint(true);
    setFeedback(null);     // clear error banner → let user retry
    setSelected(null);
    setTextAnswer("");
    setErrorAction("hint");
  };

  // ── Error option 3 / after correct: advance ───────────────────────────────
  const handleSkip = () => {
    // Record as missed
    setScores((s) => [...s, 0]);
    setXpLog((x)  => [...x, 0]);
    advanceOrFinish(false);
  };

  const handleNext = () => {
    advanceOrFinish(true);
  };

  const advanceOrFinish = (lastWasCorrect) => {
    if (isLastQ) {
      finishModule(lastWasCorrect);
    } else {
      setQIndex((i)  => i + 1);
      setTextAnswer("");
      setSelected(null);
      setFeedback(null);
      setErrorAction("idle");
      setShowHint(false);
    }
  };

  const finishModule = (lastWasCorrect) => {
    const allScores    = lastWasCorrect ? scores : scores; // already pushed before calling
    const totalCorrect = allScores.reduce((a, b) => a + b, 0);
    const score        = totalCorrect / module.questions.length;
    const totalXP      = xpLog.reduce((a, b) => a + b, 0);

    dispatch({
      type: "COMPLETE_MODULE",
      payload: {
        moduleId: module.id,
        score,
        xp:       totalXP,
        timeMs:   Date.now() - startTime,
        completed: true,
        correct:  totalCorrect,
        total:    module.questions.length,
      },
    });
  };

  // ── RF18/RF19 exit ─────────────────────────────────────────────────────────
  const handleExitConfirm = () => {
    dispatch({ type: "SET_SCREEN", payload: "dashboard" });
    navigate("/modulo-1");
  };

  // ── Derived flags ──────────────────────────────────────────────────────────
  const isAnswering  = feedback === null; // no result yet for this attempt
  const isCorrect    = feedback === "correct";
  const isWrong      = feedback === "wrong";
  const canShowHint  = isWrong && !showHint && hintsLeft > 0;

  // Options grid: allow re-selection only when isAnswering or after retry/hint
  const optionsInteractive = isAnswering;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={s.wrapper}>
      {/* RF18/RF19 exit modal */}
      {showExit && (
        <ExitModal
          onConfirm={handleExitConfirm}
          onCancel={() => setShowExit(false)}
        />
      )}

      {state.scratchpadOpen && <Scratchpad />}

      <div style={s.card}>

        {/* ── Top bar ── */}
        <div style={s.topBar}>
          <div style={s.topLeft}>
            <div style={{ ...s.unitDot, background: unit.color }} />
            <span style={s.moduleLabel}>{unit.emoji} {module.title}</span>
          </div>
          <div style={s.topRight}>
            {/* Hint counter */}
            <div style={{
              ...s.hintPill,
              background: hintsLeft > 0 ? "#fffbeb" : "#f1f5f9",
              color:       hintsLeft > 0 ? "#92400e" : "#94a3b8",
            }}>
              💡 {hintsLeft} dica{hintsLeft !== 1 ? "s" : ""}
            </div>
            <button
              onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}
              style={s.btnSm}
            >
              ✏️
            </button>
            {/* RF18 — exit button */}
            <button
              onClick={() => setShowExit(true)}
              style={{ ...s.btnSm, borderColor: "#fca5a5", color: "#ef4444", background: "#fef2f2" }}
              aria-label="Sair do exercício"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: `${progressPct}%`, background: unit.color }} />
        </div>
        <p style={s.qCounter}>
          Questão <strong>{qIndex + 1}</strong> de {module.questions.length}
          <span style={{ ...s.xpPill, background: unit.light, color: unit.color }}>
            +{currentXP} XP
          </span>
        </p>

        {/* ── Statement ── */}
        <div style={{ ...s.questionBox, borderColor: unit.color + "44" }}>
          <p style={s.statement}>{q.statement}</p>
        </div>

        {/* ── Hint box (shown when hint was requested) ── */}
        {showHint && (
          <div style={s.hintBox}>
            <span style={s.hintIcon}>💡</span>
            <div>
              <p style={s.hintLabel}>Dica</p>
              <p style={s.hintText}>{q.hint}</p>
            </div>
          </div>
        )}

        {/* ── Options / input ── */}
        {q.type === "multiple" ? (
          <div style={s.optionsGrid}>
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => optionsInteractive && setSelected(opt)}
                disabled={!optionsInteractive}
                style={{
                  ...s.optionBtn,
                  background:  selected === opt ? unit.light : "#f8fafc",
                  borderColor: selected === opt ? unit.color : "#e2e8f0",
                  color:       selected === opt ? unit.color : "#1e293b",
                  fontWeight:  selected === opt ? 700 : 400,
                  cursor:      optionsInteractive ? "pointer" : "default",
                  opacity:     !optionsInteractive && selected !== opt ? 0.55 : 1,
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            placeholder="Digite sua resposta..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && isAnswering && confirm()}
            disabled={!isAnswering}
            style={{
              ...s.input,
              borderColor: feedback === "correct" ? "#22c55e"
                         : feedback === "wrong"   ? "#ef4444"
                         : "#e2e8f0",
            }}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════════
            FEEDBACK AREA — three distinct states
            ════════════════════════════════════════════════════════════════════ */}

        {/* ── A) Correct ── */}
        {isCorrect && (
          <>
            <div style={s.feedbackCorrect}>
              ✅ Correto! Muito bem!
              <strong style={{ marginLeft: 8 }}>+{currentXP} XP</strong>
            </div>
            <button
              onClick={handleNext}
              style={{ ...s.btnPrimary, background: unit.color }}
            >
              {isLastQ ? "Finalizar módulo 🎉" : "Próxima questão →"}
            </button>
          </>
        )}

        {/* ── B) Wrong — show 3 options ── */}
        {isWrong && (
          <>
            {/* Error banner */}
            <div style={s.feedbackWrong}>
              ❌ Resposta incorreta. O que deseja fazer?
            </div>

            {/* Three-option action panel */}
            <div style={s.errorPanel}>

              {/* Option 1: retry without hint */}
              <button onClick={handleRetry} style={s.errorOptBtn}>
                <span style={s.errorOptIcon}>🔄</span>
                <div style={s.errorOptText}>
                  <span style={s.errorOptTitle}>Tentar novamente</span>
                  <span style={s.errorOptSub}>Sem usar dica</span>
                </div>
              </button>

              {/* Option 2: show hint */}
              <button
                onClick={canShowHint ? handleUseHint : undefined}
                disabled={!canShowHint}
                style={{
                  ...s.errorOptBtn,
                  opacity:       canShowHint ? 1 : 0.45,
                  cursor:        canShowHint ? "pointer" : "not-allowed",
                  borderColor:   canShowHint ? "#FDE68A" : "#e2e8f0",
                  background:    canShowHint ? "#FFFBEB" : "#f8fafc",
                }}
              >
                <span style={s.errorOptIcon}>💡</span>
                <div style={s.errorOptText}>
                  <span style={s.errorOptTitle}>Ver dica</span>
                  <span style={s.errorOptSub}>
                    {canShowHint
                      ? `−1 do contador (${hintsLeft} restante${hintsLeft !== 1 ? "s" : ""})`
                      : showHint
                        ? "Dica já utilizada"
                        : "Sem dicas disponíveis"}
                  </span>
                </div>
              </button>

              {/* Option 3: skip */}
              <button onClick={handleSkip} style={{ ...s.errorOptBtn, borderColor: "#fca5a5", background: "#fef2f2" }}>
                <span style={s.errorOptIcon}>⏭</span>
                <div style={s.errorOptText}>
                  <span style={{ ...s.errorOptTitle, color: "#dc2626" }}>Pular questão</span>
                  <span style={s.errorOptSub}>Registra como errada (0 XP)</span>
                </div>
              </button>

            </div>
          </>
        )}

        {/* ── C) Answering: show confirm button ── */}
        {isAnswering && (
          <button
            onClick={confirm}
            disabled={q.type === "multiple" ? !selected : !textAnswer.trim()}
            style={{
              ...s.btnPrimary,
              background: unit.color,
              opacity:    (q.type === "multiple" ? selected : textAnswer.trim()) ? 1 : 0.5,
            }}
          >
            Confirmar resposta
          </button>
        )}

      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  wrapper: {
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", padding: 16, background: "#f8fafc",
  },
  card: {
    background: "#fff", borderRadius: 20, padding: "24px 24px 28px",
    maxWidth: 560, width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9",
  },

  // Top bar
  topBar: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14, gap: 8, flexWrap: "wrap",
  },
  topLeft:    { display: "flex", alignItems: "center", gap: 8 },
  topRight:   { display: "flex", alignItems: "center", gap: 6 },
  unitDot:    { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  moduleLabel:{ fontSize: 13, fontWeight: 700, color: "#64748b" },
  hintPill: {
    fontSize: 12, fontWeight: 700, padding: "4px 10px",
    borderRadius: 99, border: "1px solid transparent",
  },
  btnSm: {
    padding: "5px 10px", borderRadius: 8,
    border: "1px solid #e2e8f0", background: "#f8fafc",
    color: "#475569", fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },

  // Progress
  progressTrack: { background: "#f1f5f9", borderRadius: 99, height: 6, marginBottom: 8, overflow: "hidden" },
  progressFill:  { height: 6, borderRadius: 99, transition: "width 0.4s ease" },
  qCounter: {
    fontSize: 13, color: "#94a3b8", marginBottom: 16,
    display: "flex", alignItems: "center", gap: 8,
  },
  xpPill: {
    fontSize: 11, fontWeight: 800, padding: "3px 10px",
    borderRadius: 99, marginLeft: "auto",
  },

  // Question
  questionBox: {
    background: "#f8fafc", borderRadius: 14,
    padding: "16px 20px", border: "2px solid", marginBottom: 14,
  },
  statement: { fontSize: 16, color: "#1e293b", lineHeight: 1.75, margin: 0 },

  // Hint box
  hintBox: {
    background: "#fffbeb", border: "1px solid #fde68a",
    borderRadius: 12, padding: "12px 16px",
    display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14,
  },
  hintIcon:  { fontSize: 20, flexShrink: 0 },
  hintLabel: { fontSize: 11, fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 3px" },
  hintText:  { fontSize: 14, color: "#78350f", lineHeight: 1.6, margin: 0 },

  // Options
  optionsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 },
  optionBtn: {
    padding: "13px 16px", borderRadius: 12, border: "2px solid",
    fontSize: 15, textAlign: "center", transition: "all 0.15s",
    fontFamily: "inherit", lineHeight: 1.4,
  },
  input: {
    width: "100%", padding: "12px 16px", fontSize: 16,
    border: "2px solid", borderRadius: 12, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    background: "#f8fafc", color: "#1e293b",
    marginBottom: 14, transition: "border-color 0.2s",
  },

  // Feedback banners
  feedbackCorrect: {
    background: "#f0fdf4", border: "1px solid #86efac",
    borderRadius: 10, padding: "12px 16px",
    fontSize: 14, fontWeight: 600, color: "#15803d",
    marginBottom: 14,
  },
  feedbackWrong: {
    background: "#fef2f2", border: "1px solid #fca5a5",
    borderRadius: 10, padding: "12px 16px",
    fontSize: 14, fontWeight: 600, color: "#dc2626",
    marginBottom: 12,
  },

  // ── Error options panel ────────────────────────────────────────────────────
  errorPanel: {
    display: "flex", flexDirection: "column", gap: 8, marginBottom: 4,
  },
  errorOptBtn: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "12px 16px", borderRadius: 12,
    border: "1.5px solid #e2e8f0", background: "#f8fafc",
    cursor: "pointer", fontFamily: "inherit",
    textAlign: "left", transition: "all 0.15s",
    width: "100%",
  },
  errorOptIcon:  { fontSize: 22, flexShrink: 0 },
  errorOptText:  { display: "flex", flexDirection: "column", gap: 2 },
  errorOptTitle: { fontSize: 14, fontWeight: 700, color: "#1e293b" },
  errorOptSub:   { fontSize: 12, color: "#64748b" },

  // Primary button
  btnPrimary: {
    display: "block", width: "100%",
    padding: "13px 24px", borderRadius: 12, border: "none",
    color: "#fff", fontWeight: 700, fontSize: 15,
    cursor: "pointer", fontFamily: "inherit",
    transition: "opacity 0.15s, background 0.15s",
  },
};
