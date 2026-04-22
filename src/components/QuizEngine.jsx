import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { UNITS } from "../data/units";
import Scratchpad from "./Scratchpad";
import ExitModal from "./ExitModal";








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
  const [errorAction, setErrorAction] = useState("idle"); 
  const [showHint,    setShowHint]    = useState(false);
  const [scores,      setScores]      = useState([]);
  const [xpLog,       setXpLog]       = useState([]);
  const [startTime]                   = useState(Date.now());
  const [showExit,    setShowExit]    = useState(false);  

  
  if (!module || !unit) return null;

  const q             = module.questions[qIndex];
  const isLastQ       = qIndex === module.questions.length - 1;
  const hintsLeft     = 3 - state.hintsUsedInBattery;
  const currentXP     = showHint ? Math.floor(q.xp * 0.5) : q.xp;
  const progressPct   = (qIndex / module.questions.length) * 100;

  
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
      setErrorAction("idle"); 
    }
  };

  
  const handleRetry = () => {
    setFeedback(null);
    setSelected(null);
    setTextAnswer("");
    setErrorAction("retry");
    
  };

  
  const handleUseHint = () => {
    if (hintsLeft <= 0) return;
    dispatch({ type: "USE_HINT" });
    setShowHint(true);
    setFeedback(null);     
    setSelected(null);
    setTextAnswer("");
    setErrorAction("hint");
  };

  
  const handleSkip = () => {
    
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
    const allScores    = lastWasCorrect ? scores : scores; 
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

  
  const handleExitConfirm = () => {
    dispatch({ type: "SET_SCREEN", payload: "dashboard" });
    navigate("/modulo-1");
  };

  
  const isAnswering  = feedback === null; 
  const isCorrect    = feedback === "correct";
  const isWrong      = feedback === "wrong";
  const canShowHint  = isWrong && !showHint && hintsLeft > 0;

  
  const optionsInteractive = isAnswering;

  
  return (
    <div style={s.wrapper}>
      {}
      {showExit && (
        <ExitModal
          onConfirm={handleExitConfirm}
          onCancel={() => setShowExit(false)}
        />
      )}

      {state.scratchpadOpen && <Scratchpad />}

      <div style={s.card}>

        {}
        <div style={s.topBar}>
          <div style={s.topLeft}>
            <div style={{ ...s.unitDot, background: unit.color }} />
            <span style={s.moduleLabel}>{unit.emoji} {module.title}</span>
          </div>
          <div style={s.topRight}>
            {}
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
            {}
            <button
              onClick={() => setShowExit(true)}
              style={{ ...s.btnSm, borderColor: "#fca5a5", color: "#ef4444", background: "#fef2f2" }}
              aria-label="Sair do exercício"
            >
              ✕
            </button>
          </div>
        </div>

        {}
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: `${progressPct}%`, background: unit.color }} />
        </div>
        <p style={s.qCounter}>
          Questão <strong>{qIndex + 1}</strong> de {module.questions.length}
          <span style={{ ...s.xpPill, background: unit.light, color: unit.color }}>
            +{currentXP} XP
          </span>
        </p>

        {}
        <div style={{ ...s.questionBox, borderColor: unit.color + "44" }}>
          <p style={s.statement}>{q.statement}</p>
        </div>

        {}
        {showHint && (
          <div style={s.hintBox}>
            <span style={s.hintIcon}>💡</span>
            <div>
              <p style={s.hintLabel}>Dica</p>
              <p style={s.hintText}>{q.hint}</p>
            </div>
          </div>
        )}

        {}
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

        {}

        {}
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

        {}
        {isWrong && (
          <>
            {}
            <div style={s.feedbackWrong}>
              ❌ Resposta incorreta. O que deseja fazer?
            </div>

            {}
            <div style={s.errorPanel}>

              {}
              <button onClick={handleRetry} style={s.errorOptBtn}>
                <span style={s.errorOptIcon}>🔄</span>
                <div style={s.errorOptText}>
                  <span style={s.errorOptTitle}>Tentar novamente</span>
                  <span style={s.errorOptSub}>Sem usar dica</span>
                </div>
              </button>

              {}
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

              {}
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

        {}
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

  
  questionBox: {
    background: "#f8fafc", borderRadius: 14,
    padding: "16px 20px", border: "2px solid", marginBottom: 14,
  },
  statement: { fontSize: 16, color: "#1e293b", lineHeight: 1.75, margin: 0 },

  
  hintBox: {
    background: "#fffbeb", border: "1px solid #fde68a",
    borderRadius: 12, padding: "12px 16px",
    display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14,
  },
  hintIcon:  { fontSize: 20, flexShrink: 0 },
  hintLabel: { fontSize: 11, fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 3px" },
  hintText:  { fontSize: 14, color: "#78350f", lineHeight: 1.6, margin: 0 },

  
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

  
  btnPrimary: {
    display: "block", width: "100%",
    padding: "13px 24px", borderRadius: 12, border: "none",
    color: "#fff", fontWeight: 700, fontSize: 15,
    cursor: "pointer", fontFamily: "inherit",
    transition: "opacity 0.15s, background 0.15s",
  },
};





