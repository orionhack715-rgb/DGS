const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function generateTokens(userId, role) {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
}

function setTokenCookies(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Lax',
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh',
  });
}

function clearTokenCookies(res) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
}

// Middleware: authenticate via cookie or Authorization header
async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.access_token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) token = authHeader.slice(7);
    }
    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      req.user = null;
      return next();
    }
    req.user = user;
    next();
  } catch {
    req.user = null;
    next();
  }
}

// Middleware: require logged-in user
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
  next();
}

// Middleware: require admin role
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  next();
}

module.exports = {
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
  authenticate,
  requireAuth,
  requireAdmin,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
};
