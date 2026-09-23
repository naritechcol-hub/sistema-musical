// src/models/Auditoria.js
'use strict';
const { pool } = require('../config/db');

class Auditoria {

  // Registrar una operación y su entrada en auditoría
  static async registrar(idUsuario, idTipo, descripcion, tablaAfectada, datosAntes, datosDespues) {
    // 1. Insertar en tabla operacion
    const [opResult] = await pool.execute(
      'INSERT INTO operacion (id_usuario, id_tipo, descripcion) VALUES (?, ?, ?)',
      [idUsuario, idTipo, descripcion]
    );
    const idOperacion = opResult.insertId;

    // 2. Insertar en tabla auditoria
    await pool.execute(
      `INSERT INTO auditoria
        (id_operacion, tabla_afectada, datos_antes, datos_despues)
       VALUES (?, ?, ?, ?)`,
      [
        idOperacion,
        tablaAfectada,
        datosAntes  ? JSON.stringify(datosAntes)  : null,
        datosDespues? JSON.stringify(datosDespues): null
      ]
    );
    return idOperacion;
  }

  // Obtener historial de auditoría de un usuario
  static async historialPorUsuario(idUsuario) {
    const [rows] = await pool.execute(`
      SELECT a.id_auditoria, t.nombre AS tipo_op,
             o.descripcion, a.tabla_afectada, a.fecha
      FROM   auditoria a
      JOIN   operacion o ON a.id_operacion = o.id_operacion
      JOIN   tipo_operacion t ON o.id_tipo = t.id_tipo
      WHERE  o.id_usuario = ?
      ORDER  BY a.fecha DESC
      LIMIT  50`,
      [idUsuario]
    );
    return rows;
  }
}

module.exports = Auditoria;
