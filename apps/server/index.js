import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import { Server } from "socket.io";
import socket from "./socket.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);

const server = http.createServer(app).listen(5000, () => {
  console.log(`Server is running on port: 5000`);
});

// Socket
const io = new Server(server, {
  cors: {
    origin: "https://localhost:5000",
    // origin: ["https://localhost:5000", "https://admin.socket.io"],
    // credentials: true,
  },
});
socket(io);
