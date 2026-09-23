// public/js/registro.js
'use strict';

const form    = document.getElementById('form-registro');
const msgBox  = document.getElementById('msg-box');
const btnReg  = document.getElementById('btn-registro');

function mostrarMsg(texto, tipo = 'error') {
  msgBox.textContent = texto;
  msgBox.className = `msg-box ${tipo}`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre    = document.getElementById('nombre').value.trim();
  const email     = document.getElementById('email').value.trim();
  const password  = document.getElementById('password').value;
  const confirmar = document.getElementById('confirmar').value;

  if (password !== confirmar) {
    mostrarMsg('Las contraseñas no coinciden.');
    return;
  }

  btnReg.disabled = true;
  btnReg.textContent = 'Creando cuenta...';

  try {
    const res  = await fetch('/api/auth/registro', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ nombre, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      mostrarMsg(data.mensaje || 'Error al crear la cuenta.');
      return;
    }

    mostrarMsg('Cuenta creada correctamente. Redirigiendo...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);

  } catch (err) {
    mostrarMsg('No se pudo conectar con el servidor.');
  } finally {
    btnReg.disabled = false;
    btnReg.textContent = 'Crear Cuenta';
  }
});
