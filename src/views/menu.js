// src/views/menu.js
'use strict';
const readline = require('readline');

// readline permite leer entrada del teclado desde la terminal
const rl = readline.createInterface({
  input : process.stdin,
  output: process.stdout
});

// Función auxiliar: envuelve rl.question en una Promise
function preguntar(pregunta) {
  return new Promise(resolve => rl.question(pregunta, resolve));
}

function mostrarMenuPrincipal() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  Sistema de Gestión Musical — v1.0   ║');
  console.log('╠══════════════════════════════════════╣');
  console.log('║  1. Registrar usuario                ║');
  console.log('║  2. Iniciar sesión                   ║');
  console.log('║  3. Listar usuarios                  ║');
  console.log('║  4. Agregar canción                  ║');
  console.log('║  5. Listar canciones                 ║');
  console.log('║  0. Salir                            ║');
  console.log('╚══════════════════════════════════════╝');
}

function cerrar() { rl.close(); }

module.exports = { preguntar, mostrarMenuPrincipal, cerrar };
