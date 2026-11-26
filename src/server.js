import { config } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import app from "./app.js";

await connectDB();

app.listen(config.port, () => {
  console.log(`Servidor escuchando en http://localhost:${config.port} (${config.nodeEnv})`);
});