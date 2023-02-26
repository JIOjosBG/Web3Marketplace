import { Container } from 'react-bootstrap';
import {Link, Outlet, Route} from 'react-router-dom';

import {Row, Col, Button, Stack} from 'react-bootstrap';

import MyNavbar from './MyNavbar';
import MySidebar from './MySidebar';


function Base(props) {
  let provider=props.provider;
  let account = props.account;

  return (
    <>

    <MyNavbar provider={provider} account={account} />
    <div className='mt-4'>
        <Row className="mx-5">
            <Col md={2}>
                <MySidebar/>
            </Col>
            <Col>
                <Outlet/>
            </Col>
        </Row>
    </div>
    </>
  );
}

export default Base;
