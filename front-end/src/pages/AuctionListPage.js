import { useState } from 'react';
import {Button, Container } from 'react-bootstrap';
import { ethers } from 'ethers';
import {Navigate} from 'react-router-dom';

import addresses from '../shared/contractAddresses.json';
import simpleAuctionJSON from '../shared/ABIs/SimpleAuction.json';

function AuctionProductList(props) {

  const [count, setCount] = useState(0);
  const [products, setProducts] = useState(null);
  const simpleAuction = new ethers.Contract(addresses.simpleAuction, simpleAuctionJSON.abi, props.provider);
  
  const updateProducts = async () => {
    let c =parseInt(await simpleAuction.productCount());
    console.log(c);
    let tmpProducts = [];
    for(let i=0;i<c;i++){
      let p = await simpleAuction.products();
      tmpProducts.push(p);
    }
    // TO ADD AFTER TESTING WITH DUMMY DATA
    // setProducts(tmpProducts);
    setCount(c);
  }
  
  return (
    <>

{props.provider
      ?<Container>
      <Button onClick={updateProducts}>{count} products found; click to update</Button>
        <h1>Products for auction</h1>
      </Container>
      :<Navigate to="/"/>  
      }
    </>
  );
}

export default AuctionProductList;