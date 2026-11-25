import BookingsService from "../services/bookings.service.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

const bookingsService = new BookingsService();

const handleError = (res, error) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({ status: "error", message: error.message });
  }
  if (error instanceof NotFoundError) {
    return res.status(404).json({ status: "error", message: error.message });
  }
  return res.status(500).json({ status: "error", message: error.message });
};

export const createBooking = async (req, res) => {
  try {
    const booking = await bookingsService.createBooking(req.body);
    res.status(201).json({ status: "success", payload: booking });
  } catch (error) {
    handleError(res, error);
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingsService.getBookingById(req.params.bid);
    res.status(200).json({ status: "success", payload: booking });
  } catch (error) {
    handleError(res, error);
  }
};

export const addServiceToBooking = async (req, res) => {
  try {
    const { bid, sid } = req.params;
    const booking = await bookingsService.addServiceToBooking(bid, sid);
    res.status(200).json({ status: "success", payload: booking });
  } catch (error) {
    handleError(res, error);
  }
};