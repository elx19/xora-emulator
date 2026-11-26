'use strict';

const assert = require('assert');
const {
  BUILTIN_PROFILES,
  listProfiles,
  recommendProfile,
  profilePatch,
  validateProfile,
  parseProfileJson,
} = require('../src/core/profiles');

assert.strictEqual(BUILTIN_PROFILES.length, 6, 'el catálogo inicial debe tener seis perfiles');
assert.deepStrictEqual(
  listProfiles({ custom: [] }).map((profile) => profile.id),
  ['basic-pc', 'laptop', 'high-end-pc', 'preset-phone', 'gaming-phone', 'tablet'],
  'los perfiles integrados deben conservar un orden estable',
);

assert.strictEqual(
  recommendProfile({ totalMB: 4096, cores: 4 }).id,
  'basic-pc',
  'un equipo modesto debe recibir el perfil PC básica',
);
assert.strictEqual(
  recommendProfile({ totalMB: 32768, cores: 16 }).id,
  'high-end-pc',
  'un equipo potente debe recibir el perfil PC de alto rendimiento',
);

const laptop = BUILTIN_PROFILES.find((profile) => profile.id === 'laptop');
const patch = profilePatch(laptop);
assert.deepStrictEqual(
  patch.engine,
  {
    resourceMode: 'balanced',
    memoryMB: 4096,
    cores: 4,
    autoMemory: false,
    renderSize: '1920x1080',
    fpsTarget: 60,
  },
  'aplicar un perfil debe producir un parche de runtime explícito',
);
assert.deepStrictEqual(
  patch.display,
  { landscape: true, density: 240 },
  'el perfil también debe definir orientación y densidad',
);

assert.strictEqual(validateProfile(laptop).ok, true, 'un perfil integrado debe ser válido');
assert.strictEqual(validateProfile({ id: 'bad', name: 'Sin memoria' }).ok, false, 'un perfil incompleto debe rechazarse');
assert.strictEqual(parseProfileJson(JSON.stringify(laptop)).id, 'laptop', 'el JSON válido debe poder importarse');
assert.throws(() => parseProfileJson('{"id":"../../escape"}'), /inválido|inválida/i, 'el JSON no debe aceptar perfiles inseguros');

console.log('✓ perfiles: catálogo, recomendación, validación y aplicación');
