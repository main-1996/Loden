import { BreathingSession } from '../lib/breathing.js';
import {
  CIRCLE_COLOR_CROSSFADE_MS,
  CIRCLE_PREP_MS,
  HOME_PAGE,
  navigateTo,
  SKIP_HOME_ANIM_KEY,
} from '../lib/config.js';
import {
  applyDocumentI18n,
  bindLocaleStorageSync,
  getPhaseLabel,
  initI18n,
  t,
} from '../lib/i18n.js';
import { prefersReducedMotion } from '../lib/motion.js';
import { loadSettings } from '../lib/settings.js';
import { initTheme } from '../lib/theme.js';
import { getModeDefinition, getSessionPhases, resolveModeId } from '../modes/index.js';
import { bindFullscreenButton } from '../ui/fullscreen.js';

/** @typedef {import('../lib/breathing.js').BreathPhase} BreathPhase */

/** @param {number} ms */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param {HTMLElement | null} sessionEl */
function revealSession(sessionEl) {
  if (prefersReducedMotion()) {
    sessionEl?.classList.add('session--visible');
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sessionEl?.classList.add('session--visible');
    });
  });
}

/**
 * @param {HTMLElement} phaseEl
 * @param {BreathPhase} phase
 * @param {{ skipCue?: boolean }} [options]
 */
function updatePhaseUI(phaseEl, phase, { skipCue = false } = {}) {
  phaseEl.textContent = getPhaseLabel(phase);
  phaseEl.dataset.phase = phase;
  phaseEl.classList.remove('session__phase--cue', 'session__phase--cue-soft');

  if (prefersReducedMotion() || skipCue) return;

  void phaseEl.offsetWidth;
  const isHold = phase === 'holdIn' || phase === 'holdOut';
  phaseEl.classList.add(isHold ? 'session__phase--cue-soft' : 'session__phase--cue');
}

/** @param {HTMLButtonElement} stopBtn @param {() => void} [onStop] */
function bindStopButton(stopBtn, onStop) {
  stopBtn.addEventListener('click', () => {
    onStop?.();
    sessionStorage.setItem(SKIP_HOME_ANIM_KEY, '1');
    navigateTo(HOME_PAGE);
  });
}

async function init() {
  const sessionEl = document.querySelector('.session');
  const canvas = /** @type {HTMLElement} */ (document.querySelector('[data-canvas]'));
  const phaseEl = /** @type {HTMLElement} */ (document.querySelector('[data-phase]'));
  const stopBtn = /** @type {HTMLButtonElement} */ (document.querySelector('[data-stop]'));

  /** @type {BreathingSession | null} */
  let session = null;
  /** @type {InstanceType<ReturnType<typeof getModeDefinition>['Mode']> | null} */
  let mode = null;
  let skipNextPhaseCue = false;

  const prep = {
    introKey: 'session.intro',
    prepWaitMs: CIRCLE_COLOR_CROSSFADE_MS + CIRCLE_PREP_MS,
    prepPhase: /** @type {BreathPhase} */ ('inhale'),
    prepProgress: 0,
  };

  function showPrepUI() {
    phaseEl.textContent = t(prep.introKey);
    phaseEl.dataset.phase = prep.prepPhase;
    phaseEl.classList.remove('session__phase--cue', 'session__phase--cue-soft');
  }

  /** @param {InstanceType<ReturnType<typeof getModeDefinition>['Mode']>} activeMode */
  function showPrepVisual(activeMode) {
    activeMode.onPhaseChange(prep.prepPhase, 0);
    activeMode.onTick(prep.prepProgress, prep.prepPhase);
  }

  function teardownMode() {
    session?.stop();
    mode?.unmount();
    mode = null;
  }

  /** @param {string} modeId */
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

  /** @param {import('../lib/settings.js').UserSettings} settings */
  async function startSession(settings) {
    teardownMode();

    const modeId = resolveModeId(settings.preferredMode);
    const phases = getSessionPhases(modeId, settings.preferredPreset);

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
