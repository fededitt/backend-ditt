import http from "node:http";
import { Server } from "socket.io";
import { config } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import app from "./app.js";

await connectDB();

const httpServer = http.createServer(app);
const io = new Server(httpServer);

// Los controllers acceden a io con req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
});

httpServer.listen(config.port, () => {
  console.log(`Servidor escuchando en http://localhost:${config.port} (${config.nodeEnv})`);
});