export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = "Delete" }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal-card">
        <h2 id="confirm-title">{title}</h2>
        <p className="confirm-text">{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
