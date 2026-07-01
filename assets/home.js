(() => {
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);

  // js/lib/breathing.js
  var PRESETS = {
    relax: { id: "relax", phases: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 } },
    sleep: { id: "sleep", phases: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 } },
    quick: { id: "quick", phases: { inhale: 4, holdIn: 0, exhale: 8, holdOut: 0 } }
  };
  var PRESET_IDS = Object.keys(PRESETS);
  var DEFAULT_PRESET_ID = "relax";
  function resolvePresetId(presetId) {
    return PRESETS[presetId] ? presetId : DEFAULT_PRESET_ID;
  }

  // js/lib/config.js
  var STORAGE_KEY = "lodenSettings";
  var SKIP_HOME_ANIM_KEY = "lodenSkipHomeAnim";
  var SESSION_PAGE = "session.html";
  var CIRCLE_COLOR_CROSSFADE_MS = 800;
  function navigateTo(page) {
    location.href = new URL(page, location.href).href;
  }

  // js/lib/messages.js
  var MESSAGES = {
    "zh-CN": {
      "app": {
        "name": "\u843D\u5B9A"
      },
      "home": {
        "title": "\u6162\u4E0B\u6765\uFF0C\u56DE\u5230\u5E73\u8861",
        "subtitle": "\u8DDF\u7740\u8282\u594F\u547C\u5438\uFF0C\u5E2E\u52A9\u8EAB\u4F53\u7A33\u5B9A\u4E0B\u6765",
        "modeLabel": "\u6A21\u5F0F",
        "rhythmLabel": "\u8282\u594F",
        "appearanceLabel": "\u5916\u89C2",
        "start": "\u5F00\u59CB"
      },
      "session": {
        "intro": "\u8DDF\u7740\u5706\u5C31\u597D",
        "end": "\u7ED3\u675F",
        "phase": {
          "inhale": "\u5438\u6C14",
          "hold": "\u5C4F\u606F",
          "exhale": "\u547C\u6C14"
        }
      },
      "preset": {
        "relax": {
          "name": "\u653E\u677E",
          "sub": "\u65E5\u5E38\u5E73\u8861"
        },
        "sleep": {
          "name": "\u52A9\u7720",
          "sub": "\u7761\u524D\u964D\u901F"
        },
        "quick": {
          "name": "\u5E73\u590D",
          "sub": "\u7D27\u5F20\u65F6\u7528"
        }
      },
      "mode": {
        "circle": {
          "name": "\u5706",
          "sub": "\u89C6\u89C9\u8282\u594F"
        },
        "wave": {
          "name": "\u6D6A",
          "sub": "\u58F0\u97F3\u4E0E\u6D6A",
          "subComingSoon": "\u5F85\u5F00\u53D1"
        }
      },
      "theme": {
        "sky": "\u5929\u84DD",
        "sage": "\u96FE\u7EFF",
        "lavender": "\u85B0\u8863\u8349",
        "sand": "\u6696\u6C99",
        "mint": "\u8584\u8377",
        "minimal": "\u6781\u7B80"
      },
      "lang": {
        "menuLabel": "\u9009\u62E9\u8BED\u8A00",
        "zh": "\u4E2D\u6587",
        "en": "English"
      },
      "a11y": {
        "fullscreen": "\u5168\u5C4F",
        "exitFullscreen": "\u9000\u51FA\u5168\u5C4F"
      }
    },
    "en": {
      "app": {
        "name": "Loden"
      },
      "home": {
        "title": "Slow down, find your balance",
        "subtitle": "Breathe with the rhythm and let your body settle",
        "modeLabel": "Mode",
        "rhythmLabel": "Rhythm",
        "appearanceLabel": "Appearance",
        "start": "Start"
      },
      "session": {
        "intro": "Follow the circle\u2014that's enough",
        "end": "End",
        "phase": {
          "inhale": "Inhale",
          "hold": "Hold",
          "exhale": "Exhale"
        }
      },
      "preset": {
        "relax": {
          "name": "Relax",
          "sub": "Daily balance"
        },
        "sleep": {
          "name": "Sleep",
          "sub": "Wind down"
        },
        "quick": {
          "name": "Calm",
          "sub": "When you're tense"
        }
      },
      "mode": {
        "circle": {
          "name": "Circle",
          "sub": "Visual rhythm"
        },
        "wave": {
          "name": "Wave",
          "sub": "Sound and waves",
          "subComingSoon": "Coming soon"
        }
      },
      "theme": {
        "sky": "Sky",
        "sage": "Sage",
        "lavender": "Lavender",
        "sand": "Sand",
        "mint": "Mint",
        "minimal": "Minimal"
      },
      "lang": {
        "menuLabel": "Language",
        "zh": "\u4E2D\u6587",
        "en": "English"
      },
      "a11y": {
        "fullscreen": "Fullscreen",
        "exitFullscreen": "Exit fullscreen"
      }
    }
  };

  // js/lib/settings.js
  var DEFAULT_MODE_ID = "circle";
  var DEFAULT_SETTINGS = {
    preferredMode: DEFAULT_MODE_ID,
    preferredPreset: DEFAULT_PRESET_ID,
    preferredTheme: "sky",
    preferredLocale: ""
  };
  function mergeSettings(partial) {
    return { ...DEFAULT_SETTINGS, ...partial };
  }
  function normalizeSettings(settings) {
    return {
      ...settings,
      preferredPreset: resolvePresetId(settings.preferredPreset)
    };
  }
  async function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const stored = JSON.parse(raw);
      if (!stored || typeof stored !== "object") return { ...DEFAULT_SETTINGS };
      return normalizeSettings(mergeSettings(stored));
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }
  async function saveSettings(partial) {
    const current = await loadSettings();
    const next = normalizeSettings(mergeSettings({ ...current, ...partial }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  // js/lib/i18n.js
  var SUPPORTED_LOCALES = (
    /** @type {const} */
    ["zh-CN", "en"]
  );
  var DEFAULT_LOCALE = "en";
  var locale = DEFAULT_LOCALE;
  var messages = {};
  function t(key, vars) {
    const parts = key.split(".");
    let value = messages;
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = /** @type {Record<string, unknown>} */
        value[part];
      } else {
        return key;
      }
    }
    if (typeof value !== "string") return key;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
  }
  function getLocale() {
    return locale;
  }
  function normalizeLocale(candidate) {
    if (candidate === "zh" || candidate.startsWith("zh-") || candidate.startsWith("zh_")) {
      return "zh-CN";
    }
    if (candidate.startsWith("en")) return "en";
    return DEFAULT_LOCALE;
  }
  function detectLocale() {
    return normalizeLocale(navigator.language || DEFAULT_LOCALE);
  }
  function loadMessages(next) {
    const bundle = MESSAGES[next];
    if (!bundle) throw new Error(`Missing locale: ${next}`);
    messages = bundle;
    locale = next;
  }
  function applyDocumentI18n(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key) el.textContent = t(key);
    });
    root.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      if (key) el.setAttribute("aria-label", t(key));
    });
    root.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (key) el.setAttribute("title", t(key));
    });
    document.title = t("app.name");
    document.documentElement.lang = locale === "zh-CN" ? "zh-CN" : "en";
  }
  function updateLanguageSwitch(active) {
    document.querySelectorAll(".lang-menu__option[data-locale]").forEach((btn) => {
      const isActive = btn.getAttribute("data-locale") === active;
      btn.classList.toggle("lang-menu__option--active", isActive);
      btn.setAttribute("aria-checked", isActive ? "true" : "false");
    });
  }
  async function initI18n(storedSettings) {
    let preferred = storedSettings?.preferredLocale;
    if (!preferred) {
      const settings = storedSettings ?? await loadSettings();
      preferred = settings.preferredLocale || detectLocale();
    }
    const resolved = SUPPORTED_LOCALES.includes(
      /** @type {Locale} */
      preferred
    ) ? (
      /** @type {Locale} */
      preferred
    ) : normalizeLocale(preferred);
    loadMessages(resolved);
  }
  async function setLocale(next) {
    if (!SUPPORTED_LOCALES.includes(next) || next === locale) return;
    loadMessages(next);
    await saveSettings({ preferredLocale: next });
  }

  // js/lib/theme.js
  var DEFAULT_THEME_ID = "sky";
  var THEMES = {
    sky: { id: "sky", swatch: "#458eb8" },
    sage: { id: "sage", swatch: "#528564" },
    lavender: { id: "lavender", swatch: "#7464a0" },
    sand: { id: "sand", swatch: "#bf7860" },
    mint: { id: "mint", swatch: "#389088" },
    minimal: { id: "minimal", swatch: "#5a656b" }
  };
  var THEME_IDS = Object.keys(THEMES);
  function resolveThemeId(themeId) {
    return THEMES[themeId] ? themeId : DEFAULT_THEME_ID;
  }
  function applyTheme(themeId) {
    document.documentElement.setAttribute("data-theme", resolveThemeId(themeId));
  }
  async function initTheme(settings) {
    const resolved = settings ?? await loadSettings();
    applyTheme(resolved.preferredTheme);
  }

  // js/lib/motion.js
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  var COLOR_LEAD_SEC = CIRCLE_COLOR_CROSSFADE_MS / 1e3;
  var PAUSE_LEAD_SEC = 0.15;
  var MAX_LEAD_RATIO = 0.35;
  function easeInOut(t2) {
    return t2 < 0.5 ? 2 * t2 * t2 : 1 - (-2 * t2 + 2) ** 2 / 2;
  }
  function activePhaseScaleProgress(wallProgress, durationSec) {
    if (durationSec <= 0) return wallProgress >= 1 ? 1 : 0;
    if (prefersReducedMotion()) {
      const leadFrac2 = Math.min(0.12 / durationSec, 0.12);
      if (wallProgress <= leadFrac2) return 0;
      return (wallProgress - leadFrac2) / (1 - leadFrac2);
    }
    const leadSec = COLOR_LEAD_SEC + PAUSE_LEAD_SEC;
    const leadFrac = Math.min(leadSec / durationSec, MAX_LEAD_RATIO);
    if (wallProgress <= leadFrac) return 0;
    const animT = (wallProgress - leadFrac) / (1 - leadFrac);
    return easeInOut(Math.min(1, Math.max(0, animT)));
  }

  // js/modes/circle.js
  var SCALE_MIN = 0.2;
  var SCALE_RANGE = 0.8;
  function scaleForPhase(progress, phase, durationSec) {
    if (phase === "holdIn") return 1;
    if (phase === "holdOut") return SCALE_MIN;
    const animProgress = activePhaseScaleProgress(progress, durationSec);
    if (phase === "inhale") {
      return SCALE_MIN + animProgress * SCALE_RANGE;
    }
    if (phase === "exhale") {
      return 1 - animProgress * SCALE_RANGE;
    }
    return SCALE_MIN;
  }
  var _root, _scaleEl, _circle, _phaseDuration;
  var CircleMode = class {
    constructor() {
      /** @type {HTMLElement | null} */
      __privateAdd(this, _root, null);
      /** @type {HTMLElement | null} */
      __privateAdd(this, _scaleEl, null);
      /** @type {HTMLElement | null} */
      __privateAdd(this, _circle, null);
      /** @type {number} */
      __privateAdd(this, _phaseDuration, 4);
    }
    /** @param {HTMLElement} container */
    mount(container) {
      __privateSet(this, _root, document.createElement("div"));
      __privateGet(this, _root).className = "circle-mode";
      __privateGet(this, _root).innerHTML = `
      <div class="circle-mode__ring" aria-hidden="true"></div>
      <div class="circle-mode__scale">
        <div class="circle-mode__circle"></div>
      </div>
    `;
      __privateSet(this, _scaleEl, __privateGet(this, _root).querySelector(".circle-mode__scale"));
      __privateSet(this, _circle, __privateGet(this, _root).querySelector(".circle-mode__circle"));
      container.appendChild(__privateGet(this, _root));
    }
    unmount() {
      __privateGet(this, _root)?.remove();
      __privateSet(this, _root, null);
      __privateSet(this, _scaleEl, null);
      __privateSet(this, _circle, null);
    }
    /** @param {boolean} active */
    setPrep(active) {
      __privateGet(this, _root)?.classList.toggle("circle-mode--prep", active);
    }
    /** @param {BreathPhase} phase @param {number} duration */
    onPhaseChange(phase, duration) {
      __privateSet(this, _phaseDuration, duration);
      if (__privateGet(this, _root)) __privateGet(this, _root).dataset.phase = phase;
      if (__privateGet(this, _circle)) __privateGet(this, _circle).dataset.phase = phase;
    }
    /** @param {number} progress @param {BreathPhase} phase */
    onTick(progress, phase) {
      if (!__privateGet(this, _scaleEl)) return;
      __privateGet(this, _scaleEl).style.transform = `scale(${scaleForPhase(progress, phase, __privateGet(this, _phaseDuration))})`;
    }
  };
  _root = new WeakMap();
  _scaleEl = new WeakMap();
  _circle = new WeakMap();
  _phaseDuration = new WeakMap();

  // js/modes/index.js
  var MODES = {
    circle: {
      id: "circle",
      Mode: CircleMode,
      available: true,
      supportsPresets: true,
      sessionPage: SESSION_PAGE
    },
    wave: {
      id: "wave",
      available: false,
      supportsPresets: true
    }
  };
  var MODE_LIST = Object.values(MODES);
  function resolveModeId(modeId) {
    return MODES[modeId]?.available ? modeId : DEFAULT_MODE_ID;
  }
  function getModeDefinition(modeId) {
    return MODES[resolveModeId(modeId)];
  }
  function getSessionPage(modeId) {
    return getModeDefinition(modeId).sessionPage ?? SESSION_PAGE;
  }

  // js/ui/choices.js
  function renderChoices(container, groupName, items, onSelect, options = {}) {
    if (options.listClass) container.className = options.listClass;
    container.replaceChildren(
      ...items.map((item) => {
        const wrapper = document.createElement("div");
        wrapper.className = "choice-option";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = groupName;
        input.id = `${groupName}-${item.id}`;
        input.value = item.id;
        input.disabled = Boolean(item.disabled);
        const label = document.createElement("label");
        label.htmlFor = input.id;
        const body = document.createElement("div");
        body.className = "choice-option__body";
        if (item.swatch) {
          wrapper.classList.add("choice-option--swatch");
          const swatch = document.createElement("span");
          swatch.className = "choice-option__swatch";
          swatch.style.background = item.swatch;
          body.appendChild(swatch);
        }
        const name = document.createElement("span");
        name.className = "choice-option__name";
        name.textContent = item.name;
        body.appendChild(name);
        if (item.sub) {
          const sub = document.createElement("span");
          sub.className = "choice-option__sub";
          sub.textContent = item.sub;
          body.appendChild(sub);
        }
        label.appendChild(body);
        input.addEventListener("change", () => {
          if (input.checked && !item.disabled) onSelect(item.id);
        });
        wrapper.append(input, label);
        return wrapper;
      })
    );
  }
  function selectChoice(groupName, id) {
    const input = (
      /** @type {HTMLInputElement | null} */
      document.querySelector(`#${groupName}-${id}`)
    );
    if (input) input.checked = true;
  }

  // js/pages/home.js
  var presetsField = (
    /** @type {HTMLFieldSetElement | null} */
    document.querySelector("[data-presets-field]")
  );
  var presetsContainer = (
    /** @type {HTMLElement} */
    document.querySelector("[data-presets]")
  );
  var modesContainer = (
    /** @type {HTMLElement} */
    document.querySelector("[data-modes]")
  );
  var themesContainer = (
    /** @type {HTMLElement} */
    document.querySelector("[data-themes]")
  );
  var startBtn = (
    /** @type {HTMLButtonElement} */
    document.querySelector("[data-start]")
  );
  var homeEl = (
    /** @type {HTMLElement | null} */
    document.querySelector(".home")
  );
  var langToggle = (
    /** @type {HTMLButtonElement | null} */
    document.querySelector("[data-lang-toggle]")
  );
  var langPanel = (
    /** @type {HTMLElement | null} */
    document.querySelector("[data-lang-panel]")
  );
  var skipHomeAnimation = sessionStorage.getItem(SKIP_HOME_ANIM_KEY) === "1";
  if (skipHomeAnimation) {
    sessionStorage.removeItem(SKIP_HOME_ANIM_KEY);
    document.documentElement.classList.add("home-skip-animation");
    homeEl?.classList.add("home--visible");
  }
  function renderPresets() {
    renderChoices(
      presetsContainer,
      "preset",
      PRESET_IDS.map((id) => ({
        id,
        name: t(`preset.${id}.name`),
        sub: t(`preset.${id}.sub`)
      })),
      (id) => saveSettings({ preferredPreset: id })
    );
  }
  function renderModes() {
    renderChoices(
      modesContainer,
      "mode",
      MODE_LIST.map((mode) => ({
        id: mode.id,
        name: t(`mode.${mode.id}.name`),
        sub: !mode.available ? t(`mode.${mode.id}.subComingSoon`) : t(`mode.${mode.id}.sub`),
        disabled: !mode.available
      })),
      (id) => {
        saveSettings({ preferredMode: id });
        updatePresetsVisibility(id);
      }
    );
  }
  function updatePresetsVisibility(modeId) {
    if (!presetsField) return;
    presetsField.hidden = !getModeDefinition(modeId).supportsPresets;
  }
  function renderThemes() {
    renderChoices(
      themesContainer,
      "theme",
      THEME_IDS.map((id) => ({
        id,
        name: t(`theme.${id}`),
        swatch: THEMES[id].swatch
      })),
      (id) => {
        applyTheme(id);
        saveSettings({ preferredTheme: id });
      },
      { listClass: "choice-list" }
    );
  }
  async function persistResolvedSettings(settings) {
    const preferredPreset = resolvePresetId(settings.preferredPreset);
    const preferredMode = resolveModeId(settings.preferredMode);
    const preferredTheme = resolveThemeId(settings.preferredTheme);
    if (preferredPreset !== settings.preferredPreset || preferredMode !== settings.preferredMode || preferredTheme !== settings.preferredTheme) {
      return saveSettings({
        preferredPreset,
        preferredMode,
        preferredTheme
      });
    }
    return settings;
  }
  function selectMode(modeId) {
    const resolved = resolveModeId(modeId);
    selectChoice("mode", resolved);
    updatePresetsVisibility(resolved);
  }
  function revealHome() {
    if (skipHomeAnimation) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        homeEl?.classList.add("home--visible");
      });
    });
  }
  async function refreshHomeContent(cachedSettings) {
    applyDocumentI18n();
    updateLanguageSwitch(getLocale());
    renderPresets();
    renderModes();
    renderThemes();
    const settings = cachedSettings ?? await persistResolvedSettings(await loadSettings());
    selectChoice("preset", settings.preferredPreset);
    selectMode(settings.preferredMode);
    selectChoice("theme", settings.preferredTheme);
  }
  function setLangMenuOpen(open) {
    if (!langToggle || !langPanel) return;
    langToggle.setAttribute("aria-expanded", open ? "true" : "false");
    langPanel.hidden = !open;
  }
  function bindLanguageMenu() {
    if (!langToggle || !langPanel) return;
    langToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = langToggle.getAttribute("aria-expanded") === "true";
      setLangMenuOpen(!isOpen);
    });
    langPanel.querySelectorAll("[data-locale]").forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        event.stopPropagation();
        const next = btn.getAttribute("data-locale");
        if (!next || next === getLocale()) {
          setLangMenuOpen(false);
          return;
        }
        await setLocale(
          /** @type {'zh-CN' | 'en'} */
          next
        );
        await refreshHomeContent();
        setLangMenuOpen(false);
      });
    });
    document.addEventListener("click", () => setLangMenuOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setLangMenuOpen(false);
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
  startBtn.addEventListener("click", async () => {
    const settings = await loadSettings();
    const modeId = resolveModeId(settings.preferredMode);
    navigateTo(getSessionPage(modeId));
  });
  init();
})();
