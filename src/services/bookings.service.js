import BookingsRepository from "../repositories/bookings.repository.js";
import ServicesService from "./services.service.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

const REQUIRED_FIELDS = ["clientName", "clientEmail", "date", "time"];
const VALID_STATUS = ["pending", "confirmed", "cancelled"];

export default class BookingsService {
  constructor(
    repository = new BookingsRepository(),
    servicesService = new ServicesService()
  ) {
    this.repository = repository;
    this.servicesService = servicesService;
  }

  async createBooking(data = {}) {
    const missing = REQUIRED_FIELDS.filter(
      (f) => data[f] === undefined || data[f] === null || data[f] === ""
    );

    if (missing.length > 0) {
      throw new ValidationError(
        `Reserva incompleta. Faltan campos: ${missing.join(", ")}`
      );
    }

    const status = data.status ?? "pending";
    if (!VALID_STATUS.includes(status)) {
      throw new ValidationError(
        `status inválido. Valores permitidos: ${VALID_STATUS.join(", ")}`
      );
    }

    return this.repository.create({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      date: data.date,
      time: data.time,
      status,
      services: [],
    });
  }

  async getBookingById(id) {
    const booking = await this.repository.getById(id);
    if (!booking) throw new NotFoundError("Reserva no encontrada");
    return booking;
  }

  async addServiceToBooking(bookingId, serviceId) {
    // Valida que el servicio exista (lanza NotFoundError si no)
    await this.servicesService.getServiceById(serviceId);
    const booking = await this.getBookingById(bookingId);

    const sid = Number(serviceId);
    const services = booking.services.map((item) => ({ ...item }));
    const item = services.find((s) => s.service === sid);

    // Regla de negocio: si el servicio ya está, se incrementa quantity
    if (item) {
      item.quantity += 1;
    } else {
      services.push({ service: sid, quantity: 1 });
    }

    return this.repository.update(booking.id, { services });
  }
}