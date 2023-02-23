import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import { useParams } from 'react-router-dom';
import {Button, Form, Container, Row, Col, Card} from 'react-bootstrap';

import SimpleAuctionJSON from '../shared/ABIs/SimpleAuction.json';
import MarketplaceJSON from '../shared/ABIs/Marketplace.json';

import addressesJSON from '../shared/contractAddresses.json';

function AuctionDetailProduct(props){
    const [product,setProduct] = useState(null);
    const [rate,setRate] = useState(0);
    const [minimalPriceInUSD,setMinimalPriceInUSD] = useState(0);
    const [highestBidInUSD,setHighestBidInUSD] = useState(0);
    const [bids,setBids] = useState([]);

    const simpleAuction= new ethers.Contract( addressesJSON.simpleAuction, SimpleAuctionJSON.abi , props.signer);
    const marketplace= new ethers.Contract( addressesJSON.marketplace, MarketplaceJSON.abi , props.provider);
    
    const [deliveryInstructions,setDeliveryInstructions] = useState("");
    const [myBid,setMyBid] = useState(0);
    const [myBidInUSD,setMyBidInUSD] = useState(0);
    const [isCourier,setIsCourier] = useState(0);
    const [isAdmin,setIsAdmin] = useState(0);
    const [dateAdded,setDateAdded] = useState();
    const [dateFinishes,setDateFinishes] = useState();
        
    const signer = props.signer;
    const { id } = useParams();
    //TODO: make popup for that form with amount eth to usd convertion

    // simpleAuction.on("auctionProductBid", getProduct);
    // simpleAuction.on("auctionProductDelivered", getProduct);
    useEffect(()=>{
        //TODO: ???? check in DB if there is more data about the product
        getIsCourierStatus();
        getIsAdminStatus();
        getProduct();
        getBids();
    },[]);

    const getBids = async () => {
        try{
            const response = await fetch(`http://localhost:5000/a/b/${id}`, {
                method: 'GET',
            });
            let b = (await response.json());
            setBids(b);
            console.log("aaa",b[0])
        }catch(e){
            console.log(e);
        }
    }
    const getIsCourierStatus = async () => {
        setIsCourier(await marketplace.couriers(await signer.getAddress()))
    }
    const getIsAdminStatus = async () => {
        setIsAdmin(await marketplace.admins(await signer.getAddress()))
    }

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
            setProduct(p);
            setDateAdded(new Date(parseInt(p.addDate._hex)*1000))
            setDateFinishes(new Date(parseInt(p.finishDate._hex)*1000))

            const r =await getRates();

        await setMinimalPriceInUSD(weiToUsd(parseInt(p.minimalPrice),r));
        await setHighestBidInUSD(weiToUsd(parseInt(p.bidAmount),r));
        
        }catch(e){
            console.log(e);
        }
    }

    const getRates = async () => {
        try{
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
                method: 'GET',
            });
            let r = (await response.json()).ethereum.usd;
            setRate(r);
            return r;
            
        }catch(e){
            console.log(e);
        }
    }

    const weiToUsd = (wei,r) => {
        if(wei===0) return 0;
        let usd = 1/r;
        const priceInEth = ethers.utils.formatEther(wei);
        
        return priceInEth/usd;
    }
    const usdToWei = (usd,r) => {
        let eth = usd/r;
        eth = parseFloat(eth).toFixed( 18 );
        return ethers.utils.parseEther(eth.toString());
    }


    const handleBidInput = async (amount) => {
        //TODO: check if it is higher than prev bid and open modal
        console.log(amount,typeof(amount));
        if(amount==="") amount="0";
        amount = parseFloat(amount);

        setMyBidInUSD(amount);

        const bidInWei = usdToWei(amount,rate);
        console.log(amount,rate,myBidInUSD);
        setMyBid(bidInWei);
    }


    const makeSignature = async () => {
        let nonce = await ethers.utils.solidityPack(['address','uint','uint'],[simpleAuction.address,id,myBid]);
        nonce = await ethers.utils.keccak256(nonce);
        const signerAddress = await signer.getAddress();
        let message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[product.finishDate,nonce,myBid,signerAddress,simpleAuction.address]);
        let hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
        let signature =  signer.signMessage(hashedMessage);
        return {"nonce":nonce,"signature":signature};
    }

    const handleBidViaContract = async () => {
        let nonce,sig;
        console.log("in");
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
            console.log("not okay with sig and delivery instructions");
        }else{
            const message = await ethers.utils.solidityPack(['string'],[deliveryInstructions]);
            const deliveryData = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
            
            try{
                // await simpleAuction.bidForProduct(id,deliveryData,product.finishDate,nonce,myBid,await signer.getAddress(),sig);
                await simpleAuction.bidForProduct(id,deliveryData,myBid,await signer.getAddress(),sig);
                
            }catch(e){
                console.log(e);
            }
        }
    }

    const handleBidViaBackend = async () => {
        let nonce,sig;
        console.log("in");
        try{
            const sigData = await makeSignature();
            nonce=await sigData['nonce'];
            sig=await sigData['signature'];
        }catch(e){
            console.log(e.message);
        }
        if(sig==null || deliveryInstructions==""){
            //TODO: open modal
            console.log("not okay with sig and delivery instructions");
        }else{
            //TODO: encrypt delivery instructions with public key of seller
            const message = await ethers.utils.solidityPack(['string'],[deliveryInstructions]);

            const deliveryData =(await ethers.utils.keccak256(message));
            
            try{
                const response = await fetch('http://localhost:5000/a/b/', {
                method: 'POST',
                body:JSON.stringify({
                    "instanceId":id,
                    "bidder":await signer.getAddress(),
                    "amount":myBid._hex,
                    "deliveryInstructions":deliveryData,
                    "signature":sig
                }),
                headers: {
                    'Content-Type': 'application/json'
                },

                });
                console.log(await response.status);
            }catch(e){
                console.log(e);
            }
        }
    }

    const deliverProduct = async () => {
        await simpleAuction.deliverProduct(id);
    }

    const bidsList = bids.length>0 ? bids.map((b) =><BidCard key={b.id} bid={b} />) : <></>;


    //TODO: make timed getter for rates
    return(
    <>
        {product?

          <Container className="mt-2">
            <Row>
                <Col md={6}>
                    <img className="w-100" src={product.linkForMedia}/>
                </Col>
                <Col md={6}>
                    <h1>{product.name}</h1>
                    {product.minimalPrice.gt(product.bidAmount)
                    ?<>
                        <h2>Minimal price in wei: { (product.minimalPrice._hex)}</h2>
                        <h6>Minimal in USD: ${minimalPriceInUSD.toFixed(2)}</h6>
                    </>
                    :<>
                        <h2>Highest bid: { (product.bidAmount._hex)}</h2>
                        <h6>Bid in USD: ${highestBidInUSD.toFixed(2)}</h6>
                    </>
                    }
                    <h6>(powered by <a href='https://www.coingecko.com/'> Coingecko </a>)</h6>
                
                    {product.approved
                    ?<h3>Approoved</h3>
                    :<></>
                    }
                    <h4>{product.seller}</h4>
                    <h6> Added on {dateAdded.getFullYear()+"/"+(dateAdded.getMonth()+1)+"/"+dateAdded.getDate()}</h6>
                    <h6> Finishes on {dateFinishes.getFullYear()+"/"+(dateFinishes.getMonth()+1)+"/"+dateFinishes.getDate()}</h6>
                </Col>
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