// src/pages/ErrorPage.jsx
// Notificación de error con 4 escenarios (validación, autenticación, sesión, servidor)
import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import PageFooter from '../components/PageFooter.jsx'
import '../styles/error.css'

const TITULOS = {
  validation: '¡Error de Validación!',
  auth:       '¡Error de Autenticación!',
  session:    '¡Sesión Expirada!',
  server:     '¡Error del Servidor!',
};

const SUBTITULOS = {
  validation: 'Se encontraron los siguientes problemas. Por favor corrígelos e intenta de nuevo.',
  auth:       'No fue posible verificar tus credenciales. Revisa la información.',
  session:    'Tu sesión no es válida o ha expirado. Vuelve a iniciar sesión.',
  server:     'Ocurrió un problema al procesar tu solicitud. Inténtalo más tarde.',
};

// Escenarios de error fieles a public-legacy/03-error.html
const ESCENARIOS = {
  validation: {
    code: 'ERR_VALIDATION_422',
    items: [
      { type: 'error', icon: 'bi-x-circle-fill',              pre: 'El campo ',                strong: 'Usuario / Correo', post: ' no puede estar vacío.' },
      { type: 'error', icon: 'bi-x-circle-fill',              pre: 'La ',                      strong: 'contraseña',       post: ' debe tener mínimo 8 caracteres.' },
      { type: 'error', icon: 'bi-x-circle-fill',              pre: 'La ',                      strong: 'cédula',           post: ' ingresada no es válida (6–10 dígitos numéricos).' },
    ],
  },
  auth: {
    code: 'ERR_AUTH_401',
    items: [
      { type: 'error', icon: 'bi-shield-x',                   pre: 'Las ',                     strong: 'credenciales ingresadas son incorrectas', post: '.' },
      { type: 'warn',  icon: 'bi-exclamation-triangle-fill',  pre: 'Has realizado ',           strong: '3 intentos fallidos', post: '. Luego de 5 la cuenta será bloqueada.' },
      { type: 'info',  icon: 'bi-info-circle-fill',           pre: 'Si olvidaste tu contraseña, usa el enlace ', strong: '¿Olvidó su contraseña?', post: '.' },
    ],
  },
  session: {
    code: 'ERR_SESSION_EXPIRED_403',
    items: [
      { type: 'warn', icon: 'bi-clock-history',               pre: 'Tu ',                      strong: 'sesión ha expirado', post: ' por inactividad. Vuelve a iniciar sesión.' },
      { type: 'info', icon: 'bi-info-circle-fill',            pre: 'Por seguridad, las sesiones expiran después de ', strong: '30 minutos', post: ' de inactividad.' },
    ],
  },
  server: {
    code: 'ERR_SERVER_500',
    items: [
      { type: 'error', icon: 'bi-exclamation-octagon-fill',   pre: 'Ocurrió un ',              strong: 'error interno del servidor', post: '.' },
      { type: 'warn',  icon: 'bi-wifi-off',                   pre: 'No fue posible establecer conexión con la ', strong: 'base de datos MySQL', post: '.' },
      { type: 'info',  icon: 'bi-info-circle-fill',           pre: 'Intenta de nuevo en unos minutos o contacta a ', strong: 'soporte@naritech.co', post: '.' },
    ],
  },
};

const VALIDOS = Object.keys(ESCENARIOS);

const NOMBRES = {
  validation: 'Validación',
  auth:       'Autenticación',
  session:    'Sesión',
  server:     'Servidor',
};

function ErrorPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const inicial = VALIDOS.includes(params.get('tipo')) ? params.get('tipo') : 'validation';
  const [escenario, setEscenario] = useState(inicial);

  const s = ESCENARIOS[escenario];
  // Marca de tiempo que se restablece al cambiar de escenario
  const marca = new Date().toLocaleTimeString('es-CO');

  return (
    <div className="sm-page">
      <nav className="sm-navbar" role="banner">
        <Link to="/login" className="sm-brand" style={{ fontSize: '1.15rem' }}>
          <i className="bi bi-music-note-beamed"></i> SoundManager
        </Link>
        <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>Notificación del sistema</span>
      </nav>

      <main className="sm-main" role="main">
        <div className="sm-error-card" role="alertdialog" aria-labelledby="errTitle" aria-describedby="errSubtitle">
          <div className="sm-err-icon" aria-hidden="true"><i className="bi bi-x-lg"></i></div>

          <h1 className="sm-err-title" id="errTitle">{TITULOS[escenario]}</h1>
          <p className="sm-err-subtitle" id="errSubtitle">{SUBTITULOS[escenario]}</p>
          <hr className="sm-divider" />

          <div className="sm-demo-bar">
            <span>Escenario:</span>
            {VALIDOS.map(key => (
              <button
                key={key}
                type="button"
                className={['sm-demo-btn', escenario === key ? 'active' : ''].join(' ')}
                onClick={() => setEscenario(key)}
              >
                {NOMBRES[key]}
              </button>
            ))}
          </div>

          <div className="sm-err-list" role="list" aria-label="Lista de errores">
            {s.items.map((item, i) => (
              <div key={i} className={['sm-err-item', item.type].join(' ')} role="listitem">
                <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                <span>
                  {item.pre}
                  <strong>{item.strong}</strong>
                  {item.post}
                </span>
              </div>
            ))}
          </div>

          <div className="sm-err-code">
            <i className="bi bi-code-slash"></i> Referencia técnica:
            <span>{s.code}</span>
            <span style={{ float: 'right' }}>{marca}</span>
          </div>

          <div className="sm-btn-row">
            <button type="button" className="sm-btn-ghost" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left" aria-hidden="true"></i> CANCELAR
            </button>
            <button type="button" className="sm-btn-danger" onClick={() => navigate(0)}>
              <i className="bi bi-arrow-clockwise" aria-hidden="true"></i> REINTENTAR
            </button>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}

export default ErrorPage