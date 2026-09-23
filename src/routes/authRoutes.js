// src/routes/authRoutes.js
'use strict';
const express = require('express');
const router  = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
  const { nombre, apellidos, cedula, fecha_nac, email, password } = req.body;
  if (!nombre || !apellidos || !cedula || !fecha_nac || !email || !password) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
  }
  try {
    const id = await UsuarioController.registrar(nombre, apellidos, cedula, fecha_nac, email, password);
    res.status(201).json({ mensaje: 'Usuario creado correctamente.', id });
  } catch (err) {
    res.status(400).json({ mensaje: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios.' });
  }
  try {
    const usuario = await UsuarioController.iniciarSesion(email, password);
    // Devolver datos del usuario sin la contraseña
    res.json({
      mensaje: 'Sesión iniciada correctamente.',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        email:      usuario.email
      }
    });
  } catch (err) {
    res.status(401).json({ mensaje: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ mensaje: 'Sesión cerrada.' });
});

module.exports = router;
