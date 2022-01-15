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
		this.message = message
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
			name: this.name
		}
		return JSON.stringify(player);
	}

	move(direction) {
		console.log(direction)
		const acceptedMoves = {
			ArrowUp: () => {
				if (this.top - this.stepDistance >= 0) {
					this.top -= this.stepDistance;
				}
				this.rotate += this.getRotation(this.direction, "up");
				this.direction = "up";
			},
			ArrowDown: () => {
				if (this.top + this.stepDistance <= 320) {
					this.top += this.stepDistance;
				}
				this.rotate += this.getRotation(this.direction, "down");
				this.direction = "down";
			},
			ArrowRight: () => {
				if (this.left + this.stepDistance <= 680) {
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
		}

		const moveFunction = acceptedMoves[direction];
		if (moveFunction) {
			moveFunction();
		}

	}

	getRotation(from, to) {
		let rotation = 0;
		if (from === to) return rotation;
		else if (from === "up" && to === "down" || from === "left" && to === "right" ||
			from === "down" && to === "up" || from === "right" && to === "left") rotation = 180;
		else if (from === "up" && to === "right" || from === "right" && to === "down" ||
			from === "down" && to === "left" || from === "left" && to === "up") rotation = 90;
		else rotation = -90;

		return rotation;
	}

	checkForPlayerCollision(players, direction) {
		
	}
}
