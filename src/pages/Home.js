import robot from "../assests/image/Robot A.png";
import logo from "../assests/image/rfwlogo.png";
import phantomLogo from "../assests/image/Phantom wallet Logo.png";
import tick from "../assests/image/tick-mark-icon.png";
import wrong from "../assests/image/incorrect-icon.png";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
// import { useMoralisSolanaApi } from "react-moralis";

const Home = () => {
  const texts = [
    "Hello Pilots! \nMy name is Force of Rendition, and I’m an Intelligence Robot assigned to you by Admiral Miltron to help you burn your Gen 1 Robots and obtain in exchange a Fusion Core! If you are deemed worthy of course…",
    "First let’s check you are holding the correct NFTs! \nPlease connect your Solana Wallet so we can verify ownership..",
    "ERROR! No RFW Gen. 1 Robots found. \nPlease go to Magic Eden and get at least 2 RFW robots",
    "SUCCESS! Two or more RFW Gen. \nWelcome to our burning facility! Please find your way through the Maze in order to get to the Lab! We will be waiting.",
    "You are as we once were, suitless. Robotless. Find your way through the maze in your mind to achieve enlightenment.",
  ];

  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState(0);
  const [text, setText] = useState(texts[0]);
  const [loop, setLoop] = useState(null);
  const [animatedText, setAnimatedText] = useState("");
  const [walletAddress, setAddress] = useState("null");
  const [nfts, setNft] = useState(0);
  const [nftLoading, setNftState] = useState(false);
  // const SolanaApi = useMoralisSolanaApi();

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
      if (stage == 0) setStage(1);
      else if (stage == 1) {
        nftCount >= 2 ? setStage(3) : setStage(2);
      } else if (stage >= 3) setStage(4);
    }, 2000);
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      try {
        const response = await solana.connect();
        setAddress(response.publicKey.toString());
        return true;
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
        return false;
      }
    } else {
      window.open("https://phantom.app");
    }
  };
  const NftSearch = async () => {
    // stopHandler();
    const res = await connectWallet();
    let nftCount = 0;
    if (res == true) {
      setNftState(true);
      const options_collection = {
        method: "GET",
        url: `https://solana-gateway.moralis.io/account/mainnet/${"6XScQy88Aep5GBuvnhHjPRss15kgPD8CX8QNn6fSQiD6"}/nft`,
        headers: {
          Accept: "application/json",
          "X-API-Key":
            "uhNYQMJcvBHjgJOrA4gltbODqDTdQUnjdzEpL9IKSqL4ImoLCgPUBgET7GIhVkx1",
        },
      };
      try {
        const result = await axios.request(options_collection);
        for (const collection of result.data) {
          const options_metadata = {
            method: "GET",
            url: `https://solana-gateway.moralis.io/nft/mainnet/${collection.mint}/metadata`,
            headers: {
              Accept: "application/json",
              "X-API-Key":
                "uhNYQMJcvBHjgJOrA4gltbODqDTdQUnjdzEpL9IKSqL4ImoLCgPUBgET7GIhVkx1",
            },
          };
          try {
            const res = await axios.request(options_metadata);
            if (res.data.symbol == "RFW") {
              nftCount++;
              setNft(nftCount);
            }
            if (nftCount >= 2) {
              break;
            }
            console.log(collection.mint, res.data.symbol);
          } catch {
            //
          }
        }
        setTimeout(() => {
          setNftState(false);
          console.log(stage);
          nextStage(nftCount);
        }, 500);
      } catch {
        //
      }
    }
  };
  useEffect(() => {
    // startHandler();
    // setTimeout(()=>{startHandler();},2000);
    startHandler();
  }, [text]);

  useEffect(() => {
    setText(texts[stage]);
  }, [stage]);

  useEffect(() => {
    if (memoryText.current == text) stopHandler();
  });

  return (
    <>
      <div
        id="overlay"
        className="m-overlay h-screen w-full z-20"
        onClick={nextStage}
      ></div>
      <div className="m-background h-screen w-full flex justify-center items-start">
        <img src={logo} className="w-28 mt-10 sm:w-40" alt="logo" />
      </div>
      <div className="h-screen w-full flex justify-start items-center">
        <div>
          <img
            src={robot}
            className="w-30 sm:w-[600px] m-robot mb-20"
            alt="robot"
          />
        </div>
      </div>
      <textarea
        readonly
        disabled
        className="m-text rounded-sm m-auto inset-x-0 bottom-0 h-1/5"
        value={animatedText}
      ></textarea>
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
    </>
  );
};
export default Home;
