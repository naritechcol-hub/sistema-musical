// src/pages/LoginPage.jsx
// Inicio de sesión — POST /api/auth/login y guarda sesión en sm_usuario
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { peticion } from '../utils/api.js'
import { guardarUsuario, estaAutenticado } from '../utils/session.js'
import PageFooter from '../components/PageFooter.jsx'
import '../styles/login.css'

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Si ya hay sesión activa, se redirige al dashboard
  useEffect(() => {
    if (estaAutenticado()) navigate('/dashboard', { replace: true });
  }, [navigate]);

  const apto = Boolean(email.trim() && password.trim());

  function alternarPass() {
    setMostrarPass(m => !m);
  }

  function cadaCampoLleno() {
    setErrorMsg('');
  }

  async function submit(e) {
    e.preventDefault();
    if (!apto || enviando) return;

    setEnviando(true);
    setErrorMsg('');
    setExitoMsg('');

    try {
      const data = await peticion('/api/auth/login', {
        method: 'POST',
        body: { email: email.trim(), password },
      });
      guardarUsuario(data.usuario);
      setExitoMsg(`Bienvenido, ${data.usuario.nombre}. Redirigiendo...`);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const inputClass = (err) => (['sm-input', err ? 'is-invalid' : '']).join(' ');

  return (
    <div className="sm-page">
      <nav className="sm-navbar" role="banner">
        <a href="#" className="sm-brand" style={{ fontSize: '1.15rem' }} aria-label="SoundManager inicio">
          <i className="bi bi-music-note-beamed"></i> SoundManager
        </a>
        <span className="sm-navbar-right">v1.0 &nbsp;|&nbsp; NariTech Solutions</span>
      </nav>

      <main className="sm-main" role="main">
        <div className="sm-card" role="region" aria-label="Formulario de inicio de sesión">
          <h1 className="sm-card-title">Iniciar Sesión</h1>
          <p className="sm-card-subtitle">Ingresa tus credenciales para acceder al sistema</p>
          <hr className="sm-divider" />

          <div
            className={['sm-toast', errorMsg ? 'show' : ''].join(' ')}
            role="alert"
            aria-live="polite"
          >
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{errorMsg}</span>
          </div>

          <div
            className={['sm-toast-success', exitoMsg ? 'show' : ''].join(' ')}
            role="status"
            aria-live="polite"
          >
            <i className="bi bi-check-circle-fill"></i>
            <span>{exitoMsg}</span>
          </div>

          <form id="loginForm" noValidate onSubmit={submit}>
            <div className="mb-1">
              <label className="sm-label" htmlFor="email">Usuario / Correo electrónico</label>
            </div>
            <div className="sm-input-group">
              <input
                type="email"
                id="email"
                name="email"
                className={inputClass(Boolean(errorMsg))}
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                aria-required="true"
                value={email}
                onChange={e => { setEmail(e.target.value); cadaCampoLleno(); }}
              />
              <i className="bi bi-envelope sm-input-icon" aria-hidden="true"></i>
            </div>

            <div className="mb-1">
              <label className="sm-label" htmlFor="password">Contraseña</label>
            </div>
            <div className="sm-input-group">
              <input
                type={mostrarPass ? 'text' : 'password'}
                id="password"
                name="password"
                className={inputClass(Boolean(errorMsg))}
                placeholder="••••••••••••"
                autoComplete="current-password"
                aria-required="true"
                value={password}
                onChange={e => { setPassword(e.target.value); cadaCampoLleno(); }}
              />
              <i
                className={['bi', mostrarPass ? 'bi-eye-slash' : 'bi-eye', 'sm-input-icon'].join(' ')}
                id="togglePass"
                role="button"
                tabIndex="0"
                aria-label="Mostrar u ocultar contraseña"
                onClick={alternarPass}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') alternarPass(); }}
              ></i>
            </div>

            <div className="sm-check-row">
              <label className="sm-check">
                <input type="checkbox" id="remember" name="remember" />
                Recordarme
              </label>
              <Link to="/error" className="sm-forgot">¿Olvidó su contraseña?</Link>
            </div>

            <button type="submit" className="sm-btn-primary" disabled={!apto || enviando}>
              {enviando ? (
                <><i className="bi bi-hourglass-split me-1" aria-hidden="true"></i> Verificando...</>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-1" aria-hidden="true"></i> INGRESAR</>
              )}
            </button>
          </form>

          <div className="sm-or">o</div>

          <div className="sm-card-footer">
            ¿No tiene cuenta?&nbsp;
            <Link to="/registro">Regístrese aquí</Link>
          </div>

          <div className="sm-secure" aria-label="Conexión local segura">
            <i className="bi bi-lock-fill" aria-hidden="true"></i>
            Sistema local — NariTech Solutions
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}

export default LoginPage