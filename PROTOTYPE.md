# PROTOTYPE.md

## Prototipo: Escenarios Clave

Este documento describe los tres escenarios principales desarrollados como prototipo para la plataforma Smart. Cada escenario incluye una breve descripción, el valor que aporta frente a los procesos manuales actuales y las rutas de navegación para probar el flujo en la aplicación.

---

### 1. Reserva y pago de recinto

**Descripción:**  
El huésped accede al detalle de un recinto específico, selecciona fechas de check-in y check-out, número de huéspedes, y el sistema calcula automáticamente las noches y precios en tiempo real. Al confirmar la reserva, se abre un modal de checkout que muestra el desglose detallado (precio base × noches, comisión de servicio del 14%, total final). El sistema procesa el pago y muestra confirmación con recibo digital.

**Flujo completo del escenario:**
1. **Página de detalle** (`/properties/[id]`): Visualiza información completa del recinto, galería, amenidades y reseñas
2. **Selección de fechas**: Usa el card de reserva para elegir check-in, check-out y huéspedes
3. **Cálculo automático**: El sistema valida fechas y calcula precios en tiempo real
4. **Modal de checkout**: Muestra desglose transparente de precios y procesa el pago
5. **Confirmación**: Modal de éxito con recibo y activación del hard-lock de fechas

**Hoy vs. lo que automatiza el sistema:**  
- *Hoy:* Coordinación por chat o portales, pago por transferencia/efectivo sin custodia ni liberación programada; alto riesgo de no-show o disputa.  
- *Automatiza:* Hard-lock de fechas, cobro con pasarela y webhooks, custodia hasta check-in y liberación automática 24 h post check-in; generación de recibo y notificaciones.

**Rutas para probar el prototipo:**  
- `/properties/[id]` — Página de detalle con sistema de reserva integrado  
- Ejemplo: `/properties/28` — Flujo completo de reserva y pago  
- `/host/properties` — Vista de propiedades disponibles para reservar

---

### 2. Búsqueda avanzada con filtros y mapa

**Descripción:**  
El huésped accede a la página de búsqueda donde puede aplicar múltiples filtros de forma intuitiva: ciudad de destino, rango de fechas (entrada/salida), número de huéspedes, rango de precios (min/máx), cantidad de habitaciones, camas y baños, además de amenidades específicas (Wi-Fi, estacionamiento, piscina, etc.). Los resultados se muestran simultáneamente en una lista de tarjetas y en un mapa interactivo con marcadores de precio.

**Flujo completo del escenario:**
1. **Página de búsqueda** (`/search`): Interface con filtros organizados y mapa integrado
2. **Aplicación de filtros**: Sistema de filtros en tiempo real con validación automática
3. **Sincronía lista-mapa**: Cambios en el mapa afectan la lista y viceversa automáticamente
4. **Resultados dinámicos**: Tarjetas de propiedades con información clave y precios
5. **Navegación fluida**: Click en propiedades abre detalle sin perder estado de búsqueda

**Automatizaciones observables:**
- ✅ Filtros validados con rangos numéricos y selección múltiple de amenidades
- ✅ Sincronización bidireccional entre vista de lista y mapa interactivo
- ✅ Cálculo automático de noches basado en fechas seleccionadas
- ✅ Bounds del mapa influyen en los resultados mostrados automáticamente
- ✅ Estado persistente de filtros al navegar entre propiedades y regresar

**Hoy vs. lo que automatiza el sistema:**  
- *Hoy:* El usuario repite búsquedas en varias plataformas, compara manualmente precios y alterna con Google Maps. La disponibilidad no siempre es confiable.  
- *Automatizado:* Buscador centralizado, filtros consistentes, sincronía lista↔mapa, disponibilidad verificada, posibilidad de guardar filtros y reanudar búsqueda.

**Rutas para probar el prototipo:**  
- `/search` — Página principal de búsqueda con filtros y mapa integrado  
- `/search?city=Lima&capacityTotal=2` — Búsqueda con parámetros específicos  
- `/properties/[id]` — Detalle de propiedad (mantiene contexto de búsqueda)

---

### 3. Publicar habitación

**Descripción:**  
El anfitrión accede a su panel de gestión donde puede ver todas sus propiedades existentes en formato de tarjetas con información clave (título, ubicación, precio, estado, reservas, calificación). Desde aquí puede crear nuevas publicaciones haciendo click en "Nueva Propiedad" o "Agregar Propiedad", editar propiedades existentes, ver cómo se ven públicamente, y gestionar su catálogo completo con funciones de búsqueda.

**Flujo completo del escenario:**
1. **Panel de propiedades** (`/host/properties`): Vista grid con todas las propiedades del anfitrión
2. **Gestión visual**: Tarjetas con estados (activa/inactiva/pendiente), estadísticas y acciones rápidas
3. **Búsqueda interna**: Filtro por título o ubicación para encontrar propiedades específicas
4. **Acciones múltiples**: Botones para editar, ver vista pública, o eliminar cada propiedad
5. **Formulario de creación**: Click en "Nueva Propiedad" lleva al formulario de publicación

**Automatizaciones observables:**
- ✅ Estados visuales automáticos con colores diferenciados por estado de la propiedad
- ✅ Estadísticas en tiempo real (número de reservas, calificación promedio)
- ✅ Búsqueda en vivo que filtra propiedades mientras se escribe
- ✅ Navegación contextual entre edición, vista pública y gestión
- ✅ Estado vacío inteligente que guía al usuario a crear su primera propiedad

**Hoy vs. lo que automatiza el sistema:**  
- *Hoy:* Publicación manual en grupos, portales o chats, sin control de formato ni estandarización. Gestión dispersa sin vista centralizada.  
- *Automatiza:* Panel unificado de gestión, formulario validado, datos completos y foto obligatoria, guardado en base de datos y publicación automática en búsquedas con estados controlados.

**Rutas para probar el prototipo:** 
- `/host/properties` — Panel principal de gestión con vista de todas las propiedades  
- `/host/properties/publish` — Formulario para crear nueva publicación (actualmente en desarrollo)  
- `/host/properties/edit/[id]` — Edición de propiedades existentes  
- `/host/dashboard` — Acceso rápido desde dashboard con botón "Agregar propiedad"
