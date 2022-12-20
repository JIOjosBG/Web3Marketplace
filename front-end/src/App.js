import React from 'react';
import MyNav from './components/Navbar';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  return (
    <>
      <MyNav/>
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
