import { Link } from "react-router-dom";
import calculadora from "../../assets/calculadora.png";
import "./Home.css";

const FEATURES = [
  {
    title: "Exercícios contextualizados",
    desc: "Problemas do cotidiano que tornam a matemática relevante e interessante para o aluno.",
  },
  {
    title: "Progresso visível",
    desc: "Dashboard com métricas de desempenho, XP acumulado e histórico por módulo.",
  },
  {
    title: "Dicas inteligentes",
    desc: "Sistema de dicas que orienta sem entregar a resposta, desenvolvendo o raciocínio.",
  },
  {
    title: "Progressão por domínio",
    desc: "Próxima unidade liberada somente após 80% de aproveitamento na atual.",
  },
];

const STATS = [
  { value: "4",    label: "Unidades" },
  { value: "24+",  label: "Questões" },
  { value: "100%", label: "Gratuito" },
  { value: "6º",   label: "Ano EF" },
];

const MOCK_OPTIONS = ["6", "9", "8", "12"];

export default function Home() {
  return (
    <div className="home-page">

      {/* ── Navbar ── */}
      <header className="home-navbar">
        <div className="home-nav-inner">
          <Link to="/" className="home-brand">
            <div className="home-brand-icon"><img src={calculadora} alt="MathQuestion logo" className="home-brand-img" /></div>
            <span className="home-brand-text">MathQuestion</span>
          </Link>

          <nav className="home-nav-links">
            <a href="#recursos" className="home-nav-link">Recursos</a>
            <Link to="/sobre"   className="home-nav-link">Sobre</Link>
          </nav>

          <div className="home-nav-actions">
            <Link to="/login">
              <button className="btn-ghost" style={{ padding: "9px 20px", fontSize: 14 }}>
                Entrar
              </button>
            </Link>
            <Link to="/cadastro">
              <button className="btn-primary" style={{ width: "auto", padding: "9px 20px", fontSize: 14 }}>
                Cadastrar
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-content">
            <div className="home-hero-badge">✨ Plataforma educacional gratuita</div>
            <h1 className="home-hero-title">
              Para cada aluno, o domínio da{" "}
              <span className="home-hero-highlight">matemática.</span>
            </h1>
            <p className="home-hero-desc">
              Exercícios progressivos, contextualizados e gamificados para alunos
              do 6º ano. Aprenda no seu ritmo, ganhe XP e acompanhe sua evolução.
            </p>
            <div className="home-hero-cta">
              <Link to="/cadastro">
                <button className="btn-primary" style={{ width: "auto", padding: "14px 32px", fontSize: 16 }}>
                  Começar agora →
                </button>
              </Link>
              <Link to="/login">
                <button className="btn-outline" style={{ padding: "14px 28px", fontSize: 15 }}>
                  Já tenho conta
                </button>
              </Link>
            </div>
          </div>

          {/* Mock card */}
          <div className="home-hero-visual">
            <div className="home-hero-card">
              <div className="home-hero-card-top">
                <span>⚡</span>
                <span className="home-hero-card-title">Unidade 2 — Potenciação</span>
              </div>
              <div className="home-hero-question">
                <p className="home-hero-q-text">Quanto é 3² (3 ao quadrado)?</p>
              </div>
              <div className="home-hero-options">
                {MOCK_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    className="home-hero-opt"
                    style={{
                      background: opt === "9" ? "#2563EB" : "#f1f5f9",
                      color:      opt === "9" ? "#fff"    : "#475569",
                      fontWeight: opt === "9" ? 700       : 500,
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
              <div className="home-hero-xp">
                <span className="home-hero-xp-badge">+15 XP ⭐</span>
                <span className="home-hero-xp-correct">✅ Correto!</span>
              </div>
            </div>

            <div className="home-float-badge" style={{ top: 0, right: -16 }}>
              <strong>92%</strong> de aproveitamento
            </div>
            <div className="home-float-badge" style={{ bottom: 40, left: -24 }}>
              <strong>340 XP</strong> acumulados
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="home-stats-row">
          {STATS.map((st) => (
            <div key={st.label} className="home-stat-item">
              <span className="home-stat-value">{st.value}</span>
              <span className="home-stat-label">{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="recursos" className="home-features">
        <div className="home-section-inner">
          <h2 className="home-section-title">Tudo que o aluno precisa para evoluir</h2>
          <p className="home-section-sub">
            A MathQuestion combina design instrucional com gamificação leve para
            manter a motivação sem distrações.
          </p>
          <div className="home-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="home-feature-card">
                <h3 className="home-feature-title">{f.title}</h3>
                <p className="home-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="home-cta-band">
        <div className="home-cta-inner">
          <h2 className="home-cta-title">Pronto para começar?</h2>
          <p className="home-cta-sub">
            Crie sua conta gratuita e comece a praticar agora mesmo.
          </p>
          <Link to="/cadastro">
            <button className="home-cta-btn">
              Criar conta gratuita →
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <span className="home-footer-brand"><img src={calculadora} alt="" className="home-footer-img" /> MathQuestion</span>
          <span className="home-footer-note">
            Plataforma educacional para o 6º ano do Ensino Fundamental.
          </span>
        </div>
      </footer>

    </div>
  );
}
