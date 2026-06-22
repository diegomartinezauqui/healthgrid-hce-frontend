# Guía de Integración Frontend-Backend — Módulo HCE (Historia Clínica Electrónica)

Esta guía detalla la arquitectura, endpoints clave, estructura de autenticación y estrategia de transición (Mock vs Real) para conectar la aplicación Frontend con el Backend de HCE.

---

## ⚙️ 1. Estrategia de Transición: Mock vs Real (Environment Variables)

Para permitir a los desarrolladores y agentes de IA alternar dinámicamente entre mocks locales y el backend real, implementaremos un sistema de abstracción mediante variables de entorno y el patrón Service Factory.

### Variables de Entorno (`.env.local` / `.env.development`)
```bash
# Define si el frontend usa datos locales mockeados (true) o llamadas reales de red (false)
VITE_USE_MOCKS=true

# URL base del API de HCE
VITE_API_URL=http://localhost:8001/api/v1
```

### Arquitectura de Capas de Servicio
Para desacoplar las vistas/componentes del origen de datos, se estructuran los servicios de la siguiente forma:

1. **`types.ts`**: Definición de interfaces TypeScript basadas en las respuestas JSON del backend.
2. **`api/`**: Contiene la implementación HTTP real utilizando `fetch` o `axios` apuntando a `VITE_API_URL`.
3. **`mocks/`**: Contiene la simulación local utilizando datos harcodeados o almacenamiento temporal local.
4. **`ServiceFactory`**: Determina qué clase instanciar según el valor de `VITE_USE_MOCKS`.

#### Ejemplo de Implementación (`src/services/salaEsperaService.ts`):
```typescript
import { SalaEsperaSchema, SalaEsperaPrioridad } from './types';
import { SalaEsperaApi } from './api/SalaEsperaApi';
import { SalaEsperaMock } from './mocks/SalaEsperaMock';

export interface ISalaEsperaService {
  listar(medicoId?: number, sedeId?: number): Promise<SalaEsperaSchema[]>;
  ingresar(pacienteId: number, medicoId: number, sedeId: number): Promise<SalaEsperaSchema>;
  actualizarPrioridad(idEspera: number, prioridad: number, motivo?: string): Promise<SalaEsperaSchema>;
  llamar(idEspera: number, consultorio: number): Promise<SalaEsperaSchema>;
  atender(idEspera: number, idEpisodio?: number): Promise<SalaEsperaSchema>;
}

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export const SalaEsperaService: ISalaEsperaService = useMocks
  ? new SalaEsperaMock()
  : new SalaEsperaApi();
```

---

## 🔑 2. Autenticación y Autorización (JWT)

El backend de HCE valida tokens JWT emitidos por el **Módulo 10 (Core)** de forma local. 
- Las peticiones HTTP reales deben adjuntar el header: `Authorization: Bearer <JWT_TOKEN>`.
- Las pantallas que consulten o escriban en HCE deben validar localmente o interceptar errores `401 Unauthorized` / `403 Forbidden` si los permisos del profesional de la salud no son adecuados.

---

## 🔌 3. Endpoints Clave y Mapeo de Objetos

El backend expone su documentación Swagger interactiva en `http://localhost:8001/docs`. Los flujos prioritarios a integrar son:

### A. Sala de Espera (Triage / Guardia / Consulta)

#### 1. Listar Pacientes
- **Método**: `GET`
- **Ruta**: `/api/v1/sala-espera`
- **Query Params**: `id_medico`, `id_sede`, `estado`, `ordenar_por` (`llegada` o `prioridad`).
- **Respuesta (`SalaEsperaSchema`)**:
  ```json
  [
    {
      "id_espera": 12,
      "id_paciente": 3002,
      "id_episodio": null,
      "id_medico": 42,
      "id_sede": 3,
      "id_turno_m2": 50002,
      "fecha_llegada": "2026-06-21T09:45:00Z",
      "fecha_turno": "2026-06-21T10:00:00Z",
      "prioridad": 1,
      "estado": "Esperando",
      "consultorio": null,
      "motivo": "-"
    }
  ]
  ```

#### 2. Registrar Ingreso Manual (Webhook/Recepción)
- **Método**: `POST`
- **Ruta**: `/api/v1/sala-espera/ingreso`
- **Body (`SalaEsperaCreate`)**:
  *(Nota: El motivo de consulta no se envía al ingresar, se inicializa automáticamente en `"-"`)*
  ```json
  {
    "id_paciente": 3002,
    "id_medico": 42,
    "id_sede": 3,
    "id_turno_m2": 50002,
    "fecha_turno": "2026-06-21T10:00:00Z",
    "fecha_llegada": "2026-06-21T09:45:00Z"
  }
  ```

#### 3. Clasificar Prioridad y Motivo (Triage - M9)
- **Método**: `PATCH`
- **Ruta**: `/api/v1/sala-espera/{id_espera}/prioridad`
- **Body (`SalaEsperaPrioridad`)**:
  *(El campo `motivo` es opcional; si no se envía, no se sobrescribe el motivo actual)*
  ```json
  {
    "prioridad": 3,
    "motivo": "Dolor fuerte de cabeza"
  }
  ```

#### 4. Llamar Paciente a Consultorio
- **Método**: `PATCH`
- **Ruta**: `/api/v1/sala-espera/{id_espera}/llamar`
- **Body (`SalaEsperaLlamar`)**:
  ```json
  {
    "consultorio": 104
  }
  ```

#### 5. Atender Paciente (Vinculación / Creación de Episodio)
- **Método**: `PATCH`
- **Ruta**: `/api/v1/sala-espera/{id_espera}/atender`
- **Body (`SalaEsperaAtender` - Opcional)**:
  ```json
  {
    "id_episodio": 123  // Enviar si se asocia a un episodio existente; omitir para crear uno automático
  }
  ```

---

### B. Historia Clínica, Ficha Médica y Pacientes

Para desplegar y persistir evoluciones clínicas, diagnósticos y recetas, así como consultar datos demográficos:

* **Consultar Datos de Paciente (Caché)**: `GET /api/v1/pacientes/{id_paciente}`
* **Listar Pacientes Cacheados**: `GET /api/v1/pacientes`
* **Ficha Médica del Paciente**: `GET /api/v1/pacientes/{id_paciente}/ficha-medica`
* **Agregar Antecedentes**: `POST /api/v1/pacientes/{id_paciente}/antecedentes`
* **Registrar Evolución**: `POST /api/v1/episodes/{id_episodio}/evoluciones`
* **Emitir Recetas**: `POST /api/v1/recetas`

---

## 🔑 3. Generación de Token JWT para Desarrollo

Cuando el frontend corre en modo real, el backend requiere autenticación por token Bearer en casi todos sus endpoints. Para facilitar el desarrollo y evitar depender del Módulo 10 (Core) levantado localmente, el backend de HCE incluye un endpoint especial de autenticación para desarrollo (activo únicamente si `APP_ENV` no es `production`).

### Endpoint de Login Dev
- **Método**: `POST`
- **Ruta**: `/api/v1/dev/login`
- **Body (`DevLoginRequest` - Opcional)**:
  Puedes enviar un cuerpo vacío `{}` para obtener un token con el usuario por defecto (médico con todos los permisos) o personalizarlo:
  ```json
  {
    "sub": 42,
    "username": "dr.triage",
    "role": "medico",
    "sede_id": 3,
    "permissions": [
      "hce:episodes:read",
      "hce:episodes:write"
    ]
  }
  ```
- **Respuesta (`DevLoginResponse`)**:
  Devuelve el token de acceso JWT y la información del usuario dev:
  ```json
  {
    "access_token": "ey...",
    "token_type": "bearer",
    "user": {
      "id": 42,
      "username": "dr.triage",
      "role": "medico",
      "permissions": ["hce:episodes:read", "hce:episodes:write"]
    }
  }
  ```

*Tip para el Agente Frontend:* Puedes configurar un script de inicio o una llamada en el setup del entorno de desarrollo del frontend para golpear este endpoint y almacenar automáticamente el token en `localStorage` o en los headers del cliente HTTP, lo que agilizará las pruebas manuales y automatizadas.

---

## 🚀 4. Plan de Acción Recomendado para el Agente Frontend

1. **Crear Rama de Trabajo**: `feature/integrate-hce-backend`.
2. **Configurar Variable**: Añadir `VITE_USE_MOCKS=true` en `.env.local`.
3. **Modelar Interfaces**: Copiar/generar los tipos TypeScript a partir de la API docs `/docs`.
4. **Implementar Factory Pattern**: Migrar los componentes del frontend para que consuman servicios estructurados (`ISalaEsperaService`).
5. **Validar Localmente**: Asegurar que con `VITE_USE_MOCKS=true` la app sigue funcionando al 100% como antes.
6. **Configurar Login de Dev**: Si se detecta `VITE_USE_MOCKS=false` y no hay un token guardado, invocar `POST /api/v1/dev/login` para simular la sesión.
7. **Probar Modo Real**: Levantar el backend de HCE en `localhost:8001`, realizar ingresos y triages reales, y verificar persistencia.
