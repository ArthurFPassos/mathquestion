import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useApp } from "../context/AppContext";
import { UNITS } from "../data/units";
import { saveModuleResult } from "../firebase/firebaseService";
import Scratchpad from "./Scratchpad";
import ExitModal from "./ExitModal";
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
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`qe-dd-item${isDragging ? " qe-dd-item--dragging" : ""}${disabled ? " qe-dd-item--disabled" : ""}`}
    >
      {!disabled && <span className="qe-dd-handle">⠿</span>}
      <span>{label}</span>
    </div>
  );
}

// ── Drag & Drop Question ─────────────────────────────────────────────────────

function DragDropQuestion({ question, onAnswer, disabled }) {
  const [orderedItems, setOrderedItems] = useState(() => [...question.items]);

  useEffect(() => {
    setOrderedItems([...question.items]);
  }, [question.id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
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
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(question.answer);
    onAnswer(isCorrect);
  };

  return (
    <div className="qe-dd-wrapper">
      <p className="qe-dd-instruction">
        {disabled ? "Ordem final:" : "Arraste para reordenar:"}
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {orderedItems.map((item) => (
            <SortableItem key={item.id} id={item.id} label={item.label} disabled={disabled} />
          ))}
        </SortableContext>
      </DndContext>
      {!disabled && (
        <button className="qe-dd-confirm-btn" onClick={handleConfirm}>
          Confirmar ordem
        </button>
      )}
    </div>
  );
}

// ── Matching Question ─────────────────────────────────────────────────────────

function MatchingQuestion({ question, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null);       // { side: 'left'|'right', index }
  const [connections, setConnections] = useState({});   // { leftIndex: rightIndex }
  const [shuffledRight] = useState(() =>
    [...question.pairs.map((p, i) => ({ label: p.right, origIdx: i }))].sort(
      () => Math.random() - 0.5
    )
  );

  useEffect(() => {
    setSelected(null);
    setConnections({});
  }, [question.id]);

  const handleLeftClick = (idx) => {
    if (disabled) return;
    if (selected?.side === "right") {
      // connect left idx → right shuffledRight index
      const rightOrigIdx = shuffledRight[selected.index].origIdx;
      setConnections((c) => ({ ...c, [idx]: selected.index }));
      setSelected(null);
    } else {
      setSelected({ side: "left", index: idx });
    }
  };

  const handleRightClick = (idx) => {
    if (disabled) return;
    if (selected?.side === "left") {
      setConnections((c) => ({ ...c, [selected.index]: idx }));
      setSelected(null);
    } else {
      setSelected({ side: "right", index: idx });
    }
  };

  const allConnected = Object.keys(connections).length === question.pairs.length;

  const handleConfirm = () => {
    let correct = true;
    for (let leftIdx = 0; leftIdx < question.pairs.length; leftIdx++) {
      const rightShuffledIdx = connections[leftIdx];
      if (rightShuffledIdx === undefined) { correct = false; break; }
      const rightOrigIdx = shuffledRight[rightShuffledIdx].origIdx;
      if (rightOrigIdx !== leftIdx) { correct = false; break; }
    }
    onAnswer(correct);
  };

  const handleReset = () => {
    setConnections({});
    setSelected(null);
  };

  return (
    <div className="qe-match-wrapper">
      <p className="qe-dd-instruction">
        {disabled ? "Suas associações:" : "Clique em um item da esquerda e depois um da direita para ligar:"}
      </p>
      <div className="qe-match-grid">
        {/* Left column */}
        <div className="qe-match-col">
          {question.pairs.map((pair, idx) => {
            const isSelected = selected?.side === "left" && selected.index === idx;
            const isConnected = connections[idx] !== undefined;
            return (
              <div
                key={idx}
                className={`qe-match-item qe-match-item--left${isSelected ? " qe-match-item--selected" : ""}${isConnected ? " qe-match-item--connected" : ""}`}
                onClick={() => handleLeftClick(idx)}
              >
                {pair.left}
                {isConnected && <span className="qe-match-dot">●</span>}
              </div>
            );
          })}
        </div>

        {/* Lines / connector indicator */}
        <div className="qe-match-lines">
          {question.pairs.map((_, leftIdx) => {
            const rightIdx = connections[leftIdx];
            return (
              <div key={leftIdx} className="qe-match-line-slot">
                {rightIdx !== undefined && (
                  <div className="qe-match-line-badge">↔</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column */}
        <div className="qe-match-col">
          {shuffledRight.map((item, idx) => {
            const isSelected = selected?.side === "right" && selected.index === idx;
            const isConnected = Object.values(connections).includes(idx);
            return (
              <div
                key={idx}
                className={`qe-match-item qe-match-item--right${isSelected ? " qe-match-item--selected" : ""}${isConnected ? " qe-match-item--connected" : ""}`}
                onClick={() => handleRightClick(idx)}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>

      {!disabled && (
        <div className="qe-match-actions">
          <button className="qe-match-reset-btn" onClick={handleReset}>
            🔄 Limpar
          </button>
          <button
            className="qe-dd-confirm-btn"
            onClick={handleConfirm}
            disabled={!allConnected}
          >
            Confirmar associações
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main QuizEngine ───────────────────────────────────────────────────────────

export default function QuizEngine() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const module = UNITS.flatMap((u) => u.modules).find(
    (m) => m.id === state.currentModule
  );
  const unit = UNITS.find((u) =>
    u.modules.some((m) => m.id === state.currentModule)
  );

  const [qIndex, setQIndex] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);   // null | 'correct' | 'wrong'
  const [showHint, setShowHint] = useState(false);
  const [scores, setScores] = useState([]);
  const [xpLog, setXpLog] = useState([]);
  const [startTime] = useState(Date.now());
  const [questionLog, setQuestionLog]         = useState([]);
  const [attemptCount, setAttemptCount]       = useState(0);
  const [moduleReport, setModuleReport]       = useState(null);

  if (!module || !unit) return null;

  const q = module.questions[qIndex];
  const isLastQ = qIndex === module.questions.length - 1;
  const hintsLeft = 3 - state.hintsUsedInBattery;
  const currentXP = showHint ? Math.floor(q.xp * 0.5) : q.xp;
  const progressPct = (qIndex / module.questions.length) * 100;
  const isAnswering = feedback === null;
  const isCorrect = feedback === "correct";
  const isWrong = feedback === "wrong";
  const canShowHint = isWrong && !showHint && hintsLeft > 0;

  const isInteractive = q.type === "drag-drop" || q.type === "matching";

  // ── Interactive question answer callback ──────────────────────────────────

  const handleInteractiveAnswer = (correct) => {
    setInteractiveAnswered(true);
    if (correct) {
      setScores((s) => [...s, 1]);
      setXpLog((x) => [...x, showHint ? Math.floor(q.xp * 0.5) : q.xp]);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }
  };

  // ── Multiple choice / input confirm ──────────────────────────────────────

  const confirm = () => {
    const ans = q.type === "multiple" ? selected : textAnswer.trim();
    if (!ans) return;
    if (ans === q.answer) {
      setScores((s) => [...s, 1]);
      setXpLog((x) => [...x, showHint ? Math.floor(q.xp * 0.5) : q.xp]);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }
  };

  const handleRetry = () => {
    setFeedback(null);
    setSelected(null);
    setTextAnswer("");
    setInteractiveAnswered(false);
  };

  const handleUseHint = () => {
    if (!canShowHint) return;
    dispatch({ type: "USE_HINT" });
    setShowHint(true);
    setFeedback(null);
    setSelected(null);
    setTextAnswer("");
    setInteractiveAnswered(false);
  };

  const handleSkip = () => {
    setScores((s) => [...s, 0]);
    setXpLog((x) => [...x, 0]);
    advanceOrFinish(false);
  };

  const handleNext = () => advanceOrFinish(true);

  const advanceOrFinish = (lastCorrect) => {
    if (isLastQ) {
      finishModule();
    } else {
      setQIndex((i) => i + 1);
      setTextAnswer("");
      setSelected(null);
      setFeedback(null);
      setShowHint(false);
      setInteractiveAnswered(false);
    }
  };

  const finishModule = () => {
    const totalCorrect = scores.reduce((a, b) => a + b, 0);
    const score = totalCorrect / module.questions.length;
    const result = {
      moduleId:  module.id,
      score,
      xp:        xpLog.reduce((a, b) => a + b, 0),
      timeMs:    Date.now() - startTime,
      completed: true,
      correct:   totalCorrect,
      total:     module.questions.length,
    };
    dispatch({ type: "COMPLETE_MODULE", payload: result });

    // Persiste no Firestore (silencioso)
    if (state.user?.uid) {
      saveModuleResult(state.user.uid, module.id, {
        score:     result.score,
        xp:        result.xp,
        correct:   result.correct,
        total:     result.total,
        timeMs:    result.timeMs,
        completed: true,
      }).catch(console.error);
    }
  };

  const handleExitConfirm = () => {
    dispatch({ type: "SET_SCREEN", payload: "dashboard" });
    navigate("/modulo-1");
  };

  const optStyle = (opt) => ({
    borderColor: selected === opt ? unit.color : "#e2e8f0",
    background: selected === opt ? unit.light : "#f8fafc",
    color: selected === opt ? unit.color : "#1e293b",
    fontWeight: selected === opt ? 700 : 400,
    opacity: !isAnswering && selected !== opt ? 0.55 : 1,
  });

  // ── Type label ────────────────────────────────────────────────────────────
  const typeLabel =
    q.type === "drag-drop"
      ? "🧩 Arrastar e Soltar"
      : q.type === "matching"
      ? "🔗 Associação"
      : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="qe-wrapper">
      {showExit && (
        <ExitModal onConfirm={handleExitConfirm} onCancel={() => setShowExit(false)} />
      )}
      {state.scratchpadOpen && <Scratchpad />}

      <div className={`qe-card${simplified ? " qe-card--simplified" : ""}`}>

        {/* Top bar */}
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
            <button
              className={`qe-btn-sm${simplified ? " qe-btn-sm--simplified-on" : ""}`}
              onClick={() => setSimplified((v) => !v)}
              aria-pressed={simplified}
              title="Modo Simplificado"
            >
              {simplified ? "🔤 ON" : "🔤"}
            </button>
            <button
              className="qe-btn-sm qe-btn-sm--exit"
              onClick={() => setShowExit(true)}
              aria-label="Sair do exercício"
            >✕</button>
          </div>
        </div>

        {/* Progress */}
        <div className="qe-progress-track">
          <div className="qe-progress-fill" style={{ width: `${progressPct}%`, background: unit.color }} />
        </div>
        <p className="qe-q-counter">
          Questão <strong>{qIndex + 1}</strong> de {module.questions.length}
          {!simplified && (
            <span className="qe-xp-pill" style={{ background: unit.light, color: unit.color }}>
              +{currentXP} XP
            </span>
          )}
        </p>

        {/* Type badge for interactive questions */}
        {typeLabel && (
          <div className="qe-type-badge" style={{ background: unit.light, color: unit.color }}>
            {typeLabel}
          </div>
        )}

        {/* Statement */}
        <div className="qe-question-box" style={{ borderColor: unit.color + "44" }}>
          <p className={`qe-statement${simplified ? " qe-statement--simplified" : ""}`}>
            {simplified && q.simplifiedText ? q.simplifiedText : q.statement}
          </p>
        </div>

        {/* Hint */}
        {showHint && (
          <div className="qe-hint-box">
            <span className="qe-hint-icon">💡</span>
            <div>
              <p className="qe-hint-label">Dica</p>
              <p className="qe-hint-text">{q.hint}</p>
            </div>
          </div>
        )}

        {/* ── Answer input by type ── */}
        {q.type === "drag-drop" && (
          <DragDropQuestion
            question={q}
            onAnswer={handleInteractiveAnswer}
            disabled={!isAnswering}
          />
        )}

        {q.type === "matching" && (
          <MatchingQuestion
            question={q}
            onAnswer={handleInteractiveAnswer}
            disabled={!isAnswering}
          />
        )}

        {q.type === "multiple" && (
          <div className="qe-options-grid">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`qe-option-btn${selected === opt ? " qe-option-btn--selected" : ""}`}
                style={optStyle(opt)}
                onClick={() => isAnswering && setSelected(opt)}
                disabled={!isAnswering}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {q.type === "input" && (
          <input
            type="text"
            className={`qe-input${
              feedback === "correct" ? " qe-input--correct"
              : feedback === "wrong" ? " qe-input--wrong" : ""
            }`}
            placeholder="Digite sua resposta..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && isAnswering && confirm()}
            disabled={!isAnswering}
          />
        )}

        {/* ── Correct ── */}
        {isCorrect && (
          <>
            <div className="qe-feedback qe-feedback--correct">
              ✅ Correto! Muito bem! <strong>+{currentXP} XP</strong>
            </div>
            <button
              className="qe-btn-primary"
              style={{ background: unit.color }}
              onClick={handleNext}
            >
              {isLastQ ? "Finalizar módulo 🎉" : "Próxima questão →"}
            </button>
          </>
        )}

        {/* ── Wrong: 3-option panel ── */}
        {isWrong && (
          <>
            <div className="qe-feedback qe-feedback--wrong">
              ❌ Resposta incorreta. O que deseja fazer?
            </div>
            <div className="qe-error-panel">
              <button className="qe-error-opt-btn" onClick={handleRetry}>
                <span className="qe-error-opt-icon">🔄</span>
                <div className="qe-error-opt-text">
                  <span className="qe-error-opt-title">Tentar novamente</span>
                  <span className="qe-error-opt-sub">Sem usar dica</span>
                </div>
              </button>

              <button
                className="qe-error-opt-btn qe-error-opt-btn--hint"
                onClick={handleUseHint}
                disabled={!canShowHint}
              >
                <span className="qe-error-opt-icon">💡</span>
                <div className="qe-error-opt-text">
                  <span className="qe-error-opt-title">Ver dica</span>
                  <span className="qe-error-opt-sub">
                    {canShowHint
                      ? `−1 do contador (${hintsLeft} restante${hintsLeft !== 1 ? "s" : ""})`
                      : showHint ? "Dica já utilizada" : "Sem dicas disponíveis"}
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

        {/* ── Answering: confirm button (only for multiple/input) ── */}
        {isAnswering && !isInteractive && (
          <button
            className="qe-btn-primary"
            style={{ background: unit.color }}
            disabled={q.type === "multiple" ? !selected : !textAnswer.trim()}
            onClick={confirm}
          >
            Confirmar resposta
          </button>
        )}

      </div>
    </div>
  );
}
