import { useState } from "react";
import { useApp } from "../context/AppContext";
import { UNITS } from "../data/units";
import "./DemoScreen.css";

function getDemoSlides(module) {
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

export default function DemoScreen() {
  const { state, dispatch } = useApp();
  const [step, setStep]     = useState(0);

  const module = UNITS.flatMap((u) => u.modules).find(
    (m) => m.id === state.currentModule
  );
  const unit = UNITS.find((u) =>
    u.modules.some((m) => m.id === state.currentModule)
  );

  const slides = getDemoSlides(module);
  const isLast = step === slides.length - 1;

  return (
    <div className="demo-wrapper">
      <div className="demo-card">
        <div className="demo-icon-wrap">
          <span>{slides[step].icon}</span>
        </div>

        <div
          className="demo-badge"
          style={{ background: unit?.light, color: unit?.color }}
        >
          {unit?.emoji} {unit?.title}
        </div>

        <h2
          className="demo-title"
          style={{ color: unit?.color }}
        >
          {slides[step].title}
        </h2>
        <p className="demo-body">{slides[step].body}</p>

        {/* Dot indicators */}
        <div className="demo-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className="demo-dot"
              onClick={() => setStep(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width:      i === step ? 24 : 8,
                background: i === step ? unit?.color : "#e2e8f0",
              }}
            />
          ))}
        </div>

        <div className="demo-btn-row">
          {step > 0 && (
            <button
              className="demo-btn-ghost"
              onClick={() => setStep((s) => s - 1)}
            >
              ← Anterior
            </button>
          )}

          {!isLast ? (
            <button
              className="demo-btn-primary"
              style={{ background: unit?.color }}
              onClick={() => setStep((s) => s + 1)}
            >
              Próximo →
            </button>
          ) : (
            <button
              className="demo-btn-primary"
              style={{ background: unit?.color }}
              onClick={() =>
                dispatch({ type: "DEMO_WATCHED", payload: state.currentModule })
              }
            >
              Entendi! Começar questões 🚀
            </button>
          )}
        </div>

        <button
          className="demo-btn-back"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: "dashboard" })}
        >
          Voltar ao painel
        </button>
      </div>
    </div>
  );
}
