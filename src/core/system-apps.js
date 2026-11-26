'use strict';

// Aplicaciones que forman parte de la imagen oficial de XORA.
// Se muestran en la biblioteca como instaladas, pero no se mezclan con apps
// del usuario ni se pueden desinstalar desde la interfaz.
const BUILTIN_SYSTEM_APPS = Object.freeze([
  Object.freeze({
    package: 'com.android.vending',
    label: 'Google Play Store',
    versionName: 'Incluida',
    category: 'productivity',
    system: true,
    protected: true,
    source: 'runtime-image',
  }),
]);

function listSystemApps({ playImageReady = false } = {}) {
  if (!playImageReady) return [];
  return BUILTIN_SYSTEM_APPS.map((app) => ({ ...app }));
}

function mergeSystemApps(current, options = {}) {
  const userApps = Array.isArray(current) ? current.filter(Boolean) : [];
  const merged = [...listSystemApps(options), ...userApps];
  const seen = new Set();
  return merged.filter((app) => {
    const pkg = String(app.package || '').trim();
    if (!pkg || seen.has(pkg)) return false;
    seen.add(pkg);
    return true;
  });
}

function isProtectedSystemApp(pkg) {
  return BUILTIN_SYSTEM_APPS.some((app) => app.protected && app.package === String(pkg || ''));
}

module.exports = {
  BUILTIN_SYSTEM_APPS,
  listSystemApps,
  mergeSystemApps,
  isProtectedSystemApp,
};
