// src/controllers/siteContent.controller.js
import { prisma } from '@lapancomido/database';

/**
 * GET /api/site-content
 * Public endpoint - returns all site content for the web frontend
 */
const getAllContent = async (req, res, next) => {
  try {
    const content = await prisma.site_content.findMany();
    
    // Return array with key and value for admin consumption
    res.json(content);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/site-content/:key
 * Public endpoint - returns specific content by key
 */
const getContent = async (req, res, next) => {
  try {
    const { key } = req.params;
    
    const content = await prisma.site_content.findUnique({
      where: { key }
    });
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content.value);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/site-content/:key
 * Admin endpoint - update specific content
 */
const updateContent = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    const content = await prisma.site_content.upsert({
      where: { key },
      update: { 
        value,
        updated_at: new Date()
      },
      create: {
        key,
        value
      }
    });
    
    res.json(content);
  } catch (err) {
    next(err);
  }
};

export {
  getAllContent,
  getContent,
  updateContent
};
