// src/server.js
// Servidor Express — API REST del Sistema Musical
// Jeinner Antony Valencia Ortiz — SENA Ficha 3336169
'use strict';

require('dotenv').config();
const express  = require('express');
const path     = require('path');
const { verificarConexion } = require('./config/db');

// Importar rutas
const authRoutes     = require('./routes/authRoutes');
const usuarioRoutes  = require('./routes/usuarioRoutes');
const cancionRoutes  = require('./routes/cancionRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARES ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS, JS del frontend)
app.use(express.static(path.join(__dirname, '../public')));

// ── RUTAS API ──────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/canciones', cancionRoutes);
app.use('/api/auditoria', auditoriaRoutes);

// Ruta raíz — redirige al index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/01-login.html'));
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
 res.sendFile(path.join(__dirname, '../public/01-login.html'));
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

// ── ARRANQUE ──────────────────────────────────────────────
async function iniciar() {
  await verificarConexion();
  app.listen(PORT, () => {
    console.log(`✔  Servidor corriendo en http://localhost:${PORT}`);
    console.log(`   Abre tu navegador en: http://localhost:${PORT}`);
  });
}

iniciar().catch(err => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
