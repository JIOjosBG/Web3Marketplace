import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import { useParams } from 'react-router-dom';
import {Button, Form, Container, Row, Col} from 'react-bootstrap';

import SimpleSellerJSON from '../shared/ABIs/SimpleSeller.json';

import addressesJSON from '../shared/contractAddresses.json';
import {getCourierStatus, getAdminStatus} from '../utils/getUserStatus';
import {weiToUsd} from '../utils/convertion';
import {getRates} from '../utils/apiCalls';

function SellerDetailProduct(props){
    const [product,setProduct] = useState(null);
    const [priceInUSD,setPriceInUSD] = useState(0);
    const [isAdmin,setIsAdmin] = useState(0);
    const [isCourier, setIsCourier] = useState(0);

    const [deliveryInstructions,setDeliveryInstructions] = useState("");
    const [dateAdded,setDateAdded] = useState();

  
    const signer = props.signer;
    const simpleSeller= new ethers.Contract( addressesJSON.simpleSeller, SimpleSellerJSON.abi , signer);

    const { id } = useParams();

    //TODO: add account to update list
    useEffect(()=>{
        signer.getAddress()
        .then((address)=>{
            getCourierStatus(address).then( s => setIsCourier(s))
            getAdminStatus(address).then( s => setIsAdmin(s))
        })
    
        getProduct()
        .then(p => {setProduct(p); return p})
        .then(p => {setDateAdded(new Date(parseInt(p.addDate._hex)*1000)); return p})
        .then(p => {
            getRates()
            .then(r=>{setPriceInUSD(weiToUsd(p.price,r)); return p})
        })
    },[]);

    async function getProduct(){
        try{
            // TODO: check if this is bad ID
            const p = await simpleSeller.products(id);
            return p;
        }catch(e){
            console.log(e);           
        }
    }

    const makeSignature = async () => {
        let nonce = await ethers.utils.solidityPack(['address','uint'],[simpleSeller.address,id]);
        nonce = await ethers.utils.keccak256(nonce);
        const expiration = Math.floor(Date.now()/1000)+3600;
        const signerAddress = await props.signer.getAddress();

        const message = await ethers.utils.solidityPack(
            ['uint','bytes32','uint','address','address'],
            [expiration,nonce,product.price._hex,signerAddress,simpleSeller.address]);
        
            const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
        let signature = props.signer.signMessage(hashedMessage);
            

        return {"expiration":expiration,"signature":signature};
    }

    const buyProduct = async () => {
        let expiration,sig;
        //TODO: check if sufficient funds
        try{
            const sigData = await makeSignature();
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
                await simpleSeller.payProduct(id,deliveryData,expiration,await props.signer.getAddress(),sig);
            }catch(e){
                console.log(e);
            }
        }
    }
    const deliverProduct = async() => {
        try{
            console.log(simpleSeller)
            await simpleSeller.deliverProduct(id);
        }catch(e){
            console.log(e);
        }
    }

    const approveProduct = async() => {
        try{
            await simpleSeller.approveProduct(id);
        }catch(e){
            console.log(e)
        }
    }

    return(
    <>
        {product
        ?<Container className="mt-2">
            <Row>
                <Col md={6}>
                    <img className="w-100" src={product.linkForMedia}/>
                </Col>
                <Col md={6}>
                    <h1>{product.name}</h1>
                    <h2>Price: {Number(ethers.utils.formatUnits(product.price,"ether")).toFixed(5)}AGR</h2>
                    <h2>Price in USD: ${priceInUSD.toFixed(2)}</h2> 
                    <h6>(powered by <a href='https://www.coingecko.com/'> Coingecko </a>)</h6>
                    {product.approved
                    ?<h3>Approoved</h3>
                    :<></>
                    }
                    <h6>Seller: {product.seller}</h6>
                    <h6> Added on {dateAdded.getFullYear()+"/"+(dateAdded.getMonth()+1)+"/"+dateAdded.getDate()}</h6>
                </Col>
            </Row>
            <Row>
                {!product.paid
                    ?<>
                    <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Delivery Instructions:</Form.Label>
                        <Form.Control 
                            onChange={e=>setDeliveryInstructions(e.target.value)} 
                            type="text" 
                            placeholder="Delivery instructions"
                        />
                    </Form.Group>
                    
                    <Button className='mb-1' onClick={buyProduct}> Buy now </Button>
                    {isAdmin && !product.approved
                        ?<Button onClick={approveProduct}>Approve product </Button>
                        :<></>}
                    </>
                    :isCourier
                        ?product.delivered===false
                            ?<Button onClick={deliverProduct}>Deliver now </Button>
                            :<h4>Already delivered</h4>    
                :<></>
                }
            </Row>
        </Container>
        :<h1>Loading</h1>
        }
        
    </>
    );

}

export default SellerDetailProduct;