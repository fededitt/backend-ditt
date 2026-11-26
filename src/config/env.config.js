import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["PORT", "NODE_ENV", "MONGO_URI"];

const missing = requiredVars.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(
    `Faltan variables de entorno requeridas: ${missing.join(", ")}.\n` +
      "Copiá .env.example a .env y completá los valores."
  );
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV,
  mongoUri: process.env.MONGO_URI,
};