import {Route,Routes,Navigate} from 'react-router-dom';
import SimpleSellerListPage from '../pages/SellerListPage';
import SellerCreateProductPage from '../pages/SellerCreateProductPage';

function SimpleSellerRoutes(props) {
    return(
        <>
            {
            props.provider?
            <Routes>
                <Route index element={<SimpleSellerListPage provider={props.provider} signer={props.signer} /> }/>
                <Route path="/c" element={<SellerCreateProductPage provider={props.provider} signer={props.signer} /> }/>
            </Routes>
            :<Navigate to="/" />
            }
        </>
    );

}

export default SimpleSellerRoutes;