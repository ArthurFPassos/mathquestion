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



function StatCard({ icon, label, value, accent }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={{ ...styles.statValue, color: accent || "#1e293b" }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
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

  const avg          = getOverallAvg(state.moduleResults);
  const avgTime      = getAvgTimeMs(state.moduleResults);
  const totalAnswered = Object.values(state.moduleResults).reduce((s, r) => s + (r.total   || 0), 0);
  const totalCorrect  = Object.values(state.moduleResults).reduce((s, r) => s + (r.correct || 0), 0);
  const allModules    = UNITS.flatMap((u) => u.modules);
  const allCompleted  = allModules.every(
    (m) => state.moduleResults[m.id]?.completed && state.moduleResults[m.id]?.score >= 0.8
  );

  
  const diagScore     = Math.min(state.firstDiagnosticScore ?? state.diagnosticScore ?? 0, 1);
  const diagDone      = state.firstDiagnosticDone  ?? state.diagnosticDone  ?? false;

  return (
    <div style={styles.page}>
      {state.scratchpadOpen && <Scratchpad />}

      {}
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>
            Olá, {state.user?.name || state.studentName || "Aluno"}! 👋
          </h1>
          <p style={styles.subtitle}>
            {allCompleted
              ? "🎉 Você completou todas as unidades!"
              : "Continue seu progresso abaixo."}
          </p>
        </div>

        <div style={styles.headerActions}>
          {}
          <button
            onClick={() => navigate("/revisao", { state: { fromDiagnostic: false } })}
          >
            📚 Revisão
          </button>
          <button
            onClick={() => dispatch({ type: "TOGGLE_SCRATCHPAD" })}
            style={styles.btnSm}
          >
            ✏️ Rascunho
          </button>
          <button
            onClick={() => downloadReport(state)}
            style={{ ...styles.btnSm, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
          >
            ⬇ Relatório
          </button>
          <button
            onClick={handleLogout}
            style={{ ...styles.btnSm, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
          >
            Sair
          </button>
        </div>
      </div>

      {}
      <div style={styles.statsGrid}>
        <StatCard icon="⭐" label="Total XP"    value={`${state.totalXP} pts`}            accent="#2563EB" />
        <StatCard icon="📊" label="Média Geral" value={`${(avg * 100).toFixed(0)}%`} />
        <StatCard icon="📝" label="Questões"    value={totalAnswered} />
        <StatCard icon="⏱" label="Tempo Médio" value={formatTime(avgTime)} />
      </div>

      {}
      <div style={styles.reviewBanner}>
        <div style={styles.reviewBannerLeft}>
          <span style={styles.reviewBannerIcon}>📖</span>
          <div>
            <p style={styles.reviewBannerTitle}>Material de Revisão</p>
            <p style={styles.reviewBannerSub}>
              Consulte as explicações de soma, subtração, multiplicação, divisão, potenciação e frações a qualquer momento.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/revisao", { state: { fromDiagnostic: false } })}
          style={styles.reviewBannerBtn}
        >
          Ver material →
        </button>
      </div>

      {}
      {diagDone && (
        <div style={{
          ...styles.infoBanner,
          background: diagScore >= 0.6 ? "#f0fdf4" : "#fffbeb",
          borderColor: diagScore >= 0.6 ? "#86efac" : "#fde68a",
          color: diagScore >= 0.6 ? "#15803d" : "#92400e",
        }}>
          🩺 Diagnóstico inicial:{" "}
          <strong>{(diagScore * 100).toFixed(0)}%</strong> de acertos
          {diagScore < 0.6 && (
            <button
              onClick={() => navigate("/revisao", { state: { fromDiagnostic: false } })}
              style={styles.diagReviewLink}
            >
              → Ver revisão
            </button>
          )}
        </div>
      )}

      {state.secondDiagnosticDone && (
        <div style={styles.infoBanner}>
          🔬 2º Diagnóstico:{" "}
          <strong>{((state.secondDiagnosticScore || 0) * 100).toFixed(0)}%</strong> de acertos
        </div>
      )}

      {}
      {allCompleted && avg >= 0.9 && (
        <div style={styles.successBanner}>
          🏆 Parabéns! Você concluiu o curso com média de{" "}
          <strong>{(avg * 100).toFixed(0)}%</strong>! Excelente desempenho!
        </div>
      )}
      {allCompleted && avg < 0.9 && (
        <div style={styles.warningBanner}>
          Você completou todos os módulos com média de{" "}
          <strong>{(avg * 100).toFixed(0)}%</strong>. Refaça módulos para
          alcançar 90% e receber a conclusão! 🎯
        </div>
      )}

      {}
      {UNITS.map((unit) => {
        const unlocked = isUnitUnlocked(unit.id, state.moduleResults);
        const unitPct  = getUnitProgress(unit.id, state.moduleResults);
        const isUnit1  = unit.id === 1;

        return (
          <div
            key={unit.id}
            style={{ ...styles.unitCard, opacity: unlocked ? 1 : 0.55 }}
          >
            {}
            <div style={styles.unitHeader}>
              <div style={{ ...styles.unitIconBox, background: unit.light }}>
                <span style={{ fontSize: 22 }}>{unlocked ? unit.emoji : "🔒"}</span>
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
                  <div style={{
                    ...styles.progressFill,
                    width: `${unitPct * 100}%`,
                    background: unit.color,
                  }} />
                </div>
              </div>
            </div>

            {}
            {isUnit1 && unlocked && (
              <button
                onClick={() => navigate("/revisao", { state: { fromDiagnostic: false } })}
                style={{ ...styles.reviewShortcut, borderColor: unit.color + "55", color: unit.color }}
              >
                <span style={{ fontSize: 16 }}>📚</span>
                <span>Ver Material de Revisão da Unidade 1</span>
                <span style={{ marginLeft: "auto", fontSize: 13 }}>→</span>
              </button>
            )}

            {}
            {unlocked ? (
              <div style={styles.moduleList}>
                {unit.modules.map((mod) => {
                  const result = state.moduleResults[mod.id];
                  const done   = result?.completed;
                  const passed = done && result.score >= 0.8;

                  return (
                    <div key={mod.id} style={styles.moduleRow}>
                      <div style={styles.moduleInfo}>
                        <span style={styles.moduleName}>{mod.title}</span>
                        {done && (
                          <span style={{ ...styles.moduleScore, color: passed ? "#22c55e" : "#f59e0b" }}>
                            {passed ? "✅" : "⚠️"} {(result.score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      {}
                      <button
                        onClick={() => dispatch({ type: "START_MODULE", payload: mod.id })}
                        style={{
                          ...styles.btnModule,
                          background: passed ? unit.light : unit.color,
                          color:      passed ? unit.color : "#fff",
                          border:     passed ? `1.5px solid ${unit.color}` : "none",
                        }}
                      >
                        {done ? (passed ? "Refazer" : "Tentar novamente") : "Iniciar"}
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



const styles = {
  page: { maxWidth: 720, margin: "0 auto", padding: "28px 16px 48px" },

  
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    flexWrap: "wrap", gap: 12, marginBottom: 20,
  },
  h1:       { fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "0 0 4px" },
  subtitle: { color: "#64748b", fontSize: 14, margin: 0 },
  headerActions: { display: "flex", gap: 8, flexWrap: "wrap" },
  btnSm: {
    padding: "7px 14px", borderRadius: 8,
    border: "1px solid #e2e8f0", background: "#f8fafc",
    color: "#475569", fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },

  
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 },
  statCard:  { background: "#f8fafc", borderRadius: 14, padding: "14px 12px", textAlign: "center", border: "1px solid #f1f5f9" },
  statIcon:  { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 700 },
  statLabel: { fontSize: 11, color: "#94a3b8", marginTop: 2 },

  
  reviewBanner: {
    background: "linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)",
    border: "1.5px solid #BFDBFE",
    borderRadius: 14, padding: "16px 20px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 16, flexWrap: "wrap", marginBottom: 16,
  },
  reviewBannerLeft:  { display: "flex", alignItems: "flex-start", gap: 14, flex: 1 },
  reviewBannerIcon:  { fontSize: 26, flexShrink: 0, marginTop: 2 },
  reviewBannerTitle: { fontSize: 14, fontWeight: 700, color: "#1e40af", margin: "0 0 3px" },
  reviewBannerSub:   { fontSize: 13, color: "#3b82f6", margin: 0, lineHeight: 1.5 },
  reviewBannerBtn: {
    padding: "9px 18px", borderRadius: 10,
    border: "none", background: "#2563EB",
    color: "#fff", fontWeight: 700, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit",
    whiteSpace: "nowrap", flexShrink: 0,
  },

  
  infoBanner: {
    background: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: 12, padding: "12px 16px",
    fontSize: 14, color: "#1d4ed8",
    marginBottom: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
  },
  diagReviewLink: {
    marginLeft: 8, background: "none", border: "none",
    color: "#2563EB", fontWeight: 700, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit", textDecoration: "underline",
  },
  successBanner: {
    background: "#f0fdf4", border: "1px solid #86efac",
    borderRadius: 12, padding: "12px 16px",
    fontSize: 14, color: "#15803d", fontWeight: 600, marginBottom: 16,
  },
  warningBanner: {
    background: "#fffbeb", border: "1px solid #fde68a",
    borderRadius: 12, padding: "12px 16px",
    fontSize: 14, color: "#92400e", marginBottom: 16,
  },

  
  unitCard: {
    background: "#fff", borderRadius: 16, padding: 20,
    border: "1px solid #f1f5f9", marginBottom: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  unitHeader: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 },
  unitIconBox: {
    width: 46, height: 46, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  unitTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  unitTitle:    { fontWeight: 700, fontSize: 15, color: "#1e293b", margin: 0 },
  unitPct:      { fontSize: 13, fontWeight: 700 },
  unitDesc:     { fontSize: 12, color: "#64748b", margin: "3px 0 8px" },
  progressTrack:{ background: "#f1f5f9", borderRadius: 99, height: 5, overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 99, transition: "width 0.4s ease" },

  
  reviewShortcut: {
    display: "flex", alignItems: "center", gap: 10,
    width: "100%", padding: "10px 14px",
    border: "1.5px dashed", borderRadius: 10,
    background: "transparent", cursor: "pointer",
    fontFamily: "inherit", fontSize: 13, fontWeight: 600,
    marginBottom: 10, transition: "background 0.15s",
  },

  
  moduleList: { display: "flex", flexDirection: "column", gap: 8, paddingLeft: 60 },
  moduleRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#f8fafc", borderRadius: 10, padding: "10px 14px", gap: 10,
  },
  moduleInfo:  { display: "flex", alignItems: "center", gap: 8, flex: 1 },
  moduleName:  { fontSize: 14, fontWeight: 600, color: "#334155" },
  moduleScore: { fontSize: 12, fontWeight: 700 },
  btnModule: {
    padding: "6px 16px", borderRadius: 8, fontSize: 13,
    fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
  },
  lockedMsg: { fontSize: 12, color: "#94a3b8", paddingLeft: 60, margin: "8px 0 0" },
};





