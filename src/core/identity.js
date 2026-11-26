'use strict';

/**
 * Identidad y rutas canónicas de XORA.
 *
 * Las versiones anteriores usaban "ApkStart" en rutas, ejecutables y claves
 * del registro. La migración es deliberadamente conservadora: copia solo lo
 * que falta en la ruta XORA y conserva intactos los datos antiguos para que
 * una actualización interrumpida nunca destruya aplicaciones ni ajustes.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const PRODUCT_NAME = 'XORA';
const LEGACY_PRODUCT_NAMES = Object.freeze(['ApkStart', 'apkstart']);

function homeDir(home = os.homedir()) {
  return home || os.homedir();
}

function appDataDir(env = process.env, home = os.homedir()) {
  return env.APPDATA || path.join(homeDir(home), 'AppData', 'Roaming');
}

function paths(options = {}) {
  const storeBuild = !!options.storeBuild;
  const env = options.env || process.env;
  const home = homeDir(options.home || os.homedir());
  const appdata = appDataDir(env, home);
  const dataDir = storeBuild
    ? path.join(home, PRODUCT_NAME, 'data')
    : path.join(appdata, PRODUCT_NAME);
  const sharedDir = path.join(home, `${PRODUCT_NAME}Shared`);
  return {
    dataDir,
    sharedDir,
    deviceSharedDir: `/sdcard/${PRODUCT_NAME}Shared`,
    legacyDataDirs: storeBuild
      ? [path.join(home, 'ApkStart', 'data')]
      : [path.join(appdata, 'apkstart'), path.join(appdata, 'ApkStart')],
    legacySharedDirs: [path.join(home, 'ApkStartShared')],
  };
}

function copyMissing(source, destination) {
  if (!fs.existsSync(source)) return { files: 0, directories: 0 };
  const stat = fs.lstatSync(source);
  if (!stat.isDirectory()) {
    if (fs.existsSync(destination)) return { files: 0, directories: 0 };
    // Los locks pertenecen a procesos vivos y nunca se deben migrar.
    if (/\.lock$/i.test(path.basename(source))) return { files: 0, directories: 0 };
    try {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
      return { files: 1, directories: 0 };
    } catch (_) {
      // Un archivo que está siendo usado por el runtime no debe bloquear el
      // arranque de XORA; se volverá a generar al iniciar el nuevo AVD.
      return { files: 0, directories: 0 };
    }
  }

  fs.mkdirSync(destination, { recursive: true });
  let files = 0;
  let directories = 1;
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const result = copyMissing(path.join(source, entry.name), path.join(destination, entry.name));
    files += result.files;
    directories += result.directories;
  }
  return { files, directories };
}

function migrateLegacyData(options = {}) {
  const target = options.dataDir || paths(options).dataDir;
  const sources = options.legacyDataDirs || paths(options).legacyDataDirs;
  const allowedTopLevel = options.migrateAll ? null : new Set([
    'settings.json', 'apps.json', 'apks', 'icons', 'drivers', 'profiles',
  ]);
  const result = { files: 0, directories: 0, sources: [] };
  for (const source of sources) {
    if (!source || path.resolve(source).toLowerCase() === path.resolve(target).toLowerCase()) continue;
    if (!fs.existsSync(source)) continue;
    let copied = { files: 0, directories: 0 };
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      if (allowedTopLevel && !allowedTopLevel.has(entry.name)) continue;
      const part = copyMissing(path.join(source, entry.name), path.join(target, entry.name));
      copied.files += part.files;
      copied.directories += part.directories;
    }
    result.files += copied.files;
    result.directories += copied.directories;
    result.sources.push(source);
  }
  return result;
}

function migrateLegacyShared(options = {}) {
  const resolved = paths(options);
  return migrateLegacyData({
    dataDir: options.sharedDir || resolved.sharedDir,
    legacyDataDirs: options.legacySharedDirs || resolved.legacySharedDirs,
    migrateAll: true,
  });
}

function isLegacySharedPath(value, options = {}) {
  if (!value) return false;
  const resolved = paths(options);
  const candidate = path.resolve(String(value));
  return resolved.legacySharedDirs.some((legacy) => candidate.toLowerCase() === path.resolve(legacy).toLowerCase());
}

/** Migra el nombre técnico del AVD sin tocarlo si ya existe un XORA AVD. */
function migrateLegacyAvd(avdHome) {
  const root = String(avdHome || '');
  if (!root) return { migrated: false, reason: 'missing-root' };
  const oldDir = path.join(root, 'apkstart.avd');
  const newDir = path.join(root, 'xora.avd');
  if (!fs.existsSync(oldDir) || fs.existsSync(newDir)) return { migrated: false, reason: 'not-needed' };
  try {
    fs.renameSync(oldDir, newDir);
    const oldIni = path.join(root, 'apkstart.ini');
    const newIni = path.join(root, 'xora.ini');
    if (fs.existsSync(oldIni) && !fs.existsSync(newIni)) fs.renameSync(oldIni, newIni);
    const oldSnapshot = path.join(newDir, 'snapshots', 'apkstart');
    const newSnapshot = path.join(newDir, 'snapshots', 'xora');
    if (fs.existsSync(oldSnapshot) && !fs.existsSync(newSnapshot)) fs.renameSync(oldSnapshot, newSnapshot);
    for (const file of [newIni, path.join(newDir, 'config.ini')]) {
      if (!fs.existsSync(file)) continue;
      const text = fs.readFileSync(file, 'utf8').replace(/apkstart/gi, 'xora');
      fs.writeFileSync(file, text, 'utf8');
    }
    return { migrated: true, from: oldDir, to: newDir };
  } catch (error) {
    return { migrated: false, reason: error.code || error.message };
  }
}

function hasRuntime(dir) {
  if (!dir) return false;
  const exe = process.platform === 'win32' ? 'emulator.exe' : 'emulator';
  const sys = path.join(dir, 'system-images', 'android-34', 'google_apis_playstore', 'x86_64');
  return fs.existsSync(path.join(dir, 'emulator', exe))
    && fs.existsSync(path.join(dir, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb'))
    && (fs.existsSync(path.join(sys, 'system.img'))
      || fs.existsSync(path.join(sys, 'system.img.xz'))
      || fs.existsSync(path.join(sys, 'system.img.gz')));
}

/**
 * Mueve el runtime completo con rename (operación O(1)) cuando la carpeta
 * XORA aún no tiene un runtime usable. Si el proceso antiguo sigue activo,
 * Windows puede rechazar el rename y se mantiene un fallback temporal.
 */
function migrateLegacyRuntime(options = {}) {
  const target = options.runtimeDir;
  const legacyRoots = options.legacyDataDirs || [];
  if (!target || hasRuntime(target)) return { migrated: false, reason: 'not-needed' };
  for (const root of legacyRoots) {
    const source = path.join(root, 'runtime');
    if (!hasRuntime(source)) continue;
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      let partial = '';
      if (fs.existsSync(target)) {
        partial = `${target}.migration-partial`;
        if (!fs.existsSync(partial)) fs.renameSync(target, partial);
      }
      fs.renameSync(source, target);
      return { migrated: true, from: source, to: target };
    } catch (error) {
      const partial = `${target}.migration-partial`;
      try {
        if (!fs.existsSync(target) && fs.existsSync(partial)) fs.renameSync(partial, target);
      } catch (_) { /* no ocultar el error original */ }
      return { migrated: false, reason: error.code || error.message, fallback: source };
    }
  }
  return { migrated: false, reason: 'not-found' };
}

function legacyRuntimeFallback(options = {}) {
  const target = options.runtimeDir;
  if (hasRuntime(target)) return '';
  for (const root of options.legacyDataDirs || []) {
    const source = path.join(root, 'runtime');
    if (hasRuntime(source)) return source;
  }
  return '';
}

module.exports = {
  PRODUCT_NAME,
  LEGACY_PRODUCT_NAMES,
  paths,
  copyMissing,
  migrateLegacyData,
  migrateLegacyShared,
  migrateLegacyAvd,
  migrateLegacyRuntime,
  legacyRuntimeFallback,
  isLegacySharedPath,
};
