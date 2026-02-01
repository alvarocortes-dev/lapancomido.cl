---
phase: 05-autenticacion-otp
plan: 02
status: complete
duration: ~10 min
---

# Plan 05-02 Summary: OTP Login Flow + Device Trust + Resend Email

## What Was Built

### Task 1: Auth Service (`apps/api/src/services/auth.service.js`)
Created comprehensive auth service with:
- **OTP Generation**: 8-digit cryptographically random OTP
- **OTP Management**: `createOTPToken()`, `verifyOTPToken()` with bcrypt hashing
- **Email Sending**: `sendOTPEmail()` via Resend with branded HTML template
- **Device Trust**: `isDeviceTrusted()`, `createTrustedDevice()`, `revokeAllDevices()`
- **Resend Cooldowns**: Progressive cooldowns (0s, 15s, 30s+)
- **Cookie Config**: httpOnly, secure in prod, 30-day expiry

### Task 2: Updated Auth Controller
Extended `apps/api/src/controllers/auth.controller.js` with:
- **Modified login()**: Now checks device trust cookie, sends OTP for new devices
- **verifyLoginOTP()**: Validates OTP, optionally trusts device with checkbox
- **resendOTP()**: Handles resends with progressive cooldowns, creates new token
- **logoutAll()**: Revokes all trusted devices, clears cookie
- **maskEmail()**: Helper to display masked email (t***t@gmail.com)

### Task 3: Updated Routes and Dependencies
- Updated `apps/api/src/routes/auth.routes.js`:
  - Added rate limiting (20 requests per 15 min window)
  - Added `/verify-login-otp` and `/resend-otp` routes
  - Added `/logout-all` route with `validateToken` middleware
- Updated `apps/api/src/server.js`:
  - Added `cookie-parser` middleware for device trust cookies
- Installed: `uuid`, `cookie-parser`, `express-rate-limit`

## Files Modified/Created
- `apps/api/src/services/auth.service.js` (created)
- `apps/api/src/controllers/auth.controller.js` (modified - 7 exports)
- `apps/api/src/routes/auth.routes.js` (modified - 7 routes)
- `apps/api/src/server.js` (modified - added cookie-parser)
- `apps/api/package.json` (deps added)

## API Endpoints (Complete)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns setupRequired or otpRequired or success |
| POST | `/api/auth/initiate-setup` | First-time: send OTP to email |
| POST | `/api/auth/verify-setup-otp` | Verify email OTP |
| POST | `/api/auth/complete-setup` | Set new password |
| POST | `/api/auth/verify-login-otp` | Verify login OTP, optional trustDevice |
| POST | `/api/auth/resend-otp` | Resend OTP with cooldown |
| POST | `/api/auth/logout-all` | Revoke all trusted devices (auth required) |

## OTP Flow Details

**First-time login:**
1. POST /login → returns `{setupRequired: true}`
2. POST /initiate-setup (email) → sends OTP, returns setupToken
3. POST /verify-setup-otp → returns passwordSetupToken
4. POST /complete-setup → password set, redirectTo /login

**Normal login (new device):**
1. POST /login → returns `{otpRequired: true, otpPendingToken}`
2. POST /verify-login-otp (with trustDevice checkbox) → sets cookie, returns token

**Normal login (trusted device):**
1. POST /login → returns `{success: true, token}` immediately

## Device Trust Implementation
- Cookie name: `lpc_device_trust`
- Cookie options: httpOnly, secure (prod), sameSite=lax, 30-day maxAge
- Max 5 trusted devices per user (oldest auto-removed)
- Last-used timestamp updated on each use

## Verification Results
```
Service exports: 14 (functions + constants)
OTP sample: 58851543 (8 digits)
Resend cooldowns: 0, 15, 30
Cookie name: lpc_device_trust

Controller exports: 7 functions
```

## What's Next
Plan 05-03 will add:
- Turnstile captcha on login
- isDeveloper middleware
- LoginPage.jsx with full multi-step UI
- SettingsPage.jsx with logout all devices
- AuthContext for frontend state
