// src/routes/routes.js

import express from 'express';
const router = express.Router();

import productRoutes from './product.routes.js';
import adminRoutes from './admin.routes.js';
import productImagesRoutes from './productImages.routes.js';
import uploadRoute from './uploadRoute.js';
import categoriesRoutes from './categories.routes.js';
import storeRoutes from './store.routes.js';
import contactRoutes from './contact.routes.js';
import authRoutes from './auth.routes.js';

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/admin', adminRoutes);
router.use('/product-images', productImagesRoutes);
router.use('/upload', uploadRoute);
router.use('/categories', categoriesRoutes);
router.use('/store', storeRoutes);
router.use('/contact', contactRoutes);

router.get('/test', (req, res) => res.json({ message: 'API funcionando' }));

export default router;
