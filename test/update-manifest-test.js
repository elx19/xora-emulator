'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const m = require('../src/core/update-manifest');

const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const base = {
  schemaVersion: 1,
  product: 'xora',
  version: '0.7.0',
  channel: 'stable',
  platform: 'win32-x64',
  minimumVersion: '0.6.4',
  mandatory: false,
  asset: 'XORA-Setup-0.7.0.exe',
  sha512: 'a'.repeat(128),
  releaseNotes: 'https://github.com/elx19/xora-emulator/releases/tag/v0.7.0',
};
function signed(value = base) {
  const payload = m.unsignedPayload(value);
  return {
    ...value,
    signature: crypto.sign('sha256', Buffer.from(payload), keys.privateKey).toString('base64'),
  };
}

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1; }
}

console.log('\n[Manifiesto firmado · contrato y seguridad]');
test('valida y verifica un manifiesto firmado', () => {
  const result = m.verifyManifest(signed(), { publicKey: keys.publicKey, platform: 'win32-x64', channel: 'stable' });
  assert.strictEqual(result.product, 'xora');
});
test('rechaza firma alterada, producto incorrecto y URL no permitida', () => {
  const badSignature = signed();
  badSignature.version = '0.7.1';
  assert.throws(() => m.verifyManifest(badSignature, { publicKey: keys.publicKey }));
  assert.throws(() => m.validateManifest({ ...signed(), product: 'other' }));
  assert.throws(() => m.validateManifest({ ...signed(), releaseNotes: 'http://example.com/notes' }));
});
test('selecciona solo versiones nuevas compatibles con el canal', () => {
  const selected = m.selectManifest([
    signed({ ...base, version: '0.6.5' }),
    signed({ ...base, version: '0.7.0', channel: 'beta' }),
    signed({ ...base, version: '0.8.0', channel: 'development' }),
  ], { currentVersion: '0.6.4', channel: 'stable', platform: 'win32-x64' });
  assert.strictEqual(selected.version, '0.6.5');
});
test('verifica hash SHA-512 del artefacto', () => {
  const dir = path.join(__dirname, 'out', 'manifest');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'payload.exe');
  fs.writeFileSync(file, 'xora-update');
  const hash = m.sha512File(file);
  assert.deepStrictEqual(m.verifyAssetFile(file, { sha512: hash }), { ok: true, sha512: hash });
  assert.throws(() => m.verifyAssetFile(file, { sha512: '0'.repeat(128) }));
  fs.rmSync(dir, { recursive: true, force: true });
});
test('registra estado pendiente, saludable y fallido para rollback', () => {
  const dir = path.join(__dirname, 'out', 'rollback');
  m.markUpdatePending(dir, { from: '0.6.4', to: '0.7.0' });
  assert.strictEqual(m.readRollback(dir).state, 'pending');
  m.markUpdateHealthy(dir, '0.7.0');
  assert.strictEqual(m.readRollback(dir).state, 'healthy');
  m.markUpdateFailed(dir, 'arranque fallido');
  assert.strictEqual(m.readRollback(dir).state, 'failed');
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`\nManifiesto firmado: ${passed} pruebas correctas`);
if (process.exitCode) process.exit(1);
