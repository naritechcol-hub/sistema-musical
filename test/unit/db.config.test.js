// test/unit/db.config.test.js
// Configuración TLS del pool: se controla con DB_SSL y DB_SSL_CA
'use strict';
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { opcionesSsl } = require('../../src/config/db');

describe('Configuración de conexión a MySQL', () => {
  const previo = { ssl: process.env.DB_SSL, ca: process.env.DB_SSL_CA };
  afterEach(() => {
    if (previo.ssl === undefined) delete process.env.DB_SSL; else process.env.DB_SSL = previo.ssl;
    if (previo.ca === undefined) delete process.env.DB_SSL_CA; else process.env.DB_SSL_CA = previo.ca;
  });

  it('sin DB_SSL no se activa TLS', () => {
    delete process.env.DB_SSL;
    assert.equal(opcionesSsl(), undefined);
    process.env.DB_SSL = 'false';
    assert.equal(opcionesSsl(), undefined);
  });

  it('con DB_SSL=true se activa TLS validando el certificado del servidor', () => {
    process.env.DB_SSL = 'true';
    delete process.env.DB_SSL_CA;
    assert.deepEqual(opcionesSsl(), { rejectUnauthorized: true });
  });

  it('DB_SSL_CA convierte los \\n escritos en saltos de línea reales', () => {
    process.env.DB_SSL = 'TRUE';
    process.env.DB_SSL_CA = '-----BEGIN CERTIFICATE-----\\nABC\\n-----END CERTIFICATE-----';
    const ssl = opcionesSsl();
    assert.equal(ssl.rejectUnauthorized, true);
    assert.equal(ssl.ca, '-----BEGIN CERTIFICATE-----\nABC\n-----END CERTIFICATE-----');
  });
});
