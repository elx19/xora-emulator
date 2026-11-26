'use strict';

/**
 * Verificación offline de una Release antes de publicarla o instalarla.
 * Mantiene la misma frontera de seguridad que usa el actualizador: el
 * manifiesto firmado define el paquete permitido y su SHA-512 es la última
 * comprobación antes de aceptar el archivo.
 */
const fs = require('fs');
const path = require('path');
const updateManifest = require('./update-manifest');

function verifyReleaseArtifact({
  manifestPath,
  artifactPath,
  platform,
  channel = 'stable',
  publicKey = updateManifest.XORA_UPDATE_PUBLIC_KEY,
  version,
} = {}) {
  if (!manifestPath || !artifactPath) throw new Error('Faltan las rutas del manifiesto o del artefacto');
  const manifest = JSON.parse(fs.readFileSync(path.resolve(manifestPath), 'utf8'));
  const verified = updateManifest.verifyManifest(manifest, { platform, channel, publicKey });
  const actualName = path.basename(path.resolve(artifactPath));
  if (actualName !== verified.asset) {
    throw new Error(`El nombre del artefacto no coincide: se esperaba ${verified.asset}, se recibió ${actualName}`);
  }
  if (version && verified.version !== version) {
    throw new Error(`La versión del manifiesto no coincide: se esperaba ${version}, se recibió ${verified.version}`);
  }
  const hash = updateManifest.verifyAssetFile(path.resolve(artifactPath), verified);
  return {
    ok: true,
    version: verified.version,
    asset: verified.asset,
    platform: verified.platform,
    channel: verified.channel,
    sha512: hash.sha512,
  };
}

module.exports = { verifyReleaseArtifact };
