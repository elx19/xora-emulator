'use strict';

const assert = require('assert');
const {
  ADDON_SCHEMA,
  ADDON_STATES,
  BUILTIN_ADDONS,
  listAddons,
  validateAddonRecord,
  transitionAddon,
  addonPackage,
  parseAddonManifest,
} = require('../src/core/addons');

assert.strictEqual(ADDON_SCHEMA, 'xora-addon/1');
assert.deepStrictEqual(ADDON_STATES, [
  'not_installed', 'available', 'installing', 'installed',
  'update_available', 'repair_required', 'failed',
]);
assert.deepStrictEqual(BUILTIN_ADDONS.map((addon) => addon.id), [
  'google-play-store',
  'google-play-games',
  'google-play-services',
]);
assert.strictEqual(addonPackage('google-play-store'), 'com.android.vending');

const initial = listAddons({});
assert.strictEqual(initial.length, 3);
assert.ok(initial.every((addon) => addon.state === 'not_installed'));
assert.ok(initial.every((addon) => addon.actions.includes('install')));

const playImage = listAddons({}, { playImageReady: true });
assert.strictEqual(playImage[0].state, 'installed');
assert.strictEqual(playImage[0].source, 'runtime-image');
assert.strictEqual(playImage[2].state, 'installed');
assert.strictEqual(playImage[2].source, 'runtime-image');
assert.strictEqual(playImage[1].state, 'not_installed');

const installed = listAddons({
  records: {
    'google-play-store': {
      state: 'installed', version: '42', packageName: 'com.android.vending',
      sha256: 'a'.repeat(64), installedAt: 123,
    },
  },
});
assert.strictEqual(installed[0].state, 'installed');
assert.deepStrictEqual(installed[0].actions, ['repair', 'uninstall']);
assert.strictEqual(installed[0].version, '42');

assert.strictEqual(validateAddonRecord({
  state: 'installed', packageName: 'com.android.vending', version: '1', sha256: 'b'.repeat(64),
}).ok, true);
assert.strictEqual(validateAddonRecord({
  state: 'installed', packageName: 'com.android.vending', version: '../bad', sha256: 'not-a-hash',
}).ok, false);

assert.strictEqual(transitionAddon({}, 'google-play-store', 'installing').state, 'installing');
assert.strictEqual(transitionAddon({}, 'google-play-store', 'available').state, 'available');
assert.strictEqual(transitionAddon({ records: { 'google-play-store': { state: 'installing' } } }, 'google-play-store', 'installed').state, 'installed');
assert.strictEqual(transitionAddon({ records: { 'google-play-store': { state: 'installed' } } }, 'google-play-store', 'installing').state, 'installing');
assert.throws(() => transitionAddon({}, 'unknown', 'installed'), /complemento|addon/i);
assert.throws(() => transitionAddon({ records: { 'google-play-store': { state: 'not_installed' } } }, 'google-play-store', 'installed'), /instalando|transici/i);

const manifest = parseAddonManifest(JSON.stringify({
  schemaVersion: ADDON_SCHEMA,
  addonId: 'google-play-store',
  packageName: 'com.android.vending',
  version: '40.2.0',
  minSdk: 23,
  sha256: 'c'.repeat(64),
}));
assert.strictEqual(manifest.addonId, 'google-play-store');
assert.throws(() => parseAddonManifest(JSON.stringify({
  schemaVersion: ADDON_SCHEMA,
  addonId: 'google-play-store',
  packageName: 'com.evil.app',
  version: '1',
  sha256: 'd'.repeat(64),
})), /paquete|package/i);

console.log('✓ complementos: catálogo, estados, transición y manifiesto seguro');
