import { DEFAULT_PRESET_ID, resolvePresetId } from './breathing.js';
import { STORAGE_KEY } from './config.js';

/** @typedef {{
 *   preferredMode: string,
 *   preferredPreset: string,
 *   preferredTheme: string,
 *   preferredLocale: string,
 * }} UserSettings */

export const DEFAULT_MODE_ID = 'circle';

/** @type {UserSettings} */
export const DEFAULT_SETTINGS = {
  preferredMode: DEFAULT_MODE_ID,
  preferredPreset: DEFAULT_PRESET_ID,
  preferredTheme: 'sky',
  preferredLocale: '',
};

/** @param {Partial<UserSettings>} partial */
function mergeSettings(partial) {
  return { ...DEFAULT_SETTINGS, ...partial };
}

/** @param {UserSettings} settings */
function normalizeSettings(settings) {
  return {
    ...settings,
    preferredPreset: resolvePresetId(settings.preferredPreset),
  };
}

export async function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const stored = JSON.parse(raw);
    if (!stored || typeof stored !== 'object') return { ...DEFAULT_SETTINGS };
    return normalizeSettings(mergeSettings(stored));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** @param {Partial<UserSettings>} partial */
export async function saveSettings(partial) {
  const current = await loadSettings();
  const next = normalizeSettings(mergeSettings({ ...current, ...partial }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
