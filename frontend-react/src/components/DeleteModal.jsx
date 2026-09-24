// src/components/DeleteModal.jsx
// Modal de confirmación accesible (role=dialog, aria-modal, Esc para cerrar)
import { useEffect, useRef } from 'react'

function DeleteModal({ open, title, subtitle, onClose, onConfirm }) {
  const btnConfirmar = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    if (btnConfirmar.current) btnConfirmar.current.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sm-modal-overlay show" onClick={onClose}>
      <div
        className="sm-modal"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        <div className="sm-modal-icon"><i className="bi bi-trash3-fill"></i></div>
        <h3 className="sm-modal-title" id="modalTitle">{title}</h3>
        <p className="sm-modal-sub">{subtitle}</p>
        <div className="sm-modal-btns">
          <button
            type="button"
            className="sm-btn-sm ghost"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i> Cancelar
          </button>
          <button
            type="button"
            ref={btnConfirmar}
            className="sm-btn-sm"
            style={{ flex: 1, justifyContent: 'center', background: 'var(--danger)' }}
            onClick={onConfirm}
          >
            <i className="bi bi-trash3"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal