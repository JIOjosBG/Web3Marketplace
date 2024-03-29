import { useState, useEffect } from 'react';
import {ethers} from 'ethers';
import {Form, Button, Container, Modal} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EthCrypto from 'eth-crypto';

import addressesJSON from '../shared/contractAddresses.json'
import SimpleAuctionJSON from '../shared/ABIs/SimpleAuction.json'
import marketplaceJSON from '../shared/ABIs/Marketplace.json'

import {usdToWei, hexToBytes} from '../utils/convertion'
import {getRates} from '../utils/apiCalls'
import {encryptWithPublicKey} from '../utils/encrypt';
//TODO: convert all hex wei price values to decimal eth
function AuctionCreateProductPage(props) {
    const [name,setName] = useState("");
    const [minimalPrice,setMinimalPrice] = useState(0);
    const [priceInUSD,setPriceInUSD] = useState(0);
    const [publicKey,setPublicKey] = useState("");
    const [file,setFile] = useState();
    const [finishDate,setFinishDate] = useState(0);
    const [finishTime,setFinishTime] = useState(0);

    const [linkForMedia,setLinkForMedia] = useState("");
    //CAUTION: SHOULD MAKE CHANGES IN THE CONTRACT (marketHashOfData bytes32-->bytes)
    //TODO: safety checks
    const [marketHashOfData, setMarketHashOfData] = useState();
    const [ rate, setRate ] = useState(0);
    const [show,setShow] = useState(false);
    const navigate = useNavigate();

    const simpleAuction = new ethers.Contract( addressesJSON.simpleAuction, SimpleAuctionJSON.abi , props.signer );
    const marketplace = new ethers.Contract( addressesJSON.marketplace, marketplaceJSON.abi , props.provider );
    
    useEffect(()=>{
        getRates()
        .then(r=>setRate(r))

        marketplace.publicKey()
        .then(pk => {
            setPublicKey(hexToBytes(pk))
        })
    },[]);


    async function submitProduct(){
        const formData = new FormData();
        if(file==null) return
        formData.append("image", file);

        const response = await axios({
            method: "post",
            url: "http://localhost:5000/i",
            data: formData,
            headers: { "Content-Type": "multipart/form-data" },
        });
        setLinkForMedia("http://localhost:5000"+response.data.pathToImage);
        await getRates();
        setMinimalPrice(usdToWei(priceInUSD,rate));
        setShow(true);
    }

    const addProduct = async () => {
        if(simpleAuction){
            try{
                let date = Math.floor(new Date(finishDate)/1000);
                const offset = new Date().getTimezoneOffset()
                date+=offset*60;
                if(finishTime){
                    date+=parseInt(finishTime.substr(0,2)*3600+finishTime.substr(3,5)*60)
                }

                //TODO: check if exists marketHashOfData
                let data  = await ethers.utils.solidityPack(["string"],[marketHashOfData]);
                data = hexToBytes(data);
                data = await encryptWithPublicKey(data,publicKey)
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
            <Modal show={show} onHide={()=>setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>{name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h3>{minimalPrice
                        ?ethers.utils.formatUnits(minimalPrice._hex,"ether")
                        :0
                    } AGR</h3>
                    <p>Currently ${priceInUSD}</p>
                    
                    <img className="w-100" src={linkForMedia} />
                    <h3>Finish date: {finishDate}</h3>
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
                    <Form.Control onChange={e=>{setPriceInUSD(e.target.value); setMinimalPrice(usdToWei(e.target.value,rate));}} type="number" placeholder="Price in USD" />
                    <Form.Text className="text-muted">
                    {minimalPrice?ethers.utils.formatEther(minimalPrice._hex).substring(0,6):0} in AGR (powered by <a href='https://www.coingecko.com/'> Coingecko </a>)
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Finish date</Form.Label>
                    <Form.Control onChange={e=>setFinishDate(e.target.value)} type="date"/>
                    <Form.Control onChange={e=>setFinishTime(e.target.value)} type="time"/>

                    <Form.Text className="text-muted">
                    Date
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Media link</Form.Label>
                    <Form.Control onChange={e=>setFile(e.target.files[0])} type="file" placeholder="Image" />
                </Form.Group>
                
                <Form.Group>
                    <Form.Label>Market hash of data</Form.Label>
                    <Form.Control onChange={e=>setMarketHashOfData(e.target.value)} type="text" placeholder="Market hash of data" />
                </Form.Group>

                <Button variant="primary" onClick={submitProduct}>Submit</Button>
                </Form>
        </Container>
    );
}

export default AuctionCreateProductPage