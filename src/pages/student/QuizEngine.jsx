import { useState, useRef, useCallback } from "react";
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
import { saveModuleResult, saveStudentAttempt } from "../../services/firebaseService";
import Scratchpad from "../../components/shared/Scratchpad";
import ExitModal from "../../components/shared/ExitModal";
import "./QuizEngine.css";

// ── Drag & Drop ───────────────────────────────────────────────────────────────

function SortableItem({ id, label, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform), transition,
    opacity: isDragging ? 0.5 : 1, cursor: disabled ? "default" : "grab",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`qe-dd-item${isDragging ? " qe-dd-item--dragging" : ""}${disabled ? " qe-dd-item--disabled" : ""}`}>
      {!disabled && <span className="qe-dd-handle">⠿</span>}
      <span>{label}</span>
    </div>
  );
}

function DragDropQuestion({ question, onAnswer, disabled }) {
  const [orderedItems, setOrderedItems] = useState(() => [...question.items]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setOrderedItems((items) => {
        const o = items.findIndex((i) => i.id === active.id);
        const n = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, o, n);
      });
    }
  };
  return (
    <div className="qe-dd-wrapper">
      <p className="qe-dd-instruction">{disabled ? "Ordem final:" : "Arraste para reordenar:"}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {orderedItems.map((item) => <SortableItem key={item.id} id={item.id} label={item.label} disabled={disabled} />)}
        </SortableContext>
      </DndContext>
      {!disabled && (
        <button className="qe-dd-confirm-btn" onClick={() =>
          onAnswer(JSON.stringify(orderedItems.map((i) => i.id)) === JSON.stringify(question.answer))
        }>Confirmar ordem</button>
      )}
    </div>
  );
}

function MatchingQuestion({ question, onAnswer, disabled }) {
  const [selected, setSelected]       = useState(null);
  const [connections, setConnections] = useState({});
  const [shuffledRight] = useState(() =>
    [...question.pairs.map((p, i) => ({ label: p.right, origIdx: i }))].sort(() => Math.random() - 0.5)
  );
  const handleLeft = (idx) => {
    if (disabled) return;
    if (selected?.side === "right") { setConnections((c) => ({ ...c, [idx]: selected.index })); setSelected(null); }
    else setSelected({ side: "left", index: idx });
  };
  const handleRight = (idx) => {
    if (disabled) return;
    if (selected?.side === "left") { setConnections((c) => ({ ...c, [selected.index]: idx })); setSelected(null); }
    else setSelected({ side: "right", index: idx });
  };
  const allConnected = Object.keys(connections).length === question.pairs.length;
  const handleConfirm = () => {
    let ok = true;
    for (let i = 0; i < question.pairs.length; i++) {
      const rIdx = connections[i];
      if (rIdx === undefined || shuffledRight[rIdx].origIdx !== i) { ok = false; break; }
    }
    onAnswer(ok);
  };
  return (
    <div className="qe-match-wrapper">
      <p className="qe-dd-instruction">{disabled ? "Suas associações:" : "Clique em um item da esquerda e depois um da direita:"}</p>
      <div className="qe-match-grid">
        <div className="qe-match-col">
          {question.pairs.map((pair, idx) => (
            <div key={idx}
              className={`qe-match-item qe-match-item--left${selected?.side === "left" && selected.index === idx ? " qe-match-item--selected" : ""}${connections[idx] !== undefined ? " qe-match-item--connected" : ""}`}
              onClick={() => handleLeft(idx)}>
              {pair.left}{connections[idx] !== undefined && <span className="qe-match-dot">●</span>}
            </div>
          ))}
        </div>
        <div className="qe-match-lines">
          {question.pairs.map((_, i) => (
            <div key={i} className="qe-match-line-slot">
              {connections[i] !== undefined && <div className="qe-match-line-badge">↔</div>}
            </div>
          ))}
        </div>
        <div className="qe-match-col">
          {shuffledRight.map((item, idx) => (
            <div key={idx}
              className={`qe-match-item qe-match-item--right${selected?.side === "right" && selected.index === idx ? " qe-match-item--selected" : ""}${Object.values(connections).includes(idx) ? " qe-match-item--connected" : ""}`}
              onClick={() => handleRight(idx)}>
              {item.label}
            </div>
          ))}
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

// ── RF22: PDF detalhado ────────────────────────────────────────────────────────

async function downloadModuleReportPDF(report) {
  const { default: jsPDF }     = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const PRIMARY = [99, 102, 241];
  const DARK    = [30, 41, 59];
  const GRAY    = [100, 116, 139];
  const GREEN   = [21, 128, 61];
  const RED     = [220, 38, 38];

  const pct     = Math.round(report.score * 100);
  const timeStr = (() => { const s = Math.round((report.timeMs || 0) / 1000); const m = Math.floor(s / 60); return m > 0 ? `${m}m ${s % 60}s` : `${s}s`; })();
  const dateStr = report.completedAt?.toLocaleString("pt-BR") || new Date().toLocaleString("pt-BR");

  // Cabeçalho
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text("MathQuestion", 14, 14);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text("Relatório por Módulo (RF22) — Tentativa mais recente", 14, 22);
  doc.setFontSize(8);
  doc.text(`Gerado em: ${dateStr}`, 14, 29);

  // Info
  let y = 44;
  doc.setTextColor(...DARK); doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text(report.moduleName, 14, y);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
  doc.text(`Unidade: ${report.unitName}`, 14, y + 6);
  doc.text(`Aluno: ${report.studentName}`, 14, y + 12);

  // Cards de resumo
  y += 22;
  const cards = [
    { label: "Resultado",   value: `${pct}%` },
    { label: "Acertos",     value: `${report.totalCorrect}/${report.total}` },
    { label: "XP ganho",    value: `${report.xpEarned} pts` },
    { label: "Tempo total", value: timeStr },
  ];
  const cw = (pageW - 28) / 4;
  cards.forEach((c, i) => {
    const cx = 14 + i * (cw + 2);
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(cx, y, cw, 20, 2, 2, "F");
    doc.setTextColor(...PRIMARY); doc.setFontSize(13); doc.setFont("helvetica", "bold");
    doc.text(c.value, cx + cw / 2, y + 9, { align: "center" });
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
    doc.text(c.label, cx + cw / 2, y + 16, { align: "center" });
  });

  // Tabela de questões
  y += 28;
  doc.setTextColor(...DARK); doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text("Detalhamento por questão", 14, y);

  const tableRows = report.questions.map((q, i) => [
    String(i + 1),
    q.statement.length > 75 ? q.statement.slice(0, 75) + "…" : q.statement,
    q.type === "multiple" ? "Múltipla" : q.type === "input" ? "Input" : q.type === "drag-drop" ? "Drag&Drop" : "Associação",
    q.skipped ? "⏭ Pulada" : q.correct ? "✓ Acerto" : "✗ Erro",
    String(q.attemptsCount || 1),
    q.hintUsed ? "Sim" : "Não",
    `${q.xpEarned || 0} XP`,
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [["Nº", "Enunciado", "Tipo", "Resultado", "Tentativas", "Dica", "XP"]],
    body: tableRows,
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: DARK },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8,  halign: "center" },
      1: { cellWidth: 70 },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 14, halign: "center" },
      6: { cellWidth: 14, halign: "center" },
    },
    margin: { left: 14, right: 14 },
    theme: "grid",
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 3) {
        if (data.cell.raw?.includes("✓"))      data.cell.styles.textColor = GREEN;
        else if (data.cell.raw?.includes("✗")) data.cell.styles.textColor = RED;
        else                                    data.cell.styles.textColor = GRAY;
      }
    },
  });

  // ── Seção de rascunhos ─────────────────────────────────────────────────────
  // Filtra apenas questões que têm imagem de rascunho válida
  const questionsWithScratchpad = (report.questions || []).filter(
    (q) => q.scratchpadImage && typeof q.scratchpadImage === "string" && q.scratchpadImage.startsWith("data:image")
  );

  if (questionsWithScratchpad.length > 0) {
    let curY = (doc.lastAutoTable?.finalY || 180) + 14;

    doc.setTextColor(...DARK); doc.setFontSize(10); doc.setFont("helvetica", "bold");
    if (curY + 20 > pageH - 20) { doc.addPage(); curY = 20; }
    doc.text("Rascunhos utilizados", 14, curY);
    curY += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, curY, pageW - 14, curY);
    curY += 8;

    for (const q of questionsWithScratchpad) {
      if (curY + 70 > pageH - 20) { doc.addPage(); curY = 20; }

      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...DARK);
      const label = `Questão ${q.index + 1}: ${q.statement.length > 80 ? q.statement.slice(0, 80) + "…" : q.statement}`;
      doc.text(label, 14, curY);
      curY += 5;

      try {
        // Calcula proporção real do canvas (560×280) para caber no A4
        const IMG_W = 130;
        const IMG_H = IMG_W * (280 / 560); // mantém aspecto 2:1 → 65mm
        doc.addImage(q.scratchpadImage, "PNG", 14, curY, IMG_W, IMG_H);
        curY += IMG_H + 6;
      } catch (err) {
        console.warn("Erro ao inserir rascunho no PDF:", err);
        doc.setFontSize(7); doc.setTextColor(...GRAY);
        doc.text("[Imagem do rascunho não disponível]", 14, curY);
        curY += 8;
      }
      curY += 4;
    }
  }

  // Rodapé
  const finalY = doc.lastAutoTable?.finalY ?? pageH - 20;
  if (questionsWithScratchpad.length === 0) {
    doc.setDrawColor(226, 232, 240);
    doc.line(14, finalY + 10, pageW - 14, finalY + 10);
    doc.setFontSize(7); doc.setTextColor(...GRAY);
    doc.text("MathQuestion — Relatório por módulo. Gerado automaticamente.", pageW / 2, finalY + 16, { align: "center" });
  }

  doc.save(`relatorio_modulo_${report.moduleName.replace(/\s+/g, "_")}.pdf`);
}

// ── Main QuizEngine ───────────────────────────────────────────────────────────

export default function QuizEngine() {
  const { state, dispatch } = useApp();
  const navigate            = useNavigate();

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
  const [moduleReport,        setModuleReport]        = useState(null);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const attemptsRef    = useRef(0);
  const showHintRef    = useRef(false);
  const questionLogRef = useRef([]);

  /**
   * FIX — O ref do Scratchpad precisa existir SEMPRE, independente de
   * state.scratchpadOpen, para que getSnapshot() funcione mesmo quando
   * o painel está fechado mas o aluno já desenhou algo.
   * O componente <Scratchpad> renderiza sempre (sem condicional), mas
   * a classe CSS controla se ele está visível ou não.
   */
  const scratchpadRef = useRef(null);

  const setShowHintSync = (val) => {
    showHintRef.current = val;
    setShowHint(val);
  };

  if (!module || !unit) return null;

  const q           = module.questions[qIndex];
  const isLastQ     = qIndex === module.questions.length - 1;
  const hintsLeft   = 3 - state.hintsUsedInBattery;
  const currentXP   = showHint ? Math.floor(q.xp * 0.5) : q.xp;
  const progressPct = (qIndex / module.questions.length) * 100;
  const isAnswering  = feedback === null;
  const isCorrect    = feedback === "correct";
  const isWrong      = feedback === "wrong";
  const canShowHint  = isWrong && !showHint && hintsLeft > 0;
  const isInteractive = q.type === "drag-drop" || q.type === "matching";

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleInteractiveAnswer = (correct) => {
    attemptsRef.current += 1;
    if (correct) { setScores((s) => [...s, 1]); setXpLog((x) => [...x, currentXP]); setFeedback("correct"); }
    else setFeedback("wrong");
  };

  const confirm = () => {
    const ans = q.type === "multiple" ? selected : textAnswer.trim();
    if (!ans) return;
    attemptsRef.current += 1;
    if (ans === q.answer) { setScores((s) => [...s, 1]); setXpLog((x) => [...x, currentXP]); setFeedback("correct"); }
    else setFeedback("wrong");
  };

  const handleRetry = () => {
    setFeedback(null); setSelected(null); setTextAnswer(""); setInteractiveAnswered(false);
  };

  const handleUseHint = () => {
    if (!canShowHint) return;
    dispatch({ type: "USE_HINT" });
    setShowHintSync(true);
    setFeedback(null); setSelected(null); setTextAnswer(""); setInteractiveAnswered(false);
  };

  /**
   * FIX — Captura o snapshot do rascunho ANTES de avançar a questão.
   *
   * scratchpadRef.current sempre existe (Scratchpad renderiza sempre).
   * Se o aluno não desenhou nada, getSnapshot() devolve null.
   * A imagem Base64 é guardada no log da questão e depois serializada
   * no Firestore (saveStudentAttempt) para o professor visualizar.
   */
  const logAndAdvance = (correct, skipped = false) => {
    // Captura snapshot do canvas AGORA, antes de trocar de questão
    let scratchpadImage = null;
    try {
      scratchpadImage = scratchpadRef.current?.getSnapshot() ?? null;
    } catch (err) {
      console.warn("Erro ao capturar rascunho:", err);
    }

    const entry = {
      index:          qIndex,
      questionId:     q.id,
      statement:      q.statement,
      type:           q.type,
      correct,
      skipped,
      attemptsCount:  attemptsRef.current,
      hintUsed:       showHintRef.current,
      xpEarned:       correct ? currentXP : 0,
      scratchpadImage,          // PNG Base64 ou null
    };

    questionLogRef.current = [...questionLogRef.current, entry];
    attemptsRef.current = 0;

    if (isLastQ) {
      finishModule();
    } else {
      setQIndex((i) => i + 1);
      setTextAnswer(""); setSelected(null); setFeedback(null);
      setShowHintSync(false); setInteractiveAnswered(false);
      // Limpa o canvas ao passar para a próxima questão (cada questão tem seu próprio rascunho)
      try { scratchpadRef.current?.clear(); } catch (_) {}
    }
  };

  const handleNext = () => logAndAdvance(true);
  const handleSkip = () => {
    setScores((s) => [...s, 0]);
    setXpLog((x) => [...x, 0]);
    logAndAdvance(false, true);
  };

  const finishModule = () => {
    const finalLog      = questionLogRef.current;
    const totalCorrect  = finalLog.filter((e) => e.correct).length;
    const total         = module.questions.length;
    const score         = totalCorrect / total;
    const totalTimeMs   = Date.now() - startTime;
    const totalXpEarned = finalLog.reduce((s, e) => s + (e.xpEarned || 0), 0);

    const result = {
      moduleId: module.id, score,
      xp: totalXpEarned, timeMs: totalTimeMs,
      completed: true, correct: totalCorrect, total,
    };

    dispatch({ type: "COMPLETE_MODULE", payload: result });

    const report = {
      moduleName:  module.title,
      unitName:    unit.title,
      studentName: state.user?.name || "Aluno",
      score, totalCorrect, total,
      xpEarned:    totalXpEarned,
      timeMs:      totalTimeMs,
      completedAt: new Date(),
      questions:   finalLog,
    };

    setModuleReport(report);

    if (!state.user?.uid) return;
    const uid = state.user.uid;

    // Salva progresso básico na subcoleção do aluno
    saveModuleResult(uid, module.id, {
      score: result.score, xp: result.xp,
      correct: result.correct, total: result.total,
      timeMs: result.timeMs, completed: true,
    }).catch(console.error);

    /**
     * FIX — Sincronização do Professor:
     *
     * Salva tentativa detalhada na coleção global "student_attempts"
     * com os campos obrigatórios: moduleCode, teacherUid, studentUid,
     * studentName, answers (com scratchpadImage por questão).
     *
     * O teacherUid é lido de module.teacherUid (campo salvo pelo
     * saveTeacherModule no Firestore). Se por algum motivo estiver
     * ausente, a tentativa ainda é salva e o professor pode encontrá-la
     * por moduleCode.
     *
     * O docId único "moduleCode_studentUid" garante que retentativas
     * sobrescrevem o documento anterior sem duplicar.
     */
    if (isExtraModule && module.code) {
      const answersPayload = finalLog.map((e) => ({
        index:          e.index,
        statement:      e.statement,
        type:           e.type,
        correct:        !!e.correct,
        skipped:        !!e.skipped,
        attempts:       e.attemptsCount,
        usedHint:       !!e.hintUsed,
        xpEarned:       e.xpEarned || 0,
        // FIX: inclui imagem do rascunho (Base64 PNG) se existir
        scratchpadImage: e.scratchpadImage || null,
        // Mantém compatibilidade com TeacherDashboard que usa "studentAnswer" e "correctAnswer"
        studentAnswer:  null,
        correctAnswer:  module.questions[e.index]?.answer || null,
      }));

      saveStudentAttempt({
        moduleCode:  module.code,
        teacherUid:  module.teacherUid || "",   // vem do documento modules/{code}
        studentUid:  uid,
        studentName: state.user.name || "Aluno",
        answers:     answersPayload,
        score,
        totalCorrect,
        total,
        timeMs: totalTimeMs,
      }).catch(console.error);
    }
  };

  const handleExitConfirm = () => {
    dispatch({ type: "SET_SCREEN", payload: "dashboard" });
    navigate("/dashboard");
  };

  const optStyle = (opt) => ({
    borderColor: selected === opt ? unit.color : "#e2e8f0",
    background:  selected === opt ? unit.light : "#f8fafc",
    color:       selected === opt ? unit.color : "#1e293b",
    fontWeight:  selected === opt ? 700 : 400,
    opacity:     !isAnswering && selected !== opt ? 0.55 : 1,
  });

  const typeLabel = q.type === "drag-drop" ? "🧩 Arrastar e Soltar" : q.type === "matching" ? "🔗 Associação" : null;

  // ── Tela de resultado ──────────────────────────────────────────────────────

  if (moduleReport) {
    const pct    = Math.round(moduleReport.score * 100);
    const passed = moduleReport.score >= 0.8;
    const withScratchpad = moduleReport.questions.filter(
      (q) => q.scratchpadImage && q.scratchpadImage.startsWith("data:image")
    ).length;

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

          {/* Detalhamento por questão */}
          <div className="qe-result-questions">
            {moduleReport.questions.map((q, i) => (
              <div key={i} className={`qe-result-q-row ${q.correct ? "qe-result-q-row--correct" : q.skipped ? "qe-result-q-row--skipped" : "qe-result-q-row--wrong"}`}>
                <span className="qe-result-q-icon">{q.skipped ? "⏭" : q.correct ? "✅" : "❌"}</span>
                <span className="qe-result-q-stmt">{q.statement.length > 55 ? q.statement.slice(0, 55) + "…" : q.statement}</span>
                <span className="qe-result-q-meta">
                  {q.attemptsCount} tent.{q.hintUsed ? " · 💡" : ""}
                  {q.scratchpadImage ? " · ✏️" : ""}
                </span>
              </div>
            ))}
          </div>

          {withScratchpad > 0 && (
            <p className="qe-result-scratchpad-note">
              ✏️ {withScratchpad} rascunho{withScratchpad > 1 ? "s" : ""} capturado{withScratchpad > 1 ? "s" : ""} e incluído{withScratchpad > 1 ? "s" : ""} no PDF
            </p>
          )}

          <div className="qe-result-actions">
            <button className="qe-result-pdf-btn" onClick={() => downloadModuleReportPDF(moduleReport)}>
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

      {/*
        FIX — Scratchpad renderiza SEMPRE (não condicional ao scratchpadOpen).
        A prop "visible" controla o CSS. Isso garante que scratchpadRef.current
        existe o tempo todo e getSnapshot() funciona mesmo com o painel fechado.
      */}
      <Scratchpad ref={scratchpadRef} visible={state.scratchpadOpen} />

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
            <button className={`qe-btn-sm${simplified ? " qe-btn-sm--simplified-on" : ""}`} onClick={() => setSimplified((v) => !v)}>
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
          {!simplified && <span className="qe-xp-pill" style={{ background: unit.light, color: unit.color }}>+{currentXP} XP</span>}
        </p>

        {typeLabel && <div className="qe-type-badge" style={{ background: unit.light, color: unit.color }}>{typeLabel}</div>}

        <div className="qe-question-box" style={{ borderColor: unit.color + "44" }}>
          <p className={`qe-statement${simplified ? " qe-statement--simplified" : ""}`}>
            {simplified && q.simplifiedText ? q.simplifiedText : q.statement}
          </p>
        </div>

        {showHint && q.hint && (
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
              <button key={i}
                className={`qe-option-btn${selected === opt ? " qe-option-btn--selected" : ""}`}
                style={optStyle(opt)}
                onClick={() => isAnswering && setSelected(opt)}
                disabled={!isAnswering}>
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
            disabled={q.type === "multiple" ? !selected : !textAnswer.trim()}
            onClick={confirm}>
            Confirmar resposta
          </button>
        )}

      </div>
    </div>
  );
}