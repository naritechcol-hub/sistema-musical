// src/controllers/CancionController.js
'use strict';
const Cancion   = require('../models/Cancion');
const Auditoria = require('../models/Auditoria');

const TIPO = { INSERT: 1, UPDATE: 2, DELETE: 3 };

class CancionController {

  static async agregar(titulo, artista, genero, anio, idUsuario) {
    const id = await Cancion.crear(titulo, artista, genero, anio);
    await Auditoria.registrar(
      idUsuario, TIPO.INSERT,
      `Canción agregada: ${titulo} - ${artista}`,
      'cancion', null, { titulo, artista, genero, anio }
    );
    return id;
  }

  static async listar() {
    return await Cancion.listarTodas();
  }

  static async buscarPorGenero(genero) {
    return await Cancion.buscarPorGenero(genero);
  }

  static async eliminar(idCancion, idUsuario) {
    await Cancion.eliminar(idCancion);
    await Auditoria.registrar(
      idUsuario, TIPO.DELETE,
      `Canción eliminada: ID ${idCancion}`,
      'cancion', { idCancion }, null
    );
  }
}

module.exports = CancionController;