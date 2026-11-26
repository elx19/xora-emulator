'use strict';

/**
 * Perfiles de dispositivo de XORA.
 *
 * Este módulo no toca Electron ni el runtime: define el contrato estable que
 * comparte la interfaz con el proceso principal. Las entradas externas se
 * validan aquí antes de convertirse en un parche de configuración.
 */

const PROFILE_SCHEMA = 'xora-profile/1';
const PROFILE_ID = /^[a-z0-9][a-z0-9._-]{1,47}$/;
const SIZE = /^\d{3,4}x\d{3,4}$/;
const MODES = new Set(['save', 'balanced', 'smooth']);
const FPS = new Set([30, 60, 90, 120]);

const BUILTIN_PROFILES = Object.freeze([
  {
    schemaVersion: PROFILE_SCHEMA,
    id: 'basic-pc',
    name: 'PC básica',
    description: 'Para equipos con recursos limitados.',
    icon: 'desktop',
    memoryMB: 2048,
    cores: 2,
    resolution: '1280 × 720 (HD)',
    renderSize: '1280x720',
    fps: 30,
    dpi: 240,
    landscape: true,
    resourceMode: 'save',
  },
  {
    schemaVersion: PROFILE_SCHEMA,
    id: 'laptop',
    name: 'Portátil',
    description: 'Equilibrio ideal entre rendimiento y calidad.',
    icon: 'laptop',
    memoryMB: 4096,
    cores: 4,
    resolution: '1920 × 1080 (Full HD)',
    renderSize: '1920x1080',
    fps: 60,
    dpi: 240,
    landscape: true,
    resourceMode: 'balanced',
    recommended: true,
  },
  {
    schemaVersion: PROFILE_SCHEMA,
    id: 'high-end-pc',
    name: 'PC de alto rendimiento',
    description: 'Para una experiencia fluida y mayor calidad gráfica.',
    icon: 'tower',
    memoryMB: 8192,
    cores: 6,
    resolution: '2560 × 1440 (QHD)',
    renderSize: '2560x1440',
    fps: 120,
    dpi: 320,
    landscape: true,
    resourceMode: 'smooth',
  },
  {
    schemaVersion: PROFILE_SCHEMA,
    id: 'preset-phone',
    name: 'Teléfono preconfigurado',
    description: 'Ideal para pruebas, desarrollo o uso ligero de apps.',
    icon: 'phone',
    memoryMB: 3072,
    cores: 4,
    resolution: '1080 × 2400 (FHD+)',
    renderSize: '1080x2400',
    fps: 60,
    dpi: 420,
    landscape: false,
    resourceMode: 'balanced',
  },
  {
    schemaVersion: PROFILE_SCHEMA,
    id: 'gaming-phone',
    name: 'Teléfono gaming',
    description: 'Para juegos móviles con mayor fluidez y respuesta.',
    icon: 'gaming-phone',
    memoryMB: 6144,
    cores: 6,
    resolution: '1440 × 3200 (QHD+)',
    renderSize: '1440x3200',
    fps: 120,
    dpi: 480,
    landscape: false,
    resourceMode: 'smooth',
  },
  {
    schemaVersion: PROFILE_SCHEMA,
    id: 'tablet',
    name: 'Tableta',
    description: 'Experiencia cómoda y estable en pantalla grande.',
    icon: 'tablet',
    memoryMB: 4096,
    cores: 4,
    resolution: '1920 × 1200 (WUXGA)',
    renderSize: '1920x1200',
    fps: 60,
    dpi: 280,
    landscape: true,
    resourceMode: 'balanced',
  },
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateProfile(raw) {
  const profile = raw && typeof raw === 'object' ? raw : {};
  const errors = [];
  if (profile.schemaVersion !== PROFILE_SCHEMA) errors.push('schemaVersion no compatible');
  if (typeof profile.id !== 'string' || !PROFILE_ID.test(profile.id)) errors.push('id inválido');
  if (typeof profile.name !== 'string' || profile.name.trim().length < 1 || profile.name.trim().length > 60) errors.push('nombre inválido');
  if (typeof profile.description !== 'string' || profile.description.length > 160) errors.push('descripción inválida');
  if (!Number.isInteger(profile.memoryMB) || profile.memoryMB < 1024 || profile.memoryMB > 65536 || profile.memoryMB % 256 !== 0) errors.push('memoria inválida');
  if (!Number.isInteger(profile.cores) || profile.cores < 1 || profile.cores > 64) errors.push('núcleos inválidos');
  if (typeof profile.renderSize !== 'string' || !SIZE.test(profile.renderSize)) errors.push('resolución inválida');
  if (!FPS.has(profile.fps)) errors.push('FPS inválidos');
  if (!Number.isInteger(profile.dpi) || profile.dpi < 120 || profile.dpi > 640) errors.push('DPI inválido');
  if (typeof profile.landscape !== 'boolean') errors.push('orientación inválida');
  if (!MODES.has(profile.resourceMode)) errors.push('modo de recursos inválido');
  return { ok: errors.length === 0, errors, profile: errors.length ? null : clone(profile) };
}

function listProfiles({ custom = [] } = {}) {
  const result = BUILTIN_PROFILES.map(clone);
  const ids = new Set(result.map((profile) => profile.id));
  for (const candidate of Array.isArray(custom) ? custom : []) {
    const checked = validateProfile(candidate);
    if (!checked.ok || ids.has(checked.profile.id)) continue;
    result.push({ ...checked.profile, custom: true });
    ids.add(checked.profile.id);
  }
  return result;
}

function recommendProfile({ totalMB = 0, cores = 0 } = {}) {
  const memory = Number(totalMB) || 0;
  const cpu = Number(cores) || 0;
  if (memory >= 16384 && cpu >= 8) return clone(BUILTIN_PROFILES[2]);
  if (memory < 6144 || cpu <= 4) return clone(BUILTIN_PROFILES[0]);
  return clone(BUILTIN_PROFILES[1]);
}

function profilePatch(profile) {
  const checked = validateProfile(profile);
  if (!checked.ok) throw new Error(`Perfil inválido: ${checked.errors.join(', ')}`);
  const p = checked.profile;
  return {
    engine: {
      resourceMode: p.resourceMode,
      memoryMB: p.memoryMB,
      cores: p.cores,
      autoMemory: false,
      renderSize: p.renderSize,
      fpsTarget: p.fps,
    },
    display: { landscape: p.landscape, density: p.dpi },
  };
}

function parseProfileJson(text) {
  let raw;
  try { raw = JSON.parse(String(text)); } catch (_) { throw new Error('Perfil inválido: JSON mal formado'); }
  const checked = validateProfile(raw);
  if (!checked.ok) throw new Error(`Perfil inválido: ${checked.errors.join(', ')}`);
  return checked.profile;
}

module.exports = {
  PROFILE_SCHEMA,
  BUILTIN_PROFILES,
  validateProfile,
  listProfiles,
  recommendProfile,
  profilePatch,
  parseProfileJson,
};
