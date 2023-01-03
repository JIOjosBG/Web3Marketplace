import { useState, useEffect } from 'react';
import {Button, Container, Row, Card } from 'react-bootstrap';
import { ethers } from 'ethers';
import {Navigate, Link} from 'react-router-dom';

import addresses from '../shared/contractAddresses.json';
import simpleAuctionJSON from '../shared/ABIs/SimpleAuction.json';

function AuctionProductList(props) {

  const [count, setCount] = useState(0);
  const [products, setProducts] = useState([]);
  const simpleAuction = new ethers.Contract(addresses.simpleAuction, simpleAuctionJSON.abi, props.provider);
  
  useEffect(()=>{
    updateProducts();
  },[]);

  const updateProducts = async () => {
    let c =parseInt(await simpleAuction.productCount());
    console.log(c);
    let tmpProducts = [];
    for(let i=0;i<c;i++){
      let p = await simpleAuction.products(i);
      tmpProducts.push(p);
    }
    setProducts(tmpProducts);
    setCount(c);
  }
  //TODO: add contract event listener
  const productCards = products.map((p,i) =><AuctionProductCard key={i} product={p} id={i}/>);

  
  return (
    <>

{props.provider
      ?<Container>
      <Button onClick={updateProducts}>{count} products found; click to update</Button>
      <Link to="/a/c"><Button>Create product</Button></Link>
        <h1>Products for auction</h1>
        <Row>
          {productCards}
        </Row>
      </Container>
      :<Navigate to="/"/>  
      }
    </>
  );
}


function AuctionProductCard(props) {
  const p = props.product;  
  return (
    <Card style={{ width: '12rem' }}>
      <Card.Img variant="top" src={p.linkForMedia} />
      <Card.Body>
        <Card.Title>{p.name}</Card.Title>
        <Card.Text>
          Price: {parseInt(p.minimalPrice)}
          Seller: {p.seller}
          FinishDate: {new Date(parseInt(p.finishDate._hex)*1000).toString() }
          {p.approved ? "approved":""}
        
        </Card.Text>
        <Link to={`/a/${props.id}`}><Button variant="primary">Go to product detail</Button></Link>
      </Card.Body>
    </Card>
  );
}


export default AuctionProductList;