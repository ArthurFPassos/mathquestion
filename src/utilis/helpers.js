import { UNITS } from "../data/units";

export function getUnitProgress(unitId, moduleResults) {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit) return 0;
  const passed = unit.modules.filter((m) => {
    const r = moduleResults[m.id];
    return r && r.completed && r.score >= 0.8;
  }).length;
  return passed / unit.modules.length;
}

export function isUnitUnlocked(unitId, moduleResults) {
  if (unitId === 1) return true;
  return getUnitProgress(unitId - 1, moduleResults) >= 0.8;
}

export function getOverallAvg(moduleResults) {
  const vals = Object.values(moduleResults).filter((r) => r.completed);
  if (!vals.length) return 0;
  return vals.reduce((sum, r) => sum + r.score, 0) / vals.length;
}

export function getAvgTimeMs(moduleResults) {
  const times = Object.values(moduleResults)
    .filter((r) => r.timeMs)
    .map((r) => r.timeMs);
  if (!times.length) return 0;
  return times.reduce((a, b) => a + b, 0) / times.length;
}

export function formatTime(ms) {
  if (!ms) return "—";
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function downloadReport(state) {
  const report = {
    student: state.studentName,
    generatedAt: new Date().toISOString(),
    diagnosticScore: state.diagnosticScore,
    totalXP: state.totalXP,
    overallAverage: getOverallAvg(state.moduleResults),
    moduleResults: state.moduleResults,
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio_${state.studentName || "aluno"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}





