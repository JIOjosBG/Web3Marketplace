import { useState, useEffect } from 'react';
import {Button, Container, Row, Col, Card} from 'react-bootstrap';
import { ethers } from 'ethers';
import {Navigate, Link} from 'react-router-dom';

import addresses from '../shared/contractAddresses.json';
import simpleSellerJSON from '../shared/ABIs/SimpleSeller.json';

function SellerProductList(props) {
  const [count, setCount] = useState(0);
  const [products, setProducts] = useState([]);
  
  const simpleSeller = new ethers.Contract(
    addresses.simpleSeller, 
    simpleSellerJSON.abi, 
    props.provider
  );
  simpleSeller.on("sellerProductAdded", updateProducts);
  
  useEffect(()=>{
    updateProducts();
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
    <Col className="h-25" md={3} style={{margin:'auto', marginTop:10}}>
      <SellerProductCard
        key={p[1]} product={p[0]} id={p[1]}
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
    <Card>
      <Card.Img variant="top" src={p.linkForMedia} />
      <Card.Body>
        <Card.Title>{p.name}</Card.Title>
        <Card.Text>
          <p>{ Number(ethers.utils.formatUnits(p.price._hex, "ether")).toFixed(5)}AGR</p>
          {p.approved ? "approved":""}
        </Card.Text>
      </Card.Body>
    </Card>
    </Link>
  );
}



export default SellerProductList;
 