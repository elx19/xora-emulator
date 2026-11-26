'use strict';

/**
 * Genera el manifiesto firmado de una publicación.
 * Uso de CI:
 *   XORA_UPDATE_PRIVATE_KEY="..." node build/sign-update-manifest.js \
 *     --asset XORA-v0.7.0-win64-portable.zip --version 0.7.0 \
 *     --output XORA-v0.7.0-update-manifest.json
 *
 * La clave privada llega únicamente por el secreto del CI y nunca se escribe
 * en el repositorio ni en los artefactos publicados.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const updateManifest = require('../src/core/update-manifest');

function args(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    out[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}

function required(value, name) {
  if (!value || value === true) throw new Error(`Falta --${name}`);
  return String(value);
}

function main() {
  const options = args(process.argv);
  const assetPath = path.resolve(required(options.asset, 'asset'));
  const version = required(options.version, 'version');
  const output = path.resolve(required(options.output, 'output'));
  const privateKey = process.env.XORA_UPDATE_PRIVATE_KEY;
  if (!privateKey) throw new Error('Falta XORA_UPDATE_PRIVATE_KEY en el entorno del CI');
  if (!fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) throw new Error(`No existe el artefacto: ${assetPath}`);
  const manifest = {
    schemaVersion: 1,
    product: 'xora',
    version,
    channel: options.channel || 'stable',
    platform: options.platform || 'win32-x64',
    minimumVersion: options['minimum-version'] || '0.0.0',
    mandatory: options.mandatory === true,
    asset: path.basename(assetPath),
    sha512: updateManifest.sha512File(assetPath),
  };
  if (options['release-notes']) manifest.releaseNotes = String(options['release-notes']);
  const key = crypto.createPrivateKey(privateKey);
  manifest.signature = crypto.sign('sha256', Buffer.from(updateManifest.unsignedPayload(manifest)), key).toString('base64');
  updateManifest.validateManifest(manifest);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Manifiesto firmado: ${output}`);
}

try { main(); } catch (error) { console.error(`No se pudo firmar el manifiesto: ${error.message}`); process.exit(1); }
