/**
 * RF22 — Geração de relatório PDF por módulo a partir do Dashboard.
 * Usado quando o aluno clica em 📄 ao lado de um módulo já concluído.
 * Como não temos o log detalhado (sessão já terminou), gera um resumo
 * com os dados salvos no Firestore (score, correct, total, timeMs, xp).
 */
export async function downloadModuleReportFromDashboard({ moduleId, moduleName, unitName, studentName, result }) {
  const { default: jsPDF }     = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW  = doc.internal.pageSize.getWidth();
  const PRIMARY = [99, 102, 241];
  const DARK    = [30, 41, 59];
  const GRAY    = [100, 116, 139];

  const pct     = Math.round((result?.score || 0) * 100);
  const timeStr = (() => {
    const s = Math.round((result?.timeMs || 0) / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  })();
  const dateStr = result?.completedAt
    ? new Date(result.completedAt.seconds ? result.completedAt.seconds * 1000 : result.completedAt).toLocaleString("pt-BR")
    : new Date().toLocaleString("pt-BR");

  // Header
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text("MathQuestion", 14, 14);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text("Relatório por Módulo (RF22)", 14, 22);
  doc.setFontSize(8);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 29);

  // Info
  let y = 44;
  doc.setTextColor(...DARK);
  doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text(moduleName, 14, y);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
  doc.text(`Unidade: ${unitName}  ·  Aluno: ${studentName}  ·  Data: ${dateStr}`, 14, y + 7);

  // Cards
  y += 18;
  const cards = [
    { label: "Resultado",   value: `${pct}%` },
    { label: "Acertos",     value: `${result?.correct || 0}/${result?.total || 0}` },
    { label: "XP ganho",    value: `${result?.xp || 0} pts` },
    { label: "Tempo total", value: timeStr },
  ];
  const cw = (pageW - 28) / 4;
  cards.forEach((c, i) => {
    const cx = 14 + i * (cw + 2);
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(cx, y, cw, 20, 2, 2, "F");
    doc.setTextColor(...PRIMARY); doc.setFontSize(13); doc.setFont("helvetica", "bold");
    doc.text(c.value, cx + cw / 2, y + 9, { align: "center" });
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
    doc.text(c.label, cx + cw / 2, y + 16, { align: "center" });
  });

  // Nota
  y += 28;
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(14, y, pageW - 28, 18, 3, 3, "F");
  doc.setTextColor(146, 64, 14); doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text("ℹ️  O detalhamento completo por questão (com rascunhos) está disponível", 18, y + 6);
  doc.text("    ao finalizar um módulo diretamente, antes de voltar ao Dashboard.", 18, y + 12);

  // Resumo simples
  y += 26;
  doc.setTextColor(...DARK); doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text("Resumo da tentativa", 14, y);

  autoTable(doc, {
    startY: y + 4,
    head: [["Campo", "Valor"]],
    body: [
      ["Módulo",        moduleName],
      ["Unidade",       unitName],
      ["Aluno",         studentName],
      ["Resultado",     `${pct}% (${result?.correct || 0} de ${result?.total || 0} acertos)`],
      ["XP ganho",      `${result?.xp || 0} pontos`],
      ["Tempo total",   timeStr],
      ["Data",          dateStr],
      ["Status",        pct >= 80 ? "✓ Aprovado (≥ 80%)" : "Em progresso (< 80%)"],
    ],
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: DARK },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: 14, right: 14 },
    theme: "grid",
  });

  const finalY = doc.lastAutoTable?.finalY ?? 200;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, finalY + 8, pageW - 14, finalY + 8);
  doc.setFontSize(7); doc.setTextColor(...GRAY);
  doc.text("MathQuestion — Relatório por módulo.", pageW / 2, finalY + 14, { align: "center" });

  doc.save(`relatorio_${moduleName.replace(/\s+/g, "_")}.pdf`);
}
