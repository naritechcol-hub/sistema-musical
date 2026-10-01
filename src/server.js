// src/server.js
// Arranque del servidor Express — API REST del Sistema Musical
// Jeinner Antony Valencia Ortiz — SENA Ficha 3336169
'use strict';

require('dotenv').config();
const app  = require('./app');
const { verificarConexion } = require('./config/db');

const PORT = process.env.PORT || 3000;

// ── ARRANQUE ──────────────────────────────────────────────
async function iniciar() {
  await verificarConexion();
  app.listen(PORT, () => {
    console.log(`✔  Servidor corriendo en el puerto ${PORT}`);
    console.log(`   Abre tu navegador en: http://localhost:${PORT}`);
  });
}

iniciar().catch(err => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
