(() => {
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

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
  var PHASE_ORDER = (
    /** @type {const} */
    ["inhale", "holdIn", "exhale", "holdOut"]
  );
  var _phases, _phaseIndex, _phaseElapsed, _status, _rafId, _lastTimestamp, _onPhaseChange, _onTick, _BreathingSession_instances, scheduleFrame_fn, cancelFrame_fn, frame_fn, advancePhase_fn, skipZeroDurationPhases_fn, emitPhaseChange_fn, emitTick_fn;
  var BreathingSession = class {
    /** @param {BreathPhases} phases */
    constructor(phases) {
      __privateAdd(this, _BreathingSession_instances);
      /** @type {BreathPhases} */
      __privateAdd(this, _phases);
      /** @type {number} */
      __privateAdd(this, _phaseIndex, 0);
      /** @type {number} */
      __privateAdd(this, _phaseElapsed, 0);
      /** @type {'idle' | 'running'} */
      __privateAdd(this, _status, "idle");
      /** @type {number | null} */
      __privateAdd(this, _rafId, null);
      /** @type {number} */
      __privateAdd(this, _lastTimestamp, 0);
      /** @type {(phase: BreathPhase, duration: number) => void} */
      __privateAdd(this, _onPhaseChange, () => {
      });
      /** @type {(progress: number, phase: BreathPhase) => void} */
      __privateAdd(this, _onTick, () => {
      });
      __privateSet(this, _phases, phases);
    }
    get currentPhase() {
      return PHASE_ORDER[__privateGet(this, _phaseIndex)];
    }
    get status() {
      return __privateGet(this, _status);
    }
    onPhaseChange(cb) {
      __privateSet(this, _onPhaseChange, cb);
    }
    onTick(cb) {
      __privateSet(this, _onTick, cb);
    }
    start() {
      if (__privateGet(this, _status) === "running") return;
      __privateSet(this, _status, "running");
      __privateSet(this, _phaseIndex, 0);
      __privateSet(this, _phaseElapsed, 0);
      __privateSet(this, _lastTimestamp, 0);
      __privateMethod(this, _BreathingSession_instances, skipZeroDurationPhases_fn).call(this);
      __privateMethod(this, _BreathingSession_instances, emitPhaseChange_fn).call(this);
      __privateMethod(this, _BreathingSession_instances, emitTick_fn).call(this, 0);
      __privateMethod(this, _BreathingSession_instances, scheduleFrame_fn).call(this);
    }
    stop() {
      __privateSet(this, _status, "idle");
      __privateMethod(this, _BreathingSession_instances, cancelFrame_fn).call(this);
      __privateSet(this, _phaseIndex, 0);
      __privateSet(this, _phaseElapsed, 0);
    }
  };
  _phases = new WeakMap();
  _phaseIndex = new WeakMap();
  _phaseElapsed = new WeakMap();
  _status = new WeakMap();
  _rafId = new WeakMap();
  _lastTimestamp = new WeakMap();
  _onPhaseChange = new WeakMap();
  _onTick = new WeakMap();
  _BreathingSession_instances = new WeakSet();
  scheduleFrame_fn = function() {
    __privateMethod(this, _BreathingSession_instances, cancelFrame_fn).call(this);
    __privateSet(this, _rafId, requestAnimationFrame((ts) => __privateMethod(this, _BreathingSession_instances, frame_fn).call(this, ts)));
  };
  cancelFrame_fn = function() {
    if (__privateGet(this, _rafId) !== null) {
      cancelAnimationFrame(__privateGet(this, _rafId));
      __privateSet(this, _rafId, null);
    }
  };
  /** @param {number} timestamp */
  frame_fn = function(timestamp) {
    if (__privateGet(this, _status) !== "running") return;
    if (__privateGet(this, _lastTimestamp) === 0) __privateSet(this, _lastTimestamp, timestamp);
    __privateSet(this, _phaseElapsed, __privateGet(this, _phaseElapsed) + (timestamp - __privateGet(this, _lastTimestamp)) / 1e3);
    __privateSet(this, _lastTimestamp, timestamp);
    const phase = this.currentPhase;
    const duration = __privateGet(this, _phases)[phase];
    if (duration <= 0) {
      __privateMethod(this, _BreathingSession_instances, advancePhase_fn).call(this);
      __privateMethod(this, _BreathingSession_instances, scheduleFrame_fn).call(this);
      return;
    }
    const progress = Math.min(__privateGet(this, _phaseElapsed) / duration, 1);
    __privateMethod(this, _BreathingSession_instances, emitTick_fn).call(this, progress);
    if (__privateGet(this, _phaseElapsed) >= duration) __privateMethod(this, _BreathingSession_instances, advancePhase_fn).call(this);
    if (__privateGet(this, _status) === "running") __privateMethod(this, _BreathingSession_instances, scheduleFrame_fn).call(this);
  };
  advancePhase_fn = function() {
    __privateSet(this, _phaseElapsed, 0);
    __privateSet(this, _phaseIndex, __privateGet(this, _phaseIndex) + 1);
    if (__privateGet(this, _phaseIndex) >= PHASE_ORDER.length) {
      __privateSet(this, _phaseIndex, 0);
    }
    __privateMethod(this, _BreathingSession_instances, skipZeroDurationPhases_fn).call(this);
    __privateMethod(this, _BreathingSession_instances, emitPhaseChange_fn).call(this);
    __privateMethod(this, _BreathingSession_instances, emitTick_fn).call(this, 0);
  };
  skipZeroDurationPhases_fn = function() {
    for (let i = 0; i < PHASE_ORDER.length; i++) {
      if (__privateGet(this, _phaseIndex) >= PHASE_ORDER.length) {
        __privateSet(this, _phaseIndex, 0);
      }
      if (__privateGet(this, _phases)[this.currentPhase] > 0) return;
      __privateSet(this, _phaseIndex, __privateGet(this, _phaseIndex) + 1);
    }
    if (__privateGet(this, _phaseIndex) >= PHASE_ORDER.length) {
      __privateSet(this, _phaseIndex, 0);
    }
  };
  emitPhaseChange_fn = function() {
    const phase = this.currentPhase;
    __privateGet(this, _onPhaseChange).call(this, phase, __privateGet(this, _phases)[phase]);
  };
  /** @param {number} progress */
  emitTick_fn = function(progress) {
    __privateGet(this, _onTick).call(this, progress, this.currentPhase);
  };

  // js/lib/config.js
  var STORAGE_KEY = "lodenSettings";
  var SKIP_HOME_ANIM_KEY = "lodenSkipHomeAnim";
  var HOME_PAGE = "index.html";
  var SESSION_PAGE = "session.html";
  var CIRCLE_COLOR_CROSSFADE_MS = 800;
  var CIRCLE_PREP_MS = 800;
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
  function getPhaseLabel(phase) {
    if (phase === "holdIn" || phase === "holdOut") return t("session.phase.hold");
    return t(`session.phase.${phase}`);
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
  async function reloadLocaleFromSettings(settings) {
    const preferred = settings.preferredLocale || detectLocale();
    const resolved = SUPPORTED_LOCALES.includes(
      /** @type {Locale} */
      preferred
    ) ? (
      /** @type {Locale} */
      preferred
    ) : normalizeLocale(preferred);
    if (resolved === locale) return false;
    loadMessages(resolved);
    return true;
  }
  function bindLocaleStorageSync(onLocaleChange) {
    window.addEventListener("storage", (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const next = JSON.parse(event.newValue);
        reloadLocaleFromSettings(next).then((changed) => {
          if (changed) onLocaleChange();
        });
      } catch {
      }
    });
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
  function getSessionPhases(modeId, presetId) {
    const def = getModeDefinition(modeId);
    if (def.supportsPresets) {
      return PRESETS[resolvePresetId(presetId)].phases;
    }
    return PRESETS.relax.phases;
  }

  // js/ui/fullscreen.js
  function toggleFullscreen() {
    if (document.fullscreenElement) return document.exitFullscreen();
    return document.documentElement.requestFullscreen();
  }
  function onFullscreenChange(callback) {
    const handler = () => callback(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }
  function bindFullscreenButton(root = document) {
    const fullscreenBtn = (
      /** @type {HTMLButtonElement | null} */
      root.querySelector("[data-fullscreen]")
    );
    const iconEnter = (
      /** @type {SVGElement | null} */
      root.querySelector("[data-icon-enter]")
    );
    const iconExit = (
      /** @type {SVGElement | null} */
      root.querySelector("[data-icon-exit]")
    );
    if (!fullscreenBtn) return;
    const update = (isFullscreen) => {
      if (iconEnter) iconEnter.hidden = isFullscreen;
      if (iconExit) iconExit.hidden = !isFullscreen;
      const label = isFullscreen ? t("a11y.exitFullscreen") : t("a11y.fullscreen");
      fullscreenBtn.title = label;
      fullscreenBtn.setAttribute("aria-label", label);
    };
    fullscreenBtn.addEventListener("click", () => toggleFullscreen().catch(() => {
    }));
    onFullscreenChange(update);
    update(Boolean(document.fullscreenElement));
  }

  // js/pages/session.js
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function revealSession(sessionEl) {
    if (prefersReducedMotion()) {
      sessionEl?.classList.add("session--visible");
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sessionEl?.classList.add("session--visible");
      });
    });
  }
  function updatePhaseUI(phaseEl, phase, { skipCue = false } = {}) {
    phaseEl.textContent = getPhaseLabel(phase);
    phaseEl.dataset.phase = phase;
    phaseEl.classList.remove("session__phase--cue", "session__phase--cue-soft");
    if (prefersReducedMotion() || skipCue) return;
    void phaseEl.offsetWidth;
    const isHold = phase === "holdIn" || phase === "holdOut";
    phaseEl.classList.add(isHold ? "session__phase--cue-soft" : "session__phase--cue");
  }
  function bindStopButton(stopBtn, onStop) {
    stopBtn.addEventListener("click", () => {
      onStop?.();
      sessionStorage.setItem(SKIP_HOME_ANIM_KEY, "1");
      navigateTo(HOME_PAGE);
    });
  }
  async function init() {
    const sessionEl = document.querySelector(".session");
    const canvas = (
      /** @type {HTMLElement} */
      document.querySelector("[data-canvas]")
    );
    const phaseEl = (
      /** @type {HTMLElement} */
      document.querySelector("[data-phase]")
    );
    const stopBtn = (
      /** @type {HTMLButtonElement} */
      document.querySelector("[data-stop]")
    );
    let session = null;
    let mode = null;
    let skipNextPhaseCue = false;
    const prep = {
      introKey: "session.intro",
      prepWaitMs: CIRCLE_COLOR_CROSSFADE_MS + CIRCLE_PREP_MS,
      prepPhase: (
        /** @type {BreathPhase} */
        "inhale"
      ),
      prepProgress: 0
    };
    function showPrepUI() {
      phaseEl.textContent = t(prep.introKey);
      phaseEl.dataset.phase = prep.prepPhase;
      phaseEl.classList.remove("session__phase--cue", "session__phase--cue-soft");
    }
    function showPrepVisual(activeMode) {
      activeMode.onPhaseChange(prep.prepPhase, 0);
      activeMode.onTick(prep.prepProgress, prep.prepPhase);
    }
    function teardownMode() {
      session?.stop();
      mode?.unmount();
      mode = null;
    }
    function setupMode(modeId) {
      teardownMode();
      const { Mode } = getModeDefinition(modeId);
      mode = new Mode();
      mode.mount(canvas);
    }
    function bindSession() {
      if (!session || !mode) return;
      session.onPhaseChange((phase, duration) => {
        updatePhaseUI(phaseEl, phase, { skipCue: skipNextPhaseCue });
        skipNextPhaseCue = false;
        mode.onPhaseChange(phase, duration);
      });
      session.onTick((progress, phase) => mode.onTick(progress, phase));
    }
    async function startSession(settings2) {
      teardownMode();
      const modeId = resolveModeId(settings2.preferredMode);
      const phases = getSessionPhases(modeId, settings2.preferredPreset);
      setupMode(modeId);
      session = new BreathingSession(phases);
      bindSession();
      showPrepVisual(mode);
      mode.setPrep?.(true);
      showPrepUI();
      revealSession(sessionEl);
      const waitMs = prefersReducedMotion() ? 400 : prep.prepWaitMs;
      await sleep(waitMs);
      mode.setPrep?.(false);
      skipNextPhaseCue = true;
      session.start();
    }
    bindStopButton(stopBtn, () => {
      session?.stop();
      teardownMode();
    });
    bindLocaleStorageSync(() => {
      applyDocumentI18n();
      if (session) {
        updatePhaseUI(phaseEl, session.currentPhase, { skipCue: true });
      } else {
        showPrepUI();
      }
    });
    const settings = await loadSettings();
    await initI18n(settings);
    applyDocumentI18n();
    bindFullscreenButton();
    await initTheme(settings);
    await startSession(settings);
  }
  init();
})();
