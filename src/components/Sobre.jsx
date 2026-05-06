import { Link } from "react-router-dom";
import calculadora from "../assets/calculadora.png";
import "./Sobre.css";


const UNITS = [
  {
    id: 1,
    color: "#6366f1",
    light: "#eef2ff",
    label: "Unidade 1",
    title: "Revisão Geral",
    subtitle: "Adição · Subtração · Multiplicação · Divisão",
    description:
      "Ponto de partida para todos os alunos. Revisamos as quatro operações fundamentais com números naturais por meio de problemas do cotidiano — mercado, viagens, receitas — para que o aluno reconheça o contexto e escolha a operação correta.",
    modules: ["Adição e Subtração", "Multiplicação e Divisão"],
    skills: ["Cálculo mental", "Algoritmo da conta armada", "Resolução de problemas"],
    icon: "➕",
  },
  {
    id: 2,
    color: "#f59e0b",
    light: "#fffbeb",
    label: "Unidade 2",
    title: "Potenciação",
    subtitle: "Base · Expoente · Propriedades",
    description:
      "Introdução ao conceito de potência como multiplicação repetida. O aluno aprende a identificar base e expoente, calcular potências de 2, 3, 5 e 10, e aplica a regra especial do expoente zero.",
    modules: ["Bases e Expoentes", "Propriedades da Potenciação"],
    skills: ["Leitura e escrita de potências", "Cálculo iterativo", "Regra do expoente zero"],
    icon: "⚡",
  },
  {
    id: 3,
    color: "#10b981",
    light: "#ecfdf5",
    label: "Unidade 3",
    title: "Potenciação Avançada",
    subtitle: "Expressões · Ordem das Operações · Equações",
    description:
      "Aprofundamento com expressões que combinam potenciação e as quatro operações. O aluno pratica a hierarquia correta: parênteses → potências → multiplicação/divisão → adição/subtração.",
    modules: ["Expressões com Potências", "Ordem das Operações"],
    skills: ["Hierarquia de operações", "Expressões multi-etapas", "Área de figuras quadradas"],
    icon: "🚀",
  },
  {
    id: 4,
    color: "#ec4899",
    light: "#fdf2f8",
    label: "Unidade 4",
    title: "Frações",
    subtitle: "Adição · Subtração · Simplificação",
    description:
      "Introdução ao universo das frações com ênfase em adição e subtração. O aluno aprende a operar frações de mesmo denominador e a encontrar o MMC para unificar denominadores diferentes.",
    modules: ["Frações de Mesmo Denominador", "Frações de Denominadores Diferentes"],
    skills: ["Leitura de frações", "MMC e equivalência", "Simplificação do resultado"],
    icon: "🍕",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Avaliação Diagnóstica",
    desc: "Ao se cadastrar, o aluno responde um teste rápido que identifica o nível de conhecimento atual e personaliza o ponto de partida.",
  },
  {
    step: "02",
    title: "Demonstração Instrucional",
    desc: "Antes de cada unidade, um exemplo resolvido passo a passo guia o aluno pelo raciocínio — sem entregar a resposta das questões.",
  },
  {
    step: "03",
    title: "Exercícios Contextualizados",
    desc: "Questões de múltipla escolha e resposta aberta com enunciados do cotidiano. O aluno pode usar o rascunho digital para os cálculos.",
  },
  {
    step: "04",
    title: "Feedback Imediato e XP",
    desc: "Cada resposta recebe retorno visual instantâneo. Acertos geram pontos de XP; erros oferecem dicas orientadoras sem penalização excessiva.",
  },
  {
    step: "05",
    title: "Desbloqueio Progressivo",
    desc: "A próxima unidade só é liberada após 80% de aproveitamento na atual, garantindo que o aluno avance com domínio real do conteúdo.",
  },
  {
    step: "06",
    title: "Painel de Progresso",
    desc: "Um dashboard mostra XP acumulado, média geral, questões respondidas e tempo médio — transparência total para aluno e professor.",
  },
];

const PRINCIPLES = [
  {
    icon: "🎯",
    title: "Design Instrucional",
    desc: "Baseado nos Primeiros Princípios de Merrill: demonstração antes da prática, ativação do conhecimento prévio e aplicação em contexto real.",
  },
  {
    icon: "🧠",
    title: "Acessibilidade Cognitiva",
    desc: "Interface simplificada, espaçamento generoso e Modo Simplificado com textos mais curtos para alunos com TDAH ou dislexia.",
  },
  {
    icon: "📊",
    title: "Avaliação Contínua",
    desc: "Dois momentos diagnósticos (pré e pós-revisão) mapeiam a evolução real do aluno ao longo do uso da plataforma.",
  },
  {
    icon: "🔒",
    title: "Autonomia Guiada",
    desc: "A plataforma não substitui o professor — ela promove a autonomia do aluno dentro de uma estrutura pedagógica clara e progressiva.",
  },
];

export default function Sobre() {
  return (
    <div className="sobre-page">

      {}
      <header className="sobre-navbar">
        <div className="sobre-nav-inner">
          <Link to="/" className="sobre-brand">
            <div className="sobre-brand-icon">
              <img src={calculadora} alt="MathQuestion logo" className="sobre-brand-img" />
            </div>
            <span className="sobre-brand-text">MathQuestion</span>
          </Link>
          <div className="sobre-nav-actions">
            <Link to="/">
              <button className="btn-ghost" style={{ padding: "9px 20px", fontSize: 14 }}>
                ← Voltar
              </button>
            </Link>
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

      {}
      <section className="sobre-hero">
        <div className="sobre-hero-inner">
          <div className="sobre-hero-badge">Sobre a plataforma</div>
          <h1 className="sobre-hero-title">
            Estrutura pedagógica do{" "}
            <span className="sobre-hero-highlight">MathQuestion</span>
          </h1>
          <p className="sobre-hero-desc">
            Uma plataforma de exercícios matemáticos para alunos do 6.º ano do
            Ensino Fundamental. Conteúdo progressivo, feedback imediato e design
            pensado para o aprendizado real.
          </p>
          <div className="sobre-hero-stats">
            {[
              { v: "4",   l: "Unidades" },
              { v: "8",   l: "Módulos" },
              { v: "24+", l: "Questões" },
              { v: "6.º", l: "Ano EF" },
            ].map((s) => (
              <div key={s.l} className="sobre-stat">
                <span className="sobre-stat-value">{s.v}</span>
                <span className="sobre-stat-label">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="sobre-units-section">
        <div className="sobre-section-inner">
          <h2 className="sobre-section-title">Estrutura de Conteúdo</h2>
          <p className="sobre-section-sub">
            Quatro unidades com complexidade crescente, cada uma dividida em
            dois módulos de exercícios.
          </p>

          <div className="sobre-units-grid">
            {UNITS.map((unit) => (
              <div
                key={unit.id}
                className="sobre-unit-card"
                style={{ borderTopColor: unit.color }}
              >
                {}
                <div className="sobre-unit-header">
                  <div
                    className="sobre-unit-icon"
                    style={{ background: unit.light, color: unit.color }}
                  >
                    {unit.icon}
                  </div>
                  <div>
                    <span
                      className="sobre-unit-label"
                      style={{ color: unit.color }}
                    >
                      {unit.label}
                    </span>
                    <h3 className="sobre-unit-title">{unit.title}</h3>
                    <p className="sobre-unit-subtitle">{unit.subtitle}</p>
                  </div>
                </div>

                {}
                <p className="sobre-unit-desc">{unit.description}</p>

                {}
                <div className="sobre-unit-modules">
                  <p className="sobre-unit-modules-label">Módulos</p>
                  {unit.modules.map((m) => (
                    <div
                      key={m}
                      className="sobre-module-tag"
                      style={{ borderColor: unit.color + "44", color: unit.color }}
                    >
                      {m}
                    </div>
                  ))}
                </div>

                {}
                <div className="sobre-unit-skills">
                  <p className="sobre-unit-modules-label">Habilidades desenvolvidas</p>
                  <ul className="sobre-skills-list">
                    {unit.skills.map((s) => (
                      <li key={s} style={{ "--dot-color": unit.color }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="sobre-how-section">
        <div className="sobre-section-inner">
          <h2 className="sobre-section-title">Como funciona</h2>
          <p className="sobre-section-sub">
            O fluxo completo desde o cadastro até a conclusão do curso.
          </p>
          <div className="sobre-how-grid">
            {HOW_IT_WORKS.map((h) => (
              <div key={h.step} className="sobre-how-card">
                <div className="sobre-how-step">{h.step}</div>
                <h3 className="sobre-how-title">{h.title}</h3>
                <p className="sobre-how-desc">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="sobre-principles-section">
        <div className="sobre-section-inner">
          <h2 className="sobre-section-title sobre-section-title--white">
            Princípios pedagógicos
          </h2>
          <p className="sobre-section-sub sobre-section-sub--white">
            As bases teóricas e de design que guiam cada decisão da plataforma.
          </p>
          <div className="sobre-principles-grid">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="sobre-principle-card">
                <span className="sobre-principle-icon">{p.icon}</span>
                <h3 className="sobre-principle-title">{p.title}</h3>
                <p className="sobre-principle-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="sobre-cta">
        <h2 className="sobre-cta-title">Pronto para começar?</h2>
        <p className="sobre-cta-desc">
          Crie sua conta gratuita e faça a avaliação diagnóstica agora.
        </p>
        <Link to="/cadastro">
          <button className="sobre-cta-btn">
            Criar conta gratuita →
          </button>
        </Link>
      </section>

      {}
      <footer className="sobre-footer">
        <div className="sobre-footer-inner">
          <span className="sobre-footer-brand">
            <img src={calculadora} alt="" className="sobre-footer-img" />
            MathQuestion
          </span>
          <span className="sobre-footer-note">
            Plataforma educacional para o 6.º ano do Ensino Fundamental.
          </span>
        </div>
      </footer>

    </div>
  );
}
