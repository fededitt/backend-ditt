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

## Arquitectura en capas

```
router → controller → service → repository → DAO → archivo JSON
```

| Capa | Carpeta | Responsabilidad |
|------|---------|-----------------|
| Router | `src/routes/` | Define endpoints y los conecta al controller |
| Controller | `src/controllers/` | Lee `req`, llama al service y responde con `res` |
| Service | `src/services/` | Reglas de negocio (validaciones, filtros, `quantity`); no conoce `req`/`res` |
| Repository | `src/repositories/` | Métodos de acceso a datos, sin reglas de negocio |
| DAO | `src/dao/` | Lee y escribe directamente en el archivo JSON |

### Funciones por recurso

- **services**: controller y service → `getServices`, `getServiceById`, `createService`, `updateService`, `deleteService`; repository y DAO → `getAll`, `getById`, `create`, `update`, `delete`.
- **bookings**: controller y service → `createBooking`, `getBookingById`, `addServiceToBooking`; repository y DAO → `create`, `getById`, `update`.

### Regla de negocio clave

Si el mismo servicio se agrega dos veces a una reserva, se incrementa `quantity`. Esta lógica está en `bookings.service.js`, no en el DAO.

### Manejo de errores

Los services lanzan `ValidationError` (400) o `NotFoundError` (404) y el controller los traduce a códigos HTTP.

## Estructura

```
src/
  config/env.config.js
  controllers/, services/, repositories/, dao/, routes/, data/, utils/ y config/.
  managers/     ServiceManager.js, BookingManager.js
  routes/       services.router.js, bookings.router.js
  data/         services.json, bookings.json
  utils/errors.js
  app.js
  server.js
```

## Base de datos

La API usa **MongoDB Atlas** con **Mongoose**. Configurá la URI en `.env`:

```
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/barberia
```

### Variables de entorno

| Variable | Descripción |
|----------|-------------|
| PORT | Puerto del servidor |
| NODE_ENV | Entorno de ejecución |
| MONGO_URI | URI de conexión a MongoDB Atlas |

### Modelos (`src/models/`)

- `service.model.js`: servicios de la barbería.
- `booking.model.js`: reservas; los servicios se guardan como `{ service: ObjectId, quantity }`.
- `message.model.js`: mensajes.

### Datos iniciales

```bash
npm run seed
```

Carga los servicios de `src/data/services.json` en la base.

### Nota sobre ids

Los identificadores son `ObjectId` de MongoDB y se devuelven como `_id`.

## Vistas y tiempo real

### Vistas (Handlebars)

| Ruta | Descripción |
|------|-------------|
| GET /views/services | Listado de servicios desde MongoDB, con alta, cambio de disponibilidad y baja |
| GET /views/bookings | Listado de reservas con sus servicios |

Las vistas no tienen datos hardcodeados: el controller de vistas usa las mismas capas que la API (service → repository → DAO → model).

### Socket.io

Cuando un controller de la API completa una acción, emite un evento y los navegadores conectados actualizan la vista sin recargar.

| Evento | Se emite al | Efecto en la vista |
|--------|-------------|--------------------|
| `service:created` | crear un servicio | agrega la tarjeta |
| `service:updated` | actualizar un servicio | actualiza la tarjeta |
| `service:deleted` | eliminar un servicio | quita la tarjeta |
| `booking:created` | crear una reserva | agrega una fila en la tabla |

El cliente escucha los eventos en `src/public/js/socket.js`.

### Estructura nueva

```
src/
  controllers/views.controller.js
  routes/views.router.js
  views/layouts/main.handlebars
  views/services.handlebars
  views/bookings.handlebars
  public/css/styles.css
  public/js/socket.js
```

