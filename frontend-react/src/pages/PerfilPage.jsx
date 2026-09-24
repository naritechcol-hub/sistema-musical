// src/pages/PerfilPage.jsx
// Mi perfil: 3 pestañas (Información, Seguridad, Preferencias) con PUT real al backend (RF17)
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { peticion } from '../utils/api.js'
import { getUsuario, guardarUsuario, iniciales, cerrarSesion } from '../utils/session.js'
import '../styles/perfil.css'

function PerfilPage() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  // Divide "Nombres Apellidos" en dos campos
  const [pestaña, setPestaña] = useState('info');
  const [totalCanciones, setTotalCanciones] = useState('—');

  const [nombres, setNombres] = useState((usuario.nombre || '').split(' ').slice(0, 2).join(' '));
  const [apellidos, setApellidos] = useState((usuario.nombre || '').split(' ').slice(2).join(' '));
  const [fecha, setFecha] = useState('');
  const [email, setEmail] = useState(usuario.email || '');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const [passActual, setPassActual] = useState('');
  const [passNew, setPassNew] = useState('');
  const [passNewConf, setPassNewConf] = useState('');
  const [mostrar, setMostrar] = useState({ actual: false, nueva: false, conf: false });

  // Carga el conteo de canciones para la mini estadística
  useEffect(() => {
    peticion('/api/canciones')
      .then(data => setTotalCanciones(Array.isArray(data) ? data.length : 0))
      .catch(() => setTotalCanciones(0));
  }, []);

  function mostrarToast() {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3500);
  }

  function cambiarPestaña(nombre) {
    setPestaña(nombre);
  }

  function volverIniciales() {
    setNombres((usuario.nombre || '').split(' ').slice(0, 2).join(' '));
    setApellidos((usuario.nombre || '').split(' ').slice(2).join(' '));
    setEmail(usuario.email || '');
  }

  // Guarda los datos personales con PUT /api/usuarios/:id (RF17)
  async function guardarPerfil(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      const nombreCompleto = `${nombres.trim()} ${apellidos.trim()}`.trim();
      await peticion(`/api/usuarios/${usuario.id_usuario}`, {
        method: 'PUT',
        body: {
          nombre: nombreCompleto,
          apellidos: apellidos.trim(),
          fecha_nac: fecha || null,
          email: email.trim(),
        },
      });
      guardarUsuario({ ...usuario, nombre: nombreCompleto, email: email.trim() });
      mostrarToast();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Cambia la contraseña (validación local igual que el original)
  function guardarPassword(e) {
    e.preventDefault();
    if (passNew.length < 8) {
      window.alert('La nueva contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    if (passNew !== passNewConf) {
      window.alert('Las contraseñas no coinciden.');
      return;
    }
    mostrarToast();
    setPassActual(''); setPassNew(''); setPassNewConf('');
  }

  // Cierra todas las sesiones activas
  function cerrarTodasLasSesiones() {
    if (window.confirm('¿Cerrar todas las sesiones activas?')) {
      cerrarSesion();
      navigate('/login');
    }
  }

  function alternarVer(clave) {
    setMostrar(m => ({ ...m, [clave]: !m[clave] }));
  }

  const toggleProps = (clave) => ({
    role: 'button',
    tabIndex: '0',
    'aria-label': 'Mostrar contraseña',
    onClick: () => alternarVer(clave),
    onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') alternarVer(clave); },
  });

  const fechaMiembro = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });

  return (
    <>
      <div className="sm-page-header">
        <h1 className="sm-page-title">Mi Perfil</h1>
        <p className="sm-page-sub">Administra tu información personal y preferencias</p>
      </div>

      {/* Hero */}
      <div className="sm-profile-hero">
        <div className="sm-avatar-lg" aria-label="Avatar del usuario" role="img">
          {iniciales(usuario.nombre)}
        </div>
        <div className="sm-profile-info">
          <h2>{usuario.nombre || 'Usuario'}</h2>
          <div className="sm-profile-meta">
            <span><i className="bi bi-envelope-fill" aria-hidden="true"></i> {usuario.email || '—'}</span>
            <span><i className="bi bi-calendar-fill" aria-hidden="true"></i> Miembro desde {fechaMiembro}</span>
          </div>
          <div style={{ marginTop: '.5rem' }}>
            <span className="sm-role-badge">
              <i className="bi bi-shield-check-fill" aria-hidden="true"></i> Usuario activo
            </span>
          </div>
        </div>
        <div className="sm-mini-stats">
          <div className="sm-mini-stat">
            <div className="sm-mini-val" style={{ color: 'var(--accent)' }}>{totalCanciones}</div>
            <div className="sm-mini-lbl">Canciones</div>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="sm-tabs" role="tablist">
        <button
          type="button"
          className={['sm-tab', pestaña === 'info' ? 'active' : ''].join(' ')}
          role="tab"
          aria-selected={pestaña === 'info'}
          onClick={() => cambiarPestaña('info')}
        >
          <i className="bi bi-person-fill me-1"></i> Información
        </button>
        <button
          type="button"
          className={['sm-tab', pestaña === 'security' ? 'active' : ''].join(' ')}
          role="tab"
          aria-selected={pestaña === 'security'}
          onClick={() => cambiarPestaña('security')}
        >
          <i className="bi bi-shield-lock me-1"></i> Seguridad
        </button>
        <button
          type="button"
          className={['sm-tab', pestaña === 'prefs' ? 'active' : ''].join(' ')}
          role="tab"
          aria-selected={pestaña === 'prefs'}
          onClick={() => cambiarPestaña('prefs')}
        >
          <i className="bi bi-sliders me-1"></i> Preferencias
        </button>
      </div>

      {/* Tab 1: Información personal */}
      <div className={['sm-tab-panel', pestaña === 'info' ? 'active' : ''].join(' ')} role="tabpanel">
        <div className="sm-section">
          <h3 className="sm-section-title">
            <i className="bi bi-person-vcard me-2" style={{ color: 'var(--accent)' }}></i>Datos personales
          </h3>
          <form id="profileForm" noValidate onSubmit={guardarPerfil}>
            <div className="sm-fields-grid">
              <div className="sm-field">
                <label className="sm-label" htmlFor="pNombres">Nombres</label>
                <input
                  type="text"
                  id="pNombres"
                  className="sm-input"
                  autoComplete="given-name"
                  aria-required="true"
                  value={nombres}
                  onChange={e => setNombres(e.target.value)}
                />
              </div>
              <div className="sm-field">
                <label className="sm-label" htmlFor="pApellidos">Apellidos</label>
                <input
                  type="text"
                  id="pApellidos"
                  className="sm-input"
                  autoComplete="family-name"
                  aria-required="true"
                  value={apellidos}
                  onChange={e => setApellidos(e.target.value)}
                />
              </div>
              <div className="sm-field">
                <label className="sm-label" htmlFor="pCedula">Número de cédula</label>
                <div className="sm-input-group">
                  <input type="text" id="pCedula" className="sm-input" value="••••••••••" disabled />
                  <i className="bi bi-lock-fill sm-input-icon" style={{ pointerEvents: 'none' }} aria-hidden="true"></i>
                </div>
                <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>
                  La cédula no puede modificarse. Contacta soporte.
                </span>
              </div>
              <div className="sm-field">
                <label className="sm-label" htmlFor="pFecha">Fecha de nacimiento</label>
                <input
                  type="date"
                  id="pFecha"
                  className="sm-input"
                  aria-required="true"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </div>
              <div className="sm-field sm-full-col">
                <label className="sm-label" htmlFor="pEmail">Correo electrónico</label>
                <div className="sm-input-group">
                  <input
                    type="email"
                    id="pEmail"
                    className="sm-input"
                    autoComplete="email"
                    aria-required="true"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <i className="bi bi-envelope sm-input-icon" aria-hidden="true"></i>
                </div>
              </div>
            </div>
            <div className="sm-btn-row">
              <button type="submit" className="sm-btn-primary" disabled={guardando}>
                <i className="bi bi-floppy-fill"></i> {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button type="button" className="sm-btn-ghost" onClick={volverIniciales}>
                <i className="bi bi-arrow-counterclockwise"></i> Descartar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tab 2: Seguridad */}
      <div className={['sm-tab-panel', pestaña === 'security' ? 'active' : ''].join(' ')} role="tabpanel">
        <div className="sm-section">
          <h3 className="sm-section-title">
            <i className="bi bi-shield-lock me-2" style={{ color: 'var(--accent)' }}></i>Cambiar contraseña
          </h3>
          <form id="passForm" noValidate onSubmit={guardarPassword}>
            <div className="sm-fields-grid">
              <div className="sm-field sm-full-col">
                <label className="sm-label" htmlFor="passActual">Contraseña actual</label>
                <div className="sm-input-group">
                  <input
                    type={mostrar.actual ? 'text' : 'password'}
                    id="passActual"
                    className="sm-input"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    value={passActual}
                    onChange={e => setPassActual(e.target.value)}
                  />
                  <i className="bi bi-eye sm-input-icon" id="togPassActual" {...toggleProps('actual')}></i>
                </div>
              </div>
              <div className="sm-field">
                <label className="sm-label" htmlFor="passNew">Nueva contraseña</label>
                <div className="sm-input-group">
                  <input
                    type={mostrar.nueva ? 'text' : 'password'}
                    id="passNew"
                    className="sm-input"
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    value={passNew}
                    onChange={e => setPassNew(e.target.value)}
                  />
                  <i className="bi bi-eye sm-input-icon" id="togPassNew" {...toggleProps('nueva')}></i>
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', marginTop: '.2rem' }}>
                  Usa al menos 8 caracteres con letras y números
                </div>
              </div>
              <div className="sm-field">
                <label className="sm-label" htmlFor="passNewConf">Confirmar nueva contraseña</label>
                <div className="sm-input-group">
                  <input
                    type={mostrar.conf ? 'text' : 'password'}
                    id="passNewConf"
                    className="sm-input"
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    value={passNewConf}
                    onChange={e => setPassNewConf(e.target.value)}
                  />
                  <i className="bi bi-eye sm-input-icon" id="togPassNewConf" {...toggleProps('conf')}></i>
                </div>
              </div>
            </div>
            <div className="sm-btn-row">
              <button type="submit" className="sm-btn-primary">
                <i className="bi bi-key-fill"></i> Actualizar contraseña
              </button>
              <button type="button" className="sm-btn-danger-ghost" onClick={cerrarTodasLasSesiones}>
                <i className="bi bi-box-arrow-right"></i> Cerrar todas las sesiones
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tab 3: Preferencias */}
      <div className={['sm-tab-panel', pestaña === 'prefs' ? 'active' : ''].join(' ')} role="tabpanel">
        <div className="sm-section">
          <h3 className="sm-section-title">
            <i className="bi bi-sliders me-2" style={{ color: 'var(--accent)' }}></i>Preferencias musicales y del sistema
          </h3>
          <div className="sm-fields-grid">
            <div className="sm-field">
              <label className="sm-label" htmlFor="prefGenre">Género favorito</label>
              <select id="prefGenre" className="sm-input" defaultValue="Rock">
                <option>Rock</option><option>Pop</option><option>Electrónica</option>
                <option>Latina</option><option>Jazz</option><option>Clásica</option>
              </select>
            </div>
            <div className="sm-field">
              <label className="sm-label" htmlFor="prefLang">Idioma de la interfaz</label>
              <select id="prefLang" className="sm-input" defaultValue="Español (Colombia)">
                <option>Español (Colombia)</option>
                <option>English (US)</option>
              </select>
            </div>
            <div className="sm-field sm-full-col">
              <label className="sm-label">Notificaciones</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.2rem' }}>
                <label style={{ fontSize: '.84rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} />
                  Notificar por correo cuando se inicie sesión desde un dispositivo nuevo
                </label>
                <label style={{ fontSize: '.84rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
                  Recibir resumen semanal de actividad musical
                </label>
              </div>
            </div>
          </div>
          <div className="sm-btn-row">
            <button type="button" className="sm-btn-primary" onClick={mostrarToast}>
              <i className="bi bi-floppy-fill"></i> Guardar preferencias
            </button>
          </div>
        </div>
      </div>

      {/* Toast guardado */}
      <div
        className={['sm-save-toast', guardado ? 'show' : ''].join(' ')}
        id="saveToast"
        role="status"
        aria-live="polite"
      >
        <i className="bi bi-check-circle-fill"></i> Cambios guardados correctamente
      </div>
    </>
  );
}

export default PerfilPage