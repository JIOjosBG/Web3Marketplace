import React, {useState} from 'react';
 import {ethers} from 'ethers'; 

 import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

import MyNavbar from './components/MyNavbar';
import SimpleSellerRoutes from './Routers/SimpleSellerRoutes';
import SimpleAuctionRoutes from './Routers/SimpleAuctionRoutes';
import BuyTokensPage from './pages/BuyTokensPage';
import AdminPage from './pages/AdminPage';


function App() {
  const [errorMessage, setErrorMessage] = useState("");
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  

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
    { account && provider
    ? 
    <Routes>
      <Route path="/" element={<MyNavbar provider={provider} account={account} />}>
        <Route index element={<HomePage update/>} />
        <Route path="s/*" element={<SimpleSellerRoutes provider={provider} signer={signer}/>} />
        <Route path="a/*" element={<SimpleAuctionRoutes provider={provider} signer={signer}/>} />
        <Route path="t/" element={<BuyTokensPage provider={provider} signer={signer}/>} />
        <Route path="admin/" element={<AdminPage provider={provider} signer={signer}/>} />
        
        <Route path="*" element={<h1>404 not found</h1>} />
      </Route>
    </Routes>
    :<Button onClick={connectWalletHandler}>Connect</Button>
    }
    

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
