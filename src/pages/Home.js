import robot from "../assets/image/Robot A.png";
import logo from "../assets/image/rfwlogo.png";
import phantomLogo from "../assets/image/Phantom wallet Logo.png";
import tick from "../assets/image/tick-mark-icon.png";
import wrong from "../assets/image/incorrect-icon.png";

import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

const mintAddresses = require("../assets/mintAddresses.json");
const Home = () => {
  // solana web3

  const connection = new Connection(
    "https://solana-api.projectserum.com",
    "confirmed"
  );
  const MAX_NAME_LENGTH = 32;
  const MAX_URI_LENGTH = 200;
  const MAX_SYMBOL_LENGTH = 10;
  const MAX_CREATOR_LEN = 32 + 1 + 1;
  const MAX_CREATOR_LIMIT = 5;
  const MAX_DATA_SIZE =
    4 +
    MAX_NAME_LENGTH +
    4 +
    MAX_SYMBOL_LENGTH +
    4 +
    MAX_URI_LENGTH +
    2 +
    1 +
    4 +
    MAX_CREATOR_LIMIT * MAX_CREATOR_LEN;
  const MAX_METADATA_LEN = 1 + 32 + 32 + MAX_DATA_SIZE + 1 + 1 + 9 + 172;
  const CREATOR_ARRAY_START =
    1 +
    32 +
    32 +
    4 +
    MAX_NAME_LENGTH +
    4 +
    MAX_URI_LENGTH +
    4 +
    MAX_SYMBOL_LENGTH +
    2 +
    1 +
    4;

  const TOKEN_METADATA_PROGRAM = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  const CANDY_MACHINE_V2_PROGRAM = new PublicKey(
    "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"
  );
  const candyMachineId = new PublicKey(
    "EHroiP9bpYs9J8Eq3K737jjnUAav6WsVjqmMtQTGYd5k"
  );

  const getMintAddresses = async (firstCreatorAddress) => {
    const metadataAccounts = await connection.getProgramAccounts(
      TOKEN_METADATA_PROGRAM,
      {
        // The mint address is located at byte 33 and lasts for 32 bytes.
        dataSlice: { offset: 33, length: 32 },

        filters: [
          // Only get Metadata accounts.
          { dataSize: MAX_METADATA_LEN },

          // Filter using the first creator.
          {
            memcmp: {
              offset: CREATOR_ARRAY_START,
              bytes: firstCreatorAddress.toBase58(),
            },
          },
        ],
      }
    );

    return metadataAccounts.map((metadataAccountInfo) =>
      bs58.encode(metadataAccountInfo.account.data)
    );
  };
  const getNFTOwners = async () => {
    const res = await getMintAddresses(candyMachineId);
    return res;
  };
  //------------------------------------------

  //------------- AUDIO -----------------
  const audioEnded = (e) => {
    if (e.target.id == "textAudio") {
      e.target.play();
      // setTimeout(() => {
      //   e.target.currentTime = Math.random() + 1;
      //   e.target.play();
      // }, 0);
    }
  };
  //---------------------------------------
  const texts = [
    "Mysterious girl: \nHello, you must be the new recruit. Admiral Miltron asked me to take you to the Fusion Facility. But we have to make sure you are combat ready",
    "Mysterious girl: \nThis facility is not for everyone. You must have at least two Robots to continue. We will check your wallet to make sure you are holding the correct NFTs",
    "Mysterious girl: \nEIt looks like you don’t have enough Robots.. This was expected. I’ve always said they were making a mistake by bringing you here. Come back when you are not Botless",
    "Mysterious girl: \nOk, at least you have Robots and it looks like you can pilot them. Now, we have to cross the Maze to get to the Fusion Facility. Come! They are waiting for us",
    "Mysterious girl: You are as we once were, suitless. Robotless. Find your way through the maze in your mind to achieve enlightenment.",
  ];
  const magicedenlink = "https://magiceden.io/marketplace/robot_factory_works";
  // const magicedenlink = "/maze";
  const mazegamelink = "/maze";

  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState(0);
  const [text, setText] = useState(texts[0]);
  const [loop, setLoop] = useState(null);
  const [animatedText, setAnimatedText] = useState("");
  const [walletAddress, setAddress] = useState("null");
  const [nfts, setNft] = useState(0);
  const [nftLoading, setNftState] = useState(false);
  const [started, setStarted] = useState(false);

  const memoryText = useRef("");

  const stopHandler = () => {
    setLoop((interval) => {
      clearInterval(interval);
      return null;
    });
  };
  const startHandler = () => {
    setLoop(
      setInterval(() => {
        memoryText.current = text.substring(0, memoryText.current.length + 1);
        setAnimatedText(memoryText.current);
      }, 60)
    );
  };

  const nextStage = (nftCount) => {
    // if (stage == 1) return;
    if (stage == 4) {
      return;
    }
    document.getElementById("textAudio").pause();
    memoryText.current = "";
    setAnimatedText("");
    setLoaded(false);
    document.getElementById("overlay").classList.remove("m-overlay");
    setTimeout(() => {
      setLoaded(true);
    }, 2000);
    setTimeout(() => {
      document.getElementById("overlay").classList.add("m-overlay");
    }, 10);

    stopHandler();
    setTimeout(() => {
      //   if (stage <= 2) setStage(stage + 1);
      //   else setAnimatedText(texts[3]);
      console.log(stage, walletAddress);
      if (stage == 0) setStage(1);
      else if (stage == 1) {
        if (nftCount >= 2) setStage(3);
        else {
          // if (nftCount == -1) setStage(2);
          // else startHandler();
          setStage(2);
        }
      } else if (stage >= 3) setStage(4);
      else if (stage == 2) startHandler();
      document.getElementById("textAudio").play();
    }, 2000);
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      try {
        const response = await solana.connect();
        setAddress(response.publicKey.toString());
        return response.publicKey.toString();
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
        return -1;
      }
    } else {
      return -2;
    }
  };
  const NftSearch = async () => {
    // stopHandler();
    const response = await connectWallet();
    if (response == -2) {
      window.open("https://phantom.app");
      return;
    } else if (response == -1) {
      return;
    }
    setNftState(true);
    // const tokenAddresses = await getNFTOwners();
    const tokenAddresses = mintAddresses;
    console.log(tokenAddresses);
    let nftCount = 0;
    if (response) {
      const options_collection = {
        method: "GET",
        // url: `https://solana-gateway.moralis.io/account/mainnet/${"31RwP1gBSNky1o7Yz6DYqUYwc9zNT9Fhcioa6FTKSUsj"}/nft`,
        url: `https://solana-gateway.moralis.io/account/mainnet/${response}/nft`,
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
              setNft(nftCount);
            }
            console.log(collection.mint);
          } catch {}
        }

        setTimeout(() => {
          setNftState(false);
          nextStage(nftCount);
          // nftCount <= 1 ? nextStage(-1) : nextStage(nftCount);
        }, 500);
      } catch {
        //
      }
    }
  };

  useEffect(() => {
    // startHandler();
    // setTimeout(()=>{startHandler();},2000);
    if (text != texts[0] || started == true) startHandler();
  }, [text]);

  useEffect(() => {
    setText(texts[stage]);
    if (stage == 2) {
      document.getElementById("errorFound").play();
    }
  }, [stage]);

  useEffect(() => {
    if (memoryText.current == text) {
      stopHandler();
      document.getElementById("textAudio").pause();
    }
  });
  useEffect(() => {
    document.getElementById("errorFound").volume = 0.2;
    document.getElementById("textAudio").volume = 0.1;
  }, []);

  return (
    <div>
      <div
        id="getStart"
        className="flex justify-center items-center w-full h-screen z-50 absolute bg-[#257cc9]"
      >
        <button
          className="w-[30%] hover:shadow hover:sepia"
          onClick={(e) => {
            e.target.parentElement.parentElement.style.display = "none";
            startHandler();
            setStarted(true);
            document.getElementById("textAudio").play();
          }}
        >
          <img src="assets/materials/start.png" />
        </button>
      </div>
      <div
        id="overlay"
        className="m-overlay h-screen w-full z-20"
        onClick={() => {
          if (stage != 1) nextStage();
        }}
      ></div>
      <div className="m-background h-screen w-full flex justify-center items-start">
        <img src={logo} className="w-28 mt-10 sm:w-40" alt="logo" />
      </div>
      <div className="h-screen w-full flex justify-start items-center">
        <div className="relative flex items-end justify-around m-robot">
          <img
            src={robot}
            className="w-[400px] sm:w-[400px]mb-20"
            alt="robot"
          />
          {(() => {
            if (stage == 3)
              return <img src={tick} alt="correct" className="absolute" />;
            if (stage == 2)
              return <img src={wrong} alt="correct" className="absolute" />;
          })()}
        </div>
      </div>
      <textarea
        readonly
        disabled
        className="m-text rounded-sm m-auto inset-x-0 bottom-0 h-1/5"
        value={animatedText}
      ></textarea>
      {loaded && stage == 2 ? (
        <a
          className="shadow w-[100px] sm:w-60 absolute z-30 bottom-0 inset-x-0 m-auto"
          href={magicedenlink}
        >
          <img
            src="https://static.wixstatic.com/media/08b2eb_cb1a45a8bb3a41fda62a306c7015ed8f~mv2.gif"
            alt="click here"
            className="hover:cursor-pointer"
          />
        </a>
      ) : (
        ""
      )}
      {(loaded && stage == 3) || stage == 4 ? (
        <Link
          className="shadow w-[100px] sm:w-60 absolute z-30 bottom-0 inset-x-0 m-auto"
          to={mazegamelink}
        >
          <img
            src="https://static.wixstatic.com/media/08b2eb_cb1a45a8bb3a41fda62a306c7015ed8f~mv2.gif"
            alt="click here"
            className="hover:cursor-pointer"
          />
        </Link>
      ) : (
        ""
      )}

      {stage == 1 && loaded ? (
        <div className="ml-[70%] w-[25%] sm:ml-[80%] sm:w-2/12 m-wallet flex justify-center flex-col z-30 float-right">
          <img src={phantomLogo} alt="phantom" />
          <button
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded "
            onClick={NftSearch}
          >
            {" "}
            {walletAddress == "null"
              ? "Check Your Nfts"
              : walletAddress.substring(0, 4) +
                "..." +
                walletAddress.substring(
                  walletAddress.length - 5,
                  walletAddress.length
                )}
          </button>
        </div>
      ) : (
        ""
      )}
      {nftLoading == true && stage == 1 ? (
        <div className="m-loading w-full h-screen z-50 flex flex-col justify-center content-center">
          <div className="text-center m-count"> {nfts} RFWs</div>
          <div>
            <img
              src="https://media.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif"
              alt="loading"
              width="100px"
              className="m-auto opacity-80"
            ></img>
          </div>
        </div>
      ) : (
        ""
      )}

      <audio
        id="textAudio"
        className="absolute z-40 hidden"
        src="/assets/Sounds/Textmoving.mp3"
        onEnded={audioEnded}
        controls
        hidden
      ></audio>

      <audio
        id="errorFound"
        className="absolute z-40 hidden"
        src="assets/Sounds/Error no RFW found.wav"
        onEnded={audioEnded}
        controls
        loop
        hidden
      ></audio>
    </div>
    //assets/sounds/textmoving.wav
  );
};
export default Home;
