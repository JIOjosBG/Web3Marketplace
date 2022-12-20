// import React, { useState } from 'react';

import logo from '../media/logo.png'; // Tell webpack this JS file uses this image
import {Navbar,Container} from 'react-bootstrap';
function MyNav() {

  return (
    <>

    <Navbar bg="light" expand="lg">
      <Container>
        <img style={{width:'30%'}}src={logo} alt={logo}/>
        <h1 className="ml">Username</h1>
        <Navbar.Toggle aria-controls="asd-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <h1>Simple Seller</h1>
          <h1>Simple Auction</h1>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </>
  );
}

export default MyNav;
