import { useState } from 'react';
import {Button, Container, Row} from 'react-bootstrap';
import { ethers } from 'ethers';

import addresses from '../../../shared/contractAddresses.json';
import simpleSellerJSON from '../../../shared/ABIs/SimpleSeller.json';
import productsJSON from '../dummyData/simpleSellerProducts.json';
import SellerProductCard from './sellerProductCard';

function SellerProductList(props) {
  const [count, setCount] = useState(0);
  const [products, setProducts] = useState(productsJSON.products);
  const simpleSeller = new ethers.Contract(addresses.simpleSeller, simpleSellerJSON.abi, props.provider);
  
  const updateProducts = async () => {
    let c =parseInt(await simpleSeller.productCount());
    console.log(c);
    let tmpProducts = [];
    for(let i=0;i<c;i++){
      let p = await simpleSeller.products();
      tmpProducts.push(p);
    }
    // TO ADD AFTER TESTING WITH DUMMY DATA
    // setProducts(tmpProducts);
    setProducts(productsJSON.products);
    setCount(c);
  }

  const productCards = products.map((p) =>
    <SellerProductCard product={p}/>
  );
  return (
    <>

      <Container>
        <Row>
          <Button onClick={updateProducts}>{count} products found</Button>
        </Row>
        <Row>
          {productCards}
        </Row>
      </Container>
    </>
  );
}

export default SellerProductList;
