import { z } from "zod";

const text = (field) =>
  z
    .string({
      required_error: `${field} es requerido`,
      invalid_type_error: `${field} debe ser texto`,
    })
    .trim()
    .min(1, `${field} no puede estar vacío`);

const enumWithMessage = (values, message) =>
  z.enum(values, { errorMap: () => ({ message }) });

export const createServiceSchema = z.object({
  name: text("name"),
  description: text("description"),
  duration: z
    .number({
      required_error: "duration es requerido",
      invalid_type_error: "duration debe ser un número",
    })
    .int("duration debe ser un número entero")
    .positive("duration debe ser mayor a 0"),
  price: z
    .number({
      required_error: "price es requerido",
      invalid_type_error: "price debe ser un número",
    })
    .nonnegative("price no puede ser negativo"),
  category: text("category"),
  available: z.boolean({
    required_error: "available es requerido",
    invalid_type_error: "available debe ser true o false",
  }),
});

// Al actualizar, todos los campos son opcionales, pero hay que mandar al menos uno.
// Cualquier campo que no esté en el esquema (por ejemplo id) se descarta.
export const updateServiceSchema = createServiceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar",
  });

export const getServicesQuerySchema = z.object({
  category: z.string().trim().min(1, "category no puede estar vacío").optional(),
  available: enumWithMessage(["true", "false"], "available debe ser true o false")
    .transform((value) => value === "true")
    .optional(),
  page: z.coerce
    .number({ invalid_type_error: "page debe ser un número" })
    .int("page debe ser un número entero")
    .min(1, "page debe ser mayor o igual a 1")
    .default(1),
  limit: z.coerce
    .number({ invalid_type_error: "limit debe ser un número" })
    .int("limit debe ser un número entero")
    .min(1, "limit debe ser mayor o igual a 1")
    .max(50, "limit no puede ser mayor a 50")
    .default(10),
  sortBy: enumWithMessage(
    ["name", "price", "duration", "category", "createdAt"],
    "sortBy debe ser name, price, duration, category o createdAt"
  ).default("createdAt"),
  order: enumWithMessage(["asc", "desc"], "order debe ser asc o desc").default("asc"),
});