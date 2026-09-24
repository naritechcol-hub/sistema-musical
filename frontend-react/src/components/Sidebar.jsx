// src/components/Sidebar.jsx
// Menú lateral con navegación y cierre de sesión
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { peticion } from '../utils/api.js'
import { cerrarSesion } from '../utils/session.js'

function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [totalCanciones, setTotalCanciones] = useState(0);

  // Actualiza el contador de canciones al navegar o cuando cambie la biblioteca
  async function cargarContador() {
    try {
      const data = await peticion('/api/canciones');
      setTotalCanciones(Array.isArray(data) ? data.length : 0);
    } catch {
      // Se mantiene el contador anterior
    }
  }

  useEffect(() => {
    cargarContador();
    window.addEventListener('canciones:updated', cargarContador);
    return () => window.removeEventListener('canciones:updated', cargarContador);
  }, [location.pathname]);

  async function cerrar() {
    try {
      await peticion('/api/auth/logout', { method: 'POST' });
    } catch {
      // Sin conexión, se cierra igualmente la sesión local
    }
    cerrarSesion();
    navigate('/login');
  }

  const navClass = ({ isActive }) => (['sm-nav-item', isActive ? 'active' : '']).join(' ');

  return (
    <>
      <aside
        className={['sm-sidebar', open ? 'open' : ''].join(' ')}
        role="navigation"
        aria-label="Menú principal"
      >
        <div className="sm-sidebar-section">PRINCIPAL</div>

        <NavLink to="/dashboard" end className={navClass} onClick={onClose}>
          <i className="bi bi-grid-fill"></i> Dashboard
        </NavLink>
        <NavLink to="/dashboard/canciones" className={navClass} onClick={onClose}>
          <i className="bi bi-music-note-list"></i> Mis Canciones
          <span className="sm-nav-badge">{totalCanciones}</span>
        </NavLink>
        <NavLink to="/dashboard/auditoria" className={navClass} onClick={onClose}>
          <i className="bi bi-clock-history"></i> Auditoría
        </NavLink>

        <div className="sm-sidebar-section" style={{ marginTop: '.5rem' }}>ADMINISTRACIÓN</div>
        <NavLink to="/dashboard/usuarios" className={navClass} onClick={onClose}>
          <i className="bi bi-people-fill"></i> Usuarios
        </NavLink>

        <div className="sm-sidebar-bottom">
          <NavLink to="/perfil" className={navClass} onClick={onClose}>
            <i className="bi bi-person-circle"></i> Mi Perfil
          </NavLink>
          <button type="button" className="sm-nav-item" onClick={cerrar}>
            <i className="bi bi-box-arrow-right" style={{ color: 'var(--danger)' }}></i>
            <span style={{ color: 'var(--danger)' }}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {open && <div className="sm-sidebar-overlay" onClick={onClose} aria-hidden="true"></div>}
    </>
  );
}

export default Sidebar