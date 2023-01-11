import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import { useParams } from 'react-router-dom';
import {Button, Form} from 'react-bootstrap';

import SimpleAuctionJSON from '../shared/ABIs/SimpleAuction.json';
import MarketplaceJSON from '../shared/ABIs/Marketplace.json';

import addressesJSON from '../shared/contractAddresses.json';

function AuctionDetailProduct(props){
    const [product,setProduct] = useState(null);
    const [rate,setRate] = useState(0);
    const [minimalPriceInUSD,setMinimalPriceInUSD] = useState(0);
    const [highestBidInUSD,setHighestBidInUSD] = useState(0);
    const simpleAuction= new ethers.Contract( addressesJSON.simpleAuction, SimpleAuctionJSON.abi , props.signer);
    const marketplace= new ethers.Contract( addressesJSON.marketplace, MarketplaceJSON.abi , props.provider);
    
    const [deliveryInstructions,setDeliveryInstructions] = useState("");
    const [myBid,setMyBid] = useState(0);
    const [myBidInUSD,setMyBidInUSD] = useState(0);
    const [isCourier,setIsCourier] = useState(0);
    const signer = props.signer;
    const { id } = useParams();
    //TODO: add form for delivery instructions to be passed when purchasing
    //TODO: make popup for that form with amount eth to usd convertion
    useEffect(()=>{
        //TODO: ???? check in DB if there is more data about the product
        getIsCourierStatus()
        getProduct();
    },[]);

    const getIsCourierStatus = async () => {
        setIsCourier(await marketplace.couriers(await signer.getAddress()))
    }
    const getProduct = async () => {
        try{
            // TODO: check if this is bad ID
            const p = await simpleAuction.products(id);
            setProduct(p);
            const r = await getRates();

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

        console.log("a");
        const bidInWei = usdToWei(amount,rate);
        console.log("aa");
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

    return(
    <>
        {product?
        <>
            <h1>{product.name}</h1>
            <img style={{width:'20%'}}src={product.linkForMedia}/>
            {product.minimalPrice.gt(product.bidAmount)
            ?<>
                <h2>Minimal price in wei: { (product.minimalPrice._hex)}</h2>
                <h6>Minimal in USD: {minimalPriceInUSD}</h6>
            </>
            :<>
                <h2>Highest bid: { (product.bidAmount._hex)}</h2>
                <h6>Bid in USD: {highestBidInUSD}</h6>
            </>
            }
            <h6>(powered by <a href='https://www.coingecko.com/'> Coingecko </a>)</h6>
           
            {product.approoved
            ?<h3>Approoved</h3>
            :<></>
            }
            <h4>{product.seller}</h4>
            {new Date(parseInt(product.addDate._hex)*1000).toString()}
            {/*TODO: make window to shouw previous bids in DB*/}
            
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

                    <Button onClick={handleBidViaContract }>Bid via contract ${myBidInUSD} </Button>
                    <Button onClick={handleBidViaBackend }>Bid via backend ${myBidInUSD} </Button>
                </>
                :isCourier
                    ?product.delivered==false
                        ?<Button onClick={deliverProduct}>Deliver now </Button>
                        :<h4>Already delivered</h4>    
                    :<></>
            }

            </>
        :<h1>Loading</h1>
        }
        
    </>
    );
}

export default AuctionDetailProduct;