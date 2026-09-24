// src/pages/AuditoriaPage.jsx
// Registro de auditoría de operaciones del sistema
import { useEffect, useState } from 'react'
import { peticion } from '../utils/api.js'
import { fmt } from '../utils/session.js'

function AuditoriaPage() {
  const [registros, setRegistros] = useState([]);
  const [falla, setFalla] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await peticion('/api/auditoria');
        setRegistros(Array.isArray(data) ? data : []);
      } catch {
        setFalla(true);
      }
    })();
  }, []);

  return (
    <>
      <div className="sm-page-header">
        <h1 className="sm-page-title">Registro de Auditoría</h1>
        <p className="sm-page-sub">Historial de operaciones del sistema</p>
      </div>

      <div className="sm-section">
        <h2 className="sm-section-title" style={{ marginBottom: '1rem' }}>
          <i className="bi bi-clock-history me-2" style={{ color: 'var(--blue)' }}></i>Operaciones recientes
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="sm-table" aria-label="Historial de auditoría">
            <thead>
              <tr><th>#</th><th>Tipo</th><th>Descripción</th><th>Tabla</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {falla ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>
                    Error al cargar auditoría.
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-sub)' }}>
                    Sin registros.
                  </td>
                </tr>
              ) : (
                registros.map((a, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <span className="sm-genre-badge" style={{ background: 'rgba(80,160,255,.15)', color: 'var(--blue)' }}>
                        {a.tipo_op || '—'}
                      </span>
                    </td>
                    <td>{a.descripcion || '—'}</td>
                    <td>{a.tabla_afectada || '—'}</td>
                    <td>{fmt(a.fecha)}</td>
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

export default AuditoriaPage