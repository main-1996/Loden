export const STORAGE_KEY = 'lodenSettings';
export const SKIP_HOME_ANIM_KEY = 'lodenSkipHomeAnim';

export const HOME_PAGE = 'index.html';
export const SESSION_PAGE = 'session.html';

/** Matches CSS `--ball-*` color transition (ms). */
export const CIRCLE_COLOR_CROSSFADE_MS = 800;
export const CIRCLE_PREP_MS = 800;

/** @param {string} page */
export function navigateTo(page) {
  location.href = new URL(page, location.href).href;
}
