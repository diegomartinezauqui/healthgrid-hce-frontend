# 🏗️ Contexto de Arquitectura — HealthGrid HCE

> **Propósito de este documento:** Proveer el contexto tecnológico completo del sistema HealthGrid HCE para que una IA pueda generar un diagrama de arquitectura preciso.  
> **Fecha de relevamiento:** Julio 2026

---

## 1. Descripción General del Sistema

**HealthGrid HCE** es un sistema de Historia Clínica Electrónica (HCE) compuesto por múltiples módulos desacoplados. Este repositorio es el **frontend del módulo HCE**, que se comunica con dos backends diferenciados:

| Nombre | Rol | Tipo |
|--------|-----|------|
| **HCE Backend** | Gestión clínica: fichas, episodios, evoluciones, recetas, órdenes de estudio, sala de espera | FastAPI (Python) — microservicio propio |
| **Core (M10)** | Autenticación SSO, padrón de pacientes, agendas/turnos | FastAPI (Python) — módulo externo / compartido |

---

## 2. Stack Tecnológico

### 2.1 Frontend (este repositorio)

| Categoría | Tecnología | Versión | Función |
|-----------|-----------|---------|---------|
| Framework UI | **React** | 19.x | Biblioteca de componentes y estado reactivo |
| Bundler / Dev Server | **Vite** | 8.x | Compilación, HMR, variables de entorno |
| Lenguaje | **JavaScript (JSX)** | ES Modules | Sin TypeScript |
| HTTP Client | **Axios** | 1.x | Instancias centralizadas con interceptores |
| Formularios | **React Hook Form** | 7.x | Gestión de formularios clínicos |
| Íconos | **React Icons** | 5.x | Fi*, Ri* icon sets |
| Alertas / Modales | **SweetAlert2** | 11.x | Confirmaciones clínicas, loaders |
| Toast / Notificaciones | **Sonner** | 2.x | Toasts non-blocking |
| Estilos | **Vanilla CSS** | — | CSS modular por componente, sin frameworks |
| Linter | **ESLint** | 10.x | Con plugin react-hooks y react-refresh |

### 2.2 HCE Backend

| Categoría | Tecnología |
|-----------|-----------|
| Framework | **FastAPI** (Python) |
| Auth middleware | `HTTPBearer` + validación JWT (HS256 / RS256) |
| CORS | `CORSMiddleware` con lista de orígenes controlada desde `.env` |
| Algoritmos JWT | HS256 (desarrollo interno) / RS256 (tokens del Core vía JWKS) |
| Configuración | `pydantic-settings` con `.env` |
| Base de datos | PostgreSQL (inferido por el stack HCE) |
| ORM | SQLAlchemy / async (inferido) |
| Cola de mensajes | Kafka (presente, opcional en desarrollo local) |

### 2.3 Core — Módulo 10 (Auth + Padrón)

| Categoría | Tecnología |
|-----------|-----------|
| Framework | **FastAPI** (Python) |
| Auth | OAuth2 / JWT RS256 con JWKS público |
| Endpoint login | `POST /auth/login` |
| Endpoint JWKS | `GET /.well-known/jwks.json` (o derivado de `CORE_API_URL`) |
| Base URL (producción) | `https://api.healthcare.cantero.ar` |

---

## 3. Estructura del Frontend

```
src/
├── context/
│   └── AuthContext.jsx        # Contexto global React: token JWT, user, login(), logout()
│
├── services/
│   ├── api.js                 # Instancias Axios (api → HCE, coreApi → Core)
│   ├── authService.js         # loginCore(), checkAndLoginDev(), logout()
│   ├── pacienteService.js     # Fichas, episodios, evoluciones, recetas, estudios
│   ├── salaEsperaService.js   # Turnos, llamadas, triage, estados de sala
│   ├── ordenService.js        # Pedidos de estudio y carga de resultados
│   ├── solicitudCamaService.js # Internaciones, pases de cama
│   ├── epidemiologia.js       # Datos epidemiológicos
│   ├── mockSalaEspera.js      # Mock data sala de espera (VITE_USE_MOCKS=true)
│   └── mockCoreData.js        # Mock data padrón del Core
│
├── hooks/
│   └── useSalaEspera.js       # Custom hook: agenda, búsqueda paginada, acciones de turno
│
├── pages/
│   ├── Login.jsx              # Auth UI (login real Core + fallback dev)
│   ├── Home.jsx               # Sala de espera + Búsqueda Global
│   ├── PacienteDetalle.jsx    # Vista maestra del paciente
│   ├── EpisodioDetalle.jsx    # Episodio clínico completo (tabs)
│   ├── NuevaFichaMedica.jsx   # Formulario de alta de ficha
│   ├── NuevaEvolucion.jsx     # Formulario de evolución médica
│   ├── NuevaReceta.jsx        # Formulario de receta digital
│   ├── NuevoPedidoEstudio.jsx # Formulario de pedido de estudio
│   └── ...                    # Otros formularios especializados
│
├── components/
│   └── Sidebar.jsx            # Navegación lateral
│
├── utils/
│   └── helpers.js             # Utilidades (formateo HC, fechas, etc.)
│
├── App.jsx                    # Orquestador principal: estado global, routing simple
└── main.jsx                   # Entry point: <AuthProvider><App /></AuthProvider>
```

---

## 4. Flujo de Autenticación (JWT)

```
Usuario ingresa credenciales en Login.jsx
        │
        ▼
authService.loginCore(username, password)
        │
        │  POST /auth/login
        │  Body: { username, password } (JSON)
        │  o form-urlencoded si VITE_CORE_AUTH_FORM=true
        │
        ▼
Core (M10) — https://api.healthcare.cantero.ar
        │
        │  Respuesta: { access_token: "eyJ...", token_type: "bearer" }
        │
        ▼
authService guarda token en:
  ├── localStorage  ("healthgrid_token")
  └── AuthContext   (estado React global)
        │
        ▼
App.jsx — handleLogin({ access_token, user }) → auth.login()
        │
        ▼
Axios interceptor (api.js) — inyecta en CADA request:
  Header: Authorization: Bearer <token>
        │
        ├──▶  api     → HCE Backend  (http://localhost:8000/api/v1)
        └──▶  coreApi → Core (M10)   (https://api.healthcare.cantero.ar)
```

### Validación del token en el backend HCE

```
HCE FastAPI recibe request con Authorization: Bearer <token>
        │
        ├── HTTPBearer extrae el token del header
        │
        ├── get_current_user_from_token() detecta algoritmo del JWT:
        │    ├── alg == "RS256" → decode_core_jwt() vía JWKS del Core
        │    └── alg == "HS256" → decode_jwt() con JWT_SECRET_KEY compartida
        │
        └── Retorna CurrentUser(sub, username, role, permissions, sede_id)
             disponible en endpoints como CurrentUserDep
```

### Manejo de sesión expirada

```
HCE API o Core API → respuesta 401
        │
        ▼
Interceptor Axios (api.js / coreApi)
        │
        ├── localStorage.removeItem("healthgrid_token")
        └── window.dispatchEvent("healthgrid:unauthorized")
                │
                ▼
        App.jsx listener
                │
                ├── auth.logout()   (limpia AuthContext)
                ├── sessionStorage.removeItem("healthgrid_logged_in")
                └── setIsLoggedIn(false)  → redirige a Login
```

---

## 5. Comunicación Frontend ↔ Backends

### Instancias Axios

| Instancia | `baseURL` | Variable de entorno | Uso |
|-----------|-----------|-------------------|-----|
| `api` (default export) | `http://localhost:8000/api/v1` | `VITE_API_URL` | Todos los endpoints HCE |
| `coreApi` (named export) | `https://api.healthcare.cantero.ar` | `VITE_CORE_API_URL` | Login y endpoints del Core |

Ambas instancias:
- Inyectan `Authorization: Bearer <token>` desde `localStorage` en cada request
- Deserializan la respuesta retornando directamente `response.data`
- Emiten `healthgrid:unauthorized` ante un 401

### Endpoints HCE relevantes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/dev/login` | Token HS256 de desarrollo (solo `APP_ENV != production`) |
| `GET` | `/sala-espera` | Lista turnos del médico (params: `id_medico`, `id_sede`) |
| `PATCH` | `/sala-espera/:id/llamar` | Llama al paciente a un consultorio |
| `PATCH` | `/sala-espera/:id/atender` | Inicia atención |
| `PATCH` | `/sala-espera/:id/finalizar` | Finaliza turno |
| `PATCH` | `/sala-espera/:id/ausente` | Marca ausencia |
| `GET` | `/pacientes/:id/ficha` | Obtiene ficha clínica completa |
| `POST` | `/pacientes/:id/ficha` | Crea ficha médica nueva |
| `POST` | `/pacientes/:id/episodios` | Abre nuevo episodio clínico |
| `PATCH` | `/pacientes/:id/episodios/:ep/cerrar` | Cierra episodio (da de alta) |
| `POST` | `/pacientes/:id/episodios/:ep/evoluciones` | Registra evolución |
| `POST` | `/pacientes/:id/episodios/:ep/recetas` | Emite receta digital |
| `POST` | `/ordenes` | Crea pedido de estudio |
| `POST` | `/resultados` | Carga resultado de estudio |

---

## 6. Configuración por Entorno

### Variables de entorno (Vite — `.env.development`)

| Variable | Valor dev | Descripción |
|----------|-----------|-------------|
| `VITE_USE_MOCKS` | `false` | `true` = usa datos mock locales sin backend |
| `VITE_API_URL` | `http://localhost:8000/api/v1` | URL del HCE Backend |
| `VITE_CORE_API_URL` | `https://api.healthcare.cantero.ar` | URL base del Core (M10) |
| `VITE_CORE_LOGIN_PATH` | `/auth/login` | Ruta de login del Core |
| `VITE_CORE_AUTH_FORM` | `false` | `true` si el Core usa form-urlencoded |
| `VITE_APP_ENV` | `development` | Controla fallback demo en Login |

### Variables del HCE Backend (`.env`)

| Variable | Descripción |
|----------|-------------|
| `ALLOWED_ORIGINS` | Orígenes CORS permitidos (lista separada por coma) |
| `JWT_SECRET_KEY` | Clave para tokens HS256 (compartida con Core en dev) |
| `JWT_ALGORITHM` | Algoritmo por defecto (`HS256`) |
| `CORE_API_URL` | URL del Core para validar tokens RS256 vía JWKS |
| `CORE_JWKS_URL` | URL JWKS del Core (derivada de `CORE_API_URL`) |
| `SSO_GRANT_FULL_HCE` | Si el token del Core no trae permisos HCE, se otorgan todos |
| `APP_ENV` | `development` habilita `/dev/login`; `production` lo desactiva |

---

## 7. Modo Mock vs. Modo Real

El sistema soporta dos modos de operación controlados por `VITE_USE_MOCKS`:

| Aspecto | Mock (`true`) | Real (`false`) |
|---------|--------------|----------------|
| Datos de sala espera | `mockSalaEspera.js` | `GET /sala-espera` (HCE) |
| Búsqueda de pacientes | `mockCoreData.js` | `GET /pacientes` (HCE) |
| Ficha médica | Estado local (React) | `GET/POST /pacientes/:id/ficha` (HCE) |
| Token JWT | No se obtiene | `POST /dev/login` (HCE) o `POST /auth/login` (Core) |
| Persistencia | `localStorage` | PostgreSQL vía HCE Backend |

---

## 8. Despliegue (Referencia)

| Entorno | Frontend | HCE Backend | Core (M10) |
|---------|----------|-------------|-----------|
| Desarrollo local | `localhost:5173` (Vite dev) | `localhost:8000` | `localhost:8001` o URL externa |
| Producción | Vercel (o similar CDN) | Servidor / container | `https://api.healthcare.cantero.ar` |

> **CORS:** El HCE Backend valida que el origen de cada request esté listado en `ALLOWED_ORIGINS`. En producción solo se permite el dominio del frontend desplegado.

---

## 9. Componentes Clave para el Diagrama

Los siguientes nodos son relevantes para una representación arquitectural:

1. **Navegador (Browser)** — ejecuta la SPA React/Vite
2. **AuthContext** — estado global JWT en memoria React
3. **localStorage** — persistencia del token entre recargas
4. **Axios `api`** — capa HTTP hacia HCE Backend
5. **Axios `coreApi`** — capa HTTP hacia Core M10
6. **HCE Backend (FastAPI)** — lógica clínica, CORS, validación JWT
7. **Core M10 (FastAPI)** — SSO, JWKS, padrón de pacientes
8. **PostgreSQL** — persistencia clínica (dentro del HCE)
9. **Kafka** — mensajería asíncrona (HCE, opcional en dev)
10. **JWKS Endpoint** — validación de tokens RS256 del Core

```
                        ┌──────────────────────────────────────┐
                        │         Browser (SPA React)          │
                        │                                      │
                        │  ┌────────────┐  ┌───────────────┐  │
                        │  │AuthContext │  │ localStorage  │  │
                        │  │ (JWT/user) │◄─│ healthgrid_   │  │
                        │  └─────┬──────┘  │ token         │  │
                        │        │         └───────────────┘  │
                        │  ┌─────▼──────────────────────────┐ │
                        │  │  Axios Interceptor (REQUEST)   │ │
                        │  │  → Authorization: Bearer <JWT> │ │
                        │  └────────┬──────────────┬────────┘ │
                        └───────────┼──────────────┼──────────┘
                                    │              │
                      HTTPS/HTTP    │              │  HTTPS
                  ┌─────────────────▼──┐    ┌──────▼──────────────────┐
                  │  HCE Backend       │    │  Core M10               │
                  │  FastAPI           │    │  FastAPI                │
                  │                   │    │                         │
                  │  CORSMiddleware    │    │  POST /auth/login       │
                  │  HTTPBearer        │    │  GET  /.well-known/     │
                  │  JWT Validation    │◄───│       jwks.json         │
                  │  (HS256 / RS256)   │    │                         │
                  │                   │    │  Padrón de pacientes    │
                  │  /api/v1/...       │    │  Agendas / Turnos       │
                  └────────┬──────────┘    └─────────────────────────┘
                           │
               ┌───────────┼──────────────┐
               │           │              │
        ┌──────▼─────┐  ┌──▼────┐  ┌─────▼──────┐
        │ PostgreSQL │  │ Kafka │  │ Filesystem │
        │  (clínica) │  │(async)│  │ (archivos) │
        └────────────┘  └───────┘  └────────────┘
```
