// public/js/login.js
// Lógica del formulario de inicio de sesión
// Se comunica con la API REST del backend (Express) mediante fetch()

'use strict';

const form    = document.getElementById('form-login');
const msgBox  = document.getElementById('msg-box');
const btnLogin = document.getElementById('btn-login');

function mostrarMsg(texto, tipo = 'error') {
  msgBox.textContent = texto;
  msgBox.className = `msg-box ${tipo}`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  btnLogin.disabled = true;
  btnLogin.textContent = 'Verificando...';

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res  = await fetch('/api/auth/login', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      mostrarMsg(data.mensaje || 'Credenciales incorrectas.');
      return;
    }

    // Guardar datos de sesión en sessionStorage
    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
    // Redirigir al dashboard
    window.location.href = 'dashboard.html';

  } catch (err) {
    mostrarMsg('No se pudo conectar con el servidor. Verifica que está en ejecución.');
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = 'Iniciar Sesión';
  }
});
