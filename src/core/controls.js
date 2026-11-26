'use strict';

/** Contrato común para teclado, mouse, mando y perfiles por aplicación. */
const CONTROL_SCHEMA = 'xora-controls/1';
const CONTROL_PROFILES = ['general', 'action', 'racing', 'custom', 'fps', 'moba', 'productivity'];
const DPI_OPTIONS = [400, 800, 1200, 1600, 2400, 3200];
const ACTIONS = ['tap', 'swipe', 'keyevent'];
const SOURCES = ['keyboard', 'gamepad'];
const PACKAGE_RE = /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)+$/;

function number(value, fallback, min, max) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

function normalizeSource(value) { return SOURCES.includes(value) ? value : 'keyboard'; }

function normalizeMapping(value) {
  const item = value && typeof value === 'object' ? value : {};
  if (item.source !== undefined && !SOURCES.includes(item.source)) return null;
  if (item.action !== undefined && !ACTIONS.includes(item.action)) return null;
  const source = normalizeSource(item.source);
  const key = source === 'gamepad' ? String(item.button || '').trim().toLowerCase() : String(item.key || '').trim();
  if (!key || key.length > 32) return null;
  const action = ACTIONS.includes(item.action) ? item.action : 'tap';
  const output = { source, [source === 'gamepad' ? 'button' : 'key']: key, action };
  if (action === 'keyevent') {
    if (item.code !== undefined && (!Number.isFinite(Number(item.code)) || Number(item.code) < 0 || Number(item.code) > 255)) return null;
    const code = Math.round(number(item.code, NaN, 0, 255));
    if (!Number.isFinite(code)) return null;
    output.code = code;
  } else if (action === 'swipe') {
    for (const axis of ['x1', 'y1', 'x2', 'y2']) {
      if (item[axis] !== undefined && (!Number.isFinite(Number(item[axis])) || Number(item[axis]) < 0 || Number(item[axis]) > 1)) return null;
      output[axis] = number(item[axis], 0.5, 0, 1);
    }
    output.duration = Math.round(number(item.duration, 100, 1, 5000));
  } else {
    if (item.x !== undefined && (!Number.isFinite(Number(item.x)) || Number(item.x) < 0 || Number(item.x) > 1)) return null;
    if (item.y !== undefined && (!Number.isFinite(Number(item.y)) || Number(item.y) < 0 || Number(item.y) > 1)) return null;
    output.x = number(item.x, 0.5, 0, 1);
    output.y = number(item.y, 0.5, 0, 1);
  }
  return output;
}

function normalizeMappings(mappings) {
  if (!Array.isArray(mappings)) throw new Error('Las asignaciones deben ser una lista');
  if (mappings.length > 128) throw new Error('Un perfil no puede tener más de 128 asignaciones');
  const result = mappings.map(normalizeMapping).filter(Boolean);
  if (result.length !== mappings.length) throw new Error('El perfil contiene una asignación no válida');
  const seen = new Set();
  for (const item of result) {
    const id = `${item.source}:${item.source === 'gamepad' ? item.button : item.key}`;
    if (seen.has(id)) throw new Error(`La asignación ${id} está repetida`);
    seen.add(id);
  }
  return result;
}

function normalizeProfile(value = {}) {
  const item = value && typeof value === 'object' ? value : {};
  const id = String(item.id || 'custom').trim().slice(0, 64);
  const profile = CONTROL_PROFILES.includes(item.profile) ? item.profile : 'custom';
  return {
    schema: CONTROL_SCHEMA,
    id,
    profile,
    dpi: DPI_OPTIONS.includes(Number(item.dpi)) ? Number(item.dpi) : 800,
    sensitivity: Math.round(number(item.sensitivity, 50, 1, 100)),
    cursorLock: item.cursorLock !== false,
    vibration: item.vibration !== false,
    mappings: normalizeMappings(item.mappings || []),
    updatedAt: Number.isFinite(Number(item.updatedAt)) ? Number(item.updatedAt) : Date.now(),
  };
}

function validatePackageName(pkg) {
  if (!PACKAGE_RE.test(String(pkg || ''))) throw new Error('Paquete de aplicación no válido');
  return String(pkg);
}

function normalizeAppControls(pkg, value) {
  return { package: validatePackageName(pkg), ...normalizeProfile(value) };
}

function gamepadPressed(previous, current) {
  return !!current && !previous;
}

module.exports = {
  CONTROL_SCHEMA,
  CONTROL_PROFILES,
  DPI_OPTIONS,
  ACTIONS,
  SOURCES,
  normalizeMapping,
  normalizeMappings,
  normalizeProfile,
  normalizeAppControls,
  validatePackageName,
  gamepadPressed,
};
