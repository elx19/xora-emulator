'use strict';

const assert = require('assert/strict');
const { InputLatency } = require('../src/core/input-latency');
const { KeymapEngine } = require('../src/core/keymap-engine');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (error) { console.error(`  ✗ ${name}\n    ${error.message}`); process.exitCode = 1; }
}

console.log('\n[Controles · latencia de entrada]');
test('calcula promedio, percentil 95 y modelo del mando', () => {
  const latency = new InputLatency({ maxSamples: 8 });
  latency.record({ deviceId: 'Sony DualShock 4', source: 'gamepad', latencyMs: 4 });
  latency.record({ deviceId: 'Sony DualShock 4', source: 'gamepad', latencyMs: 8 });
  latency.record({ deviceId: 'Sony DualShock 4', source: 'gamepad', latencyMs: 12 });
  const stats = latency.snapshot();
  assert.equal(stats.deviceId, 'Sony DualShock 4');
  assert.equal(stats.samples, 3);
  assert.equal(stats.averageMs, 8);
  assert.equal(stats.p95Ms, 12);
  assert.equal(stats.minMs, 4);
  assert.equal(stats.maxMs, 12);
});

test('descarta muestras inválidas y limita el historial', () => {
  const latency = new InputLatency({ maxSamples: 2 });
  latency.record({ latencyMs: -1 });
  latency.record({ latencyMs: 2 });
  latency.record({ latencyMs: 3 });
  latency.record({ latencyMs: Number.NaN });
  assert.equal(latency.snapshot().samples, 2);
  assert.equal(latency.snapshot().averageMs, 2.5);
});

test('el motor registra el tiempo de entrada del mando sin romper el contrato', async () => {
  const calls = [];
  const engine = new KeymapEngine({
    minInterval: 0,
    clock: (() => { let now = 100; return () => (now += 2); })(),
    execInput: async (command) => { calls.push(command); },
    getSize: () => ({ width: 720, height: 1280 }),
  });
  engine.setMap('com.xora.game', [{ source: 'gamepad', button: 'a', action: 'tap', x: 0.5, y: 0.5 }]);
  engine.enable(true);
  assert.equal(await engine.handleGamepad('a', true, 'com.xora.game', { deviceId: 'Xbox Controller', sampleAt: 98 }), true);
  const stats = engine.latencyStats();
  assert.equal(calls[0], 'input tap 360 640');
  assert.equal(stats.deviceId, 'Xbox Controller');
  assert.equal(stats.samples, 1);
  assert.ok(stats.averageMs >= 0);
});

console.log(`\nLatencia de entrada: ${passed} pruebas correctas`);
if (process.exitCode) process.exit(1);
