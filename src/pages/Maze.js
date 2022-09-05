import Phaser from "phaser";

const Maze = () => {
  /* phaser prototype
   */
  Phaser.Scene.prototype.addButton = function (
    x,
    y,
    key,
    callback,
    callbackContext,
    overFrame,
    outFrame,
    downFrame,
    upFrame
  ) {
    // add a button
    var btn = this.add.sprite(x, y, key, outFrame).setInteractive();
    btn.on("pointerover", function (ptr, x, y) {
      this.setFrame(overFrame);
    });
    btn.on("pointerout", function (ptr) {
      this.setFrame(outFrame);
    });
    btn.on("pointerdown", function (ptr) {});
    btn.on("pointerup", callback.bind(callbackContext));

    return btn;
  };
  const config = {
    type: Phaser.AUTO,
    backgroundColor: "#000000",
    width: 400,
    height: 600,
    parent: "game",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 300 },
        debug: false,
      },
    },
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      parent: "game",
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 400,
      height: 600,
    },
  };

  var player;
  var layer;
  var cursors;
  var speed = 200;
  var emitter;
  var flare;
  var star;
  var stX,
    stY,
    enX,
    enY,
    moveFlag = false;
  var jumpSpeed = 250,
    totalJump = 0,
    fallSpeed = 0;

  var g = 9.8;
  var game = new Phaser.Game(config);

  var backSound, walkingSound, bumpSound, teleportSound;

  function preload() {
    this.load.atlas(
      "flares",
      "https://labs.phaser.io/assets/particles/flares.png",
      "https://labs.phaser.io/assets/particles/flares.json"
    );
    this.load.image("start", "assets/materials/floor_start.png");
    this.load.image("ground", "assets/materials/floor1.png");
    this.load.image("tiles", "assets/materials/wall.png");
    this.load.image("red", "https://labs.phaser.io/assets/particles/red.png");
    this.load.image("star", "assets/materials/star.png");
    this.load.spritesheet(
      "player",
      "https://labs.phaser.io/assets/sprites/spaceman.png",
      { frameWidth: 16, frameHeight: 16 }
    );
    this.load.tilemapCSV(
      "map",
      "assets/maps/grid" + (Math.random() > 0.5 ? 1 : 2) + ".csv"
    );
    this.load.audio("back", "assets/Sounds/music maze.mp3");
    this.load.audio("walking", "assets/Sounds/walking.wav");
    this.load.audio("bump", "assets/Sounds/bump.wav");
    this.load.audio("teleport", "assets/Sounds/teleport.wav");
  }

  function create() {
    //  A simple background for our game
    // this.add.image(512, 512, "ground").setScale(2, 2);
    backSound = this.sound.add("back", { volume: 0.5 });
    walkingSound = this.sound.add("walking");
    bumpSound = this.sound.add("bump", { volume: 0.2 });
    teleportSound = this.sound.add("teleport", { volume: 2 });
    backSound.play();

    var map = this.make.tilemap({
      key: "map",
      tileWidth: 32,
      tileHeight: 32,
    });

    var tileset = map.addTilesetImage("tiles");
    layer = map.createLayer(0, tileset, 0, 0);
    map.setCollisionBetween(1, 2);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", { start: 8, end: 9 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { start: 1, end: 2 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("player", { start: 11, end: 13 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("player", { start: 4, end: 6 }),
      frameRate: 10,
      repeat: -1,
    });
    cursors = this.input.keyboard.createCursorKeys();

    var particles = this.add.particles("red");

    emitter = particles.createEmitter({
      lifespan: 1000,
      speed: 10,
      scale: { start: 0.1, end: 0 },
      trackVisible: false,
      blendMode: "SCREEN",
      depth: 0,
    });

    player = this.physics.add.sprite(48, 48, "player", 1).setScale(1.5, 1.5);
    player.body.setBounce(0.2);
    // player.body.setCollideWorldBounds(true);
    player.body.setDrag(3000, 0);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(player);

    this.physics.add.collider(player, layer, mapCollider, null, this);
    emitter.startFollow(player.body, 8, 8);

    this.add.image(16, 48, "start").setScale(1 / 16, 1 / 16);

    star = this.physics.add.staticImage(32 * 30 + 16, 48, "star");
    this.physics.add.overlap(player, [star], escaped, null, this);
    this.input.on("pointermove", moveDrag, this);
    this.input.on("pointerdown", setStartPoint, this);
    this.input.on("pointerup", stopDrag, this);

    particles = this.add.particles("flares");
    flare = particles.createEmitter({
      frame: ["red", "blue", "green", "yellow"],
      x: -400,
      y: -300,
      speed: 0,
      lifespan: 0,
      blendMode: "ADD",
    });
  }
  function mapCollider() {
    if (!player.body.blocked.down) bumpSound.play();
  }
  function stopDrag(pointer) {
    stX = enX;
    stY = enY;
    moveFlag = false;
  }
  function setStartPoint(pointer) {
    console.log(pointer.x);
    stX = pointer.x;
    stY = pointer.y;
    moveFlag = true;
  }
  function moveDrag(pointer) {
    if (moveFlag == true) {
      enX = pointer.x;
      enY = pointer.y;
    }
    console.log(moveFlag);
  }
  function update() {
    // console.log(this.cameras.main.x, this.cameras.main.y);
    if (cursors.left.isDown || enX < stX) {
      player.setVelocityX(-speed);
      walkingSound.play();
      player.anims.play("left", true);
    } else if (cursors.right.isDown || enX > stX) {
      player.setVelocityX(speed);
      walkingSound.play();
      player.anims.play("right", true);
    } else {
      walkingSound.pause();
    }

    var angle = 0;
    if (stY <= enY) angle = 0;
    else {
      if (stX == enX && stY > enY) angle = 1;
      else angle = Math.abs((enY - stY) / (enX - stX));
    }
    // console.log(angle);
    if ((angle > 0.7 || cursors.up.isDown) && fallSpeed == 0) {
      if (player.body.blocked.down) {
        totalJump = 0;
        player.setVelocityY(-jumpSpeed);
      } else {
        if (totalJump < 20) {
          player.setVelocityY(-jumpSpeed);
          totalJump++;
        } else {
          fallSpeed = 1;
          totalJump = 0;
        }
      }
    } else {
      if (player.body.blocked.down) {
        fallSpeed = 0;
        totalJump = 0;
      } else fallSpeed = 1;
    }
  }

  function escaped() {
    flare.setPosition(player.x, player.y);
    flare.setLifespan(1000);
    flare.setSpeed(200);
    teleportSound.play();
    star.disableBody(true, true);
    setTimeout(() => {
      window.open("http://localhost:3000/mario");
    }, 1000);
  }

  return (
    <div>
      <div id="game"></div>
      {/* <div className="absolute bottom-0">
        <button className="w-20 mr-10" onClick={moveLeft} onPointerUp>
          <img src="./assets/materials/leftArrow.png" />
        </button>
        <button className="w-20" onClick={moveRight}>
          <img src="./assets/materials/rightArrow.png" />
        </button>
        <button className="w-20 float-right" onClick={jump}>
          <img src="./assets/materials/jump.png" />
        </button>
      </div> */}
    </div>
  );
};
export default Maze;
