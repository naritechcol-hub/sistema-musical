// public/js/dashboard.js
'use strict';

// ── GUARDIA DE SESIÓN ────────────────────────────────────────
const usuarioGuardado = sessionStorage.getItem('usuario');
if (!usuarioGuardado) {
  window.location.href = 'index.html';
}
const usuarioActual = JSON.parse(usuarioGuardado || '{}');

// ── DOM ──────────────────────────────────────────────────────
document.getElementById('span-nombre').textContent = usuarioActual.nombre || 'Usuario';
document.getElementById('span-email').textContent  = usuarioActual.email  || '';

// ── NAVEGACIÓN ENTRE SECCIONES ──────────────────────────────
const navItems  = document.querySelectorAll('.nav-item');
const sections  = document.querySelectorAll('.section');
const topbarTitle = document.getElementById('topbar-title');

const titulos = {
  dashboard: 'Dashboard',
  usuarios:  'Gestión de Usuarios',
  canciones: 'Gestión de Canciones',
  auditoria: 'Registro de Auditoría'
};

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const target = item.dataset.section;

    navItems.forEach(n => n.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    item.classList.add('active');
    document.getElementById(`section-${target}`).classList.add('active');
    topbarTitle.textContent = titulos[target] || target;

    // Cargar datos de la sección seleccionada
    if (target === 'usuarios')  cargarUsuarios();
    if (target === 'canciones') cargarCanciones();
    if (target === 'auditoria') cargarAuditoria();
    if (target === 'dashboard') cargarEstadisticas();
  });
});

// Sidebar toggle (responsive)
document.getElementById('toggle-sidebar').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ── CERRAR SESIÓN ────────────────────────────────────────────
document.getElementById('btn-logout').addEventListener('click', async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (_) {}
  sessionStorage.removeItem('usuario');
  window.location.href = 'index.html';
});

// ── UTILIDADES ───────────────────────────────────────────────
function mostrarMsg(contenedorId, texto, tipo = 'error') {
  const el = document.getElementById(contenedorId);
  if (!el) return;
  el.textContent = texto;
  el.className = `msg-box ${tipo}`;
  setTimeout(() => { el.className = 'msg-box hidden'; }, 4000);
}

function formatearFecha(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── ESTADÍSTICAS (DASHBOARD) ─────────────────────────────────
async function cargarEstadisticas() {
  try {
    const [resU, resC, resA] = await Promise.all([
      fetch('/api/usuarios'),
      fetch('/api/canciones'),
      fetch('/api/auditoria')
    ]);
    const usuarios   = await resU.json();
    const canciones  = await resC.json();
    const auditoria  = await resA.json();

    document.getElementById('stat-usuarios').textContent   = Array.isArray(usuarios)  ? usuarios.length  : 0;
    document.getElementById('stat-canciones').textContent  = Array.isArray(canciones) ? canciones.length : 0;
    document.getElementById('stat-operaciones').textContent = Array.isArray(auditoria) ? auditoria.length : 0;
  } catch (err) {
    console.error('Error cargando estadísticas:', err);
  }
}

// ── USUARIOS ─────────────────────────────────────────────────
async function cargarUsuarios() {
  const tbody = document.getElementById('tbody-usuarios');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">Cargando...</td></tr>';
  try {
    const res  = await fetch('/api/usuarios');
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay usuarios registrados.</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(u => `
      <tr>
        <td>${u.id_usuario}</td>
        <td>${u.nombre}</td>
        <td>${u.email}</td>
        <td>${formatearFecha(u.created_at)}</td>
        <td><span class="badge badge-green">Activo</span></td>
        <td>
          <button class="btn btn-sm btn-danger"
                  onclick="confirmarEliminar('usuario', ${u.id_usuario}, '${u.nombre}')">
            Desactivar
          </button>
        </td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Error al cargar usuarios.</td></tr>';
  }
}

// ── CANCIONES ────────────────────────────────────────────────
async function cargarCanciones() {
  const tbody = document.getElementById('tbody-canciones');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">Cargando...</td></tr>';
  try {
    const res  = await fetch('/api/canciones');
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay canciones registradas.</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(c => `
      <tr>
        <td>${c.id_cancion}</td>
        <td>${c.titulo}</td>
        <td>${c.artista}</td>
        <td><span class="badge badge-blue">${c.genero || '—'}</span></td>
        <td>${c.anio || '—'}</td>
        <td>
          <button class="btn btn-sm btn-danger"
                  onclick="confirmarEliminar('cancion', ${c.id_cancion}, '${c.titulo}')">
            Eliminar
          </button>
        </td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Error al cargar canciones.</td></tr>';
  }
}

// ── FORMULARIO NUEVA CANCIÓN ─────────────────────────────────
document.getElementById('btn-nueva-cancion').addEventListener('click', () => {
  document.getElementById('form-card-cancion').classList.remove('hidden');
});
document.getElementById('btn-cancelar-cancion').addEventListener('click', () => {
  document.getElementById('form-card-cancion').classList.add('hidden');
  document.getElementById('form-cancion').reset();
});

document.getElementById('form-cancion').addEventListener('submit', async (e) => {
  e.preventDefault();
  const titulo  = document.getElementById('c-titulo').value.trim();
  const artista = document.getElementById('c-artista').value.trim();
  const genero  = document.getElementById('c-genero').value;
  const anio    = document.getElementById('c-anio').value;

  try {
    const res = await fetch('/api/canciones', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ titulo, artista, genero, anio: anio || null,
                                 idUsuario: usuarioActual.id_usuario })
    });
    const data = await res.json();

    if (!res.ok) {
      mostrarMsg('msg-canciones', data.mensaje || 'Error al guardar la canción.');
      return;
    }

    mostrarMsg('msg-canciones', 'Canción agregada correctamente.', 'success');
    document.getElementById('form-card-cancion').classList.add('hidden');
    document.getElementById('form-cancion').reset();
    cargarCanciones();
  } catch (err) {
    mostrarMsg('msg-canciones', 'Error de conexión con el servidor.');
  }
});

// ── AUDITORÍA ────────────────────────────────────────────────
async function cargarAuditoria() {
  const tbody = document.getElementById('tbody-auditoria');
  tbody.innerHTML = '<tr><td colspan="5" class="loading">Cargando...</td></tr>';
  try {
    const res  = await fetch('/api/auditoria');
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay registros de auditoría.</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(a => `
      <tr>
        <td>${a.id_auditoria}</td>
        <td><span class="badge badge-blue">${a.tipo_op || '—'}</span></td>
        <td>${a.descripcion || '—'}</td>
        <td>${a.tabla_afectada || '—'}</td>
        <td>${formatearFecha(a.fecha)}</td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Error al cargar auditoría.</td></tr>';
  }
}

// ── MODAL ELIMINAR ───────────────────────────────────────────
let pendienteEliminar = null;

function confirmarEliminar(tipo, id, nombre) {
  pendienteEliminar = { tipo, id };
  document.getElementById('modal-msg').textContent =
    `¿Deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`;
  document.getElementById('modal-eliminar').classList.remove('hidden');
}

document.getElementById('btn-cancelar-eliminar').addEventListener('click', () => {
  document.getElementById('modal-eliminar').classList.add('hidden');
  pendienteEliminar = null;
});

document.getElementById('btn-confirmar-eliminar').addEventListener('click', async () => {
  if (!pendienteEliminar) return;
  const { tipo, id } = pendienteEliminar;
  document.getElementById('modal-eliminar').classList.add('hidden');

  const endpoint = tipo === 'usuario' ? `/api/usuarios/${id}` : `/api/canciones/${id}`;
  try {
    const res = await fetch(endpoint, { method: 'DELETE' });
    if (res.ok) {
      if (tipo === 'usuario')  cargarUsuarios();
      if (tipo === 'cancion')  cargarCanciones();
    }
  } catch (err) {
    console.error('Error al eliminar:', err);
  }
  pendienteEliminar = null;
});

// ── CARGA INICIAL ────────────────────────────────────────────
cargarEstadisticas();
