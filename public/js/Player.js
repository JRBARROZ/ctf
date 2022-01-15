module.exports = class Player {
  constructor(id, top, left, team, name, direction, rotate, message) {
    this.id = id;
    this.top = top;
    this.left = left;
    this.team = team;
    this.name = name;
    this.direction = direction;
    this.rotate = rotate;
    this.hasFlag = false;
    this.message = message;
    this.stepDistance = 20;
  }

  toString() {
    const player = {
      id: this.id,
      top: this.top,
      team: this.team,
      left: this.left,
      hasFlag: this.hasFlag,
      rotate: this.rotate,
      message: this.message,
      name: this.name,
    };
    return JSON.stringify(player);
  }

  move(direction, flags) {
    const acceptedMoves = {
      ArrowUp: () => {
        if (this.top - this.stepDistance >= 0) {
          this.top -= this.stepDistance;
        }
        this.rotate += this.getRotation(this.direction, "up");
        this.direction = "up";
      },
      ArrowDown: () => {
        if (this.top + this.stepDistance <= 300) {
          this.top += this.stepDistance;
        }
        this.rotate += this.getRotation(this.direction, "down");
        this.direction = "down";
      },
      ArrowRight: () => {
        if (this.left + this.stepDistance <= 660) {
          this.left += this.stepDistance;
        }
        this.rotate += this.getRotation(this.direction, "right");
        this.direction = "right";
      },
      ArrowLeft: () => {
        if (this.left - this.stepDistance >= 0) {
          this.left -= this.stepDistance;
        }
        this.rotate += this.getRotation(this.direction, "left");
        this.direction = "left";
      },
    };

    const moveFunction = acceptedMoves[direction];
    if (moveFunction) {
      moveFunction();
      if (this.checkForFlagCollision(flags)) {
        this.hasFlag = true;
      }
    }
  }

  getRotation(from, to) {
    let rotation = 0;
    if (from === to) return rotation;
    else if (
      (from === "up" && to === "down") ||
      (from === "left" && to === "right") ||
      (from === "down" && to === "up") ||
      (from === "right" && to === "left")
    )
      rotation = 180;
    else if (
      (from === "up" && to === "right") ||
      (from === "right" && to === "down") ||
      (from === "down" && to === "left") ||
      (from === "left" && to === "up")
    )
      rotation = 90;
    else rotation = -90;

    return rotation;
  }

  checkForPlayerCollision(players, direction, flags) {
    let hasCollision = false;
    let collidedWith = "";

    players.forEach((player) => {
      if (player.id !== this.id) {
        const otherTop = player.top;
        const otherLeft = player.left;

        const topDifference = Math.abs(this.top - otherTop);
        const leftDifference = Math.abs(this.left - otherLeft);

        hasCollision =
          (topDifference >= 0 &&
            topDifference <= 20 &&
            leftDifference >= 0 &&
            leftDifference <= 20) ||
          (topDifference >= 0 &&
            topDifference <= 40 &&
            leftDifference >= 0 &&
            leftDifference <= 20) ||
          (topDifference >= 0 &&
            topDifference <= 20 &&
            leftDifference >= 0 &&
            leftDifference <= 40);

        if (hasCollision) {
          collidedWith = player;
          return;
        }
      }
    });
    if (hasCollision) {
      if (collidedWith?.hasFlag || this.hasFlag) {
        collidedWith.hasFlag = false;
        this.hasFlag = false;
        return true;
      }
      direction =
        direction === "ArrowUp"
          ? "ArrowDown"
          : direction === "ArrowDown"
          ? "ArrowUp"
          : direction === "ArrowLeft"
          ? "ArrowRight"
          : "ArrowLeft";
      this.move(direction, flags);
    }
  }

  checkForFlagCollision(flags) {
    const opponentFlag = flags[0].team === this.team ? flags[1] : flags[0];
    const flagTop = opponentFlag.top;
    const flagLeft = opponentFlag.left;

    const topDifference = parseInt(flagTop) - this.top;
    const leftDifference = parseInt(flagLeft) - this.left;

    return (
      topDifference >= 0 &&
      topDifference <= 40 &&
      leftDifference >= 0 &&
      leftDifference <= 40
    );
  }

  checkForLinePass(player) {}
};
