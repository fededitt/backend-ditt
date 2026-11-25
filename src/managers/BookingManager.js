import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ValidationError } from "../utils/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PATH = path.join(__dirname, "..", "data", "bookings.json");

const REQUIRED_FIELDS = ["clientName", "clientEmail", "date", "time"];
const VALID_STATUS = ["pending", "confirmed", "cancelled"];

export default class BookingManager {
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

  async #writeFile(bookings) {
    await fs.writeFile(this.filePath, JSON.stringify(bookings, null, 2));
  }

  async createBooking(bookingData) {
    const missing = REQUIRED_FIELDS.filter(
      (field) =>
        bookingData?.[field] === undefined ||
        bookingData[field] === null ||
        bookingData[field] === ""
    );

    if (missing.length > 0) {
      throw new ValidationError(
        `Reserva incompleta. Faltan campos: ${missing.join(", ")}`
      );
    }

    const status = bookingData.status ?? "pending";
    if (!VALID_STATUS.includes(status)) {
      throw new ValidationError(
        `status inválido. Valores permitidos: ${VALID_STATUS.join(", ")}`
      );
    }

    const bookings = await this.#readFile();
    const nextId =
      bookings.length > 0 ? Math.max(...bookings.map((b) => b.id)) + 1 : 1;

    // El id se genera acá y la reserva siempre nace con services vacío.
    const newBooking = {
      id: nextId,
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      date: bookingData.date,
      time: bookingData.time,
      status,
      services: [],
    };

    bookings.push(newBooking);
    await this.#writeFile(bookings);
    return newBooking;
  }

  async getBookingById(id) {
    const bookings = await this.#readFile();
    return bookings.find((b) => b.id === Number(id)) ?? null;
  }

  // Devuelve null si la reserva no existe.
  async addServiceToBooking(bookingId, serviceId) {
    const bookings = await this.#readFile();
    const booking = bookings.find((b) => b.id === Number(bookingId));
    if (!booking) return null;

    const sid = Number(serviceId);
    const item = booking.services.find((s) => s.service === sid);

    if (item) {
      item.quantity += 1;
    } else {
      booking.services.push({ service: sid, quantity: 1 });
    }

    await this.#writeFile(bookings);
    return booking;
  }
}