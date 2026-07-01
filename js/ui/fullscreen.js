import { t } from '../lib/i18n.js';

function toggleFullscreen() {
  if (document.fullscreenElement) return document.exitFullscreen();
  return document.documentElement.requestFullscreen();
}

/** @param {(isFullscreen: boolean) => void} callback */
function onFullscreenChange(callback) {
  const handler = () => callback(Boolean(document.fullscreenElement));
  document.addEventListener('fullscreenchange', handler);
  return () => document.removeEventListener('fullscreenchange', handler);
}

/** @param {ParentNode} [root] */
export function bindFullscreenButton(root = document) {
  const fullscreenBtn = /** @type {HTMLButtonElement | null} */ (
    root.querySelector('[data-fullscreen]')
  );
  const iconEnter = /** @type {SVGElement | null} */ (root.querySelector('[data-icon-enter]'));
  const iconExit = /** @type {SVGElement | null} */ (root.querySelector('[data-icon-exit]'));
  if (!fullscreenBtn) return;

  /** @param {boolean} isFullscreen */
  const update = (isFullscreen) => {
    if (iconEnter) iconEnter.hidden = isFullscreen;
    if (iconExit) iconExit.hidden = !isFullscreen;
    const label = isFullscreen ? t('a11y.exitFullscreen') : t('a11y.fullscreen');
    fullscreenBtn.title = label;
    fullscreenBtn.setAttribute('aria-label', label);
  };

  fullscreenBtn.addEventListener('click', () => toggleFullscreen().catch(() => {}));
  onFullscreenChange(update);
  update(Boolean(document.fullscreenElement));
}
