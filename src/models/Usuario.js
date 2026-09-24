// src/models/Usuario.js
'use strict';
const { pool } = require('../config/db');
const bcrypt    = require('bcrypt');

const SALT_ROUNDS = 10; // Factor de trabajo para bcrypt

class Usuario {
  // Crear un nuevo usuario con contraseña hasheada
static async crear(nombre, apellidos, cedula, fecha_nac, email, passwordPlano) {
  const hash = await bcrypt.hash(passwordPlano, SALT_ROUNDS);
  const sql = `INSERT INTO usuario (nombre, apellidos, cedula, fecha_nac, email, password)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const [result] = await pool.execute(sql,
    [nombre, apellidos, cedula, fecha_nac, email, hash]);
  return result.insertId;
}

  // Buscar usuario por email
  static async buscarPorEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuario WHERE email = ? AND activo = 1',
      [email]
    );
    return rows[0] || null;
  }

  // Verificar contraseña ingresada contra el hash almacenado
  static async verificarPassword(passwordPlano, hashAlmacenado) {
    return await bcrypt.compare(passwordPlano, hashAlmacenado);
  }

  // Listar todos los usuarios activos
  static async listarActivos() {
    const [rows] = await pool.execute(
      'SELECT id_usuario, nombre, email, created_at FROM usuario WHERE activo = 1'
    );
    return rows;
  }

  // Desactivar usuario (baja lógica, no elimina el registro)
  static async desactivar(idUsuario) {
    await pool.execute(
      'UPDATE usuario SET activo = 0 WHERE id_usuario = ?',
      [idUsuario]
    );
  }

  // Actualizar datos personales editables del usuario (la cédula no se modifica)
  static async actualizar(idUsuario, { nombre, apellidos, fecha_nac, email }) {
    const [result] = await pool.execute(
      'UPDATE usuario SET nombre = ?, apellidos = ?, fecha_nac = ?, email = ? WHERE id_usuario = ?',
      [nombre, apellidos, fecha_nac, email, idUsuario]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Usuario;
