import { useState, useEffect } from 'react';
import {Button, Container, Row, Col, Card} from 'react-bootstrap';
import { ethers } from 'ethers';
import {Navigate, Link} from 'react-router-dom';

import addresses from '../shared/contractAddresses.json';
import simpleSellerJSON from '../shared/ABIs/SimpleSeller.json';
import checkedGIF from "../media/approved.gif";

import "../css/card.css";

function SellerProductList(props) {
  const [products, setProducts] = useState([]);
  
  const simpleSeller = new ethers.Contract(
    addresses.simpleSeller, 
    simpleSellerJSON.abi, 
    props.provider
  );
  
  useEffect(()=>{
    simpleSeller.on("sellerProductAdded", updateProducts);
    updateProducts();
    return ()=>{
      simpleSeller.removeListener("sellerProductAdded", updateProducts);
    }
  },[]);
  
  async function updateProducts (){
    let c =parseInt(await simpleSeller.productCount());

    let tmpProducts = [];
    for(let i=0;i<c;i++){
      let p = await simpleSeller.products(i);
      tmpProducts.push([p,i]);
    }
    setProducts(tmpProducts);
  }
  const productCards = products.map((p) =>
    <Col key={p[1]} md={3} >
      <SellerProductCard className="mt-3" product={p[0]} id={p[1]}/>
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
        <Link to="/s/c"><Button variant='secondary'> Create product</Button></Link>
          <h1>Products for sale</h1>
          <Row style={containerStyle}>
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
    <Card className="itemCard">
      <Link to={`/s/${props.id}`} style={{textDecoration: 'none', color: 'black'}}>
      <Card.Img className="h-50" src={p.linkForMedia} />
      <Card.Body>
        <Card.Title>{p.name}</Card.Title>
        <Card.Text>
          {Number(ethers.utils.formatUnits(p.price._hex, "ether")).toFixed(5).toString()}AGR
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



export default SellerProductList;
 