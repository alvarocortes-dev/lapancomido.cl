// src/helpers/whatsapp.helper.js
import { formatCLP } from "./formatPrice.helper";

/**
 * Format a single product line for WhatsApp message
 * @param {Object} product - Product with name, quantity, unit_type, pack_size, price
 * @param {boolean} showPrices - Whether to include prices
 * @returns {string} Formatted product line
 */
const formatProductLine = (product, showPrices) => {
  const { product: name, quantity, unit_type, pack_size, price } = product;
  const lineTotal = quantity * Number(price);
  const unitPrice = Number(price);
  
  let line = `- ${name} x ${quantity}`;
  
  if (unit_type === 'pack' && pack_size) {
    // "x 2 pack (6 un c/p)"
    line += ` pack (${pack_size} un c/p)`;
  } else {
    line += ' un';
  }
  
  if (showPrices) {
    line += ` = ${formatCLP(lineTotal)}`;
    if (quantity > 1) {
      // Show unit price: "($1.000 c/u)" or "($3.000 c/p)"
      line += ` (${formatCLP(unitPrice)} c/${unit_type === 'pack' ? 'p' : 'u'})`;
    }
  }
  
  return line;
};

/**
 * Format the complete WhatsApp message
 * @param {Object} params - Message parameters
 * @param {string} params.customerName - Customer's full name
 * @param {string} params.customerPhone - Customer's phone (E.164 format)
 * @param {Array} params.products - Array of selected products
 * @param {string} params.greeting - Greeting message from admin config
 * @param {boolean} params.showPrices - Whether to show prices
 * @param {string} params.comment - Optional customer comment
 * @returns {string} Complete formatted message
 */
export const formatWhatsAppMessage = ({
  customerName,
  customerPhone,
  products,
  greeting,
  showPrices,
  comment
}) => {
  let message = `${greeting}\n\n`;
  message += `Cliente: ${customerName}\n`;
  message += `Celular: ${customerPhone}\n\n`;
  message += `Productos:\n`;
  
  let total = 0;
  products.forEach((product) => {
    message += formatProductLine(product, showPrices) + '\n';
    total += product.quantity * Number(product.price);
  });
  
  if (showPrices) {
    message += `\nTotal a consultar: ${formatCLP(total)}\n`;
  }
  
  if (comment && comment.trim()) {
    message += `\nComentario: ${comment.trim()}\n`;
  }
  
  message += `\nFavor confirmar stock, gracias!`;
  
  return message;
};

/**
 * Generate WhatsApp wa.me link
 * @param {string} phoneNumber - Store's WhatsApp number (E.164 without +, e.g., "56912345678")
 * @param {Object} params - Message parameters (same as formatWhatsAppMessage)
 * @returns {string} Complete wa.me URL
 */
export const generateWhatsAppLink = (phoneNumber, params) => {
  // Ensure phone number has no + or spaces
  const cleanPhone = phoneNumber.replace(/[+\s-]/g, '');
  
  const message = formatWhatsAppMessage(params);
  
  // Use encodeURIComponent for proper URL encoding (handles emojis, newlines, special chars)
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
