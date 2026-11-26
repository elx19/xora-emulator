'use strict';

const { verifyReleaseArtifact } = require('../src/core/release-artifact');

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : '';
}

try {
  const result = verifyReleaseArtifact({
    manifestPath: arg('--manifest'),
    artifactPath: arg('--asset'),
    platform: arg('--platform') || undefined,
    channel: arg('--channel') || 'stable',
    version: arg('--version') || undefined,
  });
  console.log(JSON.stringify(result));
} catch (error) {
  console.error(`Verificación de Release fallida: ${error.message}`);
  process.exit(1);
}
