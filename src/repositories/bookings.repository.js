import BookingsDAO from "../dao/bookings.dao.js";

export default class BookingsRepository {
  constructor(dao = new BookingsDAO()) {
    this.dao = dao;
  }

  getAll() {
    return this.dao.getAll();
  }

  create(data) {
    return this.dao.create(data);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  update(id, data) {
    return this.dao.update(id, data);
  }
}