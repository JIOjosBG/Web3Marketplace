import React, {useState} from 'react';
 import {ethers} from 'ethers'; 

 import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Button } from 'react-bootstrap';
import {Routes,Route, Link} from 'react-router-dom';
import HomePage from './pages/HomePage';

import SimpleSellerListPage from './pages/SellerListPage';
import SimpleAuctionListPage from './pages/AuctionListPage';
import MyNavbar from './components/MyNavbar';


// import MyNav from './components/Navbar';

// import HomePage from './pages/HomePage';

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
  {account}
    <Routes>
      <Route path="/" element={<MyNavbar provider={provider} signer={signer} />}>
        <Route index element={<HomePage update/>} />
        <Route path="s" element={<SimpleSellerListPage provider={provider} signer={signer}/>} />
        <Route path="a" element={<SimpleAuctionListPage provider={provider} signer={signer}/>} />

      </Route>
    </Routes>

    { provider 
    ? 
    <>
    </>
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
