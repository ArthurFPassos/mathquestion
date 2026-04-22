import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const GRADES = [
  "5º ano — Ensino Fundamental",
  "6º ano — Ensino Fundamental",
  "7º ano — Ensino Fundamental",
  "8º ano — Ensino Fundamental",
  "9º ano — Ensino Fundamental",
];

export default function Register() {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    grade: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())      errs.name = "Informe seu nome.";
    if (!form.email.trim())     errs.email = "Informe seu e-mail.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "E-mail inválido.";
    if (form.password.length < 6) errs.password = "A senha deve ter ao menos 6 caracteres.";
    if (!form.grade)            errs.grade = "Selecione seu ano escolar.";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setTimeout(() => {
      // Persist to localStorage (simulated backend)
      localStorage.setItem("mq_user", JSON.stringify({ ...form }));

      dispatch({
        type: "REGISTER",
        payload: { name: form.name, email: form.email, grade: form.grade },
      });
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

          <h1 className="form-title">Crie sua conta</h1>
          <p className="form-subtitle">
            Gratuito, sem complicação. Comece a aprender em menos de 1 minuto.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">

              {/* Nome */}
              <div className="field">
                <label htmlFor="name">Nome completo</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Ex: Ana Silva"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  style={errors.name ? fieldErrorStyle : {}}
                />
                {errors.name && <span style={s.fieldError}>{errors.name}</span>}
              </div>

              {/* Email */}
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
                  style={errors.email ? fieldErrorStyle : {}}
                />
                {errors.email && <span style={s.fieldError}>{errors.email}</span>}
              </div>

              {/* Senha */}
              <div className="field">
                <label htmlFor="password">Senha</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={errors.password ? fieldErrorStyle : {}}
                />
                {errors.password && <span style={s.fieldError}>{errors.password}</span>}
              </div>

              {/* Ano escolar */}
              <div className="field">
                <label htmlFor="grade">Ano escolar</label>
                <select
                  id="grade"
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  style={errors.grade ? fieldErrorStyle : {}}
                >
                  <option value="">Selecione seu ano...</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.grade && <span style={s.fieldError}>{errors.grade}</span>}
              </div>

            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginBottom: 16 }}
            >
              {loading ? "Criando conta…" : "Criar conta gratuita →"}
            </button>
          </form>

          <p style={s.switchText}>
            Já tem uma conta?{" "}
            <Link to="/login" style={s.switchLink}>
              Entrar
            </Link>
          </p>

          <p style={s.terms}>
            Ao criar uma conta, você concorda com nossos{" "}
            <span style={{ color: "#2563EB" }}>Termos de uso</span>.
          </p>
        </div>
      </div>

      {/* ── Right: visual ── */}
      <div className="auth-visual">
        <div style={s.visualContent}>
          <div style={s.visualIcon}>🚀</div>
          <h2 style={s.visualTitle}>Sua jornada começa agora!</h2>
          <p style={s.visualDesc}>
            Desbloqueie unidades, ganhe XP e veja sua evolução em tempo real.
          </p>

          <div style={s.stepsWrap}>
            {[
              { n: "1", label: "Faça o diagnóstico inicial" },
              { n: "2", label: "Assista a demonstração" },
              { n: "3", label: "Resolva as questões" },
              { n: "4", label: "Acompanhe seu progresso" },
            ].map((step) => (
              <div key={step.n} style={s.step}>
                <div style={s.stepNum}>{step.n}</div>
                <span style={s.stepLabel}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Shared error border ─────────────────────────────────────────────────────

const fieldErrorStyle = {
  borderColor: "#EF4444",
  boxShadow: "0 0 0 3px rgba(239,68,68,0.1)",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  fieldError: {
    display: "block",
    marginTop: 4,
    fontSize: 12,
    color: "#DC2626",
    fontWeight: 500,
  },
  switchText: {
    textAlign: "center",
    fontSize: 14,
    color: "#475569",
    marginBottom: 12,
  },
  switchLink: {
    color: "#2563EB",
    fontWeight: 600,
  },
  terms: {
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 1.5,
  },

  // Visual panel
  visualContent: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    maxWidth: 340,
  },
  visualIcon: { fontSize: 56, marginBottom: 20 },
  visualTitle: {
    fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 12,
  },
  visualDesc: {
    fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: 36,
  },
  stepsWrap: { display: "flex", flexDirection: "column", gap: 12 },
  step: {
    background: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    backdropFilter: "blur(4px)",
  },
  stepNum: {
    width: 28, height: 28, borderRadius: "50%",
    background: "rgba(255,255,255,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0,
  },
  stepLabel: { fontSize: 14, fontWeight: 600, color: "#fff", textAlign: "left" },
};
