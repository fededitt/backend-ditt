# Backend Turnos

API REST para gestión de turnos y reservas de una barbería.

## Instalación

```bash
npm install
cp .env.example .env
```

Completá los valores en `.env`.

## Ejecución

```bash
npm start      # ejecución normal
npm run dev    # con recarga automática
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| PORT | Puerto del servidor | 8080 |
| NODE_ENV | Entorno de ejecución | development |

Si falta alguna, la app no inicia y muestra un mensaje indicando cuál.

## Recurso `services`

```js
{ id, name, description, duration, price, category, available }
```

El `id` se genera automáticamente y no puede modificarse.

## Uso de ServiceManager

```js
import ServiceManager from "./managers/ServiceManager.js";
const manager = new ServiceManager();

await manager.getServices();
await manager.getServiceById(1);          // servicio o null
await manager.addService({ name, description, duration, price, category, available });
await manager.updateService(1, { price: 9000 });   // actualizado o null
await manager.deleteService(1);                    // eliminado o null
```

`addService` lanza un error si falta algún campo requerido.

## Services

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| GET | /api/services | Lista servicios. Filtros: `?category=cabello`, `?available=true` | 200, 400 |
| GET | /api/services/:sid | Servicio por id | 200, 404 |
| POST | /api/services | Crea un servicio (el id se genera solo) | 201, 400 |
| PUT | /api/services/:sid | Actualiza un servicio (no modifica el id) | 200, 404 |
| DELETE | /api/services/:sid | Elimina un servicio | 200, 404 |

### Ejemplo: crear un servicio

```json
POST /api/services
{
  "name": "Afeitado clásico",
  "description": "Afeitado con navaja y toalla caliente",
  "duration": 30,
  "price": 7000,
  "category": "barba",
  "available": true
}
```

## Estructura

- `src/app.js`: configura Express y monta el router.
- `src/server.js`: levanta el servidor en el puerto del `.env`.
- `src/routes/services.router.js`: endpoints de servicios.
- `src/managers/ServiceManager.js`: lógica y persistencia en JSON.

## Recurso `bookings`

```js
{ id, clientName, clientEmail, date, time, status, services: [{ service, quantity }] }
```

- `id` se genera automáticamente.
- `status` por defecto es `pending` (valores: `pending`, `confirmed`, `cancelled`).
- Si el mismo servicio se agrega dos veces, se incrementa `quantity`.

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| POST | /api/bookings | Crea una reserva (services vacío) | 201, 400 |
| GET | /api/bookings/:bid | Reserva por id | 200, 404 |
| POST | /api/bookings/:bid/services/:sid | Agrega un servicio a la reserva | 200, 404 |

### Ejemplo: crear una reserva

```json
POST /api/bookings
{
  "clientName": "Martín Gómez",
  "clientEmail": "martin@mail.com",
  "date": "2026-12-05",
  "time": "16:30"
}
```

## Estructura

- `src/managers/ServiceManager.js` y `BookingManager.js`: lógica y persistencia en JSON.
- `src/routes/services.router.js` y `bookings.router.js`: endpoints.
- `src/data/`: `services.json` y `bookings.json`.
- `src/utils/errors.js`: errores de validación compartidos.

## Arquitectura

El proyecto separa responsabilidades en tres capas:

```
router → controller → manager → archivo JSON
```

| Capa | Archivos | Responsabilidad |
|------|----------|-----------------|
| Router | `src/routes/` | Define los endpoints y los conecta con su controller |
| Controller | `src/controllers/` | Lee `req.params`, `req.query` y `req.body`, llama al manager y responde con `res.status().json()` |
| Manager | `src/managers/` | Lógica de datos y persistencia; no usa `req` ni `res` |

## Estructura

```
src/
  config/env.config.js
  controllers/  services.controller.js, bookings.controller.js
  managers/     ServiceManager.js, BookingManager.js
  routes/       services.router.js, bookings.router.js
  data/         services.json, bookings.json
  utils/errors.js
  app.js
  server.js
```