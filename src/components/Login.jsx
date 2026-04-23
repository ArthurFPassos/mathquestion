import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Login.css";

export default function Login() {
  const { dispatch } = useApp();
  const navigate     = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
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
    setLoading(true);
    setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem("mq_user") || "null");
      if (!stored || stored.email !== form.email || stored.password !== form.password) {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }
      dispatch({ type: "LOGIN", payload: { name: stored.name, email: stored.email, grade: stored.grade } });
      navigate("/dashboard"); // Aluno recorrente → vai direto ao painel
    }, 700);
  };

  return (
    <div className="auth-layout">

      {/* Form panel */}
      <div className="auth-panel">
        <div className="form-box">
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
                  id="email" type="email" name="email"
                  placeholder="seu@email.com"
                  value={form.email} onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <div className="field">
                <label htmlFor="password">Senha</label>
                <input
                  id="password" type="password" name="password"
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && <div className="login-error-box">⚠️ {error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginBottom: 16 }}
            >
              {loading ? "Entrando…" : "Entrar →"}
            </button>
          </form>

          <p className="login-switch-text">
            Não tem uma conta?{" "}
            <Link to="/cadastro" className="login-switch-link">
              Cadastre-se grátis
            </Link>
          </p>

          <Link to="/">
            <button className="btn-ghost" style={{ width: "100%" }}>
              ← Voltar para a página inicial
            </button>
          </Link>
        </div>
      </div>

      {/* Visual panel */}
      <div className="auth-visual">
        <div className="login-visual-content">
          <div className="login-visual-icon">🧮</div>
          <h2 className="login-visual-title">Continue evoluindo!</h2>
          <p className="login-visual-desc">
            Acesse seu painel, veja seu progresso e continue de onde parou.
          </p>
          <div className="login-stats-wrap">
            {[
              { icon: "⭐", label: "XP acumulado" },
              { icon: "📊", label: "Progresso por unidade" },
              { icon: "🏆", label: "Metas desbloqueadas" },
            ].map((item) => (
              <div key={item.label} className="login-stat-item">
                <span className="login-stat-icon">{item.icon}</span>
                <span className="login-stat-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
