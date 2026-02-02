// src/controllers/consultations.controller.js
import { prisma } from '@lapancomido/database';

/**
 * Get consultations with pagination and filters (admin endpoint)
 * Supports: page, limit, from, to, search (by customer name)
 */
export const getConsultations = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 15, 
      from, 
      to, 
      search 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};

    // Date range filter
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = new Date(from);
      if (to) where.created_at.lte = new Date(to);
    }

    // Search by customer name (case insensitive)
    if (search) {
      where.customer_name = { 
        contains: search, 
        mode: 'insensitive' 
      };
    }

    // Execute queries in parallel
    const [consultations, total] = await Promise.all([
      prisma.consultations.findMany({
        where,
        include: { items: true },
        orderBy: { created_at: 'desc' },
        skip,
        take
      }),
      prisma.consultations.count({ where })
    ]);

    res.json({ 
      items: consultations, 
      total, 
      page: parseInt(page), 
      limit: take 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save consultation from customer quotation (public endpoint)
 * Fire-and-forget from frontend - should be fast and never block WhatsApp flow
 */
export const saveConsultation = async (req, res, next) => {
  try {
    const { customerName, customerPhone, products } = req.body;

    // Basic validation
    if (!customerName || !customerPhone || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build items with calculated subtotals
    const items = products.map(p => ({
      product_id: p.productId,
      product_name: p.productName,
      unit_price: p.unitPrice,
      quantity: p.quantity,
      subtotal: Number(p.unitPrice) * Number(p.quantity)
    }));

    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const productCount = items.length;

    // Create consultation with nested items
    const consultation = await prisma.consultations.create({
      data: {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        total_amount: totalAmount,
        product_count: productCount,
        items: {
          create: items
        }
      }
    });

    res.status(201).json({ id: consultation.id });
  } catch (error) {
    next(error);
  }
};
