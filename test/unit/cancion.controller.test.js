// test/unit/cancion.controller.test.js
'use strict';
const { describe, it, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const Cancion = require('../../src/models/Cancion');
const Auditoria = require('../../src/models/Auditoria');
const CancionController = require('../../src/controllers/CancionController');

describe('CancionController', () => {
  let m;
  beforeEach(() => {
    m = {
      crear: mock.method(Cancion, 'crear', async () => 5),
      listar: mock.method(Cancion, 'listarTodas', async () => [{ id_cancion: 1 }]),
      genero: mock.method(Cancion, 'buscarPorGenero', async () => []),
      eliminar: mock.method(Cancion, 'eliminar', async () => undefined),
      auditar: mock.method(Auditoria, 'registrar', async () => 1),
    };
  });
  afterEach(() => mock.restoreAll());

  it('agregar() crea la canción y audita un INSERT (tipo 1) sobre la tabla cancion', async () => {
    const id = await CancionController.agregar('T', 'A', 'Pop', 2001, 3);
    assert.equal(id, 5);
    const a = m.auditar.mock.calls[0].arguments;
    assert.equal(a[0], 3);
    assert.equal(a[1], 1);
    assert.equal(a[3], 'cancion');
    assert.equal(a[4], null);
    assert.deepEqual(a[5], { titulo: 'T', artista: 'A', genero: 'Pop', anio: 2001 });
  });

  it('listar() delega en el modelo', async () => {
    assert.deepEqual(await CancionController.listar(), [{ id_cancion: 1 }]);
  });

  it('eliminar() borra la canción y audita un DELETE (tipo 3) con el id', async () => {
    await CancionController.eliminar(8, 2);
    assert.deepEqual(m.eliminar.mock.calls[0].arguments, [8]);
    const a = m.auditar.mock.calls[0].arguments;
    assert.equal(a[1], 3);
    assert.deepEqual(a[4], { idCancion: 8 });
    assert.equal(a[5], null);
  });

  it('agregar() no audita si el modelo falla al crear', async () => {
    m.crear.mock.mockImplementation(async () => { throw new Error('fallo BD'); });
    await assert.rejects(CancionController.agregar('T', 'A', 'Pop', 2001, 1), { message: 'fallo BD' });
    assert.equal(m.auditar.mock.calls.length, 0);
  });
});
