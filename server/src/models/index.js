const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database.sqlite';
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
    })
  : new Sequelize({
      dialect: 'sqlite',
      dialectModule: require('better-sqlite3'),
      storage: path.resolve(dbPath),
      logging: false,
    })

// ─── Models ───────────────────────────────────────────────────────────────────

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.TEXT, allowNull: false, unique: true },
  password_hash: { type: DataTypes.TEXT, allowNull: false },
  role: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'client' },
  is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  phone: { type: DataTypes.TEXT },
  person_type: { type: DataTypes.TEXT, defaultValue: 'particulier' },
  preferred_lang: { type: DataTypes.TEXT, defaultValue: 'fr' },
  created_at: { type: DataTypes.TEXT },
  updated_at: { type: DataTypes.TEXT },
  last_login_at: { type: DataTypes.TEXT },
}, { tableName: 'users', timestamps: false });

const ServicesCatalog = sequelize.define('ServicesCatalog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'active' },
  created_at: { type: DataTypes.TEXT },
  updated_at: { type: DataTypes.TEXT },
}, { tableName: 'services_catalog', timestamps: false });

const ServicePeople = sequelize.define('ServicePeople', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.TEXT },
  phone: { type: DataTypes.TEXT },
  specialty: { type: DataTypes.TEXT },
  photo_path: { type: DataTypes.TEXT },
  is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  created_at: { type: DataTypes.TEXT },
}, { tableName: 'service_people', timestamps: false });

// Junction table ServicePeople <-> ServicesCatalog
const ServicePersonServices = sequelize.define('ServicePersonServices', {
  person_id: { type: DataTypes.INTEGER, references: { model: ServicePeople, key: 'id' } },
  service_id: { type: DataTypes.INTEGER, references: { model: ServicesCatalog, key: 'id' } },
}, { tableName: 'service_person_services', timestamps: false });

ServicePeople.belongsToMany(ServicesCatalog, { through: ServicePersonServices, foreignKey: 'person_id', otherKey: 'service_id', as: 'services' });
ServicesCatalog.belongsToMany(ServicePeople, { through: ServicePersonServices, foreignKey: 'service_id', otherKey: 'person_id' });

const Conversation = sequelize.define('Conversation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_one_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  user_two_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  created_at: { type: DataTypes.TEXT },
  updated_at: { type: DataTypes.TEXT },
}, { tableName: 'conversations', timestamps: false });

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Conversation, key: 'id' } },
  sender_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  content: { type: DataTypes.TEXT, allowNull: false },
  created_at: { type: DataTypes.TEXT },
  read_at: { type: DataTypes.TEXT },
}, { tableName: 'messages', timestamps: false });

Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

const Header = sequelize.define('Header', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  logo: { type: DataTypes.TEXT },
  nom: { type: DataTypes.TEXT },
  slogan: { type: DataTypes.TEXT },
}, { tableName: 'header', timestamps: false });

const DomaineAccueil = sequelize.define('DomaineAccueil', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  icon: { type: DataTypes.TEXT },
  nom: { type: DataTypes.TEXT },
  description: { type: DataTypes.TEXT },
  is_suspended: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'domaine_accueil', timestamps: false });

const EquipePropos = sequelize.define('EquipePropos', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  icon: { type: DataTypes.TEXT },
  nom: { type: DataTypes.TEXT },
  description: { type: DataTypes.TEXT },
  is_suspended: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'equipe_propos', timestamps: false });

const ServicesService = sequelize.define('ServicesService', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.TEXT },
  description: { type: DataTypes.TEXT },
  criteres_services: { type: DataTypes.TEXT },
  libelleImage: { type: DataTypes.TEXT },
  is_suspended: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'services_service', timestamps: false });

const Realisation = sequelize.define('Realisation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.TEXT },
  description: { type: DataTypes.TEXT },
  lien_button: { type: DataTypes.TEXT },
  criteres_services: { type: DataTypes.TEXT },
  libelleImage: { type: DataTypes.TEXT },
  categorie: { type: DataTypes.TEXT },
  is_suspended: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'realisation_realisation', timestamps: false });

const MembreNotreEquipe = sequelize.define('MembreNotreEquipe', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  libelleImage: { type: DataTypes.TEXT },
  nom: { type: DataTypes.TEXT },
  role: { type: DataTypes.TEXT },
  is_suspended: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'membre_notreequipe', timestamps: false });

const ReseauFooter = sequelize.define('ReseauFooter', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  icon: { type: DataTypes.TEXT },
  lien: { type: DataTypes.TEXT },
}, { tableName: 'reseau_footer', timestamps: false });

const ServicesFooter = sequelize.define('ServicesFooter', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  criteres: { type: DataTypes.TEXT },
}, { tableName: 'services_footer', timestamps: false });

const ContactFooter = sequelize.define('ContactFooter', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.TEXT },
  telephone: { type: DataTypes.TEXT },
}, { tableName: 'contact_footer', timestamps: false });

// ─── Sync & Seed ──────────────────────────────────────────────────────────────

async function syncDatabase() {
  await sequelize.sync({ alter: false, force: false });
  // Create tables that don't exist yet without dropping existing data
  await sequelize.sync();
}

async function seedDefaultAdmin() {
  const count = await User.count();
  if (count > 0) return;

  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || '';
  if (!email || !password || password.length < 8) return;

  const bcrypt = require('bcryptjs');
  const fullName = process.env.ADMIN_BOOTSTRAP_NAME || 'Administrateur';
  await User.create({
    full_name: fullName,
    email,
    password_hash: bcrypt.hashSync(password, 10),
    role: 'admin',
    is_active: 1,
    person_type: 'chef_entreprise',
    preferred_lang: 'fr',
    created_at: new Date().toISOString(),
  });
  console.log(`✅ Admin créé : ${email}`);
}

module.exports = {
  sequelize,
  User,
  ServicesCatalog,
  ServicePeople,
  ServicePersonServices,
  Conversation,
  Message,
  Header,
  DomaineAccueil,
  EquipePropos,
  ServicesService,
  Realisation,
  MembreNotreEquipe,
  ReseauFooter,
  ServicesFooter,
  ContactFooter,
  syncDatabase,
  seedDefaultAdmin,
};
