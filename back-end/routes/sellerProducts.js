const express  = require( 'express');

const { getProducts, createProduct, getProduct, updateProduct }  = require( '../controllers/sellerProducts.js');

const router = express.Router();
console.log(getProduct);
router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProduct);
router.patch('/:id', updateProduct);

module.exports = router;