import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  saveTeacherModule,
  logoutStudent,
  generateModuleCode,
} from "../../services/firebaseService";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import "./TeacherDashboard.css";

const EMPTY_QUESTION = () => ({
  type: "multiple",
  statement: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  answer: "",
});

// ── Sub-componente: formulário de uma questão ─────────────────────────────────

function QuestionForm({ index, q, onChange }) {
  const update = (field, value) => onChange(index, { ...q, [field]: value });

  const updateOption = (i, value) => {
    const opts = [...q.options];
    opts[i] = value;
    onChange(index, { ...q, options: opts });
  };

  return (
    <div className="td-question-card">
      <div className="td-question-header">
        <span className="td-question-num">Questão {index + 1}</span>
        <div className="td-type-toggle">
          <button
            type="button"
            className={`td-type-btn${q.type === "multiple" ? " td-type-btn--active" : ""}`}
            onClick={() => update("type", "multiple")}
          >
            Múltipla escolha
          </button>
          <button
            type="button"
            className={`td-type-btn${q.type === "input" ? " td-type-btn--active" : ""}`}
            onClick={() => update("type", "input")}
          >
            Dissertativa
          </button>
        </div>
      </div>

      <div className="td-field">
        <label>Enunciado</label>
        <textarea
          rows={3}
          placeholder="Digite o enunciado da questão..."
          value={q.statement}
          onChange={(e) => update("statement", e.target.value)}
        />
      </div>

      {q.type === "multiple" && (
        <div className="td-options-list">
          <label>Alternativas <span className="td-label-hint">(marque a correta)</span></label>
          {q.options.map((opt, i) => (
            <div key={i} className="td-option-row">
              <input
                type="radio"
                name={`correct-${index}`}
                checked={q.correctIndex === i}
                onChange={() => update("correctIndex", i)}
                className="td-radio"
              />
              <input
                type="text"
                placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className="td-option-input"
              />
            </div>
          ))}
        </div>
      )}

      {q.type === "input" && (
        <div className="td-field">
          <label>Resposta esperada</label>
          <input
            type="text"
            placeholder="Ex: 42 ou 3/4"
            value={q.answer}
            onChange={(e) => update("answer", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

// ── Main: TeacherDashboard ────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const { state, dispatch } = useApp();
  const navigate            = useNavigate();

  const [view, setView]           = useState("home"); // "home" | "create"
  const [moduleTitle, setTitle]   = useState("");
  const [questions, setQuestions] = useState(Array.from({ length: 5 }, EMPTY_QUESTION));
  const [saving, setSaving]       = useState(false);
  const [savedCode, setSavedCode] = useState(null);
  const [myModules, setMyModules] = useState([]);
  const [loadingMods, setLoadingMods] = useState(true);
  const [formError, setFormError] = useState("");

  const teacherUid  = state.user?.uid;
  const teacherName = state.user?.name || "Professor";

  // Carrega módulos já criados
  useEffect(() => {
    if (!teacherUid) return;
    (async () => {
      try {
        const snap = await getDocs(collection(db, "users", teacherUid, "modules"));
        const mods = [];
        snap.forEach((d) => mods.push({ id: d.id, ...d.data() }));
        mods.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setMyModules(mods);
      } catch (error) {
        console.error("Erro ao carregar módulos:", error);
        setFormError("Erro ao carregar módulos. Tente recarregar a página.");
      } finally {
        setLoadingMods(false);
      }
    })();
  }, [teacherUid, savedCode]);

  const updateQuestion = (index, updated) => {
    setQuestions((qs) => qs.map((q, i) => (i === index ? updated : q)));
    setFormError("");
  };

  // RF26 — Validação do template
  const validate = () => {
    if (!moduleTitle.trim()) return "Informe o título do módulo.";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.statement.trim()) return `Questão ${i + 1}: informe o enunciado.`;
      if (q.type === "multiple") {
        if (q.options.some((o) => !o.trim())) return `Questão ${i + 1}: preencha todas as alternativas.`;
      } else {
        if (!q.answer.trim()) return `Questão ${i + 1}: informe a resposta esperada.`;
      }
    }
    return null;
  };

  // RF25 + RNF07 — Salvar módulo com código único
  const handleSave = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }

    setSaving(true);
    try {
      // Normaliza questões para o formato do QuizEngine
      const normalizedQuestions = questions.map((q, i) => ({
        id:        `tq-${Date.now()}-${i}`,
        type:      q.type,
        statement: q.statement,
        ...(q.type === "multiple"
          ? { options: q.options, answer: q.options[q.correctIndex] }
          : { answer: q.answer }),
        xp: 10,
      }));

      const code = await saveTeacherModule({
        teacherUid,
        title: moduleTitle,
        questions: normalizedQuestions,
      });

      setSavedCode(code);
      setView("success");
    } catch (e) {
      console.error("Erro ao salvar módulo:", e);
      setFormError("Erro ao salvar. Verifique sua conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutStudent();
      dispatch({ type: "LOGOUT" });
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, faz logout local
      dispatch({ type: "LOGOUT" });
      navigate("/");
    }
  };

  const resetForm = () => {
    setTitle("");
    setQuestions(Array.from({ length: 5 }, EMPTY_QUESTION));
    setSavedCode(null);
    setFormError("");
    setView("create");
  };

  // ── TELA: sucesso ──────────────────────────────────────────────────────────
  if (view === "success") {
    return (
      <div className="td-wrapper">
        <div className="td-success-card">
          <div className="td-success-icon">🎉</div>
          <h2 className="td-success-title">Módulo criado com sucesso!</h2>
          <p className="td-success-sub">Compartilhe o código abaixo com seus alunos:</p>
          <div className="td-code-display">{savedCode}</div>
          <p className="td-success-hint">
            Os alunos inserem esse código no Dashboard deles para acessar seu módulo.
          </p>
          <div className="td-success-actions">
            <button className="td-btn-primary" onClick={resetForm}>Criar outro módulo</button>
            <button className="td-btn-ghost" onClick={() => setView("home")}>Ver meus módulos</button>
          </div>
        </div>
      </div>
    );
  }

  // ── TELA: formulário de criação ────────────────────────────────────────────
  if (view === "create") {
    return (
      <div className="td-wrapper">
        <div className="td-create-container">
          <div className="td-create-header">
            <button className="td-btn-ghost td-btn-ghost--sm" onClick={() => setView("home")}>
              ← Voltar
            </button>
            <h2 className="td-create-title">Novo módulo</h2>
          </div>

          <div className="td-field td-field--title">
            <label>Título do módulo</label>
            <input
              type="text"
              placeholder="Ex: Frações para o 6.º ano"
              value={moduleTitle}
              onChange={(e) => { setTitle(e.target.value); setFormError(""); }}
            />
          </div>

          <p className="td-create-hint">
            Preencha exatamente <strong>5 questões</strong>. Cada uma pode ser de múltipla escolha ou dissertativa.
          </p>

          {questions.map((q, i) => (
            <QuestionForm key={i} index={i} q={q} onChange={updateQuestion} />
          ))}

          {formError && <p className="td-form-error">⚠️ {formError}</p>}

          <button
            className="td-btn-primary td-btn-primary--full"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Salvando…" : "💾 Salvar módulo e gerar código"}
          </button>
        </div>
      </div>
    );
  }

  // ── TELA: home do professor ────────────────────────────────────────────────
  return (
    <div className="td-wrapper">
      <div className="td-home-container">

        {/* Header */}
        <div className="td-home-header">
          <div>
            <h1 className="td-home-title">Olá, {teacherName}! 👋</h1>
            <p className="td-home-sub">Painel do Professor — MathQuestion</p>
          </div>
          <button className="td-btn-ghost td-btn-ghost--sm" onClick={handleLogout}>
            Sair
          </button>
        </div>

        {/* CTA criar módulo */}
        <button className="td-create-cta" onClick={() => setView("create")}>
          <span className="td-create-cta-icon">＋</span>
          <div>
            <p className="td-create-cta-title">Criar novo módulo</p>
            <p className="td-create-cta-sub">5 questões · código único gerado automaticamente</p>
          </div>
        </button>

        {/* Meus módulos */}
        <h2 className="td-section-title">Meus módulos</h2>

        {loadingMods ? (
          <p className="td-loading">Carregando...</p>
        ) : myModules.length === 0 ? (
          <div className="td-empty">
            <p>Você ainda não criou nenhum módulo.</p>
            <p>Clique em "Criar novo módulo" para começar!</p>
          </div>
        ) : (
          <div className="td-modules-grid">
            {myModules.map((mod) => (
              <div key={mod.id} className="td-module-card">
                <div className="td-module-card-top">
                  <span className="td-module-title">{mod.title}</span>
                  <span className="td-module-count">{mod.questionCount} questões</span>
                </div>
                <div className="td-module-code-row">
                  <span className="td-module-code-label">Código:</span>
                  <span className="td-module-code">{mod.code}</span>
                  <button
                    className="td-copy-btn"
                    onClick={() => {
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(mod.code);
                      } else {
                        // Fallback para navegadores mais antigos
                        const textArea = document.createElement("textarea");
                        textArea.value = mod.code;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand("copy");
                        document.body.removeChild(textArea);
                      }
                    }}
                    title="Copiar código"
                  >
                    📋
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
