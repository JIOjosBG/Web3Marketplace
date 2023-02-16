import { useState, useEffect } from 'react';
import {ethers} from "ethers";
import logo from '../media/logo_white.png';
import {Navbar,Container, Row, Col, Button, Stack} from 'react-bootstrap';
import {Link, Outlet} from 'react-router-dom';


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
    const t = await agoraToken.balanceOf(props.account)
    setTokens(t)
    const a = await marketplace.admins(props.account);
    console.log(a);
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
          <Row>
            <Col md={6} ><img style={{width:'50%'}} src={logo} alt={logo}/></Col>
            <Col md={3}>
              <Stack direction="horizontal">
                <Link className='m-1' to="/s"><Button variant='secondary'>Simple Seller </Button></Link>{' '}
                <Link className='m-1'to="/a"><Button variant='secondary'>Simple Auction </Button></Link>{' '}
              </Stack>
            </Col>
            <Col md={3}>
              <Stack direction="horizontal">
                <Link className='m-1'to="/t"><Button variant='secondary' >Buy Tokens</Button></Link>
                {isAdmin
                  ?<Col> <Link className='m-1' to="admin/"><Button variant='secondary' >Admin page</Button></Link></Col>
                  :<></>
                }
              </Stack>
            </Col>
          </Row>
      </Container>
    </Navbar> 
    <Outlet/>
   
    </>
  );
}

export default MyNavbar;
