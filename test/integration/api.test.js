// test/integration/api.test.js
// Pruebas de integración: API Express real + MySQL real (base de pruebas), sin dobles.
'use strict';
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../../src/app');
const { reiniciar, pool } = require('../helpers/baseDatos');

let servidor, base;
const json = async (ruta, opciones = {}) => {
  const res = await fetch(base + ruta, {
    method: opciones.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => null) };
};

const USUARIO = {
  nombre: 'Ana', apellidos: 'Pérez Gómez', cedula: '1085123456',
  fecha_nac: '1995-03-10', email: 'ana.perez@correo.co', password: 'Clave123!',
};

describe('API SoundManager (integración con MySQL)', () => {
  before(async () => {
    await reiniciar();
    await new Promise(ok => { servidor = app.listen(0, '127.0.0.1', ok); });
    base = `http://127.0.0.1:${servidor.address().port}`;
  });
  after(async () => {
    await new Promise(ok => servidor.close(ok));
    await pool.end();
  });

  describe('Salud del servicio', () => {
    it('GET /api/health responde ok con la base de datos conectada', async () => {
      const r = await json('/api/health');
      assert.equal(r.status, 200);
      assert.deepEqual(r.data, { estado: 'ok', base_datos: 'ok' });
    });
  });

  describe('Módulo de autenticación y usuarios', () => {
    it('POST /api/auth/registro rechaza campos faltantes con 400', async () => {
      const r = await json('/api/auth/registro', { method: 'POST', body: { nombre: 'Ana' } });
      assert.equal(r.status, 400);
      assert.equal(r.data.mensaje, 'Todos los campos son obligatorios.');
    });

    it('POST /api/auth/registro crea el usuario y persiste los 6 campos (RF04)', async () => {
      const r = await json('/api/auth/registro', { method: 'POST', body: USUARIO });
      assert.equal(r.status, 201);
      assert.equal(r.data.id, 1);
      const [[fila]] = await pool.query('SELECT * FROM usuario WHERE id_usuario = 1');
      assert.equal(fila.nombre, 'Ana');
      assert.equal(fila.apellidos, 'Pérez Gómez');
      assert.equal(fila.cedula, '1085123456');
      assert.equal(new Date(fila.fecha_nac).toISOString().slice(0, 10), '1995-03-10');
      assert.equal(fila.email, 'ana.perez@correo.co');
      assert.notEqual(fila.password, USUARIO.password);
      assert.match(fila.password, /^\$2[aby]\$/);
    });

    it('POST /api/auth/registro rechaza un email repetido con 400', async () => {
      const r = await json('/api/auth/registro', { method: 'POST', body: USUARIO });
      assert.equal(r.status, 400);
      assert.equal(r.data.mensaje, 'El email ya está registrado.');
    });

    it('POST /api/auth/login con credenciales válidas devuelve el usuario sin contraseña', async () => {
      const r = await json('/api/auth/login', { method: 'POST', body: { email: USUARIO.email, password: USUARIO.password } });
      assert.equal(r.status, 200);
      assert.equal(r.data.usuario.email, USUARIO.email);
      assert.equal('password' in r.data.usuario, false);
    });

    it('POST /api/auth/login con contraseña incorrecta devuelve 401', async () => {
      const r = await json('/api/auth/login', { method: 'POST', body: { email: USUARIO.email, password: 'incorrecta' } });
      assert.equal(r.status, 401);
      assert.equal(r.data.mensaje, 'Credenciales incorrectas.');
    });

    it('POST /api/auth/login sin datos devuelve 400', async () => {
      const r = await json('/api/auth/login', { method: 'POST', body: {} });
      assert.equal(r.status, 400);
    });

    it('GET /api/usuarios lista solo usuarios activos y sin contraseña', async () => {
      const r = await json('/api/usuarios');
      assert.equal(r.status, 200);
      assert.equal(r.data.length, 1);
      assert.equal('password' in r.data[0], false);
    });

    it('PUT /api/usuarios/:id actualiza el perfil y lo deja persistido (RF17)', async () => {
      const r = await json('/api/usuarios/1', { method: 'PUT', body: {
        nombre: 'Ana María', apellidos: 'Pérez', fecha_nac: '1995-04-11', email: 'ana.maria@correo.co' } });
      assert.equal(r.status, 200);
      const [[fila]] = await pool.query('SELECT nombre, apellidos, email, cedula FROM usuario WHERE id_usuario = 1');
      assert.equal(fila.nombre, 'Ana María');
      assert.equal(fila.email, 'ana.maria@correo.co');
      assert.equal(fila.cedula, '1085123456');
    });

    it('PUT /api/usuarios/:id sobre un usuario inexistente devuelve 400', async () => {
      const r = await json('/api/usuarios/999', { method: 'PUT', body: { nombre: 'X', email: 'x@correo.co' } });
      assert.equal(r.status, 400);
      assert.equal(r.data.mensaje, 'Usuario no encontrado.');
    });

    it('DELETE /api/usuarios/:id hace baja lógica: el registro sigue en BD con activo = 0', async () => {
      await json('/api/auth/registro', { method: 'POST', body: { ...USUARIO, cedula: '1085999999', email: 'segundo@correo.co' } });
      const r = await json('/api/usuarios/2', { method: 'DELETE' });
      assert.equal(r.status, 200);
      const [[fila]] = await pool.query('SELECT activo FROM usuario WHERE id_usuario = 2');
      assert.equal(fila.activo, 0);
      const lista = await json('/api/usuarios');
      assert.equal(lista.data.some(u => u.id_usuario === 2), false);
    });
  });

  describe('Módulo de canciones', () => {
    let idCancion;
    it('POST /api/canciones exige título y artista', async () => {
      const r = await json('/api/canciones', { method: 'POST', body: { titulo: 'Solo título' } });
      assert.equal(r.status, 400);
    });

    it('POST /api/canciones crea la canción y devuelve su id', async () => {
      const r = await json('/api/canciones', { method: 'POST', body: { titulo: 'Bohemian Rhapsody', artista: 'Queen', genero: 'Rock', anio: 1975 } });
      assert.equal(r.status, 201);
      idCancion = r.data.id;
      assert.ok(idCancion > 0);
    });

    it('POST /api/canciones acepta una canción solo con título y artista (género y año opcionales)', async () => {
      const r = await json('/api/canciones', { method: 'POST', body: { titulo: 'Sin metadatos', artista: 'Anónimo' } });
      assert.equal(r.status, 201);
      const [[fila]] = await pool.query('SELECT genero, anio FROM cancion WHERE id_cancion = ?', [r.data.id]);
      assert.equal(fila.genero, null);
      assert.equal(fila.anio, null);
    });

    it('GET /api/canciones devuelve la canción creada', async () => {
      const r = await json('/api/canciones');
      assert.equal(r.status, 200);
      const c = r.data.find(x => x.id_cancion === idCancion);
      assert.equal(c.titulo, 'Bohemian Rhapsody');
      assert.equal(c.anio, 1975);
    });

    it('DELETE /api/canciones/:id audita la baja a nombre del usuario que la ejecuta', async () => {
      const c = await json('/api/canciones', { method: 'POST', body: { titulo: 'Temporal', artista: 'Prueba', idUsuario: 1 } });
      const r = await json(`/api/canciones/${c.data.id}`, { method: 'DELETE', body: { idUsuario: 1 } });
      assert.equal(r.status, 200);
      const [[op]] = await pool.query(
        "SELECT id_usuario FROM operacion WHERE descripcion = ? ORDER BY id_operacion DESC LIMIT 1", [`Canción eliminada: ID ${c.data.id}`]);
      assert.equal(op.id_usuario, 1);
    });

    it('DELETE /api/canciones/:id elimina la canción', async () => {
      const r = await json(`/api/canciones/${idCancion}`, { method: 'DELETE' });
      assert.equal(r.status, 200);
      const [filas] = await pool.query('SELECT 1 FROM cancion WHERE id_cancion = ?', [idCancion]);
      assert.equal(filas.length, 0);
    });
  });

  describe('Módulo de auditoría', () => {
    it('GET /api/auditoria refleja registro, login, actualización, alta y baja de canción', async () => {
      const r = await json('/api/auditoria');
      assert.equal(r.status, 200);
      const tipos = r.data.map(f => f.tipo_op);
      for (const esperado of ['INSERT', 'LOGIN', 'UPDATE', 'DELETE']) {
        assert.ok(tipos.includes(esperado), `falta el tipo ${esperado} en la auditoría`);
      }
    });

    it('cada fila de auditoría enlaza con una operación existente (integridad referencial)', async () => {
      const [huerfanas] = await pool.query(
        'SELECT a.id_auditoria FROM auditoria a LEFT JOIN operacion o ON a.id_operacion = o.id_operacion WHERE o.id_operacion IS NULL');
      assert.equal(huerfanas.length, 0);
    });

    it('el login fallido no genera registro de auditoría', async () => {
      const [[antes]] = await pool.query("SELECT COUNT(*) n FROM operacion WHERE descripcion LIKE 'Inicio de sesión%'");
      await json('/api/auth/login', { method: 'POST', body: { email: 'ana.maria@correo.co', password: 'mala' } });
      const [[despues]] = await pool.query("SELECT COUNT(*) n FROM operacion WHERE descripcion LIKE 'Inicio de sesión%'");
      assert.equal(despues.n, antes.n);
    });
  });
});
