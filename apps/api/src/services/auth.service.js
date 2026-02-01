// src/services/auth.service.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Resend } = require('resend');
const prisma = require('@lapancomido/database');

// Lazy Resend initialization (same pattern as contact.controller.js)
let resendInstance = null;
const getResend = () => {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
};

// Constants per CONTEXT.md
const OTP_EXPIRY_MINUTES = 5;
const OTP_DIGITS = 8;
const OTP_MAX_ATTEMPTS = 3;
const OTP_BLOCK_MINUTES = 15;
const DEVICE_EXPIRY_DAYS = 30;
const MAX_TRUSTED_DEVICES = 5;
const SALT_ROUNDS = 10;

// Resend cooldowns per CONTEXT.md: 1st immediate, 2nd 15s, 3rd+ 30s
const RESEND_COOLDOWNS = [0, 15, 30]; // seconds

/**
 * Generate 8-digit OTP (per CONTEXT.md)
 */
function generateOTP() {
  const min = Math.pow(10, OTP_DIGITS - 1);
  const max = Math.pow(10, OTP_DIGITS) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Get resend cooldown in seconds based on attempt number
 * @param {number} resendCount - Number of resends already done (0-based)
 */
function getResendCooldown(resendCount) {
  if (resendCount >= RESEND_COOLDOWNS.length) {
    return RESEND_COOLDOWNS[RESEND_COOLDOWNS.length - 1];
  }
  return RESEND_COOLDOWNS[resendCount];
}

/**
 * Create and store a hashed OTP for a user
 * @param {number} userId
 * @param {string} purpose - 'login' | 'setup'
 * @returns {string} The plain OTP (to be sent via email)
 */
async function createOTPToken(userId, purpose = 'login') {
  const otp = generateOTP();
  const hashedCode = await bcrypt.hash(otp, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  
  // Invalidate any existing unused OTPs for this user with same purpose
  await prisma.otp_tokens.updateMany({
    where: { userId, purpose, used: false },
    data: { used: true }
  });
  
  // Create new OTP token
  await prisma.otp_tokens.create({
    data: {
      userId,
      hashedCode,
      purpose,
      expiresAt,
      used: false
    }
  });
  
  return otp;
}

/**
 * Verify an OTP for a user (timing-safe via bcrypt.compare)
 * @returns {{ valid: boolean, attemptsRemaining?: number, blocked?: boolean }}
 */
async function verifyOTPToken(userId, inputOTP, purpose = 'login') {
  const user = await prisma.users.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    return { valid: false };
  }
  
  // Check if blocked
  if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
    return { valid: false, blocked: true };
  }
  
  // Find valid OTP
  const token = await prisma.otp_tokens.findFirst({
    where: { 
      userId, 
      purpose,
      used: false, 
      expiresAt: { gt: new Date() } 
    },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!token) {
    return { valid: false, expired: true };
  }
  
  const isValid = await bcrypt.compare(inputOTP, token.hashedCode);
  
  if (isValid) {
    // Mark as used and reset attempts
    await prisma.otp_tokens.update({
      where: { id: token.id },
      data: { used: true }
    });
    
    await prisma.users.update({
      where: { id: userId },
      data: { otpAttempts: 0, otpBlockedUntil: null }
    });
    
    return { valid: true };
  }
  
  // Invalid - increment attempts
  const newAttempts = user.otpAttempts + 1;
  const updateData = { otpAttempts: newAttempts };
  
  if (newAttempts >= OTP_MAX_ATTEMPTS) {
    updateData.otpBlockedUntil = new Date(Date.now() + OTP_BLOCK_MINUTES * 60 * 1000);
    updateData.otpAttempts = 0;
    
    await prisma.users.update({
      where: { id: userId },
      data: updateData
    });
    
    return { valid: false, blocked: true, justBlocked: true };
  }
  
  await prisma.users.update({
    where: { id: userId },
    data: updateData
  });
  
  return { 
    valid: false, 
    attemptsRemaining: OTP_MAX_ATTEMPTS - newAttempts 
  };
}

/**
 * Send OTP email via Resend
 */
async function sendOTPEmail(email, otp, username, purpose = 'login') {
  const resend = getResend();
  
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - OTP email disabled');
    // In dev, just log the OTP
    console.log(`[DEV] OTP for ${username} (${purpose}): ${otp}`);
    return { id: 'dev-mode' };
  }
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'La Pan Comido <onboarding@resend.dev>';
  const subjectPrefix = purpose === 'setup' ? 'Configura tu cuenta' : 'Código de verificación';
  
  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: `${subjectPrefix} - La Pan Comido Admin`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #262011; border-bottom: 2px solid #F5E1A4; padding-bottom: 10px;">
          ${purpose === 'setup' ? 'Verifica tu Email' : 'Código de Verificación'}
        </h2>
        
        <p>Hola ${username},</p>
        
        <p>${purpose === 'setup' 
          ? 'Usa este código para verificar tu email y completar la configuración de tu cuenta.'
          : 'Recibimos una solicitud de inicio de sesión desde un nuevo dispositivo.'
        }</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #666;">Tu código de verificación:</p>
          <p style="font-size: 36px; font-weight: bold; letter-spacing: 4px; margin: 10px 0; color: #262011; font-family: monospace;">
            ${otp}
          </p>
          <p style="margin: 0; font-size: 12px; color: #999;">
            Este código expira en ${OTP_EXPIRY_MINUTES} minutos
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Si no solicitaste este código, ignora este correo.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          La Pan Comido - Panel de Administración
        </p>
      </div>
    `
  });
  
  if (error) {
    console.error('Resend OTP error:', error);
    throw new Error('Error al enviar email de verificación');
  }
  
  console.log('OTP email sent to:', email, 'Resend ID:', data?.id);
  return data;
}

/**
 * Check if a device is trusted via cookie
 * @param {number} userId
 * @param {string} deviceToken - Token from httpOnly cookie
 */
async function isDeviceTrusted(userId, deviceToken) {
  if (!deviceToken) return false;
  
  const device = await prisma.trusted_devices.findFirst({
    where: {
      userId,
      deviceToken,
      expiresAt: { gt: new Date() }
    }
  });
  
  if (device) {
    // Update last used timestamp
    await prisma.trusted_devices.update({
      where: { id: device.id },
      data: { lastUsedAt: new Date() }
    });
    return true;
  }
  
  return false;
}

/**
 * Create a trusted device after successful OTP verification
 * @returns {string} The device token to store in httpOnly cookie
 */
async function createTrustedDevice(userId, userAgent, ipAddress) {
  const deviceToken = uuidv4();
  const expiresAt = new Date(Date.now() + DEVICE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  // Check device count and remove oldest if limit reached
  const deviceCount = await prisma.trusted_devices.count({
    where: { userId }
  });
  
  if (deviceCount >= MAX_TRUSTED_DEVICES) {
    // Delete oldest device
    const oldestDevice = await prisma.trusted_devices.findFirst({
      where: { userId },
      orderBy: { lastUsedAt: 'asc' }
    });
    if (oldestDevice) {
      await prisma.trusted_devices.delete({
        where: { id: oldestDevice.id }
      });
    }
  }
  
  // Create new trusted device
  await prisma.trusted_devices.create({
    data: {
      userId,
      deviceToken,
      userAgent: userAgent?.substring(0, 500),
      ipAddress,
      expiresAt,
      lastUsedAt: new Date()
    }
  });
  
  return deviceToken;
}

/**
 * Delete all trusted devices for a user (logout all sessions)
 */
async function revokeAllDevices(userId) {
  const result = await prisma.trusted_devices.deleteMany({
    where: { userId }
  });
  return result.count;
}

/**
 * Cookie options for device trust token
 */
const DEVICE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: DEVICE_EXPIRY_DAYS * 24 * 60 * 60 * 1000, // 30 days in ms
  path: '/'
};

const DEVICE_COOKIE_NAME = 'lpc_device_trust';

module.exports = {
  generateOTP,
  createOTPToken,
  verifyOTPToken,
  sendOTPEmail,
  isDeviceTrusted,
  createTrustedDevice,
  revokeAllDevices,
  getResendCooldown,
  DEVICE_COOKIE_OPTIONS,
  DEVICE_COOKIE_NAME,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_BLOCK_MINUTES,
  DEVICE_EXPIRY_DAYS
};
