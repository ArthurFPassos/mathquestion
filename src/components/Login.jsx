import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Login() {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }

    // Simulated auth — in production, replace with real API call
    setLoading(true);
    setTimeout(() => {
      const storedRaw = localStorage.getItem("mq_user");
      const stored = storedRaw ? JSON.parse(storedRaw) : null;

      if (!stored || stored.email !== form.email || stored.password !== form.password) {
        setError("E-mail ou senha incorretos. Verifique seus dados.");
        setLoading(false);
        return;
      }

      dispatch({ type: "LOGIN", payload: { name: stored.name, email: stored.email, grade: stored.grade } });
      navigate("/app");
    }, 700);
  };

  return (
    <div className="auth-layout">

      {/* ── Left: form ── */}
      <div className="auth-panel">
        <div className="form-box">
          {/* Logo */}
          <div className="form-logo">
            <div className="form-logo-icon">🧮</div>
            <span className="form-logo-text">MathQuestion</span>
          </div>

          <h1 className="form-title">Bem-vindo de volta!</h1>
          <p className="form-subtitle">
            Entre com sua conta para continuar de onde parou.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label htmlFor="password">Senha</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={s.errorBox}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginBottom: 16 }}
            >
              {loading ? "Entrando…" : "Entrar →"}
            </button>
          </form>

          <p style={s.switchText}>
            Não tem uma conta?{" "}
            <Link to="/cadastro" style={s.switchLink}>
              Cadastre-se grátis
            </Link>
          </p>

          <div style={s.divider}><span>ou</span></div>

          <Link to="/">
            <button className="btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
              ← Voltar para a página inicial
            </button>
          </Link>
        </div>
      </div>

      {/* ── Right: visual ── */}
      <div className="auth-visual">
        <div style={s.visualContent}>
          <div style={s.visualIcon}>🧮</div>
          <h2 style={s.visualTitle}>Continue evoluindo!</h2>
          <p style={s.visualDesc}>
            Acesse seu painel, veja seu progresso e continue de onde parou.
          </p>

          <div style={s.statsWrap}>
            {[
              { icon: "⭐", label: "XP acumulado" },
              { icon: "📊", label: "Progresso por unidade" },
              { icon: "🏆", label: "Metas desbloqueadas" },
            ].map((item, i) => (
              <div key={i} style={s.statItem}>
                <span style={s.statItemIcon}>{item.icon}</span>
                <span style={s.statItemLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  errorBox: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#DC2626",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 16,
  },
  switchText: {
    textAlign: "center",
    fontSize: 14,
    color: "#475569",
    marginBottom: 20,
  },
  switchLink: {
    color: "#2563EB",
    fontWeight: 600,
    textDecoration: "none",
  },
  divider: {
    textAlign: "center",
    position: "relative",
    margin: "0 0 16px",
    color: "#94A3B8",
    fontSize: 13,
  },

  // Visual panel
  visualContent: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    maxWidth: 320,
  },
  visualIcon: {
    fontSize: 56,
    marginBottom: 20,
  },
  visualTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 12,
  },
  visualDesc: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.65,
    marginBottom: 36,
  },
  statsWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  statItem: {
    background: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    backdropFilter: "blur(4px)",
  },
  statItemIcon: { fontSize: 20 },
  statItemLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
  },
};
