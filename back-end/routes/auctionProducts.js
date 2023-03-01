const express  = require( 'express');

const { getProducts, instantiateOrUpdateProduct, getProduct, getBidsForProduct, bidForProduct, setDescription }  = require( '../controllers/auctionProductsViews.js');

const router = express.Router();

router.get('/p', getProducts);
router.get('/p/:id', getProduct);
router.post('/p/:id', instantiateOrUpdateProduct);


router.get('/b/:id', getBidsForProduct);
router.post('/b', bidForProduct);

router.put('/d/:id',setDescription)

//router.patch('/:id', updateProduct);

module.exports = router;