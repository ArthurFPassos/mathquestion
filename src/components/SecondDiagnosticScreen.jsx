import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ExitModal from "./ExitModal";
import "./SecondDiagnosticScreen.css";

const QUESTIONS = [
  { id:"sd1", statement:"Quanto é 234 + 58?",           options:["282","292","302","272"], answer:"292" },
  { id:"sd2", statement:"Calcule 500 − 137.",            options:["353","363","373","343"], answer:"363" },
  { id:"sd3", statement:"Quanto é 15 × 6?",             options:["80","90","75","95"],     answer:"90"  },
  { id:"sd4", statement:"Quanto é 96 ÷ 8?",             options:["10","12","14","16"],     answer:"12"  },
  { id:"sd5", statement:"Quanto é 2⁴?",                  options:["8","12","16","24"],      answer:"16"  },
  { id:"sd6", statement:"Calcule: 3/8 + 2/8",           options:["4/8","5/8","6/8","1/8"], answer:"5/8" },
];

// ─── Result screen ────────────────────────────────────────────────────────────

function ResultScreen({ score, onContinue }) {
  const pct    = Math.round(score * 100);
  const passed = pct >= 60;

  return (
    <div className="sd-wrapper">
      <div className="sd-card" style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{passed ? "🎉" : "💪"}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>
          {passed ? "Muito bem! Você progrediu!" : "Continue praticando!"}
        </h2>
        <p style={{ fontSize: 15, color: "#475569", marginBottom: 28, lineHeight: 1.65 }}>
          {passed
            ? "Sua revisão funcionou. Você demonstrou bom domínio do conteúdo!"
            : "Não desanime! Com prática constante você vai melhorar muito."}
        </p>

        <div
          className="sd-score-ring"
          style={{
            background: passed ? "#eff6ff" : "#fffbeb",
            borderColor: passed ? "#bfdbfe" : "#fde68a",
          }}
        >
          <span className="sd-score-value" style={{ color: passed ? "#2563eb" : "#d97706" }}>
            {pct}%
          </span>
          <span className="sd-score-label">de acertos</span>
        </div>

        <div className="sd-stats-row">
          <div className="sd-stat-item">
            <span className="sd-stat-val">{Math.round(score * QUESTIONS.length)}</span>
            <span className="sd-stat-lbl">Acertos</span>
          </div>
          <div className="sd-stat-divider" />
          <div className="sd-stat-item">
            <span className="sd-stat-val">{QUESTIONS.length - Math.round(score * QUESTIONS.length)}</span>
            <span className="sd-stat-lbl">Erros</span>
          </div>
          <div className="sd-stat-divider" />
          <div className="sd-stat-item">
            <span className="sd-stat-val">{QUESTIONS.length}</span>
            <span className="sd-stat-lbl">Total</span>
          </div>
        </div>

        <button className="sd-btn-continue" onClick={onContinue}>
          Ir para o Módulo 1 →
        </button>
        <p className="sd-note" style={{ marginTop: 10 }}>
          Independentemente da nota, você avança para o primeiro módulo!
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SecondDiagnosticScreen() {
  const { dispatch }               = useApp();
  const navigate                   = useNavigate();
  const [qIndex, setQIndex]        = useState(0);
  const [selected, setSelected]    = useState(null);
  const [answered, setAnswered]    = useState(false);
  const [correctCount, setCorrect] = useState(0);
  const [showExit, setShowExit]    = useState(false);
  const [finished, setFinished]    = useState(false);
  const [finalScore, setFinalScore]= useState(0);

  const q        = QUESTIONS[qIndex];
  const isLast   = qIndex === QUESTIONS.length - 1;
  const progress = (qIndex / QUESTIONS.length) * 100;

  const confirm = () => {
    if (!selected) return;
    if (selected === q.answer) setCorrect((c) => c + 1);
    setAnswered(true);
  };

  const next = () => {
    const finalCorrect = correctCount + (selected === q.answer ? 1 : 0);
    if (isLast) {
      const score = finalCorrect / QUESTIONS.length;
      dispatch({ type: "SECOND_DIAGNOSTIC_DONE", payload: score });
      setFinalScore(score);
      setFinished(true);
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const optionClass = (opt) => {
    const base = "sd-option-btn";
    if (!answered) return selected === opt ? `${base} sd-option-btn--selected` : base;
    if (opt === q.answer)                       return `${base} sd-option-btn--correct`;
    if (opt === selected && opt !== q.answer)   return `${base} sd-option-btn--wrong`;
    return `${base} sd-option-btn--dim`;
  };

  if (finished) {
    return <ResultScreen score={finalScore} onContinue={() => navigate("/modulo-1")} />;
  }

  return (
    <div className="sd-wrapper">
      {showExit && (
        <ExitModal
          onConfirm={() => navigate("/revisao")}
          onCancel={() => setShowExit(false)}
        />
      )}

      <div className="sd-card">
        <div className="sd-top-row">
          <div className="sd-top-left">
            <span className="sd-badge">🔬 2º Diagnóstico</span>
            <span className="sd-q-counter">{qIndex + 1} / {QUESTIONS.length}</span>
          </div>
          <button
            className="sd-exit-btn"
            onClick={() => setShowExit(true)}
            aria-label="Sair"
          >
            ✕ Sair
          </button>
        </div>

        <div className="sd-progress-track">
          <div className="sd-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <h2 className="sd-heading">Segundo Diagnóstico</h2>
        <p className="sd-subheading">Após a revisão, vamos ver sua evolução!</p>

        <div className="sd-question-box">
          <p className="sd-statement">{q.statement}</p>
        </div>

        <div className="sd-options-grid">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={optionClass(opt)}
              onClick={() => !answered && setSelected(opt)}
              disabled={answered}
            >
              {opt}
            </button>
          ))}
        </div>

        {answered && (
          <div className={`sd-feedback ${selected === q.answer ? "sd-feedback--correct" : "sd-feedback--wrong"}`}>
            {selected === q.answer ? "✅ Correto!" : `❌ A resposta correta era: ${q.answer}`}
          </div>
        )}

        {!answered ? (
          <button className="sd-btn-primary" onClick={confirm} disabled={!selected}>
            Confirmar
          </button>
        ) : (
          <button className="sd-btn-primary" onClick={next}>
            {isLast ? "Ver resultado final →" : "Próxima questão →"}
          </button>
        )}

        <p className="sd-note">
          Ao final deste diagnóstico você avançará automaticamente para o Módulo 1.
        </p>
      </div>
    </div>
  );
}
