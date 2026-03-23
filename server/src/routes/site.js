const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { sendMail } = require('../utils/mail');
const {
  DomaineAccueil, EquipePropos, ServicesCatalog, ServicesService,
  Realisation, ServicePeople, MembreNotreEquipe,
  Header, ReseauFooter, ServicesFooter, ContactFooter,
} = require('../models');

// GET /api/site/global  → données globales (header, footer, nav)
router.get('/global', async (req, res) => {
  try {
    const [header, socials, footerServices, footerContact] = await Promise.all([
      Header.findOne(),
      ReseauFooter.findAll(),
      ServicesFooter.findAll(),
      ContactFooter.findOne(),
    ]);
    res.json({ header, socials, footerServices, footerContact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/site/accueil
router.get('/accueil', async (req, res) => {
  try {
    const domaines = await DomaineAccueil.findAll({
      where: { [Op.or]: [{ is_suspended: null }, { is_suspended: 0 }] },
      order: [['id', 'DESC']],
    });
    res.json({ domaines });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/site/propos
router.get('/propos', async (req, res) => {
  try {
    const membres = await EquipePropos.findAll({
      where: { [Op.or]: [{ is_suspended: null }, { is_suspended: 0 }] },
      order: [['id', 'DESC']],
    });
    res.json({ membres });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/site/services
router.get('/services', async (req, res) => {
  try {
    const [catalog, legacy] = await Promise.all([
      ServicesCatalog.findAll({ where: { status: 'active' }, order: [['id', 'DESC']] }),
      ServicesService.findAll({
        where: { [Op.or]: [{ is_suspended: null }, { is_suspended: 0 }] },
        order: [['id', 'DESC']],
      }),
    ]);
    res.json({ services_catalog: catalog, legacy_services: legacy });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/site/realisations
router.get('/realisations', async (req, res) => {
  try {
    const realisations = await Realisation.findAll({
      where: { [Op.or]: [{ is_suspended: null }, { is_suspended: 0 }] },
      order: [['id', 'DESC']],
    });
    res.json({ realisations });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/site/equipe
router.get('/equipe', async (req, res) => {
  res.set('Cache-Control', 'no-store')
  try {
    const [people, membres] = await Promise.all([
      ServicePeople.findAll({
        where: { is_active: 1 },
        include: [{ model: ServicesCatalog, as: 'services', through: { attributes: [] } }],
        order: [['id', 'DESC']],
      }),
      MembreNotreEquipe.findAll({
        // where: { [Op.or]: [{ is_suspended: null }, { is_suspended: 0 }] },
        order: [['id', 'DESC']],
      }),
    ]);

    console.log('people count:', people.length)   // ← ajouter
    console.log('membres count:', membres.length)  // ← ajouter

    res.json({ service_people: people, membres });
  } catch (err) {
    console.error('EQUIPE ERROR:', err)            // ← ajouter
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/site/contact
router.post('/contact', async (req, res) => {
  try {
    const { nom, prenom, tel, email, entreprise, message, website } = req.body;

    // Honeypot anti-spam
    if (website) return res.json({ ok: true });

    const required = [nom, prenom, tel, email, entreprise, message];
    if (required.some(v => !v || !String(v).trim())) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }

    const subject = `Nouveau message de ${nom} ${prenom}`;
    const text = `Nom : ${nom}\nPrenom : ${prenom}\nTéléphone : ${tel}\nEmail : ${email}\nEntreprise : ${entreprise}\nMessage : ${message}`;
    const html = `<h2>Nouveau message de contact</h2>
      <p><strong>Nom :</strong> ${nom}</p>
      <p><strong>Prenom :</strong> ${prenom}</p>
      <p><strong>Téléphone :</strong> ${tel}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Entreprise :</strong> ${entreprise}</p>
      <p><strong>Message :</strong><br>${message}</p>`;

    const contactEmail = process.env.CONTACT_EMAIL || 'contact@digital-get.com';
    const ok = await sendMail({ to: contactEmail, subject, text, html, replyTo: email });
    if (!ok) return res.status(500).json({ error: "Erreur lors de l'envoi du message." });
    res.json({ ok: true, message: 'Votre message a été envoyé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
