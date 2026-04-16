/**
 * ExitModal — RF18 / RF19
 * Renders a confirmation modal when the user tries to exit a quiz.
 *
 * Props:
 *   onConfirm  — called when "Sim, sair" is clicked
 *   onCancel   — called when "Cancelar" is clicked
 */
export default function ExitModal({ onConfirm, onCancel }) {
  return (
    /* Backdrop — faux-viewport so fixed-like behavior works inside iframe */
    <div style={s.backdrop} onClick={onCancel}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="exit-title">

        {/* Icon */}
        <div style={s.iconWrap}>
          <span style={s.icon}>⚠️</span>
        </div>

        {/* Copy */}
        <h2 id="exit-title" style={s.title}>Tem certeza que deseja sair?</h2>
        <p style={s.body}>
          Se você sair agora, <strong>todo o seu progresso neste exercício será perdido</strong>. Esta ação não pode ser desfeita.
        </p>

        {/* Actions */}
        <div style={s.actions}>
          <button onClick={onCancel} style={s.btnCancel}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={s.btnConfirm}>
            Sim, sair
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    padding: "36px 32px",
    maxWidth: 420,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
    animation: "modalIn 0.18s ease",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#FEF3C7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  icon: { fontSize: 30 },
  title: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 10px",
  },
  body: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 1.65,
    margin: "0 0 28px",
  },
  actions: {
    display: "flex",
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    padding: "13px 20px",
    borderRadius: 12,
    border: "1.5px solid #E2E8F0",
    background: "#F8FAFC",
    color: "#475569",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s",
  },
  btnConfirm: {
    flex: 1,
    padding: "13px 20px",
    borderRadius: 12,
    border: "none",
    background: "#EF4444",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s",
  },
};
