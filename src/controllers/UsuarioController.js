// src/controllers/UsuarioController.js
'use strict';
const Usuario   = require('../models/Usuario');
const Auditoria = require('../models/Auditoria');

// IDs de tipo_operacion (deben coincidir con los registros en BD)
const TIPO = { INSERT: 1, UPDATE: 2, DELETE: 3, LOGIN: 4 };

class UsuarioController {

  static async registrar(nombre, email, password) {
    // Verificar que el email no esté ya registrado
    const existe = await Usuario.buscarPorEmail(email);
    if (existe) throw new Error('El email ya está registrado.');

    const idUsuario = await Usuario.crear(nombre, email, password);

    // Registrar en auditoría
    await Auditoria.registrar(
      idUsuario, TIPO.INSERT,
      `Registro de nuevo usuario: ${email}`,
      'usuario', null, { nombre, email }
    );
    return idUsuario;
  }

  static async iniciarSesion(email, password) {
    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario) throw new Error('Credenciales incorrectas.');

    const valida = await Usuario.verificarPassword(password, usuario.password);
    if (!valida) throw new Error('Credenciales incorrectas.');

    await Auditoria.registrar(
      usuario.id_usuario, TIPO.LOGIN,
      `Inicio de sesión: ${email}`,
      'sesion', null, { email }
    );
    return usuario;
  }

  static async listar() {
    return await Usuario.listarActivos();
  }
}

module.exports = UsuarioController;
