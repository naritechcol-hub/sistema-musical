// src/models/Cancion.js
'use strict';
const { pool } = require('../config/db');

class Cancion {

  static async crear(titulo, artista, genero, anio) {
    const [result] = await pool.execute(
      'INSERT INTO cancion (titulo, artista, genero, anio) VALUES (?, ?, ?, ?)',
      [titulo, artista, genero, anio]
    );
    return result.insertId;
  }

  static async listarTodas() {
    const [rows] = await pool.execute(
      'SELECT * FROM cancion ORDER BY artista, titulo'
    );
    return rows;
  }

  static async buscarPorGenero(genero) {
    const [rows] = await pool.execute(
      'SELECT * FROM cancion WHERE genero = ? ORDER BY titulo',
      [genero]
    );
    return rows;
  }

  static async eliminar(idCancion) {
    await pool.execute(
      'DELETE FROM cancion WHERE id_cancion = ?',
      [idCancion]
    );
  }
}

module.exports = Cancion;
