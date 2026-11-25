import { config } from "./config/env.config.js";
import ServiceManager from "./managers/ServiceManager.js";

const manager = new ServiceManager();

console.log(`Entorno: ${config.nodeEnv} | Puerto configurado: ${config.port}\n`);

console.log("Todos:", await manager.getServices());
console.log("Por id (1):", await manager.getServiceById(1));
console.log("Por id (999):", await manager.getServiceById(999));

try {
  await manager.addService({ name: "Incompleto" });
} catch (error) {
  console.log("Rechazado:", error.message);
}

const created = await manager.addService({
  name: "Masaje",
  description: "Masaje descontracturante",
  duration: 60,
  price: 20000,
  category: "salud",
  available: true,
});
console.log("Creado:", created);

console.log("Actualizado:", await manager.updateService(created.id, { price: 22000, id: 999 }));
console.log("Eliminado:", await manager.deleteService(created.id));
console.log("Eliminar inexistente:", await manager.deleteService(999));