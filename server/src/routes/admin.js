const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { requireAdmin } = require('../middleware/auth');
const { createUploader, deleteUploadedImage } = require('../utils/upload');
const { testSmtpConnection, sendMail } = require('../utils/mail');
const {
  User, ServicesCatalog, ServicePeople, ServicesService,
  Realisation, MembreNotreEquipe, Header,
  DomaineAccueil, EquipePropos, ReseauFooter, ServicesFooter, ContactFooter,
} = require('../models');

function nowIso() { return new Date().toISOString(); }

router.use(requireAdmin);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const [userCount, serviceCount, projectCount, memberCount] = await Promise.all([
      User.count(),
      ServicesCatalog.count(),
      Realisation.count(),
      MembreNotreEquipe.count(),
    ]);
    res.json({ userCount, serviceCount, projectCount, memberCount });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  const users = await User.findAll({ order: [['id', 'DESC']] });
  res.json({ users });
});

router.post('/users', async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: 'Nom, email et mot de passe obligatoires.' });
    if (!['admin', 'agent', 'client'].includes(role)) return res.status(400).json({ error: 'Rôle invalide.' });
    if (await User.findOne({ where: { email: email.toLowerCase() } })) return res.status(409).json({ error: 'Email déjà utilisé.' });
    await User.create({ full_name, email: email.toLowerCase(), password_hash: bcrypt.hashSync(password, 10), role, is_active: 1, created_at: nowIso() });
    res.json({ ok: true, message: 'Utilisateur créé.' });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur' }); }
});

router.patch('/users/:id/toggle', async (req, res) => {
  const target = await User.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'Impossible de désactiver votre propre compte.' });
  await target.update({ is_active: target.is_active ? 0 : 1 });
  res.json({ ok: true });
});

router.patch('/users/:id/password', async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 8) return res.status(400).json({ error: 'Au moins 8 caractères requis.' });
  const target = await User.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  await target.update({ password_hash: bcrypt.hashSync(new_password, 10) });
  res.json({ ok: true, message: 'Mot de passe réinitialisé.' });
});

router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'agent', 'client'].includes(role)) return res.status(400).json({ error: 'Rôle invalide.' });
  const target = await User.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  await target.update({ role });
  res.json({ ok: true });
});

// ─── Services Catalog ─────────────────────────────────────────────────────────
router.get('/services', async (req, res) => {
  const [services, legacy] = await Promise.all([
    ServicesCatalog.findAll({ order: [['id', 'DESC']] }),
    ServicesService.findAll({ order: [['id', 'DESC']] }),
  ]);
  res.json({ services, legacy_services: legacy });
});

router.post('/services/catalog', async (req, res) => {
  const { name, description, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom obligatoire.' });
  if (!['active', 'inactive'].includes(status)) return res.status(400).json({ error: 'Statut invalide.' });
  await ServicesCatalog.create({ name, description, status, created_at: nowIso() });
  res.json({ ok: true, message: 'Service ajouté.' });
});

router.put('/services/catalog/:id', async (req, res) => {
  const target = await ServicesCatalog.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  const { name, description, status } = req.body;
  await target.update({ name, description, status, updated_at: nowIso() });
  res.json({ ok: true, message: 'Service mis à jour.' });
});

router.delete('/services/catalog/:id', async (req, res) => {
  const target = await ServicesCatalog.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  await target.destroy();
  res.json({ ok: true, message: 'Service supprimé.' });
});

// Legacy services (with image)
const serviceUploader = createUploader('service');
router.post('/services/legacy', serviceUploader.single('image'), async (req, res) => {
  const { nom, description, criteres_services } = req.body;
  if (!nom) return res.status(400).json({ error: 'Nom obligatoire.' });
  const libelleImage = req.file ? req.file.filename : null;
  await ServicesService.create({ nom, description, criteres_services, libelleImage, is_suspended: 0 });
  res.json({ ok: true, message: 'Service visuel ajouté.' });
});

router.put('/services/legacy/:id', serviceUploader.single('image'), async (req, res) => {
  const target = await ServicesService.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  const updates = { nom: req.body.nom, description: req.body.description, criteres_services: req.body.criteres_services };
  if (req.file) { deleteUploadedImage(target.libelleImage); updates.libelleImage = req.file.filename; }
  await target.update(updates);
  res.json({ ok: true, message: 'Service visuel mis à jour.' });
});

router.delete('/services/legacy/:id', async (req, res) => {
  const target = await ServicesService.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  deleteUploadedImage(target.libelleImage);
  await target.destroy();
  res.json({ ok: true });
});

// ─── People ───────────────────────────────────────────────────────────────────
const peopleUploader = createUploader('sp', 'service_people');
router.get('/people', async (req, res) => {
  const [people, allServices] = await Promise.all([
    ServicePeople.findAll({
      include: [{ model: ServicesCatalog, as: 'services', through: { attributes: [] } }],
      order: [['id', 'DESC']],
    }),
    ServicesCatalog.findAll({ where: { status: 'active' }, order: [['name', 'ASC']] }),
  ]);
  res.json({ people, all_services: allServices });
});

router.post('/people', peopleUploader.single('photo'), async (req, res) => {
  try {
    const { full_name, email, phone, specialty, service_ids } = req.body;
    if (!full_name) return res.status(400).json({ error: 'Nom obligatoire.' });
    const photo_path = req.file ? req.file.filename : null;
    const person = await ServicePeople.create({ full_name, email, phone, specialty, photo_path, is_active: 1, created_at: nowIso() });
    if (service_ids) {
      const ids = (Array.isArray(service_ids) ? service_ids : [service_ids]).map(Number).filter(Boolean);
      const services = await ServicesCatalog.findAll({ where: { id: ids } });
      await person.setServices(services);
    }
    res.json({ ok: true, message: 'Personne ajoutée.' });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur' }); }
});

router.patch('/people/:id/toggle', async (req, res) => {
  const person = await ServicePeople.findByPk(req.params.id);
  if (!person) return res.status(404).json({ error: 'Introuvable' });
  await person.update({ is_active: person.is_active ? 0 : 1 });
  res.json({ ok: true });
});

router.delete('/people/:id', async (req, res) => {
  const person = await ServicePeople.findByPk(req.params.id);
  if (!person) return res.status(404).json({ error: 'Introuvable' });
  deleteUploadedImage(person.photo_path);
  await person.destroy();
  res.json({ ok: true });
});

// ─── Projects / Réalisations ──────────────────────────────────────────────────
const projectUploader = createUploader('project');
router.get('/projects', async (req, res) => {
  const projects = await Realisation.findAll({ order: [['id', 'DESC']] });
  res.json({ projects });
});

router.post('/projects', projectUploader.single('image'), async (req, res) => {
  const { nom, description, lien_button, criteres_services, categorie } = req.body;
  if (!nom) return res.status(400).json({ error: 'Nom obligatoire.' });
  const libelleImage = req.file ? req.file.filename : null;
  await Realisation.create({ nom, description, lien_button, criteres_services, categorie, libelleImage, is_suspended: 0 });
  res.json({ ok: true, message: 'Projet ajouté.' });
});

router.put('/projects/:id', projectUploader.single('image'), async (req, res) => {
  const target = await Realisation.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  const updates = { nom: req.body.nom, description: req.body.description, lien_button: req.body.lien_button, criteres_services: req.body.criteres_services, categorie: req.body.categorie };
  if (req.file) { deleteUploadedImage(target.libelleImage); updates.libelleImage = req.file.filename; }
  await target.update(updates);
  res.json({ ok: true, message: 'Projet mis à jour.' });
});

router.delete('/projects/:id', async (req, res) => {
  const target = await Realisation.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  deleteUploadedImage(target.libelleImage);
  await target.destroy();
  res.json({ ok: true });
});

// ─── Members / Notre Équipe ───────────────────────────────────────────────────
const memberUploader = createUploader('member');
router.get('/members', async (req, res) => {
  const members = await MembreNotreEquipe.findAll({ order: [['id', 'DESC']] });
  res.json({ members });
});

router.post('/members', memberUploader.single('photo'), async (req, res) => {
  const { nom, role } = req.body;
  if (!nom) return res.status(400).json({ error: 'Nom obligatoire.' });
  const libelleImage = req.file ? req.file.filename : null;
  await MembreNotreEquipe.create({ nom, role, libelleImage, is_suspended: 0 });
  res.json({ ok: true, message: 'Membre ajouté.' });
});

router.put('/members/:id', memberUploader.single('photo'), async (req, res) => {
  const target = await MembreNotreEquipe.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  const updates = { nom: req.body.nom, role: req.body.role };
  if (req.file) { deleteUploadedImage(target.libelleImage); updates.libelleImage = req.file.filename; }
  await target.update(updates);
  res.json({ ok: true });
});

router.patch('/members/:id/toggle', async (req, res) => {
  const target = await MembreNotreEquipe.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  await target.update({ is_suspended: target.is_suspended ? 0 : 1 });
  res.json({ ok: true });
});

router.delete('/members/:id', async (req, res) => {
  const target = await MembreNotreEquipe.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  deleteUploadedImage(target.libelleImage);
  await target.destroy();
  res.json({ ok: true });
});

// ─── Site Content (Header, Footer) ───────────────────────────────────────────
const headerUploader = createUploader('logo');
router.get('/site-content', async (req, res) => {
  const [header, socials, footerServices, footerContact] = await Promise.all([
    Header.findOne(),
    ReseauFooter.findAll(),
    ServicesFooter.findAll(),
    ContactFooter.findOne(),
  ]);
  res.json({ header, socials, footerServices, footerContact });
});

router.post('/site-content/header', headerUploader.single('logo'), async (req, res) => {
  const { nom, slogan } = req.body;
  let header = await Header.findOne();
  const updates = { nom, slogan };
  if (req.file) updates.logo = req.file.filename;
  if (header) await header.update(updates);
  else header = await Header.create(updates);
  res.json({ ok: true, message: 'Header mis à jour.' });
});

router.post('/site-content/footer-contact', async (req, res) => {
  const { email, telephone } = req.body;
  let contact = await ContactFooter.findOne();
  if (contact) await contact.update({ email, telephone });
  else await ContactFooter.create({ email, telephone });
  res.json({ ok: true });
});

router.post('/site-content/socials', async (req, res) => {
  const { icon, lien } = req.body;
  await ReseauFooter.create({ icon, lien });
  res.json({ ok: true });
});

router.delete('/site-content/socials/:id', async (req, res) => {
  await ReseauFooter.destroy({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.post('/site-content/footer-services', async (req, res) => {
  const { criteres } = req.body;
  await ServicesFooter.create({ criteres });
  res.json({ ok: true });
});

router.delete('/site-content/footer-services/:id', async (req, res) => {
  await ServicesFooter.destroy({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ─── Domaines Accueil ─────────────────────────────────────────────────────────
router.get('/domaines', async (req, res) => {
  const domaines = await DomaineAccueil.findAll({ order: [['id', 'DESC']] });
  res.json({ domaines });
});

router.post('/domaines', async (req, res) => {
  const { icon, nom, description } = req.body;
  if (!nom) return res.status(400).json({ error: 'Nom obligatoire.' });
  await DomaineAccueil.create({ icon, nom, description, is_suspended: 0 });
  res.json({ ok: true, message: 'Domaine ajouté.' });
});

router.put('/domaines/:id', async (req, res) => {
  const target = await DomaineAccueil.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  await target.update({ icon: req.body.icon, nom: req.body.nom, description: req.body.description });
  res.json({ ok: true });
});

router.patch('/domaines/:id/toggle', async (req, res) => {
  const target = await DomaineAccueil.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  await target.update({ is_suspended: target.is_suspended ? 0 : 1 });
  res.json({ ok: true });
});

router.delete('/domaines/:id', async (req, res) => {
  await DomaineAccueil.destroy({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ─── Équipe Propos ────────────────────────────────────────────────────────────
router.get('/equipe-propos', async (req, res) => {
  const items = await EquipePropos.findAll({ order: [['id', 'DESC']] });
  res.json({ items });
});

router.post('/equipe-propos', async (req, res) => {
  const { icon, nom, description } = req.body;
  if (!nom) return res.status(400).json({ error: 'Nom obligatoire.' });
  await EquipePropos.create({ icon, nom, description, is_suspended: 0 });
  res.json({ ok: true });
});

router.put('/equipe-propos/:id', async (req, res) => {
  const target = await EquipePropos.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  await target.update({ icon: req.body.icon, nom: req.body.nom, description: req.body.description });
  res.json({ ok: true });
});

router.patch('/equipe-propos/:id/toggle', async (req, res) => {
  const target = await EquipePropos.findByPk(req.params.id);
  if (!target) return res.status(404).json({ error: 'Introuvable' });
  await target.update({ is_suspended: target.is_suspended ? 0 : 1 });
  res.json({ ok: true });
});

router.delete('/equipe-propos/:id', async (req, res) => {
  await EquipePropos.destroy({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ─── Mailing ──────────────────────────────────────────────────────────────────
router.get('/mail-test', async (req, res) => {
  const mailEnabled = process.env.MAIL_ENABLED !== 'false';
  const host = process.env.MAIL_SMTP_HOST;
  const config = {
    enabled: mailEnabled,
    host: host || '',
    port: process.env.MAIL_SMTP_PORT || '587',
    from: process.env.MAIL_FROM_EMAIL || '',
    use_tls: process.env.MAIL_SMTP_USE_TLS !== 'false',
    contact_email: process.env.CONTACT_EMAIL || '',
  };
  if (!mailEnabled) return res.json({ status: 'disabled', message: 'Email désactivé', config });
  if (!host) return res.json({ status: 'not_configured', message: 'MAIL_SMTP_HOST non configuré', config });
  const result = await testSmtpConnection();
  res.json({ ...result, config });
});

router.post('/mailing/send', async (req, res) => {
  try {
    const { subject, html_body, text_body, to_email } = req.body;
    if (!subject || !html_body || !to_email) return res.status(400).json({ error: 'Champs manquants.' });
    const ok = await sendMail({ to: to_email, subject, text: text_body || '', html: html_body });
    if (!ok) return res.status(500).json({ error: "Erreur d'envoi." });
    res.json({ ok: true, message: 'Email envoyé.' });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur' }); }
});

module.exports = router;
