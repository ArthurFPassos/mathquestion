import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { loginStudent, loadProgress, firebaseErrorMsg, getUserRole } from "../firebase/firebaseService";
import calculadora from "../assets/calculadora.png";
import "./Login.css";

export default function Login() {
  const { dispatch } = useApp();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }
    setLoading(true);
    try {
      // 1. Autentica no Firebase Auth + busca perfil no Firestore
      const student = await loginStudent({ email: form.email, password: form.password });

      // 2. Busca o role do usuário (aluno | professor)
      const role = await getUserRole(student.uid);
      dispatch({ type: "LOGIN", payload: { ...student, role } });

      if (role === "professor") {
        navigate("/teacher-dashboard");
      } else {
        // 3. Carrega progresso salvo no Firestore (só para alunos)
        const progress = await loadProgress(student.uid);
        dispatch({ type: "LOAD_PROGRESS", payload: progress });
        navigate("/dashboard");
      }
    } catch (err) {
      setError(firebaseErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <div className="form-box">
          <div className="form-logo">
            <div className="form-logo-icon">
              <img src={calculadora} alt="MathQuestion" className="login-brand-img" />
            </div>
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

      <div className="auth-visual">
        <div className="login-visual-content">
          <img src={calculadora} alt="MathQuestion" className="login-visual-img" />
          <h2 className="login-visual-title">Continue evoluindo!</h2>
          <p className="login-visual-desc">
            Acesse seu painel, veja seu progresso e continue de onde parou.
          </p>
          <ul className="login-benefits-list">
            <li>Retome de onde parou a qualquer momento</li>
            <li>Acompanhe seu XP e progresso por unidade</li>
            <li>Revise o material de apoio quando quiser</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
