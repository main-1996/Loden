import { loadSettings } from './settings.js';

export const DEFAULT_THEME_ID = 'sky';

export const THEMES = {
  sky: { id: 'sky', swatch: '#458eb8' },
  sage: { id: 'sage', swatch: '#528564' },
  lavender: { id: 'lavender', swatch: '#7464a0' },
  sand: { id: 'sand', swatch: '#bf7860' },
  mint: { id: 'mint', swatch: '#389088' },
  minimal: { id: 'minimal', swatch: '#5a656b' },
};

export const THEME_IDS = Object.keys(THEMES);

/** @param {string} themeId */
export function resolveThemeId(themeId) {
  return THEMES[themeId] ? themeId : DEFAULT_THEME_ID;
}

/** @param {string} themeId */
export function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', resolveThemeId(themeId));
}

/** @param {import('./settings.js').UserSettings} [settings] */
export async function initTheme(settings) {
  const resolved = settings ?? (await loadSettings());
  applyTheme(resolved.preferredTheme);
}
