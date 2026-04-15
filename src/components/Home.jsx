import { Link } from "react-router-dom";

// ─── Feature card data ────────────────────────────────────────────────────────

const features = [
  {
    icon: "🎯",
    title: "Exercícios contextualizados",
    desc: "Problemas do cotidiano que tornam a matemática relevante e interessante para o aluno.",
  },
  {
    icon: "📈",
    title: "Progresso visível",
    desc: "Dashboard com métricas de desempenho, XP acumulado e histórico por módulo.",
  },
  {
    icon: "💡",
    title: "Dicas inteligentes",
    desc: "Sistema de dicas que orienta sem entregar a resposta, desenvolvendo o raciocínio.",
  },
  {
    icon: "🔒",
    title: "Progressão por domínio",
    desc: "Próxima unidade liberada somente após 80% de aproveitamento na atual.",
  },
];

const stats = [
  { value: "4", label: "Unidades" },
  { value: "24+", label: "Questões" },
  { value: "100%", label: "Gratuito" },
  { value: "6º", label: "Ano EF" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div style={s.page}>

      {/* ── Navbar ── */}
      <header style={s.navbar}>
        <div style={s.navInner}>
          <Link to="/" style={s.brand}>
            <div style={s.brandIcon}>🧮</div>
            <span style={s.brandText}>MathQuestion</span>
          </Link>

          <nav style={s.navLinks}>
            <a href="#recursos" style={s.navLink}>Recursos</a>
            <a href="#sobre" style={s.navLink}>Sobre</a>
          </nav>

          <div style={s.navActions}>
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
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroContent}>
            <div style={s.heroBadge}>✨ Plataforma educacional gratuita</div>
            <h1 style={s.heroTitle}>
              Para cada aluno, o domínio da{" "}
              <span style={s.heroHighlight}>matemática.</span>
            </h1>
            <p style={s.heroDesc}>
              Exercícios progressivos, contextualizados e gamificados para alunos
              do 6º ano do Ensino Fundamental. Aprenda no seu ritmo, ganhe XP e
              acompanhe sua evolução.
            </p>
            <div style={s.heroCta}>
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

          {/* Hero visual */}
          <div style={s.heroVisual}>
            <div style={s.heroCard}>
              <div style={s.heroCardTop}>
                <span style={{ fontSize: 22 }}>⚡</span>
                <span style={s.heroCardTitle}>Unidade 2 — Potenciação</span>
              </div>
              <div style={s.heroQuestion}>
                <p style={s.heroQText}>Quanto é 3² (3 ao quadrado)?</p>
              </div>
              <div style={s.heroOptions}>
                {["6", "9", "8", "12"].map((opt, i) => (
                  <div
                    key={i}
                    style={{
                      ...s.heroOpt,
                      background: opt === "9" ? "#2563EB" : "#F1F5F9",
                      color: opt === "9" ? "#fff" : "#475569",
                      fontWeight: opt === "9" ? 700 : 500,
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
              <div style={s.heroXP}>
                <span style={s.heroXPBadge}>+15 XP ⭐</span>
                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>✅ Correto!</span>
              </div>
            </div>

            {/* Floating badges */}
            <div style={{ ...s.floatBadge, top: 0, right: -16 }}>
              📊 <strong>92%</strong> de aproveitamento
            </div>
            <div style={{ ...s.floatBadge, bottom: 40, left: -24 }}>
              🏆 <strong>340 XP</strong> acumulados
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={s.statsRow}>
          {stats.map((st, i) => (
            <div key={i} style={s.statItem}>
              <span style={s.statValue}>{st.value}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="recursos" style={s.features}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>Tudo que o aluno precisa para evoluir</h2>
          <p style={s.sectionSub}>
            A MathQuestion combina design instrucional com gamificação leve para
            manter a motivação sem distrações.
          </p>
          <div style={s.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section style={s.ctaBand}>
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>Pronto para começar?</h2>
          <p style={s.ctaSub}>
            Crie sua conta gratuita e comece a praticar agora mesmo.
          </p>
          <Link to="/cadastro">
            <button
              className="btn-primary"
              style={{ width: "auto", padding: "14px 36px", fontSize: 16, background: "#fff", color: "#2563EB" }}
            >
              Criar conta gratuita →
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerBrand}>🧮 MathQuestion</span>
          <span style={s.footerNote}>
            Plataforma educacional para o 6º ano do Ensino Fundamental.
          </span>
        </div>
      </footer>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  page: { minHeight: "100vh", background: "#fff" },

  // Navbar
  navbar: {
    position: "sticky",
    top: 0,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid #E2E8F0",
    zIndex: 100,
  },
  navInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 24px",
    height: 64,
    display: "flex",
    alignItems: "center",
    gap: 32,
  },
  brand: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" },
  brandIcon: {
    width: 34, height: 34, background: "#2563EB",
    borderRadius: 8, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 18,
  },
  brandText: { fontSize: 17, fontWeight: 800, color: "#0F172A" },
  navLinks: { display: "flex", gap: 28, flex: 1 },
  navLink: { fontSize: 14, fontWeight: 500, color: "#475569", transition: "color 0.15s" },
  navActions: { display: "flex", gap: 10 },

  // Hero
  hero: {
    background: "linear-gradient(180deg, #EFF6FF 0%, #fff 100%)",
    padding: "72px 24px 56px",
  },
  heroInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 64,
    alignItems: "center",
    marginBottom: 56,
  },
  heroContent: {},
  heroBadge: {
    display: "inline-block",
    background: "#DBEAFE",
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: 700,
    padding: "6px 14px",
    borderRadius: 99,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: 800,
    color: "#0F172A",
    lineHeight: 1.18,
    marginBottom: 18,
  },
  heroHighlight: { color: "#2563EB" },
  heroDesc: {
    fontSize: 17,
    color: "#475569",
    lineHeight: 1.7,
    marginBottom: 32,
    maxWidth: 480,
  },
  heroCta: { display: "flex", gap: 14, flexWrap: "wrap" },

  // Hero card (mockup)
  heroVisual: { position: "relative", paddingRight: 24 },
  heroCard: {
    background: "#fff",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 20px 60px rgba(37,99,235,0.14)",
    border: "1px solid #E2E8F0",
  },
  heroCardTop: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
  },
  heroCardTitle: { fontSize: 13, fontWeight: 700, color: "#64748b" },
  heroQuestion: {
    background: "#F8FAFC",
    borderRadius: 12,
    padding: "14px 18px",
    marginBottom: 14,
    border: "1.5px solid #E2E8F0",
  },
  heroQText: { fontSize: 15, color: "#1e293b", lineHeight: 1.6, margin: 0 },
  heroOptions: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14,
  },
  heroOpt: {
    padding: "10px 14px", borderRadius: 10, fontSize: 15,
    textAlign: "center", transition: "all 0.15s",
  },
  heroXP: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  heroXPBadge: {
    background: "#FFFBEB", color: "#92400E",
    fontSize: 12, fontWeight: 700,
    padding: "4px 10px", borderRadius: 99,
  },
  floatBadge: {
    position: "absolute",
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 500,
    color: "#334155",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    whiteSpace: "nowrap",
  },

  // Stats
  statsRow: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
    gap: 48,
    flexWrap: "wrap",
  },
  statItem: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4,
  },
  statValue: { fontSize: 28, fontWeight: 800, color: "#2563EB" },
  statLabel: { fontSize: 13, color: "#64748b", fontWeight: 500 },

  // Features
  features: { padding: "80px 24px", background: "#fff" },
  sectionInner: { maxWidth: 1100, margin: "0 auto" },
  sectionTitle: {
    fontSize: 32, fontWeight: 800, color: "#0F172A",
    textAlign: "center", marginBottom: 12,
  },
  sectionSub: {
    fontSize: 16, color: "#475569", textAlign: "center",
    maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.65,
  },
  featuresGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24,
  },
  featureCard: {
    background: "#F8FAFC",
    border: "1.5px solid #E2E8F0",
    borderRadius: 16,
    padding: "24px 22px",
    transition: "box-shadow 0.2s",
  },
  featureIcon: {
    fontSize: 28, marginBottom: 14,
    width: 52, height: 52,
    background: "#EFF6FF", borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  featureTitle: { fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 8 },
  featureDesc: { fontSize: 14, color: "#475569", lineHeight: 1.65 },

  // CTA band
  ctaBand: {
    background: "linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)",
    padding: "72px 24px",
    textAlign: "center",
  },
  ctaInner: { maxWidth: 600, margin: "0 auto" },
  ctaTitle: { fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 12 },
  ctaSub: { fontSize: 16, color: "#BFDBFE", marginBottom: 32, lineHeight: 1.6 },

  // Footer
  footer: {
    background: "#0F172A",
    padding: "24px",
  },
  footerInner: {
    maxWidth: 1100, margin: "0 auto",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", flexWrap: "wrap", gap: 12,
  },
  footerBrand: { fontSize: 15, fontWeight: 700, color: "#fff" },
  footerNote: { fontSize: 13, color: "#64748b" },
};
