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

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const avg = getOverallAvg(state.moduleResults);
  const avgTime = getAvgTimeMs(state.moduleResults);

  const totalAnswered = Object.values(state.moduleResults).reduce(
    (s, r) => s + (r.total || 0),
    0
  );
  const totalCorrect = Object.values(state.moduleResults).reduce(
    (s, r) => s + (r.correct || 0),
    0
  );

  const allModules = UNITS.flatMap((u) => u.modules);
  const allCompleted = allModules.every(
    (m) =>
      state.moduleResults[m.id]?.completed &&
      state.moduleResults[m.id]?.score >= 0.8
  );

  return (
    <div style={styles.page}>
      {state.scratchpadOpen && <Scratchpad />}

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Olá, {state.studentName || "Aluno"}! 👋</h1>
          <p style={styles.subtitle}>
            {allCompleted
              ? "🎉 Você completou todas as unidades!"
              : "Continue seu progresso abaixo."}
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}
            style={styles.btnSm}
          >
            ✏️ Rascunho
          </button>
          <button
            onClick={() => downloadReport(state)}
            style={{ ...styles.btnSm, background: "#eff6ff", color: "#3b82f6" }}
          >
            ⬇ Relatório JSON
          </button>
          <button
            onClick={handleLogout}
            style={{ ...styles.btnSm, background: "#fef2f2", color: "#ef4444" }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={styles.statsGrid}>
        <StatCard icon="⭐" label="Total XP" value={`${state.totalXP} pts`} />
        <StatCard
          icon="📊"
          label="Média Geral"
          value={`${(avg * 100).toFixed(0)}%`}
        />
        <StatCard icon="📝" label="Questões" value={totalAnswered} />
        <StatCard icon="⏱" label="Tempo Médio" value={formatTime(avgTime)} />
      </div>

      {/* ── Diagnostic banner ── */}
      {state.diagnosticDone && (
        <div style={styles.infoBanner}>
          🩺 Diagnóstico inicial:{" "}
          <strong>{(state.diagnosticScore * 100).toFixed(0)}%</strong> de
          acertos
        </div>
      )}

      {/* ── Completion banners (RF11) ── */}
      {allCompleted && avg >= 0.9 && (
        <div style={styles.successBanner}>
          🏆 Parabéns! Você concluiu o curso com média de{" "}
          <strong>{(avg * 100).toFixed(0)}%</strong>! Excelente desempenho!
        </div>
      )}
      {allCompleted && avg < 0.9 && (
        <div style={styles.warningBanner}>
          Você completou todos os módulos! Sua média foi{" "}
          <strong>{(avg * 100).toFixed(0)}%</strong>. Refaça alguns módulos para
          alcançar 90% e receber a conclusão! 🎯
        </div>
      )}

      {/* ── Units ── */}
      {UNITS.map((unit) => {
        const unlocked = isUnitUnlocked(unit.id, state.moduleResults);
        const unitPct = getUnitProgress(unit.id, state.moduleResults);

        return (
          <div
            key={unit.id}
            style={{ ...styles.unitCard, opacity: unlocked ? 1 : 0.55 }}
          >
            {/* Unit header */}
            <div style={styles.unitHeader}>
              <div
                style={{
                  ...styles.unitIconBox,
                  background: unit.light,
                }}
              >
                <span style={{ fontSize: 22 }}>
                  {unlocked ? unit.emoji : "🔒"}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.unitTitleRow}>
                  <h3 style={styles.unitTitle}>
                    Unidade {unit.id}: {unit.title}
                  </h3>
                  <span style={{ ...styles.unitPct, color: unit.color }}>
                    {(unitPct * 100).toFixed(0)}%
                  </span>
                </div>
                <p style={styles.unitDesc}>{unit.description}</p>
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${unitPct * 100}%`,
                      background: unit.color,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Module list */}
            {unlocked ? (
              <div style={styles.moduleList}>
                {unit.modules.map((mod) => {
                  const result = state.moduleResults[mod.id];
                  const done = result?.completed;
                  const passed = done && result.score >= 0.8;

                  return (
                    <div key={mod.id} style={styles.moduleRow}>
                      <div style={styles.moduleInfo}>
                        <span style={styles.moduleName}>{mod.title}</span>
                        {done && (
                          <span
                            style={{
                              ...styles.moduleScore,
                              color: passed ? "#22c55e" : "#f59e0b",
                            }}
                          >
                            {passed ? "✅" : "⚠️"}{" "}
                            {(result.score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      {/* RF12 – redo allowed, updates avg if better */}
                      <button
                        onClick={() =>
                          dispatch({ type: "START_MODULE", payload: mod.id })
                        }
                        style={{
                          ...styles.btnModule,
                          background: passed ? unit.light : unit.color,
                          color: passed ? unit.color : "#fff",
                          border: passed ? `1.5px solid ${unit.color}` : "none",
                        }}
                      >
                        {done
                          ? passed
                            ? "Refazer"
                            : "Tentar novamente"
                          : "Iniciar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={styles.lockedMsg}>
                Complete 80% da unidade anterior para desbloquear.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "28px 16px 48px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  h1: {
    fontSize: 24,
    fontWeight: 800,
    color: "#1e293b",
    margin: "0 0 4px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  btnSm: {
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    background: "#f8fafc",
    borderRadius: 14,
    padding: "14px 12px",
    textAlign: "center",
    border: "1px solid #f1f5f9",
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 700, color: "#1e293b" },
  statLabel: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  infoBanner: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 14,
    color: "#1d4ed8",
    marginBottom: 16,
  },
  successBanner: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 14,
    color: "#15803d",
    fontWeight: 600,
    marginBottom: 16,
  },
  warningBanner: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 14,
    color: "#92400e",
    marginBottom: 16,
  },
  unitCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #f1f5f9",
    marginBottom: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  unitHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 12,
  },
  unitIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  unitTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  unitTitle: {
    fontWeight: 700,
    fontSize: 15,
    color: "#1e293b",
    margin: 0,
  },
  unitPct: {
    fontSize: 13,
    fontWeight: 700,
  },
  unitDesc: {
    fontSize: 12,
    color: "#64748b",
    margin: "3px 0 8px",
  },
  progressTrack: {
    background: "#f1f5f9",
    borderRadius: 99,
    height: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: 5,
    borderRadius: 99,
    transition: "width 0.4s ease",
  },
  moduleList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingLeft: 60,
  },
  moduleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f8fafc",
    borderRadius: 10,
    padding: "10px 14px",
    gap: 10,
  },
  moduleInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  moduleName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#334155",
  },
  moduleScore: {
    fontSize: 12,
    fontWeight: 700,
  },
  btnModule: {
    padding: "6px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
  },
  lockedMsg: {
    fontSize: 12,
    color: "#94a3b8",
    paddingLeft: 60,
    margin: "8px 0 0",
  },
};
