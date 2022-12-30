import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import { useParams } from 'react-router-dom';
import {Button, Form} from 'react-bootstrap';

import SimpleSellerJSON from '../shared/ABIs/SimpleSeller.json';
import addressesJSON from '../shared/contractAddresses.json';
function SellerDetailProduct(props){
    const [product,setProduct] = useState(null);
    const [priceInUSD,setPriceInUSD] = useState(0);
    const [rate,setRate] = useState(0);
    const [deliveryInstructions,setDeliveryInstructions] = useState("");

  
    const signer = props.signer;

    const simpleSeller= new ethers.Contract( addressesJSON.simpleSeller, SimpleSellerJSON.abi , props.signer);
    const { id } = useParams();
    //TODO: add form for delivery instructions to be passed when purchasing
    //TODO: make popup for that form with amount eth to usd convertion

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
        let usd = 1/r;
        const priceInEth = ethers.utils.formatEther(wei);
        return priceInEth/usd;
    }


    async function getProduct(){
        try{
            // TODO: check if this is bad ID
            const p = await simpleSeller.products(id);
            await setProduct(p);
            const r = await getRates();
            await setPriceInUSD(weiToUsd(p.price,r));
        }catch(e){
            console.log(e);           
        }
    }

    const makeSignature = async () => {
        let nonce = await ethers.utils.solidityPack(['address','uint'],[simpleSeller.address,id]);
        nonce = await ethers.utils.keccak256(nonce);
        const expiration = Math.floor(Date.now()/1000)+3600;
        const signerAddress = await signer.getAddress();
        


        console.log(expiration,nonce,product.price,signerAddress,simpleSeller.address);
        const message = await ethers.utils.solidityPack(
            ['uint','bytes32','uint','address','address'],
            [expiration,nonce,product.price._hex,signerAddress,simpleSeller.address]);
        console.log(simpleSeller.address);
            //[expiration,nonce,product.price,signerAddress,simpleSeller.address]);
            //[expired,nonce,oneETH,accounts[1].address,accounts[0].address]);
        
            const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
        let signature = signer.signMessage(hashedMessage);
            

        return {"nonce":nonce,"expiration":expiration,"signature":signature};
    }

    const buyProduct = async () => {
        //TODO: check if sufficient funds
        let nonce,expiration,sig;
        try{
            const sigData = await makeSignature();
            nonce=await sigData['nonce'];
            expiration=await sigData['expiration'];
            sig=await sigData['signature'];
        }catch(e){
            console.log(e.message);
        }
        if(sig===null || deliveryInstructions===""){
            //TODO: open modal
            //TODO: encrypt delivery instructions with public key of seller
            console.log("not okay with sig and delivery instructions");
        }else{
            let deliveryData = await ethers.utils.solidityPack(['string'],[deliveryInstructions]);
            deliveryData = await ethers.utils.arrayify(await ethers.utils.keccak256(deliveryData));
            
            try{
                console.log(id,deliveryData,expiration,nonce,product.price,await signer.getAddress(),sig);
                await simpleSeller.payProduct(id,deliveryData,expiration,nonce,product.price,await signer.getAddress(),sig);
                    //simpleSeller.payProduct(0,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,signature)).to.not.throw;
                
            }catch(e){
                console.log(e);
            }
        }
    }
    useEffect(()=>{
        //TODO: ???? check in DB if there is more data about the product
        getProduct();
    },[]);


    return(
    <>
    
        {product?
        <>


            <h1>{product.name}</h1>
            <img style={{width:'20%'}}src={product.linkForMedia}/>
            <h2>Price in wei:{(product.price._hex)}</h2>
            <h2>Price in USD:{priceInUSD}</h2> <h6>(powered by <a href='https://www.coingecko.com/'> Coingecko </a>)</h6>
            
            {product.approoved
            ?<h3>Approoved</h3>
            :<></>
            }
            <h4>{product.seller}</h4>
            {new Date(parseInt(product.addDate._hex)*1000).toString()}
            {parseInt(product.addDate).toString()}
            <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Delivery Instructions:</Form.Label>
                <Form.Control onChange={e=>setDeliveryInstructions(e.target.value)} type="text" placeholder="Delivery instructions"/>
            </Form.Group>
            <Button onClick={buyProduct}> Buy now </Button>
            </>
        :<h1>Loading</h1>
        }
        
    </>
    );

}

export default SellerDetailProduct;