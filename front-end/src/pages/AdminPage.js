import { useState, useEffect } from 'react';
import {ethers} from 'ethers';
import {Form, Button, Container, Modal} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import addressesJSON from '../shared/contractAddresses.json'
import marketplaceJSON from '../shared/ABIs/Marketplace.json'

function AdminPage(props) {
    const [courier,setCourier] = useState("");
    // const [minimalPrice,setMinimalPrice] = useState(0);
    // const [priceInUSD,setPriceInUSD] = useState(0);

    // const [finishDate,setFinishDate] = useState(0);
    // const [finishTime,setFinishTime] = useState(0);

    // const [linkForMedia,setLinkForMedia] = useState("");
    //TODO: ADD PROPPER FIELD FOR SECRET DATA
    //CAUTION: SHOULD MAKE CHANGES IN THE CONTRACT (marketHashOfData bytes32-->bytes)
    //TODO: safety checks
    // const [marketHashOfData, setMarketHashOfData] = useState();
    // const [ rate, setRate ] = useState(0);
    // const [show,setShow] = useState(false);
    const navigate = useNavigate();
    const marketplace = new ethers.Contract( addressesJSON.marketplace, marketplaceJSON.abi , props.signer );
    async function redirectIfNotAdmin(){
        const owner = await marketplace.owner()
        const account = await props.signer.getAddress()
        console.log(owner)
        console.log(account)
        if(owner.toLowerCase() !== account.toLowerCase()){
            navigate("/");
        }
    }
    useEffect(()=>{
        redirectIfNotAdmin();
    },[]);
    
    async function addCourier(){
        try{
            await marketplace.addCourier(courier);
            navigate("/admin");

        }catch(e){
            console.log("errrr",e);
        }
    }

    return(
        <Container>
            <h1>Admin page</h1>
            <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Add courier:</Form.Label>
                <Form.Control onChange={e=>setCourier(e.target.value)} type="text" placeholder="Courier address"/>
            </Form.Group>
            <Button onClick={addCourier}>Add courier</Button>
        </Container>
    );
}

export default AdminPage;