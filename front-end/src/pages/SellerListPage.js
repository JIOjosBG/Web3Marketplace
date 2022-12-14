import { useState, useEffect } from 'react';
import {Button, Container, Row, Card} from 'react-bootstrap';
import { ethers } from 'ethers';
import {Navigate, Link} from 'react-router-dom';

import addresses from '../shared/contractAddresses.json';
import simpleSellerJSON from '../shared/ABIs/SimpleSeller.json';

function SellerProductList(props) {
  const [count, setCount] = useState(0);
  //const [products, setProducts] = useState(productsJSON.products);
  const [products, setProducts] = useState([]);
  useEffect(()=>{
    updateProducts();
  },[]);
  const simpleSeller = new ethers.Contract(addresses.simpleSeller, simpleSellerJSON.abi, props.provider);
  async function updateProducts (){
    let c =parseInt(await simpleSeller.productCount());

    let tmpProducts = [];
    for(let i=0;i<c;i++){
      let p = await simpleSeller.products(i);
      tmpProducts.push([p,i]);
    }
    setProducts(tmpProducts);
    setCount(c);
  }

  //TODO: add contract event listener


  const productCards = products.map((p) =><SellerProductCard key={p[1]} product={p[0]} id={p[1]}/>);

  return (
    <>
      
      {props.provider
      ?<Container>
      <Button onClick={updateProducts}>{count} products found; click to update</Button>
      <Link to="/s/c"><Button> Create product</Button></Link>
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
        <Link to={`/s/${props.id}`}>
          <Button variant="primary">Go to product detail</Button>
        </Link>
      </Card.Body>
    </Card>
  );
}



export default SellerProductList;
 