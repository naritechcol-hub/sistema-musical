// src/utils/session.js
// Manejo de la sesión en sessionStorage (clave sm_usuario) y utilidades de formato
'use strict';

const CLAVE = 'sm_usuario';

// Obtiene el usuario guardado (objeto vacío si no existe)
export function getUsuario() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE) || '{}');
  } catch {
    return {};
  }
}

// Guarda el objeto usuario en sessionStorage
export function guardarUsuario(usuario) {
  sessionStorage.setItem(CLAVE, JSON.stringify(usuario));
}

// Elimina la sesión
export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE);
}

// Indica si existe una sesión activa
export function estaAutenticado() {
  return Boolean(sessionStorage.getItem(CLAVE));
}

// Formatea fecha ISO a es-CO (dd/mm/aaaa hh:mm)
export function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Iniciales del nombre (máximo 2 letras)
export function iniciales(nombre = 'U') {
  return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}