# Backend de Disponibilidad - Arquitectura con Oracle Package

## 📌 Resumen

Sistema de gestión de disponibilidad de propiedades que combina **BOOKINGS** (reservas) y **AVAILABILITIES** (bloqueos/mantenimiento) para determinar qué fechas están disponibles para reservar.

**Implementación:** Oracle PL/SQL Package con **PROCEDURES y OUT cursors** (mismo patrón que PROPERTY_PKG, BOOKING_PKG, etc.)

---

## 🗂️ Estructura de Tablas

### BOOKINGS
Reservas confirmadas y pendientes que bloquean automáticamente las fechas.

```sql
PROPERTY_ID     NUMBER
TENANT_ID       NUMBER
CHECKIN_DATE    TIMESTAMP(6)
CHECKOUT_DATE   TIMESTAMP(6)
STATUS          VARCHAR2(20)  -- 'CONFIRMED', 'PENDING'
```

### AVAILABILITIES
Reglas de disponibilidad definidas por el host.

```sql
PROPERTY_ID     NUMBER
START_DATE      DATE
END_DATE        DATE
KIND            VARCHAR2(30)  -- 'BLOCKED', 'MAINTENANCE'
```

**KIND values:**
- `'BLOCKED'`: Fechas bloqueadas manualmente por el host
- `'MAINTENANCE'`: Fechas de mantenimiento del recinto

**Nota:** Los valores de `STATUS` y `KIND` deben estar en **MAYÚSCULAS**.

---

## 🔧 Oracle Package: PKG_PROPERTY_AVAILABILITY

### Ubicación
`docs/oracle_package_availability.sql`

### Procedimientos

#### 1. `SP_GET_PROPERTY_AVAILABILITY` (PROCEDURE con OUT cursor)
Obtiene la disponibilidad día por día de una propiedad.

**Firma:**
```sql
PROCEDURE SP_GET_PROPERTY_AVAILABILITY(
  P_PROPERTY_ID             IN NUMBER,
  P_START_DATE              IN VARCHAR2,      -- 'YYYY-MM-DD'
  P_END_DATE                IN VARCHAR2,      -- 'YYYY-MM-DD'
  OUT_AVAILABILITY_CURSOR   OUT SYS_REFCURSOR,
  OUT_ERROR_CODE            OUT VARCHAR2
);
```

**Retorna en cursor:**
- `DATE_STR` VARCHAR2(10) - Fecha en formato 'YYYY-MM-DD'
- `IS_AVAILABLE` NUMBER(1) - 1=disponible, 0=no disponible
- `REASON` VARCHAR2(20) - 'available', 'booked', 'blocked', 'maintenance'

**Ejemplo en PL/SQL:**
```sql
DECLARE
  v_cursor SYS_REFCURSOR;
  v_error VARCHAR2(4000);
  v_date VARCHAR2(10);
  v_available NUMBER;
  v_reason VARCHAR2(20);
BEGIN
  PKG_PROPERTY_AVAILABILITY.SP_GET_PROPERTY_AVAILABILITY(
    P_PROPERTY_ID => 28,
    P_START_DATE => '2025-11-01',
    P_END_DATE => '2025-11-30',
    OUT_AVAILABILITY_CURSOR => v_cursor,
    OUT_ERROR_CODE => v_error
  );
  
  IF v_error IS NULL THEN
    LOOP
      FETCH v_cursor INTO v_date, v_available, v_reason;
      EXIT WHEN v_cursor%NOTFOUND;
      DBMS_OUTPUT.PUT_LINE(v_date || ' - ' || v_reason);
    END LOOP;
    CLOSE v_cursor;
  END IF;
END;
```

#### 2. `SP_CHECK_RANGE_AVAILABILITY` (PROCEDURE con OUT NUMBER)
Verifica si un rango de fechas está completamente disponible para reservar.

**Firma:**
```sql
PROCEDURE SP_CHECK_RANGE_AVAILABILITY(
  P_PROPERTY_ID     IN NUMBER,
  P_CHECKIN_DATE    IN VARCHAR2,      -- 'YYYY-MM-DD'
  P_CHECKOUT_DATE   IN VARCHAR2,      -- 'YYYY-MM-DD'
  OUT_IS_AVAILABLE  OUT NUMBER,       -- 1=disponible, 0=no
  OUT_ERROR_CODE    OUT VARCHAR2
);
```

**Ejemplo en PL/SQL:**
```sql
DECLARE
  v_available NUMBER;
  v_error VARCHAR2(4000);
BEGIN
  PKG_PROPERTY_AVAILABILITY.SP_CHECK_RANGE_AVAILABILITY(
    P_PROPERTY_ID => 28,
    P_CHECKIN_DATE => '2025-11-10',
    P_CHECKOUT_DATE => '2025-11-15',
    OUT_IS_AVAILABLE => v_available,
    OUT_ERROR_CODE => v_error
  );
  
  DBMS_OUTPUT.PUT_LINE('Is Available: ' || v_available);
END;
```

#### 3. `SP_GET_NEXT_AVAILABLE_DATES` (PROCEDURE con OUT cursor)
Obtiene las próximas N fechas disponibles a partir de hoy.

**Firma:**
```sql
PROCEDURE SP_GET_NEXT_AVAILABLE_DATES(
  P_PROPERTY_ID       IN NUMBER,
  P_COUNT             IN NUMBER DEFAULT 5,
  OUT_DATES_CURSOR    OUT SYS_REFCURSOR,
  OUT_ERROR_CODE      OUT VARCHAR2
);
```

**Retorna en cursor:**
- `AVAILABLE_DATE` VARCHAR2(10) - Fecha disponible en formato 'YYYY-MM-DD'

**Ejemplo en PL/SQL:**
```sql
DECLARE
  v_cursor SYS_REFCURSOR;
  v_error VARCHAR2(4000);
  v_date VARCHAR2(10);
BEGIN
  PKG_PROPERTY_AVAILABILITY.SP_GET_NEXT_AVAILABLE_DATES(
    P_PROPERTY_ID => 28,
    P_COUNT => 10,
    OUT_DATES_CURSOR => v_cursor,
    OUT_ERROR_CODE => v_error
  );
  
  IF v_error IS NULL THEN
    LOOP
      FETCH v_cursor INTO v_date;
      EXIT WHEN v_cursor%NOTFOUND;
      DBMS_OUTPUT.PUT_LINE('Available: ' || v_date);
    END LOOP;
    CLOSE v_cursor;
  END IF;
END;
```

---

## 🎯 Lógica de Prioridad

La disponibilidad se determina en el siguiente orden (implementado en Oracle):

1. **BOOKINGS con STATUS IN ('CONFIRMED', 'PENDING')** → ❌ NO disponible (`reason: 'booked'`)
2. **AVAILABILITIES con KIND = 'BLOCKED'** → ❌ NO disponible (`reason: 'blocked'`)
3. **AVAILABILITIES con KIND = 'MAINTENANCE'** → ❌ NO disponible (`reason: 'maintenance'`)
4. **Por defecto** → ✅ Disponible (`reason: 'available'`)

---

## 💻 TypeScript Service

### PropertyAvailabilityService

**Ubicación:** `src/services/property-availability.service.ts`

**Patrón:** Sigue el mismo estilo que `PROPERTY_PKG` y `BOOKING_PKG` (BEGIN...END con OUT cursors)

#### Métodos que usan Stored Procedures:

```typescript
// 1. Obtener disponibilidad detallada
static async getPropertyAvailability(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<PropertyAvailabilityDay[]>

// Llamada interna:
BEGIN
  PKG_PROPERTY_AVAILABILITY.SP_GET_PROPERTY_AVAILABILITY(
    P_PROPERTY_ID => :p_property_id,
    P_START_DATE => :p_start_date,
    P_END_DATE => :p_end_date,
    OUT_AVAILABILITY_CURSOR => :out_availability_cursor,
    OUT_ERROR_CODE => :out_error_code
  );
END;

// 2. Verificar si un rango está disponible
static async isRangeAvailable(
  propertyId: number,
  checkinDate: Date,
  checkoutDate: Date
): Promise<boolean>

// Llamada interna:
BEGIN
  PKG_PROPERTY_AVAILABILITY.SP_CHECK_RANGE_AVAILABILITY(
    P_PROPERTY_ID => :p_property_id,
    P_CHECKIN_DATE => :p_checkin_date,
    P_CHECKOUT_DATE => :p_checkout_date,
    OUT_IS_AVAILABLE => :out_is_available,
    OUT_ERROR_CODE => :out_error_code
  );
END;

// 3. Obtener próximas fechas disponibles
static async getNextAvailableDates(
  propertyId: number,
  count?: number
): Promise<string[]>

// Llamada interna:
BEGIN
  PKG_PROPERTY_AVAILABILITY.SP_GET_NEXT_AVAILABLE_DATES(
    P_PROPERTY_ID => :p_property_id,
    P_COUNT => :p_count,
    OUT_DATES_CURSOR => :out_dates_cursor,
    OUT_ERROR_CODE => :out_error_code
  );
END;
```

#### Métodos de escritura (No usan stored procedures):

```typescript
// Bloquear fechas manualmente
static async blockDates(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<void>

// Marcar mantenimiento
static async markMaintenance(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<void>

// Desbloquear fechas
static async unblockDates(
  propertyId: number,
  startDate: Date,
  endDate: Date,
  kind: 'BLOCKED' | 'MAINTENANCE'
): Promise<void>
```

#### Método calculado en TypeScript:

```typescript
// Obtener resumen estadístico
static async getAvailabilitySummary(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<AvailabilitySummary>

// Retorna: { totalDays, availableDays, bookedDays, blockedDays, maintenanceDays }
```

---

## 🌐 API Endpoints

### GET `/api/properties/[id]/availability`

Obtiene la disponibilidad de una propiedad en un rango de fechas.

**Query Params:**
- `startDate`: Fecha inicial (YYYY-MM-DD)
- `endDate`: Fecha final (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "propertyId": 28,
    "startDate": "2025-11-01",
    "endDate": "2025-11-30",
    "availability": [
      { "date": "2025-11-01", "available": true, "reason": "available" },
      { "date": "2025-11-02", "available": false, "reason": "booked" },
      { "date": "2025-11-03", "available": false, "reason": "blocked" }
    ],
    "meta": {
      "totalDays": 30,
      "availableDays": 20,
      "bookedDays": 5,
      "blockedDays": 3,
      "maintenanceDays": 2
    }
  }
}
```

### POST `/api/properties/[id]/availability`

Valida si un rango de fechas está disponible para reservar.

**Body:**
```json
{
  "checkinDate": "2025-11-10",
  "checkoutDate": "2025-11-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "propertyId": 28,
    "checkinDate": "2025-11-10",
    "checkoutDate": "2025-11-15"
  }
}
```


## 🚀 Instalación del Package

### 1. Ejecutar el script SQL

Conectarse a Oracle como usuario con permisos para crear packages:

```bash
sqlplus usuario/password@database
@docs/oracle_package_availability.sql
```

### 2. Otorgar permisos (ajustar según tu usuario de app)

```sql
GRANT EXECUTE ON PKG_PROPERTY_AVAILABILITY TO tu_usuario_app;
```

### 3. Verificar instalación

```sql
-- Ver compilación del package
SELECT object_name, object_type, status 
FROM user_objects 
WHERE object_name = 'PKG_PROPERTY_AVAILABILITY';

-- Debe mostrar:
-- PKG_PROPERTY_AVAILABILITY | PACKAGE      | VALID
-- PKG_PROPERTY_AVAILABILITY | PACKAGE BODY | VALID
```

### 4. Probar el package

```sql
-- Test con variable de cursor
DECLARE
  v_cursor SYS_REFCURSOR;
  v_error VARCHAR2(4000);
  v_date VARCHAR2(10);
  v_available NUMBER;
  v_reason VARCHAR2(20);
BEGIN
  PKG_PROPERTY_AVAILABILITY.SP_GET_PROPERTY_AVAILABILITY(
    P_PROPERTY_ID => 28,
    P_START_DATE => '2025-11-01',
    P_END_DATE => '2025-11-30',
    OUT_AVAILABILITY_CURSOR => v_cursor,
    OUT_ERROR_CODE => v_error
  );
  
  IF v_error IS NOT NULL THEN
    DBMS_OUTPUT.PUT_LINE('Error: ' || v_error);
  ELSE
    LOOP
      FETCH v_cursor INTO v_date, v_available, v_reason;
      EXIT WHEN v_cursor%NOTFOUND;
      DBMS_OUTPUT.PUT_LINE(v_date || ' - ' || v_reason);
    END LOOP;
    CLOSE v_cursor;
  END IF;
END;
/
```

---

## 📊 Ventajas del Patrón OUT Cursor

✅ **Consistencia:** Mismo patrón que PROPERTY_PKG, BOOKING_PKG, USER_PKG  
✅ **Manejo de Errores:** OUT_ERROR_CODE explícito para mejor control  
✅ **Estándar del Proyecto:** Fácil mantenimiento por otros desarrolladores  
✅ **Flexibilidad:** Los cursores permiten procesamiento granular  
✅ **Performance:** Oracle optimiza bien los cursores REF  

---

## 🔍 Debugging

### Verificar datos de prueba

```sql
-- Ver bookings de una propiedad
SELECT * FROM BOOKINGS WHERE PROPERTY_ID = 28;

-- Ver bloqueos/mantenimiento
SELECT * FROM AVAILABILITIES WHERE PROPERTY_ID = 28;

-- Probar disponibilidad con PL/SQL
DECLARE
  v_cursor SYS_REFCURSOR;
  v_error VARCHAR2(4000);
  v_date VARCHAR2(10);
  v_available NUMBER;
  v_reason VARCHAR2(20);
BEGIN
  PKG_PROPERTY_AVAILABILITY.SP_GET_PROPERTY_AVAILABILITY(
    28, '2025-11-01', '2025-11-30', v_cursor, v_error
  );
  
  LOOP
    FETCH v_cursor INTO v_date, v_available, v_reason;
    EXIT WHEN v_cursor%NOTFOUND;
    DBMS_OUTPUT.PUT_LINE(v_date);
  END LOOP;
  CLOSE v_cursor;
END;
/
```

### Errores comunes

1. **"Package not found"**
   - Verificar que el package esté compilado: `SELECT status FROM user_objects WHERE object_name = 'PKG_PROPERTY_AVAILABILITY'`
   - Verificar permisos de EXECUTE

2. **"OUT_ERROR_CODE not null"**
   - El SP retornó un error, verificar el mensaje en `OUT_ERROR_CODE`
   - Validar que los parámetros sean correctos (fechas en formato 'YYYY-MM-DD', IDs válidos)

3. **"Cursor already closed"**
   - No cerrar el cursor manualmente si ya fue cerrado en el catch del SP
   - Verificar que el cursor existe antes de intentar cerrarlo

---

## 📝 Notas Importantes

- **Patrón del Proyecto:** Usa PROCEDURES con OUT cursors (no PIPELINED FUNCTIONS)
- **Nomenclatura:** Prefijo `SP_` en los procedimientos para consistencia
- **Manejo de Errores:** Siempre validar `OUT_ERROR_CODE` antes de procesar resultados
- **Fechas futuras:** Los stored procedures solo retornan fechas >= SYSDATE
- **Checkout day:** El día de checkout NO se cuenta como ocupado
- **Case sensitive:** Los valores de STATUS y KIND deben estar en **MAYÚSCULAS**
- **Formato fechas:** Siempre usar 'YYYY-MM-DD' en las llamadas

---
