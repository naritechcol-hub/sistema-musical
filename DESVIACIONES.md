# Sistema Musical — Fase 2: Frontend React

Migración del frontend plano (HTML/CSS/JS) a **React + Vite** en `/frontend-react`, manteniendo el backend Express original con cambios mínimos.

## Cómo ejecutar

```bash
# Backend (raíz del proyecto, puerto 3000)
npm run dev

# Frontend (en otra terminal, puerto 5173)
cd frontend-react
npm run dev
```

Abrir **http://localhost:5173**. El login redirige a los módulos del dashboard.

## Estructura del Frontend

```
frontend-react/
├─ src/
│  ├─ App.jsx              # Rutas y layout (ProtectedRoute + AppLayout)
│  ├─ main.jsx             # Entry: BrowserRouter + Bootstrap + estilos
│  ├─ pages/               # Login, Registro, Error, DashboardHome, Canciones, Usuarios, Auditoria, Perfil
│  ├─ components/          # Topbar, Sidebar, AppLayout, ProtectedRoute, Toast, DeleteModal, AddSongModal, PageFooter
│  ├─ utils/               # session.js (sm_usuario), api.js (wrapper fetch)
│  └─ styles/              # variables.css + estilos por pantalla
└─ vite.config.js          # Port 5173 + proxy /api -> http://localhost:3000
```

## Desviaciones documentadas

La ruta de trabajo `public/` se restauró como **`public-legacy/`** para conservar los 5 HTML originales como soporte de la GA6. Por eso:

1. **`src/server.js`** — las 2 rutas `sendFile` (raíz `/` y 404) apuntan ahora a `../public-legacy/01-login.html`. Es un cambio acompañante obligatorio del git mv; no forma parte de los 3 cambios funcionales.
2. **CORS** — `src/server.js` incluye `app.use(cors())` (dependencia `cors`) para permitir el consumo desde el frontend React (puerto distinto). El proxy de Vite ya enruta `/api` al backend.

## Cambios funcionales al backend (los 3 autorizados)

| # | Cambio | Archivos | Evidencia |
|---|--------|----------|-----------|
| 1 | `usuarioRoutes.js`: ruta `PUT /:id` | `usuarioRoutes.js`, `UsuarioController.actualizar`, `models/Usuario.actualizar` | RF17 |
| 2 | `UsuarioController.registrar` ahora recibe **6 campos** en el mismo orden que `authRoutes` (`nombre, apellidos, cedula, fecha_nac, email, password`) | `UsuarioController.js` | RF04 |
| 3 | `app.use(cors())` + dependencia `cors` | `server.js`, `package.json` | consumo frontend |

### Compatibilidad con la consola
`index.js` (CLI) llama a `registrar(nombre, email, password)` con 3 argumentos. El controlador detecta ese caso (`fecha_nac === undefined`) y re-mapea los argumentos para seguir funcionando **sin modificar `index.js`**.

### Verificación realizada (API real)
- `POST /api/auth/registro` con 6 campos → usuario creado, los 6 campos persistidos en BD.
- `POST /api/auth/login` → sesión correcta.
- `PUT /api/usuarios/:id` → perfil actualizado (RF17).
- `DELETE /api/usuarios/:id` → baja lógica (no aparece en la lista).
- `GET /`: sirve `public-legacy/01-login.html` (status 200).
- `npm run lint` (oxlint): sin errores. `npm run build` (Vite): éxito.

### Notas de diseño conservadas de los HTML originales
- Variables CSS idénticas (`--bg-base`, `--bg-panel`, `--bg-input`, `--accent`, etc.) en `variables.css`.
- Clave de sesión exacta `sm_usuario` en `sessionStorage`, igual que el login original.
- Estadísticas del dashboard calculadas en cliente desde `/api/canciones`, `/api/usuarios`, `/api/auditoria` (como el HTML original; no existe `/api/stats`).
- El contador de canciones del sidebar se sincroniza mediante el evento `canciones:updated` disparado al crear/eliminar canciones.
- Accesibilidad: roles ARIA (`banner`, `main`, `contentinfo`, `dialog`, `alertdialog`), `aria-live` en toasts y errores, `aria-required`, toggle de contraseña accesible por teclado, Esc cierra modales.

---

# Fase 3: integración de módulos, pruebas y preparación para despliegue

Cambios hechos sobre el proyecto de la Fase 2. Todos están cubiertos por pruebas automáticas (`npm test` en la raíz y en `frontend-react/`).

## Cambios en el backend

| # | Cambio | Archivos | Motivo |
|---|--------|----------|--------|
| 1 | La aplicación Express se separa del arranque: `app.js` ensambla middlewares y rutas, `server.js` solo abre el puerto | `src/app.js`, `src/server.js` | Poder probar la API sin abrir el puerto de producción |
| 2 | CORS configurable con `CORS_ORIGIN` (lista separada por comas). Sin la variable se permite cualquier origen, como antes | `src/app.js` | En producción solo el dominio del frontend debe consumir la API |
| 3 | Ruta `GET /api/health` que consulta la BD | `src/app.js` | Verificación de salud para la plataforma de despliegue |
| 4 | TLS opcional hacia MySQL (`DB_SSL`, `DB_SSL_CA`) y puerto numérico con valor por defecto 3306 | `src/config/db.js` | Los servicios gestionados de MySQL exigen conexión cifrada |
| 5 | Corrección: `Usuario.actualizar` convierte `apellidos` y `fecha_nac` ausentes en `NULL` | `src/models/Usuario.js` | Un `PUT` sin esos campos fallaba con `Bind parameters must not contain undefined` y el mensaje interno llegaba al cliente |
| 6 | Corrección: `Cancion.crear` convierte `genero` y `anio` ausentes en `NULL` | `src/models/Cancion.js` | Crear una canción solo con título y artista devolvía error 500 por el mismo motivo |
| 7 | `DELETE /api/canciones/:id` audita la baja a nombre del usuario que la ejecuta (`idUsuario` en el cuerpo o la consulta; 1 si no llega) | `src/routes/cancionRoutes.js` | El usuario 1 estaba fijo; en una base nueva podía no existir y la auditoría fallaba por llave foránea |

## Cambios en el frontend

| # | Cambio | Archivos |
|---|--------|----------|
| 1 | `VITE_API_URL` define la URL base de la API en producción; en desarrollo queda vacía y sigue funcionando el proxy de Vite | `src/utils/api.js`, `.env.example` |
| 2 | La baja de canciones envía el id del usuario en sesión | `src/pages/CancionesPage.jsx` |
| 3 | Reescritura de rutas a `index.html` para que React Router funcione al recargar cualquier ruta | `vercel.json` |

## Archivos nuevos

`test/` (pruebas del backend), `src/**/*.test.js` (pruebas del frontend), `.env.example`, `.env.test.example`, `render.yaml`, `sistema_musical_seed_minimo.sql`, `README.md`.

## Limitaciones conocidas (sin corregir)

1. Un año fuera del rango de `YEAR` de MySQL (1901 a 2155) o un texto más largo que la columna devuelve 500 con el mensaje del driver. Falta validar en la ruta.
2. Los endpoints de la API no exigen autenticación: el login devuelve los datos del usuario, pero no un token, y la sesión vive en `sessionStorage` del navegador.
3. La ruta 404 sigue respondiendo el HTML de login con estado 200.
4. `DELETE /api/usuarios/:id` no deja registro en auditoría.
5. El servicio gratuito de Render se suspende tras un periodo de inactividad y la primera petición posterior tarda más en responder.

## Resultado de las pruebas de esta fase

| Suite | Pruebas | Resultado |
|-------|---------|-----------|
| Backend, unitarias (`npm run test:unit`) | 37 | 37 correctas |
| Backend, integración con MySQL (`npm run test:integration`) | 20 | 20 correctas |
| Frontend, unitarias (`npm test` en `frontend-react/`) | 11 | 11 correctas |
| Lint (`npm run lint`) | 4 advertencias | 0 errores |
| Compilación (`npm run build`) | | Correcta |
