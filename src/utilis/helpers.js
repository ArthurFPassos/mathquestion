import { UNITS } from "../data/units";

/**
 * RF08 — Unit progress as the arithmetic mean of each module's score (0–1).
 *
 * BUG FIXED: the old version counted only binary pass/fail (0 or 1 per module),
 * so a unit with modules at 0.67 and 1.0 showed 50% instead of ~83%.
 * The new version sums the actual decimal scores and divides by module count,
 * so 0.67 + 1.0 → 1.67 / 2 = 0.835 → displayed as 84%.
 *
 * Modules not yet started contribute 0 to the sum (not skipped from the
 * denominator), which correctly penalises incomplete units.
 */
export function getUnitProgress(unitId, moduleResults) {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit || !unit.modules.length) return 0;

  const sum = unit.modules.reduce((acc, m) => {
    const r = moduleResults[m.id];
    // completed modules contribute their real score; unstarted contribute 0
    return acc + (r?.completed ? r.score : 0);
  }, 0);

  return sum / unit.modules.length;
}

/**
 * RF08 — A unit is unlocked when the previous unit's arithmetic-mean progress
 * is >= 80%. Unit 1 is always unlocked.
 */
export function isUnitUnlocked(unitId, moduleResults) {
  if (unitId === 1) return true;
  return getUnitProgress(unitId - 1, moduleResults) >= 0.8;
}

/**
 * Returns the average score (0–1) across all completed modules globally.
 */
export function getOverallAvg(moduleResults) {
  const vals = Object.values(moduleResults).filter((r) => r.completed);
  if (!vals.length) return 0;
  return vals.reduce((sum, r) => sum + r.score, 0) / vals.length;
}

/**
 * Returns the average quiz time in milliseconds across completed modules.
 */
export function getAvgTimeMs(moduleResults) {
  const times = Object.values(moduleResults)
    .filter((r) => r.timeMs)
    .map((r) => r.timeMs);
  if (!times.length) return 0;
  return times.reduce((a, b) => a + b, 0) / times.length;
}

/**
 * Formats milliseconds to a readable "Xm Ys" or "Ys" string.
 */
export function formatTime(ms) {
  if (!ms) return "—";
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/**
 * Triggers a JSON download of the student's performance report.
 */
export function downloadReport(state) {
  const report = {
    student:         state.user?.name || state.studentName || "aluno",
    generatedAt:     new Date().toISOString(),
    diagnosticScore: Math.min(state.firstDiagnosticScore ?? state.diagnosticScore ?? 0, 1),
    totalXP:         state.totalXP,
    overallAverage:  getOverallAvg(state.moduleResults),
    moduleResults:   state.moduleResults,
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `relatorio_${report.student}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
