// Valida req.body, req.query o req.params con un esquema de Zod.
// Si es inválido, responde 400 y el flujo se corta antes de llegar al controller y a MongoDB.
export const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join("; ");
    return res.status(400).json({ status: "error", message });
  }

  if (source === "body") req.body = result.data;
  if (source === "query") req.validatedQuery = result.data;

  next();
};