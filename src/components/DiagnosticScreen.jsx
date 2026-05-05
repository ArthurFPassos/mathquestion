import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { DIAGNOSTIC } from "../data/units";
import { saveDiagnostic } from "../firebase/firebaseService";
import Scratchpad from "./Scratchpad";
import "./DiagnosticScreen.css";

const PASS_THRESHOLD = 0.6;

export default function DiagnosticScreen() {
  const { state, dispatch }       = useApp();
  const navigate                  = useNavigate();
  const [qIndex, setQIndex]       = useState(0);
  const [selected, setSelected]   = useState(null);
  const [answered, setAnswered]   = useState(false);
  const [correctCount, setCorrect]= useState(0);

  const q        = DIAGNOSTIC[qIndex];
  const isLast   = qIndex === DIAGNOSTIC.length - 1;
  const progress = (qIndex / DIAGNOSTIC.length) * 100;

  const confirm = () => {
    if (!selected) return;
    if (selected === q.answer) setCorrect((c) => c + 1);
    setAnswered(true);
  };

  const next = () => {
    const finalCorrect = correctCount + (selected === q.answer ? 1 : 0);
    if (isLast) {
      const score = finalCorrect / DIAGNOSTIC.length;
      dispatch({ type: "FIRST_DIAGNOSTIC_DONE", payload: score });

      // Salva no Firestore (silencioso — não bloqueia o fluxo)
      if (state.user?.uid) {
        saveDiagnostic(state.user.uid, 1, score, finalCorrect, DIAGNOSTIC.length).catch(console.error);
      }

      navigate(
        score < PASS_THRESHOLD ? "/revisao" : "/modulo-1",
        score < PASS_THRESHOLD ? { state: { fromDiagnostic: true, score } } : undefined
      );
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const optionClass = (opt) => {
    const base = "ds-option-btn";
    if (!answered) return selected === opt ? `${base} ds-option-btn--selected` : base;
    if (opt === q.answer)                          return `${base} ds-option-btn--correct`;
    if (opt === selected && opt !== q.answer)      return `${base} ds-option-btn--wrong`;
    return `${base} ds-option-btn--dim`;
  };

  return (
    <div className="ds-wrapper">
      <div className="ds-card">
        <div className="ds-top-row">
          <span className="ds-badge">🩺 Diagnóstico inicial</span>
          <div className="ds-top-right">
            <span className="ds-counter">
              {qIndex + 1} / {DIAGNOSTIC.length}
              {state.scratchpadOpen && <Scratchpad />}
              <button
                className="ds-scratchpad-btn"
                onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}
              >
                ✏️
              </button>
            </span>
          </div>
        </div>

        <div className="ds-progress-track">
          <div className="ds-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <h2 className="ds-heading">Vamos ver o que você já sabe!</h2>

        <div className="ds-question-box">
          <p className="ds-statement">{q.statement}</p>
        </div>

        <div className="ds-options-grid">
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
          <div
            className={`ds-feedback ${
              selected === q.answer ? "ds-feedback--correct" : "ds-feedback--wrong"
            }`}
          >
            {selected === q.answer
              ? "✅ Correto!"
              : `❌ A resposta correta era: ${q.answer}`}
          </div>
        )}

        {!answered ? (
          <button
            className="ds-btn-primary"
            onClick={confirm}
            disabled={!selected}
          >
            Confirmar
          </button>
        ) : (
          <button className="ds-btn-primary" onClick={next}>
            {isLast ? "Ver resultado →" : "Próxima questão →"}
          </button>
        )}

        <p className="ds-note">
          Esta avaliação registra seu ponto de partida. Sem pressão!
        </p>
      </div>
    </div>
  );
}
