import {Link} from 'react-router-dom';
import {Button} from 'react-bootstrap';

function MySidebar(props) {

  return (
    <>
        <div className="p-3 bg-light border border-dark rounded">

            <Link to="/s">
                <Button className="m-1 w-100" variant="outline-secondary">Simple Seller </Button>{' '}
            </Link>{' '}
            <Link to="/a">
                <Button className="m-1 w-100" variant="outline-secondary">Simple Auction </Button>
            </Link>{' '}
        </div>
    </>
  );
}

export default MySidebar;
