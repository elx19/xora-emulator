'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const store = require('../src/core/store');

assert.equal(store.DEFAULT_SETTINGS.engine.locale, 'es-ES', 'el runtime debe iniciar en español');
assert.equal(store.DEFAULT_SETTINGS.runtime.compatImage, true, 'Google Play debe ser la imagen predeterminada');
assert.equal(store.getSettings().runtime.compatImage, true, 'las instalaciones existentes deben activar Google Play por defecto');

const html = fs.readFileSync(path.join(__dirname, '..', 'src/ui/index.html'), 'utf8');
assert.match(html, /<option value="es-ES">Español \(recomendado\)<\/option>/);
assert.doesNotMatch(html, /<option value="zh-(?:CN|TW)">/);

console.log('✓ idioma predeterminado del runtime y selector en español');
