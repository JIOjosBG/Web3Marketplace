// import { useState } from 'react';
import {Button, Container, Card} from 'react-bootstrap';


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

export default SellerProductCard;
