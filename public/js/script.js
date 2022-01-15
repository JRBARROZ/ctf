const socket = io();
const camp = document.querySelector("#camp");
const campDimensions = camp.getBoundingClientRect();
const playersPodium = document.querySelector("#players");
const bluePlayerSvg = document.querySelector(".blue-player");
const redPlayerSvg = document.querySelector(".red-player");
const bluePlayerWithFlagSvg = document.querySelector(".blue-player-with-flag");
const redPlayerWithFlagSvg = document.querySelector(".red-player-with-flag");
const redFlag = document.querySelector(".red_flag");
const blueFlag = document.querySelector(".blue_flag");
const activeCounter = document.querySelector("#actives");
const buttonSend = document.querySelector("#send-message");
const head = document.querySelector("#Head");
const nickname = prompt("Digite o nome do Jogador : ");

if (nickname) {
  
  socket.emit("nickname", nickname);
  // buttonSend.addEventListener("click", handleClick);
  let players = [];
  let currentPlayer;
  
  function updatePosition(player) {
    const current = document.querySelector(`#p${player.id}`);

    if (player.hasFlag) {
      camp.removeChild(current);
      if (player.team === "red") {
        blueFlag.style.display = "none";
      } else {
        redFlag.style.display = "none";
      }
      const plr = player.team === "red"
        ? redPlayerWithFlagSvg.cloneNode(true)
        : bluePlayerWithFlagSvg.cloneNode(true);
      plr.style.display = "block";
      plr.id = `p${player.id}`;
      plr.style.top = `${player.top}px`;
      plr.style.left = `${player.left}px`;

      camp.appendChild(plr);
      // animateMovement(player);
      // return;
    }

    current.style.top = `${player.top}px`;
    current.style.left = `${player.left}px`;
    animateMovement(player);

  }

  function playerExists(playerId) {
    const player = players.find((plr) => plr.id === playerId);
    if (player) return true;
    return false;
  }

  function animateMovement(player) {
    const playerEl = document.querySelector(`#p${player.id}`);
    console.log(playerEl);
    playerEl.animate([{ transform: `rotate(${player.rotate}deg)` }], {
      fill: "forwards",
    });
  }

  function addPlayer(player) {
    player = JSON.parse(player);

    if (playerExists(player.id)) return;
    players.push(player);
    const plr =
      player.team === "red"
        ? redPlayerSvg.cloneNode(true)
        : bluePlayerSvg.cloneNode(true);
    plr.style.display = "block";
    plr.id = `p${player.id}`;
    plr.style.top = `${player.top}px`;
    plr.style.left = `${player.left}px`;

    camp.appendChild(plr);

    animateMovement(player);
  }

  const acceptedMoves = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

  document.addEventListener("keydown", handleMovement);

  // socket.emit("newPlayer", currentPlayer);

  socket.on("gameFull", () => {
    alert("Game is full");
  });

  socket.on("disconnected", (playerId) => {
    players = players.filter((player) => player.id !== playerId);
    const playerLeft = document.querySelector(`#p${playerId}`);
    camp.removeChild(playerLeft);
  });

  socket.on("current", (player) => {
    const playerObject = JSON.parse(player);
    console.log(playerObject)
    currentPlayer = players.find((plr) => plr.id === playerObject.id);
  });

  socket.on("newPlayerIn", (player) => {
    addPlayer(player);
  });

  socket.on("players", (allPlayers) => {
    allPlayers.map(addPlayer);
  });

  socket.on("move", (id, move) => {
    const player = players.find((p) => p.id === id);
    player.update(move);
  });
  socket.on("updatePosition", (player) => {
    const playerObj = JSON.parse(player);
    updatePosition(playerObj);
    animateMovement(playerObj);
  });
  function handleMovement(e) {
    if (!acceptedMoves.includes(e.key)) return;
    socket.emit("move", currentPlayer.id, e.key);
  }

  // Chat
  const formChat = document.querySelector("#form-chat");
  const chat = document.querySelector(".show-messages");

  formChat.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log(currentPlayer);
    const playerMessage = e.target.message.value;
    currentPlayer.message = playerMessage;
    socket.emit("playerMessage", currentPlayer);
    e.target.message.value = "";
  });

  function addChatMessage(message) {
    const div = document.createElement("div");
    const p = document.createElement("p");
    const span = document.createElement("span");
    if (message.pid === currentPlayer?.id) {
      div.classList.add("my-message");
      div.innerText = message.message;
    } else if (message.pid === "system") {
      div.classList.add("system-message");
    } else {
      div.classList.add("other-message");
      console.log("message", message);
      span.innerText = message.author;
      p.innerText = message.message;
      div.appendChild(span);
      div.appendChild(p);

    }
    chat.appendChild(div);
  }

  socket.on("chatUpdate", (playersMessages) => {
    chat.innerHTML = "";
    console.log(playersMessages);
    playersMessages.map(addChatMessage);
  });

}

