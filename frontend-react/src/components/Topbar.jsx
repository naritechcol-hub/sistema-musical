// src/components/Topbar.jsx
// Barra superior con notificaciones y chip del usuario
import { Link } from 'react-router-dom'
import { getUsuario, iniciales } from '../utils/session.js'

function Topbar({ onMenu }) {
  const usuario = getUsuario();

  return (
    <header className="sm-topbar" role="banner">
      <div className="sm-topbar-left">
        <button
          type="button"
          className="sm-menu-btn"
          onClick={onMenu}
          aria-label="Abrir menú"
        >
          <i className="bi bi-list"></i>
        </button>
        <Link to="/dashboard" className="sm-brand">
          <i className="bi bi-music-note-beamed"></i> SoundManager
        </Link>
      </div>
      <div className="sm-topbar-right">
        <div className="sm-notif" aria-label="Notificaciones">
          <i className="bi bi-bell-fill"></i>
          <span className="sm-notif-badge">3</span>
        </div>
        <Link to="/perfil" className="sm-user-chip" aria-label="Mi perfil">
          <div className="sm-avatar">{iniciales(usuario.nombre)}</div>
          <span>{usuario.nombre || 'Mi Perfil'}</span>
          <i className="bi bi-chevron-down" aria-hidden="true"></i>
        </Link>
      </div>
    </header>
  );
}

export default Topbar