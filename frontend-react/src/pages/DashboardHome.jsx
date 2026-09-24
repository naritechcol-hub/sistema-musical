// src/pages/DashboardHome.jsx
// Vista principal del dashboard con las 4 tarjetas de estadísticas
import { useEffect, useState } from 'react'
import { getUsuario } from '../utils/session.js'
import { peticion } from '../utils/api.js'
import '../styles/dashboard.css'

function DashboardHome() {
  const usuario = getUsuario();
  const [stats, setStats] = useState({ canciones: 0, usuarios: 0 });

  // Las estadísticas son el conteo de los 3 endpoints existentes (como en el original)
  useEffect(() => {
    Promise.all([
      peticion('/api/canciones').catch(() => []),
      peticion('/api/usuarios').catch(() => []),
      peticion('/api/auditoria').catch(() => []),
    ]).then(([canciones, usuarios]) => {
      setStats({
        canciones: Array.isArray(canciones) ? canciones.length : 0,
        usuarios: Array.isArray(usuarios) ? usuarios.length : 0,
      });
    });
  }, []);

  return (
    <>
      <div className="sm-page-header">
        <h1 className="sm-page-title">Dashboard</h1>
        <p className="sm-page-sub">Bienvenido, {usuario.nombre || 'usuario'}</p>
      </div>

      <div className="sm-stats">
        <div className="sm-stat-card">
          <div className="sm-stat-icon" style={{ background: 'rgba(233,69,96,.15)' }}>
            <i className="bi bi-music-note-beamed" style={{ color: 'var(--accent)' }}></i>
          </div>
          <div>
            <div className="sm-stat-val" style={{ color: 'var(--accent)' }}>{stats.canciones}</div>
            <div className="sm-stat-lbl">Canciones</div>
          </div>
        </div>

        <div className="sm-stat-card">
          <div className="sm-stat-icon" style={{ background: 'rgba(80,160,255,.15)' }}>
            <i className="bi bi-people-fill" style={{ color: 'var(--blue)' }}></i>
          </div>
          <div>
            <div className="sm-stat-val" style={{ color: 'var(--blue)' }}>{stats.usuarios}</div>
            <div className="sm-stat-lbl">Usuarios</div>
          </div>
        </div>

        <div className="sm-stat-card">
          <div className="sm-stat-icon" style={{ background: 'rgba(255,200,80,.15)' }}>
            <i className="bi bi-star-fill" style={{ color: 'var(--yellow)' }}></i>
          </div>
          <div>
            <div className="sm-stat-val" style={{ color: 'var(--yellow)' }}>0</div>
            <div className="sm-stat-lbl">Favoritas</div>
          </div>
        </div>

        <div className="sm-stat-card">
          <div className="sm-stat-icon" style={{ background: 'rgba(80,220,120,.15)' }}>
            <i className="bi bi-clock-fill" style={{ color: 'var(--success)' }}></i>
          </div>
          <div>
            <div className="sm-stat-val" style={{ color: 'var(--success)', fontSize: '1rem', paddingTop: '.35rem' }}>Hoy</div>
            <div className="sm-stat-lbl">Última sesión</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardHome