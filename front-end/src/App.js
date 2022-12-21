import React, {useState} from 'react';
import MyNav from './components/Navbar';
import DisplayProducts from './components/DisplayProducts';
import {ethers} from 'ethers'; 
import {Button} from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [viewingContract, setViewingContract] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  
  function chnageState(contract){
    setViewingContract(contract);
  }

  const connectWalletHandler=() => {
    if(window.ethereum){
      window.ethereum.request({method:'eth_requestAccounts'})
      .then(result=>{
        accountChangedHandler(result[0])
      })
    }else{
      setErrorMessage("Install metamask")
    }
  }

  const accountChangedHandler = (newAccount) => {
    setAccount(newAccount);
    updateEthers();

  }

  const chainChangedHandler = () => {
		window.location.reload();
	}

	window.ethereum.on('accountsChanged', accountChangedHandler);
	window.ethereum.on('chainChanged', chainChangedHandler);

  const updateEthers = () => {
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(tempProvider);
    let tempSigner = tempProvider.getSigner();
    setSigner(tempSigner);


  }

  return (
  <>
    {errorMessage}
    {account}

    <MyNav changeState={chnageState} contract={viewingContract}/>
    <DisplayProducts contract={viewingContract} provider={provider} signer={signer}/>
    <Button onClick={connectWalletHandler}>Connect</Button>



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
