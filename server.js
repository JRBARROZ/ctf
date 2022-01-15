const { Server } = require("socket.io");
const Player = require("./public/js/Player.js");
const express = require("express");
const app = express();
const { createServer } = require("http");
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: "*" });

let players = [];
let playersMessage = [];
const flags = [
  {
    team: "blue",
    top: 180,
    left: 620,
  },
  {
    team: "red",
    top: 180,
    left: 40,
  },
];

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  console.log(__dirname);
  return res.sendFile(__dirname + "/index.html");
});

// let chatMessages = [];

io.on("connection", (socket) => {
  if (players.length === 4) {
    socket.emit("gameFull");
    return;
  }
  socket.emit("chatUpdate", playersMessage);
  const player = {
    id: socket.id,
    team: "",
    top: 0,
    left: 0,
    name: "",
    message: "",
    rotate: 0,
    direction: "",
    hasFlag: false,
  };

  if (players.length % 2 === 0) {
    player.team = "red";
    player.name = `player${players.length}`;
    player.top = 120 + players.length * 2 * 20;
    player.left = 80;
    player.direction = "right";
  } else {
    player.team = "blue";
    player.name = `player${players.length}`;
    player.top = 120 + (players.length - 1) * 2 * 20;
    player.left = 560;
    player.rotate = 180;
    player.direction = "left";
  }
  const newPlayer = new Player(
    socket.id,
    player.top,
    player.left,
    player.team,
    player.name,
    player.direction,
    player.rotate,
    player.message
  );
  players.push(newPlayer);

  console.log("players", players);
  socket.emit(
    "players",
    players.map((pl) => pl.toString())
  );
  socket.emit("current", newPlayer.toString());
  io.emit("newPlayerIn", newPlayer.toString());

  socket.on("disconnect", () => {
    let leavingField = players.find((player) => player.id === socket.id);
    players = players.filter((player) => player.id !== socket.id);
    console.log("leaving:", leavingField.id);
    io.emit("disconnected", leavingField.id);
    io.emit(
      "players",
      players.map((pl) => pl.toString())
    );
  });

  socket.on("move", (id, direction) => {
    const player = players.find((plr) => plr.id === id);
    player.move(direction);
    io.emit("updatePosition", player.toString());
  });

  socket.on("playerMessage", (player) => {
    playersMessage.push({
      pid: player.id,
      message: player.message,
    });
    socket.emit("chatUpdate", playersMessage);
  });
});

httpServer.listen(3000, () => {
  console.log("Server Running", 3000);
});
