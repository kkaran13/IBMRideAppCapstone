export default function rideSocketHandler(io, socket) {
  // Join room
  socket.on("joinRideRoom", (rideId) => {
    socket.join(`ride_${rideId}`);
    console.log(`Socket ${socket.id} joined ride_${rideId}`);
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
}