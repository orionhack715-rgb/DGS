#!/usr/bin/env node
try {
  require('dotenv').config();
} catch (_) {
  // dotenv est optionnel: le script peut fonctionner via variables d'environnement shell.
}

const http = require('http');
const https = require('https');

const DEFAULT_INTERVAL_MINUTES = 4;
const REQUEST_TIMEOUT_MS = 20000;
const allowInsecureTls = String(process.env.RENDER_ALLOW_INSECURE_TLS || '').toLowerCase() === 'true';

function parseTargets() {
  const raw =
    process.env.RENDER_TARGETS ||
    process.env.RENDER_URLS ||
    process.env.RENDER_KEEPALIVE_URLS ||
    '';

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseIntervalMinutes() {
  const value = Number(process.env.RENDER_INTERVAL_MINUTES);
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_INTERVAL_MINUTES;
  }
  return value;
}

function requestUrl(target) {
  return new Promise((resolve) => {
    let url;
    try {
      url = new URL(target);
    } catch (_) {
      resolve({
        target,
        ok: false,
        message: 'URL invalide'
      });
      return;
    }

    const client = url.protocol === 'https:' ? https : http;

    const requestOptions = {
      method: 'GET',
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      port: url.port || undefined,
      timeout: REQUEST_TIMEOUT_MS
    };

    if (url.protocol === 'https:' && allowInsecureTls) {
      requestOptions.rejectUnauthorized = false;
    }

    const req = client.request(
      requestOptions,
      (res) => {
        res.resume();
        const ok = res.statusCode >= 200 && res.statusCode < 400;
        resolve({
          target,
          ok,
          message: `HTTP ${res.statusCode}`
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('timeout'));
    });

    req.on('error', (error) => {
      resolve({
        target,
        ok: false,
        message: error.message
      });
    });

    req.end();
  });
}

async function runCycle(targets) {
  const now = new Date().toISOString();
  console.log(`[${now}] Ping Render (${targets.length} cible(s))...`);

  const results = await Promise.all(targets.map((target) => requestUrl(target)));

  for (const result of results) {
    const icon = result.ok ? 'OK' : 'KO';
    console.log(`  [${icon}] ${result.target} -> ${result.message}`);
  }
}

async function main() {
  const targets = parseTargets();
  if (!targets.length) {
    console.error(
      'Aucune cible Render définie. Ajoute RENDER_TARGETS dans .env (URLs séparées par des virgules).'
    );
    process.exit(1);
  }

  const intervalMinutes = parseIntervalMinutes();
  const intervalMs = intervalMinutes * 60 * 1000;
  const runOnce = process.argv.includes('--once');

  await runCycle(targets);

  if (runOnce) {
    return;
  }

  console.log(`Relance automatique activée toutes les ${intervalMinutes} minute(s).`);
  setInterval(() => {
    runCycle(targets).catch((error) => {
      console.error('Erreur de cycle Render:', error.message);
    });
  }, intervalMs);
}

main().catch((error) => {
  console.error('Erreur fatale:', error.message);
  process.exit(1);
});
