import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PATH = path.join(__dirname, "..", "data", "bookings.json");

export default class BookingsDAO {
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

  async #write(bookings) {
    await fs.writeFile(this.filePath, JSON.stringify(bookings, null, 2));
  }

  async create(data) {
    const bookings = await this.#read();
    const nextId =
      bookings.length > 0 ? Math.max(...bookings.map((b) => b.id)) + 1 : 1;
    const newBooking = { id: nextId, ...data };
    bookings.push(newBooking);
    await this.#write(bookings);
    return newBooking;
  }

  async getById(id) {
    const bookings = await this.#read();
    return bookings.find((b) => b.id === Number(id)) ?? null;
  }

  async update(id, data) {
    const bookings = await this.#read();
    const index = bookings.findIndex((b) => b.id === Number(id));
    if (index === -1) return null;
    bookings[index] = { ...bookings[index], ...data, id: bookings[index].id };
    await this.#write(bookings);
    return bookings[index];
  }
}