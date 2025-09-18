import { Server } from "socket.io";
import rideSocketHandler from "./rideSocket.js";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // set frontend domain in prod
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // attach ride socket handlers
    rideSocketHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
}

// Export io instance so you can emit from controllers if needed
export function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}