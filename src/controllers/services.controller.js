import ServiceManager from "../managers/ServiceManager.js";
import { ValidationError } from "../utils/errors.js";

const serviceManager = new ServiceManager();

export const getServices = async (req, res) => {
  try {
    const { category, available } = req.query;

    if (available !== undefined && available !== "true" && available !== "false") {
      return res
        .status(400)
        .json({ status: "error", message: "available debe ser true o false" });
    }

    const services = await serviceManager.getServices({
      category,
      available: available === undefined ? undefined : available === "true",
    });

    res.status(200).json({ status: "success", payload: services });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await serviceManager.getServiceById(req.params.sid);
    if (!service) {
      return res
        .status(404)
        .json({ status: "error", message: "Servicio no encontrado" });
    }
    res.status(200).json({ status: "success", payload: service });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const created = await serviceManager.addService(req.body);
    res.status(201).json({ status: "success", payload: created });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ status: "error", message: error.message });
    }
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const updated = await serviceManager.updateService(req.params.sid, req.body);
    if (!updated) {
      return res
        .status(404)
        .json({ status: "error", message: "Servicio no encontrado" });
    }
    res.status(200).json({ status: "success", payload: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const deleted = await serviceManager.deleteService(req.params.sid);
    if (!deleted) {
      return res
        .status(404)
        .json({ status: "error", message: "Servicio no encontrado" });
    }
    res.status(200).json({ status: "success", payload: deleted });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};