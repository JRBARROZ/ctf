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
    socket.emit("conn", socket.id);
    if (players.length !== 4) {
      if (players.length % 2 !== 0) {
        const newPlayer = { id: socket.id, nickname: nickname, team: "blue", top: 160, left: 540, rotate: 180, direction: "left" };
        players.push(newPlayer);
        io.emit("newPlayer", newPlayer);
      } else {
        const newPlayer = { id: socket.id, nickname: nickname, team: "red", top: 160, left: 40, rotate: 0, direction: "right" };
        players.push(newPlayer);
        io.emit("newPlayer", newPlayer);
      }
      io.emit("loadMessages", chatMessages);
      io.emit("players", players);
    }
  });
  socket.on("disconnect", () => {
    
    let leftingField = "";
    players = players.filter((item) => {
      if (item.id !== socket.id) {
        return item;
      } else {
        leftingField = item.nickname;
      }
    });
    
    console.log(players.length);
    const messageObject = {
      message: `O jogador <b>${leftingField}</b> deixou o campo`,
      author: "System"
    }
    io.emit("newMessage", messageObject);
    io.emit("playerDisc", socket.id);
    io.emit("players", players);
  });
  socket.on("playerMoving", (playerMoving) => {
    io.emit("playerMoved", playerMoving);
  });
  socket.on("chatMessage", (message) => {
    const messageObject = {
      message: message,
      author: players.find((player) => player.id === socket.id)
    }
    chatMessages.push(messageObject);
    io.emit("newMessage", messageObject);
  });
  io.emit("loadMessages", chatMessages);
});

httpServer.listen(3000, () => {
  console.log("Server Running", 3000);
});
