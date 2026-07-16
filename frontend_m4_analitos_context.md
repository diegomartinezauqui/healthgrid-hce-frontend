# Contexto de Integración para el Frontend: Órdenes de Laboratorio con Analitos (M4)

Se implementó el flujo completo de **selección de analitos y creación de orden de laboratorio** hacia el Módulo 4 (Laboratorio).

---

## 🆕 Nuevo Endpoint: Catálogo de Analitos

El frontend ahora puede consultar los analitos disponibles en M4 para que el médico los seleccione:

### `GET /api/v1/analitos/laboratorio`

**Query param opcional:** `?categoria=Hematologia` | `Bioquimica` | `Orina`

**Headers requeridos:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "cantidad": 5,
  "data": [
    {
      "id": 1,
      "codigo": "HB",
      "nombre": "Hemoglobina",
      "unidadMedida": "g/dL",
      "categoria": "Hematologia",
      "metodo": "Espectrofotometría"
    },
    {
      "id": 2,
      "codigo": "GLU",
      "nombre": "Glucosa",
      "unidadMedida": "mg/dL",
      "categoria": "Bioquimica",
      "metodo": "Enzimático colorimétrico"
    }
  ]
}
```

**Categorías disponibles en M4:**
- `Hematologia`
- `Bioquimica`
- `Orina`

---

## 🔄 Flujo Completo: Crear Orden de Laboratorio

El flujo de UI recomendado es:

1. **El médico abre el formulario de "Nueva Orden de Laboratorio".**
2. **El frontend llama a `GET /api/v1/analitos/laboratorio`** (opcionalmente filtrado por categoría) y muestra la lista con checkboxes.
3. **El médico selecciona uno o más analitos.**
4. **El frontend llama a `POST /api/v1/pacientes/{id_paciente}/ordenes/laboratorio`** con los IDs seleccionados.

### `POST /api/v1/pacientes/{id_paciente}/ordenes/laboratorio`

> **Sin cambios en este endpoint.** El contrato desde el frontend hacia el backend de HCE permanece igual.

**Body:**
```json
{
  "estudio_ids": [1, 2, 3],
  "descripcion_pedido": "Indicaciones adicionales opcionales",
  "prioridad": "Normal",
  "id_episodio": 101,
  "id_evolucion": 202,
  "origen": "Ambulatorio"
}
```

**Respuesta exitosa (201):**
```json
{
  "status": "success",
  "message": "Orden de laboratorio creada y notificada a M4.",
  "id_orden": 4050
}
```

---

## ⚙️ ¿Qué hace el Backend internamente?

Al recibir el `POST /ordenes/laboratorio`, el backend de HCE:
1. Crea la orden en la base de datos.
2. Obtiene automáticamente las **alertas clínicas activas** del paciente.
3. Llama al nuevo endpoint de M4 **`POST /v1/ordenes/hce`** (idempotente) con el siguiente payload:

```json
{
  "idOrden": 4050,
  "idPaciente": 99,
  "descripcionPedido": "Indicaciones adicionales opcionales",
  "prioridad": "Normal",
  "alertasClinicas": [
    { "tipo": "ALERGIA", "descripcion": "Alergia a penicilina" }
  ],
  "pacienteNombre": "Juan Pérez",
  "pacienteDni": "12345678",
  "pacienteEdad": 45,
  "pacienteSexo": "M"
}
```

> Este envío es **asíncrono** y transparente: el médico recibe la confirmación de la HCE de inmediato sin esperar a M4.

---

## 📝 Resumen de Cambios para UI

| Pantalla | Cambio necesario |
|---|---|
| **Nueva Orden de Laboratorio** | Agregar un paso previo de selección de analitos desde `GET /analitos/laboratorio` en lugar de (o además de) estudios genéricos. |
| **Filtro por categoría** | Opcionalmente, mostrar tabs o un dropdown con las categorías (Hematologia, Bioquimica, Orina) para filtrar la lista de analitos. |
| **Confirmación de orden** | Sin cambios. El endpoint y la respuesta son idénticos. |
