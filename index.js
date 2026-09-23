// index.js — Punto de entrada del sistema
'use strict';
require('dotenv').config();
const { verificarConexion } = require('./src/config/db');
const UsuarioController    = require('./src/controllers/UsuarioController');
const CancionController    = require('./src/controllers/CancionController');
const { preguntar, mostrarMenuPrincipal, cerrar } = require('./src/views/menu');

async function main() {
  await verificarConexion();

  let corriendo = true;
  while (corriendo) {
    mostrarMenuPrincipal();
    const opcion = await preguntar('\nSeleccione una opción: ');

    switch (opcion.trim()) {
  case '1': {
    const nombre = await preguntar('Nombre: ');
    const email  = await preguntar('Email: ');
    const pass   = await preguntar('Contraseña: ');
    try {
      const id = await UsuarioController.registrar(nombre, email, pass);
      console.log(`✔  Usuario creado con ID: ${id}`);
    } catch (e) { console.error('✖ ', e.message); }
    break;
  }
  case '2': {
    const email = await preguntar('Email: ');
    const pass  = await preguntar('Contraseña: ');
    try {
      const u = await UsuarioController.iniciarSesion(email, pass);
      console.log(`✔  Bienvenido, ${u.nombre}`);
    } catch (e) { console.error('✖ ', e.message); }
    break;
  }
  case '3': {
    const lista = await UsuarioController.listar();
    if (lista.length === 0) {
      console.log('No hay usuarios registrados.');
    } else {
      lista.forEach(u => console.log(`  [${u.id_usuario}] ${u.nombre} — ${u.email}`));
    }
    break;
  }
  case '4': {
    const titulo  = await preguntar('Título de la canción: ');
    const artista = await preguntar('Artista: ');
    const genero  = await preguntar('Género: ');
    const anio    = await preguntar('Año: ');
    try {
      // ID 1 como usuario del sistema mientras no hay sesión persistente
      const id = await CancionController.agregar(titulo, artista, genero, anio, 1);
      console.log(`✔  Canción agregada con ID: ${id}`);
    } catch (e) { console.error('✖ ', e.message); }
    break;
  }
  case '5': {
    const canciones = await CancionController.listar();
    if (canciones.length === 0) {
      console.log('No hay canciones registradas.');
    } else {
      canciones.forEach(c =>
        console.log(`  [${c.id_cancion}] ${c.titulo} — ${c.artista} (${c.genero}, ${c.anio})`)
      );
    }
    break;
  }
  case '0':
    corriendo = false;
    console.log('\nCerrando sistema. ¡Hasta luego!');
    break;
  default:
    console.log('Opción no válida.');
}
  }
  cerrar();
  process.exit(0);
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
