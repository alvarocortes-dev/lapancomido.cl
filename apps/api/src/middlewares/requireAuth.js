// src/middlewares/requireAuth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Middleware that requires a valid JWT token in the Authorization header.
 * Sets req.user with decoded token payload if valid.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return res.status(401).json({ error: 'Error de autenticación' });
  }
}

/**
 * Middleware that requires the user to have admin or developer role.
 * Must be used after requireAuth.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }

  const role = req.user.role;
  if (role !== 'admin' && role !== 'developer') {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }

  next();
}

export { requireAuth, requireAdmin };
