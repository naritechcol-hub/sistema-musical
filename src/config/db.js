// src/config/db.js
// Módulo de conexión a MySQL usando mysql2/promise
// Se usa la versión /promise para poder usar async/await en todo el proyecto

'use strict';
require('dotenv').config();
const mysql = require('mysql2/promise');

// createPool crea un grupo de conexiones reutilizables.
// Es más eficiente que abrir y cerrar una conexión por cada consulta.
const pool = mysql.createPool({
  host     : process.env.DB_HOST,
  port     : process.env.DB_PORT,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
  waitForConnections : true,
  connectionLimit    : 10,
  queueLimit         : 0
});

// Función para verificar que la conexión funciona al arrancar
async function verificarConexion() {
  try {
    const conn = await pool.getConnection();
    console.log('✔  Conexión a MySQL establecida correctamente.');
    conn.release(); // Devolver la conexión al pool
  } catch (error) {
    console.error('✖  Error al conectar con MySQL:', error.message);
    process.exit(1); // Detener la aplicación si no hay conexión
  }
}

module.exports = { pool, verificarConexion };
