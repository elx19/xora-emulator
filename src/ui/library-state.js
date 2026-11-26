'use strict';

// Estado mínimo y reutilizable de la biblioteca. Se mantiene fuera de app.js
// para poder probar la inserción inmediata sin levantar Electron.
(function attachLibraryState(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.xoraLibraryState = api;
}(typeof window !== 'undefined' ? window : globalThis, () => {
  function mergeInstalledApp(current, installed) {
    const list = Array.isArray(current) ? current.slice() : [];
    if (!installed || !String(installed.package || '').trim()) return list;

    const pkg = String(installed.package).trim();
    const index = list.findIndex((item) => item && item.package === pkg);
    if (index < 0) return [{ ...installed, package: pkg }, ...list];

    const previous = list[index] || {};
    const next = { ...previous, ...installed, package: pkg };
    if (installed.installedAt == null && previous.installedAt != null) next.installedAt = previous.installedAt;
    if (installed.pinned == null && previous.pinned != null) next.pinned = previous.pinned;
    if (installed.lastLaunchAt == null && previous.lastLaunchAt != null) next.lastLaunchAt = previous.lastLaunchAt;
    list[index] = next;
    return list;
  }

  return { mergeInstalledApp };
}));
