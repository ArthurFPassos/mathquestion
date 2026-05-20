import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { UNITS } from "../../data/units";
import {
  logoutStudent,
  findModuleByCode,
  addExtraModuleToStudent,
  loadExtraModules,
} from "../../services/firebaseService";
import {
  getUnitProgress,
  isUnitUnlocked,
  getOverallAvg,
  getAvgTimeMs,
  formatTime,
  downloadReportPDF,
} from "../../services/helpers";
import { downloadModuleReportFromDashboard } from "../../services/moduleReportService";
import Scratchpad from "../../components/shared/Scratchpad";
import imgXP          from "../../assets/xp.png";
import imgProgresso   from "../../assets/progresso.png";
import imgQuestao     from "../../assets/questao.png";
import imgRelogio     from "../../assets/relogio.png";
import imgRevisao     from "../../assets/revisao.png";
import imgCalculadora from "../../assets/calculadora.png";
import "./Dashboard.css";

// ─── Asset map ────────────────────────────────────────────────────────────────

const ASSET_MAP = {
  xp:          imgXP,
  progresso:   imgProgresso,
  questao:     imgQuestao,
  relogio:     imgRelogio,
  revisao:     imgRevisao,
  calculadora: imgCalculadora,
};

function AssetIcon({ name, size = 32, alt = "" }) {
  const src = ASSET_MAP[name];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
    />
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ imgSrc, label, value, accentColor }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-icon">
        <AssetIcon name={imgSrc} size={28} alt={label} />
      </div>
      <div className="db-stat-value" style={{ color: accentColor || undefined }}>
        {value}
      </div>
      <div className="db-stat-label">{label}</div>
    </div>
  );
}

// ─── Inline SVG icons para sidebar ───────────────────────────────────────────

function IconBook({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}
function IconEdit({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconFile({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function IconLogout({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const navigate            = useNavigate();

  // ── Stats ──────────────────────────────────────────────────────────────────
  const avg           = getOverallAvg(state.moduleResults);
  const avgTime       = getAvgTimeMs(state.moduleResults);
  const totalAnswered = Object.values(state.moduleResults).reduce(
    (s, r) => s + (r.total || 0), 0
  );
  const allModules   = UNITS.flatMap((u) => u.modules);
  const allCompleted = allModules.every(
    (m) => state.moduleResults[m.id]?.completed && state.moduleResults[m.id]?.score >= 0.8
  );

  const diagScore = Math.min(state.firstDiagnosticScore ?? 0, 1);
  const diagDone  = state.firstDiagnosticDone ?? false;

  // ── UI state ───────────────────────────────────────────────────────────────
  const [reviewBannerVisible, setReviewBannerVisible] = useState(
    () => state.wentToReview && !state.secondDiagnosticDone
  );

  // ── RF28: Módulo extra ─────────────────────────────────────────────────────
  const [extraCode,    setExtraCode]    = useState("");
  const [extraLoading, setExtraLoading] = useState(false);
  const [extraError,   setExtraError]   = useState("");
  const [extraSuccess, setExtraSuccess] = useState("");
  const [extraModules, setExtraModules] = useState([]);

  useEffect(() => {
    const uid = state.user?.uid;
    if (!uid) return;
    loadExtraModules(uid).then(setExtraModules).catch(() => {});
  }, [state.user?.uid]);

  const handleAddExtraModule = async () => {
    const code = extraCode.trim().toUpperCase();
    if (!code) return;
    setExtraError("");
    setExtraSuccess("");
    setExtraLoading(true);
    try {
      const mod = await findModuleByCode(code);
      if (!mod) {
        setExtraError("Módulo não encontrado.");
      } else if (extraModules.some((m) => m.code === code)) {
        setExtraError("Você já adicionou este módulo.");
      } else {
        await addExtraModuleToStudent(state.user.uid, code);
        setExtraModules((prev) => [...prev, mod]);
        setExtraSuccess(`Módulo "${mod.title}" adicionado com sucesso!`);
        setExtraCode("");
      }
    } catch {
      setExtraError("Erro ao buscar módulo. Tente novamente.");
    } finally {
      setExtraLoading(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await logoutStudent(); } catch (_) {}
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const toReview = () => navigate("/revisao", { state: { fromDiagnostic: false } });

  const studentName = state.user?.name || "Aluno";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="db-page">
      {state.scratchpadOpen && <Scratchpad />}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className="db-sidebar">
        {/* Brand */}
        <div className="db-sidebar-brand">
          <div className="db-brand-icon">M</div>
          <span className="db-brand-name">MathQ</span>
        </div>

        {/* Perfil */}
        <div className="db-sidebar-profile">
          <div className="db-profile-avatar">{studentName.charAt(0)}</div>
          <div>
            <p className="db-profile-name">{studentName}</p>
            <p className="db-profile-role">Aluno</p>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="db-sidebar-actions">
          <button
            className="db-sidebar-action-btn db-sidebar-action-btn--blue"
            onClick={toReview}
          >
            <AssetIcon name="revisao" size={15} alt="Revisão" />
            Material de Revisão
          </button>

          <button
            className="db-sidebar-action-btn"
            onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}
          >
            <IconEdit size={15} />
            Rascunho
          </button>

          <button
            className="db-sidebar-action-btn db-sidebar-action-btn--green"
            onClick={() => downloadReportPDF(state)}
          >
            <IconFile size={15} />
            Baixar PDF Geral
          </button>
        </div>

        {/* Logout */}
        <button className="db-sidebar-logout" onClick={handleLogout}>
          <IconLogout size={15} />
          Sair
        </button>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <main className="db-main">

        {/* Header */}
        <div className="db-main-header">
          <div>
            <h1>Olá, {studentName}!</h1>
            <p className="db-header-subtitle">
              {allCompleted
                ? "Você completou todas as unidades! 🎉"
                : "Continue seu progresso abaixo."}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="db-stats-grid">
          <StatCard imgSrc="xp"        label="Total XP"    value={`${state.totalXP} pts`} accentColor="#2563eb" />
          <StatCard imgSrc="progresso" label="Média Geral" value={`${(avg * 100).toFixed(0)}%`} />
          <StatCard imgSrc="questao"   label="Questões"    value={totalAnswered} />
          <StatCard imgSrc="relogio"   label="Tempo Médio" value={formatTime(avgTime)} />
        </div>

        {/* RF28 — Módulo Extra */}
        <div className="db-extra-module-section">
          <div className="db-extra-module-header">
            <span className="db-extra-module-title">🔑 Módulo Extra</span>
            <span className="db-extra-module-sub">Insira o código fornecido pelo professor</span>
          </div>
          <div className="db-extra-module-input-row">
            <input
              type="text"
              className="db-extra-module-input"
              placeholder="Ex: A4X9B"
              value={extraCode}
              maxLength={5}
              onChange={(e) => {
                setExtraCode(e.target.value.toUpperCase());
                setExtraError("");
                setExtraSuccess("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAddExtraModule()}
            />
            <button
              className="db-extra-module-btn"
              onClick={handleAddExtraModule}
              disabled={extraLoading || !extraCode.trim()}
            >
              {extraLoading ? "Buscando…" : "Buscar"}
            </button>
          </div>
          {extraError   && <p className="db-extra-module-error">⚠️ {extraError}</p>}
          {extraSuccess && <p className="db-extra-module-success">✅ {extraSuccess}</p>}

          {extraModules.length > 0 && (
            <div className="db-extra-modules-list">
              {extraModules.map((mod) => (
                <div key={mod.code} className="db-extra-module-card">
                  <div className="db-extra-module-card-left">
                    <span className="db-extra-module-card-title">{mod.title}</span>
                    <span className="db-extra-module-card-meta">
                      Código: <strong>{mod.code}</strong> · {mod.questions?.length || 0} questões
                    </span>
                  </div>
                  <button
                    className="db-extra-module-start-btn"
                    onClick={() => {
                      dispatch({ type: "SET_EXTRA_MODULE", payload: mod });
                      dispatch({ type: "DEMO_WATCHED",    payload: `extra-${mod.code}` });
                      navigate("/modulo-1");
                    }}
                  >
                    Iniciar →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review banner */}
        {reviewBannerVisible && (
          <div className="db-review-banner">
            <div className="db-review-banner-left">
              <AssetIcon name="revisao" size={36} alt="Revisão" />
              <div>
                <p className="db-review-banner-title">Material de Revisão</p>
                <p className="db-review-banner-sub">
                  Consulte as explicações de soma, subtração, multiplicação, divisão,
                  potenciação e frações a qualquer momento.
                </p>
              </div>
            </div>
            <div className="db-review-banner-actions">
              <button className="db-review-banner-btn" onClick={toReview}>Ver material →</button>
              <button
                className="db-review-banner-close"
                onClick={() => setReviewBannerVisible(false)}
                aria-label="Fechar"
              >✕</button>
            </div>
          </div>
        )}

        {/* Diagnostic banners */}
        {diagDone && (
          <div className={`db-banner ${diagScore >= 0.6 ? "db-banner--pass" : "db-banner--fail"}`}>
            Diagnóstico inicial:{" "}
            <strong>{(diagScore * 100).toFixed(0)}%</strong> de acertos
            {diagScore < 0.6 && (
              <button className="db-diag-review-link" onClick={toReview}>Ver revisão</button>
            )}
          </div>
        )}

        {state.secondDiagnosticDone && (
          <div className="db-banner db-banner--info">
            2.º Diagnóstico:{" "}
            <strong>{Math.min(100, Math.round((state.secondDiagnosticScore || 0) * 100))}%</strong>{" "}
            de acertos
          </div>
        )}

        {/* Units */}
        {UNITS.map((unit) => {
          const unlocked    = isUnitUnlocked(unit.id, state.moduleResults);
          const unitPct     = getUnitProgress(unit.id, state.moduleResults);
          const isUnit1     = unit.id === 1;

          return (
            <div key={unit.id} className={`db-unit-card${unlocked ? "" : " db-unit-card--locked"}`}>
              <div className="db-unit-header">
                <div className="db-unit-icon-box" style={{ background: unit.light }}>
                  {unlocked
                    ? <AssetIcon name="revisao" size={28} />
                    : <span className="db-unit-lock" aria-label="Bloqueada">🔒</span>
                  }
                </div>
                <div className="db-unit-meta">
                  <div className="db-unit-title-row">
                    <h3 className="db-unit-title">Unidade {unit.id}: {unit.title}</h3>
                    <span className="db-unit-pct" style={{ color: unit.color }}>
                      {(unitPct * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="db-unit-desc">{unit.description}</p>
                  <div className="db-progress-track">
                    <div
                      className="db-progress-fill"
                      style={{ width: `${unitPct * 100}%`, background: unit.color }}
                    />
                  </div>
                </div>
              </div>

              {isUnit1 && unlocked && (
                <button
                  className="db-review-shortcut"
                  style={{ borderColor: unit.color + "55", color: unit.color }}
                  onClick={toReview}
                >
                  <AssetIcon name="revisao" size={18} />
                  <span>Ver Material de Revisão da Unidade 1</span>
                  <span className="db-review-shortcut-arrow">→</span>
                </button>
              )}

              {unlocked ? (
                <div className="db-module-list">
                  {unit.modules.map((mod) => {
                    const result       = state.moduleResults[mod.id];
                    const done         = result?.completed;
                    const passed       = done && result.score >= 0.8;
                    const demoComplete = !!state.demoCompleted?.[unit.id];
                    const needsDemo    = !done && !demoComplete;

                    const handleModuleClick = () => {
                      if (demoComplete) {
                        dispatch({ type: "DEMO_WATCHED", payload: mod.id });
                      } else {
                        dispatch({ type: "START_MODULE", payload: mod.id });
                      }
                      navigate("/modulo-1");
                    };

                    return (
                      <div key={mod.id} className="db-module-row">
                        <div className="db-module-info">
                          <span className="db-module-name">{mod.title}</span>
                          {done && (
                            <span
                              className="db-module-score"
                              style={{ color: passed ? "#22c55e" : "#f59e0b" }}
                            >
                              {passed ? "✓" : "!"} {(result.score * 100).toFixed(0)}%
                            </span>
                          )}
                          {needsDemo && (
                            <span className="db-demo-required-badge">Demo obrigatória</span>
                          )}
                        </div>
                        <div className="db-module-actions">
                          {done && (
                            <button
                              className="db-btn-module-pdf"
                              title="Baixar relatório do módulo"
                              onClick={() => downloadModuleReportFromDashboard({
                                moduleId:    mod.id,
                                moduleName:  mod.title,
                                unitName:    unit.title,
                                studentName: state.user?.name || "Aluno",
                                result,
                              })}
                            >
                              📄
                            </button>
                          )}
                          <button
                            className={`db-btn-module${needsDemo ? " db-btn-module--demo" : ""}`}
                            style={
                              needsDemo
                                ? { background: "#fffbeb", color: "#92400e", border: "1.5px solid #fde68a" }
                                : passed
                                  ? { background: unit.light, color: unit.color, border: `1.5px solid ${unit.color}` }
                                  : { background: unit.color, color: "#fff", border: "none" }
                            }
                            onClick={handleModuleClick}
                          >
                            {needsDemo ? "Ver Demonstração" : done ? passed ? "Refazer" : "Tentar novamente" : "Iniciar"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="db-locked-msg">Complete 80% da unidade anterior para desbloquear.</p>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}