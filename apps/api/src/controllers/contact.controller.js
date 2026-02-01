// src/controllers/contact.controller.js
const { Resend } = require('resend');

// Lazy initialization - only create Resend instance when needed
let resendInstance = null;

const getResend = () => {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return null;
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
};

// Contact email - configurable via env var, default to lapancomido@gmail.com
const getContactEmail = () => process.env.CONTACT_EMAIL || 'lapancomido@gmail.com';

// From email - use verified domain if available, otherwise test domain
const getFromEmail = () => process.env.RESEND_FROM_EMAIL || 'La Pan Comido <contacto@lapancomido.cl>';

/**
 * Send contact form message via Resend
 */
const sendContactMessage = async (req, res) => {
  try {
    const { fullName, email, phone, message } = req.body;

    // Validation
    if (!fullName || !email || !phone || !message) {
      return res.status(400).json({
        error: 'Todos los campos son requeridos'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }

    // Check if Resend is configured
    const resend = getResend();
    if (!resend) {
      console.warn('RESEND_API_KEY not configured - contact form disabled');
      return res.status(503).json({
        error: 'El servicio de contacto no está disponible temporalmente'
      });
    }

    // Get contact email from env var or use default
    const contactEmail = getContactEmail();
    const fromEmail = getFromEmail();

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [contactEmail],
      replyTo: email,
      subject: `Contacto Web: Nuevo mensaje de ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #262011; border-bottom: 2px solid #F5E1A4; padding-bottom: 10px;">
            Nuevo mensaje de contacto
          </h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Nombre:</strong> ${fullName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Teléfono:</strong> ${phone}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #262011; margin-top: 0;">Mensaje:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Este mensaje fue enviado desde el formulario de contacto de La Pan Comido.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', JSON.stringify(error, null, 2));
      console.error('Config - from:', fromEmail, 'to:', contactEmail);
      
      // Check for common Resend errors
      let userMessage = 'Error al enviar el mensaje. Por favor intenta más tarde.';
      
      if (error.message?.includes('domain') || error.message?.includes('verify')) {
        console.error('Domain not verified in Resend. Set RESEND_FROM_EMAIL to a verified domain.');
        userMessage = 'El servicio de correo no está configurado correctamente.';
      }
      
      return res.status(500).json({
        error: userMessage,
        details: process.env.NODE_ENV !== 'production' ? error : undefined
      });
    }

    console.log('Contact email sent:', data);

    res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente'
    });

  } catch (error) {
    console.error('Contact controller error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  sendContactMessage,
};
