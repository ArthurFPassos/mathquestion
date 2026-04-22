import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { DIAGNOSTIC } from "../data/units";
import ExitModal from "./ExitModal";

// RF16 — below 60% → /revisao, else → /modulo-1
const PASS_THRESHOLD = 0.6;

export default function DiagnosticScreen() {
  const { dispatch }              = useApp();
  const navigate                  = useNavigate();
  const [qIndex, setQIndex]       = useState(0);
  const [selected, setSelected]   = useState(null);
  const [answered, setAnswered]   = useState(false);
  const [correctCount, setCorrect]= useState(0);
  const [showExit, setShowExit]   = useState(false); // RF18/RF19

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
      // RF16 — route by performance
      // RF16 — pass origin context so ReviewScreen renders conditionally
      if (score < PASS_THRESHOLD) {
        navigate("/revisao", { state: { fromDiagnostic: true, score } });
      } else {
        navigate("/modulo-1");
      }
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  return (
    <div style={st.wrapper}>
      {showExit && (
        <ExitModal
          onConfirm={() => navigate("/app")}
          onCancel={() => setShowExit(false)}
        />
      )}

      <div style={st.card}>
        {/* Top bar */}
        <div style={st.topRow}>
          <span style={st.badge}>🩺 Diagnóstico inicial</span>
          <div style={st.topRight}>
            <span style={st.counter}>{qIndex + 1} / {DIAGNOSTIC.length}</span>
            <button onClick={() => setShowExit(true)} style={st.exitBtn} aria-label="Sair">
              ✕ Sair
            </button>
          </div>
        </div>

        {/* Progress */}
        <div style={st.progressTrack}>
          <div style={{ ...st.progressFill, width: `${progress}%` }} />
        </div>

        <h2 style={st.heading}>Vamos ver o que você já sabe!</h2>

        <div style={st.questionBox}>
          <p style={st.statement}>{q.statement}</p>
        </div>

        {/* Options */}
        <div style={st.optionsGrid}>
          {q.options.map((opt, i) => {
            const isSel     = selected === opt;
            const isCorrect = answered && opt === q.answer;
            const isWrong   = answered && isSel && opt !== q.answer;
            return (
              <button
                key={i}
                onClick={() => !answered && setSelected(opt)}
                disabled={answered}
                style={{
                  ...st.optionBtn,
                  background:  isCorrect ? "#f0fdf4" : isSel ? "#eff6ff" : "#f8fafc",
                  borderColor: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : isSel ? "#2563EB" : "#e2e8f0",
                  color:       isCorrect ? "#15803d" : isWrong ? "#dc2626" : isSel ? "#2563EB" : "#1e293b",
                  fontWeight:  isSel ? 700 : 400,
                  opacity:     answered && !isSel && !isCorrect ? 0.5 : 1,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {answered && (
          <div style={{
            ...st.feedbackBox,
            background:  selected === q.answer ? "#f0fdf4" : "#fef2f2",
            borderColor: selected === q.answer ? "#86efac" : "#fca5a5",
            color:       selected === q.answer ? "#15803d" : "#dc2626",
          }}>
            {selected === q.answer ? "✅ Correto!" : `❌ A resposta correta era: ${q.answer}`}
          </div>
        )}

        {!answered ? (
          <button onClick={confirm} disabled={!selected}
            style={{ ...st.btnPrimary, opacity: selected ? 1 : 0.5 }}>
            Confirmar
          </button>
        ) : (
          <button onClick={next} style={st.btnPrimary}>
            {isLast ? "Ver resultado →" : "Próxima questão →"}
          </button>
        )}

        <p style={st.note}>Esta avaliação registra seu ponto de partida. Sem pressão!</p>
      </div>
    </div>
  );
}

const st = {
  wrapper:      { display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:16, background:"#f8fafc" },
  card:         { background:"#fff", borderRadius:20, padding:"32px 28px", maxWidth:480, width:"100%", boxShadow:"0 4px 24px rgba(0,0,0,0.07)", border:"1px solid #f1f5f9" },
  topRow:       { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 },
  topRight:     { display:"flex", alignItems:"center", gap:12 },
  badge:        { background:"#eff6ff", color:"#2563EB", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:99 },
  counter:      { fontSize:13, color:"#94a3b8", fontWeight:600 },
  exitBtn:      { padding:"5px 12px", borderRadius:8, border:"1.5px solid #fca5a5", background:"#fef2f2", color:"#ef4444", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
  progressTrack:{ background:"#f1f5f9", borderRadius:99, height:6, marginBottom:20, overflow:"hidden" },
  progressFill: { height:6, borderRadius:99, background:"#2563EB", transition:"width 0.4s ease" },
  heading:      { fontSize:18, fontWeight:700, color:"#1e293b", margin:"0 0 20px", textAlign:"center" },
  questionBox:  { background:"#f8fafc", borderRadius:14, padding:"16px 20px", border:"2px solid #e2e8f0", marginBottom:16 },
  statement:    { fontSize:16, color:"#1e293b", lineHeight:1.7, margin:0 },
  optionsGrid:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 },
  optionBtn:    { padding:"13px 16px", borderRadius:12, border:"2px solid", cursor:"pointer", fontSize:15, textAlign:"center", transition:"all 0.15s", fontFamily:"inherit" },
  feedbackBox:  { borderRadius:10, padding:"12px 16px", fontSize:14, fontWeight:600, border:"1px solid", marginBottom:14 },
  btnPrimary:   { width:"100%", padding:"13px 24px", borderRadius:12, border:"none", background:"#2563EB", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit", marginBottom:12, transition:"opacity 0.15s" },
  note:         { fontSize:12, color:"#94a3b8", textAlign:"center", margin:0 },
};
