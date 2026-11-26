import { z } from "zod";

const text = (field) =>
  z
    .string({
      required_error: `${field} es requerido`,
      invalid_type_error: `${field} debe ser texto`,
    })
    .trim()
    .min(1, `${field} no puede estar vacío`);

const objectId = (field) =>
  z
    .string({ required_error: `${field} es requerido` })
    .regex(/^[a-f\d]{24}$/i, `${field} no es un id válido`);

export const createBookingSchema = z.object({
  clientName: text("clientName"),
  clientEmail: z
    .string({
      required_error: "clientEmail es requerido",
      invalid_type_error: "clientEmail debe ser texto",
    })
    .trim()
    .email("clientEmail no es un email válido"),
  date: z
    .string({
      required_error: "date es requerido",
      invalid_type_error: "date debe ser texto",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date debe tener formato YYYY-MM-DD"),
  time: z
    .string({
      required_error: "time es requerido",
      invalid_type_error: "time debe ser texto",
    })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "time debe tener formato HH:MM"),
  status: z
    .enum(["pending", "confirmed", "cancelled"], {
      errorMap: () => ({
        message: "status debe ser pending, confirmed o cancelled",
      }),
    })
    .optional(),
});

export const addServiceToBookingParamsSchema = z.object({
  bid: objectId("bid"),
  sid: objectId("sid"),
});