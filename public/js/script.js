const socket = io();
const camp = document.querySelector("#camp");
const campDimensions = camp.getBoundingClientRect();
const playersPodium = document.querySelector("#players");
const bluePlayerSvg = document.querySelector(".blue-player");
const redPlayerSvg = document.querySelector(".red-player");
const activeCounter = document.querySelector("#actives");
const buttonSend = document.querySelector("#send-message");
const head = document.querySelector("#Head");

// const nickname = prompt("Digite o nome do jogador");

// buttonSend.addEventListener("click", handleClick);
let players = [];
let currentPlayer;

function playerExists(playerId) {
  const player = players.find((plr) => plr.id === playerId);
  if (player) return true;
  return false;
}

function animateMovement(player) {
  player = JSON.parse(player);
  const playerEl = document.querySelector(`#${player.id}`);
  playerEl.animate([{ transform: `rotate(${player.rotate}deg)` }], {
    duration: 100,
    fill: "forwards",
  });
}

function addPlayer(player) {
  player = JSON.parse(player);
  
  if (playerExists(player.id)) return;
  players.push(player);
  const plr = player.team === 'red' ? redPlayerSvg.cloneNode(true) : bluePlayerSvg.cloneNode(true);
  plr.style.display = 'block';
  plr.id = player.id;
  plr.style.top = `${player.top}px`;
  plr.style.left = `${player.left}px`;
  
  camp.appendChild(plr);

  animateMovement(player);
}

function updatePosition(player) {
  const current = document.querySelector(`#${player.id}`);
	current.style.top = `${player.top}px`;
	current.style.left = `${player.left}px`;
}

const acceptedMoves = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

document.addEventListener("keydown", handleMovement);

// socket.emit("newPlayer", currentPlayer);

socket.on("gameFull", () => {
  alert("Game is full");
});

socket.on('disconnected', (playerId) => {
  players = players.filter((player) => player.id !== playerId);
  const playerLeft = document.querySelector(`#${playerId}`);
  camp.removeChild(playerLeft);
});

socket.on("current", (player) => {
  addPlayer(player);
  currentPlayer = players.find((plr) => plr.id === player.id);
});

socket.on("newPlayerIn", (player) => {
  addPlayer(player);
});

socket.on("players", (allPlayers) => {
  console.log(players);
  allPlayers.map(addPlayer);
});

socket.on("move", (id, move) => {
  const player = players.find((p) => p.id === id);
  console.log(id);
  player.update(move);
})

function handleMovement(e) {
  if (!acceptedMoves.includes(e.key)) return;
  socket.emit("move", currentPlayer.id, e.key);
}