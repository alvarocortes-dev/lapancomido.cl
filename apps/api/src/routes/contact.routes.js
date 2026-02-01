// src/routes/contact.routes.js
import express from 'express';
const router = express.Router();
import { sendContactMessage } from '../controllers/contact.controller.js';

// POST /api/contact - Send contact form message
router.post('/', sendContactMessage);

export default router;
