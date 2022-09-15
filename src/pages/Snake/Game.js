import Phaser from "phaser";
const mapPosition = require("./map.json");
export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
    this.diceBtn = null;
    this.dice = null;
    this.player = null;
    this.currentSide = 1; // first side
    this.currentPos = 0;

    // Flags
    this.rollFlag = false;
    this.moveFlag = false;
    this.endFlag = false;
    console.log(mapPosition);
  }

  throwDice() {
    // this.currentSide = Math.floor(Math.random() * 5 + 1);
    // this.dice.setFrame(this.currentSide);
    this.rollFlag = true;
    setTimeout(() => {
      this.rollFlag = false;
      this.moveTo();
    }, 1000);
  }
  moveTo = () => {
    if (this.currentPos + this.currentSide >= 36) return;
    this.currentPos += this.currentSide;
    const newPos = this.currentPos;
    this.moveFlag = true;
    this.tweens.add({
      targets: this.player,
      x: mapPosition[newPos].x,
      y: mapPosition[newPos].y,
      ease: "Power1",
      duration: this.currentSide * 300,
    });
    setTimeout(() => {
      this.moveFlag = false;
    }, this.currentSide * 300 + 50);
  };

  preload() {
    this.load.image("map", "/snake/materials/map.jpg");
    this.load.image("diceBtn", "/snake/materials/dice.png");
    this.load.spritesheet("dice", "/snake/materials/dice_sprite.png", {
      frameWidth: 172,
      frameHeight: 159,
    });
    this.load.spritesheet("player", "/snake/materials/player.png", {
      frameWidth: 108,
      frameHeight: 130,
    });
  }
  create() {
    // this.add.image(640, 512, "map").setScale(1280 / 800, 1024 / 600);
    this.add.image(640, 512, "map");
    this.player = this.physics.add
      .sprite(mapPosition[0].x, mapPosition[0].y, "player", 1)
      .setScale(0.5, 0.5)
      .setOrigin(0.5, 1);

    this.diceBtn = this.add
      .sprite(1000, 800, "diceBtn")
      .setInteractive({
        cursor: "pointer",
      })
      .setScale(0.5, 0.5);

    this.diceBtn.on("pointerover", function (ptr, x, y) {
      this.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);
    });
    this.diceBtn.on("pointerout", function (ptr, x, y) {
      this.setTint();
      this.setScale(0.5, 0.5);
    });
    this.diceBtn.on("pointerdown", function (ptr, x, y) {
      this.setScale(0.4, 0.4);
    });
    this.diceBtn.on("pointerup", (ptr, x, y) => {
      this.diceBtn.setScale(0.5, 0.5);
      if (this.moveFlag == false && this.rollFlag == false) this.throwDice();
    });
    this.input.on("pointerdown", function (ptr) {
      console.log(ptr.x, ptr.y);
    });
    this.dice = this.add.sprite(640, 900, "dice");
  }
  update() {
    if (this.rollFlag == true) {
      this.currentSide = Math.floor(Math.random() * 5 + 1);
      this.dice.setFrame(this.currentSide - 1);
    }
  }
}
