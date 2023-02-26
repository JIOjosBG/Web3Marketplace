import { useState, useEffect } from 'react';
import {Button, Container, Row, Col, Card} from 'react-bootstrap';
import { ethers } from 'ethers';
import {Navigate, Link} from 'react-router-dom';

import addresses from '../shared/contractAddresses.json';
import simpleSellerJSON from '../shared/ABIs/SimpleSeller.json';

import "../css/card.css";

function SellerProductList(props) {
  const [count, setCount] = useState(0);
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
    setCount(c);
  }
  const productCards = products.map((p) =>
    <Col key={p[1]} className="h-25" md={3} style={{margin:'auto', marginTop:10}}>
      <SellerProductCard product={p[0]} id={p[1]}
      />
    </Col>
  );
  
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  };
  return (
    <>

      {props.provider
        ?<Container className='mt-1'>
        <Button variant='secondary' onClick={updateProducts}>Update</Button>{' '}
        <Link to="/s/c"><Button variant='secondary'> Create product</Button></Link>
          <h1>Products for sale</h1>
          <Row  style={containerStyle}>
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
    <Link to={`/s/${props.id}`} style={{textDecoration: 'none', color: 'black'}}>
    <Card className="itemCard">
      <Card.Img src={p.linkForMedia} />
      <Card.Body>
        <Card.Title>{p.name}</Card.Title>
        <Card.Text>
          {Number(ethers.utils.formatUnits(p.price._hex, "ether")).toFixed(5).toString()}AGR
          <br/>
          {p.approved ? "approved":""}
        </Card.Text>
      </Card.Body>
    </Card>
    </Link>
  );
}



export default SellerProductList;
 