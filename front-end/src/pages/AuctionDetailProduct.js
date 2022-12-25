import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import { useParams } from 'react-router-dom';
import {Button} from 'react-bootstrap';

import SimpleAuctionJSON from '../shared/ABIs/SimpleAuction.json';
import addressesJSON from '../shared/contractAddresses.json';

function AuctionDetailProduct(props){
    const [product,setProduct] = useState(null);
    const simpleAuction= new ethers.Contract( addressesJSON.simpleAuction, SimpleAuctionJSON.abi , props.signer);
    const { id } = useParams();
    //TODO: add form for delivery instructions to be passed when purchasing
    //TODO: make popup for that form with amount eth to usd convertion
    useEffect(()=>{
        //TODO: ???? check in DB if there is more data about the product
        getProduct();
    },[]);

    const getProduct = async () => {
        try{
            // TODO: check if this is bad ID
            const p = await simpleAuction.products(id);
            setProduct(p);
        }catch(e){
            console.log(e);
        }
    }

    return(
    <>
        {product?
        <>
            <h1>{product.name}</h1>
            <img style={{width:'20%'}}src={product.linkForMedia}/>
            <h2>Minimal price: { parseInt(product.minimalPrice._hex)}</h2>
            <h2>Highest bid: { parseInt(product.bidAmount._hex)}</h2>

            {product.approoved
            ?<h3>Approoved</h3>
            :<></>
            }
            <h4>{product.seller}</h4>
            {new Date(parseInt(product.addDate._hex)*1000).toString()}
            {/*TODO: make popup form for bid amount*/}
            {/*TODO: make function for bidding with backend DB*/}
            {/*TODO: make window to shouw previous bids*/}
            <Button onClick={()=>{console.log("Make bidding function !")}}>Bid now </Button>
            </>
        :<h1>Loading</h1>
        }
        
    </>
    );
}

export default AuctionDetailProduct;