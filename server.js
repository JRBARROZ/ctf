const { Server } = require("socket.io");
const express = require('express');
const app = express();
const { createServer } = require("http");
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: "*" });

let players = [];

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
  console.log(__dirname);
  return res.sendFile(__dirname + "/index.html");
});
let chatMessages = [];
io.on("connection", (socket) => {
  socket.on("nickname", (nickname) => {
    console.log(nickname);
    socket.emit("conn", socket.id);
    if (players.length !== 4) {
      if (players.length % 2 !== 0) {
        const newPlayer = { player: socket.id, nickname: nickname, team: "blue", top: 160, left: 540 };
        players.push(newPlayer);
        io.emit("newPlayer", newPlayer);
      } else {
        const newPlayer = { player: socket.id, nickname: nickname, team: "blue", top: 160, left: 40 };
        players.push(newPlayer);
        io.emit("newPlayer", newPlayer);
      }
      io.emit("players", players);
    }
  });
  socket.on("disconnect", () => {
    players = players.filter((item) => {
      if (item.player !== socket.id) {
        return item;
      }
    });
    console.log(players.length);
    io.emit("playerDisc", socket.id);
  });
  socket.on("playerMoving", (playerMoving) => {
    console.log(playerMoving);
    io.emit("playerMoved", playerMoving);
  });
  socket.on("chatMessage", (message) => {
    const messageObject = {
      message: message,
      author: players.find((player) => player.player === socket.id)
    }
    chatMessages.push(messageObject);
    io.emit("newMessage", messageObject)
  });
  io.emit("loadMessages", chatMessages)
});

httpServer.listen(3000, () => {
  console.log("Server Running", 3000);
});
