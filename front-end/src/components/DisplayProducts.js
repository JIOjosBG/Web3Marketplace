// import React, { useState } from 'react';
import {Navbar,Container} from 'react-bootstrap';
import SimpleAuctionProducts from './ProductDisplays/SimpleAuctionProducts';
import SimpleSellerProducts from './ProductDisplays/SimpleSellerProducts';

function DisplayProducts(props) {

  return (
    <>

    <Navbar bg="light" expand="lg">
      <Container>
        {console.log(props.contracts)}
        {props.contract==="" ? <h1>wow such empty</h1>: <></> }
        {props.contract==="SimpleSeller" ? <SimpleSellerProducts/> : <></> }
        {props.contract==="SimpleAuction" ? <SimpleAuctionProducts/> : <></> }

      </Container>
    </Navbar>
    </>
  );
}

export default DisplayProducts;
