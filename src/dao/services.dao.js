import mongoose from "mongoose";
import ServiceModel from "../models/service.model.js";

const isValidId = (id) => mongoose.isObjectIdOrHexString(id);

export default class ServicesDAO {
  async getAll() {
    return ServiceModel.find().lean();
  }

  async getPaginated(filter, { page, limit, sortBy, order }) {
    const direction = order === "desc" ? -1 : 1;

    const [docs, total] = await Promise.all([
      ServiceModel.find(filter)
        .sort({ [sortBy]: direction, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ServiceModel.countDocuments(filter),
    ]);

    return { docs, total };
  }

  async getById(id) {
    if (!isValidId(id)) return null;
    return ServiceModel.findById(id).lean();
  }

  async create(data) {
    const created = await ServiceModel.create(data);
    return created.toObject();
  }

  async update(id, data) {
    if (!isValidId(id)) return null;
    return ServiceModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async delete(id) {
    if (!isValidId(id)) return null;
    return ServiceModel.findByIdAndDelete(id).lean();
  }
}