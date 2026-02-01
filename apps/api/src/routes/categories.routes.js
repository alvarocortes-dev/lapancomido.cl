// src/routes/categories.routes.js
import express from 'express';
const router = express.Router();
import { getCategories } from '../controllers/categories.controller.js';

router.get('/', getCategories);

export default router;
