import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ReviewScreen.css";

// ─── Topic data ───────────────────────────────────────────────────────────────

const TOPICS = [
  {
    id: "soma", icon: "➕", color: "#2563EB", light: "#EFF6FF",
    title: "Adição (Soma)",
    concept: "Somar é juntar duas ou mais quantidades para descobrir o total. Somamos os números alinhando as colunas: unidades com unidades, dezenas com dezenas.",
    steps: [
      { label: "Escreva os números alinhados pela direita", detail: "  1 2 5\n+   4 7" },
      { label: "Some as unidades: 5 + 7 = 12", detail: "Escreva 2, leve 1 (\"vai um\") para as dezenas" },
      { label: "Some as dezenas: 2 + 4 + 1 (do \"vai um\") = 7", detail: "Escreva 7" },
      { label: "Some as centenas: 1", detail: "Resultado final: 172" },
    ],
    example: {
      expression: "125 + 47", result: "172",
      visual: [
        { row: "  1 2 5", highlight: false },
        { row: "+ 0 4 7", highlight: false },
        { row: "─────────", highlight: false },
        { row: "  1 7 2  ✓", highlight: true },
      ],
    },
    tip: "Dica: sempre alinhe pela direita e trabalhe da direita para a esquerda.",
  },
  {
    id: "sub", icon: "➖", color: "#7C3AED", light: "#F5F3FF",
    title: "Subtração",
    concept: "Subtrair é tirar uma quantidade de outra, descobrindo a diferença entre elas. Quando o número de cima for menor que o de baixo, fazemos o \"empréstimo\" da coluna à esquerda.",
    steps: [
      { label: "Subtraia as unidades: 3 − 8 não dá!", detail: "Empreste 1 dezena → 13 − 8 = 5" },
      { label: "Subtraia as dezenas: (3−1) − 5 não dá!", detail: "Empreste 1 centena → 12 − 5 = 7" },
      { label: "Subtraia as centenas: (6−1) − 2 = 3", detail: "Resultado: 375" },
    ],
    example: {
      expression: "643 − 268", result: "375",
      visual: [
        { row: "  6 4 3", highlight: false },
        { row: "- 2 6 8", highlight: false },
        { row: "─────────", highlight: false },
        { row: "  3 7 5  ✓", highlight: true },
      ],
    },
    tip: "Dica: verifique somando o resultado com o subtraendo. Deve dar o minuendo.",
  },
  {
    id: "mult", icon: "✖️", color: "#D97706", light: "#FFFBEB",
    title: "Multiplicação",
    concept: "Multiplicar é uma forma rápida de somar o mesmo número várias vezes. 4 × 3 é o mesmo que 4 + 4 + 4 = 12.",
    steps: [
      { label: "Multiplique 24 por 3 (unidade)", detail: "4×3 = 12 → escreve 2, leva 1" },
      { label: "2×3 = 6 + 1 (levado) = 7", detail: "Resultado parcial: 72" },
      { label: "Multiplique 24 por 1 (dezena), desloque uma casa", detail: "24 × 10 = 240" },
      { label: "Some os parciais: 72 + 240 = 312", detail: "" },
    ],
    example: {
      expression: "24 × 13", result: "312",
      visual: [
        { row: "     2 4", highlight: false },
        { row: "  ×  1 3", highlight: false },
        { row: "─────────", highlight: false },
        { row: "     7 2  (24×3)", highlight: false },
        { row: "+  2 4 0  (24×10)", highlight: false },
        { row: "─────────", highlight: false },
        { row: "  3 1 2  ✓", highlight: true },
      ],
    },
    tip: "Dica: use a tabuada para os casos simples e decomponha os grandes!",
  },
  {
    id: "div", icon: "➗", color: "#059669", light: "#ECFDF5",
    title: "Divisão",
    concept: "Dividir é repartir em partes iguais. Dividendo ÷ Divisor = Quociente (com possível Resto).",
    steps: [
      { label: "Quantas vezes 7 cabe em 8? → 1 vez", detail: "1 × 7 = 7; resto = 8 − 7 = 1" },
      { label: "Desça o próximo dígito (4) → temos 14", detail: "Quantas vezes 7 cabe em 14? → 2 vezes" },
      { label: "2 × 7 = 14; resto = 0", detail: "Quociente: 12, Resto: 0" },
    ],
    example: {
      expression: "84 ÷ 7", result: "12 (resto 0)",
      visual: [
        { row: "84 | 7", highlight: false },
        { row: " 7    ──", highlight: false },
        { row: "──   12  ✓", highlight: true },
        { row: "14", highlight: false },
        { row: "14", highlight: false },
        { row: "──", highlight: false },
        { row: " 0  (resto)", highlight: false },
      ],
    },
    tip: "Dica: verifique com: quociente × divisor + resto = dividendo",
  },
  {
    id: "pot", icon: "⚡", color: "#DC2626", light: "#FEF2F2",
    title: "Potenciação",
    concept: "Uma potência indica quantas vezes multiplicamos a base por ela mesma. Em 2³: base = 2, expoente = 3 → 2 × 2 × 2 = 8.",
    steps: [
      { label: "Identifique base e expoente", detail: "Em 3⁴: base = 3, expoente = 4" },
      { label: "Multiplique a base por ela mesma (expoente vezes)", detail: "3 × 3 × 3 × 3" },
      { label: "Calcule passo a passo", detail: "9 → 27 → 81" },
    ],
    example: {
      expression: "3⁴", result: "81",
      visual: [
        { row: "3⁴ = 3 × 3 × 3 × 3", highlight: false },
        { row: "   = 9 × 3 × 3", highlight: false },
        { row: "   = 27 × 3", highlight: false },
        { row: "   = 81  ✓", highlight: true },
      ],
    },
    tip: "Regra especial: qualquer número elevado a 0 = 1. Ex: 99⁰ = 1",
  },
  {
    id: "frac", icon: "🍕", color: "#EC4899", light: "#FDF2F8",
    title: "Frações",
    concept: "Uma fração representa partes de um inteiro. O numerador (cima) diz quantas partes temos; o denominador (baixo) diz em quantas o todo foi dividido.",
    steps: [
      { label: "Mesmo denominador: some/subtraia só os numeradores", detail: "Mantenha o denominador igual" },
      { label: "Denominadores diferentes: encontre o MMC", detail: "Converta ambas para o mesmo denominador" },
      { label: "Opere os numeradores e simplifique", detail: "" },
    ],
    example: {
      expression: "1/4 + 2/4", result: "3/4",
      visual: [
        { row: "1/4 + 2/4", highlight: false },
        { row: "= (1+2) / 4   ← mesmo denominador", highlight: false },
        { row: "= 3/4  ✓", highlight: true },
      ],
    },
    tip: "Dica: para denominadores diferentes use o MMC. Ex: 1/3 + 1/6 → 2/6 + 1/6 = 3/6 = 1/2",
  },
];

// ─── TopicCard ────────────────────────────────────────────────────────────────

function TopicCard({ topic, isOpen, onToggle }) {
  return (
    <div
      className="rv-topic-card"
      style={{ borderColor: isOpen ? topic.color : "#E2E8F0" }}
    >
      <button
        className="rv-topic-header"
        style={{ background: isOpen ? topic.light : "#F8FAFC" }}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="rv-topic-header-left">
          <span
            className="rv-topic-icon-badge"
            style={{ background: topic.light, color: topic.color }}
          >
            {topic.icon}
          </span>
          <span
            className="rv-topic-title"
            style={{ color: isOpen ? topic.color : "#1e293b" }}
          >
            {topic.title}
          </span>
        </div>
        <span
          className={`rv-chevron${isOpen ? " rv-chevron--open" : ""}`}
          style={{ color: topic.color }}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="rv-topic-body">
          <p className="rv-concept-text">{topic.concept}</p>

          <div className="rv-two-col">
            {/* Steps */}
            <div>
              <p className="rv-section-label" style={{ color: topic.color }}>
                📋 Passo a passo
              </p>
              <ol className="rv-steps-list">
                {topic.steps.map((step, i) => (
                  <li key={i} className="rv-step-item">
                    <div
                      className="rv-step-dot"
                      style={{ background: topic.color }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="rv-step-label">{step.label}</p>
                      {step.detail && (
                        <p className="rv-step-detail">{step.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Example */}
            <div>
              <p className="rv-section-label" style={{ color: topic.color }}>
                🔢 Exemplo resolvido
              </p>
              <div
                className="rv-example-box"
                style={{
                  borderColor: topic.color + "44",
                  background:  topic.light,
                }}
              >
                <p className="rv-example-title">
                  {topic.example.expression} ={" "}
                  <strong>{topic.example.result}</strong>
                </p>
                <div className="rv-visual-block">
                  {topic.example.visual.map((row, i) => (
                    <p
                      key={i}
                      className="rv-visual-row"
                      style={{
                        color:      row.highlight ? topic.color : "#334155",
                        fontWeight: row.highlight ? 800 : 400,
                      }}
                    >
                      {row.row}
                    </p>
                  ))}
                </div>
              </div>
              <div
                className="rv-tip-box"
                style={{ borderColor: topic.color }}
              >
                <span style={{ color: topic.color }}>💡 </span>
                <span className="rv-tip-text">{topic.tip}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReviewScreen() {
  const navigate            = useNavigate();
  const location            = useLocation();
  const [openId, setOpenId] = useState("soma");

  // ── Origin detection ─────────────────────────────────────────────────────────
  // fromDiagnostic: true  → came from DiagnosticScreen (score < 60%)
  // fromDiagnostic: false → free access from Dashboard
  const fromDiagnostic = location.state?.fromDiagnostic === true;
  const diagScore      = location.state?.score;

  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <div className="rv-page">

      {/* ── Page header ── */}
      <div className="rv-page-header">
        <div className="rv-header-inner">

          {/* Back button — free-access mode only */}
          {!fromDiagnostic && (
            <button
              className="rv-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
            >
              ← Voltar
            </button>
          )}

          <div className="rv-header-row">
            <div className="rv-header-left">
              <div className="rv-header-icon">📖</div>
              <div>
                <h1 className="rv-page-title">Material de Revisão</h1>
                <p className="rv-page-subtitle">
                  {fromDiagnostic
                    ? "Revise os conteúdos antes de tentar o segundo diagnóstico."
                    : "Consulte as explicações de cada operação a qualquer momento."}
                </p>
              </div>
            </div>

            {/* Score badge — only post-diagnostic */}
            {fromDiagnostic && (
              <div className="rv-score-badge">
                <span className="rv-score-badge-icon">📊</span>
                <div>
                  <p className="rv-score-badge-label">Sua nota foi</p>
                  <p className="rv-score-badge-value">
                    {diagScore !== undefined
                      ? `${Math.round(diagScore * 100)}% — abaixo de 60%`
                      : "abaixo de 60%"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hint banner ── */}
      <div className="rv-hint-banner">
        <span className="rv-hint-icon">💡</span>
        <p className="rv-hint-text">
          {fromDiagnostic
            ? "Não se preocupe! Leia cada seção com calma e, quando estiver pronto, tente o segundo diagnóstico."
            : "Clique nos títulos para expandir cada tópico. Use este material sempre que precisar revisar."}
        </p>
      </div>

      {/* ── Accordion ── */}
      <div className="rv-topics-container">
        {TOPICS.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            isOpen={openId === topic.id}
            onToggle={() => toggle(topic.id)}
          />
        ))}
      </div>

      {/* ── Conditional footer ── */}
      {fromDiagnostic ? (
        <div className="rv-cta-section">
          <div className="rv-cta-card">
            <div className="rv-cta-icon">🚀</div>
            <h2 className="rv-cta-title">Revisão concluída?</h2>
            <p className="rv-cta-body">
              Quando se sentir confiante, faça o segundo diagnóstico.
              Desta vez você vai melhor!
            </p>
            <button
              className="rv-cta-btn rv-cta-btn--blue"
              onClick={() => navigate("/segundo-diagnostico")}
            >
              Estou pronto. Fazer o Segundo Diagnóstico →
            </button>
          </div>
        </div>
      ) : (
        <div className="rv-cta-section">
          <div className="rv-cta-card rv-cta-card--free">
            <div className="rv-cta-icon">📚</div>
            <h2 className="rv-cta-title" style={{ color: "#1e293b" }}>
              Revisão concluída!
            </h2>
            <p className="rv-cta-body">
              Continue praticando nos módulos. Você pode voltar a esta página
              sempre que precisar relembrar algum conteúdo.
            </p>
            <button
              className="rv-cta-btn rv-cta-btn--blue"
              onClick={() => navigate(-1)}
            >
              ← Voltar para os Módulos
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
