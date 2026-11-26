'use strict';

// Iconos de componentes del sistema. Son SVG inline para que la Biblioteca
// funcione aunque el APK no exponga un icono extraíble al host.
(function attachSystemIcons(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.xoraSystemIcons = api;
}(typeof window !== 'undefined' ? window : globalThis, () => {
  function googlePlayIcon() {
    return `<svg class="google-play-icon" viewBox="0 0 24 24" role="img" aria-label="Google Play" focusable="false">
      <path fill="#00a173" d="M3.4 2.2 13.2 12 3.4 21.8a1.8 1.8 0 0 1-.9-1.6V3.8c0-.7.3-1.2.9-1.6Z"/>
      <path fill="#4285f4" d="m3.4 2.2 12.1 6.9-2.3 2.9-9.8-9.8Z"/>
      <path fill="#fbbc04" d="m3.4 21.8 9.8-9.8 2.3 2.9-12.1 6.9Z"/>
      <path fill="#ea4335" d="m15.5 9.1 3.8 2.2c1 .6 1 1.4 0 2l-3.8 2.2-2.3-2.9 2.3-2.9Z"/>
    </svg>`;
  }

  return { googlePlayIcon };
}));
