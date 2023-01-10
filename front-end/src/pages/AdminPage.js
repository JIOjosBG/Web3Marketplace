import { useState, useEffect } from 'react';
import {ethers} from 'ethers';
import {Form, Button, Container} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import addressesJSON from '../shared/contractAddresses.json'
import marketplaceJSON from '../shared/ABIs/Marketplace.json'

function AdminPage(props) {
    const [courier,setCourier] = useState("");

    const navigate = useNavigate();
    const marketplace = new ethers.Contract( addressesJSON.marketplace, marketplaceJSON.abi , props.signer );
    async function redirectIfNotAdmin(){
        const owner = await marketplace.owner()
        const account = await props.signer.getAddress()
        if(await marketplace.admins(account) == false){
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