const socket = io();
const camp = document.querySelector("#camp");
const campDimensions = camp.getBoundingClientRect();
const playersPodium = document.querySelector("#players");
const playerSvg = document.querySelector(".player");
const activeCounter = document.querySelector("#actives");
const buttonSend = document.querySelector("#send-message");
buttonSend.addEventListener("click", handleClick);
let currentPlayer = "";
const head = document.querySelector("#Head");
const nickname = prompt("Digite o nome do jogador");
//movements
const movement = {
  id: currentPlayer,
  team: "",
  hasFlag: false,
  top: 0,
  left: 0,
  rotate: 0,
  direction: "",
};
const blueFlag = {
  top: 180,
  left: 620,
};

const redFlag = {
  top: 180,
  left: 40,
};
const stepDistance = 20;

function handleClick() {
  const chatMessage = document.querySelector("#message").value;
  socket.emit("chatMessage", chatMessage);
}

if (nickname) {
  socket.emit("nickname", nickname);
}

socket.on("conn", (id) => {
  sessionStorage.setItem("player", id);
  currentPlayer = id;
  movement.id = currentPlayer;
});

socket.on("loadMessages", (messagesToLoad) => {
  const chat = Array.from(document.querySelector("#chatToShow").children);
  const chatDiv = document.querySelector("#chatToShow");
  if (chat.length === 0) {
    if (messagesToLoad) {
      messagesToLoad.forEach((message) => {
        const div = document.createElement("div");
        const p = document.createElement("p");
        const span = document.createElement("span");
        span.innerText = message.message;
        if (message.author.id === sessionStorage.getItem("player")) {
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
  chatDiv.scrollTo(0, chatDiv.scrollHeight);
});

socket.on("players", (players, flags) => {
  const playersInCamp = Array.from(camp.children);
  if (playersInCamp.length === 0) {
    players.forEach((playerComing) => {
      const player = playerSvg.cloneNode(true);
      player.style.display = "block";
      const li = document.createElement("li");
      activeCounter.innerText = players.length;
      li.innerText = playerComing.nickname + " " + playerComing.team;
      li.id = playerComing.id;
      player.id = playerComing.id;
      player.classList.add(playerComing.team);
      movement.team = playerComing.team;
      movement.top = playerComing.top;
      movement.left = playerComing.left;
      movement.rotate = playerComing.rotate;
      movement.direction = playerComing.direction;
      player.style.left = `${playerComing.left}px`;
      player.style.top = `${playerComing.top}px`;
      if (playerComing.id === currentPlayer) {
        player.classList.add("current_player");
        li.classList.add("current_player");
      }
      player.animate([{ transform: `rotate(${playerComing.rotate}deg)` }], {
        duration: 100,
        fill: "forwards",
      });
      playersPodium.appendChild(li);
      camp.appendChild(player);
    });

    flags.forEach((flagComing) => {
      let flag = "";
      if (flagComing.team === "blue") {
        flag = document.querySelector(".blue_flag").cloneNode(true);
      } else {
        flag = document.querySelector(".red_flag").cloneNode(true);
      }
      flag.id = flagComing.team + "-flag";
      flag.classList.add("flag");
      flag.style.display = "block";
      flag.classList.add(flagComing.team);
      if (flagComing.team === "blue") {
        flag.style.top = blueFlag.top + "px";
        flag.style.left = blueFlag.left + "px";
      } else {
        flag.style.top = redFlag.top + "px";
        flag.style.left = redFlag.left + "px";
      }

      camp.appendChild(flag);
    });
  }
});

socket.on("newPlayer", (newPlayer) => {
  if (newPlayer.id != currentPlayer) {
    const player = playerSvg.cloneNode(true);
    player.style.display = "block";
    const li = document.createElement("li");
    li.innerText = newPlayer.nickname + " " + newPlayer.team;
    li.id = newPlayer.id;
    player.id = newPlayer.id;
    player.classList.add(newPlayer.team);
    player.style.left = `${newPlayer.left}px`;
    player.style.top = `${newPlayer.top}px`;
    playersPodium.appendChild(li);
    player.animate([{ transform: `rotate(${newPlayer.rotate}deg)` }], {
      duration: 100,
      fill: "forwards",
    });
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

function setRotation(from, to) {
  let rotation = 0;
  if (from === to) return rotation;
  else if (
    (from === "left" && to === "right") ||
    (from === "right" && to === "left") ||
    (from === "top" && to === "bottom") ||
    (from === "bottom" && to === "top")
  )
    rotation = 180;
  else if (
    (from === "left" && to === "top") ||
    (from === "top" && to === "right") ||
    (from === "right" && to === "bottom") ||
    (from === "bottom" && to === "left")
  )
    rotation = 90;
  else if (
    (to === "left" && from === "top") ||
    (to === "top" && from === "right") ||
    (to === "right" && from === "bottom") ||
    (to === "bottom" && from === "left")
  )
    rotation = -90;

  return rotation;
}

function handleMovement(e) {
  switch (e.keyCode) {
    case 37:
      if (movement.left - stepDistance < 0) break;
      movement.rotate += setRotation(movement.direction, "left");
      movement.direction = "left";
      movement.left -= stepDistance;
      break;
    case 38:
      if (movement.top - stepDistance < 0) break;
      movement.rotate += setRotation(movement.direction, "top");
      movement.direction = "top";
      movement.top -= stepDistance;
      break;
    case 39:
      if (movement.left + stepDistance === 680) break;
      movement.rotate += setRotation(movement.direction, "right");
      movement.direction = "right";
      movement.left = movement.left + stepDistance;
      break;
    case 40:
      if (movement.top + stepDistance === 320) break;
      movement.rotate += setRotation(movement.direction, "bottom");
      movement.direction = "bottom";
      movement.top += stepDistance;
      break;
    default:
      break;
  }
  if (e.keyCode >= 37 && e.keyCode <= 40) {
    socket.emit("playerMoving", movement);
  }
}

socket.on("playerMoved", (playerMovement) => {
  const playerMoving = Array.from(camp.children).find(
    (item) => item.id === playerMovement.id
  );

  playerMoving.style.top = playerMovement.top + "px";
  playerMoving.style.left = playerMovement.left + "px";

  if (playerMovement.team === "blue") {
    const redFlagEl = document.querySelector("#red-flag");
    const redFlagTop = parseInt(
      redFlagEl.style.top.substring(0, redFlagEl.style.top.length - 2)
    );
    const redFlagLeft = parseInt(
      redFlagEl.style.left.substring(0, redFlagEl.style.left.length - 2)
    );
    const topDifference = redFlagTop - playerMovement.top;
    const leftDifference = redFlagLeft - playerMovement.left;

    if (
      topDifference >= 0 &&
      topDifference <= 40 &&
      leftDifference >= 0 &&
      leftDifference <= 40
    ) {
      movement.hasFlag = true;
    }

    if (movement.hasFlag) {
      redFlag.top = playerMovement.top;
      redFlag.left = playerMovement.left;
      redFlagEl.style.top = playerMovement.top + "px";
      redFlagEl.style.left = playerMovement.left + "px";
    }
  } else {
    const blueFlagEl = document.querySelector("#blue-flag");
    const blueFlagTop = parseInt(
      blueFlagEl.style.top.substring(0, blueFlagEl.style.top.length - 2)
    );
    const blueFlagLeft = parseInt(
      blueFlagEl.style.left.substring(0, blueFlagEl.style.left.length - 2)
    );
    const topDifference = blueFlagTop - playerMovement.top;
    const leftDifference = blueFlagLeft - playerMovement.left;

    if (
      topDifference >= 0 &&
      topDifference <= 40 &&
      leftDifference >= 0 &&
      leftDifference <= 40
    ) {
      movement.hasFlag = true;
    }

    if (movement.hasFlag) {
      blueFlag.top = playerMovement.top;
      blueFlag.left = playerMovement.left;
      blueFlagEl.style.top = playerMovement.top + "px";
      blueFlagEl.style.left = playerMovement.left + "px";
    }
  }

  if (playerMovement) {
    playerMoving.animate(
      [{ transform: `rotate(${playerMovement.rotate}deg)` }],
      {
        duration: 100,
        fill: "forwards",
      }
    );
  }
});

socket.on("newMessage", (newMessage) => {
  const chat = document.querySelector("#chatToShow");
  const div = document.createElement("div");
  const p = document.createElement("p");
  const span = document.createElement("span");

  span.innerText = newMessage.message;
  p.innerText = newMessage.author.nickname;
  if (newMessage.author.id === sessionStorage.getItem("player")) {
    div.classList.add("my-message");
    div.innerText = newMessage.message;
  } else if (newMessage.author === "System") {
    div.classList.add("system-message");
    div.innerHTML = newMessage.message;
  } else {
    div.classList.add("other-message");
    div.appendChild(p);
    div.appendChild(span);
  }
  chat.appendChild(div);
  chat.scrollTo(0, chat.scrollHeight);
});

document.addEventListener("keydown", handleMovement);
