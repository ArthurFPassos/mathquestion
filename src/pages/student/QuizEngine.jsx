import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useApp } from "../../context/AppContext";
import { UNITS } from "../../data/units";
import { saveModuleResult } from "../../services/firebaseService";
import Scratchpad from "../../components/shared/Scratchpad";
import ExitModal from "../../components/shared/ExitModal";
import "./QuizEngine.css";

// ── Drag & Drop — Sortable Item ──────────────────────────────────────────────

function SortableItem({ id, label, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? "default" : "grab",
  };
  return (
    <div
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`qe-dd-item${isDragging ? " qe-dd-item--dragging" : ""}${disabled ? " qe-dd-item--disabled" : ""}`}
    >
      {!disabled && <span className="qe-dd-handle">⠿</span>}
      <span>{label}</span>
    </div>
  );
}

// ── Drag & Drop Question ──────────────────────────────────────────────────────

function DragDropQuestion({ question, onAnswer, disabled }) {
  const [orderedItems, setOrderedItems] = useState(() => [...question.items]);
  useEffect(() => { setOrderedItems([...question.items]); }, [question.id]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setOrderedItems((items) => {
        const oldIdx = items.findIndex((i) => i.id === active.id);
        const newIdx = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIdx, newIdx);
      });
    }
  };
  const handleConfirm = () => {
    const currentOrder = orderedItems.map((i) => i.id);
    onAnswer(JSON.stringify(currentOrder) === JSON.stringify(question.answer));
  };
  return (
    <div className="qe-dd-wrapper">
      <p className="qe-dd-instruction">{disabled ? "Ordem final:" : "Arraste para reordenar:"}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {orderedItems.map((item) => (
            <SortableItem key={item.id} id={item.id} label={item.label} disabled={disabled} />
          ))}
        </SortableContext>
      </DndContext>
      {!disabled && <button className="qe-dd-confirm-btn" onClick={handleConfirm}>Confirmar ordem</button>}
    </div>
  );
}

// ── Matching Question ─────────────────────────────────────────────────────────

function MatchingQuestion({ question, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null);
  const [connections, setConnections] = useState({});
  const [shuffledRight] = useState(() =>
    [...question.pairs.map((p, i) => ({ label: p.right, origIdx: i }))].sort(() => Math.random() - 0.5)
  );
  useEffect(() => { setSelected(null); setConnections({}); }, [question.id]);

  const handleLeftClick = (idx) => {
    if (disabled) return;
    if (selected?.side === "right") { setConnections((c) => ({ ...c, [idx]: selected.index })); setSelected(null); }
    else setSelected({ side: "left", index: idx });
  };
  const handleRightClick = (idx) => {
    if (disabled) return;
    if (selected?.side === "left") { setConnections((c) => ({ ...c, [selected.index]: idx })); setSelected(null); }
    else setSelected({ side: "right", index: idx });
  };
  const allConnected = Object.keys(connections).length === question.pairs.length;
  const handleConfirm = () => {
    let correct = true;
    for (let leftIdx = 0; leftIdx < question.pairs.length; leftIdx++) {
      const rightShuffledIdx = connections[leftIdx];
      if (rightShuffledIdx === undefined) { correct = false; break; }
      if (shuffledRight[rightShuffledIdx].origIdx !== leftIdx) { correct = false; break; }
    }
    onAnswer(correct);
  };
  return (
    <div className="qe-match-wrapper">
      <p className="qe-dd-instruction">{disabled ? "Suas associações:" : "Clique em um item da esquerda e depois um da direita para ligar:"}</p>
      <div className="qe-match-grid">
        <div className="qe-match-col">
          {question.pairs.map((pair, idx) => {
            const isSel = selected?.side === "left" && selected.index === idx;
            const isCon = connections[idx] !== undefined;
            return (
              <div key={idx} className={`qe-match-item qe-match-item--left${isSel ? " qe-match-item--selected" : ""}${isCon ? " qe-match-item--connected" : ""}`} onClick={() => handleLeftClick(idx)}>
                {pair.left}{isCon && <span className="qe-match-dot">●</span>}
              </div>
            );
          })}
        </div>
        <div className="qe-match-lines">
          {question.pairs.map((_, leftIdx) => (
            <div key={leftIdx} className="qe-match-line-slot">
              {connections[leftIdx] !== undefined && <div className="qe-match-line-badge">↔</div>}
            </div>
          ))}
        </div>
        <div className="qe-match-col">
          {shuffledRight.map((item, idx) => {
            const isSel = selected?.side === "right" && selected.index === idx;
            const isCon = Object.values(connections).includes(idx);
            return (
              <div key={idx} className={`qe-match-item qe-match-item--right${isSel ? " qe-match-item--selected" : ""}${isCon ? " qe-match-item--connected" : ""}`} onClick={() => handleRightClick(idx)}>
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
      {!disabled && (
        <div className="qe-match-actions">
          <button className="qe-match-reset-btn" onClick={() => { setConnections({}); setSelected(null); }}>🔄 Limpar</button>
          <button className="qe-dd-confirm-btn" onClick={handleConfirm} disabled={!allConnected}>Confirmar associações</button>
        </div>
      )}
    </div>
  );
}

// ── RF22: Gera PDF do relatório do módulo ─────────────────────────────────────

async function downloadModuleReport(report) {
  const { default: jsPDF }      = await import("jspdf");
  const { default: autoTable }  = await import("jspdf-autotable");

  const doc     = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW   = doc.internal.pageSize.getWidth();
  const PRIMARY = [99, 102, 241];
  const DARK    = [30, 41, 59];
  const GRAY    = [100, 116, 139];
  const GREEN   = [21, 128, 61];
  const RED     = [220, 38, 38];

  const pct     = Math.round(report.score * 100);
  const timeStr = report.timeMs
    ? (() => { const s = Math.round(report.timeMs / 1000); const m = Math.floor(s / 60); return m > 0 ? `${m}m ${s % 60}s` : `${s}s`; })()
    : "—";
  const dateStr = report.completedAt?.toLocaleString("pt-BR") || new Date().toLocaleString("pt-BR");

  // Header
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text("MathQuestion", 14, 13);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text("Relatório de Módulo — Tentativa mais recente", 14, 21);
  doc.setFontSize(8);
  doc.text(`Gerado em: ${dateStr}`, 14, 28);

  // Info
  let y = 42;
  doc.setTextColor(...DARK);
  doc.setFontSize(14); doc.setFont("helvetica", "bold");
  doc.text(report.moduleName, 14, y);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text(`Unidade: ${report.unitName}  ·  Aluno: ${report.studentName}`, 14, y + 7);

  // Cards
  y += 18;
  const cards = [
    { label: "Acertos",    value: `${report.totalCorrect}/${report.total}` },
    { label: "Percentual", value: `${pct}%` },
    { label: "XP ganho",   value: `${report.xpEarned} pts` },
    { label: "Tempo",      value: timeStr },
  ];
  const cw = (pageW - 28) / 4;
  cards.forEach((c, i) => {
    const cx = 14 + i * (cw + 2);
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(cx, y, cw, 20, 2, 2, "F");
    doc.setTextColor(...PRIMARY); doc.setFontSize(13); doc.setFont("helvetica", "bold");
    doc.text(c.value, cx + cw / 2, y + 9, { align: "center" });
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(c.label, cx + cw / 2, y + 16, { align: "center" });
  });

  // Table
  y += 28;
  doc.setTextColor(...DARK); doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text("Detalhamento por questão", 14, y);

  const rows = report.questions.map((q, i) => [
    String(i + 1),
    q.statement.length > 80 ? q.statement.slice(0, 80) + "…" : q.statement,
    q.type === "multiple" ? "Múltipla" : q.type === "input" ? "Input" : q.type === "drag-drop" ? "Drag&Drop" : "Associação",
    q.skipped ? "Pulada" : q.correct ? "✓ Acerto" : "✗ Erro",
    String(q.attempts),
    q.usedHint ? "Sim" : "Não",
    `${q.xpEarned} XP`,
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [["Nº", "Enunciado", "Tipo", "Resultado", "Tentativas", "Dica", "XP"]],
    body: rows,
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: DARK },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8,  halign: "center" },
      1: { cellWidth: 72 },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 16, halign: "center" },
      6: { cellWidth: 16, halign: "center" },
    },
    margin: { left: 14, right: 14 },
    theme: "grid",
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 3) {
        if (data.cell.raw?.includes("✓"))   data.cell.styles.textColor = GREEN;
        else if (data.cell.raw?.includes("✗")) data.cell.styles.textColor = RED;
        else data.cell.styles.textColor = GRAY;
      }
    },
  });

  const finalY = doc.lastAutoTable?.finalY ?? 260;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, finalY + 8, pageW - 14, finalY + 8);
  doc.setFontSize(7); doc.setTextColor(...GRAY);
  doc.text("MathQuestion — Relatório de módulo gerado automaticamente.", pageW / 2, finalY + 14, { align: "center" });

  doc.save(`relatorio_${report.moduleName.replace(/\s+/g, "_")}.pdf`);
}

// ── Main QuizEngine ───────────────────────────────────────────────────────────

export default function QuizEngine() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // Resolve módulo — padrão ou extra do professor
  const moduleFromUnits = UNITS.flatMap((u) => u.modules).find((m) => m.id === state.currentModule);
  const isExtraModule   = !moduleFromUnits && !!state.extraModule;
  const module          = moduleFromUnits || (isExtraModule ? state.extraModule : null);
  const unit            = UNITS.find((u) => u.modules.some((m) => m.id === state.currentModule))
    || (isExtraModule ? { id: "extra", title: "Módulo Extra", emoji: "🎓", color: "#6366f1", light: "#eef2ff" } : null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [qIndex,              setQIndex]              = useState(0);
  const [textAnswer,          setTextAnswer]          = useState("");
  const [selected,            setSelected]            = useState(null);
  const [feedback,            setFeedback]            = useState(null);
  const [showHint,            setShowHint]            = useState(false);
  const [scores,              setScores]              = useState([]);
  const [xpLog,               setXpLog]               = useState([]);
  const [startTime]                                   = useState(Date.now());
  const [showExit,            setShowExit]            = useState(false);
  const [simplified,          setSimplified]          = useState(false);
  const [interactiveAnswered, setInteractiveAnswered] = useState(false);
  // RF22
  const [questionLog,   setQuestionLog]   = useState([]);
  const [attemptCount,  setAttemptCount]  = useState(0);
  const [moduleReport,  setModuleReport]  = useState(null);

  if (!module || !unit) return null;

  const q          = module.questions[qIndex];
  const isLastQ    = qIndex === module.questions.length - 1;
  const hintsLeft  = 3 - state.hintsUsedInBattery;
  const currentXP  = showHint ? Math.floor(q.xp * 0.5) : q.xp;
  const progressPct = (qIndex / module.questions.length) * 100;
  const isAnswering = feedback === null;
  const isCorrect   = feedback === "correct";
  const isWrong     = feedback === "wrong";
  const canShowHint = isWrong && !showHint && hintsLeft > 0;
  const isInteractive = q.type === "drag-drop" || q.type === "matching";

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleInteractiveAnswer = (correct) => {
    setInteractiveAnswered(true);
    setAttemptCount((a) => a + 1);
    if (correct) {
      setScores((s) => [...s, 1]);
      setXpLog((x) => [...x, showHint ? Math.floor(q.xp * 0.5) : q.xp]);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }
  };

  const confirm = () => {
    const ans = q.type === "multiple" ? selected : textAnswer.trim();
    if (!ans) return;
    setAttemptCount((a) => a + 1);
    if (ans === q.answer) {
      setScores((s) => [...s, 1]);
      setXpLog((x) => [...x, showHint ? Math.floor(q.xp * 0.5) : q.xp]);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }
  };

  const handleRetry = () => {
    setFeedback(null); setSelected(null); setTextAnswer(""); setInteractiveAnswered(false);
  };

  const handleUseHint = () => {
    if (!canShowHint) return;
    dispatch({ type: "USE_HINT" });
    setShowHint(true); setFeedback(null); setSelected(null); setTextAnswer(""); setInteractiveAnswered(false);
  };

  const logCurrentQuestion = (correct, skipped = false) => {
    setQuestionLog((log) => [...log, {
      index:     qIndex,
      statement: q.statement,
      type:      q.type,
      correct,
      skipped,
      attempts:  attemptCount + (skipped ? 0 : 1),
      usedHint:  showHint,
      xpEarned:  correct ? (showHint ? Math.floor(q.xp * 0.5) : q.xp) : 0,
    }]);
  };

  const advanceOrFinish = (correct, skipped = false) => {
    logCurrentQuestion(correct, skipped);
    setAttemptCount(0);
    if (isLastQ) {
      finishModule();
    } else {
      setQIndex((i) => i + 1);
      setTextAnswer(""); setSelected(null); setFeedback(null); setShowHint(false); setInteractiveAnswered(false);
    }
  };

  const handleNext  = () => advanceOrFinish(true);
  const handleSkip  = () => { setScores((s) => [...s, 0]); setXpLog((x) => [...x, 0]); advanceOrFinish(false, true); };

  const finishModule = () => {
    const totalCorrect = scores.reduce((a, b) => a + b, 0);
    const score        = totalCorrect / module.questions.length;
    const totalTimeMs  = Date.now() - startTime;
    const result = {
      moduleId: module.id, score,
      xp:       xpLog.reduce((a, b) => a + b, 0),
      timeMs:   totalTimeMs, completed: true,
      correct:  totalCorrect, total: module.questions.length,
    };
    dispatch({ type: "COMPLETE_MODULE", payload: result });

    setModuleReport({
      moduleName:  module.title,
      unitName:    unit.title,
      studentName: state.user?.name || "Aluno",
      score, totalCorrect,
      total:       module.questions.length,
      xpEarned:    result.xp,
      timeMs:      totalTimeMs,
      completedAt: new Date(),
      questions:   questionLog,
    });

    if (state.user?.uid) {
      saveModuleResult(state.user.uid, module.id, {
        score: result.score, xp: result.xp, correct: result.correct,
        total: result.total, timeMs: result.timeMs, completed: true,
      }).catch(console.error);
    }
  };

  const handleExitConfirm = () => { dispatch({ type: "SET_SCREEN", payload: "dashboard" }); navigate("/modulo-1"); };

  const optStyle = (opt) => ({
    borderColor: selected === opt ? unit.color : "#e2e8f0",
    background:  selected === opt ? unit.light : "#f8fafc",
    color:       selected === opt ? unit.color : "#1e293b",
    fontWeight:  selected === opt ? 700 : 400,
    opacity:     !isAnswering && selected !== opt ? 0.55 : 1,
  });

  const typeLabel = q.type === "drag-drop" ? "🧩 Arrastar e Soltar" : q.type === "matching" ? "🔗 Associação" : null;

  // ── RF22: Tela de resultado ────────────────────────────────────────────────

  if (moduleReport) {
    const pct    = Math.round(moduleReport.score * 100);
    const passed = moduleReport.score >= 0.8;
    return (
      <div className="qe-wrapper">
        <div className="qe-result-card">
          <div className="qe-result-emoji">{passed ? "🎉" : "💪"}</div>
          <h2 className="qe-result-title">{passed ? "Módulo concluído!" : "Boa tentativa!"}</h2>
          <p className="qe-result-sub">{moduleReport.moduleName}</p>

          <div className="qe-result-stats">
            <div className="qe-result-stat">
              <span className="qe-result-stat-val" style={{ color: passed ? "#22c55e" : "#f59e0b" }}>{pct}%</span>
              <span className="qe-result-stat-lbl">Acertos</span>
            </div>
            <div className="qe-result-divider" />
            <div className="qe-result-stat">
              <span className="qe-result-stat-val">{moduleReport.totalCorrect}/{moduleReport.total}</span>
              <span className="qe-result-stat-lbl">Questões</span>
            </div>
            <div className="qe-result-divider" />
            <div className="qe-result-stat">
              <span className="qe-result-stat-val" style={{ color: "#6366f1" }}>+{moduleReport.xpEarned}</span>
              <span className="qe-result-stat-lbl">XP ganho</span>
            </div>
          </div>

          <div className="qe-result-questions">
            {moduleReport.questions.map((q, i) => (
              <div key={i} className={`qe-result-q-row ${q.correct ? "qe-result-q-row--correct" : q.skipped ? "qe-result-q-row--skipped" : "qe-result-q-row--wrong"}`}>
                <span className="qe-result-q-icon">{q.skipped ? "⏭" : q.correct ? "✅" : "❌"}</span>
                <span className="qe-result-q-stmt">{q.statement.length > 60 ? q.statement.slice(0, 60) + "…" : q.statement}</span>
                <span className="qe-result-q-meta">{q.attempts} tent.{q.usedHint ? " · 💡 dica" : ""}</span>
              </div>
            ))}
          </div>

          <div className="qe-result-actions">
            <button className="qe-result-pdf-btn" onClick={() => downloadModuleReport(moduleReport)}>
              📄 Baixar relatório PDF
            </button>
            <button className="qe-result-home-btn" onClick={() => navigate("/dashboard")}>
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render principal ───────────────────────────────────────────────────────

  return (
    <div className="qe-wrapper">
      {showExit && <ExitModal onConfirm={handleExitConfirm} onCancel={() => setShowExit(false)} />}
      {state.scratchpadOpen && <Scratchpad />}

      <div className={`qe-card${simplified ? " qe-card--simplified" : ""}`}>

        <div className="qe-top-bar">
          <div className="qe-top-left">
            <div className="qe-unit-dot" style={{ background: unit.color }} />
            <span className="qe-module-label">{unit.emoji} {module.title}</span>
          </div>
          <div className="qe-top-right">
            <div className={`qe-hint-pill ${hintsLeft > 0 ? "qe-hint-pill--available" : "qe-hint-pill--empty"}`}>
              💡 {hintsLeft} dica{hintsLeft !== 1 ? "s" : ""}
            </div>
            <button className="qe-btn-sm" onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}>✏️</button>
            <button className={`qe-btn-sm${simplified ? " qe-btn-sm--simplified-on" : ""}`} onClick={() => setSimplified((v) => !v)} title="Modo Simplificado">
              {simplified ? "🔤 ON" : "🔤"}
            </button>
            <button className="qe-btn-sm qe-btn-sm--exit" onClick={() => setShowExit(true)}>✕</button>
          </div>
        </div>

        <div className="qe-progress-track">
          <div className="qe-progress-fill" style={{ width: `${progressPct}%`, background: unit.color }} />
        </div>
        <p className="qe-q-counter">
          Questão <strong>{qIndex + 1}</strong> de {module.questions.length}
          {!simplified && (
            <span className="qe-xp-pill" style={{ background: unit.light, color: unit.color }}>+{currentXP} XP</span>
          )}
        </p>

        {typeLabel && (
          <div className="qe-type-badge" style={{ background: unit.light, color: unit.color }}>{typeLabel}</div>
        )}

        <div className="qe-question-box" style={{ borderColor: unit.color + "44" }}>
          <p className={`qe-statement${simplified ? " qe-statement--simplified" : ""}`}>
            {simplified && q.simplifiedText ? q.simplifiedText : q.statement}
          </p>
        </div>

        {showHint && (
          <div className="qe-hint-box">
            <span className="qe-hint-icon">💡</span>
            <div><p className="qe-hint-label">Dica</p><p className="qe-hint-text">{q.hint}</p></div>
          </div>
        )}

        {q.type === "drag-drop" && <DragDropQuestion question={q} onAnswer={handleInteractiveAnswer} disabled={!isAnswering} />}
        {q.type === "matching"  && <MatchingQuestion  question={q} onAnswer={handleInteractiveAnswer} disabled={!isAnswering} />}

        {q.type === "multiple" && (
          <div className="qe-options-grid">
            {q.options.map((opt, i) => (
              <button key={i} className={`qe-option-btn${selected === opt ? " qe-option-btn--selected" : ""}`}
                style={optStyle(opt)} onClick={() => isAnswering && setSelected(opt)} disabled={!isAnswering}>
                {opt}
              </button>
            ))}
          </div>
        )}

        {q.type === "input" && (
          <input type="text"
            className={`qe-input${feedback === "correct" ? " qe-input--correct" : feedback === "wrong" ? " qe-input--wrong" : ""}`}
            placeholder="Digite sua resposta..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && isAnswering && confirm()}
            disabled={!isAnswering}
          />
        )}

        {isCorrect && (
          <>
            <div className="qe-feedback qe-feedback--correct">✅ Correto! Muito bem! <strong>+{currentXP} XP</strong></div>
            <button className="qe-btn-primary" style={{ background: unit.color }} onClick={handleNext}>
              {isLastQ ? "Finalizar módulo 🎉" : "Próxima questão →"}
            </button>
          </>
        )}

        {isWrong && (
          <>
            <div className="qe-feedback qe-feedback--wrong">❌ Resposta incorreta. O que deseja fazer?</div>
            <div className="qe-error-panel">
              <button className="qe-error-opt-btn" onClick={handleRetry}>
                <span className="qe-error-opt-icon">🔄</span>
                <div className="qe-error-opt-text">
                  <span className="qe-error-opt-title">Tentar novamente</span>
                  <span className="qe-error-opt-sub">Sem usar dica</span>
                </div>
              </button>
              <button className="qe-error-opt-btn qe-error-opt-btn--hint" onClick={handleUseHint} disabled={!canShowHint}>
                <span className="qe-error-opt-icon">💡</span>
                <div className="qe-error-opt-text">
                  <span className="qe-error-opt-title">Ver dica</span>
                  <span className="qe-error-opt-sub">
                    {canShowHint ? `−1 do contador (${hintsLeft} restante${hintsLeft !== 1 ? "s" : ""})` : showHint ? "Dica já utilizada" : "Sem dicas disponíveis"}
                  </span>
                </div>
              </button>
              <button className="qe-error-opt-btn qe-error-opt-btn--skip" onClick={handleSkip}>
                <span className="qe-error-opt-icon">⏭</span>
                <div className="qe-error-opt-text">
                  <span className="qe-error-opt-title qe-error-opt-title--danger">Pular questão</span>
                  <span className="qe-error-opt-sub">Registra como errada (0 XP)</span>
                </div>
              </button>
            </div>
          </>
        )}

        {isAnswering && !isInteractive && (
          <button className="qe-btn-primary" style={{ background: unit.color }}
            disabled={q.type === "multiple" ? !selected : !textAnswer.trim()} onClick={confirm}>
            Confirmar resposta
          </button>
        )}

      </div>
    </div>
  );
}
