import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Review content data ──────────────────────────────────────────────────────

const TOPICS = [
  {
    id: "soma",
    icon: "➕",
    color: "#2563EB",
    light: "#EFF6FF",
    title: "Adição (Soma)",
    concept: "Somar é juntar duas ou mais quantidades para descobrir o total. Somamos os números alinhando as colunas: unidades com unidades, dezenas com dezenas.",
    steps: [
      { label: "Escreva os números alinhados pela direita", detail: "  1 2 5\n+   4 7" },
      { label: "Some as unidades: 5 + 7 = 12", detail: "Escreva 2, leve 1 (\"vai um\") para as dezenas" },
      { label: "Some as dezenas: 2 + 4 + 1 (do \"vai um\") = 7", detail: "Escreva 7" },
      { label: "Some as centenas: 1", detail: "Resultado final: 172" },
    ],
    example: {
      expression: "125 + 47",
      result: "172",
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
    id: "sub",
    icon: "➖",
    color: "#7C3AED",
    light: "#F5F3FF",
    title: "Subtração",
    concept: "Subtrair é tirar uma quantidade de outra, descobrindo a diferença entre elas. Quando o número de cima for menor que o de baixo, fazemos o \"empréstimo\" da coluna à esquerda.",
    steps: [
      { label: "Subtraia as unidades: 3 − 8 não dá!", detail: "Empreste 1 dezena da coluna do meio → 13 − 8 = 5" },
      { label: "Subtraia as dezenas: (3−1) − 5 = 2 − 5 não dá!", detail: "Empreste 1 centena → 12 − 5 = 7" },
      { label: "Subtraia as centenas: (6−1) − 2 = 3", detail: "Resultado: 375" },
    ],
    example: {
      expression: "643 − 268",
      result: "375",
      visual: [
        { row: "  6 4 3", highlight: false },
        { row: "- 2 6 8", highlight: false },
        { row: "─────────", highlight: false },
        { row: "  3 7 5  ✓", highlight: true },
      ],
    },
    tip: "Dica: verifique sua resposta somando o resultado com o subtraendo. Deve dar o minuendo.",
  },
  {
    id: "mult",
    icon: "✖️",
    color: "#D97706",
    light: "#FFFBEB",
    title: "Multiplicação",
    concept: "Multiplicar é uma forma rápida de somar o mesmo número várias vezes. 4 × 3 é o mesmo que somar 4 três vezes: 4 + 4 + 4 = 12.",
    steps: [
      { label: "Multiplique 24 por 3 (unidade do multiplicador)", detail: "4×3 = 12 → escreve 2, leva 1" },
      { label: "2×3 = 6 + 1 (levado) = 7", detail: "Resultado parcial: 72" },
      { label: "Multiplique 24 por 1 (dezena), desloque uma casa", detail: "24 × 10 = 240" },
      { label: "Some os resultados parciais: 72 + 240 = 312", detail: "" },
    ],
    example: {
      expression: "24 × 13",
      result: "312",
      visual: [
        { row: "     2 4", highlight: false },
        { row: "  ×  1 3", highlight: false },
        { row: "─────────", highlight: false },
        { row: "     7 2  (24 × 3)", highlight: false },
        { row: "+  2 4 0  (24 × 10)", highlight: false },
        { row: "─────────", highlight: false },
        { row: "  3 1 2  ✓", highlight: true },
      ],
    },
    tip: "Dica: use a tabuada para os casos simples e decomponha os grandes!",
  },
  {
    id: "div",
    icon: "➗",
    color: "#059669",
    light: "#ECFDF5",
    title: "Divisão",
    concept: "Dividir é repartir uma quantidade em partes iguais. O número dividido chama-se dividendo, o que divide é o divisor, o resultado é o quociente e o que sobra é o resto.",
    steps: [
      { label: "Quantas vezes 7 cabe em 8? → 1 vez", detail: "1 × 7 = 7; resto = 8 − 7 = 1" },
      { label: "Desça o próximo dígito (4) → temos 14", detail: "Quantas vezes 7 cabe em 14? → 2 vezes" },
      { label: "2 × 7 = 14; resto = 14 − 14 = 0", detail: "Quociente: 12, Resto: 0" },
    ],
    example: {
      expression: "84 ÷ 7",
      result: "12 (resto 0)",
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
    id: "pot",
    icon: "⚡",
    color: "#DC2626",
    light: "#FEF2F2",
    title: "Potenciação",
    concept: "Uma potência indica quantas vezes multiplicamos a base por ela mesma. Em 2³, a base é 2 e o expoente é 3: 2 × 2 × 2 = 8.",
    steps: [
      { label: "Identifique base e expoente", detail: "Em 3⁴: base = 3, expoente = 4" },
      { label: "Multiplique a base pelo expoente de vezes indicado", detail: "3 × 3 × 3 × 3" },
      { label: "Calcule passo a passo", detail: "3×3=9 → 9×3=27 → 27×3=81" },
    ],
    example: {
      expression: "3⁴",
      result: "81",
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
    id: "frac",
    icon: "🍕",
    color: "#EC4899",
    light: "#FDF2F8",
    title: "Frações",
    concept: "Uma fração representa partes de um inteiro. O número de cima (numerador) diz quantas partes temos, e o de baixo (denominador) diz em quantas partes o todo foi dividido.",
    steps: [
      { label: "Mesmo denominador: some/subtraia só os numeradores", detail: "Mantenha o denominador igual" },
      { label: "Denominadores diferentes: encontre o MMC", detail: "Converta ambas as frações para o mesmo denominador" },
      { label: "Opere os numeradores", detail: "Simplifique se possível" },
    ],
    example: {
      expression: "1/4 + 2/4",
      result: "3/4",
      visual: [
        { row: "1/4 + 2/4", highlight: false },
        { row: "= (1 + 2) / 4   ← mesmo denominador", highlight: false },
        { row: "= 3/4  ✓", highlight: true },
      ],
    },
    tip: "Dica: para denominadores diferentes, use o MMC. Ex: 1/3 + 1/6 → MMC=6 → 2/6 + 1/6 = 3/6 = 1/2",
  },
];

// ─── Topic card component ─────────────────────────────────────────────────────

function TopicCard({ topic, isOpen, onToggle }) {
  return (
    <div style={{ ...s.topicCard, borderColor: isOpen ? topic.color : "#E2E8F0" }}>
      {/* Header (accordion trigger) */}
      <button
        onClick={onToggle}
        style={{ ...s.topicHeader, background: isOpen ? topic.light : "#F8FAFC" }}
        aria-expanded={isOpen}
      >
        <div style={s.topicHeaderLeft}>
          <span style={{ ...s.topicIconBadge, background: topic.light, color: topic.color }}>
            {topic.icon}
          </span>
          <span style={{ ...s.topicTitle, color: isOpen ? topic.color : "#1e293b" }}>
            {topic.title}
          </span>
        </div>
        <span style={{ ...s.chevron, color: topic.color, transform: isOpen ? "rotate(180deg)" : "none" }}>
          ▾
        </span>
      </button>

      {/* Body */}
      {isOpen && (
        <div style={s.topicBody}>
          {/* Concept */}
          <p style={s.conceptText}>{topic.concept}</p>

          <div style={s.twoCol}>
            {/* Steps */}
            <div>
              <p style={{ ...s.sectionLabel, color: topic.color }}>📋 Passo a passo</p>
              <ol style={s.stepsList}>
                {topic.steps.map((step, i) => (
                  <li key={i} style={s.stepItem}>
                    <div style={{ ...s.stepDot, background: topic.color }}>{i + 1}</div>
                    <div>
                      <p style={s.stepLabel}>{step.label}</p>
                      {step.detail && <p style={s.stepDetail}>{step.detail}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Example */}
            <div>
              <p style={{ ...s.sectionLabel, color: topic.color }}>🔢 Exemplo resolvido</p>
              <div style={{ ...s.exampleBox, borderColor: topic.color + "44", background: topic.light }}>
                <p style={s.exampleTitle}>{topic.example.expression} = <strong>{topic.example.result}</strong></p>
                <div style={s.visualBlock}>
                  {topic.example.visual.map((row, i) => (
                    <p key={i} style={{
                      ...s.visualRow,
                      color: row.highlight ? topic.color : "#334155",
                      fontWeight: row.highlight ? 800 : 400,
                    }}>
                      {row.row}
                    </p>
                  ))}
                </div>
              </div>
              <div style={{ ...s.tipBox, borderColor: topic.color }}>
                <span style={{ color: topic.color }}>💡 </span>
                <span style={s.tipText}>{topic.tip}</span>
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
  const navigate = useNavigate();
  const [openId, setOpenId] = useState("soma"); // first card open by default

  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.pageHeader}>
        <div style={s.headerInner}>
          <div style={s.headerLeft}>
            <div style={s.headerIcon}>📖</div>
            <div>
              <h1 style={s.pageTitle}>Material de Revisão</h1>
              <p style={s.pageSubtitle}>
                Revise os conteúdos antes de tentar o segundo diagnóstico.
              </p>
            </div>
          </div>
          <div style={s.scoreBadge}>
            <span style={s.scoreBadgeIcon}>📊</span>
            <div>
              <p style={s.scoreBadgeLabel}>Sua nota foi</p>
              <p style={s.scoreBadgeValue}>abaixo de 60%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress hint */}
      <div style={s.hintBanner}>
        <span style={s.hintIcon}>💡</span>
        <p style={s.hintText}>
          Leia cada seção com calma. Clique nos títulos para expandir.
          Quando se sentir pronto, clique no botão ao final da página.
        </p>
      </div>

      {/* Topic accordion */}
      <div style={s.topicsContainer}>
        {TOPICS.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            isOpen={openId === topic.id}
            onToggle={() => toggle(topic.id)}
          />
        ))}
      </div>

      {/* CTA */}
      <div style={s.ctaSection}>
        <div style={s.ctaCard}>
          <div style={s.ctaIcon}>🚀</div>
          <h2 style={s.ctaTitle}>Revisão concluída?</h2>
          <p style={s.ctaBody}>
            Quando se sentir confiante, faça o segundo diagnóstico.
            Desta vez você vai melhor!
          </p>
          <button
            onClick={() => navigate("/segundo-diagnostico")}
            style={s.ctaBtn}
          >
            Estou pronto. Fazer o Segundo Diagnóstico →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  page: { maxWidth: 780, margin: "0 auto", padding: "0 16px 64px" },

  // Page header
  pageHeader: {
    background: "linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)",
    borderRadius: "0 0 24px 24px",
    padding: "32px 28px",
    marginBottom: 20,
    marginLeft: -16,
    marginRight: -16,
  },
  headerInner: {
    maxWidth: 780,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  headerIcon: {
    width: 52, height: 52, borderRadius: 14,
    background: "rgba(255,255,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
  },
  pageTitle:    { fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 4px" },
  pageSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 },
  scoreBadge: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 14, padding: "12px 18px",
    display: "flex", alignItems: "center", gap: 12,
    backdropFilter: "blur(4px)",
  },
  scoreBadgeIcon:  { fontSize: 24 },
  scoreBadgeLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 },
  scoreBadgeValue: { fontSize: 15, fontWeight: 800, color: "#FCD34D", margin: 0 },

  // Hint banner
  hintBanner: {
    background: "#FFFBEB", border: "1px solid #FDE68A",
    borderRadius: 12, padding: "12px 16px",
    display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20,
  },
  hintIcon: { fontSize: 18, flexShrink: 0 },
  hintText: { fontSize: 14, color: "#78350F", lineHeight: 1.6, margin: 0 },

  // Topics
  topicsContainer: { display: "flex", flexDirection: "column", gap: 12 },
  topicCard: {
    border: "2px solid",
    borderRadius: 16,
    overflow: "hidden",
    transition: "border-color 0.2s",
  },
  topicHeader: {
    width: "100%", border: "none", cursor: "pointer",
    padding: "16px 20px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontFamily: "inherit", transition: "background 0.2s",
  },
  topicHeaderLeft: { display: "flex", alignItems: "center", gap: 12 },
  topicIconBadge: {
    width: 38, height: 38, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
    flexShrink: 0,
  },
  topicTitle:  { fontSize: 16, fontWeight: 700 },
  chevron:     { fontSize: 18, transition: "transform 0.25s" },

  topicBody:   { padding: "0 20px 20px" },
  conceptText: { fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 20, paddingTop: 4 },

  twoCol: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
  },
  sectionLabel: { fontSize: 12, fontWeight: 800, letterSpacing: 0.4, marginBottom: 10, textTransform: "uppercase" },

  // Steps
  stepsList: { listStyle: "none", display: "flex", flexDirection: "column", gap: 10 },
  stepItem:  { display: "flex", gap: 10, alignItems: "flex-start" },
  stepDot:   {
    width: 24, height: 24, borderRadius: "50%",
    color: "#fff", fontSize: 12, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  stepLabel:  { fontSize: 13, fontWeight: 600, color: "#1e293b", margin: "0 0 2px" },
  stepDetail: { fontSize: 12, color: "#64748b", margin: 0 },

  // Example
  exampleBox: {
    border: "1.5px solid", borderRadius: 12, padding: "14px 16px", marginBottom: 10,
  },
  exampleTitle: { fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 10 },
  visualBlock:  { fontFamily: "'Courier New', monospace" },
  visualRow:    { fontSize: 13, lineHeight: 1.8, margin: 0 },
  tipBox: {
    borderLeft: "3px solid", paddingLeft: 12,
    background: "#FAFAFA", borderRadius: "0 8px 8px 0", padding: "8px 12px",
  },
  tipText: { fontSize: 12, color: "#475569", lineHeight: 1.6 },

  // CTA
  ctaSection: { padding: "32px 0 0" },
  ctaCard: {
    background: "linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)",
    border: "2px solid #BFDBFE", borderRadius: 20,
    padding: "36px 32px", textAlign: "center",
  },
  ctaIcon:  { fontSize: 48, marginBottom: 12 },
  ctaTitle: { fontSize: 22, fontWeight: 800, color: "#1e293b", marginBottom: 8 },
  ctaBody:  { fontSize: 15, color: "#475569", lineHeight: 1.65, marginBottom: 24, maxWidth: 440, margin: "0 auto 24px" },
  ctaBtn: {
    display: "inline-block",
    padding: "16px 36px", borderRadius: 14,
    border: "none", background: "#2563EB",
    color: "#fff", fontWeight: 800, fontSize: 16,
    cursor: "pointer", fontFamily: "inherit",
    transition: "background 0.2s, transform 0.1s",
    boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
  },
};
