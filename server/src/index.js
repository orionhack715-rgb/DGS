require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const https = require('https');
const rateLimit = require('express-rate-limit');

const { syncDatabase, seedDefaultAdmin } = require('./models');
const { authenticate } = require('./middleware/auth');
const { UPLOADS_DIR } = require('./utils/upload');

const authRoutes = require('./routes/auth');
const siteRoutes = require('./routes/site');
const adminRoutes = require('./routes/admin');

const app = express();
const server = https.createServer(app);

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded images
app.use('/uploads', express.static(UPLOADS_DIR));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: 'Trop de tentatives, réessayez dans 1 minute.' } });
const contactLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: 'Trop de requêtes.' } });

// Authenticate on every request (sets req.user)
app.use(authenticate);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/site/contact', contactLimiter);

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.use('/api/auth', authRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  const base = process.env.CLIENT_URL || 'https://digital-get.com';
  const pages = ['accueil', 'propos', 'services', 'realisation', 'notreEquipe', 'formulaire'];
  const urls = pages.map(p => `<url><loc>${base}/${p}</loc><changefreq>weekly</changefreq></url>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: /sitemap.xml\n');
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erreur interne' });
});


// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
  await syncDatabase();
  await seedDefaultAdmin();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
}

start().catch(console.error);
