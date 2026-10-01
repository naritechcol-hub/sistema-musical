// src/config/db.js
// Módulo de conexión a MySQL usando mysql2/promise
// Se usa la versión /promise para poder usar async/await en todo el proyecto

'use strict';
require('dotenv').config();
const mysql = require('mysql2/promise');

// TLS opcional: los servicios gestionados (por ejemplo Aiven) exigen conexión cifrada.
// DB_SSL=true activa TLS; DB_SSL_CA puede traer el certificado de la CA en texto
// (con saltos de línea escritos como \n si la plataforma no admite multilínea).
function opcionesSsl() {
  if (String(process.env.DB_SSL || '').toLowerCase() !== 'true') return undefined;
  const ssl = { rejectUnauthorized: true };
  if (process.env.DB_SSL_CA) ssl.ca = process.env.DB_SSL_CA.replace(/\\n/g, '\n');
  return ssl;
}

// createPool crea un grupo de conexiones reutilizables.
// Es más eficiente que abrir y cerrar una conexión por cada consulta.
const pool = mysql.createPool({
  host     : process.env.DB_HOST,
  port     : Number(process.env.DB_PORT) || 3306,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
  ssl      : opcionesSsl(),
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

module.exports = { pool, verificarConexion, opcionesSsl };
