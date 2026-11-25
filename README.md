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

## Endpoints

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