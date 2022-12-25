import { useState, useEffect } from 'react';
import {ethers} from 'ethers';
import {Form, Button, Container, Modal} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import addressesJSON from '../shared/contractAddresses.json'
import SimpleAuctionJSON from '../shared/ABIs/SimpleAuction.json'


function AuctionCreateProductPage(props) {
    const [name,setName] = useState("");
    const [minimalPrice,setMinimalPrice] = useState(0);
    const [priceInUSD,setPriceInUSD] = useState(0);

    const [finishDate,setFinishDate] = useState(0);
    const [linkForMedia,setLinkForMedia] = useState("");
    //TODO: ADD PROPPER FIELD FOR SECRET DATA
    //CAUTION: SHOULD MAKE CHANGES IN THE CONTRACT (marketHashOfData bytes32-->bytes)
    //TODO: safety checks
    const [marketHashOfData, setMarketHashOfData] = useState("111");
    const [ rate, setRate ] = useState(0);
    const [show,setShow] = useState(false);
    const navigate = useNavigate();

    const simpleAuction= new ethers.Contract( addressesJSON.simpleAuction, SimpleAuctionJSON.abi , props.signer );
    
    useEffect(()=>{
        getRates();
    },[]);
    const getRates = async () => {
        try{
            //https://www.coingecko.com/api/documentations/v3#/simple/get_simple_price
            await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
                method: 'GET',

            })
            .then(async (response) => {
                let r = (await response.json()).ethereum.usd;
                setRate(r);
                return r;
            });
        }catch(e){
            console.log(e);
        }
    }
    const usdToWei = (usd) => {
        let eth = usd/rate;
        eth = parseFloat(eth).toFixed( 18 );

        return ethers.utils.parseEther(eth.toString());
    }

    async function submitProduct(){
        await getRates();
        setMinimalPrice(usdToWei(priceInUSD));
        setShow(true);
    }

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

    async function submitProduct(){
        await getRates();
        setMinimalPrice(usdToWei(priceInUSD));
        setShow(true);
    }
    return(
        <Container>
            <Modal show={show} onHide={()=>setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>{name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Price is {priceInUSD} (will remain to be {minimalPrice._hex} wei even in fluctuation of eth)
                    <img style={{width:'50%'}} src={linkForMedia} />
                    <h3>{finishDate}</h3>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={()=>setShow(false)}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={()=>{addProduct()}}>
                    Add product
                </Button>
                
                </Modal.Footer>
            </Modal>

            <h1>Create auction product</h1>
            <Form>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Name:</Form.Label>
                    <Form.Control onChange={e=>setName(e.target.value)} type="text" placeholder="Product name"/>
                </Form.Group>

                <Form.Group>
                    <Form.Label>Price in USD</Form.Label>
                    <Form.Control onChange={e=>{setPriceInUSD(e.target.value); setMinimalPrice(usdToWei(e.target.value));}} type="number" placeholder="Price in USD" />
                    <Form.Text className="text-muted">
                    I{minimalPrice._hex} in wei (powered by <a href='https://www.coingecko.com/'> Coingecko </a>)
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

                <Button variant="primary" onClick={submitProduct}>
                    Submit
                </Button>
                </Form>
        </Container>
    );
}

export default AuctionCreateProductPage