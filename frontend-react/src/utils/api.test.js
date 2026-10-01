// src/utils/api.test.js
// Pruebas unitarias del wrapper de fetch (fetch sustituido por un doble de prueba)
import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { peticion, construirUrl } from './api.js';

const respuesta = (ok, cuerpo, status = ok ? 200 : 400) => ({
  ok, status, json: async () => { if (cuerpo === undefined) throw new Error('sin json'); return cuerpo; },
});

describe('utils/api', () => {
  const original = globalThis.fetch;
  afterEach(() => { globalThis.fetch = original; mock.restoreAll(); });

  it('construirUrl() antepone la URL base configurada', () => {
    assert.equal(construirUrl('/api/canciones', 'https://api.ejemplo.co'), 'https://api.ejemplo.co/api/canciones');
    assert.equal(construirUrl('/api/canciones', ''), '/api/canciones');
  });

  it('peticion() hace GET por defecto y devuelve el JSON de la respuesta', async () => {
    const f = mock.fn(async () => respuesta(true, [{ id_cancion: 1 }]));
    globalThis.fetch = f;
    const data = await peticion('/api/canciones');
    assert.deepEqual(data, [{ id_cancion: 1 }]);
    const [url, opts] = f.mock.calls[0].arguments;
    assert.equal(url, '/api/canciones');
    assert.equal(opts.method, 'GET');
    assert.equal(opts.body, undefined);
    assert.equal(opts.headers['Content-Type'], 'application/json');
  });

  it('peticion() serializa el body a JSON y respeta el método', async () => {
    const f = mock.fn(async () => respuesta(true, { id: 3 }));
    globalThis.fetch = f;
    await peticion('/api/auth/login', { method: 'POST', body: { email: 'a@b.co', password: 'x' } });
    const [, opts] = f.mock.calls[0].arguments;
    assert.equal(opts.method, 'POST');
    assert.equal(opts.body, JSON.stringify({ email: 'a@b.co', password: 'x' }));
  });

  it('peticion() lanza Error con el mensaje del backend cuando la respuesta no es ok', async () => {
    globalThis.fetch = async () => respuesta(false, { mensaje: 'Credenciales incorrectas.' }, 401);
    await assert.rejects(peticion('/api/auth/login', { method: 'POST', body: {} }), { message: 'Credenciales incorrectas.' });
  });

  it('peticion() usa un mensaje genérico si el error no trae JSON', async () => {
    globalThis.fetch = async () => respuesta(false, undefined, 502);
    await assert.rejects(peticion('/api/usuarios'), { message: 'Error en la solicitud.' });
  });
});
