import Phaser from "phaser";

export default class Welcome extends Phaser.Scene {
  constructor() {
    super("welcome");
    this.backGround = "";
  }
  preload() {
    this.load.image("sky", "/snake/materials/welcome.jpg");
  }
  update() {
    this.backGround.alpha -= 0.01;
  }
  create() {
    this.backGround = this.add.image(640, 512, "sky");
    setTimeout(() => {
      this.scene.start("game");
    }, 2000);
  }
}
