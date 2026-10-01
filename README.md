# SoundManager (sistema-musical)

Sistema de Gestión de Usuarios y Preferencias Musicales. API REST en Node.js y Express, base de datos MySQL 8 y frontend en React con Vite. Proyecto de NariTech Solutions, Pasto, Nariño.

## Estructura

```
sistema-musical/
├─ src/                  API Express (patrón MVC)
│  ├─ app.js             Middlewares y rutas
│  ├─ server.js          Arranque del servidor
│  ├─ config/db.js       Pool de conexiones mysql2 (TLS opcional)
│  ├─ routes/            auth, usuarios, canciones, auditoría
│  ├─ controllers/       Reglas de negocio
│  └─ models/            Acceso a datos (consultas parametrizadas)
├─ frontend-react/       SPA React + Vite
├─ test/                 Pruebas unitarias y de integración del backend
├─ public-legacy/        HTML original de referencia
├─ sistema_musical_schema.sql        Esquema real de la BD
└─ sistema_musical_seed_minimo.sql   Tipos de operación mínimos
```

## Requisitos

Node.js 22 o superior y MySQL 8.

## Puesta en marcha local

1. Crear la base de datos e importar el esquema y la semilla:
   ```
   mysql -u USUARIO -p -e "CREATE DATABASE sistema_musical CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
   mysql -u USUARIO -p sistema_musical < sistema_musical_schema.sql
   mysql -u USUARIO -p sistema_musical < sistema_musical_seed_minimo.sql
   ```
2. Copiar `.env.example` como `.env` y completar los datos de MySQL.
3. Instalar dependencias y arrancar la API (puerto 3000):
   ```
   npm install
   npm run dev
   ```
4. En otra terminal, el frontend (puerto 5173):
   ```
   cd frontend-react
   npm install
   npm run dev
   ```

## Pruebas

Las pruebas de integración usan una base propia cuyo nombre debe terminar en `_test`. Las tablas de esa base se vacían al iniciar.

```
mysql -u USUARIO -p -e "CREATE DATABASE sistema_musical_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -u USUARIO -p sistema_musical_test < sistema_musical_schema.sql
cp .env.test.example .env.test      # completar credenciales
npm test                            # unitarias + integración del backend
cd frontend-react && npm test       # unitarias del frontend
```

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a MySQL |
| `DB_SSL`, `DB_SSL_CA` | TLS hacia MySQL (`true` en servicios gestionados) |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma. Vacío permite cualquiera |
| `PORT` | Puerto de la API |
| `VITE_API_URL` (frontend) | URL pública de la API en producción |

## Despliegue

API en Render con `render.yaml`, base de datos MySQL gestionada con TLS y frontend en Vercel (raíz `frontend-react`, con `VITE_API_URL` apuntando a la API). La ruta `GET /api/health` sirve como verificación de salud.

## Más documentación

`DESVIACIONES.md` registra los cambios respecto a versiones anteriores y las limitaciones conocidas.
