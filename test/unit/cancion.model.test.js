// test/unit/cancion.model.test.js
'use strict';
const { describe, it, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../../src/config/db');
const Cancion = require('../../src/models/Cancion');

describe('Modelo Cancion', () => {
  let ejecutar;
  beforeEach(() => { ejecutar = mock.method(pool, 'execute'); });
  afterEach(() => mock.restoreAll());

  it('crear() inserta los 4 campos y devuelve el id', async () => {
    ejecutar.mock.mockImplementation(async () => [{ insertId: 12 }]);
    const id = await Cancion.crear('Titulo', 'Artista', 'Rock', 1999);
    assert.equal(id, 12);
    const [sql, params] = ejecutar.mock.calls[0].arguments;
    assert.match(sql, /INSERT INTO cancion/);
    assert.deepEqual(params, ['Titulo', 'Artista', 'Rock', 1999]);
  });

  it('crear() guarda NULL cuando genero y anio no se envían (nunca undefined)', async () => {
    ejecutar.mock.mockImplementation(async () => [{ insertId: 13 }]);
    await Cancion.crear('Solo titulo', 'Solo artista');
    const params = ejecutar.mock.calls[0].arguments[1];
    assert.deepEqual(params, ['Solo titulo', 'Solo artista', null, null]);
  });

  it('listarTodas() ordena por artista y título', async () => {
    ejecutar.mock.mockImplementation(async () => [[{ id_cancion: 1 }, { id_cancion: 2 }]]);
    const filas = await Cancion.listarTodas();
    assert.equal(filas.length, 2);
    assert.match(ejecutar.mock.calls[0].arguments[0], /ORDER BY artista, titulo/);
  });

  it('buscarPorGenero() usa el género como parámetro (no concatenado)', async () => {
    ejecutar.mock.mockImplementation(async () => [[]]);
    await Cancion.buscarPorGenero("Rock' OR '1'='1");
    const [sql, params] = ejecutar.mock.calls[0].arguments;
    assert.doesNotMatch(sql, /OR '1'='1/);
    assert.deepEqual(params, ["Rock' OR '1'='1"]);
  });

  it('eliminar() borra por id_cancion con consulta parametrizada', async () => {
    ejecutar.mock.mockImplementation(async () => [{ affectedRows: 1 }]);
    await Cancion.eliminar(4);
    const [sql, params] = ejecutar.mock.calls[0].arguments;
    assert.match(sql, /DELETE FROM cancion WHERE id_cancion = \?/);
    assert.deepEqual(params, [4]);
  });
});
