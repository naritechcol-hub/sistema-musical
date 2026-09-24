// src/utils/api.js
// Wrapper de fetch para la API REST del backend
'use strict';

export async function peticion(url, opciones = {}) {
  const res = await fetch(url, {
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