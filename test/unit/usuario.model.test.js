// test/unit/usuario.model.test.js
// Pruebas unitarias del modelo Usuario: el pool de MySQL se sustituye por un doble de prueba.
'use strict';
const { describe, it, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { pool } = require('../../src/config/db');
const Usuario = require('../../src/models/Usuario');

describe('Modelo Usuario', () => {
  let ejecutar;
  beforeEach(() => { ejecutar = mock.method(pool, 'execute'); });
  afterEach(() => mock.restoreAll());

  it('crear() guarda la contraseña cifrada con bcrypt y devuelve el id insertado', async () => {
    ejecutar.mock.mockImplementation(async () => [{ insertId: 7 }]);
    const id = await Usuario.crear('Ana', 'Pérez', '1085000000', '1995-03-10', 'ana@correo.co', 'Clave123');
    assert.equal(id, 7);
    const [sql, params] = ejecutar.mock.calls[0].arguments;
    assert.match(sql, /INSERT INTO usuario/);
    assert.equal(params.length, 6);
    assert.notEqual(params[5], 'Clave123');
    assert.equal(await bcrypt.compare('Clave123', params[5]), true);
  });

  it('buscarPorEmail() devuelve null cuando no hay coincidencias', async () => {
    ejecutar.mock.mockImplementation(async () => [[]]);
    assert.equal(await Usuario.buscarPorEmail('nadie@correo.co'), null);
    const [sql, params] = ejecutar.mock.calls[0].arguments;
    assert.match(sql, /activo = 1/);
    assert.deepEqual(params, ['nadie@correo.co']);
  });

  it('buscarPorEmail() devuelve la primera fila cuando existe', async () => {
    ejecutar.mock.mockImplementation(async () => [[{ id_usuario: 3, email: 'a@b.co' }]]);
    assert.deepEqual(await Usuario.buscarPorEmail('a@b.co'), { id_usuario: 3, email: 'a@b.co' });
  });

  it('verificarPassword() acepta la clave correcta y rechaza la incorrecta', async () => {
    const hash = await bcrypt.hash('Secreta1', 4);
    assert.equal(await Usuario.verificarPassword('Secreta1', hash), true);
    assert.equal(await Usuario.verificarPassword('otra', hash), false);
  });

  it('listarActivos() no expone la columna password', async () => {
    ejecutar.mock.mockImplementation(async () => [[{ id_usuario: 1 }]]);
    await Usuario.listarActivos();
    const [sql] = ejecutar.mock.calls[0].arguments;
    assert.doesNotMatch(sql, /password/);
    assert.match(sql, /activo = 1/);
  });

  it('desactivar() hace baja lógica (UPDATE activo = 0), no DELETE', async () => {
    ejecutar.mock.mockImplementation(async () => [{ affectedRows: 1 }]);
    await Usuario.desactivar(5);
    const [sql, params] = ejecutar.mock.calls[0].arguments;
    assert.match(sql, /UPDATE usuario SET activo = 0/);
    assert.doesNotMatch(sql, /DELETE/);
    assert.deepEqual(params, [5]);
  });

  it('actualizar() devuelve true si afectó una fila y false si no existe el usuario', async () => {
    ejecutar.mock.mockImplementation(async () => [{ affectedRows: 1 }]);
    assert.equal(await Usuario.actualizar(2, { nombre: 'A', apellidos: 'B', fecha_nac: '2000-01-01', email: 'a@b.co' }), true);
    ejecutar.mock.mockImplementation(async () => [{ affectedRows: 0 }]);
    assert.equal(await Usuario.actualizar(99, { nombre: 'A', apellidos: 'B', fecha_nac: '2000-01-01', email: 'a@b.co' }), false);
  });

  it('actualizar() convierte apellidos y fecha_nac ausentes en NULL (nunca undefined)', async () => {
    ejecutar.mock.mockImplementation(async () => [{ affectedRows: 1 }]);
    await Usuario.actualizar(2, { nombre: 'A', email: 'a@b.co' });
    const params = ejecutar.mock.calls[0].arguments[1];
    assert.deepEqual(params, ['A', null, null, 'a@b.co', 2]);
    assert.equal(params.includes(undefined), false);
  });

  it('actualizar() no modifica la cédula', async () => {
    ejecutar.mock.mockImplementation(async () => [{ affectedRows: 1 }]);
    await Usuario.actualizar(2, { nombre: 'A', apellidos: 'B', fecha_nac: '2000-01-01', email: 'a@b.co' });
    const [sql] = ejecutar.mock.calls[0].arguments;
    assert.doesNotMatch(sql, /cedula/);
  });
});
