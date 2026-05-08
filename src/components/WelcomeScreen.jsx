import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./WelcomeScreen.css";

const FEATURES = [
  { label: "4 unidades progressivas" },
  { label: "Múltipla escolha + resposta aberta" },
  { label: "Dicas orientadoras" },
  { label: "Sistema de pontos (XP)" },
  { label: "Rascunho na tela" },
  { label: "Relatório de desempenho" },
];

export default function WelcomeScreen() {
  const { dispatch } = useApp();
  const [name, setName] = useState("");

  const handleStart = () => {
    if (!name.trim()) return;
    dispatch({ type: "SET_NAME", payload: name.trim() });
    dispatch({ type: "SET_SCREEN", payload: "diagnostic" });
  };

  return (
    <div className="ws-wrapper">
      <div className="ws-card">

        {/* Logo com imagem calculadora.png */}
        <div className="ws-logo-wrap">
          {/* Substitua por <img src={calculadora} .../> após adicionar o PNG ao repositório */}
          <span className="ws-logo-fallback">🧮</span>
        </div>

        <h1 className="ws-title">MathQuestion</h1>

        <p className="ws-tagline">
          Plataforma de exercícios de matemática para o 6.º ano.
          Aprenda resolvendo problemas do cotidiano.
        </p>

        <div className="ws-field-group">
          <label className="ws-label" htmlFor="ws-name">
            Qual é o seu nome?
          </label>
          <input
            id="ws-name"
            type="text"
            className="ws-input"
            placeholder="Ex: Ana Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            autoFocus
          />
        </div>

        <button
          className="ws-btn-primary"
          onClick={handleStart}
          disabled={!name.trim()}
        >
          Começar — Avaliação Diagnóstica
        </button>

        <div className="ws-feature-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="ws-feature-item">
              <span className="ws-feature-dot" />
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
