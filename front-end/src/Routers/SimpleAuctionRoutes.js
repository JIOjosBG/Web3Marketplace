import {Route,Routes,Navigate} from 'react-router-dom';
import SimpleAuctionListPage from '../pages/AuctionListPage';
import AuctionCreateProductPage from '../pages/AuctionCreateProductPage';

function SimpleAuctionRoutes(props) {
    return(
        <>
            {
            props.provider?
            <Routes>
                <Route index element={<SimpleAuctionListPage provider={props.provider} signer={props.signer} /> }/>
                <Route path="/c" element={<AuctionCreateProductPage provider={props.provider} signer={props.signer} /> }/>
            </Routes>
            :<Navigate to="/" />
            }
        </>
    );

}

export default SimpleAuctionRoutes;