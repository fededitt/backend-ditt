import { Router } from "express";
import ServiceManager from "../managers/ServiceManager.js";
import { ValidationError } from "../utils/errors.js";

const router = Router();
const manager = new ServiceManager();

// GET /api/services?category=cabello&available=true
router.get("/", async (req, res) => {
  try {
    const { category, available } = req.query;
    let services = await manager.getServices();

    if (category) {
      services = services.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (available !== undefined) {
      if (available !== "true" && available !== "false") {
        return res
          .status(400)
          .json({ status: "error", message: "available debe ser true o false" });
      }
      services = services.filter((s) => s.available === (available === "true"));
    }

    res.status(200).json({ status: "success", payload: services });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// GET /api/services/:sid
router.get("/:sid", async (req, res) => {
  try {
    const service = await manager.getServiceById(req.params.sid);
    if (!service) {
      return res
        .status(404)
        .json({ status: "error", message: "Servicio no encontrado" });
    }
    res.status(200).json({ status: "success", payload: service });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// POST /api/services
router.post("/", async (req, res) => {
  try {
    const created = await manager.addService(req.body);
    res.status(201).json({ status: "success", payload: created });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ status: "error", message: error.message });
    }
    res.status(500).json({ status: "error", message: error.message });
  }
});

// PUT /api/services/:sid
router.put("/:sid", async (req, res) => {
  try {
    const updated = await manager.updateService(req.params.sid, req.body);
    if (!updated) {
      return res
        .status(404)
        .json({ status: "error", message: "Servicio no encontrado" });
    }
    res.status(200).json({ status: "success", payload: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// DELETE /api/services/:sid
router.delete("/:sid", async (req, res) => {
  try {
    const deleted = await manager.deleteService(req.params.sid);
    if (!deleted) {
      return res
        .status(404)
        .json({ status: "error", message: "Servicio no encontrado" });
    }
    res.status(200).json({ status: "success", payload: deleted });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;