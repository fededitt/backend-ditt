import ServicesService from "../services/services.service.js";
import BookingsService from "../services/bookings.service.js";

const servicesService = new ServicesService();
const bookingsService = new BookingsService();

export const renderServices = async (req, res) => {
  try {
    const services = await servicesService.getServices();

    res.render("services", {
      title: "Servicios",
      services: services.map((s) => ({ ...s, _id: String(s._id) })),
    });
  } catch (error) {
    res.status(500).send("Error al cargar los servicios");
  }
};

export const renderBookings = async (req, res) => {
  try {
    const bookings = await bookingsService.getBookings();

    res.render("bookings", {
      title: "Reservas",
      bookings: bookings.map((b) => ({
        _id: String(b._id),
        clientName: b.clientName,
        clientEmail: b.clientEmail,
        date: b.date,
        time: b.time,
        status: b.status,
        services: b.services.map((item) => ({
          name: item.service?.name ?? "Servicio eliminado",
          quantity: item.quantity,
        })),
      })),
    });
  } catch (error) {
    res.status(500).send("Error al cargar las reservas");
  }
};