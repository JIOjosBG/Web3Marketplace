import React, {useState} from 'react';
import MyNav from './components/Navbar';
import DisplayProducts from './components/DisplayProducts';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [viewingContract, setViewingContract] = useState("");

  function chnageState(contract){
    setViewingContract(contract);
    console.log(contract);
  }


  return (
    <>
      <MyNav changeState={chnageState} contract={viewingContract}/>
      <DisplayProducts contract={viewingContract}/>
      
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
