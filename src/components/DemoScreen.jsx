import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { UNITS } from "../data/units";
import "./DemoScreen.css";

// ─── Pedagogical demo content per unit ───────────────────────────────────────
// Each unit has a series of didactic "slides" that walk through a worked
// example step by step (Merrill's First Principles of Instruction — RF02).

const UNIT_DEMOS = {
  1: {
    title: "Operações Básicas",
    intro: "Veja como resolver operações de adição e subtração passo a passo.",
    slides: [
      {
        step: 1,
        heading: "Armando a conta",
        visual: (
          <>
            <div className="ds-visual-box">
              <p className="ds-visual-line">  3 4 8</p>
              <p className="ds-visual-line">+ 2 7 5</p>
              <p className="ds-visual-divider">───────</p>
              <p className="ds-visual-line ds-visual-blank">   ?</p>
            </div>
            <p className="ds-slide-tip">
              Alinhamos os números pela direita: unidades com unidades, dezenas
              com dezenas, centenas com centenas.
            </p>
          </>
        ),
      },
      {
        step: 2,
        heading: "Somando as unidades",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-line">  3 4 <span className="ds-hl">8</span></p>
              <p className="ds-visual-line">+ 2 7 <span className="ds-hl">5</span></p>
              <p className="ds-visual-divider">───────</p>
              <p className="ds-visual-line ds-visual-result">        <span className="ds-hl">3</span></p>
            </div>
            <p className="ds-slide-tip">
              8 + 5 = <strong>13</strong>. Escreva o <strong>3</strong> e leve
              1 para as dezenas ("vai um" ↑).
            </p>
          </>
        ),
      },
      {
        step: 3,
        heading: "Somando as dezenas",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-line">  3 <span className="ds-hl">4</span> 8</p>
              <p className="ds-visual-line">+ 2 <span className="ds-hl">7</span> 5</p>
              <p className="ds-visual-divider">───────</p>
              <p className="ds-visual-line ds-visual-result">     <span className="ds-hl">2</span> 3</p>
            </div>
            <p className="ds-slide-tip">
              4 + 7 + 1 (vai um) = <strong>12</strong>. Escreva o{" "}
              <strong>2</strong> e leve 1 para as centenas.
            </p>
          </>
        ),
      },
      {
        step: 4,
        heading: "Somando as centenas",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-line">  <span className="ds-hl">3</span> 4 8</p>
              <p className="ds-visual-line">+ <span className="ds-hl">2</span> 7 5</p>
              <p className="ds-visual-divider">───────</p>
              <p className="ds-visual-line ds-visual-result ds-visual-final">
                <span className="ds-hl">6</span> 2 3
              </p>
            </div>
            <p className="ds-slide-tip">
              3 + 2 + 1 (vai um) = <strong>6</strong>.{" "}
              <strong>Resposta: 623 ✓</strong>
            </p>
          </>
        ),
      },
    ],
  },

  2: {
    title: "Potenciação",
    intro: "Aprenda como calcular potências multiplicando a base por ela mesma.",
    slides: [
      {
        step: 1,
        heading: "O que é uma potência?",
        visual: (
          <>
            <div className="ds-visual-box">
              <p className="ds-visual-formula">3<sup>4</sup></p>
              <div className="ds-annotation-row">
                <div className="ds-annotation">
                  <span className="ds-annotation-arrow">↑</span>
                  <span className="ds-annotation-label">Base</span>
                </div>
                <div style={{ width: 32 }} />
                <div className="ds-annotation">
                  <span className="ds-annotation-arrow">↑</span>
                  <span className="ds-annotation-label">Expoente</span>
                </div>
              </div>
            </div>
            <p className="ds-slide-tip">
              A <strong>base</strong> é o número que será multiplicado.
              O <strong>expoente</strong> diz quantas vezes multiplicamos.
            </p>
          </>
        ),
      },
      {
        step: 2,
        heading: "Expandindo a potência",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-formula" style={{ fontSize: 22 }}>
                3<sup>4</sup> = 3 × 3 × 3 × 3
              </p>
            </div>
            <p className="ds-slide-tip">
              Multiplicamos 3 por ele mesmo <strong>4 vezes</strong>{" "}
              (porque o expoente é 4).
            </p>
          </>
        ),
      },
      {
        step: 3,
        heading: "Calculando passo a passo",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-line">3 × 3 = <span className="ds-hl">9</span></p>
              <p className="ds-visual-line">9 × 3 = <span className="ds-hl">27</span></p>
              <p className="ds-visual-line">27 × 3 = <span className="ds-hl">81</span></p>
            </div>
            <p className="ds-slide-tip">
              Multiplique um par de cada vez. O resultado final é{" "}
              <strong>81</strong>.
            </p>
          </>
        ),
      },
      {
        step: 4,
        heading: "Resultado e regra especial",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-final" style={{ fontSize: 26, marginBottom: 12 }}>
                3<sup>4</sup> = 81 ✓
              </p>
              <p className="ds-visual-line" style={{ fontSize: 14, color: "#7c3aed" }}>
                ⚡ Regra: qualquer número<sup>0</sup> = 1
              </p>
              <p className="ds-visual-line" style={{ fontSize: 14, color: "#7c3aed" }}>
                Ex: 99⁰ = 1
              </p>
            </div>
            <p className="ds-slide-tip">
              Memorize a regra do expoente zero — ela aparece bastante!
            </p>
          </>
        ),
      },
    ],
  },

  3: {
    title: "Expressões e Ordem das Operações",
    intro: "Veja como resolver expressões com múltiplos operadores na ordem certa.",
    slides: [
      {
        step: 1,
        heading: "A ordem correta",
        visual: (
          <>
            <div className="ds-visual-box">
              <p className="ds-visual-formula" style={{ fontSize: 20 }}>
                4² + 3 × 5 − 2
              </p>
            </div>
            <p className="ds-slide-tip">
              A ordem é: <strong>1º Parênteses</strong> →{" "}
              <strong>2º Potências</strong> → <strong>3º × e ÷</strong> →
              <strong> 4º + e −</strong>
            </p>
          </>
        ),
      },
      {
        step: 2,
        heading: "Passo 1 — Potência primeiro",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-line">
                <span className="ds-hl">4²</span> + 3 × 5 − 2
              </p>
              <p className="ds-visual-arrow">↓</p>
              <p className="ds-visual-line">
                <span className="ds-hl">16</span> + 3 × 5 − 2
              </p>
            </div>
            <p className="ds-slide-tip">
              4² = 4 × 4 = <strong>16</strong>. Substituímos na expressão.
            </p>
          </>
        ),
      },
      {
        step: 3,
        heading: "Passo 2 — Multiplicação",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-line">
                16 + <span className="ds-hl">3 × 5</span> − 2
              </p>
              <p className="ds-visual-arrow">↓</p>
              <p className="ds-visual-line">
                16 + <span className="ds-hl">15</span> − 2
              </p>
            </div>
            <p className="ds-slide-tip">
              3 × 5 = <strong>15</strong>. Depois resolvemos a multiplicação.
            </p>
          </>
        ),
      },
      {
        step: 4,
        heading: "Passo 3 — Adição e subtração",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-line">16 + 15 − 2</p>
              <p className="ds-visual-arrow">↓</p>
              <p className="ds-visual-line">31 − 2</p>
              <p className="ds-visual-arrow">↓</p>
              <p className="ds-visual-final">29 ✓</p>
            </div>
            <p className="ds-slide-tip">
              Da esquerda para a direita: 16 + 15 = 31; 31 − 2 ={" "}
              <strong>29</strong>.
            </p>
          </>
        ),
      },
    ],
  },

  4: {
    title: "Frações",
    intro: "Aprenda a somar e subtrair frações com e sem o mesmo denominador.",
    slides: [
      {
        step: 1,
        heading: "O que é uma fração?",
        visual: (
          <>
            <div className="ds-visual-box">
              <p className="ds-visual-formula">
                <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <span className="ds-hl" style={{ fontSize: 28, borderBottom: "3px solid #ec4899", paddingBottom: 4 }}>3</span>
                  <span style={{ fontSize: 24 }}>8</span>
                </span>
              </p>
              <div className="ds-annotation-row" style={{ justifyContent: "center", gap: 32 }}>
                <div className="ds-annotation">
                  <span className="ds-annotation-arrow">↑</span>
                  <span className="ds-annotation-label">Numerador<br/><small>(partes que temos)</small></span>
                </div>
                <div className="ds-annotation">
                  <span className="ds-annotation-arrow">↑</span>
                  <span className="ds-annotation-label">Denominador<br/><small>(total de partes)</small></span>
                </div>
              </div>
            </div>
            <p className="ds-slide-tip">
              3/8 significa: dividimos algo em <strong>8 partes</strong> iguais
              e tomamos <strong>3</strong> delas.
            </p>
          </>
        ),
      },
      {
        step: 2,
        heading: "Soma com mesmo denominador",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-formula" style={{ fontSize: 22 }}>
                2/8 + 3/8
              </p>
              <p className="ds-visual-arrow">↓ mesmo denominador!</p>
              <p className="ds-visual-formula" style={{ fontSize: 20 }}>
                (2 + 3) / 8 = <span className="ds-hl">5/8</span>
              </p>
            </div>
            <p className="ds-slide-tip">
              Quando o denominador é igual, <strong>some só os numeradores</strong>{" "}
              e mantenha o denominador.
            </p>
          </>
        ),
      },
      {
        step: 3,
        heading: "Soma com denominadores diferentes",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-formula" style={{ fontSize: 20 }}>
                1/3 + 1/6
              </p>
              <p className="ds-visual-arrow">↓ MMC(3, 6) = 6</p>
              <p className="ds-visual-line">1/3 = 2/6</p>
              <p className="ds-visual-formula" style={{ fontSize: 20 }}>
                2/6 + 1/6 = <span className="ds-hl">3/6</span>
              </p>
            </div>
            <p className="ds-slide-tip">
              Encontre o <strong>MMC</strong> dos denominadores, converta as
              frações e depois some os numeradores.
            </p>
          </>
        ),
      },
      {
        step: 4,
        heading: "Simplificando o resultado",
        visual: (
          <>
            <div className="ds-visual-box ds-visual-box--highlight">
              <p className="ds-visual-line">3/6 ÷ 3/3</p>
              <p className="ds-visual-arrow">↓ dividimos tudo por 3</p>
              <p className="ds-visual-final">= 1/2 ✓</p>
            </div>
            <p className="ds-slide-tip">
              Quando possível, <strong>simplifique</strong> dividindo numerador
              e denominador pelo mesmo número.
            </p>
          </>
        ),
      },
    ],
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DemoScreen() {
  const { state, dispatch } = useApp();
  const navigate            = useNavigate();
  const [step, setStep]     = useState(0);

  // Resolve unit from currentModule
  const unit = UNITS.find((u) =>
    u.modules.some((m) => m.id === state.currentModule)
  );

  const demo   = unit ? UNIT_DEMOS[unit.id] : null;
  const slides = demo?.slides ?? [];
  const isLast = step === slides.length - 1;

  // Fallback if no demo content mapped
  if (!unit || !demo) {
    dispatch({ type: "DEMO_WATCHED", payload: state.currentModule });
    return null;
  }

  const handleFinish = () => {
    // RF02 — mark unit demo as complete so Dashboard unlocks "Iniciar"
    dispatch({ type: "MARK_DEMO_COMPLETE", payload: unit.id });
    // Also mark the module-level demoWatched (used by internal screen router)
    dispatch({ type: "DEMO_WATCHED", payload: state.currentModule });
    // Navigate to the quiz route
    navigate("/modulo-1");
  };

  const handleBack = () => {
    dispatch({ type: "SET_SCREEN", payload: "dashboard" });
    navigate("/dashboard");
  };

  const current = slides[step];

  return (
    <div className="demo-wrapper">
      <div className="demo-card demo-card--wide">

        {/* ── Header ── */}
        <div className="demo-header">
          <div
            className="demo-badge"
            style={{ background: unit.light, color: unit.color }}
          >
            {unit.emoji} Unidade {unit.id}: {unit.title}
          </div>
          <h2 className="demo-title" style={{ color: unit.color }}>
            {demo.title}
          </h2>
          {step === 0 && (
            <p className="demo-intro">{demo.intro}</p>
          )}
        </div>

        {/* ── Step indicator ── */}
        <div className="demo-step-indicator">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`demo-step-btn${i === step ? " demo-step-btn--active" : i < step ? " demo-step-btn--done" : ""}`}
              style={i === step ? { background: unit.color, borderColor: unit.color } : i < step ? { background: unit.color + "44", borderColor: unit.color } : {}}
              onClick={() => setStep(i)}
              aria-label={`Passo ${i + 1}`}
            >
              {i < step ? "✓" : i + 1}
            </button>
          ))}
          <span className="demo-step-label">
            Passo {step + 1} de {slides.length}
          </span>
        </div>

        {/* ── Slide content ── */}
        <div className="demo-slide">
          <h3 className="demo-slide-heading" style={{ color: unit.color }}>
            {current.heading}
          </h3>
          <div className="demo-slide-visual">
            {current.visual}
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="demo-nav-row">
          <button
            className="demo-btn-ghost"
            onClick={() => step > 0 ? setStep((s) => s - 1) : handleBack()}
          >
            {step > 0 ? "← Anterior" : "← Voltar"}
          </button>

          {!isLast ? (
            <button
              className="demo-btn-primary"
              style={{ background: unit.color }}
              onClick={() => setStep((s) => s + 1)}
            >
              Próximo passo →
            </button>
          ) : (
            <button
              className="demo-btn-finish"
              style={{ background: unit.color }}
              onClick={handleFinish}
            >
              Entendi! Ir para os exercícios 🚀
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="demo-progress-track">
          <div
            className="demo-progress-fill"
            style={{
              width: `${((step + 1) / slides.length) * 100}%`,
              background: unit.color,
            }}
          />
        </div>

      </div>
    </div>
  );
}
