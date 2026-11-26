'use strict';
/**
 * 设置页 UI 冒烟测试（需要真实 Electron 窗口）
 *
 * 运行：electron test/settings-ui-test.js
 * 输出：test/out/settings-*.png
 *
 * 为什么单独写：设置页的结构刚大改过（加了分类导航与搜索），
 * 纯 Node 单测只能校验源码结构，校验不了「点得动、显示得对」。
 * 这里用真实渲染进程跑一遍：打开设置 → 切分类 → 搜索 → 截图。
 */

const { app, ipcMain, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'out');
const UI = path.join(__dirname, '..', 'src', 'ui');

const SETTINGS = {
  identityVersion: 2,
  adbPath: '',
  runtime: { isoPath: '', sourcePreference: 'github', autoMirror: true, giteeToken: '', mirrorPrefix: '', downloadConnections: 8 },
  engine: {
    memoryMB: 4096, cores: 4, idleShutdownMinutes: 15, audio: true, liteMode: true,
    prewarm: false, priorityMode: 'balanced', deepTrim: false, mouseRightBack: true,
    mouseWheelMode: 'smooth', mouseSideButtons: false, keymapEnabled: true,
    resourceMode: 'balanced', renderSize: 'auto', dataPartitionGB: 6, fastDns: true,
    gpuMode: 'auto', fpsTarget: 60, autoMemory: true,
    controlProfile: 'fps', mouseDpi: 800, mouseSensitivity: 50, cursorLock: true,
    locale: 'es-ES', chineseIme: true, keepSnapshot: true, logLimitKB: 2048,
  },
  display: {
    mode: 'window', portrait: '900x1600', autoFullscreenOnLaunch: false, landscape: false,
    orientationMode: 'auto', autoRotate: true, tabletMode: true, windowEmbed: true,
  },
  createShortcutOnInstall: true,
  createStartMenuShortcut: true,
  shortcutDir: '',
  sharedDir: path.join(process.env.USERPROFILE || '', 'XORAShared'),
  deviceSharedDir: '/sdcard/XORAShared',
  autoStart: true,
  notifyOnInstall: true,
  debug: { auto: true, intervalMin: 10, notify: true },
};

let libraryApps = [];
const PROFILE_LIST = [
  { id: 'basic-pc', name: 'PC básica', description: 'Para equipos modestos.', icon: 'desktop', memoryMB: 2048, cores: 2, resolution: '1280 × 720 (HD)', fps: 30 },
  { id: 'laptop', name: 'Portátil', description: 'Equilibrio ideal.', icon: 'laptop', memoryMB: 4096, cores: 4, resolution: '1920 × 1080 (Full HD)', fps: 60 },
  { id: 'high-end-pc', name: 'PC de alto rendimiento', description: 'Mayor calidad gráfica.', icon: 'tower', memoryMB: 8192, cores: 6, resolution: '2560 × 1440 (QHD)', fps: 120 },
];

const DEBUG_ISSUES = [
  { code: 'device.unauthorized', category: 'device', severity: 'error', title: '安卓设备未授权调试', hint: '重启运行时后会重新弹出确认框。', fix: 'restartRuntime', detail: '' },
  { code: 'storage.diskLow', category: 'storage', severity: 'warn', title: '运行时所在磁盘空间偏紧', hint: '剩余不足 8 GB。', fix: 'disk', detail: '剩余 5120 MB' },
  { code: 'settings.orientationConflict', category: 'settings', severity: 'warn', title: '屏幕方向策略与当前面板方向相反', hint: '把面板方向改成与策略一致即可。', fix: 'orientation', detail: '' },
];

const OVERRIDES = {
  'settings:get': () => SETTINGS,
  'settings:set': () => SETTINGS,
  'app:info': () => ({ version: '0.6.0', isDev: true, dataDir: 'C:\\data', runtimeDir: 'C:\\data\\runtime' }),
  'apps:list': () => libraryApps,
  'profiles:list': () => ({ profiles: PROFILE_LIST, active: 'laptop', recommended: 'laptop' }),
  'profiles:recommend': () => PROFILE_LIST[1],
  'profiles:apply': (id) => ({ ok: true, profile: PROFILE_LIST.find((profile) => profile.id === id), settings: SETTINGS }),
  'addons:list': () => ([
    { id: 'google-play-store', name: 'Google Play Store', description: 'Incluido en la imagen oficial.', state: 'installed', source: 'runtime-image', actions: [] },
    { id: 'google-play-games', name: 'Google Play Juegos', description: 'Funciones de juegos.', state: 'not_installed', actions: ['install'] },
    { id: 'google-play-services', name: 'Servicios de Google', description: 'Incluido en la imagen oficial.', state: 'installed', source: 'runtime-image', actions: [] },
  ]),
  'metrics:get': () => null,
  'metrics:start': () => ({ ok: true, sample: null }),
  'assoc:status': () => ({ registered: false }),
  'doctor:profile': () => ({ profile: {}, text: 'Equilibrado · 4 núcleos / 4 GB / 720p' }),
  'doctor:selfCheck': () => ({ issues: [], accel: { ok: true }, free: 102400 }),
  'doctor:report': () => ({ ok: true, file: 'C:\\report.txt' }),
  'runtime:usage': () => ({ totalText: '8.2 GB', reclaimableText: '1.1 GB', count: 3 }),
  'runtime:status': () => ({ mode: 'builtin', backend: 'builtin', backendLabel: 'Imagen oficial', installed: true, vmRunning: false, deviceOnline: false, ready: false, phase: 'idle', needsSetup: null, error: '', env: { adb: { ok: true }, emulator: { ok: true }, sysimg: { ok: true } }, accel: { ok: true }, network: null }),
  'network:status': () => ({ ok: true, host: 'test', speedMbps: 120, latencyMs: 20, signal: { level: 'excellent', bars: 4 } }),
  'runtime:dataInfo': () => ({ avdDir: 'C:\\data\\avd', configuredGB: 6, actualGB: 6 }),
  'android:status': () => ({ running: false, wifi: true, airplane: false, anim: true, volume: 50, font: 1, density: 320 }),
  'drivers:list': () => ({ drivers: [], errors: [] }),
  'preflight:run': () => ({
    ok: true,
    edition: 'installer',
    report: {
      items: [
        {
          level: 'warn',
          title: 'CPU 虚拟化在 BIOS 开启',
          detail: '这段来自旧版本的诊断输出不应直接显示给用户。',
          action: { kind: 'manual', label: '请手动处理' },
        },
        {
          level: 'bad',
          title: '虚拟机监控程序平台没有启用',
          detail: '请打开 Windows 功能。',
          action: { kind: 'elevate', id: 'virtualization', label: '一键开启（需管理员）' },
        },
      ],
      summary: '发现 2 个问题',
      recommended: { memoryMB: 4096, cores: 2, renderSize: 'auto', gpuMode: 'auto' },
    },
  }),
  'autodebug:state': () => ({ issues: DEBUG_ISSUES, summary: { total: 3, errors: 1, warns: 2, infos: 0, health: 'error', byCategory: [] }, at: Date.now(), running: false }),
  'autodebug:run': () => ({ issues: DEBUG_ISSUES, summary: { total: 3, errors: 1, warns: 2, infos: 0, health: 'error', byCategory: [] }, at: Date.now(), running: false }),
  'autodebug:config': () => SETTINGS.debug,
  'app:startupInfo': () => ({ firstRun: false, smoke: true, tips: [] }),
  'app:updateCheck': () => ({ ok: true, current: '0.6.0', hasUpdate: false, sources: [] }),
  'runtime:log': () => [],
  'leftovers:scan': () => ({ items: [] }),
  'engine:resources': () => ({ memory: {}, cores: {} }),
  'display:state': () => ({ mode: 'window' }),
  'keymap:getPresets': () => ({ presets: [] }),
  'keymap:isEnabled': () => ({ enabled: true }),
  'keymap:latency': () => ({ samples: 0 }),
  'keymap:latencyReset': () => ({ samples: 0 }),
};

// 其余通道统一返回空对象：app.js 里所有调用都有 .catch / 空值兜底
const CHANNELS = [
  'apk:pick', 'apk:parse', 'apk:install', 'apk:reveal', 'dialog:openDir',
  'settings:restoreSystem', 'settings:refreshPointer', 'settings:unhook', 'settings:setSharedDir',
  'runtime:probe', 'runtime:start', 'runtime:stop', 'runtime:vcRedist', 'runtime:installVcRedist',
  'runtime:cleanup', 'runtime:resetData', 'runtime:repairNetwork', 'runtime:checkNetwork',
  'runtime:setDataSize', 'runtime:resetAndResize', 'runtime:autoDeploy', 'runtime:startInstaller',
  'runtime:markInstalled', 'runtime:resetInstall', 'app:confirm', 'display:set', 'display:toggle',
  'shortcut:rebuild', 'preflight:apply', 'drivers:import', 'drivers:openFolder',
  'drivers:exportTemplate', 'drivers:setEnabled', 'app:clearLocks', 'app:removeSelf',
  'app:clearOrphans', 'app:clearSnapshot', 'runtime:restart', 'assoc:register', 'assoc:unregister',
  'share:sync', 'share:open', 'shell:open', 'window:minimize', 'window:maximize', 'window:close',
  'window:hide', 'app:foreground', 'app:updateApply', 'app:updateCancel', 'app:updateOpen',
  'app:restart', 'app:pin', 'app:setOrientation', 'app:launch', 'app:stop', 'app:uninstall',
  'app:createShortcut', 'app:clearData', 'app:revealApk', 'android:set', 'android:open',
  'android:tune', 'android:permissions', 'android:grantAll', 'keymap:getMap', 'keymap:setMap',
  'keymap:setEnabled', 'keymap:applyPreset', 'leftovers:clean', 'provision:check',
  'provision:probeSources', 'provision:installAdb', 'provision:installQemu', 'provision:installEmulator',
  'provision:installSysimg', 'provision:installPlayImage', 'provision:installAehd',
  'provision:enableAccel', 'provision:enableVirtualization', 'provision:openWindowsFeatures',
  'provision:downloadIso', 'provision:createDisk', 'provision:importIso', 'provision:importDisk',
  'gpu:status', 'gpu:apply',
  'profiles:save', 'profiles:delete', 'profiles:import', 'profiles:export',
  'addons:install', 'addons:repair', 'addons:uninstall', 'metrics:stop',
];

let passed = 0;
let failed = 0;
function step(name, ok, detail = '') {
  if (ok) { passed++; console.log(`  ✓ ${name}${detail ? ` ${detail}` : ''}`); } else { failed++; console.error(`  ✗ ${name}${detail ? ` ${detail}` : ''}`); }
}

app.whenReady().then(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  for (const ch of CHANNELS) ipcMain.handle(ch, async () => ({}));
  for (const [ch, fn] of Object.entries(OVERRIDES)) ipcMain.handle(ch, async (_e, ...args) => fn(...args));

  const win = new BrowserWindow({
    width: 1180, height: 860, show: false,
    backgroundColor: '#f4f7f5',
    webPreferences: {
      preload: path.join(__dirname, '..', 'src', 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: false,
    },
  });
  const errors = [];
  win.webContents.on('console-message', (_e, level, message) => {
    if (level >= 2) errors.push(message);   // 2=warning, 3=error
  });
  await win.loadFile(path.join(UI, 'index.html'));
  await new Promise((r) => setTimeout(r, 1200));

  const evalJs = (code) => win.webContents.executeJavaScript(code, true);
  const waitFor = async (code, timeout = 5000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await evalJs(code)) return true;
      await new Promise((r) => setTimeout(r, 50));
    }
    return false;
  };

  const initialLocaleAudit = await evalJs(`(() => {
    const text = document.body?.innerText || '';
    const match = text.match(/[\\u3400-\\u9fff]/g) || [];
    return { count: match.length, sample: text.split('\\n').filter((line) => /[\\u3400-\\u9fff]/.test(line)).slice(0, 4) };
  })()`);
  step('la interfaz visible inicial no conserva texto chino', initialLocaleAudit.count === 0,
    initialLocaleAudit.sample.join(' | '));

  console.log('\n[ Biblioteca · instalación directa ]');
  const layout = await evalJs(`(() => ({
    nav: document.querySelectorAll('.side-nav').length,
    active: document.querySelector('.side-nav.on')?.dataset.nav || '',
    title: document.getElementById('libraryTitle')?.textContent || '',
    direct: document.getElementById('welcomeMask')?.hidden === true,
    controls: ['winMinimize', 'winMaximize', 'winClose'].every((id) => !!document.getElementById(id)),
  }))()`);
  step('la pantalla inicial entra directamente en Biblioteca', layout.active === 'library' && layout.direct, `${layout.active} / direct=${layout.direct}`);
  step('la navegación aprobada está disponible', layout.nav === 9, `${layout.nav} elementos`);
  step('la ventana conserva sus controles propios', layout.controls);
  const demoApp = {
    package: 'com.xora.demo', label: 'Demo XORA', versionName: '1.0.0', versionCode: 1,
    installedAt: Date.now(), iconPath: null, pinned: false, running: false,
  };
  libraryApps = [demoApp];
  win.webContents.send('install:done', { ok: true, app: demoApp });
  await new Promise((r) => setTimeout(r, 350));
  const library = await evalJs(`(() => ({
    count: document.getElementById('libraryCount')?.textContent || '',
    card: !!document.querySelector('[data-pkg="com.xora.demo"]'),
    highlighted: !!document.querySelector('[data-pkg="com.xora.demo"].just-installed'),
    badge: (document.querySelector('[data-pkg="com.xora.demo"] .badge-new') || {}).textContent || '',
    live: document.getElementById('libraryLive')?.textContent || '',
  }))()`);
  step('una instalación completada entra directamente a la biblioteca', library.card);
  step('la biblioteca actualiza el contador', /1/.test(library.count), library.count);
  step('la aplicación recién instalada queda resaltada', library.highlighted && /Recién instalada/i.test(library.badge), library.badge);
  step('la biblioteca anuncia la nueva aplicación', /Demo XORA/.test(library.live), library.live);
  await evalJs('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  await win.webContents.capturePage().then((img) => fs.writeFileSync(path.join(OUT, 'library-installed.png'), img.toPNG()));

  console.log('\n[ Perfiles de dispositivo ]');
  await evalJs(`document.querySelector('[data-nav="profiles"]')?.click()`);
  await new Promise((r) => setTimeout(r, 180));
  const profileView = await evalJs(`(() => ({
    visible: !document.getElementById('profilesShell')?.hidden,
    active: document.querySelector('.side-nav.on')?.dataset.nav || '',
    cards: document.querySelectorAll('#profileGrid [data-profile-id]').length,
    title: document.getElementById('profilesTitle')?.textContent || '',
    selected: document.querySelector('#profileGrid .profile-card.selected')?.dataset.profileId || '',
    applyDisabled: !!document.getElementById('btnApplyProfile')?.disabled,
  }))()`);
  step('el módulo de perfiles se abre desde la navegación', profileView.visible && profileView.active === 'profiles', `${profileView.active} / visible=${profileView.visible}`);
  step('el catálogo de perfiles se renderiza', profileView.cards === PROFILE_LIST.length, `${profileView.cards} tarjetas`);
  step('el perfil recomendado queda seleccionado', profileView.selected === 'laptop' && !profileView.applyDisabled, profileView.selected);
  await evalJs(`document.querySelector('[data-profile-id="high-end-pc"]')?.click()`);
  const selectedProfile = await evalJs(`document.querySelector('#profileGrid .profile-card.selected')?.dataset.profileId || ''`);
  step('se puede seleccionar otro perfil', selectedProfile === 'high-end-pc', selectedProfile);
  await evalJs('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  await win.webContents.capturePage().then((img) => fs.writeFileSync(path.join(OUT, 'profiles.png'), img.toPNG()));

  console.log('\n[ Rendimiento y consumo ]');
  await evalJs(`document.querySelector('[data-nav="performance"]')?.click()`);
  await new Promise((r) => setTimeout(r, 600));
  const performanceView = await evalJs(`(() => ({
    visible: !document.getElementById('performanceShell')?.hidden,
    active: document.querySelector('.side-nav.on')?.dataset.nav || '',
    modes: document.querySelectorAll('#performanceModes [data-performance-mode]').length,
    selected: document.querySelector('#performanceModes .performance-mode.selected')?.dataset.performanceMode || '',
    metrics: document.querySelectorAll('#performanceMetrics .metric-row').length,
    options: document.querySelectorAll('#optimizationList input').length,
    hardware: !!document.getElementById('perfHardware')?.checked,
    suspend: !!document.getElementById('perfSuspend')?.checked,
    auto: !!document.getElementById('perfAuto')?.checked,
    brand: document.querySelector('.sidebar-brand strong')?.textContent || '',
    brandDisplay: document.querySelector('.sidebar-brand strong') ? getComputedStyle(document.querySelector('.sidebar-brand strong')).display : '',
    brandColor: document.querySelector('.sidebar-brand strong') ? getComputedStyle(document.querySelector('.sidebar-brand strong')).color : '',
  }))()`);
  step('el módulo de rendimiento se abre desde la navegación', performanceView.visible && performanceView.active === 'performance', `${performanceView.active} / visible=${performanceView.visible}`);
  step('los tres modos de consumo se renderizan', performanceView.modes === 3, `${performanceView.modes} modos`);
  step('el modo guardado queda seleccionado', performanceView.selected === 'balanced', performanceView.selected);
  step('las métricas y opciones están disponibles', performanceView.metrics === 4 && performanceView.options === 4, `${performanceView.metrics} métricas / ${performanceView.options} opciones`);
  step('las opciones reflejan la configuración guardada', performanceView.hardware && performanceView.suspend && performanceView.auto, `hardware=${performanceView.hardware} / suspend=${performanceView.suspend} / auto=${performanceView.auto}`);
  step('la marca XORA se mantiene visible en los módulos', performanceView.brand === 'XORA' && performanceView.brandDisplay !== 'none', `${performanceView.brand} / ${performanceView.brandDisplay} / ${performanceView.brandColor}`);
  await evalJs('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  await win.webContents.capturePage().then((img) => fs.writeFileSync(path.join(OUT, 'performance.png'), img.toPNG()));

  console.log('\n[ Controles de juego ]');
  await evalJs(`document.querySelector('[data-nav="controls"]')?.click()`);
  await new Promise((r) => setTimeout(r, 180));
  const controlsView = await evalJs(`(() => ({
    visible: !document.getElementById('controlsShell')?.hidden,
    active: document.querySelector('.side-nav.on')?.dataset.nav || '',
    bindings: document.querySelectorAll('.quick-binding').length,
    profiles: document.querySelectorAll('#controlProfileGrid [data-control-profile]').length,
    dpi: document.getElementById('controlDpi')?.value || '',
    sensitivity: document.getElementById('controlSensitivity')?.value || '',
    keymap: !!document.getElementById('controlKeymap')?.checked,
    latency: !!document.getElementById('controlLatencyValue'),
  }))()`);
  step('el módulo de controles se abre desde la navegación', controlsView.visible && controlsView.active === 'controls', `${controlsView.active} / visible=${controlsView.visible}`);
  step('las asignaciones rápidas están disponibles', controlsView.bindings === 4, `${controlsView.bindings} asignaciones`);
  step('los perfiles de control y el DPI se cargan', controlsView.profiles === 3 && controlsView.dpi === '800' && controlsView.sensitivity === '50' && controlsView.keymap, `${controlsView.profiles} perfiles / ${controlsView.dpi} DPI / ${controlsView.sensitivity} %`);
  step('el panel de latencia de entrada está disponible', controlsView.latency, `latency=${controlsView.latency}`);
  await evalJs('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  await win.webContents.capturePage().then((img) => fs.writeFileSync(path.join(OUT, 'controls.png'), img.toPNG()));

  console.log('\n[ Complementos opcionales ]');
  await evalJs(`document.querySelector('[data-nav="addons"]')?.click()`);
  await new Promise((r) => setTimeout(r, 180));
  const addonsView = await evalJs(`(() => ({
    visible: !document.getElementById('addonsShell')?.hidden,
    active: document.querySelector('.side-nav.on')?.dataset.nav || '',
    cards: document.querySelectorAll('#addonsGrid [data-addon-id]').length,
    installButtons: document.querySelectorAll('#addonsGrid [data-addon-action="install"]').length,
    notice: document.querySelector('.addons-notice')?.textContent || '',
  }))()`);
  step('el módulo de complementos se abre desde la navegación', addonsView.visible && addonsView.active === 'addons', `${addonsView.active} / visible=${addonsView.visible}`);
  step('el catálogo muestra los complementos disponibles', addonsView.cards === 3 && addonsView.installButtons === 1, `${addonsView.cards} tarjetas / ${addonsView.installButtons} acciones`);
  step('el módulo informa que Google Play viene incluido por defecto', /incluido por defecto|imagen oficial/i.test(addonsView.notice), addonsView.notice);
  await evalJs('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  await win.webContents.capturePage().then((img) => fs.writeFileSync(path.join(OUT, 'addons.png'), img.toPNG()));

  console.log('\n[设置页 · 分类导航]');
  // 先打开设置弹窗（自动检测结果是在打开设置时取回来渲染的）
  await evalJs(`document.getElementById('btnSettings').click()`);
  await waitFor(`document.getElementById('settingsMask')?.classList.contains('on')`);
  const modalOpen = await evalJs(`document.getElementById('settingsMask').classList.contains('on')`);
  step('设置弹窗能打开', modalOpen);

  await waitFor(`(() => {
    const visible = Array.from(document.querySelectorAll('#settingsBody [data-cat]'))
      .filter((group) => !group.hidden).map((group) => group.dataset.cat);
    return visible.length > 0 && visible.every((cat) => cat === visible[0]);
  })()`);

  const navInfo = await evalJs(`(() => ({
    items: document.querySelectorAll('#setNav .set-nav-item').length,
    cats: Array.from(document.querySelectorAll('#setNav .set-nav-item')).map(b => b.dataset.cat),
    groups: document.querySelectorAll('#settingsBody [data-cat]').length,
    visible: Array.from(document.querySelectorAll('#settingsBody [data-cat]')).filter(g => !g.hidden).map(g => g.dataset.cat),
  }))()`);
  step('导航项渲染出来了', navInfo.items === 9, `${navInfo.items} 项`);
  step('有实验室分类', navInfo.cats.indexOf('lab') >= 0, navInfo.cats.join(','));
  // 注意：分类会被记住（localStorage），所以这里只断言「同一时刻只显示一个分类的分组」
  const oneCat = navInfo.visible.length > 0 && navInfo.visible.every((c) => c === navInfo.visible[0]);
  step('同一时刻只显示一个分类的分组', oneCat, `默认可见：${navInfo.visible.join(',')}`);

  // 点「显示与窗口」
  await evalJs(`document.querySelector('#setNav .set-nav-item[data-cat="display"]').click()`);
  await new Promise((r) => setTimeout(r, 300));
  const afterSwitch = await evalJs(`(() => ({
    visible: Array.from(document.querySelectorAll('#settingsBody [data-cat]')).filter(g => !g.hidden).map(g => g.dataset.cat),
    on: document.querySelector('#setNav .set-nav-item.on') ? document.querySelector('#setNav .set-nav-item.on').dataset.cat : '',
  }))()`);
  step('切到「显示与窗口」后只显示该分类', afterSwitch.visible.length > 0 && afterSwitch.visible.every((c) => c === 'display'), `可见：${afterSwitch.visible.join(',')}`);
  step('导航高亮跟着切换', afterSwitch.on === 'display', `高亮：${afterSwitch.on}`);

  await win.capturePage().then((img) => fs.writeFileSync(path.join(OUT, 'settings-display.png'), img.toPNG()));

  // 点「性能与资源」，看麦克风与显卡偏好
  await evalJs(`document.querySelector('#setNav .set-nav-item[data-cat="perf"]').click()`);
  await new Promise((r) => setTimeout(r, 300));
  const perf = await evalJs(`(() => {
    const mic = document.getElementById('setMicrophone');
    const gpu = document.getElementById('setGpuPreference');
    return {
      hasMic: !!mic,
      micChecked: mic ? mic.checked : false,
      hasGpu: !!gpu,
      gpuOptions: gpu ? Array.from(gpu.options).map(o => o.value) : [],
      gpuValue: gpu ? gpu.value : '',
    };
  })()`);
  step('性能页有麦克风开关且默认开启', perf.hasMic && perf.micChecked, `mic=${perf.hasMic} checked=${perf.micChecked}`);
  step('性能页有显卡偏好下拉（自动/独显/核显）', perf.hasGpu && ['auto', 'discrete', 'integrated'].every((v) => perf.gpuOptions.includes(v)), perf.gpuOptions.join(','));

  // 点「实验室」，看多开开关
  await evalJs(`document.querySelector('#setNav .set-nav-item[data-cat="lab"]').click()`);
  await new Promise((r) => setTimeout(r, 300));
  const lab = await evalJs(`(() => ({
    visible: Array.from(document.querySelectorAll('#settingsBody [data-cat]')).filter(g => !g.hidden).map(g => g.dataset.cat),
    hasSwitch: !!document.getElementById('setMultiWindow'),
    hasKeep: !!document.getElementById('setKeepBackground'),
    notice: (document.querySelector('#labGroup .lab-notice') || {}).textContent || '',
  }))()`);
  step('切到「实验室」只显示该分类', lab.visible.length > 0 && lab.visible.every((c) => c === 'lab'), `可见：${lab.visible.join(',')}`);
  step('实验室有多开开关与后台保留数', lab.hasSwitch && lab.hasKeep, `switch=${lab.hasSwitch} keep=${lab.hasKeep}`);
  step('实验室有实验性提示', /funcionalidad|experimental/i.test(lab.notice), lab.notice.slice(0, 30));

  // 点「诊断与修复」，看自动检测面板
  await evalJs(`document.querySelector('#setNav .set-nav-item[data-cat="diag"]').click()`);
  await new Promise((r) => setTimeout(r, 400));
  const diag = await evalJs(`(() => ({
    visible: Array.from(document.querySelectorAll('#settingsBody [data-cat]')).filter(g => !g.hidden).map(g => g.dataset.cat),
    items: document.querySelectorAll('#autodebugList .dbg-item').length,
    groups: document.querySelectorAll('#autodebugList .dbg-group').length,
    text: (document.getElementById('autodebugStateText') || {}).textContent || '',
    fixBtns: document.querySelectorAll('#autodebugList .dbg-fix').length,
  }))()`);
  step('「诊断与修复」下能看到本机体检、驱动与自动检测', diag.visible.includes('diag') && diag.visible.length === 3, `可见：${diag.visible.join(',')}`);
  step('自动检测结果按分类分组渲染', diag.groups >= 3 && diag.items === 3, `${diag.groups} 组 / ${diag.items} 项`);
  step('每条问题都有「处理」按钮', diag.fixBtns === 3, `${diag.fixBtns} 个按钮`);
  step('状态行显示上次检测时间', /Última detección/.test(diag.text), diag.text);

  await evalJs(`document.getElementById('btnPreflight')?.click()`);
  await waitFor(`document.querySelectorAll('#preflightList .pf-item').length === 2`);
  const preflightLocaleAudit = await evalJs(`(() => {
    const root = document.getElementById('preflightGroup');
    const text = root?.innerText || '';
    return {
      count: (text.match(/[\\u3400-\\u9fff]/g) || []).length,
      items: document.querySelectorAll('#preflightList .pf-item').length,
      summary: document.getElementById('preflightSummary')?.textContent || '',
    };
  })()`);
  step('el diagnóstico del hardware no conserva texto chino', preflightLocaleAudit.count === 0,
    JSON.stringify(preflightLocaleAudit));
  const settingsLocaleAudit = await evalJs(`(() => {
    const text = document.getElementById('settingsBody')?.innerText || '';
    const lines = text.split('\\n').filter((line) => /[\\u3400-\\u9fff]/.test(line));
    return { count: lines.length, sample: lines.slice(0, 5) };
  })()`);
  step('la configuración visible no conserva texto chino', settingsLocaleAudit.count === 0,
    settingsLocaleAudit.sample.join(' | '));

  const categoryLocaleAudit = [];
  for (const cat of ['basic', 'display', 'input', 'perf', 'net', 'diag', 'files', 'about', 'lab']) {
    await evalJs(`document.querySelector('#setNav .set-nav-item[data-cat="${cat}"]')?.click()`);
    await new Promise((r) => setTimeout(r, 120));
    categoryLocaleAudit.push(await evalJs(`(() => {
      const group = document.querySelector('#settingsBody [data-cat="${cat}"]');
      const text = group?.innerText || '';
      return { cat: '${cat}', count: (text.match(/[\\u3400-\\u9fff]/g) || []).length,
        sample: text.split('\\n').filter((line) => /[\\u3400-\\u9fff]/.test(line)).slice(0, 6) };
    })()`));
  }
  step('todas las categorías de configuración quedan traducidas',
    categoryLocaleAudit.every((item) => item.count === 0), JSON.stringify(categoryLocaleAudit));
  await evalJs(`document.querySelector('#setNav .set-nav-item[data-cat="diag"]')?.click()`);
  await new Promise((r) => setTimeout(r, 120));

  // 滚到自动检测面板再截图（等合成器跟上，避免拍到上一帧）
  await evalJs(`document.getElementById('autodebugGroup').scrollIntoView({ block: 'start' })`);
  win.webContents.invalidate();
  await new Promise((r) => setTimeout(r, 900));
  await win.webContents.capturePage().then((img) => fs.writeFileSync(path.join(OUT, 'settings-diag.png'), img.toPNG()));

  console.log('\n[设置页 · 搜索]');
  await evalJs(`(() => { const s = document.getElementById('setSearch'); s.value = 'horizontal'; s.dispatchEvent(new Event('input')); })()`);
  await new Promise((r) => setTimeout(r, 300));
  const search = await evalJs(`(() => ({
    visible: Array.from(document.querySelectorAll('#settingsBody [data-cat]')).filter(g => !g.hidden).length,
    names: Array.from(document.querySelectorAll('#settingsBody [data-cat]')).filter(g => !g.hidden).map(g => (g.querySelector('.group-title')||{}).textContent),
    clearVisible: !document.getElementById('btnClearSearch').hidden,
  }))()`);
  step('搜索 «horizontal» 能命中分组', search.visible >= 1, `命中 ${search.visible} 个：${search.names.join(' / ')}`);
  step('命中项跨分类可见（不会被当前分类挡住）', search.visible >= 1);
  step('清除按钮出现', search.clearVisible);

  await win.capturePage().then((img) => fs.writeFileSync(path.join(OUT, 'settings-search.png'), img.toPNG()));

  await evalJs(`document.getElementById('btnClearSearch').click()`);
  await new Promise((r) => setTimeout(r, 250));
  const afterClear = await evalJs(`(() => Array.from(document.querySelectorAll('#settingsBody [data-cat]')).filter(g => !g.hidden).map(g => g.dataset.cat))()`);
  step('清除搜索后回到当前分类', afterClear.length > 0 && afterClear.every((c) => c === 'diag'), `可见：${afterClear.join(',')}`);

  console.log('\n[设置页 · 记忆分类]');
  const remembered = await evalJs(`localStorage.getItem('apkstart.settings.cat')`);
  step('上次停留的分类被记住了', remembered === 'diag', `记住了：${remembered}`);

  console.log('\n[设置页 · 渲染无异常]');
  const realErrors = errors.filter((e) => !/Autofill|devtools|Request Autofill/i.test(e));
  step('控制台没有报错', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));

  console.log(`\n结果：${passed} 通过，${failed} 失败`);
  app.exit(failed ? 1 : 0);
}).catch((e) => {
  console.error(e);
  app.exit(1);
});
