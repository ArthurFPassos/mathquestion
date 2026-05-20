import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  saveTeacherModule,
  updateTeacherModule,
  deleteTeacherModule,
  logoutStudent,
  getStudentAttemptsForModule,
} from "../../services/firebaseService";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import "./TeacherDashboard.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_QUESTION = () => ({
  type: "multiple",
  statement: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  answer: "",
  hint: "",
});

// ─── Icons ────────────────────────────────────────────────────────────────────

function TrashIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}
function EditIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function LightbulbIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </svg>
  );
}
function UsersIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function BookIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}
function ArrowLeftIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
function EyeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function CopyIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

// ─── QuestionForm ─────────────────────────────────────────────────────────────

function QuestionForm({ index, q, onChange, onRemove, total }) {
  const update = (field, value) => onChange(index, { ...q, [field]: value });
  const updateOption = (i, value) => {
    const opts = [...q.options];
    opts[i] = value;
    onChange(index, { ...q, options: opts });
  };

  return (
    <div className="td-question-card">
      <div className="td-question-header">
        <div className="td-question-num-badge"><span>{index + 1}</span></div>
        <div className="td-type-toggle">
          <button type="button" className={`td-type-btn${q.type === "multiple" ? " td-type-btn--active" : ""}`} onClick={() => update("type", "multiple")}>Múltipla escolha</button>
          <button type="button" className={`td-type-btn${q.type === "input" ? " td-type-btn--active" : ""}`} onClick={() => update("type", "input")}>Dissertativa</button>
        </div>
        {total > 1 && (
          <button className="td-remove-q-btn" onClick={() => onRemove(index)} title="Remover questão"><TrashIcon size={14} /></button>
        )}
      </div>

      <div className="td-field">
        <label>Enunciado</label>
        <textarea rows={3} placeholder="Digite o enunciado da questão..." value={q.statement} onChange={(e) => update("statement", e.target.value)} />
      </div>

      {q.type === "multiple" && (
        <div className="td-options-list">
          <label>Alternativas <span className="td-label-hint">(marque a correta)</span></label>
          {q.options.map((opt, i) => (
            <div key={i} className="td-option-row">
              <input type="radio" name={`correct-${index}`} checked={q.correctIndex === i} onChange={() => update("correctIndex", i)} className="td-radio" />
              <input type="text" placeholder={`Alternativa ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} className="td-option-input" />
            </div>
          ))}
        </div>
      )}

      {q.type === "input" && (
        <div className="td-field">
          <label>Resposta esperada</label>
          <input type="text" placeholder="Ex: 42 ou 3/4" value={q.answer} onChange={(e) => update("answer", e.target.value)} />
        </div>
      )}

      <div className="td-field td-hint-field">
        <label><LightbulbIcon size={13} /> Dica da Questão <span className="td-label-hint">(exibida ao aluno na 2ª tentativa)</span></label>
        <textarea rows={2} placeholder="Ex: Pense no conceito de frações equivalentes..." value={q.hint} onChange={(e) => update("hint", e.target.value)} className="td-hint-textarea" />
      </div>
    </div>
  );
}

// ─── ModuleForm ───────────────────────────────────────────────────────────────

function ModuleForm({ editingModule, onSaved, onCancel, teacherUid }) {
  const isEdit = !!editingModule;
  const [moduleTitle, setTitle] = useState(editingModule?.title || "");
  const [questions, setQuestions] = useState(() => {
    if (editingModule?.questions) {
      return editingModule.questions.map((q) => ({
        id: q.id,
        type: q.type,
        statement: q.statement,
        options: q.options || ["", "", "", ""],
        correctIndex: q.options ? q.options.indexOf(q.answer) : 0,
        answer: q.answer || "",
        hint: q.hint || "",
      }));
    }
    return Array.from({ length: 5 }, EMPTY_QUESTION);
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const updateQuestion = (index, updated) => { setQuestions((qs) => qs.map((q, i) => (i === index ? updated : q))); setFormError(""); };
  const addQuestion = () => setQuestions((qs) => [...qs, EMPTY_QUESTION()]);
  const removeQuestion = (index) => setQuestions((qs) => qs.filter((_, i) => i !== index));

  const validate = () => {
    if (!moduleTitle.trim()) return "Informe o título do módulo.";
    if (questions.length < 1) return "Adicione ao menos 1 questão.";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.statement.trim()) return `Questão ${i + 1}: informe o enunciado.`;
      if (q.type === "multiple") { if (q.options.some((o) => !o.trim())) return `Questão ${i + 1}: preencha todas as alternativas.`; }
      else { if (!q.answer.trim()) return `Questão ${i + 1}: informe a resposta esperada.`; }
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setSaving(true);
    try {
      const normalizedQuestions = questions.map((q, i) => ({
        id: q.id || `tq-${Date.now()}-${i}`,
        type: q.type,
        statement: q.statement,
        hint: q.hint || "",
        ...(q.type === "multiple" ? { options: q.options, answer: q.options[q.correctIndex] } : { answer: q.answer }),
        xp: 10,
      }));
      if (isEdit) {
        await updateTeacherModule({ teacherUid, moduleCode: editingModule.code, title: moduleTitle, questions: normalizedQuestions });
        onSaved(editingModule.code, moduleTitle, normalizedQuestions);
      } else {
        const code = await saveTeacherModule({ teacherUid, title: moduleTitle, questions: normalizedQuestions });
        onSaved(code);
      }
    } catch (e) {
      console.error(e);
      setFormError("Erro ao salvar. Verifique sua conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="td-create-container">
      <div className="td-create-header">
        <button className="td-btn-ghost td-btn-ghost--sm td-btn-icon" onClick={onCancel}><ArrowLeftIcon size={14} /> Voltar</button>
        <h2 className="td-create-title">{isEdit ? "Editar módulo" : "Novo módulo"}</h2>
      </div>
      <div className="td-field td-field--title">
        <label>Título do módulo</label>
        <input type="text" placeholder="Ex: Frações para o 6.º ano" value={moduleTitle} onChange={(e) => { setTitle(e.target.value); setFormError(""); }} />
      </div>
      <p className="td-create-hint">Cada questão deve ter uma <strong>dica</strong> que será exibida ao aluno na 2ª tentativa.</p>
      {questions.map((q, i) => (
        <QuestionForm key={i} index={i} q={q} onChange={updateQuestion} onRemove={removeQuestion} total={questions.length} />
      ))}
      <button className="td-add-question-btn" onClick={addQuestion}>+ Adicionar questão</button>
      {formError && <p className="td-form-error">⚠️ {formError}</p>}
      <button className="td-btn-primary td-btn-primary--full" onClick={handleSave} disabled={saving}>
        {saving ? "Salvando…" : isEdit ? "💾 Salvar alterações" : "💾 Salvar módulo e gerar código"}
      </button>
    </div>
  );
}

// ─── StudentAnalytics ─────────────────────────────────────────────────────────

function StudentAnalytics({ attempt, onBack }) {
  const { studentName, moduleName, answers = [] } = attempt;
  const totalCorrect = answers.filter((a) => a.correct).length;
  const totalWrong = answers.length - totalCorrect;
  const usedHint = answers.some((a) => a.usedHint);
  const usedScratchpad = answers.some((a) => a.scratchpadImage);
  const score = answers.length ? Math.round((totalCorrect / answers.length) * 100) : 0;

  return (
    <div className="td-analytics-container">
      <button className="td-btn-ghost td-btn-ghost--sm td-btn-icon" onClick={onBack}><ArrowLeftIcon size={14} /> Voltar</button>
      <div className="td-analytics-header">
        <div className="td-analytics-avatar">{studentName?.charAt(0) || "?"}</div>
        <div>
          <h2 className="td-analytics-name">{studentName}</h2>
          <p className="td-analytics-mod">Módulo: <strong>{moduleName}</strong></p>
        </div>
        <div className={`td-score-badge${score >= 70 ? " td-score-badge--good" : score >= 40 ? " td-score-badge--mid" : " td-score-badge--low"}`}>{score}%</div>
      </div>

      <div className="td-stats-row">
        <div className="td-stat-card td-stat-card--green"><span className="td-stat-num">{totalCorrect}</span><span className="td-stat-label">Acertos</span></div>
        <div className="td-stat-card td-stat-card--red"><span className="td-stat-num">{totalWrong}</span><span className="td-stat-label">Erros</span></div>
        <div className="td-stat-card"><span className="td-stat-num">{answers.length}</span><span className="td-stat-label">Questões</span></div>
        <div className={`td-stat-card${usedHint ? " td-stat-card--blue" : ""}`}><span className="td-stat-num">{usedHint ? "Sim" : "Não"}</span><span className="td-stat-label">Usou dica</span></div>
        <div className={`td-stat-card${usedScratchpad ? " td-stat-card--blue" : ""}`}><span className="td-stat-num">{usedScratchpad ? "Sim" : "Não"}</span><span className="td-stat-label">Rascunho</span></div>
      </div>

      <h3 className="td-section-title" style={{ marginTop: "28px" }}>Questão a questão</h3>
      <div className="td-question-results">
        {answers.map((a, i) => (
          <div key={i} className={`td-q-result-card${a.correct ? " td-q-result-card--correct" : " td-q-result-card--wrong"}`}>
            <div className="td-q-result-top">
              <span className="td-q-result-num">Q{i + 1}</span>
              <span className={`td-q-result-badge${a.correct ? " td-q-result-badge--correct" : " td-q-result-badge--wrong"}`}>{a.correct ? "✓ Acerto" : "✗ Erro"}</span>
              <span className="td-q-result-attempts">{a.attempts || 1} tentativa{(a.attempts || 1) !== 1 ? "s" : ""}</span>
              {a.usedHint && <span className="td-q-result-hint-badge"><LightbulbIcon size={11} /> Dica usada</span>}
            </div>
            <p className="td-q-result-statement">{a.statement || `Questão ${i + 1}`}</p>
            <div className="td-q-result-answers">
              {a.studentAnswer && <span className="td-q-answer">Resposta: <strong>{a.studentAnswer}</strong></span>}
              {!a.correct && a.correctAnswer && <span className="td-q-correct-answer">Correta: <strong>{a.correctAnswer}</strong></span>}
            </div>
            {a.scratchpadImage && (
              <div className="td-scratchpad-section">
                <p className="td-scratchpad-label">✏️ Rascunho do aluno:</p>
                <img src={a.scratchpadImage} alt={`Rascunho Q${i + 1}`} className="td-scratchpad-img" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── StudentMonitor ───────────────────────────────────────────────────────────

function StudentMonitor({ myModules }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const loadStudents = async (mod) => {
    setSelectedModule(mod);
    setLoadingStudents(true);
    setStudents([]);
    setSelectedAttempt(null);
    try {
      const attempts = await getStudentAttemptsForModule(mod.code);
      setStudents(attempts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
    }
  };

  if (selectedAttempt) {
    return <StudentAnalytics attempt={selectedAttempt} onBack={() => setSelectedAttempt(null)} />;
  }

  return (
    <div className="td-monitor-container">
      <h2 className="td-main-title">Desempenho dos Alunos</h2>
      <p className="td-main-sub">Selecione um módulo para ver o progresso dos alunos.</p>

      {myModules.length === 0 ? (
        <div className="td-empty-state"><div className="td-empty-icon">👥</div><p className="td-empty-title">Nenhum módulo criado</p><p className="td-empty-sub">Crie módulos para monitorar o desempenho dos alunos.</p></div>
      ) : (
        <>
          <div className="td-monitor-module-list">
            {myModules.map((mod) => (
              <button key={mod.id} className={`td-monitor-mod-btn${selectedModule?.code === mod.code ? " td-monitor-mod-btn--active" : ""}`} onClick={() => loadStudents(mod)}>
                <BookIcon size={14} />
                <span>{mod.title}</span>
                <span className="td-monitor-mod-code">{mod.code}</span>
              </button>
            ))}
          </div>

          {selectedModule && (
            <div className="td-students-section">
              <h3 className="td-section-title">Alunos — {selectedModule.title}</h3>
              {loadingStudents ? (
                <p className="td-loading">Carregando alunos...</p>
              ) : students.length === 0 ? (
                <div className="td-empty"><p>Nenhum aluno realizou este módulo ainda.</p></div>
              ) : (
                <div className="td-students-list">
                  {students.map((s, i) => {
                    const score = s.answers?.length ? Math.round((s.answers.filter((a) => a.correct).length / s.answers.length) * 100) : 0;
                    return (
                      <div key={i} className="td-student-row">
                        <div className="td-student-avatar">{s.studentName?.charAt(0) || "?"}</div>
                        <div className="td-student-info">
                          <span className="td-student-name">{s.studentName || "Aluno sem nome"}</span>
                          <span className="td-student-sub">{s.answers?.length || 0} questões • {s.answers?.filter((a) => a.correct).length || 0} acertos</span>
                        </div>
                        <div className={`td-student-score${score >= 70 ? " td-student-score--good" : score >= 40 ? " td-student-score--mid" : " td-student-score--low"}`}>{score}%</div>
                        <button className="td-btn-ghost td-btn-ghost--sm td-btn-icon" onClick={() => setSelectedAttempt({ ...s, moduleName: selectedModule.title })}>
                          <EyeIcon size={13} /> Ver detalhes
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main: TeacherDashboard ───────────────────────────────────────────────────

export default function TeacherDashboard() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [view, setView] = useState("home");
  const [activeTab, setActiveTab] = useState("modules");
  const [myModules, setMyModules] = useState([]);
  const [loadingMods, setLoadingMods] = useState(true);
  const [savedCode, setSavedCode] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [deletingCode, setDeletingCode] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [actionError, setActionError] = useState("");

  const teacherUid = state.user?.uid;
  const teacherName = state.user?.name || "Professor";

  const loadModules = useCallback(async () => {
    if (!teacherUid) return;
    setLoadingMods(true);
    try {
      const snap = await getDocs(collection(db, "users", teacherUid, "modules"));
      const mods = [];
      snap.forEach((d) => mods.push({ id: d.id, ...d.data() }));
      mods.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMyModules(mods);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMods(false);
    }
  }, [teacherUid]);

  useEffect(() => { loadModules(); }, [loadModules]);

  const handleLogout = async () => {
    try { await logoutStudent(); } catch (_) {}
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const handleSaved = (code, title, questions) => {
    if (editingModule) {
      setMyModules((prev) => prev.map((m) => m.code === editingModule.code ? { ...m, title, questionCount: questions.length } : m));
      setEditingModule(null);
      setView("home");
    } else {
      setSavedCode(code);
      setView("success");
      loadModules();
    }
  };

  const handleEdit = async (mod) => {
    try {
      const snap = await getDoc(doc(db, "modules", mod.code));
      setEditingModule(snap.exists() ? { ...mod, questions: snap.data().questions } : mod);
    } catch { setEditingModule(mod); }
    setView("edit");
  };

  const handleDeleteClick = (code) => { setDeletingCode(code); setDeleteConfirm(true); setActionError(""); };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTeacherModule({ teacherUid, moduleCode: deletingCode });
      setMyModules((prev) => prev.filter((m) => m.code !== deletingCode));
    } catch (e) {
      console.error(e);
      setActionError("Erro ao excluir o módulo. Tente novamente.");
    } finally {
      setDeleteConfirm(false);
      setDeletingCode(null);
    }
  };

  const handleCopy = (code) => {
    try { navigator.clipboard.writeText(code); } catch {
      const ta = document.createElement("textarea");
      ta.value = code; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopyFeedback(code);
    setTimeout(() => setCopyFeedback(null), 1800);
  };

  // ── Views ──────────────────────────────────────────────────────────────────

  if (view === "success") {
    return (
      <div className="td-wrapper">
        <div className="td-success-card">
          <div className="td-success-icon">🎉</div>
          <h2 className="td-success-title">Módulo criado com sucesso!</h2>
          <p className="td-success-sub">Compartilhe o código abaixo com seus alunos:</p>
          <div className="td-code-display">{savedCode}</div>
          <p className="td-success-hint">Os alunos inserem esse código no Dashboard deles para acessar seu módulo.</p>
          <div className="td-success-actions">
            <button className="td-btn-primary" onClick={() => { setView("home"); setActiveTab("modules"); }}>Criar outro módulo</button>
            <button className="td-btn-ghost" onClick={() => { setView("home"); setActiveTab("modules"); }}>Ver meus módulos</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "create" || view === "edit") {
    return (
      <div className="td-wrapper">
        <ModuleForm editingModule={view === "edit" ? editingModule : null} onSaved={handleSaved} onCancel={() => { setView("home"); setEditingModule(null); }} teacherUid={teacherUid} />
      </div>
    );
  }

  return (
    <div className="td-wrapper">
      <div className="td-dashboard">

        {/* Sidebar */}
        <aside className="td-sidebar">
          <div className="td-sidebar-brand">
            <div className="td-brand-icon">M</div>
            <span className="td-brand-name">MathQ</span>
          </div>
          <div className="td-sidebar-profile">
            <div className="td-profile-avatar">{teacherName.charAt(0)}</div>
            <div>
              <p className="td-profile-name">{teacherName}</p>
              <p className="td-profile-role">Professor</p>
            </div>
          </div>
          <nav className="td-sidebar-nav">
            <button className={`td-nav-item${activeTab === "modules" ? " td-nav-item--active" : ""}`} onClick={() => setActiveTab("modules")}>
              <BookIcon size={16} /> Meus Módulos
            </button>
            <button className={`td-nav-item${activeTab === "performance" ? " td-nav-item--active" : ""}`} onClick={() => setActiveTab("performance")}>
              <UsersIcon size={16} /> Desempenho dos Alunos
            </button>
          </nav>
          <button className="td-sidebar-logout" onClick={handleLogout}>Sair</button>
        </aside>

        {/* Main */}
        <main className="td-main">
          {activeTab === "modules" && (
            <div>
              <div className="td-main-header">
                <div>
                  <h1 className="td-main-title">Meus Módulos</h1>
                  <p className="td-main-sub">Gerencie e crie módulos de questões para seus alunos.</p>
                </div>
                <button className="td-btn-primary td-btn-icon" onClick={() => setView("create")}>+ Novo módulo</button>
              </div>

              {actionError && <p className="td-form-error">{actionError}</p>}

              {loadingMods ? (
                <p className="td-loading">Carregando módulos...</p>
              ) : myModules.length === 0 ? (
                <div className="td-empty-state">
                  <div className="td-empty-icon">📚</div>
                  <p className="td-empty-title">Nenhum módulo criado</p>
                  <p className="td-empty-sub">Clique em "Novo módulo" para começar.</p>
                  <button className="td-btn-primary" onClick={() => setView("create")}>+ Criar primeiro módulo</button>
                </div>
              ) : (
                <div className="td-modules-grid">
                  {myModules.map((mod) => (
                    <div key={mod.id} className="td-module-card">
                      <div className="td-module-card-main">
                        <div className="td-module-card-info">
                          <span className="td-module-title">{mod.title}</span>
                          <div className="td-module-meta">
                            <span className="td-module-count">{mod.questionCount} questões</span>
                            <span className="td-module-code-label">Código:</span>
                            <span className="td-module-code">{mod.code}</span>
                            <button className={`td-copy-btn${copyFeedback === mod.code ? " td-copy-btn--copied" : ""}`} onClick={() => handleCopy(mod.code)} title="Copiar código">
                              {copyFeedback === mod.code ? "✓" : <CopyIcon size={14} />}
                            </button>
                          </div>
                        </div>
                        <div className="td-module-actions">
                          <button className="td-action-btn td-action-btn--edit" onClick={() => handleEdit(mod)}><EditIcon size={14} /> Editar</button>
                          <button className="td-action-btn td-action-btn--delete" onClick={() => handleDeleteClick(mod.code)}><TrashIcon size={14} /> Excluir</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "performance" && <StudentMonitor myModules={myModules} />}
        </main>
      </div>

      {/* Modal de exclusão */}
      {deleteConfirm && (
        <div className="td-modal-overlay" onClick={() => setDeleteConfirm(false)}>
          <div className="td-modal" onClick={(e) => e.stopPropagation()}>
            <div className="td-modal-icon">🗑️</div>
            <h3 className="td-modal-title">Excluir módulo?</h3>
            <p className="td-modal-body">Esta ação é <strong>permanente</strong>. O módulo e todas as suas questões serão deletados do banco de dados.</p>
            <div className="td-modal-actions">
              <button className="td-btn-ghost" onClick={() => setDeleteConfirm(false)}>Cancelar</button>
              <button className="td-btn-danger" onClick={handleDeleteConfirm}><TrashIcon size={14} /> Sim, excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
