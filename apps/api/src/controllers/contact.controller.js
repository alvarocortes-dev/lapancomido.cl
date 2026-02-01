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

// Default contact email - will be configurable by admin later
const DEFAULT_CONTACT_EMAIL = 'lapancomido@gmail.com';

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

    // Get contact email from store config or use default
    // TODO: Fetch from database when admin panel is ready
    const contactEmail = DEFAULT_CONTACT_EMAIL;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'La Pan Comido <onboarding@resend.dev>',
      to: [contactEmail],
      replyTo: email,
      subject: `Nuevo mensaje de contacto de ${fullName}`,
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
      console.error('Resend error:', error);
      return res.status(500).json({
        error: 'Error al enviar el mensaje'
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
