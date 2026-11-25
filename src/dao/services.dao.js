import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PATH = path.join(__dirname, "..", "data", "services.json");

export default class ServicesDAO {
  constructor(filePath = DEFAULT_PATH) {
    this.filePath = filePath;
  }

  async #read() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }

  async #write(services) {
    await fs.writeFile(this.filePath, JSON.stringify(services, null, 2));
  }

  async getAll() {
    return this.#read();
  }

  async getById(id) {
    const services = await this.#read();
    return services.find((s) => s.id === Number(id)) ?? null;
  }

  async create(data) {
    const services = await this.#read();
    const nextId =
      services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;
    const newService = { id: nextId, ...data };
    services.push(newService);
    await this.#write(services);
    return newService;
  }

  async update(id, data) {
    const services = await this.#read();
    const index = services.findIndex((s) => s.id === Number(id));
    if (index === -1) return null;
    services[index] = { ...services[index], ...data, id: services[index].id };
    await this.#write(services);
    return services[index];
  }

  async delete(id) {
    const services = await this.#read();
    const index = services.findIndex((s) => s.id === Number(id));
    if (index === -1) return null;
    const [deleted] = services.splice(index, 1);
    await this.#write(services);
    return deleted;
  }
}