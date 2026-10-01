// test/helpers/baseDatos.js
// Prepara la base de datos de PRUEBAS: vacía las tablas y siembra los tipos de operación usados por el código.
'use strict';
const { pool } = require('../../src/config/db');

const TIPOS = [
  [1, 'INSERT', 'Creación de registro'],
  [2, 'UPDATE', 'Actualización de registro'],
  [3, 'DELETE', 'Eliminación de registro'],
  [4, 'LOGIN',  'Inicio de sesión'],
];

async function reiniciar() {
  // Protección: nunca vaciar una base que no sea de pruebas
  if (!/_test$/.test(process.env.DB_NAME || '')) {
    throw new Error('DB_NAME debe terminar en _test para ejecutar pruebas de integración.');
  }
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of ['auditoria', 'operacion', 'sesion', 'cancion', 'usuario', 'tipo_operacion']) {
    await pool.query(`TRUNCATE TABLE ${t}`);
  }
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  for (const [id, nombre, descripcion] of TIPOS) {
    await pool.query('INSERT INTO tipo_operacion (id_tipo, nombre, descripcion) VALUES (?, ?, ?)', [id, nombre, descripcion]);
  }
}

module.exports = { reiniciar, pool };
