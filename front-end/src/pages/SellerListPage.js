import { useState } from 'react';
import {Button, Container, Row, Card} from 'react-bootstrap';
import { ethers } from 'ethers';
import {Navigate} from 'react-router-dom';

import addresses from '../shared/contractAddresses.json';
import simpleSellerJSON from '../shared/ABIs/SimpleSeller.json';
import productsJSON from '../shared/dummyData/simpleSellerProducts.json';

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
    setCount(c);
  }

  const productCards = products.map((p,i) =><SellerProductCard key={i} product={p}/>);

  return (
    <>
      
      {props.provider
      ?<Container>
      <Button onClick={updateProducts}>{count} products found; click to update</Button>
        <h1>Products for seller</h1>
        <Row>
          {productCards}
        </Row>
      </Container>
      :<Navigate to="/"/>  
      }
    </>
  );
}


function SellerProductCard(props) {
  const p = props.product;  
  return (
    <Card style={{ width: '12rem' }}>
      <Card.Img variant="top" src={p.linkForMedia} />
      <Card.Body>
        <Card.Title>{p.name}</Card.Title>
        <Card.Text>
          Price: {parseInt(p.price)}
          Seller: {p.seller}
          {p.approved ? "approved":""}
        </Card.Text>
        <Button variant="primary">Go to product detail</Button>
      </Card.Body>
    </Card>
  );
}



export default SellerProductList;
 