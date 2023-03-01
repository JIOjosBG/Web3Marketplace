const express  = require( 'express');

const { getProducts, instantiateOrUpdateProduct, getProduct, setDescription }  = require( '../controllers/sellerProductsViews.js');

const router = express.Router();
router.get('/p', getProducts);
router.get('/p/:id', getProduct);
router.post('/p/:id', instantiateOrUpdateProduct);

router.put('/d/:id',setDescription)
module.exports = router;