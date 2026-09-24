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