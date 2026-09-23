// src/routes/auditoriaRoutes.js
'use strict';
const express   = require('express');
const router    = express.Router();
const Auditoria = require('../models/Auditoria');

// GET /api/auditoria
router.get('/', async (req, res) => {
  try {
    const { pool } = require('../config/db');
    const [rows] = await pool.execute(`
      SELECT a.id_auditoria, t.nombre AS tipo_op,
             o.descripcion, a.tabla_afectada, a.fecha
      FROM   auditoria a
      JOIN   operacion o ON a.id_operacion = o.id_operacion
      JOIN   tipo_operacion t ON o.id_tipo = t.id_tipo
      ORDER  BY a.fecha DESC
      LIMIT  100
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
});

module.exports = router;
