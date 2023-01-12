import { useState, useEffect } from 'react';
import {ethers} from "ethers";
import logo from '../media/logo.png';
import {Navbar,Container,Row, Col, Button} from 'react-bootstrap';
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

    <Navbar bg="light" expand="lg">
      <Container>
        <Row>
          <Col>
            <img style={{width:'50%'}} src={logo} alt={logo}/>
            {props.account
              ?<h6 className="ml">Account: {props.account ? props.account.substr(0,10) : 0}...</h6>
              :<></>
            }
          </Col>

          <Col>
            <Link to="/s"><Button>Simple Seller </Button></Link>
            <Link to="/a"><Button>Simple Auction </Button></Link>
          </Col>
          <Col>
            <Link to="/t"><Button>Buy Tokens</Button></Link>
            <h3>Available tokens { Number(ethers.utils.formatUnits(tokens, "ether")).toFixed(5) }</h3>
          </Col>
          {isAdmin
            ?<Col> <Link to="admin/"><Button>Admin page</Button></Link></Col>
            :<></>
          }
          {/* TODO: add available tokens display */}
        </Row>
      </Container>
    </Navbar> 
    <Outlet/>
   
    </>
  );
}

export default MyNavbar;
