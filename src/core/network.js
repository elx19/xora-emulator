'use strict';

const https = require('https');
const { URL } = require('url');

// Probe pequeño y fijo: no se acepta una URL suministrada por la interfaz.
// Así el indicador de red no puede convertirse en un descargador arbitrario.
const DEFAULT_PROBE_URL = 'https://speed.cloudflare.com/__down?bytes=262144';
const ALLOWED_HOSTS = new Set(['speed.cloudflare.com']);

/** Convierte Mbps en una señal simple para la barra de estado. */
function classifySignal(speedMbps) {
  const speed = Number(speedMbps);
  if (!Number.isFinite(speed) || speed <= 0) return { level: 'offline', bars: 0 };
  if (speed < 2) return { level: 'weak', bars: 1 };
  if (speed < 10) return { level: 'fair', bars: 2 };
  if (speed < 50) return { level: 'good', bars: 3 };
  return { level: 'excellent', bars: 4 };
}

function probeHostNetwork({ url = DEFAULT_PROBE_URL, timeoutMs = 8000, maxBytes = 256 * 1024 } = {}) {
  let parsed;
  try { parsed = new URL(url); } catch (_) {
    return Promise.resolve({ ok: false, error: 'La dirección de comprobación no es válida', signal: classifySignal(0) });
  }
  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return Promise.resolve({ ok: false, error: 'La comprobación de red no está autorizada', signal: classifySignal(0) });
  }

  return new Promise((resolve) => {
    const started = Date.now();
    let firstByteAt = 0;
    let bytes = 0;
    let settled = false;
    let req;
    const finish = (ok, error = '') => {
      if (settled) return;
      settled = true;
      try { req?.destroy(); } catch (_) { /* ignore */ }
      const elapsedMs = Math.max(1, Date.now() - (firstByteAt || started));
      const speedMbps = ok && bytes > 0 ? (bytes * 8 / elapsedMs) : 0;
      resolve({
        ok: !!ok && bytes > 0,
        host: parsed.hostname,
        bytes,
        latencyMs: firstByteAt ? firstByteAt - started : null,
        speedMbps: Number(speedMbps.toFixed(2)),
        signal: classifySignal(speedMbps),
        error: error || undefined,
      });
    };
    const timer = setTimeout(() => finish(false, 'Tiempo de espera agotado'), timeoutMs);
    if (timer.unref) timer.unref();
    req = https.get(parsed, {
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'XORA/0.6',
        'Accept-Encoding': 'identity',
        Range: `bytes=0-${Math.max(1024, maxBytes) - 1}`,
      },
    }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        clearTimeout(timer);
        finish(false, `HTTP ${res.statusCode}`);
        return;
      }
      res.on('data', (chunk) => {
        if (!firstByteAt) firstByteAt = Date.now();
        bytes += chunk.length;
        if (bytes >= maxBytes) {
          clearTimeout(timer);
          finish(true);
        }
      });
      res.on('end', () => {
        clearTimeout(timer);
        finish(bytes > 0);
      });
      res.on('error', (e) => {
        clearTimeout(timer);
        finish(false, e.message);
      });
    });
    req.on('timeout', () => finish(false, 'Tiempo de espera agotado'));
    req.on('error', (e) => {
      clearTimeout(timer);
      finish(false, e.message);
    });
  });
}

module.exports = { DEFAULT_PROBE_URL, classifySignal, probeHostNetwork };
