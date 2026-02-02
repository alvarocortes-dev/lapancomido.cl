// src/routes/siteContent.routes.js
import express from 'express';
import * as siteContentController from '../controllers/siteContent.controller.js';

const router = express.Router();

// Public routes
router.get('/', siteContentController.getAllContent);
router.get('/:key', siteContentController.getContent);

export default router;
