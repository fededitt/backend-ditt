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

  async getBookings() {
    return this.repository.getAll();
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

  // Consulta: devuelve la reserva con los datos completos de cada servicio (populate)
  async getBookingById(id) {
    const booking = await this.repository.getByIdPopulated(id);
    if (!booking) throw new NotFoundError("Reserva no encontrada");
    return booking;
  }

  async addServiceToBooking(bookingId, serviceId) {
    // Valida que el servicio exista (lanza NotFoundError si no)
    const service = await this.servicesService.getServiceById(serviceId);

    // Sin populate: en la reserva se guardan solo referencias (ObjectId)
    const booking = await this.repository.getById(bookingId);
    if (!booking) throw new NotFoundError("Reserva no encontrada");

    const services = booking.services.map((item) => ({ ...item }));
    const item = services.find(
      (s) => String(s.service) === String(service._id)
    );

    // Regla de negocio: si el servicio ya está, se incrementa quantity
    if (item) {
      item.quantity += 1;
    } else {
      services.push({ service: service._id, quantity: 1 });
    }

    return this.repository.update(booking._id, { services });
  }
}