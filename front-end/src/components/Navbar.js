// import React, { useState } from 'react';

import logo from '../media/logo.png'; // Tell webpack this JS file uses this image
import {Navbar,Container,Row,Col, Button} from 'react-bootstrap';
function MyNav(props) {

  return (
    <>

    <Navbar bg="light" expand="lg">
      <Container>
        <img style={{width:'30%'}}src={logo} alt={logo}/>
        <h1 className="ml">Username</h1>
        <Navbar.Toggle aria-controls="contracts-nav" />
        <Navbar.Collapse id="contracts-nav">
            <Row>
                <Col><Button onClick={()=>props.changeState("SimpleAuction")}>Simple Auction</Button></Col>
                <Col><Button onClick={()=>props.changeState("SimpleSeller")}>Simple Seller</Button></Col>
            </Row>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </>
  );
}

export default MyNav;
