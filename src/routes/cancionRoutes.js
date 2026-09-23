// src/routes/cancionRoutes.js
'use strict';
const express = require('express');
const router  = express.Router();
const CancionController = require('../controllers/CancionController');

// GET /api/canciones
router.get('/', async (req, res) => {
  try {
    const lista = await CancionController.listar();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
});

// POST /api/canciones
router.post('/', async (req, res) => {
  const { titulo, artista, genero, anio, idUsuario } = req.body;
  if (!titulo || !artista) {
    return res.status(400).json({ mensaje: 'Título y artista son obligatorios.' });
  }
  try {
    const id = await CancionController.agregar(titulo, artista, genero, anio, idUsuario || 1);
    res.status(201).json({ mensaje: 'Canción agregada correctamente.', id });
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
});

// DELETE /api/canciones/:id
router.delete('/:id', async (req, res) => {
  try {
    await CancionController.eliminar(req.params.id, 1);
    res.json({ mensaje: 'Canción eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
});

module.exports = router;
