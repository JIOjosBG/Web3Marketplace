const express  = require( 'express');

const { getProducts, createProduct, getProduct, updateProduct }  = require( '../controllers/sellerProductsViews.js');

const router = express.Router();
console.log(getProduct);
router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProduct);
router.patch('/:id', updateProduct);

module.exports = router;