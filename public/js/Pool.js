class Pool {
  constructor() {
    this.width = 720;
    this.height = 360;
    this.blueTeam = [];
    this.redTeam = [];
  }

  addPlayer(player) {
    if (this.blueTeam.length <= 2 && this.redTeam.length <= 2) {
      if (this.blueTeam.length <= this.redTeam.length) this.blueTeam.push(player);
      else this.redTeam.push(player);
    }
  }

  removePlayer(player) {
    this.blueTeam = this.blueTeam.filter((plr) => plr.id !== player.id);
    this.redTeam = this.redTeam.filter((plr) => plr.id !== player.id);
  }
}