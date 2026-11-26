'use strict';

const assert = require('assert');
const { mergeInstalledApp } = require('../src/ui/library-state');
const { normalizeInstallPath } = require('../src/core/installer');

const installed = {
  package: 'com.xora.demo',
  label: 'Demo XORA',
  versionName: '1.0.0',
  installedAt: 10,
};

const first = mergeInstalledApp([], installed);
assert.deepStrictEqual(first, [installed], 'una aplicación recién instalada debe entrar en una biblioteca vacía');

const previous = { ...installed, pinned: true, lastLaunchAt: 42 };
const updated = mergeInstalledApp([previous], { ...installed, versionName: '1.1.0', installedAt: 99 });
assert.strictEqual(updated.length, 1, 'actualizar un paquete no debe duplicar la tarjeta');
assert.strictEqual(updated[0].versionName, '1.1.0', 'la tarjeta debe mostrar la versión recién instalada');
assert.strictEqual(updated[0].pinned, true, 'la actualización debe conservar preferencias de la biblioteca');
assert.strictEqual(updated[0].lastLaunchAt, 42, 'la actualización debe conservar el último inicio');

assert.strictEqual(normalizeInstallPath('  C:\\Apps\\demo.apk  '), 'C:\\Apps\\demo.apk');
assert.strictEqual(normalizeInstallPath(['C:\\Apps\\demo.apks']), 'C:\\Apps\\demo.apks');
assert.strictEqual(normalizeInstallPath({ filePath: 'C:\\Apps\\demo.xapk' }), 'C:\\Apps\\demo.xapk');
assert.throws(() => normalizeInstallPath([]), /APK|archivo|selecciona/i);
assert.throws(() => normalizeInstallPath('C:\\Apps\\demo.txt'), /APK|formato/i);

console.log('✓ biblioteca e instalación: inserción, actualización y entrada de rutas');
