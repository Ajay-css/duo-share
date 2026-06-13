const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("create-room", (roomCode) => {
    socket.join(roomCode);

    console.log(`Room Created: ${roomCode}`);

    socket.emit("room-created", roomCode);
  });

  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);

    console.log(`Joined Room: ${roomCode}`);

    socket.to(roomCode).emit("receiver-joined");

    socket.emit("room-joined", roomCode);
  });

  socket.on("offer", ({ roomCode, offer }) => {
    socket.to(roomCode).emit("offer", offer);
  });

  socket.on("answer", ({ roomCode, answer }) => {
    socket.to(roomCode).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomCode, candidate }) => {
    socket.to(roomCode).emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server Running On Port 5000");
});