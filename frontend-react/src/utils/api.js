// src/utils/api.js
// Wrapper de fetch para la API REST del backend
'use strict';

// En desarrollo la base queda vacía y el proxy de Vite enruta /api al backend.
// En producción VITE_API_URL apunta a la URL pública de la API (por ejemplo la de Render).
const BASE = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');

export function construirUrl(ruta, base = BASE) {
  return `${base}${ruta}`;
}

export async function peticion(url, opciones = {}) {
  const res = await fetch(construirUrl(url), {
    method: opciones.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.mensaje || 'Error en la solicitud.');
  }

  return data;
}
