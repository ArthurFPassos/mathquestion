import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ExitModal from "./ExitModal";



const SECOND_DIAGNOSTIC = [
  {
    id: "sd1",
    statement: "Quanto é 234 + 58?",
    options: ["282", "292", "302", "272"],
    answer: "292",
  },
  {
    id: "sd2",
    statement: "Calcule 500 − 137.",
    options: ["353", "363", "373", "343"],
    answer: "363",
  },
  {
    id: "sd3",
    statement: "Quanto é 15 × 6?",
    options: ["80", "90", "75", "95"],
    answer: "90",
  },
  {
    id: "sd4",
    statement: "Quanto é 96 ÷ 8?",
    options: ["10", "12", "14", "16"],
    answer: "12",
  },
  {
    id: "sd5",
    statement: "Quanto é 2⁴ (2 elevado à quarta potência)?",
    options: ["8", "12", "16", "24"],
    answer: "16",
  },
  {
    id: "sd6",
    statement: "Calcule: 3/8 + 2/8",
    options: ["4/8", "5/8", "6/8", "1/8"],
    answer: "5/8",
  },
];



function ResultScreen({ score, onContinue }) {
  const pct     = Math.round(score * 100);
  const passed  = pct >= 60;
  const color   = passed ? "#2563EB" : "#D97706";
  const bg      = passed ? "#EFF6FF" : "#FFFBEB";
  const border  = passed ? "#BFDBFE" : "#FDE68A";

  return (
    <div style={st.wrapper}>
      <div style={{ ...st.card, textAlign: "center", maxWidth: 440 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>
          {passed ? "🎉" : "💪"}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>
          {passed ? "Muito bem! Você progrediu!" : "Continue praticando!"}
        </h2>
        <p style={{ fontSize: 15, color: "#475569", marginBottom: 28, lineHeight: 1.65 }}>
          {passed
            ? "Sua revisão funcionou. Você demonstrou bom domínio do conteúdo!"
            : "Não desanime! Com prática constante você vai melhorar muito."}
        </p>

        {}
        <div style={{ ...st.scoreRing, background: bg, border: `3px solid ${border}` }}>
          <span style={{ fontSize: 36, fontWeight: 800, color }}>{pct}%</span>
          <span style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>de acertos</span>
        </div>

        {}
        <div style={st.statsRow}>
          <div style={st.statItem}>
            <span style={st.statVal}>{Math.round(score * SECOND_DIAGNOSTIC.length)}</span>
            <span style={st.statLbl}>Acertos</span>
          </div>
          <div style={st.statDivider} />
          <div style={st.statItem}>
            <span style={st.statVal}>{SECOND_DIAGNOSTIC.length - Math.round(score * SECOND_DIAGNOSTIC.length)}</span>
            <span style={st.statLbl}>Erros</span>
          </div>
          <div style={st.statDivider} />
          <div style={st.statItem}>
            <span style={st.statVal}>{SECOND_DIAGNOSTIC.length}</span>
            <span style={st.statLbl}>Total</span>
          </div>
        </div>

        {}
        <button onClick={onContinue} style={st.btnContinue}>
          Ir para o Módulo 1 →
        </button>
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>
          Independentemente da nota, você avança para o primeiro módulo!
        </p>
      </div>
    </div>
  );
}



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

  const q        = SECOND_DIAGNOSTIC[qIndex];
  const isLast   = qIndex === SECOND_DIAGNOSTIC.length - 1;
  const progress = (qIndex / SECOND_DIAGNOSTIC.length) * 100;

  const confirm = () => {
    if (!selected) return;
    if (selected === q.answer) setCorrect((c) => c + 1);
    setAnswered(true);
  };

  const next = () => {
    const finalCorrect = correctCount + (selected === q.answer ? 1 : 0);
    if (isLast) {
      const score = finalCorrect / SECOND_DIAGNOSTIC.length;
      dispatch({ type: "SECOND_DIAGNOSTIC_DONE", payload: score });
      setFinalScore(score);
      setFinished(true);
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  
  const handleContinue = () => navigate("/modulo-1");

  if (finished) {
    return <ResultScreen score={finalScore} onContinue={handleContinue} />;
  }

  return (
    <div style={st.wrapper}>
      {showExit && (
        <ExitModal
          onConfirm={() => navigate("/revisao")}
          onCancel={() => setShowExit(false)}
        />
      )}

      <div style={st.card}>
        {}
        <div style={st.topRow}>
          <div style={st.topLeft}>
            <span style={st.badge}>🔬 2º Diagnóstico</span>
            <span style={st.qCounter}>{qIndex + 1} / {SECOND_DIAGNOSTIC.length}</span>
          </div>
          <button onClick={() => setShowExit(true)} style={st.exitBtn} aria-label="Sair">
            ✕ Sair
          </button>
        </div>

        {}
        <div style={st.progressTrack}>
          <div style={{ ...st.progressFill, width: `${progress}%` }} />
        </div>

        {}
        <div style={st.headingRow}>
          <h2 style={st.heading}>Segundo Diagnóstico</h2>
          <p style={st.subheading}>Após a revisão, vamos ver sua evolução!</p>
        </div>

        {}
        <div style={st.questionBox}>
          <p style={st.statement}>{q.statement}</p>
        </div>

        {}
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

        {}
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
            {isLast ? "Ver resultado final →" : "Próxima questão →"}
          </button>
        )}

        <p style={st.note}>
          Ao final deste diagnóstico você avançará automaticamente para o Módulo 1.
        </p>
      </div>
    </div>
  );
}



const st = {
  wrapper:       { display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:16, background:"#f8fafc" },
  card:          { background:"#fff", borderRadius:20, padding:"28px 28px", maxWidth:500, width:"100%", boxShadow:"0 4px 24px rgba(0,0,0,0.08)", border:"1px solid #f1f5f9" },
  topRow:        { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 },
  topLeft:       { display:"flex", alignItems:"center", gap:10 },
  badge:         { background:"#ecfdf5", color:"#059669", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:99 },
  qCounter:      { fontSize:13, color:"#94a3b8", fontWeight:600 },
  exitBtn:       { padding:"5px 12px", borderRadius:8, border:"1.5px solid #fca5a5", background:"#fef2f2", color:"#ef4444", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
  progressTrack: { background:"#f1f5f9", borderRadius:99, height:6, marginBottom:18, overflow:"hidden" },
  progressFill:  { height:6, borderRadius:99, background:"#059669", transition:"width 0.4s ease" },
  headingRow:    { marginBottom:16 },
  heading:       { fontSize:18, fontWeight:800, color:"#1e293b", margin:"0 0 4px" },
  subheading:    { fontSize:13, color:"#64748b", margin:0 },
  questionBox:   { background:"#f8fafc", borderRadius:14, padding:"16px 20px", border:"2px solid #e2e8f0", marginBottom:14 },
  statement:     { fontSize:16, color:"#1e293b", lineHeight:1.7, margin:0 },
  optionsGrid:   { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 },
  optionBtn:     { padding:"13px 16px", borderRadius:12, border:"2px solid", cursor:"pointer", fontSize:15, textAlign:"center", transition:"all 0.15s", fontFamily:"inherit" },
  feedbackBox:   { borderRadius:10, padding:"12px 16px", fontSize:14, fontWeight:600, border:"1px solid", marginBottom:12 },
  btnPrimary:    { width:"100%", padding:"13px 24px", borderRadius:12, border:"none", background:"#059669", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit", marginBottom:10, transition:"opacity 0.15s" },
  note:          { fontSize:12, color:"#94a3b8", textAlign:"center", margin:0 },

  
  scoreRing:     { width:110, height:110, borderRadius:"50%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" },
  statsRow:      { display:"flex", alignItems:"center", justifyContent:"center", gap:20, marginBottom:28, padding:"16px 24px", background:"#f8fafc", borderRadius:14 },
  statItem:      { display:"flex", flexDirection:"column", alignItems:"center", gap:4 },
  statVal:       { fontSize:22, fontWeight:800, color:"#1e293b" },
  statLbl:       { fontSize:11, color:"#94a3b8", fontWeight:500 },
  statDivider:   { width:1, height:36, background:"#E2E8F0" },
  btnContinue:   { display:"block", width:"100%", padding:"14px 24px", borderRadius:12, border:"none", background:"#2563EB", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 8px 24px rgba(37,99,235,0.25)" },
};





