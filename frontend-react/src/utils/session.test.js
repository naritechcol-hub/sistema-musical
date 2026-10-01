// src/utils/session.test.js
// Pruebas unitarias de la sesión (sessionStorage simulado con un Map)
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getUsuario, guardarUsuario, cerrarSesion, estaAutenticado, fmt, iniciales } from './session.js';

describe('utils/session', () => {
  beforeEach(() => {
    const almacen = new Map();
    globalThis.sessionStorage = {
      getItem: k => (almacen.has(k) ? almacen.get(k) : null),
      setItem: (k, v) => almacen.set(k, String(v)),
      removeItem: k => almacen.delete(k),
    };
  });

  it('sin sesión: getUsuario() devuelve objeto vacío y estaAutenticado() es false', () => {
    assert.deepEqual(getUsuario(), {});
    assert.equal(estaAutenticado(), false);
  });

  it('guardarUsuario() persiste bajo la clave sm_usuario y activa la sesión', () => {
    guardarUsuario({ id_usuario: 1, nombre: 'Ana', email: 'a@b.co' });
    assert.equal(estaAutenticado(), true);
    assert.deepEqual(getUsuario(), { id_usuario: 1, nombre: 'Ana', email: 'a@b.co' });
    assert.equal(JSON.parse(sessionStorage.getItem('sm_usuario')).nombre, 'Ana');
  });

  it('cerrarSesion() elimina la sesión', () => {
    guardarUsuario({ id_usuario: 1 });
    cerrarSesion();
    assert.equal(estaAutenticado(), false);
    assert.deepEqual(getUsuario(), {});
  });

  it('getUsuario() tolera un valor corrupto en sessionStorage', () => {
    sessionStorage.setItem('sm_usuario', '{no es json');
    assert.deepEqual(getUsuario(), {});
  });

  it('fmt() devuelve un guion cuando no hay fecha y formatea fechas ISO', () => {
    assert.equal(fmt(null), '—');
    assert.match(fmt('2026-03-10T15:30:00Z'), /\d{2}\/\d{2}\/2026/);
  });

  it('iniciales() toma máximo dos letras en mayúscula', () => {
    assert.equal(iniciales('ana maria perez'), 'AM');
    assert.equal(iniciales('Luis'), 'L');
    assert.equal(iniciales(), 'U');
  });
});
