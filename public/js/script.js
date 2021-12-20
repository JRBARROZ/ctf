const socket = io("http://localhost:3000");
const camp = document.querySelector("#camp");
const campDimensions = camp.getBoundingClientRect();
const playersPodium = document.querySelector("#players");
const playerSvg = document.querySelector(".player");
const activeCounter = document.querySelector("#actives");
const buttonSend = document.querySelector("#send-message");
buttonSend.addEventListener("click", handleClick);
let currentPlayer = "";
const nickname = prompt("Digite o nome do jogador");
//movements
const movement = {
  player: currentPlayer,
  top: 0,
  left: 0,
  rotate: "",
};
const stepDistance = 20;

function handleClick() {
  const chatMessage = document.querySelector("#message").value;
  socket.emit("chatMessage", chatMessage);
}

function removeRotates(playerMoving) {
  playerMoving.classList.remove("top");
  playerMoving.classList.remove("right");
  playerMoving.classList.remove("bottom");
  playerMoving.classList.remove("left");
}

if (nickname) {
  socket.emit("nickname", nickname);
}

socket.on("conn", (id) => {
  sessionStorage.setItem("player", id);
  currentPlayer = id;
  movement.player = currentPlayer;
});

socket.on("loadMessages", (messagesToLoad) => {
  const chat = Array.from(document.querySelector("#chatToShow").children);
  if (chat.length === 0) {
    if (messagesToLoad) {
      messagesToLoad.forEach((message) => {
        const div = document.createElement("div");
        const p = document.createElement("p");
        const span = document.createElement("span");
        span.innerText = message.message;
        if (message.author.player === sessionStorage.getItem("player")) {
          div.classList.add("my-messsage");
        } else {
          div.classList.add("other-message");
        }
        p.innerText = message.author.nickname;
        div.appendChild(p);
        div.appendChild(span);
        document.querySelector("#chatToShow").appendChild(div);
      });
    }
  }
});

socket.on("players", (players) => {
  const playersInCamp = Array.from(camp.children);
  if (playersInCamp.length === 0) {
    players.forEach((playerComing) => {
      const player = playerSvg.cloneNode(true);
      player.style.display = "block";
      const li = document.createElement("li");
      activeCounter.innerText = players.length;
      li.innerText = playerComing.nickname + " " + playerComing.team;
      li.id = playerComing.player;
      player.id = playerComing.player;
      player.classList.add(playerComing.team);
      movement.top = playerComing.top;
      movement.left = playerComing.left;
      player.style.left = `${playerComing.left}px`;
      player.style.top = `${playerComing.top}px`;
      if (playerComing.player === currentPlayer) {
        player.classList.add("current_player");
        li.classList.add("current_player");
      }
      playersPodium.appendChild(li);
      camp.appendChild(player);
    });
  }
});

socket.on("newPlayer", (newPlayer) => {
  if (newPlayer.player != currentPlayer) {
    const player = playerSvg.cloneNode(true);
    player.style.display = "block";
    const li = document.createElement("li");
    li.innerText = newPlayer.nickname + " " + newPlayer.team;
    li.id = newPlayer.player;
    player.id = newPlayer.player;
    movement.left = newPlayer.left;
    movement.top = newPlayer.top;
    player.classList.add(newPlayer.team);
    player.style.left = `${newPlayer.left}px`;
    player.style.top = `${newPlayer.top}px`;
    playersPodium.appendChild(li);
    camp.appendChild(player);
    activeCounter.innerText = Array.from(camp.children).length;
  }
});

socket.on("playerDisc", (playerToExitId) => {
  const playersInCamp = Array.from(camp.children);
  playersInCamp.forEach((playerPlaying) => {
    if (playerPlaying.id === playerToExitId) {
      camp.removeChild(playerPlaying);
    }
    activeCounter.innerText = Array.from(camp.children).length;
  });
  const allPlayers = Array.from(playersPodium.children);
  allPlayers.forEach((playerInPodium) => {
    if (playerInPodium.id === playerToExitId) {
      playersPodium.removeChild(playerInPodium);
    }
  });
});

function handleMovement(e) {
  const playerMoving = Array.from(camp.children).find(
    (item) => item.id === currentPlayer
  );
  switch (e.keyCode) {
    case 37:
      movement.left -= stepDistance;
      removeRotates(playerMoving);
      playerMoving.classList.add("left");
      movement.rotate = "left";
      break;
    case 38:
      movement.top -= stepDistance;
      removeRotates(playerMoving);
      playerMoving.classList.add("top");
      movement.rotate = "top";
      break;
    case 39:
      movement.left = movement.left + stepDistance;
      removeRotates(playerMoving);
      playerMoving.classList.add("right");
      movement.rotate = "right";
      break;
    case 40:
      movement.top += stepDistance;
      removeRotates(playerMoving);
      playerMoving.classList.add("bottom");
      movement.rotate = "bottom";
      break;
    default:
      break;
  }
  if (e.keyCode >= 37 && e.keyCode <= 40) socket.emit("playerMoving", movement);
}

socket.on("playerMoved", (movement) => {
  const playerMoving = Array.from(camp.children).find(
    (item) => item.id === movement.player
  );
  playerMoving.style.top = movement.top + "px";
  playerMoving.style.left = movement.left + "px";
  removeRotates(playerMoving);
  if (movement) {
    playerMoving.classList.add(movement.rotate);
  }
});

socket.on("newMessage", (newMessage) => {
  const chat = document.querySelector("#chatToShow");
  const div = document.createElement("div");
  const p = document.createElement("p");
  const span = document.createElement("span");

  span.innerText = newMessage.message
  p.innerText = newMessage.author.nickname
  if (newMessage.author.player === sessionStorage.getItem("player")) {
    div.classList.add("my-message");
    div.innerText = newMessage.message;
  } else {
    div.classList.add("other-message");
    div.appendChild(p)
    div.appendChild(span)
  }
  chat.appendChild(div);
  chat.scrollTo(0, chat.scrollHeight);
});

document.addEventListener("keydown", handleMovement);