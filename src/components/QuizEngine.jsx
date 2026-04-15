import { useState } from "react";
import { useApp } from "../context/AppContext";
import { UNITS } from "../data/units";
import Scratchpad from "./Scratchpad";

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuizEngine() {
  const { state, dispatch } = useApp();

  // Resolve current module and unit from context
  const module = UNITS.flatMap((u) => u.modules).find(
    (m) => m.id === state.currentModule
  );
  const unit = UNITS.find((u) =>
    u.modules.some((m) => m.id === state.currentModule)
  );

  // ─── Local state ────────────────────────────────────────────────────────────

  const [qIndex, setQIndex] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");
  const [selected, setSelected] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | "correct" | "wrong"
  const [showHint, setShowHint] = useState(false);
  const [scores, setScores] = useState([]);
  const [xpLog, setXpLog] = useState([]);
  const [startTime] = useState(Date.now());

  // ─── Guards ──────────────────────────────────────────────────────────────────

  if (!module || !unit) return null;

  const q = module.questions[qIndex];
  const isLastQuestion = qIndex === module.questions.length - 1;
  const hintsLeft = 3 - state.hintsUsedInBattery;

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const confirm = () => {
    const userAnswer = q.type === "multiple" ? selected : textAnswer.trim();
    if (!userAnswer) return;

    const correct = userAnswer === q.answer;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setFeedback(correct ? "correct" : "wrong");

    if (correct) {
      const xp = showHint ? Math.floor(q.xp * 0.5) : q.xp;
      setScores((s) => [...s, 1]);
      setXpLog((x) => [...x, xp]);
    }
  };

  const useHint = () => {
    if (hintsLeft <= 0) return;
    dispatch({ type: "USE_HINT" });
    setShowHint(true);
  };

  const advance = () => {
    // If still wrong and first attempt, retry (don't record yet)
    if (feedback === "wrong" && attempts === 1) {
      setFeedback(null);
      setSelected(null);
      setTextAnswer("");
      return;
    }

    // Record miss if not yet recorded
    const wasCorrect = feedback === "correct";
    if (!wasCorrect) {
      setScores((s) => [...s, 0]);
      setXpLog((x) => [...x, 0]);
    }

    if (isLastQuestion) {
      finishModule(wasCorrect);
    } else {
      goToNext();
    }
  };

  const goToNext = () => {
    setQIndex((i) => i + 1);
    setTextAnswer("");
    setSelected(null);
    setFeedback(null);
    setAttempts(0);
    setShowHint(false);
  };

  const finishModule = (lastWasCorrect) => {
    const finalScores = lastWasCorrect ? scores : [...scores];
    const totalCorrect = finalScores.reduce((a, b) => a + b, 0);
    const score = totalCorrect / module.questions.length;
    const totalXP = xpLog.reduce((a, b) => a + b, 0);

    dispatch({
      type: "COMPLETE_MODULE",
      payload: {
        moduleId: module.id,
        score,
        xp: totalXP,
        timeMs: Date.now() - startTime,
        completed: true,
        correct: totalCorrect,
        total: module.questions.length,
      },
    });
  };

  // ─── Derived UI flags ────────────────────────────────────────────────────────

  // Show hint button: only after 1st wrong attempt, hint not yet shown, hints left
  const canUseHint =
    feedback === "wrong" && attempts === 1 && !showHint && hintsLeft > 0;

  // Show advance button when answered correctly OR exhausted 2 attempts
  const canAdvance = feedback === "correct" || attempts >= 2;

  // Current XP for this question
  const currentXP = showHint ? Math.floor(q.xp * 0.5) : q.xp;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={styles.wrapper}>
      {state.scratchpadOpen && <Scratchpad />}

      <div style={styles.card}>
        {/* ── Top bar ── */}
        <div style={styles.topBar}>
          <span style={styles.moduleLabel}>
            {unit.emoji} {module.title}
          </span>
          <div style={styles.topActions}>
            <span style={styles.hintCounter}>
              💡 {hintsLeft} dica{hintsLeft !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}
              style={styles.btnSm}
            >
              ✏️ Rascunho
            </button>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${(qIndex / module.questions.length) * 100}%`,
              background: unit.color,
            }}
          />
        </div>
        <p style={styles.qCounter}>
          Questão {qIndex + 1} de {module.questions.length} • {currentXP} XP
        </p>

        {/* ── Statement ── */}
        <div
          style={{
            ...styles.questionBox,
            borderColor: unit.color + "44",
          }}
        >
          <p style={styles.statement}>{q.statement}</p>
        </div>

        {/* ── Hint box ── */}
        {showHint && (
          <div style={styles.hintBox}>
            💡 <strong>Dica:</strong> {q.hint}
          </div>
        )}

        {/* ── Answer input ── */}
        {q.type === "multiple" ? (
          <div style={styles.optionsGrid}>
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !feedback && setSelected(opt)}
                disabled={!!feedback}
                style={{
                  ...styles.optionBtn,
                  background: selected === opt ? unit.light : "#f8fafc",
                  borderColor:
                    selected === opt ? unit.color : "#e2e8f0",
                  color: selected === opt ? unit.color : "#1e293b",
                  fontWeight: selected === opt ? 700 : 400,
                  opacity: feedback && selected !== opt ? 0.55 : 1,
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
            onKeyDown={(e) => e.key === "Enter" && !feedback && confirm()}
            disabled={!!feedback}
            style={{
              ...styles.input,
              borderColor: feedback
                ? feedback === "correct"
                  ? "#22c55e"
                  : "#ef4444"
                : "#e2e8f0",
            }}
          />
        )}

        {/* ── Feedback banner ── */}
        {feedback && (
          <div
            style={{
              ...styles.feedbackBox,
              background: feedback === "correct" ? "#f0fdf4" : "#fef2f2",
              borderColor: feedback === "correct" ? "#86efac" : "#fca5a5",
              color: feedback === "correct" ? "#15803d" : "#dc2626",
            }}
          >
            {feedback === "correct" ? (
              <>✅ Correto! Muito bem! <strong>+{currentXP} XP</strong></>
            ) : attempts >= 2 ? (
              <>❌ Resposta incorreta. A resposta certa era: <strong>{q.answer}</strong></>
            ) : (
              <>❌ Resposta incorreta. Tente novamente!</>
            )}
          </div>
        )}

        {/* ── Action buttons ── */}
        <div style={styles.actionRow}>
          {!feedback && (
            <button
              onClick={confirm}
              disabled={q.type === "multiple" ? !selected : !textAnswer.trim()}
              style={{ ...styles.btnPrimary, background: unit.color, flex: 1 }}
            >
              Confirmar resposta
            </button>
          )}

          {canUseHint && (
            <button onClick={useHint} style={styles.btnGhost}>
              💡 Ver dica
            </button>
          )}

          {canAdvance && (
            <button
              onClick={advance}
              style={{ ...styles.btnPrimary, background: unit.color, flex: 1 }}
            >
              {isLastQuestion ? "Finalizar módulo 🎉" : "Próxima questão →"}
            </button>
          )}
        </div>

        {/* Skip button: after wrong + no more attempts and hint was used or unavailable */}
        {feedback === "wrong" && attempts < 2 && !canUseHint && (
          <button onClick={advance} style={styles.btnSkip}>
            Pular questão
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 16,
    background: "#f8fafc",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "28px 28px",
    maxWidth: 560,
    width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    border: "1px solid #f1f5f9",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  moduleLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#64748b",
  },
  topActions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  hintCounter: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 600,
  },
  btnSm: {
    padding: "5px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  progressTrack: {
    background: "#f1f5f9",
    borderRadius: 99,
    height: 6,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 99,
    transition: "width 0.4s ease",
  },
  qCounter: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 16,
  },
  questionBox: {
    background: "#f8fafc",
    borderRadius: 14,
    padding: "16px 20px",
    border: "2px solid",
    marginBottom: 16,
  },
  statement: {
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 1.75,
    margin: 0,
  },
  hintBox: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    color: "#78350f",
    marginBottom: 14,
    lineHeight: 1.6,
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 16,
  },
  optionBtn: {
    padding: "13px 16px",
    borderRadius: 12,
    border: "2px solid",
    cursor: "pointer",
    fontSize: 15,
    textAlign: "center",
    transition: "all 0.15s",
    fontFamily: "inherit",
    lineHeight: 1.4,
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 16,
    border: "2px solid",
    borderRadius: 12,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#f8fafc",
    color: "#1e293b",
    marginBottom: 16,
    transition: "border-color 0.2s",
  },
  feedbackBox: {
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 600,
    border: "1px solid",
    marginBottom: 14,
    lineHeight: 1.5,
  },
  actionRow: {
    display: "flex",
    gap: 10,
  },
  btnPrimary: {
    padding: "13px 24px",
    borderRadius: 12,
    border: "none",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.15s",
  },
  btnGhost: {
    padding: "13px 18px",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    background: "transparent",
    color: "#475569",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnSkip: {
    marginTop: 10,
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "underline",
    fontFamily: "inherit",
    display: "block",
    width: "100%",
    textAlign: "center",
  },
};
