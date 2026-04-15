import { useState } from "react";
import { useApp } from "../context/AppContext";
import { DIAGNOSTIC } from "../data/units";

export default function DiagnosticScreen() {
  const { dispatch } = useApp();
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const q = DIAGNOSTIC[qIndex];
  const isLast = qIndex === DIAGNOSTIC.length - 1;
  const progress = ((qIndex) / DIAGNOSTIC.length) * 100;

  const confirm = () => {
    if (!selected) return;
    const ok = selected === q.answer;
    if (ok) setCorrectCount((c) => c + 1);
    setAnswered(true);
  };

  const next = () => {
    const finalCorrect = correctCount + (selected === q.answer ? 1 : 0);

    if (isLast) {
      const score = finalCorrect / DIAGNOSTIC.length;
      dispatch({ type: "DIAGNOSTIC_DONE", payload: score });
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.topRow}>
          <span style={styles.badge}>🩺 Diagnóstico</span>
          <span style={styles.counter}>
            {qIndex + 1} / {DIAGNOSTIC.length}
          </span>
        </div>

        {/* Progress */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          />
        </div>

        <h2 style={styles.heading}>Vamos ver o que você já sabe!</h2>

        {/* Statement */}
        <div style={styles.questionBox}>
          <p style={styles.statement}>{q.statement}</p>
        </div>

        {/* Options */}
        <div style={styles.optionsGrid}>
          {q.options.map((opt, i) => {
            const isSelected = selected === opt;
            const isCorrect = answered && opt === q.answer;
            const isWrong = answered && isSelected && opt !== q.answer;

            return (
              <button
                key={i}
                onClick={() => !answered && setSelected(opt)}
                disabled={answered}
                style={{
                  ...styles.optionBtn,
                  background: isCorrect
                    ? "#f0fdf4"
                    : isSelected
                    ? "#eef2ff"
                    : "#f8fafc",
                  borderColor: isCorrect
                    ? "#22c55e"
                    : isWrong
                    ? "#ef4444"
                    : isSelected
                    ? "#6366f1"
                    : "#e2e8f0",
                  color: isCorrect
                    ? "#15803d"
                    : isWrong
                    ? "#dc2626"
                    : isSelected
                    ? "#6366f1"
                    : "#1e293b",
                  fontWeight: isSelected ? 700 : 400,
                  opacity: answered && !isSelected && !isCorrect ? 0.5 : 1,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {answered && (
          <div
            style={{
              ...styles.feedbackBox,
              background: selected === q.answer ? "#f0fdf4" : "#fef2f2",
              borderColor: selected === q.answer ? "#86efac" : "#fca5a5",
              color: selected === q.answer ? "#15803d" : "#dc2626",
            }}
          >
            {selected === q.answer
              ? "✅ Correto!"
              : `❌ A resposta era: ${q.answer}`}
          </div>
        )}

        {/* Action */}
        {!answered ? (
          <button
            onClick={confirm}
            disabled={!selected}
            style={{
              ...styles.btnPrimary,
              opacity: selected ? 1 : 0.5,
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            Confirmar
          </button>
        ) : (
          <button onClick={next} style={styles.btnPrimary}>
            {isLast ? "Ver meu painel →" : "Próxima questão →"}
          </button>
        )}

        <p style={styles.note}>
          Esta avaliação ajuda a registrar seu ponto de partida. Sem pressão!
        </p>
      </div>
    </div>
  );
}

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
    padding: "32px 28px",
    maxWidth: 480,
    width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    border: "1px solid #f1f5f9",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    background: "#eff6ff",
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: 700,
    padding: "4px 12px",
    borderRadius: 99,
  },
  counter: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: 600,
  },
  progressTrack: {
    background: "#f1f5f9",
    borderRadius: 99,
    height: 6,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 99,
    background: "#6366f1",
    transition: "width 0.4s ease",
  },
  heading: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 20px",
    textAlign: "center",
  },
  questionBox: {
    background: "#f8fafc",
    borderRadius: 14,
    padding: "16px 20px",
    border: "2px solid #e2e8f0",
    marginBottom: 16,
  },
  statement: {
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 1.7,
    margin: 0,
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
  },
  feedbackBox: {
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 600,
    border: "1px solid",
    marginBottom: 14,
  },
  btnPrimary: {
    width: "100%",
    padding: "13px 24px",
    borderRadius: 12,
    border: "none",
    background: "#6366f1",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: 12,
    transition: "opacity 0.15s",
  },
  note: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    margin: 0,
  },
};
