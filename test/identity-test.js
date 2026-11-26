'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const identity = require('../src/core/identity');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'xora-identity-'));
const env = { APPDATA: path.join(root, 'roaming') };
const home = path.join(root, 'home');
const legacy = path.join(env.APPDATA, 'apkstart');
const target = identity.paths({ env, home }).dataDir;
fs.mkdirSync(path.join(legacy, 'runtime'), { recursive: true });
fs.writeFileSync(path.join(legacy, 'settings.json'), '{"engine":{"prewarm":true}}');
fs.writeFileSync(path.join(legacy, 'runtime', 'marker.txt'), 'runtime');

const migration = identity.migrateLegacyData({ env, home, migrateAll: true });
assert.equal(migration.files, 2, 'debe copiar los archivos de la instalación anterior');
assert.equal(fs.readFileSync(path.join(target, 'settings.json'), 'utf8'), '{"engine":{"prewarm":true}}');
assert.equal(fs.readFileSync(path.join(target, 'runtime', 'marker.txt'), 'utf8'), 'runtime');
assert(fs.existsSync(legacy), 'la migración no debe borrar la fuente anterior');

fs.writeFileSync(path.join(target, 'settings.json'), 'nuevo');
const second = identity.migrateLegacyData({ env, home });
assert.equal(second.files, 0, 'la migración no debe sobrescribir datos XORA existentes');
assert.equal(fs.readFileSync(path.join(target, 'settings.json'), 'utf8'), 'nuevo');

const shared = identity.paths({ env, home });
assert.equal(shared.deviceSharedDir, '/sdcard/XORAShared');
assert.equal(path.basename(shared.dataDir), 'XORA');
assert(identity.isLegacySharedPath(path.join(home, 'ApkStartShared'), { env, home }));
assert(!identity.isLegacySharedPath(path.join(home, 'XORAShared'), { env, home }));

const avdHome = path.join(root, 'avd');
fs.mkdirSync(path.join(avdHome, 'apkstart.avd', 'snapshots', 'apkstart'), { recursive: true });
fs.writeFileSync(path.join(avdHome, 'apkstart.ini'), 'path=apkstart.avd\nname=apkstart\n');
const avdMigration = identity.migrateLegacyAvd(avdHome);
assert.strictEqual(avdMigration.migrated, true);
assert(fs.existsSync(path.join(avdHome, 'xora.avd', 'snapshots', 'xora')));
assert(fs.readFileSync(path.join(avdHome, 'xora.ini'), 'utf8').includes('xora.avd'));
console.log('identity: migration and XORA paths passed');
