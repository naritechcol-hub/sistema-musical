// test/unit/auditoria.model.test.js
'use strict';
const { describe, it, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../../src/config/db');
const Auditoria = require('../../src/models/Auditoria');

describe('Modelo Auditoria', () => {
  let ejecutar;
  beforeEach(() => { ejecutar = mock.method(pool, 'execute'); });
  afterEach(() => mock.restoreAll());

  it('registrar() inserta primero en operacion y luego en auditoria con el id generado', async () => {
    let n = 0;
    ejecutar.mock.mockImplementation(async () => (n++ === 0 ? [{ insertId: 40 }] : [{ insertId: 1 }]));
    const idOp = await Auditoria.registrar(1, 1, 'desc', 'cancion', null, { titulo: 'X' });
    assert.equal(idOp, 40);
    assert.equal(ejecutar.mock.calls.length, 2);
    assert.match(ejecutar.mock.calls[0].arguments[0], /INSERT INTO operacion/);
    assert.match(ejecutar.mock.calls[1].arguments[0], /INSERT INTO auditoria/);
    assert.deepEqual(ejecutar.mock.calls[0].arguments[1], [1, 1, 'desc']);
  });

  it('registrar() serializa los datos como JSON y deja null cuando no hay datos', async () => {
    let n = 0;
    ejecutar.mock.mockImplementation(async () => (n++ === 0 ? [{ insertId: 41 }] : [{ insertId: 2 }]));
    await Auditoria.registrar(1, 3, 'borrado', 'cancion', { idCancion: 9 }, null);
    const params = ejecutar.mock.calls[1].arguments[1];
    assert.equal(params[0], 41);
    assert.equal(params[1], 'cancion');
    assert.equal(params[2], JSON.stringify({ idCancion: 9 }));
    assert.equal(params[3], null);
  });

  it('historialPorUsuario() filtra por usuario y limita a 50 filas', async () => {
    ejecutar.mock.mockImplementation(async () => [[{ id_auditoria: 1 }]]);
    const filas = await Auditoria.historialPorUsuario(6);
    assert.equal(filas.length, 1);
    const [sql, params] = ejecutar.mock.calls[0].arguments;
    assert.match(sql, /WHERE\s+o\.id_usuario = \?/);
    assert.match(sql, /LIMIT\s+50/);
    assert.deepEqual(params, [6]);
  });
});
