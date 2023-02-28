import { useState, useEffect } from 'react';
import {Button, Container, Row, Col, Card } from 'react-bootstrap';
import { ethers } from 'ethers';
import {Navigate, Link} from 'react-router-dom';

import addresses from '../shared/contractAddresses.json';
import simpleAuctionJSON from '../shared/ABIs/SimpleAuction.json';
import checkedGIF from "../media/approved.gif";


import "../css/card.css";

function AuctionProductList(props) {
  const [products, setProducts] = useState([]);
  const simpleAuction = new ethers.Contract(addresses.simpleAuction, simpleAuctionJSON.abi, props.provider);
  
  useEffect(()=>{
    simpleAuction.on("auctionProductAdded", updateProducts);  
    updateProducts();
    return ()=>{
      simpleAuction.removeListener("auctionProductAdded", updateProducts);
    }
  },[]);

  async function updateProducts(){
    let c =parseInt(await simpleAuction.productCount());
    
    let tmpProducts = [];
    for(let i=0;i<c;i++){
      let p = await simpleAuction.products(i);
      tmpProducts.push([p,i]);
    }
    setProducts(tmpProducts);
  }
  

  const productCards = products.map((p) =>
  <Col key={p[1]} md={3}>
    <AuctionProductCard className="mt-3" product={p[0]} id={p[1]}
    />
  </Col>
);


const containerStyle = {
  display: 'flex',
  height: '90vh',
};
return (
  <>

    {props.provider
      ?<Container className='mt-1'>
      <Button variant='secondary' onClick={updateProducts}>Update</Button>{' '}
      <Link to="/a/c"><Button variant='secondary'> Create product</Button></Link>
        <h1>Products for auction</h1>
        <Row  style={containerStyle}>
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
  let price;
  if(p.bidAmount==0){
    price=p.minimalPrice
  }else{
    price=p.bidAmount;
  }

  return (
    <Card className="itemCard">
        <Link to={`/a/${props.id}`} style={{textDecoration: 'none', color: 'black'}}>
        <Card.Img className="h-100" src={p.linkForMedia} />
        <Card.Body>
          <Card.Title>{p.name}</Card.Title>
          <Card.Text>
            { Number(ethers.utils.formatUnits(price, "ether")).toFixed(5).toString()}AGR
            <br/>
          </Card.Text>
          {p.approved 
          ?<img style={{height:35}} src={checkedGIF}/> 
          :""}
        </Card.Body>
    </Link>
      </Card>
  );
}


export default AuctionProductList;