// test/unit/usuario.controller.test.js
// El controlador se prueba aislado: modelos Usuario y Auditoria sustituidos.
'use strict';
const { describe, it, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const Usuario = require('../../src/models/Usuario');
const Auditoria = require('../../src/models/Auditoria');
const UsuarioController = require('../../src/controllers/UsuarioController');

describe('UsuarioController', () => {
  let m;
  beforeEach(() => {
    m = {
      buscar: mock.method(Usuario, 'buscarPorEmail', async () => null),
      crear: mock.method(Usuario, 'crear', async () => 21),
      verificar: mock.method(Usuario, 'verificarPassword', async () => true),
      actualizar: mock.method(Usuario, 'actualizar', async () => true),
      auditar: mock.method(Auditoria, 'registrar', async () => 1),
    };
  });
  afterEach(() => mock.restoreAll());

  it('registrar() con 6 campos persiste todos y audita el INSERT (RF04)', async () => {
    const id = await UsuarioController.registrar('Ana', 'Pérez', '1085', '1995-03-10', 'ana@correo.co', 'Clave1');
    assert.equal(id, 21);
    assert.deepEqual(m.crear.mock.calls[0].arguments, ['Ana', 'Pérez', '1085', '1995-03-10', 'ana@correo.co', 'Clave1']);
    assert.equal(m.auditar.mock.calls[0].arguments[1], 1);
  });

  it('registrar() rechaza un email ya registrado y no crea el usuario', async () => {
    m.buscar.mock.mockImplementation(async () => ({ id_usuario: 1 }));
    await assert.rejects(
      UsuarioController.registrar('Ana', 'P', '1', '2000-01-01', 'ana@correo.co', 'x'),
      { message: 'El email ya está registrado.' }
    );
    assert.equal(m.crear.mock.calls.length, 0);
  });

  it('registrar() mantiene la compatibilidad con la consola (3 argumentos)', async () => {
    await UsuarioController.registrar('Luis', 'luis@correo.co', 'Clave1');
    assert.deepEqual(m.crear.mock.calls[0].arguments, ['Luis', null, null, null, 'luis@correo.co', 'Clave1']);
  });

  it('iniciarSesion() falla con credenciales incorrectas si el usuario no existe', async () => {
    await assert.rejects(UsuarioController.iniciarSesion('no@correo.co', 'x'), { message: 'Credenciales incorrectas.' });
    assert.equal(m.auditar.mock.calls.length, 0);
  });

  it('iniciarSesion() falla con contraseña incorrecta y no audita', async () => {
    m.buscar.mock.mockImplementation(async () => ({ id_usuario: 2, password: 'hash' }));
    m.verificar.mock.mockImplementation(async () => false);
    await assert.rejects(UsuarioController.iniciarSesion('a@b.co', 'mala'), { message: 'Credenciales incorrectas.' });
    assert.equal(m.auditar.mock.calls.length, 0);
  });

  it('iniciarSesion() correcto devuelve el usuario y audita el LOGIN (tipo 4)', async () => {
    m.buscar.mock.mockImplementation(async () => ({ id_usuario: 2, password: 'hash', email: 'a@b.co' }));
    const u = await UsuarioController.iniciarSesion('a@b.co', 'ok');
    assert.equal(u.id_usuario, 2);
    assert.equal(m.auditar.mock.calls[0].arguments[1], 4);
  });

  it('actualizar() exige nombre y correo (RF17)', async () => {
    await assert.rejects(UsuarioController.actualizar(1, { nombre: '', email: 'a@b.co' }), { message: 'Nombre y correo son obligatorios.' });
    await assert.rejects(UsuarioController.actualizar(1, { nombre: 'A', email: '' }), { message: 'Nombre y correo son obligatorios.' });
  });

  it('actualizar() impide usar el email de otro usuario', async () => {
    m.buscar.mock.mockImplementation(async () => ({ id_usuario: 9 }));
    await assert.rejects(UsuarioController.actualizar(1, { nombre: 'A', email: 'otro@b.co' }), { message: 'El email ya está registrado.' });
  });

  it('actualizar() permite conservar el propio email', async () => {
    m.buscar.mock.mockImplementation(async () => ({ id_usuario: 1 }));
    const r = await UsuarioController.actualizar(1, { nombre: 'A', apellidos: 'B', fecha_nac: '2000-01-01', email: 'yo@b.co' });
    assert.equal(r.mensaje, 'Perfil actualizado correctamente.');
    assert.equal(m.auditar.mock.calls[0].arguments[1], 2);
  });

  it('actualizar() informa cuando el usuario no existe', async () => {
    m.actualizar.mock.mockImplementation(async () => false);
    await assert.rejects(UsuarioController.actualizar(77, { nombre: 'A', email: 'a@b.co' }), { message: 'Usuario no encontrado.' });
  });
});
