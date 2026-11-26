'use strict';

const assert = require('assert');
const {
  parseMeminfo,
  parseCpuPercent,
  parseGpuPercent,
  parseTemperatureC,
  parseSurfaceFlingerFps,
  collectMetrics,
  MetricsSampler,
} = require('../src/core/telemetry');

const memory = parseMeminfo([
  'MemTotal:        8192000 kB',
  'MemAvailable:    4096000 kB',
  'MemFree:         2048000 kB',
].join('\n'));
assert.strictEqual(memory.totalMB, 8000);
assert.strictEqual(memory.availableMB, 4000);
assert.strictEqual(memory.usedPercent, 50);

assert.strictEqual(parseCpuPercent('  27%  1234/com.example: 20% user + 7% kernel'), 27);
assert.strictEqual(parseCpuPercent('sin datos'), null);
assert.strictEqual(parseGpuPercent('GPU usage: 42%'), 42);
assert.strictEqual(parseTemperatureC('CPU0: 42.5\nGPU: 39.0'), 42.5);
assert.strictEqual(parseTemperatureC('mValue=38.25'), 38.25);
assert.strictEqual(parseTemperatureC(''), null);

const frameLines = ['16666666 0 0', '33333332 0 0', '49999998 0 0', '66666664 0 0'].join('\n');
assert.strictEqual(parseSurfaceFlingerFps(frameLines), 60);
assert.strictEqual(parseSurfaceFlingerFps(''), null);

(async () => {
  const calls = [];
  const client = {
    shell: async (cmd) => {
      calls.push(cmd);
      if (cmd.includes('/proc/meminfo')) return 'MemTotal: 4096000 kB\nMemAvailable: 2048000 kB';
      if (cmd.includes('dumpsys cpuinfo')) return '  18% 1234/com.example: 12% user + 6% kernel';
      if (cmd.includes('hardware_properties')) return 'CPU0: 41.0';
      if (cmd.includes('SurfaceFlinger')) return frameLines;
      if (cmd.includes('dumpsys gpu')) return 'GPU usage: 42%';
      return '';
    },
  };
  const sample = await collectMetrics({ client, now: 123 });
  assert.strictEqual(sample.at, 123);
  assert.strictEqual(sample.cpu.percent, 18);
  assert.strictEqual(sample.memory.percent, 50);
  assert.strictEqual(sample.temperatureC, 41);
  assert.strictEqual(sample.fps, 60);
  assert.strictEqual(sample.gpu.percent, 42);
  assert.strictEqual(calls.length, 5);

  let samples = 0;
  const sampler = new MetricsSampler({
    getClient: () => client,
    intervalMs: 20,
    onSample: () => { samples += 1; },
  });
  await sampler.sampleOnce();
  sampler.start();
  await new Promise((resolve) => setTimeout(resolve, 65));
  sampler.stop();
  const observed = samples;
  await new Promise((resolve) => setTimeout(resolve, 45));
  assert.ok(observed >= 2, `se esperaban muestras periódicas, recibidas: ${observed}`);
  assert.strictEqual(samples, observed, 'detener el muestreador debe detener el intervalo');

  console.log('✓ métricas: memoria, CPU, temperatura, FPS y muestreador');
})().catch((error) => { console.error(error); process.exit(1); });
