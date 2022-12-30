// import React, { useState } from 'react';

import logo from '../media/logo.png'; // Tell webpack this JS file uses this image
import {Navbar,Container,Row, Col} from 'react-bootstrap';
import {Link, Outlet} from 'react-router-dom';

function MyNavbar(props) {
  let provider=props.provider;
  return (
    <>

    <Navbar bg="light" expand="lg">
      <Container>
        <Row>
          <Col>
          <img style={{width:'50%'}} src={logo} alt={logo}/>
          </Col>
          <Col>
          <h6 className="ml">{props.account}</h6>
          </Col>
        </Row>
        {provider
          ?<>
            <Col>
              <Link to="/s">Simple Seller </Link>
              <Link to="/a">Simple Auction </Link>
            </Col>
            <Col>
              <Link to="/t"> Buy tokens </Link>
            {/* TODO: add available tokens display */}
            </Col>
          </>
          :<></>
        }
      </Container>
    </Navbar> 
    <Outlet/>
   
    </>
  );
}

export default MyNavbar;
