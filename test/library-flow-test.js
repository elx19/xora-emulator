'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { mergeInstalledApp } = require('../src/ui/library-state');
const { googlePlayIcon } = require('../src/ui/system-icons');
const { normalizeInstallPath, runtimeNeedsPreparation } = require('../src/core/installer');
const { classifySignal } = require('../src/core/network');
const { listSystemApps, mergeSystemApps, isProtectedSystemApp } = require('../src/core/system-apps');

const installed = {
  package: 'com.xora.demo',
  label: 'Demo XORA',
  versionName: '1.0.0',
  installedAt: 10,
};

const first = mergeInstalledApp([], installed);
assert.deepStrictEqual(first, [installed], 'una aplicación recién instalada debe entrar en una biblioteca vacía');

const previous = { ...installed, pinned: true, lastLaunchAt: 42 };
const updated = mergeInstalledApp([previous], { ...installed, versionName: '1.1.0', installedAt: 99 });
assert.strictEqual(updated.length, 1, 'actualizar un paquete no debe duplicar la tarjeta');
assert.strictEqual(updated[0].versionName, '1.1.0', 'la tarjeta debe mostrar la versión recién instalada');
assert.strictEqual(updated[0].pinned, true, 'la actualización debe conservar preferencias de la biblioteca');
assert.strictEqual(updated[0].lastLaunchAt, 42, 'la actualización debe conservar el último inicio');

assert.strictEqual(normalizeInstallPath('  C:\\Apps\\demo.apk  '), 'C:\\Apps\\demo.apk');
assert.strictEqual(normalizeInstallPath(['C:\\Apps\\demo.apks']), 'C:\\Apps\\demo.apks');
assert.strictEqual(normalizeInstallPath({ filePath: 'C:\\Apps\\demo.xapk' }), 'C:\\Apps\\demo.xapk');
assert.throws(() => normalizeInstallPath([]), /APK|archivo|selecciona/i);
assert.throws(() => normalizeInstallPath('C:\\Apps\\demo.txt'), /APK|formato/i);

assert.strictEqual(runtimeNeedsPreparation({
  adb: { ok: true }, emulator: { ok: true }, sysimg: { ok: true },
}), false, 'un runtime completo no debe bloquear la instalación');
assert.strictEqual(runtimeNeedsPreparation({
  adb: { ok: true }, emulator: { ok: false }, sysimg: { ok: true },
}), true, 'la instalación debe preparar automáticamente un runtime incompleto');
assert.strictEqual(runtimeNeedsPreparation(null), true, 'un diagnóstico ausente debe tratarse como runtime no preparado');

const libraryHtml = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui', 'index.html'), 'utf8');
const libraryUi = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui', 'app.js'), 'utf8');
const mainProcess = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
const installerSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'core', 'installer.js'), 'utf8');
assert.match(libraryHtml, /Selecciona un APK o arrástralo aquí/i, 'la pantalla vacía debe explicar la instalación directa');
assert.match(libraryHtml, /id="dropzone"/, 'la biblioteca debe conservar una zona de arrastre');
assert.doesNotMatch(libraryHtml, /把 APK 拖进来就能装/, 'la pantalla de instalación no debe mostrar chino');
assert.match(mainProcess, /Preparando Android para instalar la aplicación/i, 'la instalación debe preparar el runtime automáticamente');
assert.match(mainProcess, /async function prepareRuntimeForInstall/, 'la instalación debe tener una ruta de preparación propia');
assert.match(mainProcess, /autoDeploy\(\{[\s\S]*?force: true/, 'la instalación debe poder preparar el runtime aunque el despliegue de fondo esté desactivado');
assert.doesNotMatch(mainProcess, /if \(e\.needsSetup\) send\('ui:navigate', 'setup'\)/, 'un APK no debe expulsar al usuario al asistente técnico');
assert.doesNotMatch(libraryUi, /正在安装 \$\{name\}/, 'la notificación de instalación no debe mostrar chino');
assert.doesNotMatch(libraryUi, /状态检查失败|发现新版本|离线缓存/, 'los estados dinámicos no deben construir mensajes en chino');

assert.strictEqual(classifySignal(0).level, 'offline', 'la red debe mostrar sin señal cuando no hay velocidad');
assert.strictEqual(classifySignal(8).level, 'fair', 'la velocidad debe convertirse en una señal legible');
assert.match(libraryHtml, /id="statusNetIcon"/, 'la barra de estado debe incluir un icono de señal');
assert.match(libraryUi, /Red del PC|Internet del PC/, 'la interfaz debe indicar la conexión del equipo');
assert.match(mainProcess, /network:status/, 'el proceso principal debe exponer el estado de red');
assert.match(mainProcess, /promptUpdateInstall/, 'una actualización disponible debe pedir confirmación');
assert.doesNotMatch(mainProcess, /正在更新中|已经是最新版本|准备下载|正在替换程序并重启/, 'los estados del actualizador no deben mostrar chino');
assert.match(libraryUi, /Actualizar ahora/, 'la actualización debe ofrecer una acción en español');
assert.match(installerSource, /waitForAdbDevice/, 'el arranque debe esperar un dispositivo ADB válido antes de abrir la app');

const playStore = listSystemApps({ playImageReady: true })[0];
assert.strictEqual(playStore.package, 'com.android.vending', 'Play Store debe usar su paquete oficial');
assert.strictEqual(playStore.label, 'Google Play Store');
assert.strictEqual(playStore.system, true, 'Play Store debe identificarse como aplicación del sistema');
assert.strictEqual(playStore.protected, true, 'Play Store incluido no debe poder desinstalarse');
assert.deepStrictEqual(listSystemApps({ playImageReady: false }), [], 'no se debe anunciar Play Store antes de preparar la imagen');
assert.strictEqual(mergeSystemApps([], { playImageReady: true })[0].package, 'com.android.vending');
assert.strictEqual(mergeSystemApps([{ package: 'com.android.vending', label: 'duplicada' }], { playImageReady: true }).length, 1);
assert.strictEqual(isProtectedSystemApp('com.android.vending'), true);
assert.strictEqual(isProtectedSystemApp('com.example.user'), false);
assert.match(googlePlayIcon(), /google-play-icon/);
assert.match(googlePlayIcon(), /#4285f4/i);

console.log('✓ biblioteca e instalación: inserción, actualización y entrada de rutas');
