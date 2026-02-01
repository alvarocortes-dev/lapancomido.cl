// backend/src/controllers/store.controller.js
const { prisma } = require('@lapancomido/database');

/**
 * Get public store configuration
 * Returns config needed for quotation flow (whatsapp number, greeting, price visibility)
 */
const getStoreConfig = async (req, res, next) => {
  try {
    // Get first (and only) store config record
    let config = await prisma.store_config.findFirst();

    // If no config exists, create default
    if (!config) {
      config = await prisma.store_config.create({
        data: {
          whatsapp_number: '56992800153', // Default WhatsApp number
          greeting: 'Hola! Hay pan? <3',
          show_prices: true
        }
      });
    }

    res.json({
      whatsapp_number: config.whatsapp_number,
      greeting: config.greeting,
      show_prices: config.show_prices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save customer lead from quotation
 * Stores email for future promotions (email not included in WhatsApp message)
 */
const saveQuotationLead = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const lead = await prisma.quotation_leads.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null
      }
    });

    res.status(201).json({ id: lead.id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStoreConfig, saveQuotationLead };
