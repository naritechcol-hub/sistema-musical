// src/routes/usuarioRoutes.js
'use strict';
const express = require('express');
const router  = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

// GET /api/usuarios
router.get('/', async (req, res) => {
  try {
    const lista = await UsuarioController.listar();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
  try {
    const Usuario = require('../models/Usuario');
    await Usuario.desactivar(req.params.id);
    res.json({ mensaje: 'Usuario desactivado correctamente.' });
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
});

// PUT /api/usuarios/:id — actualiza el perfil del usuario
router.put('/:id', async (req, res) => {
  try {
    const resultado = await UsuarioController.actualizar(req.params.id, req.body);
    res.json(resultado);
  } catch (err) {
    res.status(400).json({ mensaje: err.message });
  }
});

module.exports = router;
