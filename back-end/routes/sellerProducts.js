const express  = require( 'express');

const { getProducts, instantiateProduct, getProduct }  = require( '../controllers/sellerProductsViews.js');

const router = express.Router();
console.log(getProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/:id', instantiateProduct);
//router.patch('/:id', updateProduct);

module.exports = router;