'use strict';

/**
 * Contrato seguro para las actualizaciones de XORA.
 *
 * El manifiesto se firma fuera del repositorio con la clave privada de
 * publicación. XORA solo incluye la clave pública y nunca necesita una
 * credencial reutilizable de GitHub.
 */
const fs = require('fs');
const crypto = require('crypto');
const { cmpVer } = require('./version');

const MANIFEST_SCHEMA = 1;
const PRODUCT = 'xora';
const CHANNELS = ['stable', 'beta', 'development'];
const PLATFORMS = ['win32-x64', 'win32-arm64', 'linux-x64', 'linux-arm64'];
const ALLOWED_HOSTS = new Set([
  'github.com',
  'objects.githubusercontent.com',
  'release-assets.githubusercontent.com',
  'gitee.com',
]);

// Esta clave pública es deliberadamente la única material criptográfico
// incluido en el cliente. La privada debe vivir solamente en CI/secret manager.
const XORA_UPDATE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAsRWWtMydxs1YhK9+BKIt
vWatmEvUpcVO2oVPUX67WI0Fcuv/wdc81AzcpE4HQ7kqlikbGoZP6aT4nqCU4M84
RzCh8iXyhBnRRjtDWyoS7E2OHDJbXfOapCAeh/xBBOhvhWMQX3o0NzGBS9apkkRY
Zmb59SZ6oXGTyVc3M44mxd3bu5hJqxT1tJrABAv86vVxbtRjUAGf0Fxka2rfNRx5
UANz5f7gCO2EPXquIGvcrE/UKQklaC9CUbyRsDe53IkE6U2xJ8SVsn9GBqUgqySx
pPKr5QncQtmyelr40fbrnnllSivyw+zgXJwuDAucjgNxlnS9U4QGtZX/c4TT7g9w
kuJ3JC6rPdscfvFBBLoVPwGE473b5LWudTucq8TVkgSF2OHD1v2wlD68rxAxr5IP
lBlE0S35UuEKHw+vcZ0xLIGMeAJyAkrqyxMDoLncfEOnR9GGIf/8z9BhrIob+Pf1
VEJny0T/IL4ru019/1hHUV+lt1n8gLO1gnBa8fHixuQLAgMBAAE=
-----END PUBLIC KEY-----`;

function canonicalize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => (
      `${JSON.stringify(key)}:${canonicalize(value[key])}`
    )).join(',')}}`;
  }
  return JSON.stringify(value);
}

function unsignedPayload(manifest) {
  const copy = { ...(manifest || {}) };
  delete copy.signature;
  return canonicalize(copy);
}

function decodeSignature(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (/^[0-9a-f]{128,}$/i.test(text) && text.length % 2 === 0) return Buffer.from(text, 'hex');
  try { return Buffer.from(text, 'base64'); } catch (_) { return null; }
}

function validateHttpsUrl(value, label = 'URL') {
  let url;
  try { url = new URL(String(value)); } catch (_) { throw new Error(`${label} no es válida`); }
  if (url.protocol !== 'https:') throw new Error(`${label} debe usar HTTPS`);
  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) throw new Error(`${label} usa un host no permitido`);
  return url.toString();
}

function validateManifest(input, options = {}) {
  const m = input && typeof input === 'object' ? { ...input } : null;
  if (!m || m.schemaVersion !== MANIFEST_SCHEMA) throw new Error('Manifiesto de actualización no compatible');
  if (m.product !== PRODUCT) throw new Error('El manifiesto no pertenece a XORA');
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(String(m.version || ''))) {
    throw new Error('El manifiesto no contiene una versión semántica válida');
  }
  if (!CHANNELS.includes(m.channel)) throw new Error('Canal de actualización no permitido');
  if (!PLATFORMS.includes(m.platform)) throw new Error('Plataforma de actualización no permitida');
  if (options.platform && m.platform !== options.platform) throw new Error('La plataforma no coincide con este equipo');
  if (options.channel && !channelAllows(options.channel, m.channel)) throw new Error('El manifiesto está fuera del canal seleccionado');
  if (m.minimumVersion && cmpVer(m.minimumVersion, m.version) > 0) throw new Error('La versión mínima supera la versión publicada');
  if (!/^[^\\/]+\.(?:exe|zip|AppImage)$/i.test(String(m.asset || ''))) throw new Error('El nombre del paquete no es seguro');
  if (!/^[a-f0-9]{128}$/i.test(String(m.sha512 || ''))) throw new Error('El hash SHA-512 del paquete no es válido');
  if (m.releaseNotes) m.releaseNotes = validateHttpsUrl(m.releaseNotes, 'Notas de versión');
  if (!decodeSignature(m.signature)) throw new Error('El manifiesto no tiene una firma válida');
  return m;
}

function channelAllows(selected, published) {
  const rank = { stable: 0, beta: 1, development: 2 };
  return rank[published] <= rank[selected];
}

function verifyManifestSignature(manifest, publicKey = XORA_UPDATE_PUBLIC_KEY) {
  const signature = decodeSignature(manifest && manifest.signature);
  if (!signature) return false;
  try {
    return crypto.verify('sha256', Buffer.from(unsignedPayload(manifest), 'utf8'), publicKey, signature);
  } catch (_) {
    return false;
  }
}

function verifyManifest(manifest, options = {}) {
  const normalized = validateManifest(manifest, options);
  if (!verifyManifestSignature(normalized, options.publicKey)) throw new Error('La firma del manifiesto no coincide');
  return normalized;
}

function sha512Buffer(buffer) {
  return crypto.createHash('sha512').update(buffer).digest('hex');
}

function sha512File(filePath) {
  return sha512Buffer(fs.readFileSync(filePath));
}

function verifyAssetFile(filePath, manifest) {
  const got = sha512File(filePath).toLowerCase();
  const expected = String(manifest && manifest.sha512 || '').toLowerCase();
  if (got !== expected) throw new Error('El paquete descargado no coincide con el SHA-512 del manifiesto');
  return { ok: true, sha512: got };
}

function selectManifest(manifests, options = {}) {
  const current = options.currentVersion || '0.0.0';
  const channel = options.channel || 'stable';
  const platform = options.platform;
  return (Array.isArray(manifests) ? manifests : [])
    .map((item) => {
      try { return validateManifest(item, { channel, platform }); } catch (_) { return null; }
    })
    .filter((item) => item && cmpVer(item.version, current) > 0)
    .sort((a, b) => cmpVer(b.version, a.version))[0] || null;
}

function rollbackFile(dataDir) {
  return require('path').join(dataDir, 'update', 'rollback.json');
}

function readRollback(dataDir) {
  try { return JSON.parse(fs.readFileSync(rollbackFile(dataDir), 'utf8')); } catch (_) { return null; }
}

function writeRollback(dataDir, value) {
  const file = rollbackFile(dataDir);
  fs.mkdirSync(require('path').dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
  return value;
}

function markUpdatePending(dataDir, state) {
  return writeRollback(dataDir, { state: 'pending', at: Date.now(), ...state });
}

function markUpdateHealthy(dataDir, version) {
  return writeRollback(dataDir, { state: 'healthy', version, at: Date.now() });
}

function markUpdateFailed(dataDir, error) {
  return writeRollback(dataDir, { state: 'failed', error: String(error || 'unknown').slice(0, 500), at: Date.now() });
}

module.exports = {
  MANIFEST_SCHEMA,
  PRODUCT,
  CHANNELS,
  PLATFORMS,
  ALLOWED_HOSTS,
  XORA_UPDATE_PUBLIC_KEY,
  canonicalize,
  unsignedPayload,
  validateManifest,
  verifyManifestSignature,
  verifyManifest,
  sha512Buffer,
  sha512File,
  verifyAssetFile,
  selectManifest,
  readRollback,
  markUpdatePending,
  markUpdateHealthy,
  markUpdateFailed,
};
