// src/pages/UsuariosPage.jsx
// Listado de usuarios con desactivación (baja lógica)
import { useEffect, useState } from 'react'
import { peticion } from '../utils/api.js'
import { fmt } from '../utils/session.js'

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [falla, setFalla] = useState(false);

  async function cargarUsuarios() {
    try {
      const data = await peticion('/api/usuarios');
      setUsuarios(Array.isArray(data) ? data : []);
      setFalla(false);
    } catch {
      setFalla(true);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function desactivar(u) {
    if (!window.confirm(`¿Desactivar al usuario "${u.nombre}"?`)) return;
    try {
      await peticion(`/api/usuarios/${u.id_usuario}`, { method: 'DELETE' });
      cargarUsuarios();
    } catch {
      window.alert('No se pudo desactivar el usuario.');
    }
  }

  return (
    <>
      <div className="sm-page-header">
        <h1 className="sm-page-title">Usuarios del Sistema</h1>
        <p className="sm-page-sub">Lista de cuentas registradas</p>
      </div>

      <div className="sm-section">
        <div style={{ overflowX: 'auto' }}>
          <table className="sm-table" aria-label="Tabla de usuarios">
            <thead>
              <tr><th>#</th><th>Nombre</th><th>Email</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {falla ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>
                    Error al cargar usuarios.
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-sub)' }}>
                    No hay usuarios.
                  </td>
                </tr>
              ) : (
                usuarios.map((u, i) => (
                  <tr key={u.id_usuario}>
                    <td>{i + 1}</td>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>{fmt(u.created_at)}</td>
                    <td>
                      <span className="sm-genre-badge" style={{ background: 'rgba(80,220,120,.15)', color: 'var(--success)' }}>
                        Activo
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sm-icon-btn delete"
                        onClick={() => desactivar(u)}
                        aria-label={`Desactivar ${u.nombre}`}
                      >
                        <i className="bi bi-person-dash-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default UsuariosPage