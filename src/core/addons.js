'use strict';

/**
 * Contrato local para complementos opcionales de Android.
 *
 * XORA no descarga ni distribuye binarios de Google: el usuario debe aportar
 * un paquete con licencia compatible con su imagen. Este módulo solo valida
 * identidad, estado y metadatos antes de que el proceso principal lo instale.
 */
const crypto = require('crypto');

const ADDON_SCHEMA = 'xora-addon/1';
const ADDON_STATES = [
  'not_installed', 'available', 'installing', 'installed',
  'update_available', 'repair_required', 'failed',
];

const BUILTIN_ADDONS = Object.freeze([
  Object.freeze({
    id: 'google-play-store',
    name: 'Google Play Store',
    description: 'Tienda oficial para instalar y actualizar aplicaciones Android.',
    packageName: 'com.android.vending',
    requires: ['google-play-services'],
    preinstalled: true,
  }),
  Object.freeze({
    id: 'google-play-games',
    name: 'Google Play Juegos',
    description: 'Funciones de juegos, logros y sincronización de partidas.',
    packageName: 'com.google.android.play.games',
    requires: ['google-play-services'],
  }),
  Object.freeze({
    id: 'google-play-services',
    name: 'Servicios de Google',
    description: 'Servicios de compatibilidad usados por aplicaciones Android.',
    packageName: 'com.google.android.gms',
    requires: [],
    preinstalled: true,
  }),
]);

const IDS = new Set(BUILTIN_ADDONS.map((addon) => addon.id));
const PACKAGES = new Map(BUILTIN_ADDONS.map((addon) => [addon.id, addon.packageName]));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function addonPackage(id) {
  return PACKAGES.get(String(id || '')) || '';
}

function descriptor(id) {
  return BUILTIN_ADDONS.find((addon) => addon.id === String(id || '')) || null;
}

function safeVersion(value) {
  return typeof value === 'string' && /^[0-9A-Za-z][0-9A-Za-z._+\-]{0,63}$/.test(value.trim());
}

function safeSha256(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
}

function validateAddonRecord(raw) {
  const record = raw && typeof raw === 'object' ? raw : {};
  const errors = [];
  if (!ADDON_STATES.includes(record.state)) errors.push('estado inválido');
  if (record.packageName !== undefined && (
    typeof record.packageName !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)+$/.test(record.packageName)
  )) errors.push('paquete inválido');
  if (record.version !== undefined && record.version !== null && !safeVersion(record.version)) errors.push('versión inválida');
  if (record.sha256 !== undefined && record.sha256 !== null && !safeSha256(record.sha256)) errors.push('hash inválido');
  if (record.installedAt !== undefined && (!Number.isSafeInteger(record.installedAt) || record.installedAt < 0)) errors.push('fecha inválida');
  return { ok: errors.length === 0, errors, record: errors.length ? null : clone(record) };
}

function normalizeRecords(raw) {
  const source = raw && typeof raw === 'object' && raw.records && typeof raw.records === 'object'
    ? raw.records : (raw && typeof raw === 'object' ? raw : {});
  const out = {};
  for (const addon of BUILTIN_ADDONS) {
    const checked = validateAddonRecord(source[addon.id]);
    if (checked.ok) out[addon.id] = checked.record;
  }
  return out;
}

function actionsFor(addon, record) {
  switch (record.state) {
    case 'installed': return ['repair', 'uninstall'];
    case 'update_available': return ['update', 'repair', 'uninstall'];
    case 'repair_required': return ['repair', 'uninstall'];
    case 'installing': return ['cancel'];
    case 'failed': return ['retry', 'install'];
    case 'available':
    case 'not_installed':
    default: return ['install'];
  }
}

function listAddons(rawState = {}, options = {}) {
  const records = normalizeRecords(rawState);
  return BUILTIN_ADDONS.map((addon) => {
    const hasRecord = Object.prototype.hasOwnProperty.call(records, addon.id);
    const record = hasRecord
      ? records[addon.id]
      : (options.playImageReady && addon.preinstalled
        ? {
          state: 'installed',
          packageName: addon.packageName,
          version: 'incluido',
          source: 'runtime-image',
        }
        : { state: 'not_installed' });
    return {
      ...clone(addon),
      ...clone(record),
      state: ADDON_STATES.includes(record.state) ? record.state : 'not_installed',
      actions: actionsFor(addon, record),
      compatible: record.compatible !== false,
    };
  });
}

const TRANSITIONS = {
  not_installed: new Set(['available', 'installing']),
  available: new Set(['installing', 'not_installed']),
  installing: new Set(['installed', 'failed', 'not_installed']),
  installed: new Set(['update_available', 'repair_required', 'installing', 'not_installed']),
  update_available: new Set(['installing', 'not_installed']),
  repair_required: new Set(['installing', 'not_installed']),
  failed: new Set(['installing', 'not_installed']),
};

function transitionAddon(rawState, id, nextState, patch = {}) {
  const addon = descriptor(id);
  if (!addon) throw new Error('Complemento desconocido');
  if (!ADDON_STATES.includes(nextState)) throw new Error('Estado de complemento inválido');
  const records = normalizeRecords(rawState);
  const current = records[addon.id] || { state: 'not_installed' };
  if (current.state !== nextState && !TRANSITIONS[current.state]?.has(nextState)) {
    throw new Error(`Transición de complemento no permitida: ${current.state} → ${nextState}`);
  }
  const candidate = { ...current, ...patch, state: nextState };
  const checked = validateAddonRecord(candidate);
  if (!checked.ok) throw new Error(`Registro de complemento inválido: ${checked.errors.join(', ')}`);
  return checked.record;
}

function parseAddonManifest(text) {
  let raw;
  try { raw = JSON.parse(String(text)); } catch (_) { throw new Error('El manifiesto del complemento no es JSON válido'); }
  const addon = descriptor(raw && raw.addonId);
  if (!addon) throw new Error('Complemento desconocido');
  if (raw.schemaVersion !== ADDON_SCHEMA) throw new Error('Versión de manifiesto no compatible');
  if (raw.packageName !== addon.packageName) throw new Error('El paquete no coincide con el complemento');
  if (!safeVersion(raw.version)) throw new Error('Versión del complemento inválida');
  if (!safeSha256(raw.sha256)) throw new Error('El hash SHA-256 del complemento es inválido');
  if (raw.minSdk !== undefined && (!Number.isInteger(raw.minSdk) || raw.minSdk < 21 || raw.minSdk > 100)) {
    throw new Error('minSdk del complemento inválido');
  }
  return {
    schemaVersion: ADDON_SCHEMA,
    addonId: addon.id,
    packageName: addon.packageName,
    version: raw.version.trim(),
    minSdk: raw.minSdk === undefined ? null : raw.minSdk,
    sha256: raw.sha256.toLowerCase(),
  };
}

function sha256Buffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

module.exports = {
  ADDON_SCHEMA,
  ADDON_STATES,
  BUILTIN_ADDONS,
  addonPackage,
  listAddons,
  validateAddonRecord,
  transitionAddon,
  parseAddonManifest,
  sha256Buffer,
  IDS,
};
