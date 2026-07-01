import { STORAGE_KEY } from './config.js';
import { MESSAGES } from './messages.js';
import { loadSettings, saveSettings } from './settings.js';

const SUPPORTED_LOCALES = /** @type {const} */ (['zh-CN', 'en']);
const DEFAULT_LOCALE = 'en';

/** @typedef {(typeof SUPPORTED_LOCALES)[number]} Locale */
/** @typedef {import('./breathing.js').BreathPhase} BreathPhase */

/** @type {Locale} */
let locale = DEFAULT_LOCALE;

/** @type {Record<string, unknown>} */
let messages = {};

/**
 * @param {string} key
 * @param {Record<string, string>} [vars]
 */
export function t(key, vars) {
  const parts = key.split('.');
  /** @type {unknown} */
  let value = messages;
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = /** @type {Record<string, unknown>} */ (value)[part];
    } else {
      return key;
    }
  }
  if (typeof value !== 'string') return key;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
}

/** @param {BreathPhase} phase */
export function getPhaseLabel(phase) {
  if (phase === 'holdIn' || phase === 'holdOut') return t('session.phase.hold');
  return t(`session.phase.${phase}`);
}

/** @returns {Locale} */
export function getLocale() {
  return locale;
}

/** @param {string} candidate */
function normalizeLocale(candidate) {
  if (candidate === 'zh' || candidate.startsWith('zh-') || candidate.startsWith('zh_')) {
    return 'zh-CN';
  }
  if (candidate.startsWith('en')) return 'en';
  return DEFAULT_LOCALE;
}

function detectLocale() {
  return normalizeLocale(navigator.language || DEFAULT_LOCALE);
}

/** @param {Locale} next */
function loadMessages(next) {
  const bundle = MESSAGES[next];
  if (!bundle) throw new Error(`Missing locale: ${next}`);
  messages = bundle;
  locale = next;
}

/** @param {ParentNode} [root] */
export function applyDocumentI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });

  root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) el.setAttribute('aria-label', t(key));
  });

  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.setAttribute('title', t(key));
  });

  document.title = t('app.name');
  document.documentElement.lang = locale === 'zh-CN' ? 'zh-CN' : 'en';
}

/** @param {Locale} active */
export function updateLanguageSwitch(active) {
  document.querySelectorAll('.lang-menu__option[data-locale]').forEach((btn) => {
    const isActive = btn.getAttribute('data-locale') === active;
    btn.classList.toggle('lang-menu__option--active', isActive);
    btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
}

/** @param {import('./settings.js').UserSettings | null | undefined} [storedSettings] */
export async function initI18n(storedSettings) {
  let preferred = storedSettings?.preferredLocale;

  if (!preferred) {
    const settings = storedSettings ?? await loadSettings();
    preferred = settings.preferredLocale || detectLocale();
  }

  const resolved = SUPPORTED_LOCALES.includes(/** @type {Locale} */ (preferred))
    ? /** @type {Locale} */ (preferred)
    : normalizeLocale(preferred);

  loadMessages(resolved);
}

/** @param {Locale} next */
export async function setLocale(next) {
  if (!SUPPORTED_LOCALES.includes(next) || next === locale) return;
  loadMessages(next);
  await saveSettings({ preferredLocale: next });
}

/** @param {import('./settings.js').UserSettings} settings */
export async function reloadLocaleFromSettings(settings) {
  const preferred = settings.preferredLocale || detectLocale();
  const resolved = SUPPORTED_LOCALES.includes(/** @type {Locale} */ (preferred))
    ? /** @type {Locale} */ (preferred)
    : normalizeLocale(preferred);

  if (resolved === locale) return false;
  loadMessages(resolved);
  return true;
}

export function bindLocaleStorageSync(onLocaleChange) {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;

    try {
      const next = JSON.parse(event.newValue);
      reloadLocaleFromSettings(next).then((changed) => {
        if (changed) onLocaleChange();
      });
    } catch {
      // ignore malformed storage payloads
    }
  });
}
