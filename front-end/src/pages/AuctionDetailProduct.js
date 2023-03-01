import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import { useParams } from 'react-router-dom';
import {Button, Form, Container, Row, Col, Card} from 'react-bootstrap';
import axios from "axios";

import SimpleAuctionJSON from '../shared/ABIs/SimpleAuction.json';

import addressesJSON from '../shared/contractAddresses.json';
import {getCourierStatus, getAdminStatus} from '../utils/getUserStatus';
import {weiToUsd,usdToWei} from '../utils/convertion';
import {getRates, getBids} from '../utils/apiCalls';

function AuctionDetailProduct(props){
    const [product,setProduct] = useState(null);
    const [rate,setRate] = useState(0);
    const [minimalPriceInUSD,setMinimalPriceInUSD] = useState(0);
    const [highestBidInUSD,setHighestBidInUSD] = useState(0);
    const [bids,setBids] = useState([]);
    const [description, setDescription] = useState("");

    const signer = props.signer;
    const simpleAuction= new ethers.Contract( addressesJSON.simpleAuction, SimpleAuctionJSON.abi , signer);

    const [deliveryInstructions,setDeliveryInstructions] = useState("");
    const [myBid,setMyBid] = useState(0);
    const [myBidInUSD,setMyBidInUSD] = useState(0);
    const [isCourier,setIsCourier] = useState(0);
    const [isAdmin,setIsAdmin] = useState(0);
    const [dateAdded,setDateAdded] = useState();
    const [dateFinishes,setDateFinishes] = useState();
        
    const { id } = useParams();
    //TODO: make popup for that form with amount eth to usd convertion

    // simpleAuction.on("auctionProductBid", getProduct);
    // simpleAuction.on("auctionProductDelivered", getProduct);
    useEffect(()=>{
        //TODO: ???? check in DB if there is more data about the product
        signer.getAddress()
        .then((address)=>{
            getCourierStatus(address).then( s => setIsCourier(s))
            getAdminStatus(address).then( s => setIsAdmin(s))
        })

        getDescription()
        .then(d => setDescription(d))
        
        getProduct()
        .then(p => {
            setProduct(p)
            getRates()
            .then(r=>{
                setRate(r)
                setHighestBidInUSD(weiToUsd(p.bidAmount,r))
                setMinimalPriceInUSD(weiToUsd(p.minimalPrice,r))
                setDateAdded(new Date(parseInt(p.addDate._hex)*1000))
                setDateFinishes(new Date(parseInt(p.finishDate._hex)*1000))
            })
            return p
        })

        getBids(id)
        .then(b=>{setBids(b)});  

    },[]);


    const approveProduct = async() => {
        try{
            await simpleAuction.approveProduct(id);
        }catch(e){
            console.log(e)
        }
    }


    async function getProduct(){
        try{
            // TODO: check if this is bad ID
            const p = await simpleAuction.products(id);
            return p;
        }catch(e){
            console.log(e);           
        }
    }


    const handleBidInput = async (amount) => {
        //TODO: check if it is higher than prev bid and open modal
        if(amount==="") amount="0";
        amount = parseFloat(amount);

        setMyBidInUSD(amount);

        const bidInWei = usdToWei(amount,rate);
        setMyBid(bidInWei);
    }


    const makeSignature = async () => {
        let nonce = await ethers.utils.solidityPack(['address','uint','uint'],[simpleAuction.address,id,myBid]);
        nonce = await ethers.utils.keccak256(nonce);
        const signerAddress = await props.signer.getAddress();
        let message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[product.finishDate,nonce,myBid,signerAddress,simpleAuction.address]);
        let hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
        let signature =  props.signer.signMessage(hashedMessage);
        return {"nonce":nonce,"signature":signature};
    }

    const handleBidViaContract = async () => {
        let nonce,sig;
        try{
            const sigData = await makeSignature();
            nonce=await sigData['nonce'];
            sig=await sigData['signature'];
        }catch(e){
            console.log(e.message);
        }
        if(sig===null || deliveryInstructions==""){
            //TODO: open modal
            //TODO: encrypt delivery instructions with public key of seller
        }else{
            const message = await ethers.utils.solidityPack(['string'],[deliveryInstructions]);
            const deliveryData = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
            
            try{
                // await simpleAuction.bidForProduct(id,deliveryData,product.finishDate,nonce,myBid,await signer.getAddress(),sig);
                await simpleAuction.bidForProduct(id,deliveryData,myBid,await props.signer.getAddress(),sig);
                
            }catch(e){
                console.log(e);
            }
        }
    }

    const handleBidViaBackend = async () => {
        let nonce,sig;
        try{
            const sigData = await makeSignature();
            nonce=await sigData['nonce'];
            sig=await sigData['signature'];
        }catch(e){
            console.log(e.message);
        }
        if(sig==null || deliveryInstructions==""){
            //TODO: open modal
        }else{
            //TODO: encrypt delivery instructions with public key of seller
            const message = await ethers.utils.solidityPack(['string'],[deliveryInstructions]);

            const deliveryData =(await ethers.utils.keccak256(message));
            
            try{
                const response = await fetch('http://localhost:5000/a/b/', {
                method: 'POST',
                body:JSON.stringify({
                    "instanceId":id,
                    "bidder":await props.signer.getAddress(),
                    "amount":myBid._hex,
                    "deliveryInstructions":deliveryData,
                    "signature":sig
                }),
                headers: {
                    'Content-Type': 'application/json'
                },

                });
            }catch(e){
                console.log(e);
            }
        }
    }

    const deliverProduct = async () => {
        await simpleAuction.deliverProduct(id);
    }

    const bidsList = bids.length>0 ? bids.map((b) =><BidCard key={b.id} bid={b} />) : <></>;

    const getDescription = async() => {
        const res = await axios.get(`http://localhost:5000/a/p/${id}`)
        .catch(function(error) {
            console.log(error);
        });
        if(res){
            return res.data.description
        }
    }
    const updateDescription = async () => {
        const message = ethers.utils.keccak256(
            ethers.utils.solidityPack(
                ['address','uint256','string'],
                [simpleAuction.address,id,description]
            ));
        try{
            const signature = await signer.signMessage(message)
            axios
            .put(`http://localhost:5000/a/d/${id}`,{description,signature})
        }catch(e){
            console.log(e)
            alert("not updated")
            return
        }
    }
    //TODO: make timed getter for rates
    return(
    <>
        {product?

          <Container className="mt-2">
            <Row>
                <Col md={4}>
                    <img className="w-100" src={product.linkForMedia}/>
                </Col>
                <Col md={8}>
                    <h2>{product.name}</h2>
                    {product.minimalPrice.gt(product.bidAmount)
                    ?<>
                        <h3> Minimal price: {Number(ethers.utils.formatUnits(product.minimalPrice,"ether")).toFixed(5)}AGR</h3>

                        <h6>Minimal in USD: ${minimalPriceInUSD.toFixed(2)}</h6>
                    </>
                    :<>
                        <h3> Minimal bid: {Number(ethers.utils.formatUnits(product.bidAmount,"ether")).toFixed(5)}AGR</h3>
                        <h6>Bid in USD: ${highestBidInUSD.toFixed(2)}</h6>
                    </>
                    }
                    <h6>(powered by <a href='https://www.coingecko.com/'> Coingecko </a>)</h6>
                
                    {product.approved
                    ?<h3>Approoved</h3>
                    :<></>
                    }
                    <h4>{product.seller}</h4>
                    {dateAdded && dateFinishes
                        
                        ?<>
                            <h6> Added on {dateAdded.getFullYear()+"/"+(dateAdded.getMonth()+1)+"/"+dateAdded.getDate()}</h6>
                            <h6> Finishes on {dateFinishes.getFullYear()+"/"+(dateFinishes.getMonth()+1)+"/"+dateFinishes.getDate()}</h6>
                        </>
                        :<></>
                    }
                </Col>
            </Row>
            <Row>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Control as="textarea" defaultValue={description} onChange={e=>setDescription(e.target.value)} type="text" placeholder="Delivery instructions"/>
                    <Button onClick={updateDescription} > Update description </Button>
                </Form.Group>
            </Row>
            {parseInt(product.finishDate._hex)*1000>new Date().getTime()
                ?<>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Delivery Instructions:</Form.Label>
                    <Form.Control onChange={e=>setDeliveryInstructions(e.target.value)} type="text" placeholder="Delivery instructions"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Bid for product:</Form.Label>
                    <Form.Control onChange={e=>handleBidInput(e.target.value)} type="number" placeholder="Your bid"/>
                    <Form.Text className="text-muted">{myBid._hex} in Wei</Form.Text>

                </Form.Group>

                    <Button variant="secondary" onClick={handleBidViaContract }>Bid via contract ${myBidInUSD} </Button>{' '}
                    <Button variant="secondary" onClick={handleBidViaBackend }>Bid via backend ${myBidInUSD} </Button>
                    {isAdmin && !product.approved
                    ?<Button onClick={approveProduct}>Approve product </Button>
                    :<></>}
                </>
                
                :isCourier
                    ?product.delivered==false
                        ?<Button onClick={deliverProduct}>Deliver now </Button>
                        :<h4>Already delivered</h4>    
                    :<></>
            }
            <h6>Bids</h6>
            {bidsList}

        </Container>
        :<h1>Loading</h1>
        }
        
    </>
    );
}



function BidCard(props){
    return(
        <Card>
            <Card.Body>
                <h6>Bid from {props.bid.bidder}</h6>
                <h6>Amount { Number(ethers.utils.formatUnits(props.bid.amount, "ether")).toFixed(5)}{' '}</h6>

            </Card.Body>
        </Card>
    );
}

export default AuctionDetailProduct;