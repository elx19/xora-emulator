'use strict';

const assert = require('assert');
const controls = require('../src/core/controls');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1; }
}

console.log('\n[Controles · contrato por aplicación]');
test('normaliza perfil, DPI, sensibilidad y asignaciones', () => {
  const p = controls.normalizeAppControls('com.xora.game', {
    profile: 'fps', dpi: 1200, sensitivity: 72, mappings: [
      { source: 'keyboard', key: 'W', action: 'tap', x: 0.2, y: 0.8 },
      { source: 'gamepad', button: 'A', action: 'keyevent', code: 66 },
    ],
  });
  assert.strictEqual(p.schema, 'xora-controls/1');
  assert.strictEqual(p.mappings[0].key, 'W');
  assert.strictEqual(p.mappings[1].button, 'a');
  assert.strictEqual(p.dpi, 1200);
});
test('rechaza paquete, duplicados, coordenadas y códigos inválidos', () => {
  assert.throws(() => controls.validatePackageName('not a package'));
  assert.throws(() => controls.normalizeMappings([{ key: 'w' }, { key: 'w' }]));
  assert.throws(() => controls.normalizeMappings([{ key: 'x', action: 'tap', x: 2 }]));
  assert.throws(() => controls.normalizeMappings([{ source: 'gamepad', button: 'a', action: 'keyevent', code: 999 }]));
});
test('limita perfiles excesivos y conserva la configuración por aplicación', () => {
  assert.throws(() => controls.normalizeMappings(Array.from({ length: 129 }, (_, i) => ({ key: `F${i}`, action: 'tap' }))));
  const p = controls.normalizeAppControls('com.xora.racing', { profile: 'racing', dpi: 800, mappings: [] });
  assert.strictEqual(p.package, 'com.xora.racing');
  assert.strictEqual(p.profile, 'racing');
  assert.strictEqual(controls.gamepadPressed(false, true), true);
  assert.strictEqual(controls.gamepadPressed(true, true), false);
});

console.log(`\nControles por aplicación: ${passed} pruebas correctas`);
if (process.exitCode) process.exit(1);
