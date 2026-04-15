import { useState } from "react";
import { useApp } from "../context/AppContext";
import { UNITS } from "../data/units";

// ─── Demo slides content ──────────────────────────────────────────────────────

function getDemoSlides(module, unit) {
  return [
    {
      icon: "📘",
      title: "Como funciona este módulo",
      body: `Neste módulo "${module?.title}" você vai resolver ${module?.questions?.length} questões matemáticas. Cada questão correta vale pontos de XP!`,
    },
    {
      icon: "🔍",
      title: "Tipos de questão",
      body: "Você encontrará questões de múltipla escolha (4 opções) e questões de resposta aberta. Leia o enunciado com atenção antes de responder.",
    },
    {
      icon: "💡",
      title: "Dicas disponíveis",
      body: "Na segunda tentativa você pode pedir uma dica. Atenção: usar dica reduz sua pontuação. Você tem 3 dicas por bateria de exercícios.",
    },
    {
      icon: "✏️",
      title: "Rascunho",
      body: 'Use o botão "Rascunho ✏️" para abrir uma área de desenho e fazer seus cálculos. Muito útil para questões mais difíceis!',
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DemoScreen() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);

  const module = UNITS.flatMap((u) => u.modules).find(
    (m) => m.id === state.currentModule
  );
  const unit = UNITS.find((u) =>
    u.modules.some((m) => m.id === state.currentModule)
  );

  const slides = getDemoSlides(module, unit);
  const isLast = step === slides.length - 1;

  const handleStart = () => {
    dispatch({ type: "DEMO_WATCHED", payload: state.currentModule });
  };

  const handleBack = () => {
    dispatch({ type: "SET_SCREEN", payload: "dashboard" });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconWrap}>
          <span style={styles.icon}>{slides[step].icon}</span>
        </div>

        {/* Unit badge */}
        <div
          style={{
            ...styles.badge,
            background: unit?.light,
            color: unit?.color,
          }}
        >
          {unit?.emoji} {unit?.title}
        </div>

        {/* Slide content */}
        <h2 style={{ ...styles.title, color: unit?.color }}>
          {slides[step].title}
        </h2>
        <p style={styles.body}>{slides[step].body}</p>

        {/* Dot indicators */}
        <div style={styles.dots}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                ...styles.dot,
                width: i === step ? 24 : 8,
                background: i === step ? unit?.color : "#e2e8f0",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div style={styles.btnRow}>
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              style={styles.btnGhost}
            >
              ← Anterior
            </button>
          )}

          {!isLast ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              style={{ ...styles.btnPrimary, background: unit?.color }}
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={handleStart}
              style={{ ...styles.btnPrimary, background: unit?.color }}
            >
              Entendi! Começar questões 🚀
            </button>
          )}
        </div>

        <button onClick={handleBack} style={styles.btnBack}>
          Voltar ao painel
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 16,
    background: "#f8fafc",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "36px 32px",
    maxWidth: 480,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    border: "1px solid #f1f5f9",
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  icon: {
    fontSize: 36,
  },
  badge: {
    display: "inline-block",
    padding: "4px 14px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    margin: "0 0 12px",
  },
  body: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 1.7,
    margin: "0 0 24px",
  },
  dots: {
    display: "flex",
    gap: 6,
    justifyContent: "center",
    marginBottom: 28,
  },
  dot: {
    height: 8,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    padding: 0,
    transition: "all 0.25s",
  },
  btnRow: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    marginBottom: 12,
  },
  btnPrimary: {
    padding: "12px 24px",
    borderRadius: 12,
    border: "none",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "inherit",
    flex: 1,
    maxWidth: 260,
  },
  btnGhost: {
    padding: "12px 20px",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    background: "transparent",
    color: "#475569",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnBack: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "underline",
    fontFamily: "inherit",
  },
};
