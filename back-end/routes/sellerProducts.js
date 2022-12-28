import express from 'express';

import { getProducts, createProduct, getProduct, updateProduct } from '../controllers/sellerProducts.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProduct);
router.patch('/:id', updateProduct);

export default router;