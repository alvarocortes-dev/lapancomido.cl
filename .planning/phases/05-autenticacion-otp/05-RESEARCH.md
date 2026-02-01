# Phase 5: Autenticacion OTP - Research

**Researched:** 2026-02-01
**Domain:** Authentication, OTP, Device Trust, Role-Based Access Control
**Confidence:** HIGH

## Summary

This phase implements a secure OTP-based authentication system for the admin panel. The research covers password hashing with bcrypt, JWT-based sessions, OTP generation and delivery via Resend, device fingerprinting for trusted device management, and role-based access control. The existing project already has `bcrypt@5.1.1`, `jsonwebtoken@9.0.2`, and `resend@6.9.1` installed, along with middleware patterns for JWT validation.

The recommended approach uses a **simple device trust token** stored in localStorage combined with server-side trusted device tracking, rather than complex browser fingerprinting. This avoids the overkill of FingerprintJS for a 2-user system while still providing "new device" detection. OTPs are 6-digit numeric codes with 10-minute expiry, hashed before storage, and sent via the already-configured Resend integration.

The predefined users (dev and admin) are seeded via Prisma with `password_required: true` flag, forcing password setup on first login. JWT tokens are issued with 30-day expiry for trusted devices, and role-based middleware restricts feature access based on `dev` vs `admin` roles.

**Primary recommendation:** Use simple device trust tokens + localStorage for device identification, bcrypt for password hashing, 6-digit OTP via Resend, and JWT with 30-day expiry for trusted device sessions.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| bcrypt | ^5.1.1 | Password hashing | Already installed. Industry standard, native bindings, timing-safe comparison |
| jsonwebtoken | ^9.0.2 | JWT session tokens | Already installed. Auth0's reference implementation, 18k+ stars |
| resend | ^6.9.1 | OTP email delivery | Already configured in project for contact form |
| crypto (Node.js built-in) | - | Secure OTP generation | No external dependency needed for random number generation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| express-rate-limit | ^7.6.0 | Rate limiting auth endpoints | Already in dependencies, apply to login/OTP routes |
| helmet | ^8.1.0 | Security headers | Already in dependencies, apply to all routes |
| uuid | ^11.1.0 | Device trust token generation | Simple, cryptographically random UUIDs for device tokens |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| bcrypt | argon2 | Argon2 is newer/OWASP recommended but bcrypt is already installed and sufficient for 2-user system |
| Simple device token | FingerprintJS | FP.js is overkill for 2 users; simple token + server tracking provides sufficient security |
| 6-digit OTP | 8-digit OTP | 6 digits is industry standard for email OTP; 8 needed only for high-security contexts |

**Installation:**
```bash
# Already installed - no new packages needed for core auth
# Only need uuid for device tokens:
npm install uuid
```

## Architecture Patterns

### Recommended Project Structure
```
apps/api/src/
├── controllers/
│   └── auth.controller.js     # Login, OTP verification, password setup
├── middlewares/
│   ├── validateToken.js       # Existing - JWT verification
│   ├── isAdmin.js             # Existing - Role check for admin+dev
│   ├── isDeveloper.js         # NEW - Role check for dev only
│   └── requireOTP.js          # NEW - Check if device is trusted
├── services/
│   └── auth.service.js        # OTP generation, email sending, token management
├── routes/
│   └── auth.routes.js         # Auth endpoints
└── utils/
    └── crypto.js              # OTP generation, secure random

packages/database/prisma/
├── schema.prisma              # User, TrustedDevice, OTPToken models
└── seed.js                    # Predefined users (dev, admin)
```

### Pattern 1: JWT Token Strategy
**What:** Use JWT access tokens with device trust tokens for 30-day sessions
**When to use:** Admin authentication with trusted device management
**Example:**
```javascript
// Source: jsonwebtoken GitHub README
const jwt = require('jsonwebtoken');

// Sign token with 30-day expiry for trusted devices
const token = jwt.sign(
  { 
    userId: user.id,
    role: user.role,
    deviceId: trustedDevice.id,
    email: user.email
  },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Pattern 2: OTP Generation and Storage
**What:** Generate cryptographically secure 6-digit OTP, hash before storage
**When to use:** New device login verification
**Example:**
```javascript
// Source: Node.js crypto module + OWASP recommendations
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Store hashed OTP with expiry
async function createOTPToken(userId, otp) {
  const hashedOTP = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  await prisma.otpToken.create({
    data: {
      userId,
      hashedCode: hashedOTP,
      expiresAt,
      used: false
    }
  });
}

// Verify OTP (timing-safe via bcrypt.compare)
async function verifyOTP(userId, inputOTP) {
  const token = await prisma.otpToken.findFirst({
    where: { userId, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!token) return false;
  
  const isValid = await bcrypt.compare(inputOTP, token.hashedCode);
  if (isValid) {
    await prisma.otpToken.update({
      where: { id: token.id },
      data: { used: true }
    });
  }
  return isValid;
}
```

### Pattern 3: Device Trust Token
**What:** Server-generated UUID stored in client localStorage, validated against database
**When to use:** Identify returning trusted devices without requiring OTP
**Example:**
```javascript
// Source: OWASP Authentication Cheat Sheet patterns
const { v4: uuidv4 } = require('uuid');

// Create trusted device after successful OTP verification
async function createTrustedDevice(userId, userAgent, ipAddress) {
  const deviceToken = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  const device = await prisma.trustedDevice.create({
    data: {
      userId,
      deviceToken, // Store plain - acts as lookup key
      userAgent,
      ipAddress,
      expiresAt,
      lastUsedAt: new Date()
    }
  });
  
  return deviceToken; // Return to client for localStorage storage
}

// Check if device is trusted
async function isDeviceTrusted(userId, deviceToken) {
  if (!deviceToken) return false;
  
  const device = await prisma.trustedDevice.findFirst({
    where: {
      userId,
      deviceToken,
      expiresAt: { gt: new Date() }
    }
  });
  
  if (device) {
    // Update last used
    await prisma.trustedDevice.update({
      where: { id: device.id },
      data: { lastUsedAt: new Date() }
    });
    return true;
  }
  return false;
}
```

### Pattern 4: First-Time Setup Flow
**What:** Predefined users with `passwordSetupRequired` flag must set password on first login
**When to use:** Initial admin setup for dev and admin users
**Example:**
```javascript
// Login controller handling first-time setup
async function login(req, res) {
  const { username, password, email } = req.body;
  
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // First-time setup: user must provide new password and email
  if (user.passwordSetupRequired) {
    if (!email || !password) {
      return res.status(400).json({ 
        setupRequired: true,
        error: 'First login requires email and new password' 
      });
    }
    
    // Hash and save new credentials
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        passwordHash: hashedPassword,
        passwordSetupRequired: false
      }
    });
    
    // Continue with normal login flow...
  }
  
  // Normal login with password verification
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Check device trust, potentially trigger OTP...
}
```

### Pattern 5: Role-Based Access Control
**What:** Middleware chain checking JWT role against required permission level
**When to use:** Protecting admin vs developer-only routes
**Example:**
```javascript
// Existing isAdmin middleware already handles both roles
// Source: apps/api/src/middlewares/isAdmin.js
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ error: "Acceso denegado: rol no especificado." });
  }
  if (req.user.role !== "admin" && req.user.role !== "developer") {
    return res.status(403).json({ error: "Acceso denegado: no tienes permisos." });
  }
  next();
};

// NEW: Developer-only middleware for feature toggles
const isDeveloper = (req, res, next) => {
  if (!req.user || req.user.role !== "developer") {
    return res.status(403).json({ error: "Acceso denegado: requiere rol developer." });
  }
  next();
};

// Usage in routes:
router.get('/admin/products', validateToken, isAdmin, getProducts);
router.post('/admin/feature-toggles', validateToken, isDeveloper, updateToggles);
```

### Anti-Patterns to Avoid
- **Storing OTP in plain text:** Always hash OTPs with bcrypt before storage
- **OTP without expiry:** OTPs must expire (10 minutes recommended)
- **OTP without rate limiting:** Apply rate limits to prevent brute-force
- **Reusable OTP:** Mark OTP as used immediately after successful verification
- **Session in URL:** Never put tokens in URLs; use Authorization header or httpOnly cookies
- **Generic error messages missing:** Use "Invalid credentials" for both wrong user and wrong password

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom hash function | bcrypt | Timing attacks, salt management, work factor tuning |
| Random OTP generation | Math.random() | crypto.randomInt() | Math.random is not cryptographically secure |
| JWT validation | Manual token parsing | jsonwebtoken.verify() | Signature validation, expiry checking, algorithm attacks |
| Rate limiting | Manual counters | express-rate-limit | Sliding windows, store backends, header handling |
| Email delivery | SMTP directly | Resend SDK | Deliverability, templates, error handling |
| UUID generation | Custom random strings | uuid package | RFC compliance, collision resistance |

**Key insight:** Authentication is a security-critical domain where subtle implementation bugs create serious vulnerabilities. Use battle-tested libraries for all crypto, token, and rate-limiting operations.

## Common Pitfalls

### Pitfall 1: OTP on Every Login
**What goes wrong:** Bakery owner gets frustrated entering OTP every time they access admin
**Why it happens:** Device trust not implemented; treating every login as new device
**How to avoid:** Implement device trust tokens with 30-day validity; only require OTP for new devices
**Warning signs:** User complaints, reduced admin usage, users writing down OTPs

### Pitfall 2: Storing OTP in Plain Text
**What goes wrong:** Database breach exposes valid OTPs
**Why it happens:** Developer treats OTP like session token rather than secret
**How to avoid:** Hash OTP with bcrypt before storage; verify with timing-safe compare
**Warning signs:** OTP visible in database queries, no hash column in OTP table

### Pitfall 3: OTP Without Expiry or Single-Use
**What goes wrong:** Attacker intercepts OTP email, uses it hours later
**Why it happens:** Missing expiry logic, OTP not marked as used after verification
**How to avoid:** 10-minute expiry, mark `used: true` immediately on successful verification
**Warning signs:** OTP table grows unboundedly, same OTP works twice

### Pitfall 4: Rate Limiting Missing on Auth Endpoints
**What goes wrong:** Attacker brute-forces 6-digit OTP (only 1 million combinations)
**Why it happens:** Rate limiting applied globally but not strictly on auth routes
**How to avoid:** Apply strict per-IP and per-user rate limits: 5 attempts per 15 minutes
**Warning signs:** Auth endpoints in access logs with high frequency from single IP

### Pitfall 5: JWT Secret in Code or Weak
**What goes wrong:** Attacker forges valid JWTs
**Why it happens:** Secret hardcoded, too short, or predictable
**How to avoid:** Generate 256-bit random secret, store in environment variable
**Warning signs:** JWT_SECRET in git history, secret shorter than 32 characters

### Pitfall 6: First-Login Flow Without Forced Password Change
**What goes wrong:** Predefined users keep default/empty password
**Why it happens:** `passwordSetupRequired` flag not enforced in middleware
**How to avoid:** Check flag on every login; reject until password is set
**Warning signs:** Users with `passwordSetupRequired: true` and a `passwordHash` set

### Pitfall 7: Resend Email Ending in Spam
**What goes wrong:** OTP emails not delivered or marked as spam
**Why it happens:** Using `onboarding@resend.dev` sender in production
**How to avoid:** Verify domain in Resend, use branded sender like `admin@lapancomido.cl`
**Warning signs:** OTP emails in spam folder, delayed delivery, Resend dashboard errors

## Code Examples

Verified patterns from official sources:

### Prisma Schema for Auth Models
```prisma
// Source: Prisma docs + OWASP patterns
model users {
  id                    Int       @id @default(autoincrement())
  username              String    @unique  // "dev" or "admin"
  email                 String?   @unique
  passwordHash          String?
  role                  String    @default("admin")  // "admin" or "developer"
  passwordSetupRequired Boolean   @default(true)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @default(now()) @updatedAt
  
  // Relations
  otpTokens       otp_tokens[]
  trustedDevices  trusted_devices[]
  
  @@schema("pancomido")
}

model otp_tokens {
  id         Int      @id @default(autoincrement())
  userId     Int
  hashedCode String
  expiresAt  DateTime
  used       Boolean  @default(false)
  createdAt  DateTime @default(now())
  
  // Relations
  user users @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, used, expiresAt])
  @@schema("pancomido")
}

model trusted_devices {
  id          Int      @id @default(autoincrement())
  userId      Int
  deviceToken String   @unique
  userAgent   String?
  ipAddress   String?
  expiresAt   DateTime
  lastUsedAt  DateTime @default(now())
  createdAt   DateTime @default(now())
  
  // Relations
  user users @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, deviceToken])
  @@schema("pancomido")
}
```

### Prisma Seed for Predefined Users
```javascript
// Source: Prisma seeding docs
// packages/database/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create predefined users - passwords will be set on first login
  const devUser = await prisma.users.upsert({
    where: { username: 'dev' },
    update: {},
    create: {
      username: 'dev',
      role: 'developer',
      passwordSetupRequired: true
    }
  });
  
  const adminUser = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      role: 'admin',
      passwordSetupRequired: true
    }
  });
  
  console.log('Seeded users:', { devUser, adminUser });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

### OTP Email Template with Resend
```javascript
// Source: Resend docs + existing contact.controller.js pattern
const { Resend } = require('resend');

async function sendOTPEmail(email, otp, username) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const { data, error } = await resend.emails.send({
    from: 'La Pan Comido <admin@lapancomido.cl>', // Use verified domain
    to: [email],
    subject: 'Tu codigo de verificacion - La Pan Comido Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #262011; border-bottom: 2px solid #F5E1A4; padding-bottom: 10px;">
          Codigo de Verificacion
        </h2>
        
        <p>Hola ${username},</p>
        
        <p>Recibimos una solicitud de inicio de sesion desde un nuevo dispositivo.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #666;">Tu codigo de verificacion:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; color: #262011;">
            ${otp}
          </p>
          <p style="margin: 0; font-size: 12px; color: #999;">
            Este codigo expira en 10 minutos
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Si no solicitaste este codigo, ignora este correo.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          La Pan Comido - Panel de Administracion
        </p>
      </div>
    `
  });
  
  if (error) {
    console.error('Resend OTP error:', error);
    throw new Error('Failed to send OTP email');
  }
  
  return data;
}
```

### Rate Limiting Configuration
```javascript
// Source: express-rate-limit docs
const rateLimit = require('express-rate-limit');

// Strict rate limit for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { 
    error: 'Demasiados intentos de inicio de sesion. Intenta de nuevo en 15 minutos.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.username || req.ip // Rate limit per user+IP
});

// Rate limit for OTP verification
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { 
    error: 'Demasiados intentos de verificacion. Intenta de nuevo en 15 minutos.' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply to auth routes
router.post('/auth/login', loginLimiter, authController.login);
router.post('/auth/verify-otp', otpLimiter, authController.verifyOTP);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| bcrypt | argon2id | OWASP 2023 | Argon2 is now recommended, but bcrypt still acceptable |
| JWT in localStorage | httpOnly cookies | 2020+ | Better XSS protection, but CORS complexity |
| Complex fingerprinting | Simple device tokens | 2024+ | Privacy concerns reduced fingerprinting reliability |
| SMS OTP | Email OTP / Authenticator | 2022+ | SIM swap attacks made SMS less secure |

**Deprecated/outdated:**
- **MD5/SHA1 for passwords:** Use bcrypt with cost factor 10+
- **Self-hosted SMTP:** Use transactional email services (Resend, SendGrid)
- **Session IDs in URL:** Use Authorization header or secure cookies

## Open Questions

Things that couldn't be fully resolved:

1. **Domain Verification for Resend**
   - What we know: Currently using `onboarding@resend.dev` which works for dev but may hit spam filters
   - What's unclear: Is `lapancomido.cl` domain already verified in Resend?
   - Recommendation: Verify domain in Resend dashboard before production; use `admin@lapancomido.cl` or `noreply@lapancomido.cl`

2. **JWT Storage: localStorage vs httpOnly Cookie**
   - What we know: httpOnly cookies provide XSS protection but add CORS complexity
   - What's unclear: Current admin frontend architecture and cookie handling capability
   - Recommendation: Start with Authorization header + localStorage (existing pattern), document upgrade path to httpOnly cookies

3. **Maximum Trusted Devices per User**
   - What we know: Need to prevent unbounded device accumulation
   - What's unclear: Practical limit for bakery admin use case
   - Recommendation: Limit to 5 trusted devices per user; oldest auto-removed when limit reached

## Sources

### Primary (HIGH confidence)
- bcrypt GitHub README - https://github.com/kelektiv/node.bcrypt.js (version 5.1.1, API usage, salt rounds)
- jsonwebtoken GitHub README - https://github.com/auth0/node-jsonwebtoken (version 9.0.2, sign/verify API)
- Resend Node.js Docs - https://resend.com/docs/send-with-nodejs (email sending pattern)
- OWASP Authentication Cheat Sheet - https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html (password policies, MFA, error messages)
- OWASP Forgot Password Cheat Sheet - https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html (OTP best practices, token handling)
- Prisma Seeding Docs - https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding (seed script patterns)

### Secondary (MEDIUM confidence)
- FingerprintJS GitHub README - https://github.com/fingerprintjs/fingerprintjs (evaluated, determined overkill for 2-user system)
- Node.js crypto.randomInt docs - Node.js official documentation (secure random generation)

### Tertiary (LOW confidence)
- Express-rate-limit configuration - Based on common patterns, verify against current package version

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and verified against official docs
- Architecture: HIGH - Patterns match existing codebase style and OWASP recommendations
- Pitfalls: HIGH - Based on OWASP cheat sheets and known authentication vulnerabilities

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - auth patterns are stable)
