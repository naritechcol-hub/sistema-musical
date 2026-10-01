// src/app.js
// Ensamble de la aplicación Express (middlewares y rutas).
// Se separa de server.js para poder probar la API sin abrir el puerto de producción.
// Jeinner Antony Valencia Ortiz — SENA Ficha 3336169
'use strict';

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { pool } = require('./config/db');

// Importar rutas
const authRoutes      = require('./routes/authRoutes');
const usuarioRoutes   = require('./routes/usuarioRoutes');
const cancionRoutes   = require('./routes/cancionRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');

const app = express();

// CORS: si CORS_ORIGIN trae uno o varios orígenes separados por coma, solo esos
// podrán consumir la API (producción). Sin la variable, se permite cualquier origen (desarrollo).
function opcionesCors() {
  const lista = (process.env.CORS_ORIGIN || '')
    .split(',').map(o => o.trim()).filter(Boolean);
  return lista.length ? { origin: lista } : {};
}

// ── MIDDLEWARES ────────────────────────────────────────────
app.use(cors(opcionesCors()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS, JS del frontend)
app.use(express.static(path.join(__dirname, '../public')));

// ── SALUD DEL SERVICIO ─────────────────────────────────────
// Lo usa la plataforma de despliegue para saber si la API y la BD responden
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', base_datos: 'ok' });
  } catch (err) {
    res.status(503).json({ estado: 'degradado', base_datos: 'sin conexion' });
  }
});

// ── RUTAS API ──────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/usuarios',  usuarioRoutes);
app.use('/api/canciones', cancionRoutes);
app.use('/api/auditoria', auditoriaRoutes);

// Ruta raíz — redirige al login histórico (public-legacy)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public-legacy/01-login.html'));
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public-legacy/01-login.html'));
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

module.exports = app;
