import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import { useParams } from 'react-router-dom';
import {Button} from 'react-bootstrap';

import SimpleSellerJSON from '../shared/ABIs/SimpleSeller.json';
import addressesJSON from '../shared/contractAddresses.json';
function SellerDetailProduct(props){
    const [product,setProduct] = useState(null);
    const simpleSeller= new ethers.Contract( addressesJSON.simpleSeller, SimpleSellerJSON.abi , props.signer);
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
            const p = await simpleSeller.products(id);
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
            <h2>{parseInt(product.price._hex)}</h2>
            {product.approoved
            ?<h3>Approoved</h3>
            :<></>
            }
            <h4>{product.seller}</h4>
            {new Date(parseInt(product.addDate._hex)*1000).toString()}
            <Button onClick={()=>{console.log("Make function for buying product!!")}}> Buy now </Button>
            </>
        :<h1>Loading</h1>
        }
        
    </>
    );
}

export default SellerDetailProduct;