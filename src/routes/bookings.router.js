import { Router } from "express";
import BookingManager from "../managers/BookingManager.js";
import ServiceManager from "../managers/ServiceManager.js";
import { ValidationError } from "../utils/errors.js";

const router = Router();
const bookingManager = new BookingManager();
const serviceManager = new ServiceManager();

// POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const booking = await bookingManager.createBooking(req.body);
    res.status(201).json({ status: "success", payload: booking });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ status: "error", message: error.message });
    }
    res.status(500).json({ status: "error", message: error.message });
  }
});

// GET /api/bookings/:bid
router.get("/:bid", async (req, res) => {
  try {
    const booking = await bookingManager.getBookingById(req.params.bid);
    if (!booking) {
      return res
        .status(404)
        .json({ status: "error", message: "Reserva no encontrada" });
    }
    res.status(200).json({ status: "success", payload: booking });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// POST /api/bookings/:bid/services/:sid
router.post("/:bid/services/:sid", async (req, res) => {
  try {
    const { bid, sid } = req.params;

    const service = await serviceManager.getServiceById(sid);
    if (!service) {
      return res
        .status(404)
        .json({ status: "error", message: "Servicio no encontrado" });
    }

    const booking = await bookingManager.addServiceToBooking(bid, sid);
    if (!booking) {
      return res
        .status(404)
        .json({ status: "error", message: "Reserva no encontrada" });
    }

    res.status(200).json({ status: "success", payload: booking });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;