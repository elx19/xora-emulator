'use strict';

/**
 * Estadísticas ligeras del tramo entrada → mapeo → envío de la acción.
 * No pretende medir el tiempo de renderizado del juego: ese dato depende de
 * Android y de la GPU. El identificador del dispositivo se conserva para que
 * las pruebas comparen modelos de mando reales de forma reproducible.
 */
class InputLatency {
  constructor({ maxSamples = 120 } = {}) {
    this.maxSamples = Math.max(1, Math.min(2000, Number(maxSamples) || 120));
    this.samples = [];
    this.last = null;
  }

  record({ deviceId = '', source = 'gamepad', latencyMs } = {}) {
    const value = Number(latencyMs);
    if (!Number.isFinite(value) || value < 0 || value > 60000) return false;
    const sample = {
      deviceId: String(deviceId || 'Mando compatible').slice(0, 160),
      source: String(source || 'gamepad').slice(0, 32),
      latencyMs: Math.round(value * 10) / 10,
      at: Date.now(),
    };
    this.samples.push(sample);
    if (this.samples.length > this.maxSamples) this.samples.splice(0, this.samples.length - this.maxSamples);
    this.last = sample;
    return true;
  }

  snapshot() {
    const values = this.samples.map((sample) => sample.latencyMs).sort((a, b) => a - b);
    if (!values.length) {
      return { samples: 0, deviceId: '', source: '', averageMs: null, p95Ms: null, minMs: null, maxMs: null, lastMs: null };
    }
    const percentile = (ratio) => values[Math.min(values.length - 1, Math.max(0, Math.ceil(values.length * ratio) - 1))];
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return {
      samples: values.length,
      deviceId: this.last?.deviceId || '',
      source: this.last?.source || '',
      averageMs: Math.round(average * 10) / 10,
      p95Ms: percentile(0.95),
      minMs: values[0],
      maxMs: values[values.length - 1],
      lastMs: this.last?.latencyMs ?? null,
      at: this.last?.at || 0,
    };
  }

  reset() {
    this.samples = [];
    this.last = null;
    return this.snapshot();
  }
}

module.exports = { InputLatency };
