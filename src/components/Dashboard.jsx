import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { UNITS } from "../data/units";
import {
  getUnitProgress,
  isUnitUnlocked,
  getOverallAvg,
  getAvgTimeMs,
  formatTime,
  downloadReport,
} from "../utilis/helpers";
import Scratchpad from "./Scratchpad";
import "./Dashboard.css";

function StatCard({ icon, label, value, accentColor }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-icon">{icon}</div>
      <div className="db-stat-value" style={{ color: accentColor || undefined }}>
        {value}
      </div>
      <div className="db-stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const toReview = () =>
    navigate("/revisao", { state: { fromDiagnostic: false } });

  const avg           = getOverallAvg(state.moduleResults);
  const avgTime       = getAvgTimeMs(state.moduleResults);
  const totalAnswered = Object.values(state.moduleResults).reduce((s, r) => s + (r.total   || 0), 0);
  const allModules    = UNITS.flatMap((u) => u.modules);
  const allCompleted  = allModules.every(
    (m) => state.moduleResults[m.id]?.completed && state.moduleResults[m.id]?.score >= 0.8
  );

  // Cap at 1.0 to guard against legacy state issues
  const diagScore = Math.min(state.firstDiagnosticScore ?? state.diagnosticScore ?? 0, 1);
  const diagDone  = state.firstDiagnosticDone ?? state.diagnosticDone ?? false;

  return (
    <div className="db-page">
      {state.scratchpadOpen && <Scratchpad />}

      {/* ── Header ── */}
      <div className="db-header">
        <div>
          <h1>Olá, {state.user?.name || state.studentName || "Aluno"}! 👋</h1>
          <p className="db-header-subtitle">
            {allCompleted
              ? "🎉 Você completou todas as unidades!"
              : "Continue seu progresso abaixo."}
          </p>
        </div>
        <div className="db-header-actions">
          <button className="db-btn-sm db-btn-sm--review" onClick={toReview}>
            📚 Revisão
          </button>
          <button className="db-btn-sm" onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}>
            ✏️ Rascunho
          </button>
          <button className="db-btn-sm db-btn-sm--report" onClick={() => downloadReport(state)}>
            ⬇ Relatório
          </button>
          <button className="db-btn-sm db-btn-sm--logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="db-stats-grid">
        <StatCard icon="⭐" label="Total XP"    value={`${state.totalXP} pts`} accentColor="#2563eb" />
        <StatCard icon="📊" label="Média Geral" value={`${(avg * 100).toFixed(0)}%`} />
        <StatCard icon="📝" label="Questões"    value={totalAnswered} />
        <StatCard icon="⏱" label="Tempo Médio" value={formatTime(avgTime)} />
      </div>

      {/* ── Review banner ── */}
      <div className="db-review-banner">
        <div className="db-review-banner-left">
          <span className="db-review-banner-icon">📖</span>
          <div>
            <p className="db-review-banner-title">Material de Revisão</p>
            <p className="db-review-banner-sub">
              Consulte as explicações de soma, subtração, multiplicação, divisão,
              potenciação e frações a qualquer momento.
            </p>
          </div>
        </div>
        <button className="db-review-banner-btn" onClick={toReview}>
          Ver material →
        </button>
      </div>

      {/* ── Diagnostic banners ── */}
      {diagDone && (
        <div
          className={`db-banner ${
            diagScore >= 0.6 ? "db-banner--pass" : "db-banner--fail"
          }`}
        >
          🩺 Diagnóstico inicial:{" "}
          <strong>{(diagScore * 100).toFixed(0)}%</strong> de acertos
          {diagScore < 0.6 && (
            <button className="db-diag-review-link" onClick={toReview}>
              → Ver revisão
            </button>
          )}
        </div>
      )}

      {state.secondDiagnosticDone && (
        <div className="db-banner db-banner--info">
          🔬 2º Diagnóstico:{" "}
          <strong>
            {((state.secondDiagnosticScore || 0) * 100).toFixed(0)}%
          </strong>{" "}
          de acertos
        </div>
      )}

      {allCompleted && avg >= 0.9 && (
        <div className="db-banner db-banner--success">
          🏆 Parabéns! Você concluiu o curso com média de{" "}
          <strong>{(avg * 100).toFixed(0)}%</strong>! Excelente desempenho!
        </div>
      )}
      {allCompleted && avg < 0.9 && (
        <div className="db-banner db-banner--warning">
          Você completou todos os módulos com média de{" "}
          <strong>{(avg * 100).toFixed(0)}%</strong>. Refaça módulos para
          alcançar 90%! 🎯
        </div>
      )}

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
              <div
                className="db-unit-icon-box"
                style={{ background: unit.light }}
              >
                {unlocked ? unit.emoji : "🔒"}
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
                    style={{
                      width: `${unitPct * 100}%`,
                      background: unit.color,
                    }}
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
                <span>📚</span>
                <span>Ver Material de Revisão da Unidade 1</span>
                <span className="db-review-shortcut-arrow">→</span>
              </button>
            )}

            {unlocked ? (
              <div className="db-module-list">
                {unit.modules.map((mod) => {
                  const result = state.moduleResults[mod.id];
                  const done   = result?.completed;
                  const passed = done && result.score >= 0.8;

                  return (
                    <div key={mod.id} className="db-module-row">
                      <div className="db-module-info">
                        <span className="db-module-name">{mod.title}</span>
                        {done && (
                          <span
                            className="db-module-score"
                            style={{ color: passed ? "#22c55e" : "#f59e0b" }}
                          >
                            {passed ? "✅" : "⚠️"}{" "}
                            {(result.score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <button
                        className="db-btn-module"
                        style={{
                          background: passed ? unit.light : unit.color,
                          color:      passed ? unit.color : "#fff",
                          border:     passed ? `1.5px solid ${unit.color}` : "none",
                        }}
                        onClick={() =>
                          dispatch({ type: "START_MODULE", payload: mod.id })
                        }
                      >
                        {done ? (passed ? "Refazer" : "Tentar novamente") : "Iniciar"}
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
