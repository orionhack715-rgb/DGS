const nodemailer = require('nodemailer');

function createTransporter() {
  if (process.env.MAIL_SMTP_USE_SSL === 'true') {
    return nodemailer.createTransport({
      host: process.env.MAIL_SMTP_HOST,
      port: parseInt(process.env.MAIL_SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.MAIL_SMTP_USERNAME,
        pass: process.env.MAIL_SMTP_PASSWORD,
      },
    });
  }
  return nodemailer.createTransport({
    host: process.env.MAIL_SMTP_HOST,
    port: parseInt(process.env.MAIL_SMTP_PORT || '587'),
    secure: false,
    requireTLS: process.env.MAIL_SMTP_USE_TLS !== 'false',
    auth: {
      user: process.env.MAIL_SMTP_USERNAME,
      pass: process.env.MAIL_SMTP_PASSWORD,
    },
  });
}

async function sendMail({ to, subject, text, html, replyTo }) {
  if (process.env.MAIL_ENABLED === 'false') return true;
  const host = process.env.MAIL_SMTP_HOST;
  if (!host) return true;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM_EMAIL,
      to,
      subject,
      text,
      html,
      replyTo: replyTo || undefined,
    });
    return true;
  } catch (err) {
    console.error('Erreur envoi email:', err.message);
    return false;
  }
}

async function testSmtpConnection() {
  const host = process.env.MAIL_SMTP_HOST;
  if (!host) return { status: 'not_configured', message: 'MAIL_SMTP_HOST non configuré' };
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { status: 'success', message: 'Connexion SMTP réussie' };
  } catch (err) {
    return { status: 'error', message: `${err.constructor.name}: ${err.message}` };
  }
}

module.exports = { sendMail, testSmtpConnection };
