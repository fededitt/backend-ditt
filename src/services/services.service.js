import ServicesRepository from "../repositories/services.repository.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

const FIELDS = [
  "name",
  "description",
  "duration",
  "price",
  "category",
  "available",
];

// Se queda solo con los campos permitidos: ignora el id y cualquier extra
const pickFields = (data = {}) =>
  Object.fromEntries(
    FIELDS.filter((f) => data[f] !== undefined).map((f) => [f, data[f]])
  );

export default class ServicesService {
  constructor(repository = new ServicesRepository()) {
    this.repository = repository;
  }

  // Lista completa (la usan las vistas)
  async getServices({ category, available } = {}) {
    let services = await this.repository.getAll();

    if (category !== undefined) {
      services = services.filter(
        (s) => s.category.toLowerCase() === String(category).toLowerCase()
      );
    }

    if (available !== undefined) {
      services = services.filter((s) => s.available === available);
    }

    return services;
  }

  // Lista con filtros, orden y paginación (la usa GET /api/services)
  async getServicesPaginated({ category, available, page, limit, sortBy, order }) {
    const filter = {};
    if (category !== undefined) filter.category = category.toLowerCase();
    if (available !== undefined) filter.available = available;

    const { docs, total } = await this.repository.getPaginated(filter, {
      page,
      limit,
      sortBy,
      order,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      payload: docs,
      total,
      page,
      limit,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }

  async getServiceById(id) {
    const service = await this.repository.getById(id);
    if (!service) throw new NotFoundError("Servicio no encontrado");
    return service;
  }

  async createService(data) {
    const clean = pickFields(data);
    const missing = FIELDS.filter(
      (f) => clean[f] === undefined || clean[f] === null || clean[f] === ""
    );

    if (missing.length > 0) {
      throw new ValidationError(
        `Servicio incompleto. Faltan campos: ${missing.join(", ")}`
      );
    }

    return this.repository.create(clean);
  }

  async updateService(id, data) {
    // pickFields descarta el id: no se puede modificar
    const updated = await this.repository.update(id, pickFields(data));
    if (!updated) throw new NotFoundError("Servicio no encontrado");
    return updated;
  }

  async deleteService(id) {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundError("Servicio no encontrado");
    return deleted;
  }
}