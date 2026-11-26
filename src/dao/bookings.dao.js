import mongoose from "mongoose";
import BookingModel from "../models/booking.model.js";

const isValidId = (id) => mongoose.isObjectIdOrHexString(id);

export default class BookingsDAO {
  async getAll() {
    return BookingModel.find()
      .populate("services.service")
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(data) {
    const created = await BookingModel.create(data);
    return created.toObject();
  }

  // Sin populate: para uso interno (por ejemplo, al agregar un servicio)
  async getById(id) {
    if (!isValidId(id)) return null;
    return BookingModel.findById(id).lean();
  }

  // Con populate: devuelve los datos completos de cada servicio (solo para consultar)
  async getByIdPopulated(id) {
    if (!isValidId(id)) return null;
    return BookingModel.findById(id).populate("services.service").lean();
  }

  async update(id, data) {
    if (!isValidId(id)) return null;
    return BookingModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
  }
}