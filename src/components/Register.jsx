import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Register.css";

const GRADES = [
  "1º ano — Ensino Fundamental", "2º ano — Ensino Fundamental",
  "3º ano — Ensino Fundamental", "4º ano — Ensino Fundamental",
  "5º ano — Ensino Fundamental", "6º ano — Ensino Fundamental",
  "7º ano — Ensino Fundamental", "8º ano — Ensino Fundamental",
  "9º ano — Ensino Fundamental",
];

export default function Register() {
  const { dispatch } = useApp();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ name: "", email: "", password: "", grade: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f)   => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())          errs.name     = "Informe seu nome.";
    if (!form.email.trim())         errs.email    = "Informe seu e-mail.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "E-mail inválido.";
    if (form.password.length < 6)   errs.password = "A senha deve ter ao menos 6 caracteres.";
    if (!form.grade)                errs.grade    = "Selecione seu ano escolar.";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("mq_user", JSON.stringify({ ...form }));
      dispatch({ type: "REGISTER", payload: { name: form.name, email: form.email, grade: form.grade } });
      navigate("/diagnostico");
    }, 700);
  };

  const fieldClass = (name) =>
    errors[name] ? "reg-field-input-error" : "";

  return (
    <div className="auth-layout">

      {}
      <div className="auth-panel">
        <div className="form-box">
          <div className="form-logo">
            <div className="form-logo-icon">🧮</div>
            <span className="form-logo-text">MathQuestion</span>
          </div>

          <h1 className="form-title">Crie sua conta</h1>
          <p className="form-subtitle">
            Gratuito, sem complicação. Comece em menos de 1 minuto.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <div className="field">
                <label htmlFor="name">Nome completo</label>
                <input
                  id="name" type="text" name="name"
                  placeholder="Ex: Ana Silva"
                  value={form.name} onChange={handleChange}
                  className={fieldClass("name")}
                  autoComplete="name"
                />
                {errors.name && <span className="reg-field-error">{errors.name}</span>}
              </div>

              <div className="field">
                <label htmlFor="reg-email">E-mail</label>
                <input
                  id="reg-email" type="email" name="email"
                  placeholder="seu@email.com"
                  value={form.email} onChange={handleChange}
                  className={fieldClass("email")}
                  autoComplete="email"
                />
                {errors.email && <span className="reg-field-error">{errors.email}</span>}
              </div>

              <div className="field">
                <label htmlFor="password">Senha</label>
                <input
                  id="password" type="password" name="password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password} onChange={handleChange}
                  className={fieldClass("password")}
                  autoComplete="new-password"
                />
                {errors.password && <span className="reg-field-error">{errors.password}</span>}
              </div>

              <div className="field">
                <label htmlFor="grade">Ano escolar</label>
                <select
                  id="grade" name="grade"
                  value={form.grade} onChange={handleChange}
                  className={fieldClass("grade")}
                >
                  <option value="">Selecione seu ano...</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.grade && <span className="reg-field-error">{errors.grade}</span>}
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

          <p className="reg-switch-text">
            Já tem uma conta?{" "}
            <Link to="/login" className="reg-switch-link">Entrar</Link>
          </p>
          <p className="reg-terms">
            Ao criar uma conta, você concorda com nossos{" "}
            <span className="reg-terms-link">Termos de uso</span>.
          </p>
        </div>
      </div>

      {/* Visual panel */}
      <div className="auth-visual">
        <div className="reg-visual-content">
          <div className="reg-visual-icon">🚀</div>
          <h2 className="reg-visual-title">Sua jornada começa agora!</h2>
          <p className="reg-visual-desc">
            Desbloqueie unidades, ganhe XP e veja sua evolução em tempo real.
          </p>
          <div className="reg-steps-wrap">
            {[
              "Faça o diagnóstico inicial",
              "Assista a demonstração",
              "Resolva as questões",
              "Acompanhe seu progresso",
            ].map((label, i) => (
              <div key={i} className="reg-step">
                <div className="reg-step-num">{i + 1}</div>
                <span className="reg-step-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
