import { PRESET_IDS, resolvePresetId } from '../lib/breathing.js';
import { navigateTo, SKIP_HOME_ANIM_KEY } from '../lib/config.js';
import {
  applyDocumentI18n,
  getLocale,
  initI18n,
  setLocale,
  t,
  updateLanguageSwitch,
} from '../lib/i18n.js';
import { loadSettings, saveSettings } from '../lib/settings.js';
import { applyTheme, initTheme, resolveThemeId, THEME_IDS, THEMES } from '../lib/theme.js';
import { getModeDefinition, getSessionPage, MODE_LIST, resolveModeId } from '../modes/index.js';
import { renderChoices, selectChoice } from '../ui/choices.js';

const presetsField = /** @type {HTMLFieldSetElement | null} */ (
  document.querySelector('[data-presets-field]')
);
const presetsContainer = /** @type {HTMLElement} */ (document.querySelector('[data-presets]'));
const modesContainer = /** @type {HTMLElement} */ (document.querySelector('[data-modes]'));
const themesContainer = /** @type {HTMLElement} */ (document.querySelector('[data-themes]'));
const startBtn = /** @type {HTMLButtonElement} */ (document.querySelector('[data-start]'));
const homeEl = /** @type {HTMLElement | null} */ (document.querySelector('.home'));
const langToggle = /** @type {HTMLButtonElement | null} */ (document.querySelector('[data-lang-toggle]'));
const langPanel = /** @type {HTMLElement | null} */ (document.querySelector('[data-lang-panel]'));

const skipHomeAnimation = sessionStorage.getItem(SKIP_HOME_ANIM_KEY) === '1';
if (skipHomeAnimation) {
  sessionStorage.removeItem(SKIP_HOME_ANIM_KEY);
  document.documentElement.classList.add('home-skip-animation');
  homeEl?.classList.add('home--visible');
}

function renderPresets() {
  renderChoices(
    presetsContainer,
    'preset',
    PRESET_IDS.map((id) => ({
      id,
      name: t(`preset.${id}.name`),
      sub: t(`preset.${id}.sub`),
    })),
    (id) => saveSettings({ preferredPreset: id }),
  );
}

function renderModes() {
  renderChoices(
    modesContainer,
    'mode',
    MODE_LIST.map((mode) => ({
      id: mode.id,
      name: t(`mode.${mode.id}.name`),
      sub: !mode.available
        ? t(`mode.${mode.id}.subComingSoon`)
        : t(`mode.${mode.id}.sub`),
      disabled: !mode.available,
    })),
    (id) => {
      saveSettings({ preferredMode: id });
      updatePresetsVisibility(id);
    },
  );
}

/** @param {string} modeId */
function updatePresetsVisibility(modeId) {
  if (!presetsField) return;
  presetsField.hidden = !getModeDefinition(modeId).supportsPresets;
}

function renderThemes() {
  renderChoices(
    themesContainer,
    'theme',
    THEME_IDS.map((id) => ({
      id,
      name: t(`theme.${id}`),
      swatch: THEMES[id].swatch,
    })),
    (id) => {
      applyTheme(id);
      saveSettings({ preferredTheme: id });
    },
    { listClass: 'choice-list' },
  );
}

/** @param {import('../lib/settings.js').UserSettings} settings */
async function persistResolvedSettings(settings) {
  const preferredPreset = resolvePresetId(settings.preferredPreset);
  const preferredMode = resolveModeId(settings.preferredMode);
  const preferredTheme = resolveThemeId(settings.preferredTheme);

  if (
    preferredPreset !== settings.preferredPreset
    || preferredMode !== settings.preferredMode
    || preferredTheme !== settings.preferredTheme
  ) {
    return saveSettings({
      preferredPreset,
      preferredMode,
      preferredTheme,
    });
  }

  return settings;
}

/** @param {string} modeId */
function selectMode(modeId) {
  const resolved = resolveModeId(modeId);
  selectChoice('mode', resolved);
  updatePresetsVisibility(resolved);
}

function revealHome() {
  if (skipHomeAnimation) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      homeEl?.classList.add('home--visible');
    });
  });
}

/** @param {import('../lib/settings.js').UserSettings} [cachedSettings] */
async function refreshHomeContent(cachedSettings) {
  applyDocumentI18n();
  updateLanguageSwitch(getLocale());
  renderPresets();
  renderModes();
  renderThemes();

  const settings = cachedSettings ?? await persistResolvedSettings(await loadSettings());
  selectChoice('preset', settings.preferredPreset);
  selectMode(settings.preferredMode);
  selectChoice('theme', settings.preferredTheme);
}

function setLangMenuOpen(open) {
  if (!langToggle || !langPanel) return;
  langToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  langPanel.hidden = !open;
}

function bindLanguageMenu() {
  if (!langToggle || !langPanel) return;

  langToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = langToggle.getAttribute('aria-expanded') === 'true';
    setLangMenuOpen(!isOpen);
  });

  langPanel.querySelectorAll('[data-locale]').forEach((btn) => {
    btn.addEventListener('click', async (event) => {
      event.stopPropagation();
      const next = btn.getAttribute('data-locale');
      if (!next || next === getLocale()) {
        setLangMenuOpen(false);
        return;
      }
      await setLocale(/** @type {'zh-CN' | 'en'} */ (next));
      await refreshHomeContent();
      setLangMenuOpen(false);
    });
  });

  document.addEventListener('click', () => setLangMenuOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setLangMenuOpen(false);
  });
}

async function init() {
  const settings = await persistResolvedSettings(await loadSettings());
  await initI18n(settings);
  await initTheme(settings);
  bindLanguageMenu();
  await refreshHomeContent(settings);
  revealHome();
}

startBtn.addEventListener('click', async () => {
  const settings = await loadSettings();
  const modeId = resolveModeId(settings.preferredMode);
  navigateTo(getSessionPage(modeId));
});

init();
