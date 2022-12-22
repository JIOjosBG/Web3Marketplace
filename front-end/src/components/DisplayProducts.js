// import React, { useState } from 'react';
import {Navbar,Container} from 'react-bootstrap';
import SellerProductList from './ProductDisplays/simpleSeller/sellerProductList';
import AuctionProductList from './ProductDisplays/simpleAuction/auctionProductList';

function DisplayProducts(props) {

  return (
    <>

    <Navbar bg="light" expand="lg">
      <Container>
        {console.log(props.contracts)}
        {props.contract==="" ? <h1>wow such empty</h1>: <></> }
        {props.contract==="SimpleSeller" ? <SellerProductList provider={props.provider} signer={props.signer} /> : <></> }
        {props.contract==="SimpleAuction" ? <AuctionProductList provider={props.provider} signer={props.signer}  /> : <></> }

      </Container>
    </Navbar>
    </>
  );
}

export default DisplayProducts;
