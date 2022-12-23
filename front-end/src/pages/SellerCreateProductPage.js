import { useState } from 'react';
import {ethers} from 'ethers';

import addressesJSON from '../shared/contractAddresses.json'
import SimpleSellerJSON from '../shared/ABIs/SimpleSeller.json'

import {Form, Button, Container} from 'react-bootstrap';

function SellerCreateProductPage(props) {
    const [name,setName] = useState("");
    const [price,setPrice] = useState(0);
    const [linkForMedia,setLinkForMedia] = useState("");
    const [marketHashOfData, setMarketHashOfData] = useState("111");
//https://www.wigglestatic.com/product-media/100375136/Brand-X-Road-Bike-Road-Bikes-Black-2017-BRNDXROADXL-0.jpg
    const simpleSeller= new ethers.Contract( addressesJSON.simpleSeller, SimpleSellerJSON.abi , props.signer );
    const addProduct = async () => {
        if(simpleSeller){
            try{
                const data  = await ethers.utils.solidityPack(["string"],[marketHashOfData]);
                await simpleSeller.addProduct(name,price,linkForMedia,await ethers.utils.keccak256(data));
                //TODO: navigate to list page
            }catch(e){
                console.log("Error:",e);
            }
        }
        // console.log(name,price,linkForMedia);
    }
    return(
        <Container>
            <h1>Create seller product</h1>
            <Form>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Name:</Form.Label>
                    <Form.Control onChange={e=>setName(e.target.value)} type="text" placeholder="Product name"/>
                </Form.Group>

                <Form.Group>
                    <Form.Label>Price in gwei</Form.Label>
                    <Form.Control onChange={e=>setPrice(e.target.value)} type="number" placeholder="Price in gwei" />
                    <Form.Text className="text-muted">
                    To usd?
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Media link</Form.Label>
                    <Form.Control onChange={e=>setLinkForMedia(e.target.value)} type="text" placeholder="Link for media" />
                </Form.Group>

                <Button variant="primary" onClick={addProduct}>
                    Submit
                </Button>
                </Form>
        </Container>
    );
}

export default SellerCreateProductPage