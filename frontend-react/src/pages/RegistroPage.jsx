// src/pages/RegistroPage.jsx
// Registro de usuario — valida 6 campos y los envía completos a /api/auth/registro (RF04)
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { peticion } from '../utils/api.js'
import PageFooter from '../components/PageFooter.jsx'
import '../styles/registro.css'

const RE_CEDULA = /^\d{6,10}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegistroPage() {
  const navigate = useNavigate();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [cedula, setCedula] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [passConf, setPassConf] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mostrarConf, setMostrarConf] = useState(false);
  const [errores, setErrores] = useState({}); // { campo: mensaje }
  const [toast, setToast] = useState(null);    // { tipo, texto }
  const [enviando, setEnviando] = useState(false);

  // Valida un campo y devuelve true si es correcto
  function validar(campo, valor) {
    switch (campo) {
      case 'nombres':   return valor.trim().length >= 2;
      case 'apellidos': return valor.trim().length >= 2;
      case 'cedula':    return RE_CEDULA.test(valor.trim());
      case 'fechaNac':  return valor !== '';
      case 'email':     return RE_EMAIL.test(valor.trim());
      case 'pass':      return valor.length >= 8;
      default:          return true;
    }
  }

  // Limpia el error de un campo al editar
  function editar(campo, valor, setter) {
    setter(valor);
    setErrores(prev => {
      const copia = { ...prev };
      delete copia[campo];
      return copia;
    });
    setToast(null);
  }

  function alternarPass() { setMostrarPass(m => !m); }
  function alternarConf() { setMostrarConf(m => !m); }

  async function submit(e) {
    e.preventDefault();

    const campos = [
      { campo: 'nombres',   valor: nombres,   error: 'El nombre debe tener mínimo 2 caracteres.' },
      { campo: 'apellidos', valor: apellidos, error: 'El apellido debe tener mínimo 2 caracteres.' },
      { campo: 'cedula',    valor: cedula,    error: 'Cédula inválida (6–10 dígitos numéricos).' },
      { campo: 'fechaNac',  valor: fechaNac,  error: 'Ingresa una fecha válida.' },
      { campo: 'email',     valor: email,     error: 'Formato de correo inválido.' },
      { campo: 'pass',      valor: pass,      error: 'La contraseña debe tener mínimo 8 caracteres.' },
    ];

    const nuevosErrores = {};
    campos.forEach(({ campo, valor, error }) => {
      if (!validar(campo, valor)) nuevosErrores[campo] = error;
    });

    if (pass !== passConf) nuevosErrores.passConf = 'Las contraseñas no coinciden.';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);

    try {
      // Envía los 6 campos: nombre completo, apellidos, cédula, fecha, email y contraseña
      const data = await peticion('/api/auth/registro', {
        method: 'POST',
        body: {
          nombre: `${nombres.trim()} ${apellidos.trim()}`,
          apellidos: apellidos.trim(),
          cedula: cedula.trim(),
          fecha_nac: fechaNac,
          email: email.trim(),
          password: pass,
        },
      });
      setToast({ tipo: 'success', texto: data.mensaje || 'Cuenta creada correctamente. Redirigiendo al login...' });
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setToast({ tipo: 'error', texto: err.message });
    } finally {
      setEnviando(false);
    }
  }

  const inputClass = (campo) =>
    (['sm-input', errores[campo] ? 'is-invalid' : '', errores[campo] === undefined && ''].join(' ')).trim();

  return (
    <div className="sm-page">
      <nav className="sm-navbar" role="banner">
        <Link to="/login" className="sm-brand">
          <i className="bi bi-music-note-beamed"></i> SoundManager
        </Link>
        <div className="sm-step-bar" aria-label="Progreso del registro">
          <div className="sm-step active" aria-current="step">1</div>
          <div className="sm-step-line"></div>
          <div className="sm-step">2</div>
          <div className="sm-step-line"></div>
          <div className="sm-step">3</div>
          <span style={{ marginLeft: '.3rem' }}>Paso 1 de 3 — Datos personales</span>
        </div>
      </nav>

      <main className="sm-main" role="main">
        <div className="sm-card" role="region" aria-label="Formulario de registro">
          <h1 className="sm-card-title">Crear Cuenta</h1>
          <p className="sm-card-subtitle">Completa los datos para registrarte en SoundManager</p>
          <hr className="sm-divider" />

          <div
            className={['sm-toast', toast ? toast.tipo : ''].join(' ')}
            role="alert"
            aria-live="polite"
          >
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{toast ? toast.texto : ''}</span>
          </div>

          <p className="sm-required-note">Los campos marcados con <span>*</span> son obligatorios.</p>

          <form id="registerForm" noValidate onSubmit={submit}>
            <div className="sm-row">
              <div className="sm-field">
                <label className="sm-label" htmlFor="nombres">Nombres <span className="required">*</span></label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  className={inputClass('nombres')}
                  placeholder="Ej: Jeinner Antony"
                  autoComplete="given-name"
                  aria-required="true"
                  aria-describedby="nombres-msg"
                  value={nombres}
                  onChange={e => editar('nombres', e.target.value, setNombres)}
                />
                <span className={['sm-error-msg', errores.nombres ? 'show' : ''].join(' ')} id="nombres-msg" role="alert">
                  <i className="bi bi-exclamation-circle"></i> {errores.nombres}
                </span>
              </div>
              <div className="sm-field">
                <label className="sm-label" htmlFor="apellidos">Apellidos <span className="required">*</span></label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  className={inputClass('apellidos')}
                  placeholder="Ej: Valencia Ortiz"
                  autoComplete="family-name"
                  aria-required="true"
                  aria-describedby="apellidos-msg"
                  value={apellidos}
                  onChange={e => editar('apellidos', e.target.value, setApellidos)}
                />
                <span className={['sm-error-msg', errores.apellidos ? 'show' : ''].join(' ')} id="apellidos-msg" role="alert">
                  <i className="bi bi-exclamation-circle"></i> {errores.apellidos}
                </span>
              </div>
            </div>

            <div className="sm-field">
              <label className="sm-label" htmlFor="cedula">Número de Cédula <span className="required">*</span></label>
              <div className="sm-input-group">
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  className={inputClass('cedula')}
                  placeholder="Ej: 1234567890"
                  inputMode="numeric"
                  maxLength="10"
                  autoComplete="off"
                  aria-required="true"
                  aria-describedby="cedula-msg"
                  value={cedula}
                  onChange={e => editar('cedula', e.target.value.replace(/\D/g, ''), setCedula)}
                />
                <i className="bi bi-credit-card sm-input-icon" aria-hidden="true"></i>
              </div>
              <span style={{ fontSize: '.73rem', color: 'var(--text-sub)' }}>6 a 10 dígitos numéricos</span>
              <span className={['sm-error-msg', errores.cedula ? 'show' : ''].join(' ')} id="cedula-msg" role="alert">
                <i className="bi bi-exclamation-circle"></i> {errores.cedula}
              </span>
            </div>

            <div className="sm-field">
              <label className="sm-label" htmlFor="fechaNac">Fecha de Nacimiento <span className="required">*</span></label>
              <div className="sm-input-group">
                <input
                  type="date"
                  id="fechaNac"
                  name="fechaNac"
                  className={inputClass('fechaNac')}
                  aria-required="true"
                  aria-describedby="fecha-msg"
                  value={fechaNac}
                  onChange={e => editar('fechaNac', e.target.value, setFechaNac)}
                />
                <i className="bi bi-calendar3 sm-input-icon" style={{ pointerEvents: 'none' }} aria-hidden="true"></i>
              </div>
              <span className={['sm-error-msg', errores.fechaNac ? 'show' : ''].join(' ')} id="fecha-msg" role="alert">
                <i className="bi bi-exclamation-circle"></i> {errores.fechaNac}
              </span>
            </div>

            <div className="sm-field">
              <label className="sm-label" htmlFor="emailReg">Correo electrónico <span className="required">*</span></label>
              <div className="sm-input-group">
                <input
                  type="email"
                  id="emailReg"
                  name="email"
                  className={inputClass('email')}
                  placeholder="ejemplo@correo.com"
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby="email-msg"
                  value={email}
                  onChange={e => editar('email', e.target.value, setEmail)}
                />
                <i className="bi bi-envelope sm-input-icon" aria-hidden="true"></i>
              </div>
              <span className={['sm-error-msg', errores.email ? 'show' : ''].join(' ')} id="email-msg" role="alert">
                <i className="bi bi-exclamation-circle"></i> {errores.email}
              </span>
            </div>

            <div className="sm-row">
              <div className="sm-field">
                <label className="sm-label" htmlFor="passReg">Contraseña <span className="required">*</span></label>
                <div className="sm-input-group">
                  <input
                    type={mostrarPass ? 'text' : 'password'}
                    id="passReg"
                    name="password"
                    className={inputClass('pass')}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    aria-required="true"
                    aria-describedby="pass-msg"
                    value={pass}
                    onChange={e => editar('pass', e.target.value, setPass)}
                  />
                  <i
                    className={['bi', mostrarPass ? 'bi-eye-slash' : 'bi-eye', 'sm-input-icon'].join(' ')}
                    id="togglePassReg"
                    role="button"
                    tabIndex="0"
                    aria-label="Mostrar contraseña"
                    onClick={alternarPass}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') alternarPass(); }}
                  ></i>
                </div>
                <span className={['sm-error-msg', errores.pass ? 'show' : ''].join(' ')} id="pass-msg" role="alert">
                  <i className="bi bi-exclamation-circle"></i> {errores.pass}
                </span>
              </div>
              <div className="sm-field">
                <label className="sm-label" htmlFor="passConf">Confirmar contraseña <span className="required">*</span></label>
                <div className="sm-input-group">
                  <input
                    type={mostrarConf ? 'text' : 'password'}
                    id="passConf"
                    name="passConf"
                    className={inputClass('passConf')}
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    aria-required="true"
                    aria-describedby="passConf-msg"
                    value={passConf}
                    onChange={e => editar('passConf', e.target.value, setPassConf)}
                  />
                  <i
                    className={['bi', mostrarConf ? 'bi-eye-slash' : 'bi-eye', 'sm-input-icon'].join(' ')}
                    id="togglePassConf"
                    role="button"
                    tabIndex="0"
                    aria-label="Mostrar confirmación"
                    onClick={alternarConf}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') alternarConf(); }}
                  ></i>
                </div>
                <span className={['sm-error-msg', errores.passConf ? 'show' : ''].join(' ')} id="passConf-msg" role="alert">
                  <i className="bi bi-exclamation-circle"></i> {errores.passConf}
                </span>
              </div>
            </div>

            <div className="sm-btn-row">
              <Link to="/login" className="sm-btn-secondary">
                <i className="bi bi-x-lg" aria-hidden="true"></i> CANCELAR
              </Link>
              <button type="submit" className="sm-btn-primary" disabled={enviando}>
                <i className="bi bi-person-check me-1" aria-hidden="true"></i>
                {enviando ? ' Registrando...' : ' REGISTRAR'}
              </button>
            </div>
          </form>

          <div className="sm-secure">
            <i className="bi bi-lock-fill" aria-hidden="true"></i>
            Sus datos están protegidos y no serán compartidos con terceros
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}

export default RegistroPage