import './styles/App.css';
import React, { useEffect } from "react";
import { useState } from 'react';
import { ethers } from "ethers";
import generateNFT from "./utils/GenerateNFT.json";
import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';
import UnstyledInputBasic from './components/customInput';
import { ConstructorFragment } from 'ethers/lib/utils';

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [typeOfPerson, setTypeOfPerson] = useState("");

  function handleNameChange(props) {
    const {value} = props.target.value;
    setName(value);
  }

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have Metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
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
      console.log("Connected", accounts[0]);

      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMintNFT = async () => {
    const CONTRACT_ADDRESS = "0x4eE0aa65Baa6adCFC0b089E669FBa189D7bd4D65";

    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        generateNFT.abi,
        signer
      );
      console.log("Going to pop wallet now to pay gas...");
      let nftTxn = await connectedContract.generateNFT();
      console.log("Mining...please wait.");
      await nftTxn.wait();

      console.log(
        `Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`
      );
    } catch (error) {
      console.log(error);
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
          <p className="header gradient-text">Love Letter Generative NFT Collection</p>
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
                    <p>What kind of person would you like to receive a love letter from?</p>
                    <UnstyledInputBasic/>
                  </div>
                  <div>
                    <RedBar />
                    <p>What is Your Name?</p>
                    <TextField
                      className='parameter'
                      required
                      id="outlined-required"
                      label="Required"
                      value={name}
                      onChange={handleNameChange}
                    />
                  </div>
                </Box>
                <RedBar />
                <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
                  Mint Letter
                </button>
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