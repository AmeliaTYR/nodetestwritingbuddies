const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", async (socket) => {
  // const userId = await fetchUserId(socket);
  var userId = socket.id;

  console.log("a user connected:" + userId);

  socket.on("disconnecting", () => {
    console.log(socket.rooms); // the Set contains at least the socket ID
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
  });

  socket.on("room1", () => {
    socket.join("room1");

    // and then later
    io.to(userId).emit("hi");
  });

  socket.on("get rooms", () => {
    console.log(socket.rooms); // the Set contains at least the socket ID

    io.to(userId).emit("return rooms", socket.rooms);

  });

  socket.on("room msg", (senderSocketID, roomName, msg) => {
    console.log(`${senderSocketID} sent a message to ${roomName}: ${msg}`);
    socket
      .to(roomName)
      .emit("broadcast room msg", senderSocketID, roomName, msg);
  });

  socket.on("private message", (anotherSocketId, msg) => {
    socket.to(anotherSocketId).emit("private message", socket.id, msg);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
