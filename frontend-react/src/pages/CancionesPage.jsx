// src/pages/CancionesPage.jsx
// Biblioteca de canciones: listado, búsqueda en tiempo real, filtros por género, alta y baja
import { useEffect, useState } from 'react'
import { peticion } from '../utils/api.js'
import { getUsuario } from '../utils/session.js'
import Toast from '../components/Toast.jsx'
import DeleteModal from '../components/DeleteModal.jsx'
import AddSongModal from '../components/AddSongModal.jsx'

const COLORES_GENERO = {
  Rock:         { bg: 'rgba(233,69,96,.15)',  fg: '#E94560' },
  Pop:          { bg: 'rgba(80,160,255,.15)', fg: '#50A0FF' },
  'Electrónica':{ bg: 'rgba(255,200,80,.15)', fg: '#FFC850' },
  Latina:       { bg: 'rgba(80,220,120,.15)', fg: '#50DC78' },
  Jazz:         { bg: 'rgba(160,80,255,.15)', fg: '#A050FF' },
  Salsa:        { bg: 'rgba(255,160,50,.15)', fg: '#FFA032' },
  Reggaeton:    { bg: 'rgba(50,220,200,.15)', fg: '#32DCC8' },
  'Clásica':    { bg: 'rgba(200,200,80,.15)', fg: '#C8C850' },
};

function CancionesPage() {
  const usuario = getUsuario();

  const [todas, setTodas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [generoActivo, setGeneroActivo] = useState(null);
  const [falla, setFalla] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  async function cargarCanciones() {
    try {
      const data = await peticion('/api/canciones');
      setTodas(Array.isArray(data) ? data : []);
      setFalla(false);
    } catch {
      setFalla(true);
    } finally {
      window.dispatchEvent(new CustomEvent('canciones:updated'));
    }
  }

  useEffect(() => {
    cargarCanciones();
  }, []);

  // Aplica filtro por género y luego búsqueda en tiempo real
  const visibles = todas
    .filter(s => !generoActivo || s.genero === generoActivo)
    .filter(s =>
      !busqueda.trim() ||
      String(s.titulo || '').toLowerCase().includes(busqueda.trim().toLowerCase()) ||
      String(s.artista || '').toLowerCase().includes(busqueda.trim().toLowerCase())
    );

  const generos = [...new Set(todas.map(s => s.genero).filter(Boolean))];

  function cambiarGenero(g) {
    setGeneroActivo(g);
  }

  async function guardarCancion(titulo, artista, genero, anio) {
    try {
      await peticion('/api/canciones', {
        method: 'POST',
        body: { titulo, artista, genero, anio, idUsuario: usuario.id_usuario || 1 },
      });
      setAddOpen(false);
      setToast({ msg: 'Canción agregada correctamente.', type: 'success' });
      cargarCanciones();
    } catch (err) {
      setToast({ msg: err.message, type: 'error' });
    }
  }

  async function confirmarEliminar() {
    if (!deleteTarget) return;
    try {
      await peticion(`/api/canciones/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      setToast({ msg: 'Canción eliminada correctamente.', type: 'success' });
      cargarCanciones();
    } catch {
      setToast({ msg: 'Error al eliminar.', type: 'error' });
    }
  }

  function abrirEliminar(cancion) {
    setDeleteTarget({ id: cancion.id_cancion, titulo: cancion.titulo });
  }

  return (
    <>
      <div className="sm-page-header">
        <h1 className="sm-page-title">Mis Canciones</h1>
        <p className="sm-page-sub">Gestiona tu biblioteca musical</p>
      </div>

      <Toast msg={toast.msg} type={toast.type} onClear={() => setToast({ msg: '', type: 'success' })} />

      <div className="sm-section">
        <div className="sm-section-header">
          <h2 className="sm-section-title">
            <i className="bi bi-music-note-list me-2" style={{ color: 'var(--accent)' }}></i> Biblioteca
          </h2>
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="search"
              className="sm-search"
              placeholder="🔍  Buscar canción..."
              aria-label="Buscar canciones"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <button type="button" className="sm-btn-sm" onClick={() => setAddOpen(true)}>
              <i className="bi bi-plus-lg"></i> Agregar
            </button>
          </div>
        </div>

        <div className="sm-filter-chips">
          <button
            type="button"
            className={['sm-chip', generoActivo === null ? 'active' : ''].join(' ')}
            onClick={() => cambiarGenero(null)}
          >
            Todos
          </button>
          {generos.map(g => (
            <button
              key={g}
              type="button"
              className={['sm-chip', generoActivo === g ? 'active' : ''].join(' ')}
              onClick={() => cambiarGenero(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="sm-table" aria-label="Tabla de canciones">
            <thead>
              <tr>
                <th>#</th><th>Título</th><th>Artista</th><th>Género</th>
                <th>Año</th><th>Favorita</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {falla ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>
                    Error al cargar canciones.
                  </td>
                </tr>
              ) : visibles.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-sub)' }}>
                    {todas.length === 0 ? 'No hay canciones registradas.' : 'Sin coincidencias.'}
                  </td>
                </tr>
              ) : (
                visibles.map((s, i) => {
                  const gc = COLORES_GENERO[s.genero] || { bg: 'rgba(160,160,180,.12)', fg: '#A0A0B4' };
                  return (
                    <tr key={s.id_cancion}>
                      <td>{i + 1}</td>
                      <td><strong>{s.titulo}</strong></td>
                      <td>{s.artista}</td>
                      <td>
                        <span className="sm-genre-badge" style={{ background: gc.bg, color: gc.fg }}>
                          {s.genero || '—'}
                        </span>
                      </td>
                      <td>{s.anio || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <i className="bi bi-star" style={{ color: 'var(--text-sub)' }} aria-label="No favorita"></i>
                      </td>
                      <td>
                        <div className="sm-action-btns">
                          <button
                            type="button"
                            className="sm-icon-btn delete"
                            onClick={() => abrirEliminar(s)}
                            aria-label={`Eliminar ${s.titulo}`}
                          >
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="sm-table-count" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.9rem' }}>
          <span>Mostrando {visibles.length} de {todas.length} canciones</span>
        </div>
      </div>

      <DeleteModal
        open={Boolean(deleteTarget)}
        title="¿Eliminar canción?"
        subtitle={deleteTarget ? `¿Deseas eliminar "${deleteTarget.titulo}"? Esta acción no se puede deshacer.` : ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmarEliminar}
      />

      <AddSongModal open={addOpen} onClose={() => setAddOpen(false)} onSave={guardarCancion} />
    </>
  );
}

export default CancionesPage