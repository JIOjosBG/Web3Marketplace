import { useState } from 'react';
import {ethers} from 'ethers';
import {Form, Button, Container} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import addressesJSON from '../shared/contractAddresses.json'
import SimpleAuctionJSON from '../shared/ABIs/SimpleAuction.json'


function AuctionCreateProductPage(props) {
    const [name,setName] = useState("");
    const [minimalPrice,setMinimalPrice] = useState(0);
    const [finishDate,setFinishDate] = useState(0);
    const [linkForMedia,setLinkForMedia] = useState("");
    const [marketHashOfData, setMarketHashOfData] = useState("111");
    const navigate = useNavigate();

    const simpleAuction= new ethers.Contract( addressesJSON.simpleAuction, SimpleAuctionJSON.abi , props.signer );
    const addProduct = async () => {
        if(simpleAuction){
            try{
                const date = Math.floor(new Date(finishDate)/1000);
                const data  = await ethers.utils.solidityPack(["string"],[marketHashOfData]);
                await simpleAuction.addProduct(name,minimalPrice,linkForMedia,await ethers.utils.keccak256(data),date);
                navigate("/a")
            }catch(e){
                console.log("Error:",e);
            }
        }
        // console.log(name,price,linkForMedia);
    }
    return(
        <Container>
            <h1>Create auction product</h1>
            <Form>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Name:</Form.Label>
                    <Form.Control onChange={e=>setName(e.target.value)} type="text" placeholder="Product name"/>
                </Form.Group>

                <Form.Group>
                    <Form.Label>Price in gwei</Form.Label>
                    <Form.Control onChange={e=>setMinimalPrice(e.target.value)} type="number" placeholder="Price in gwei" />
                    <Form.Text className="text-muted">
                    To usd?
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Finish date</Form.Label>
                    <Form.Control onChange={e=>setFinishDate(e.target.value)} type="date"/>
                    <Form.Text className="text-muted">
                    Date
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

export default AuctionCreateProductPage