import ServicesService from "../services/services.service.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

const servicesService = new ServicesService();

// Convierte el documento (con ObjectId) a un objeto simple para enviarlo por socket
const plain = (doc) => JSON.parse(JSON.stringify(doc));

const handleError = (res, error) => {
  if (
    error instanceof ValidationError ||
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({ status: "error", message: error.message });
  }
  if (error instanceof NotFoundError) {
    return res.status(404).json({ status: "error", message: error.message });
  }
  return res.status(500).json({ status: "error", message: error.message });
};

export const getServices = async (req, res) => {
  try {
    // Los query params ya fueron validados y convertidos por el middleware
    const result = await servicesService.getServicesPaginated(req.validatedQuery);
    res.status(200).json({ status: "success", ...result });
  } catch (error) {
    handleError(res, error);
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await servicesService.getServiceById(req.params.sid);
    res.status(200).json({ status: "success", payload: service });
  } catch (error) {
    handleError(res, error);
  }
};

export const createService = async (req, res) => {
  try {
    const created = await servicesService.createService(req.body);
    req.app.get("io")?.emit("service:created", plain(created));
    res.status(201).json({ status: "success", payload: created });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateService = async (req, res) => {
  try {
    const updated = await servicesService.updateService(req.params.sid, req.body);
    req.app.get("io")?.emit("service:updated", plain(updated));
    res.status(200).json({ status: "success", payload: updated });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteService = async (req, res) => {
  try {
    const deleted = await servicesService.deleteService(req.params.sid);
    req.app.get("io")?.emit("service:deleted", plain(deleted));
    res.status(200).json({ status: "success", payload: deleted });
  } catch (error) {
    handleError(res, error);
  }
};