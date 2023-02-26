import { useState, useEffect } from 'react';
import {ethers} from "ethers";
import logo from '../media/logo_white.png';
import {Navbar,Container, Row, Col, Button, Stack} from 'react-bootstrap';
import {Link} from 'react-router-dom';


import addresses from "../shared/contractAddresses.json";
import AgoraTokenJSON from "../shared/ABIs/AgoraToken.json";
import MarketplaceJSON from "../shared/ABIs/Marketplace.json";


function MyNavbar(props) {
  let provider=props.provider;
  const [tokens, setTokens] = useState(0)
  const [isAdmin, setIsAdmin] = useState(0)
  const agoraToken = new ethers.Contract(addresses.agoraToken, AgoraTokenJSON.abi, provider);  
  const marketplace = new ethers.Contract(addresses.marketplace, MarketplaceJSON.abi, provider);  

  async function getContractValues(){
    if(props.account){
      const t = await agoraToken.balanceOf(props.account)
      setTokens(t)
    }
    const a = await marketplace.admins(props.account);
    await setIsAdmin(a);
  }
  
  useEffect(()=>{
    getContractValues()
  },[])
  return (
    <>
    <Navbar className="bg-dark text-light border-light" style={{}}>
      <Container>
        {props.account
          ?<h6>Account: {props.account ? props.account.substr(0,10) : 0}</h6>
          :<></>
        }
        <h6>Available tokens { Number(ethers.utils.formatUnits(tokens, "ether")).toFixed(3)}{' '}</h6>
      </Container>
    </Navbar>

    <Navbar bg="dark" expand="lg">
      <Container>
            <img style={{width:'25%'}} src={logo} alt={logo}/>
              <Stack  direction="horizontal">
                <Link className='me-2'to="/t"><Button variant='secondary' >Buy Tokens</Button></Link>
                {isAdmin
                  ?<Col> <Link to="admin/"><Button variant='secondary' >Admin page</Button></Link></Col>
                  :<></>
                }
                </Stack>
      </Container>
    </Navbar>
    </>
  );
}

export default MyNavbar;
