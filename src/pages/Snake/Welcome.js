import Phaser from "phaser";
import axios from "axios";
const mintAddresses = require("../../assets/mintAddresses.json");
export default class Welcome extends Phaser.Scene {
  constructor() {
    super("welcome");
    this.backGround = "";

    this.walletAddress = "";
    // connect wallet button
    this.button = null;
    this.text = null;
    this.nfts = [];
  }
  preload() {
    this.load.image("sky", "/snake/materials/welcome.jpg");
    this.load.image("connect", "/snake/materials/connect.png");
  }
  update() {
    // this.backGround.alpha -= 0.01;
  }
  nextScene = () => {
    this.tweens.add({
      targets: [this.button, this.text, this.backGround],
      alpha: 0,
      duration: 2000,
      delay: 1000,
      ease: "Power1",
      onComplete: () => {
        this.scene.start("game");
      },
    });
    // setTimeout(() => {}, 2000);
  };
  approveNft = async () => {};
  deposit = async () => {};
  checkNft = async () => {
    const tokenAddresses = mintAddresses;
    console.log(tokenAddresses);
    let nftCount = 0;

    const options_collection = {
      method: "GET",
      // url: `https://solana-gateway.moralis.io/account/mainnet/${"31RwP1gBSNky1o7Yz6DYqUYwc9zNT9Fhcioa6FTKSUsj"}/nft`,
      url: `https://solana-gateway.moralis.io/account/mainnet/${this.walletAddress}/nft`,
      headers: {
        Accept: "application/json",
        "X-API-Key":
          "uhNYQMJcvBHjgJOrA4gltbODqDTdQUnjdzEpL9IKSqL4ImoLCgPUBgET7GIhVkx1",
      },
    };
    try {
      const result = await axios.request(options_collection);
      console.log(result);
      for (const collection of result.data) {
        try {
          if (tokenAddresses.indexOf(collection.mint) >= 0) {
            nftCount++;
            this.nfts.push(collection.mint);
          }
          console.log(collection.mint);
        } catch {}
      }
      console.log(this.nfts, nftCount);
    } catch {
      //
    }
  };
  connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      try {
        const response = await solana.connect();

        this.walletAddress = response.publicKey.toString();
        this.text.setText(
          this.walletAddress.substring(0, 4) +
            "..." +
            this.walletAddress.substring(
              this.walletAddress.length - 5,
              this.walletAddress.length
            )
        );
        localStorage.setItem("walletAddress", this.walletAddress);
        this.checkNft();
        // this.nextScene();
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
        return -1;
      }
    } else {
      return -2;
    }
  };
  create() {
    this.alpha = 1;
    this.backGround = this.add
      .image(640, 512, "sky")
      .setScale(1280 / 800, 1024 / 772);
    this.button = this.add
      .image(1150, 80, "connect")
      .setScale(1.4, 1.4)
      .setInteractive({
        cursor: "pointer",
      });
    var style = {
      font: "bold 20px Arial",
      fill: "#fff",
      boundsAlignH: "center",
      boundsAlignV: "middle",
    };
    this.text = this.add
      .text(1150, 80, "connect wallet", style)
      .setOrigin(0.5, 0.5);
    this.button.on("pointerover", (ptr, x, y) => {
      this.button.setTint(0xffff00);
      this.button.setScale(1.5, 1.5);
      this.text.setScale(1.2, 1.2);
    });
    this.button.on("pointerout", (ptr, x, y) => {
      this.button.setTint();
      this.button.setScale(1.4, 1.4);
      this.text.setScale(1, 1);
    });
    this.button.on("pointerdown", (ptr, x, y) => {
      // this.setScale(0.4, 0.4);
      this.button.setTint(0xaaff00);
    });
    this.button.on("pointerup", (ptr, x, y) => {
      this.button.setTint();
      this.connectWallet();
      // this.diceBtn.setScale(0.5, 0.5);
    });
  }
}
