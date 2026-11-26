'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { verifyReleaseArtifact } = require('../src/core/release-artifact');
const manifest = require('../src/core/update-manifest');

const TMP = path.join(__dirname, 'out', 'release-artifact');
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const artifactPath = path.join(TMP, 'XORA-v0.7.0-win64-portable.zip');
const manifestPath = path.join(TMP, 'XORA-v0.7.0-update-manifest.json');
fs.writeFileSync(artifactPath, Buffer.from('xora-release-payload'));

const unsigned = {
  schemaVersion: 1,
  product: 'xora',
  version: '0.7.0',
  channel: 'stable',
  platform: 'win32-x64',
  minimumVersion: '0.6.4',
  mandatory: false,
  asset: path.basename(artifactPath),
  sha512: manifest.sha512File(artifactPath),
  releaseNotes: 'https://github.com/elx19/xora-emulator/releases/tag/v0.7.0',
};
const signed = {
  ...unsigned,
  signature: crypto.sign('sha256', Buffer.from(manifest.unsignedPayload(unsigned)), privateKey).toString('base64'),
};
fs.writeFileSync(manifestPath, JSON.stringify(signed));

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (error) { console.error(`  ✗ ${name}\n    ${error.message}`); process.exitCode = 1; }
}

console.log('\n[Release · verificación de artefactos]');
test('verifica firma, versión, nombre y SHA-512 del artefacto', () => {
  const result = verifyReleaseArtifact({
    manifestPath,
    artifactPath,
    platform: 'win32-x64',
    publicKey,
  });
  assert.equal(result.version, '0.7.0');
  assert.equal(result.asset, path.basename(artifactPath));
  assert.equal(result.sha512, unsigned.sha512);
});

test('rechaza un artefacto con bytes alterados', () => {
  fs.appendFileSync(artifactPath, Buffer.from('tamper'));
  assert.throws(() => verifyReleaseArtifact({ manifestPath, artifactPath, publicKey }), /SHA-512/);
});

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\nVerificación de Release: ${passed} pruebas correctas`);
if (process.exitCode) process.exit(1);
