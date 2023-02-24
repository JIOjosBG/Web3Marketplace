import { useState, useEffect } from 'react';
import {ethers} from 'ethers';

import addressesJSON from '../shared/contractAddresses.json'
import AgoraTokenJSON from '../shared/ABIs/AgoraToken.json'

import {Form, Button, Container} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function BuyTokensPage(props) {
	const [ ownedTokens, setOwnedTokens] = useState(0);
	const [ amount, setAmount] = useState(0);
	const [ msg, setMsg] = useState("");

	//TODO: add supply info

    const navigate = useNavigate();
    const agoraToken= new ethers.Contract( addressesJSON.agoraToken, AgoraTokenJSON.abi , props.signer );
    
    useEffect(()=>{
        getOwnedTokens();
    },[]);


	const buyTokens = async () => {
		if(amount<=0){
			setMsg("Should be positive number");
			return;
		}
		setMsg("");
        const amountOfTokens = ethers.utils.parseEther(amount);
		await agoraToken.buyTokens({value:amountOfTokens});
		// TODO: add message for successfully bought tokens
		navigate("/");
	}

    const getOwnedTokens = async () => {
        try{
            const t = await agoraToken.balanceOf(await props.signer.getAddress());

            setOwnedTokens(t);
        }catch(e){
            console.log(e)
        }
    }
    
    return(
        <Container>
            <h1>AgoraToken</h1>
            <h3>Available: { ethers.utils.formatUnits(ownedTokens,"ether")}</h3>
            <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Amount of tokens to buy:</Form.Label>
            	<Form.Control onChange={e=>setAmount(e.target.value)} type="number" placeholder="Amount"/>
            </Form.Group>
            <h6 style={{color:"red"}} >{msg}</h6>
            <Button onClick={buyTokens}>Buy</Button>
        </Container>
    );
}

export default BuyTokensPage