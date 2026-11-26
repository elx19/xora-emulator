'use strict';

/**
 * Pruebas del puente de traducción de la interfaz.
 * No necesita Electron ni un runtime Android.
 */

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
require('../src/ui/i18n-catalog');
const { createI18n } = require('../src/ui/i18n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.error(`  ✗ ${name}\n    ${e.message}`);
  }
}

test('traduce claves principales al español', () => {
  const i18n = createI18n({ locale: 'es' });
  assert.equal(i18n.t('settings.title'), 'Configuración');
  assert.equal(i18n.t('app.installApk'), 'Instalar APK');
  assert.equal(i18n.t('welcome.back'), 'Bienvenido de nuevo');
  assert.equal(i18n.t('welcome.installedApps'), 'Aplicaciones instaladas');
});

test('mantiene los valores técnicos desconocidos', () => {
  const i18n = createI18n({ locale: 'es' });
  assert.equal(i18n.t('com.example.app'), 'com.example.app');
  assert.equal(i18n.t('Android 14'), 'Android 14');
});

test('traduce frases heredadas y valores dinámicos', () => {
  const i18n = createI18n({ locale: 'es' });
  assert.equal(i18n.translateLegacy('暂无应用'), 'No hay aplicaciones');
  assert.equal(i18n.translateLegacy('3 个应用'), '3 aplicaciones');
  assert.equal(i18n.translateLegacy('12 分钟前'), 'hace 12 min');
  assert.equal(i18n.translateLegacy('把 APK 拖进来就能装'), 'Arrastra el APK para instalarlo');
  assert.equal(i18n.translateLegacy('设置 → 诊断与修复 → 导出诊断报告'), 'Configuración → Diagnóstico y reparación → Exportar informe de diagnóstico');
  assert.equal(i18n.translateLegacy('ApkStart 产品使用手册与问题解决方案'), 'Manual de usuario del producto XORA y soluciones a problemas');
});

test('permite interpolar variables en una traducción', () => {
  const i18n = createI18n({ locale: 'es' });
  assert.equal(i18n.t('runtime.androidReady', { version: '14' }), 'Runtime listo · Android 14');
});

test('las ventanas cargan i18n antes de su lógica de interfaz', () => {
  const root = path.join(__dirname, '..', 'src', 'ui');
  for (const [html, script] of [['index.html', 'app.js'], ['splash.html', 'splash.js'], ['shell.html', 'shell.js']]) {
    const source = fs.readFileSync(path.join(root, html), 'utf8');
    const catalogAt = source.indexOf('src="i18n-catalog.js"');
    const i18nAt = source.indexOf('src="i18n.js"');
    const appAt = source.indexOf(`src="${script}"`);
    assert.ok(catalogAt >= 0, `${html} debe cargar i18n-catalog.js`);
    assert.ok(i18nAt >= 0, `${html} debe cargar i18n.js`);
    assert.ok(catalogAt < i18nAt, `${html} debe cargar el catálogo antes de i18n.js`);
    assert.ok(i18nAt < appAt, `${html} debe cargar i18n.js antes de ${script}`);
  }
  const manual = fs.readFileSync(path.join(root, 'manual.html'), 'utf8');
  assert.ok(manual.indexOf('src="i18n.js"') >= 0, 'manual.html debe cargar i18n.js');
});

test('traduce nodos de texto y atributos sin tocar identificadores técnicos', () => {
  const text = { nodeType: 3, nodeValue: ' 设置 ' };
  const input = {
    nodeType: 1,
    tagName: 'INPUT',
    childNodes: [],
    attrs: { placeholder: '搜索已安装应用', title: 'com.example.app' },
    hasAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attrs, name); },
    getAttribute(name) { return this.attrs[name]; },
    setAttribute(name, value) { this.attrs[name] = value; },
  };
  const body = {
    nodeType: 1,
    tagName: 'BODY',
    childNodes: [text, input],
    attrs: {},
    hasAttribute() { return false; },
    getAttribute() { return ''; },
    setAttribute() {},
  };
  const doc = { nodeType: 9, body, documentElement: {} };
  const i18n = createI18n({ locale: 'es', document: doc });

  i18n.apply();

  assert.equal(text.nodeValue, ' Configuración ');
  assert.equal(input.attrs.placeholder, 'Buscar aplicaciones instaladas');
  assert.equal(input.attrs.title, 'com.example.app');
  assert.equal(doc.documentElement.lang, 'es-ES');
});

test('traduce instrucciones visibles dentro de CODE y PRE del manual', () => {
  const codeText = { nodeType: 3, nodeValue: '应用就是一个窗口' };
  const code = {
    nodeType: 1,
    tagName: 'PRE',
    childNodes: [codeText],
    hasAttribute() { return false; },
    getAttribute() { return ''; },
    setAttribute() {},
  };
  const body = {
    nodeType: 1,
    tagName: 'BODY',
    childNodes: [code],
    hasAttribute() { return false; },
    getAttribute() { return ''; },
    setAttribute() {},
  };
  const doc = { nodeType: 9, body, documentElement: {} };
  createI18n({ locale: 'es', document: doc }).apply();
  assert.equal(codeText.nodeValue, 'Una aplicación es una ventana.');
});

test('no deja texto chino visible en las pantallas HTML', () => {
  const i18n = createI18n({ locale: 'es' });
  const root = path.join(__dirname, '..', 'src', 'ui');
  const untranslated = [];
  const visibleChunks = (source) => source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '')
    .split(/<[^>]+>/g)
    .map((value) => value
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean);

  for (const html of ['index.html', 'splash.html', 'shell.html', 'manual.html']) {
    const source = fs.readFileSync(path.join(root, html), 'utf8');
    for (const chunk of visibleChunks(source)) {
      const translated = i18n.translateLegacy(chunk);
      if (/[\u4e00-\u9fff]/.test(translated)) untranslated.push(`${html}: ${translated}`);
    }
  }

  assert.equal(untranslated.length, 0, `quedaron textos nativos:\n${untranslated.slice(0, 12).join('\n')}`);
});

test('cubre los mensajes estáticos de los scripts de interfaz', () => {
  const i18n = createI18n({ locale: 'es' });
  const untranslated = [];
  const decode = (raw) => raw.slice(1, -1).replace(/\\([\\'"nrt])/g, (_, ch) => ({ n: '\n', r: '\r', t: '\t' }[ch] || ch));
  const extract = (source) => {
    const values = [];
    for (const pattern of [/'(?:\\[\s\S]|[^'\\])*'/g, /"(?:\\[\s\S]|[^"\\])*"/g]) {
      for (const match of source.matchAll(pattern)) {
        const value = decode(match[0]).replace(/\s+/g, ' ').trim();
        if (value && /[\u4e00-\u9fff]/.test(value) && !value.includes('<')) values.push(value);
      }
    }
    return [...new Set(values)];
  };

  for (const js of ['app.js', 'splash.js', 'shell.js']) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui', js), 'utf8');
    for (const value of extract(source)) {
      const translated = i18n.translateLegacy(value);
      if (/[\u4e00-\u9fff]/.test(translated)) untranslated.push(`${js}: ${translated}`);
    }
  }

  assert.equal(untranslated.length, 0, `quedaron mensajes nativos:\n${untranslated.slice(0, 12).join('\n')}`);
});

test('cubre diagnóstico, notificaciones y menú de bandeja', () => {
  const i18n = createI18n({ locale: 'es' });
  const { evaluate, summarize } = require('../src/core/autodebug');
  const state = evaluate({
    runtime: { error: 'boot failed', running: true, phase: 'kernel', bootMs: 160000, locks: 2, orphans: 3, snapshotStale: true },
    device: { state: 'unauthorized', checked: true },
    storage: {
      freeMB: 1024,
      needsReset: true,
      configuredGB: 8,
      actualGB: 4,
      sharedOk: false,
      sharedPath: 'D:/ApkStartShared',
    },
    settings: { orientationMode: 'portrait', landscape: true, windowEmbed: false, autoFullscreen: true, keepSnapshot: false },
    audio: { checked: true, enabled: false, serviceRunning: false, micEnabled: false },
    network: { ok: false, reason: 'offline', sources: [{ ok: false, name: 'Gitee' }] },
    logs: { errors: ['emulator failed'] },
    accel: { checked: true, ok: false, note: 'software' },
  });
  const visible = [
    ...state.flatMap((issue) => [issue.title, issue.hint, issue.detail]),
    ...summarize(state).byCategory.flatMap((category) => [category.name, category.hint]),
    'ApkStart — 安卓应用运行器',
    'ApkStart 使用手册 · 使用手册 · 目录',
    '自动检测发现新问题：安卓设备未授权调试（设置 → 诊断与修复）',
    '关闭当前应用（Prueba）',
    'ApkStart v0.6.5 已发布，当前版本 v0.6.4。现在更新吗？',
  ];
  const untranslated = visible
    .map((item) => i18n.translateLegacy(String(item || '')))
    .filter((text) => /[\u3400-\u9fff]/.test(text));
  assert.equal(untranslated.length, 0, `quedaron textos nativos en diagnóstico/bandeja:\n${untranslated.join('\n')}`);
});

test('traduce tarjetas de controladores y avisos dinámicos', () => {
  const i18n = createI18n({ locale: 'es' });
  const driverTexts = [
    'AMD 核显 · 改用 swangle 渲染（示例）',
    'Intel 核显 · 软件渲染兜底（示例）',
    '没有硬件加速 · 直接走软件模拟（示例）',
    '本机不匹配',
    '已生效',
    '内置示例',
    '部分 AMD 核显 + 老驱动下，-gpu host 能通过 emulator 自检，但 guest 起来十几秒后进程直接崩溃（日志里只有 AEHD is operational）。把渲染后端固定成 swangle 可以绕过，代价是帧率略低。',
    '驱动已导入并启用：AMD 核显 · 改用 swangle 渲染（示例）',
  ];
  const driversDir = path.join(__dirname, '..', 'src', 'drivers');
  for (const file of fs.readdirSync(driversDir).filter((name) => name.endsWith('.json'))) {
    const driver = JSON.parse(fs.readFileSync(path.join(driversDir, file), 'utf8'));
    driverTexts.push(driver.name, driver.description, ...(driver.effect?.notes || []));
  }
  const untranslated = driverTexts
    .map((text) => i18n.translateLegacy(text))
    .filter((text) => /[\u3400-\u9fff]/.test(text));
  assert.equal(untranslated.length, 0, `quedaron textos nativos en controladores:\n${untranslated.join('\n')}`);
});

console.log(`\nResultado: ${passed} aprobadas, ${failed} fallidas`);
process.exit(failed ? 1 : 0);
