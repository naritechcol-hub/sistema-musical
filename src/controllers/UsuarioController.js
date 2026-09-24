// src/controllers/UsuarioController.js
'use strict';
const Usuario   = require('../models/Usuario');
const Auditoria = require('../models/Auditoria');

// IDs de tipo_operacion (deben coincidir con los registros en BD)
const TIPO = { INSERT: 1, UPDATE: 2, DELETE: 3, LOGIN: 4 };

class UsuarioController {

  static async registrar(nombre, apellidos, cedula, fecha_nac, email, password) {
    // Compatibilidad con la consola (index.js llama con 3 argumentos: nombre, email, password)
    if (fecha_nac === undefined) {
      email    = apellidos;
      password = cedula;
      apellidos = null;
      cedula = null;
      fecha_nac = null;
    }

    // Verificar que el email no esté ya registrado
    const existe = await Usuario.buscarPorEmail(email);
    if (existe) throw new Error('El email ya está registrado.');

    // Guarda los 6 campos: nombre, apellidos, cédula, fecha de nacimiento, email y contraseña
    const idUsuario = await Usuario.crear(nombre, apellidos, cedula, fecha_nac, email, password);

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

  // Actualiza los datos personales editables de un usuario (RF17)
  static async actualizar(idUsuario, datos) {
    const { nombre, apellidos, fecha_nac, email } = datos;

    if (!nombre || !email) {
      throw new Error('Nombre y correo son obligatorios.');
    }

    const existe = await Usuario.buscarPorEmail(email);
    if (existe && existe.id_usuario != idUsuario) {
      throw new Error('El email ya está registrado.');
    }

    const actualizado = await Usuario.actualizar(idUsuario, { nombre, apellidos, fecha_nac, email });
    if (!actualizado) {
      throw new Error('Usuario no encontrado.');
    }

    // Registrar en auditoría
    await Auditoria.registrar(
      idUsuario, TIPO.UPDATE,
      `Actualización de perfil: ${email}`,
      'usuario', null, { nombre, email }
    );
    return { mensaje: 'Perfil actualizado correctamente.' };
  }
}

module.exports = UsuarioController;
