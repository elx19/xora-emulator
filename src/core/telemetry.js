'use strict';

/** Métricas de ejecución sin telemetría externa ni datos personales. */

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseMeminfo(text) {
  const values = {};
  for (const line of String(text || '').split(/\r?\n/)) {
    const match = /^([A-Za-z_]+):\s*(\d+)\s*kB/i.exec(line.trim());
    if (match) values[match[1]] = Number(match[2]);
  }
  const totalKB = values.MemTotal || 0;
  const availableKB = values.MemAvailable ?? values.MemFree ?? 0;
  const totalMB = totalKB ? Math.round(totalKB / 1024) : null;
  const availableMB = totalKB ? Math.max(0, Math.round(availableKB / 1024)) : null;
  const usedPercent = totalKB > 0
    ? Math.max(0, Math.min(100, Math.round(((totalKB - availableKB) / totalKB) * 100)))
    : null;
  return { totalMB, availableMB, usedMB: totalMB === null || availableMB === null ? null : totalMB - availableMB, usedPercent };
}

function parseCpuPercent(text) {
  const match = /(?:^|\n)\s*(\d+(?:\.\d+)?)%\s+/m.exec(String(text || ''));
  const n = match ? Number(match[1]) : NaN;
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : null;
}

function parseGpuPercent(text) {
  const match = /(?:gpu(?:\s+usage)?|gpu_util(?:ization)?)\s*[:=]\s*(\d+(?:\.\d+)?)\s*%?/i.exec(String(text || ''));
  const n = match ? Number(match[1]) : NaN;
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : null;
}

function parseTemperatureC(text) {
  const input = String(text || '');
  const preferred = /(?:CPU\d*\s*[:=]|mValue\s*=)\s*(\d+(?:\.\d+)?)/i.exec(input);
  const fallback = /(?:^|\n)[^\d+\-]*(\d+(?:\.\d+)?)/.exec(input);
  const n = Number((preferred || fallback || [])[1]);
  return Number.isFinite(n) && n > -50 && n < 150 ? Math.round(n * 100) / 100 : null;
}

function parseSurfaceFlingerFps(text) {
  const times = String(text || '').split(/\r?\n/)
    .map((line) => Number(/^\s*(\d+)/.exec(line)?.[1]))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
  if (times.length < 2) return null;
  const span = times[times.length - 1] - times[0];
  if (span <= 0) return null;
  // SurfaceFlinger usa nanosegundos. Aceptamos microsegundos para facilitar
  // pruebas y versiones que exponen la traza en otra unidad.
  const seconds = span > 1e6 ? span / 1e9 : span > 1e3 ? span / 1e6 : span / 1e3;
  const fps = (times.length - 1) / seconds;
  return Number.isFinite(fps) ? Math.max(1, Math.min(240, Math.round(fps))) : null;
}

function emptyMetrics(at = Date.now(), error = '') {
  return {
    at,
    runtime: false,
    cpu: { percent: null },
    memory: { totalMB: null, availableMB: null, usedMB: null, percent: null },
    gpu: { percent: null },
    temperatureC: null,
    fps: null,
    error: error || null,
  };
}

async function safeShell(client, command) {
  try { return await client.shell(command, { timeout: 6000 }); } catch (_) { return ''; }
}

async function collectMetrics({ client, now = Date.now() } = {}) {
  if (!client || typeof client.shell !== 'function') return emptyMetrics(now, 'runtime-offline');
  const [meminfo, cpuinfo, temperature, latency, gpuinfo] = await Promise.all([
    safeShell(client, 'cat /proc/meminfo'),
    safeShell(client, 'dumpsys cpuinfo'),
    safeShell(client, 'dumpsys hardware_properties'),
    safeShell(client, 'dumpsys SurfaceFlinger --latency'),
    safeShell(client, 'dumpsys gpu'),
  ]);
  const memory = parseMeminfo(meminfo);
  return {
    at: now,
    runtime: true,
    cpu: { percent: parseCpuPercent(cpuinfo) },
    memory: { ...memory, percent: memory.usedPercent },
    gpu: { percent: parseGpuPercent(gpuinfo) },
    temperatureC: parseTemperatureC(temperature),
    fps: parseSurfaceFlingerFps(latency),
    error: null,
  };
}

class MetricsSampler {
  constructor({ getClient, onSample = () => {}, intervalMs = 1000 } = {}) {
    this._getClient = getClient || (() => null);
    this._onSample = onSample;
    this._intervalMs = Math.max(250, Number(intervalMs) || 1000);
    this._timer = null;
    this._busy = false;
    this._last = emptyMetrics();
  }

  get running() { return !!this._timer; }
  get last() { return this._last; }

  async sampleOnce() {
    if (this._busy) return this._last;
    this._busy = true;
    try {
      this._last = await collectMetrics({ client: this._getClient(), now: Date.now() });
      this._onSample(this._last);
      return this._last;
    } finally {
      this._busy = false;
    }
  }

  start() {
    if (this._timer) return;
    this.sampleOnce().catch(() => {});
    this._timer = setInterval(() => this.sampleOnce().catch(() => {}), this._intervalMs);
    this._timer.unref?.();
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }
}

module.exports = {
  parseMeminfo,
  parseCpuPercent,
  parseGpuPercent,
  parseTemperatureC,
  parseSurfaceFlingerFps,
  collectMetrics,
  MetricsSampler,
  emptyMetrics,
  numberOrNull,
};
