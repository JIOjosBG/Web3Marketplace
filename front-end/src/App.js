import React, {useState} from 'react';
import MyNav from './components/Navbar';
import DisplayProducts from './components/DisplayProducts';
import {ethers} from 'ethers'; 
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [viewingContract, setViewingContract] = useState("");
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("Connect Wallet");

  function chnageState(contract){
    setViewingContract(contract);
  }

  const connectWallet = () => {
    if(window.ethereum){
      window.ethereum.request({method: 'eth_requestAccounts'})
      .then(result => {
        accountChangedHandler(result[0]);
      })
    }else{
      setError('Install metamask');
    }
  }

  const accountChangedHandler = (newAccount) => {
    console.log(newAccount+"asdasdasd");
    setAccount(newAccount);
    getUserBalance(newAccount.toString());
  }

  const getUserBalance = (address) => {
    window.ethereum.request({method:'eth_getBalance',params:[address,'latest']})
    .then(balance => {
      setBalance(ethers.utils.formatEther(balance));
    })
  }

  const chainChnageHandler = () =>{
    window.location.reload();
  }
  window.ethereum.on('accountsChanged',accountChangedHandler);
  window.ethereum.on('chainChanged',chainChnageHandler);

  return (
    <>
        <h1> {account} </h1>
      <h1> {balance} </h1>
      <h1> {error} </h1>
      <MyNav changeState={chnageState} contract={viewingContract}/>
      <DisplayProducts contract={viewingContract}/>
      <button onClick={connectWallet}>Connect</button>
      <script src="https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js" crossOrigin="true"></script>
      <script
        src="https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js"
        crossOrigin="true"></script>
      <script
        src="https://cdn.jsdelivr.net/npm/react-bootstrap@next/dist/react-bootstrap.min.js"
        crossOrigin="true"></script>
      <script>var Alert = ReactBootstrap.Alert;</script>
    </>
  );
}

export default App;
