import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function WelcomeScreen() {
  const { dispatch } = useApp();
  const [name, setName] = useState("");

  const handleStart = () => {
    if (!name.trim()) return;
    dispatch({ type: "SET_NAME", payload: name.trim() });
    dispatch({ type: "SET_SCREEN", payload: "diagnostic" });
  };

  const features = [
    { icon: "📚", label: "4 unidades progressivas" },
    { icon: "🎯", label: "Múltipla escolha + input" },
    { icon: "💡", label: "Dicas orientadoras" },
    { icon: "⭐", label: "Sistema de XP" },
    { icon: "✏️", label: "Rascunho na tela" },
    { icon: "📊", label: "Relatório de desempenho" },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <span style={styles.logoIcon}>🧮</span>
        </div>
        <h1 style={styles.title}>MathQuestion</h1>
        <p style={styles.tagline}>
          Plataforma de exercícios de matemática para o 6º ano.
          <br />
          Aprenda resolvendo problemas do cotidiano!
        </p>

        {/* Name input */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Qual é o seu nome?</label>
          <input
            type="text"
            placeholder="Ex: Ana Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            style={styles.input}
            autoFocus
          />
        </div>

        <button
          onClick={handleStart}
          disabled={!name.trim()}
          style={{
            ...styles.btnPrimary,
            opacity: name.trim() ? 1 : 0.5,
            cursor: name.trim() ? "pointer" : "not-allowed",
          }}
        >
          Começar → Avaliação Diagnóstica
        </button>

        {/* Feature grid */}
        <div style={styles.featureGrid}>
          {features.map((f, i) => (
            <div key={i} style={styles.featureItem}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureLabel}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 16,
    background: "linear-gradient(135deg, #eef2ff 0%, #fdf2f8 100%)",
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: "40px 36px",
    maxWidth: 440,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(99,102,241,0.13)",
    border: "1px solid #f1f5f9",
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  logoIcon: { fontSize: 40 },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: "#6366f1",
    margin: "0 0 10px",
  },
  tagline: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 1.65,
    margin: "0 0 28px",
  },
  fieldGroup: {
    textAlign: "left",
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 16,
    border: "2px solid #e2e8f0",
    borderRadius: 12,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#f8fafc",
    color: "#1e293b",
    transition: "border-color 0.2s",
  },
  btnPrimary: {
    width: "100%",
    padding: "14px 24px",
    borderRadius: 14,
    border: "none",
    background: "#6366f1",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    fontFamily: "inherit",
    marginBottom: 28,
    transition: "opacity 0.15s",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  featureItem: {
    background: "#f8fafc",
    borderRadius: 10,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    textAlign: "left",
  },
  featureIcon: { fontSize: 16, flexShrink: 0 },
  featureLabel: { fontSize: 13, color: "#64748b" },
};
