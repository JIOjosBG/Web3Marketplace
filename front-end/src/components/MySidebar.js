import {Link} from 'react-router-dom';
import {Button} from 'react-bootstrap';

function MySidebar(props) {

  return (
    <>
        <div className="p-2 bg-light border border-2 rounded-2">

            <Link className="w-100" to="/s">
                <Button className="w-100" variant="outline">Simple Seller </Button>{' '}
            </Link>{' '}
            <Link className="w-100" to="/a">
                <Button className="w-100" variant="outline">Simple Auction </Button>
            </Link>{' '}
        </div>
    </>
  );
}

export default MySidebar;
