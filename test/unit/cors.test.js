// test/unit/cors.test.js
// CORS restringido por CORS_ORIGIN (la variable se define ANTES de cargar la app)
'use strict';
process.env.CORS_ORIGIN = 'https://soundmanager.vercel.app, http://localhost:5173';
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../../src/app');

describe('CORS por entorno', () => {
  let servidor, base;
  before(async () => {
    await new Promise(ok => { servidor = app.listen(0, '127.0.0.1', ok); });
    base = `http://127.0.0.1:${servidor.address().port}`;
  });
  after(async () => { await new Promise(ok => servidor.close(ok)); });

  const preflight = origen => fetch(`${base}/api/canciones`, {
    method: 'OPTIONS',
    headers: { Origin: origen, 'Access-Control-Request-Method': 'GET' },
  });

  it('permite el dominio del frontend en producción', async () => {
    const r = await preflight('https://soundmanager.vercel.app');
    assert.equal(r.headers.get('access-control-allow-origin'), 'https://soundmanager.vercel.app');
  });

  it('permite el origen local de desarrollo listado en la variable', async () => {
    const r = await preflight('http://localhost:5173');
    assert.equal(r.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  });

  it('no autoriza un origen que no está en la lista', async () => {
    const r = await preflight('https://sitio-ajeno.example.com');
    assert.equal(r.headers.get('access-control-allow-origin'), null);
  });
});
