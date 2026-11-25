# Backend Turnos

Administrador de servicios para un sistema de turnos y reservas, hecho con Node.js (ESM).

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