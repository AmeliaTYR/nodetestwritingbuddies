const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// load the main game page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/MultiTypingGame.html");
});

// load the style sheet
app.get("/styles.css", (req, res) => {
  res.sendFile(__dirname + "/styles.css");
});

// load the game js
app.get("/MultiTypingGame.js", (req, res) => {
  res.sendFile(__dirname + "/MultiTypingGame.js");
});



io.on("connection", async (socket) => {
  // const userId = await fetchUserId(socket);
  var userId = socket.id;

  console.log("a user connected:" + userId);

  socket.on("disconnecting", () => {
    console.log(socket.rooms); // the Set contains at least the socket ID

    // TODO: Figure out how to properly remove the room after at least one player has left
    //https://stackoverflow.com/questions/23342395/how-to-delete-a-room-in-socket-io 
    // io.sockets.clients(someRoom).forEach(function(s){
    //   s.leave(someRoom);
    // });

    
  });

  socket.on("disconnect", () => {
    console.log("user disconnected"); // generic user disconnect evnet

    if (socket.rooms.size > 0) {
      socket.rooms.forEach((room) => {
        socket.leave(room);
      }
      );
    }
  });

  socket.on("create room", (roomName) => {
    if(io.sockets.adapter.rooms[roomeName])
    {
        // Send message back to the client say room already exist
        io.to(userId).emit("room exists");
    } else {
      // Send message back to the client they have created and joined the room
      socket.join(roomName);
      io.to(userId).emit("room created");

      console.log("Client joined room", socket.rooms); // the Set contains at least the socket ID
    }

  });


  socket.on("join room", (roomName) => {
    if(io.sockets.adapter.rooms[roomeName])
    {
      socket.join(roomName);
        io.to(userId).emit("room joined");
    } else {
      io.to(userId).emit("room not found");
    }

  });


  socket.on("health update sent", (roomName, currentPercentage) => {
    socket
      .to(roomName)
      .emit("broadcast health update", currentPercentage);
  });




  ///////////////////////////////////////////////////////////////////////////////////
  // socket.on("chat message", (msg) => {
  //   console.log("message: " + msg);
  // });

  // socket.on("room1", () => {
  //   socket.join("room1");

  //   // and then later
  //   io.to(userId).emit("hi");
  // });

  // socket.on("get rooms", () => {
  //   console.log(socket.rooms); // the Set contains at least the socket ID

  //   io.to(userId).emit("return rooms", socket.rooms);

  // });

  // socket.on("room msg", (senderSocketID, roomName, msg) => {
  //   console.log(`${senderSocketID} sent a message to ${roomName}: ${msg}`);
  //   socket
  //     .to(roomName)
  //     .emit("broadcast room msg", senderSocketID, roomName, msg);
  // });

  // socket.on("private message", (anotherSocketId, msg) => {
  //   socket.to(anotherSocketId).emit("private message", socket.id, msg);
  // });
});



server.listen(process.env.PORT || 3000, () => {
  console.log("listening on *:", process.env.PORT);
  // console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
