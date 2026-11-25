import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ValidationError } from "../utils/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PATH = path.join(__dirname, "..", "data", "services.json");

const REQUIRED_FIELDS = [
  "name",
  "description",
  "duration",
  "price",
  "category",
  "available",
];



export default class ServiceManager {
  constructor(filePath = DEFAULT_PATH) {
    this.filePath = filePath;
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }

  async #writeFile(services) {
    await fs.writeFile(this.filePath, JSON.stringify(services, null, 2));
  }

  async getServices() {
    return this.#readFile();
  }

  async getServiceById(id) {
    const services = await this.#readFile();
    return services.find((s) => s.id === Number(id)) ?? null;
  }

  async addService(serviceData) {
    const missing = REQUIRED_FIELDS.filter(
      (field) =>
        serviceData?.[field] === undefined ||
        serviceData[field] === null ||
        serviceData[field] === ""
    );

    if (missing.length > 0) {
      throw new ValidationError(
        `Servicio incompleto. Faltan campos: ${missing.join(", ")}`
      );
    }

    const services = await this.#readFile();
    const nextId =
      services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;

    // El id siempre se genera acá; se ignora cualquier id recibido.
    const { id, ...data } = serviceData;
    const newService = { id: nextId };
    for (const field of REQUIRED_FIELDS) newService[field] = data[field];

    services.push(newService);
    await this.#writeFile(services);
    return newService;
  }

  async updateService(id, updatedData) {
    const services = await this.#readFile();
    const index = services.findIndex((s) => s.id === Number(id));
    if (index === -1) return null;

    // Se descarta el id para que no pueda modificarse.
    const { id: _ignored, ...changes } = updatedData;
    services[index] = { ...services[index], ...changes, id: services[index].id };

    await this.#writeFile(services);
    return services[index];
  }

  async deleteService(id) {
    const services = await this.#readFile();
    const index = services.findIndex((s) => s.id === Number(id));
    if (index === -1) return null;

    const [deleted] = services.splice(index, 1);
    await this.#writeFile(services);
    return deleted;
  }
}