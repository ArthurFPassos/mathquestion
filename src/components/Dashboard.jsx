import React from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { UNITS } from "../data/units";
import { logoutStudent } from "../firebase/firebaseService";
import {
  getUnitProgress,
  isUnitUnlocked,
  getOverallAvg,
  getAvgTimeMs,
  formatTime,
  downloadReportPDF,
} from "../utilis/helpers";
import Scratchpad from "./Scratchpad";

// ── Asset imports — PNG images from src/assets/ ──────────────────────────────
// Vite resolves these at build time. Make sure the files exist in src/assets/.
import imgXP        from "../assets/xp.png";
import imgProgresso from "../assets/progresso.png";
import imgQuestao   from "../assets/questao.png";
import imgRelogio   from "../assets/relogio.png";
import imgRevisao   from "../assets/revisao.png";
import imgCalculadora from "../assets/calculadora.png";
import "./Dashboard.css";

// Map name → imported PNG
const ASSET_MAP = {
  xp:        imgXP,
  progresso: imgProgresso,
  questao:   imgQuestao,
  relogio:   imgRelogio,
  revisao:   imgRevisao,
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
        <AssetIcon name={imgSrc} size={36} alt={label} />
      </div>
      <div className="db-stat-value" style={{ color: accentColor || undefined }}>
        {value}
      </div>
      <div className="db-stat-label">{label}</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutStudent(); } catch (_) {}
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const toReview = () =>
    navigate("/revisao", { state: { fromDiagnostic: false } });

  const avg           = getOverallAvg(state.moduleResults);
  const avgTime       = getAvgTimeMs(state.moduleResults);
  const totalAnswered = Object.values(state.moduleResults).reduce(
    (s, r) => s + (r.total || 0), 0
  );
  const allModules   = UNITS.flatMap((u) => u.modules);
  const allCompleted = allModules.every(
    (m) => state.moduleResults[m.id]?.completed && state.moduleResults[m.id]?.score >= 0.8
  );

  const diagScore = Math.min(state.firstDiagnosticScore ?? state.diagnosticScore ?? 0, 1);
  const diagDone  = state.firstDiagnosticDone ?? state.diagnosticDone ?? false;

  // Banner de revisão: só aparece automaticamente se aluno falhou no diagnóstico
  // e nunca foi à tela de revisão. Começa fechado por padrão.
  const [reviewBannerVisible, setReviewBannerVisible] = React.useState(
    () => state.wentToReview && !state.secondDiagnosticDone
  );

  return (
    <div className="db-page">
      {state.scratchpadOpen && <Scratchpad />}

      {/* ── Header ── */}
      <div className="db-header">
        <div>
          <h1>Olá, {state.user?.name || state.studentName || "Aluno"}!</h1>
          <p className="db-header-subtitle">
            {allCompleted
              ? "Você completou todas as unidades!"
              : "Continue seu progresso abaixo."}
          </p>
        </div>
        <div className="db-header-actions">
          <button className="db-btn-sm db-btn-sm--review" onClick={toReview}>
            <AssetIcon name="revisao" size={14} />
            Revisão
          </button>
          <button className="db-btn-sm" onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}>
            Rascunho
          </button>
          <button className="db-btn-sm db-btn-sm--report" onClick={() => downloadReportPDF(state)}>
            📄 PDF
          </button>
          <button className="db-btn-sm db-btn-sm--logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>

      {/* ── Stats — asset images substituem emojis ── */}
      <div className="db-stats-grid">
        <StatCard
          imgSrc="xp"
          label="Total XP"      value={`${state.totalXP} pts`}
          accentColor="#2563eb"
        />
        <StatCard
          imgSrc="progresso"
          label="Média Geral"   value={`${(avg * 100).toFixed(0)}%`}
        />
        <StatCard
          imgSrc="questao"
          label="Questões"      value={totalAnswered}
        />
        <StatCard
          imgSrc="relogio"
          label="Tempo Médio"   value={formatTime(avgTime)}
        />
      </div>

      {/* ── Review banner — dismissible (item 4 fix) ── */}
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
            <button className="db-review-banner-btn" onClick={toReview}>
              Ver material →
            </button>
            <button
              className="db-review-banner-close"
              onClick={() => setReviewBannerVisible(false)}
              aria-label="Fechar banner de revisão"
              title="Fechar"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Diagnostic banners ── */}
      {diagDone && (
        <div className={`db-banner ${diagScore >= 0.6 ? "db-banner--pass" : "db-banner--fail"}`}>
          Diagnóstico inicial:{" "}
          <strong>{(diagScore * 100).toFixed(0)}%</strong> de acertos
          {diagScore < 0.6 && (
            <button className="db-diag-review-link" onClick={toReview}>
              Ver revisão
            </button>
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

      {/* Banners de conclusão removidos — informação disponível nos cards de unidade */}

      {/* ── Units ── */}
      {UNITS.map((unit) => {
        const unlocked = isUnitUnlocked(unit.id, state.moduleResults);
        const unitPct  = getUnitProgress(unit.id, state.moduleResults);
        const isUnit1  = unit.id === 1;

        return (
          <div
            key={unit.id}
            className={`db-unit-card${unlocked ? "" : " db-unit-card--locked"}`}
          >
            <div className="db-unit-header">
              {/* Ícone da unidade — revisao.png para todas, cadeado se bloqueada */}
              <div
                className="db-unit-icon-box"
                style={{ background: unit.light }}
              >
                {unlocked ? (
                  <AssetIcon name="revisao" size={28} />
                ) : (
                  <span className="db-unit-lock" aria-label="Bloqueada">🔒</span>
                )}
              </div>

              <div className="db-unit-meta">
                <div className="db-unit-title-row">
                  <h3 className="db-unit-title">
                    Unidade {unit.id}: {unit.title}
                  </h3>
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

            {/* Atalho de revisão — revisao.png substitui emoji 📚 */}
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

            {/* Module list */}
            {unlocked ? (
              <div className="db-module-list">
                {unit.modules.map((mod) => {
                  const result = state.moduleResults[mod.id];
                  const done   = result?.completed;
                  const passed = done && result.score >= 0.8;

                  const demoComplete = !!state.demoCompleted?.[unit.id];
                  const needsDemo    = !done && !demoComplete;

                  const handleModuleClick = () => {
                    dispatch({ type: "START_MODULE", payload: mod.id });
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
                          <span className="db-demo-required-badge">
                            Demo obrigatória
                          </span>
                        )}
                      </div>

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
                        {needsDemo
                          ? "Ver Demonstração"
                          : done
                            ? passed ? "Refazer" : "Tentar novamente"
                            : "Iniciar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="db-locked-msg">
                Complete 80% da unidade anterior para desbloquear.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
