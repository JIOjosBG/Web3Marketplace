const express  = require( 'express');

const { getProducts, instantiateOrUpdateProduct, getProduct }  = require( '../controllers/sellerProductsViews.js');

const router = express.Router();
console.log(getProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/:id', instantiateOrUpdateProduct);
//router.patch('/:id', updateProduct);

module.exports = router;