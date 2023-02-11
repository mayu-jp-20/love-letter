import './styles/App.css';
import React, { useEffect } from "react";
import { useState } from 'react';
import { ethers } from "ethers";
import generateNFT from "./utils/GenerateNFT.json";
import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';
import { TextareaAutosize } from '@mui/material';
import axios from 'axios';

const key = process.env.REACT_APP_OPENAI_API_KEY

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [toName, setToName] = useState("");
  const [fromName, setFromName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Make sure you have Metamask!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
    } else {
      alert("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);

    } catch (error) {
      alert("error,Please try again");
    }
  }

  const askContractToMintNFT = async (toName, fromName, description, currentAccount) => {
    const CONTRACT_ADDRESS = "0x44BDa4A952Af2D7dd32be58f3bb19a448D43d242";

    toName = toName.toName;
    fromName = fromName.fromName;
    description = description.description;

    const payload = {
      prompt: "次の条件でラブレターを書いてください。文字数は絶対に800字以上1000字未満にしてください"+
        `宛名：${toName} `+
        `差出人：${fromName} `+
        `２人の思い出や今後どうなりたいかなど：${description} `+
        "文字数：1000文字以上1500字以内 "+
        "1文50字以内",
      max_tokens: 1500,
      temperature: 0.5,
      n: 1,
      model: "text-davinci-003"
    }

    let sentense="";
    console.log("key:",key);

    try {
      setMessage('Writing love letter. It may take about 1min... please wait until metamask window show up.')
      axios({
        method: "POST",
        url: "https://api.openai.com/v1/completions",
        data: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: key
        }
      })
        .then((res) => {
          sentense = String(res.data.choices[0].text);
          let customWord = sentense.split('.').join('.</tspan><tspan x="0" dy="1.2em">')
          customWord = customWord.split('。').join('.</tspan><tspan x="0" dy="1.2em">')

          const { ethereum } = window;
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            generateNFT.abi,
            signer
          );
        
          connectedContract.generateNFT(customWord)
          .then((res) => {
            setMessage(`Check transaction: https://goerli.etherscan.io/tx/${res.hash}`)
          });
        
        })
        .catch(error => {
          alert("error. Please try again.");
        })


    } catch (error) {
      alert("error, Please try again");
    }
  }

  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );



  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="sub-text">
            Mint Valentine Day's Love Letter NFT💕
          </p>
          <p className="header gradient-text">Love Letter Generative NFT</p>
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : (
              <div>
                <Box component="form" sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                  noValidate
                  autoComplete="off">
                  <div>
                    <RedBar />
                    <p>宛名（To）</p>
                    <TextField
                      className='parameter'
                      id="outlined-required"
                      value={toName}
                      onChange={(e) => {
                        setToName(e.target.value)
                      }}
                    />
                  </div>
                  <div>
                    <RedBar />
                    <p>差出人（From）</p>
                    <TextField
                      className='parameter'
                      id="outlined-required"
                      value={fromName}
                      onChange={(e) => {
                        setFromName(e.target.value)
                      }}
                    />
                  </div>
                  <div>
                    <RedBar />
                    <p>２人の思い出や今後どうなりたいかなど。細かく書くほど感動的なラブレターができます</p>
                    <p>（Memories of between of two and what you want for the future,etc）</p>
                    <TextareaAutosize
                      aria-label="empty textarea"
                      placeholder="Empty"
                      style={{ width: 200 }}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value)
                      }}
                    />
                  </div>
                </Box>
                <RedBar />
                <button onClick={() => {
                  askContractToMintNFT({ toName }, { fromName }, { description }, { currentAccount })
                }
                } className="cta-button connect-wallet-button">
                  Mint Letter
                </button>
                <RedBar/>
                <p>{message}</p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default App;


function RedBar() {
  return (
    <Box
      sx={{
        height: 50,
      }}
    />
  );
}