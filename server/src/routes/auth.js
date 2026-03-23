const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { User } = require('../models');
const {
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
  requireAuth,
  JWT_REFRESH_SECRET,
} = require('../middleware/auth');

function nowIso() { return new Date().toISOString(); }



// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
    if (!user.is_active) return res.status(403).json({ error: 'Compte désactivé.' });

    await user.update({ last_login_at: nowIso() });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    setTokenCookies(res, accessToken, refreshToken);
    res.json({
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ error: 'Refresh token manquant.' });

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) return res.status(401).json({ error: 'Utilisateur invalide.' });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    setTokenCookies(res, accessToken, refreshToken);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: 'Refresh token invalide ou expiré.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearTokenCookies(res);
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const u = req.user;
  res.json({ id: u.id, full_name: u.full_name, email: u.email, role: u.role, phone: u.phone, person_type: u.person_type, preferred_lang: u.preferred_lang });
});


module.exports = router;
