import "./ExitModal.css";

export default function ExitModal({ onConfirm, onCancel }) {
  return (
    <div className="em-backdrop" onClick={onCancel}>
      <div
        className="em-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-title"
      >
        <div className="em-icon-wrap">⚠️</div>

        <h2 id="exit-title" className="em-title">
          Tem certeza que deseja sair?
        </h2>
        <p className="em-body">
          Se você sair agora,{" "}
          <strong>todo o seu progresso neste exercício será perdido</strong>.
          Esta ação não pode ser desfeita.
        </p>

        <div className="em-actions">
          <button className="em-btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="em-btn-confirm" onClick={onConfirm}>
            Sim, sair
          </button>
        </div>
      </div>
    </div>
  );
}
