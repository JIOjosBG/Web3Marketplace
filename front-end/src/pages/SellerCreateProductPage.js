import { useState, useEffect } from 'react';
import {ethers} from 'ethers';

import addressesJSON from '../shared/contractAddresses.json'
import SimpleSellerJSON from '../shared/ABIs/SimpleSeller.json'

import {Form, Button, Container,Modal} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function SellerCreateProductPage(props) {
    const [name,setName] = useState("");
    const [price,setPrice] = useState(0);
    const [priceInUSD,setPriceInUSD] = useState(0);
    const [linkForMedia,setLinkForMedia] = useState("");
    const [ rate, setRate ] = useState(0);
    const [show,setShow] = useState(false);

    //TODO: ADD PROPPER FIELD FOR SECRET DATA
    //CAUTION: SHOULD MAKE CHANGES IN THE CONTRACT (marketHashOfData bytes32-->bytes)
    const [marketHashOfData, setMarketHashOfData] = useState("");
    const navigate = useNavigate();
    const simpleSeller= new ethers.Contract( addressesJSON.simpleSeller, SimpleSellerJSON.abi , props.signer );
    
    useEffect(()=>{
        getRates();
    },[]);

    const addProduct = async () => {
        if(simpleSeller){
            try{
                let data  = await ethers.utils.solidityPack(["string"],[marketHashOfData]);
                data = await ethers.utils.keccak256(data);
                console.log(data)
    
                await simpleSeller.addProduct(name,price,linkForMedia,data);
                navigate("/s");
            }catch(e){
                console.log("Error:",e);
            }
        }
        // console.log(name,price,linkForMedia);
    }


    const getRates = async () => {
        try{
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
        setPrice(usdToWei(priceInUSD));
        setShow(true);
    }
    


    return(
        <Container>
            <h1>Create seller product</h1>
            <Modal show={show} onHide={()=>setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>{name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Price is {priceInUSD} (will remain to be {price._hex} wei even in fluctuation of eth)
                    <img style={{width:'50%'}} src={linkForMedia} />
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
            <Form>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Name:</Form.Label>
                    <Form.Control onChange={e=>setName(e.target.value)} type="text" placeholder="Product name"/>
                </Form.Group>

                <Form.Group>
                    <Form.Label>Price in usd</Form.Label>
                    <Form.Control onChange={e=>{setPriceInUSD(e.target.value); setPrice(usdToWei(e.target.value));}} type="number" placeholder="Price in usd" />
                    <Form.Text className="text-muted">
                    {price._hex} in wei (powered by <a href='https://www.coingecko.com/'> Coingecko </a>)
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Media link</Form.Label>
                    <Form.Control onChange={e=>setLinkForMedia(e.target.value)} type="text" placeholder="Link for media" />
                </Form.Group>

                <Form.Group>
                    <Form.Label>Markte hash of data</Form.Label>
                    <Form.Control onChange={e=>setMarketHashOfData(e.target.value)} type="text" placeholder="Market hash of data" />
                </Form.Group>

                <Button variant="primary" onClick={()=>submitProduct()}>
                    Submit
                </Button>
                </Form>
        </Container>
    );
}

export default SellerCreateProductPage