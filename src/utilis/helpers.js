import { UNITS } from "../data/units";

/**
 * RF08 — Unit progress as the arithmetic mean of each module's score (0–1).
 */
export function getUnitProgress(unitId, moduleResults) {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit || !unit.modules.length) return 0;

  const sum = unit.modules.reduce((acc, m) => {
    const r = moduleResults[m.id];
    return acc + (r?.completed ? r.score : 0);
  }, 0);

  return sum / unit.modules.length;
}

/**
 * RF08 — A unit is unlocked when the previous unit's progress >= 80%.
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
 * Generates and downloads a PDF report of the student's performance.
 * Uses jsPDF + jspdf-autotable.
 */
export async function downloadReportPDF(state) {
  // Lazy-load jsPDF so it's only bundled when needed
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const studentName = state.user?.name || state.studentName || "Aluno";
  const avg = getOverallAvg(state.moduleResults);
  const avgTime = getAvgTimeMs(state.moduleResults);
  const totalAnswered = Object.values(state.moduleResults).reduce(
    (s, r) => s + (r.total || 0),
    0
  );
  const diagScore = Math.min(
    state.firstDiagnosticScore ?? state.diagnosticScore ?? 0,
    1
  );
  const generatedAt = new Date().toLocaleString("pt-BR");

  const PRIMARY = [99, 102, 241];   // #6366f1
  const DARK    = [30, 41, 59];     // #1e293b
  const LIGHT   = [248, 250, 252];  // #f8fafc
  const GRAY    = [100, 116, 139];  // #64748b

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ── Header band ──────────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 36, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("MathQuestion", 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório de Desempenho do Aluno", 14, 22);

  doc.setFontSize(8);
  doc.text(`Gerado em: ${generatedAt}`, 14, 29);

  // ── Student info box ─────────────────────────────────────────────────────
  let y = 44;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(12, y, pageW - 24, 36, 3, 3, "F");

  doc.setTextColor(...DARK);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(studentName, 18, y + 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text(`Série: ${state.user?.grade || "—"}`, 18, y + 18);

  // ── Summary cards (4 cols) ───────────────────────────────────────────────
  y += 44;
  const cardW = (pageW - 28) / 4;
  const cards = [
    { label: "XP Total",         value: `${state.totalXP} pts` },
    { label: "Média Geral",      value: `${(avg * 100).toFixed(0)}%`  },
    { label: "Questões feitas",  value: String(totalAnswered)          },
    { label: "Tempo médio",      value: formatTime(avgTime)            },
  ];

  cards.forEach((card, i) => {
    const cx = 12 + i * (cardW + 2);
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(cx, y, cardW, 22, 2, 2, "F");
    doc.setTextColor(...PRIMARY);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, cx + cardW / 2, y + 10, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(card.label, cx + cardW / 2, y + 17, { align: "center" });
  });

  // ── Diagnostic score ─────────────────────────────────────────────────────
  y += 30;
  if (state.firstDiagnosticDone ?? state.diagnosticDone) {
    doc.setTextColor(...DARK);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Diagnóstico Inicial", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    doc.text(
      `Acertos: ${(diagScore * 100).toFixed(0)}%  ${diagScore >= 0.6 ? "✓ Aprovado" : "✗ Abaixo de 60%"}`,
      14, y + 6
    );
    y += 14;
  }

  if (state.secondDiagnosticDone) {
    doc.setTextColor(...DARK);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("2.º Diagnóstico", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    const s2 = ((state.secondDiagnosticScore || 0) * 100).toFixed(0);
    doc.text(`Acertos: ${s2}%`, 14, y + 6);
    y += 14;
  }

  // ── Module results table ──────────────────────────────────────────────────
  y += 4;
  doc.setTextColor(...DARK);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Desempenho por Módulo", 14, y);
  y += 4;

  const tableRows = [];
  UNITS.forEach((unit) => {
    unit.modules.forEach((mod) => {
      const result = state.moduleResults[mod.id];
      if (!result) {
        tableRows.push([
          `Unidade ${unit.id}: ${unit.title}`,
          mod.title,
          "Não iniciado",
          "—",
          "—",
          "—",
        ]);
      } else {
        const scorePct = `${(result.score * 100).toFixed(0)}%`;
        const status =
          result.score >= 0.8 ? "✓ Aprovado" : result.completed ? "Refazer" : "Em andamento";
        tableRows.push([
          `Unidade ${unit.id}: ${unit.title}`,
          mod.title,
          status,
          scorePct,
          `${result.correct || 0}/${result.total || 0}`,
          formatTime(result.timeMs),
        ]);
      }
    });
  });

  autoTable(doc, {
    startY: y + 2,
    head: [["Unidade", "Módulo", "Status", "Acertos %", "Questões", "Tempo"]],
    body: tableRows,
    headStyles: {
      fillColor: PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5, textColor: DARK },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 48 },
      1: { cellWidth: 44 },
      2: { cellWidth: 26 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
    },
    margin: { left: 12, right: 12 },
    theme: "grid",
    styles: { overflow: "linebreak", halign: "left" },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 2) {
        if (data.cell.raw?.includes("✓"))
          data.cell.styles.textColor = [21, 128, 61];
        else if (data.cell.raw === "Refazer")
          data.cell.styles.textColor = [180, 83, 9];
        else if (data.cell.raw === "Não iniciado")
          data.cell.styles.textColor = [148, 163, 184];
      }
    },
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const finalY = doc.lastAutoTable?.finalY ?? pageH - 20;
  if (finalY + 20 < pageH) {
    doc.setDrawColor(226, 232, 240);
    doc.line(12, finalY + 8, pageW - 12, finalY + 8);
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(
      "MathQuestion — Relatório gerado automaticamente. Para uso pedagógico.",
      pageW / 2,
      finalY + 14,
      { align: "center" }
    );
  }

  doc.save(`relatorio_${studentName.replace(/\s+/g, "_")}.pdf`);
}

/**
 * @deprecated — kept for compatibility; use downloadReportPDF instead.
 */
export function downloadReport(state) {
  downloadReportPDF(state);
}
