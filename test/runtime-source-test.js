'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
assert.match(source, /let env = await runtime\.provisioner\.checkEnv\(\)/);
assert.match(source, /env = afterPack/);
assert.match(source, /preferGithubRuntime/);
console.log('✓ el despliegue reutiliza el runtime de GitHub y no repite descargas');
