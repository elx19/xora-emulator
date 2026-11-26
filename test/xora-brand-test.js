'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const pkg = JSON.parse(read('package.json'));
assert.strictEqual(pkg.name, 'xora-emulator', 'package.json debe usar el identificador nuevo de XORA');
assert.strictEqual(pkg.author, 'XORA Project', 'package.json no debe conservar el autor anterior');
assert.strictEqual(pkg.productName, 'XORA', 'package.json debe identificar el producto como XORA');

const builder = read('electron-builder.yml');
assert.match(builder, /^appId:\s*com\.xora\.emulator\s*$/m, 'electron-builder debe usar el identificador de XORA');
assert.match(builder, /^productName:\s*XORA\s*$/m, 'electron-builder debe usar XORA');
assert.match(builder, /icon:\s*src\/ui\/assets\/xora-icon\.png/, 'el instalador debe usar el icono oficial');

for (const page of ['src/ui/index.html', 'src/ui/shell.html', 'src/ui/splash.html']) {
  const html = read(page);
  assert.match(html, /<title>XORA<\/title>/, `${page} debe mostrar XORA en el título`);
}

const home = read('src/ui/index.html');
assert.match(home, /class="brand-name">XORA<\/span>/, 'la pantalla principal debe mostrar XORA');
assert.match(home, /assets\/xora-icon\.png/, 'la pantalla principal debe cargar el icono oficial');

for (const file of ['src/core/updater.js', 'src/core/provision.js', 'src/core/sources.js', 'src/main.js']) {
  const source = read(file);
  assert.doesNotMatch(source, /github\.com\/RoutineMiku\/apkstart|api\.github\.com\/repos\/RoutineMiku\/apkstart/, `${file} no debe consultar el repositorio anterior`);
}
assert.match(read('src/core/updater.js'), /const OWNER = 'elx19';/);
assert.match(read('src/core/updater.js'), /const REPO = 'xora-emulator';/);
assert.match(read('src/core/sources.js'), /const OWNER_GH = 'elx19';/);
assert.doesNotMatch(read('src/core/sources.js'), /daily-miku\/apkstart|RoutineMiku\/apkstart/);
const releaseWorkflow = read('.github/workflows/release.yml');
assert.match(releaseWorkflow, /XORA_UPDATE_PRIVATE_KEY/,
  'el workflow de Release debe usar el secreto de firma de XORA');
assert.match(releaseWorkflow, /build\/sign-update-manifest\.js/,
  'el workflow debe generar el manifiesto firmado');
assert.match(read('src/main.js'), /const APP_AUMID = 'XORA';/);

const icon = fs.readFileSync(path.join(root, 'src/ui/assets/xora-icon.png'));
assert.strictEqual(icon.toString('ascii', 1, 4), 'PNG', 'el icono oficial debe ser un PNG válido');

console.log('✓ identidad XORA y asset oficial verificados');
