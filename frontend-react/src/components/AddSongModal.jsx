// src/components/AddSongModal.jsx
// Modal para registrar una nueva canción
import { useEffect, useState } from 'react'

function AddSongModal({ open, onClose, onSave }) {
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [genero, setGenero] = useState('');
  const [anio, setAnio] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Limpia campos y libera el botón al abrir/cerrar
  useEffect(() => {
    if (open) {
      setTitulo(''); setArtista(''); setGenero(''); setAnio(''); setGuardando(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function guardar() {
    if (!titulo.trim() || !artista.trim()) {
      alert('Título y artista son obligatorios.');
      return;
    }
    setGuardando(true);
    await onSave(titulo.trim(), artista.trim(), genero, anio || null);
    setGuardando(false);
  }

  return (
    <div className="sm-modal-overlay show" onClick={onClose}>
      <div
        className="sm-add-modal"
        role="dialog"
        aria-labelledby="addModalTitle"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="addModalTitle">
          <i className="bi bi-music-note-beamed me-2" style={{ color: 'var(--accent)' }}></i>
          Agregar Canción
        </h3>
        <div className="sm-field">
          <label className="sm-label" htmlFor="addTitulo">Título *</label>
          <input
            type="text"
            id="addTitulo"
            className="sm-input"
            placeholder="Nombre de la canción"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
          />
        </div>
        <div className="sm-field">
          <label className="sm-label" htmlFor="addArtista">Artista *</label>
          <input
            type="text"
            id="addArtista"
            className="sm-input"
            placeholder="Nombre del artista"
            value={artista}
            onChange={e => setArtista(e.target.value)}
          />
        </div>
        <div className="sm-row2">
          <div className="sm-field">
            <label className="sm-label" htmlFor="addGenero">Género</label>
            <select
              id="addGenero"
              className="sm-input"
              value={genero}
              onChange={e => setGenero(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              <option>Rock</option><option>Pop</option><option>Jazz</option>
              <option>Salsa</option><option>Reggaeton</option>
              <option>Electrónica</option><option>Latina</option><option>Clásica</option>
            </select>
          </div>
          <div className="sm-field">
            <label className="sm-label" htmlFor="addAnio">Año</label>
            <input
              type="number"
              id="addAnio"
              className="sm-input"
              placeholder="2024"
              min="1900"
              max="2099"
              value={anio}
              onChange={e => setAnio(e.target.value)}
            />
          </div>
        </div>
        <div className="sm-modal-btns" style={{ marginTop: '.5rem' }}>
          <button
            type="button"
            className="sm-btn-sm ghost"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="sm-btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={guardar}
            disabled={guardando}
          >
            <i className="bi bi-floppy-fill"></i> {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddSongModal