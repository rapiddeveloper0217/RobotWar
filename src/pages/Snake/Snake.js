import Phaser from "phaser";
import Game from "./Game";
import Welcome from "./Welcome";
const Snake = () => {
  const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 1024,
    parent: "game",
    physics: {
      default: "arcade",
      arcade: {
        // gravity: { y: 300 },
        debug: false,
      },
    },
    scene: [Welcome, Game],
    scale: {
      mode: Phaser.Scale.FIT,
      parent: "game",
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 1024,
    },
  };
  const game = new Phaser.Game(config);
  return (
    <>
      <div id="snake"></div>
    </>
  );
};
export default Snake;
