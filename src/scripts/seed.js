import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDB } from "../config/db.config.js";
import ServiceModel from "../models/service.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "..", "data", "services.json");

const raw = JSON.parse(await fs.readFile(file, "utf-8"));
const services = raw.map(({ id, ...rest }) => rest);

await connectDB();
await ServiceModel.deleteMany({});
await ServiceModel.insertMany(services);

console.log(`${services.length} servicios cargados`);
await mongoose.disconnect();