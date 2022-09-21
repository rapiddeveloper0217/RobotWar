import Phaser from "phaser";
import bs58 from "bs58";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
var web3 = require("@solana/web3.js");

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

    // coins
    this.coins = null;
    // this.sol =
    //text
    this.text = null;
    this.walletAddress = localStorage.getItem("walletAddress");
    console.log(mapPosition);
  }

  transfer = async (amount) => {
    var connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
    // Construct a `Keypair` from secret key
    var fromWallet = web3.Keypair.fromSecretKey(
      bs58.decode(process.env.REACT_APP_PRIVATE_KEY)
    );
    var toWallet = new web3.PublicKey(this.walletAddress);
    var myMint = new web3.PublicKey(process.env.REACT_APP_TOKEN);

    console.log(fromWallet.publicKey, toWallet, process.env.REACT_APP_TOKEN);

    var myToken = new Token(connection, myMint, TOKEN_PROGRAM_ID, fromWallet);

    var fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
      fromWallet.publicKey
    );
    var toTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
      toWallet
    );

    var transaction = new web3.Transaction().add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        [],
        amount
      )
    );

    var signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [fromWallet]
    );
    console.log("SIGNATURE", signature);
    console.log("SUCCESS");
  };

  getCoin = (player, coin) => {
    if (
      this.moveFlag == false &&
      this.rollFlag == false &&
      coin.x == player.x &&
      coin.y == player.y
    ) {
      var type = mapPosition[this.currentPos].type;
      var coinFlag = false;
      var sol = 0;
      if (type == "gold") {
        sol = 100;
        coinFlag = true;
      }
      if (type == "silver") {
        sol = 10;
        coinFlag = true;
      }
      if (type == "bronze") {
        sol = 5;
        coinFlag = true;
      }
      if (type == "red") {
        sol = 1;
        coinFlag = true;
      }
      if (coinFlag == true) {
        mapPosition[this.currentPos].type = "normal";
        this.tweens.add({
          targets: coin,
          y: coin.y - 100,
          duration: Phaser.Math.Between(500, 1000),
          ease: "Power1",
          onComplete: () => {
            coin.disableBody(true, true);
            this.transfer(sol);
            console.log("overlap");
          },
        });
        this.text.setText([
          `You got ${sol}!`,
          `(${
            this.walletAddress.substring(0, 4) +
            "..." +
            this.walletAddress.substring(
              this.walletAddress.length - 5,
              this.walletAddress.length
            )
          })`,
        ]);
        this.tweens.add({
          targets: this.text,
          alpha: 1,
          yoyo: true,
          hold: 500,
          duration: 1000,
          ease: "Power1",
        });

        // this.text.alpha = 1;
      }
    }
  };
  throwDice = () => {
    // this.currentSide = Math.floor(Math.random() * 5 + 1);
    // this.dice.setFrame(this.currentSide);
    this.rollFlag = true;
    setTimeout(() => {
      this.rollFlag = false;
      this.moveTo();
    }, 1000);
  };

  moveFromTo = (to, duration) => {
    this.moveFlag = true;
    this.tweens.add({
      targets: this.player,
      x: mapPosition[to].x,
      y: mapPosition[to].y,
      ease: "Power1",
      duration: duration,
    });
    setTimeout(() => {
      this.moveFlag = false;
      this.currentPos = to;
    }, duration + 50);
  };
  moveTo = () => {
    const newPos = this.currentPos + this.currentSide;
    if (newPos >= 36) return;
    for (var i = 0; i <= newPos; i++)
      this.moveFromTo(newPos, this.currentSide * 300);
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
    //coin
    this.load.spritesheet("gold", "/snake/materials/gold.png", {
      frameWidth: 72,
      frameHeight: 72,
    });
    this.load.spritesheet("red", "/snake/materials/red.png", {
      frameWidth: 72,
      frameHeight: 72,
    });
    this.load.spritesheet("bronze", "/snake/materials/bronze.png", {
      frameWidth: 72,
      frameHeight: 72,
    });
    this.load.spritesheet("silver", "/snake/materials/silver.png", {
      frameWidth: 72,
      frameHeight: 72,
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

    this.coins = this.physics.add.group();
    // this.coins.add(this.dice);
    // this.coins = this.physics.add.group(this);

    // this.coin.enableBody = true;
    //

    // this.anims.create({
    //   key: "left",
    //   frames: this.anims.generateFrameNumbers("player", { start: 3, end: 5 }),
    //   frameRate: 10,
    //   repeat: 0,
    // });
    // this.player.anims.play("left");

    mapPosition.forEach((pos, index) => {
      // this.add.text(pos.x, pos.y, index, { color: "#ff00ff" });

      if (
        pos.type == "gold" ||
        pos.type == "bronze" ||
        pos.type == "red" ||
        pos.type == "silver"
      ) {
        var scale = 1;
        if (pos.type == "gold") scale = 0.8;
        if (pos.type == "silver") scale = 0.6;
        if (pos.type == "bronze") scale = 0.5;
        if (pos.type == "red") scale = 0.4;
        var config = {
          key: "flip",
          // duration:5
          frames: this.anims.generateFrameNumbers(pos.type),
          frameRate: 8,
          repeat: -1,
          delay: Math.random() * 800,
        };
        var coinItem = this.physics.add
          .sprite(pos.x, pos.y, pos.type)
          .setScale(scale, scale);
        coinItem.anims.create(config);
        coinItem.anims.play("flip");
        this.coins.add(coinItem);
      }

      this.physics.add.overlap(this.player, this.coins, this.getCoin);
      // coinItem.anims.create({ key: "run", duration: 30 });

      // coinItem.anims.play({ key: "run", frameRate: 24 });
      // coinItem.play("flip");
      this.text = this.add
        .text(640, 70, "You got 100 sol!", {
          color: "#ffff00",
          fontSize: 50,
          align: "center",
        })
        .setOrigin(0.5, 0.5);
      this.text.alpha = 0;
    });
  }
  update() {
    if (this.rollFlag == true) {
      this.currentSide = Math.floor(Math.random() * 5 + 1);
      this.dice.setFrame(this.currentSide - 1);
    }
    if (this.moveFlag == false && this.rollFlag == false) {
      if (
        mapPosition[this.currentPos].type == "ladder" ||
        mapPosition[this.currentPos].type == "snake"
      ) {
        let st = this.currentPos;
        let en = mapPosition[this.currentPos].to;
        this.moveFromTo(en, (en - st) * 300);
      }
    }
  }
}
