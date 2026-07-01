/** @typedef {'inhale' | 'holdIn' | 'exhale' | 'holdOut'} BreathPhase */
/** @typedef {{ inhale: number, holdIn: number, exhale: number, holdOut: number }} BreathPhases */

export const PRESETS = {
  relax: { id: 'relax', phases: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 } },
  sleep: { id: 'sleep', phases: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 } },
  quick: { id: 'quick', phases: { inhale: 4, holdIn: 0, exhale: 8, holdOut: 0 } },
};

export const PRESET_IDS = Object.keys(PRESETS);
export const DEFAULT_PRESET_ID = 'relax';

/** @param {string} presetId */
export function resolvePresetId(presetId) {
  return PRESETS[presetId] ? presetId : DEFAULT_PRESET_ID;
}

const PHASE_ORDER = /** @type {const} */ (['inhale', 'holdIn', 'exhale', 'holdOut']);

export class BreathingSession {
  /** @type {BreathPhases} */ #phases;
  /** @type {number} */ #phaseIndex = 0;
  /** @type {number} */ #phaseElapsed = 0;
  /** @type {'idle' | 'running'} */ #status = 'idle';
  /** @type {number | null} */ #rafId = null;
  /** @type {number} */ #lastTimestamp = 0;
  /** @type {(phase: BreathPhase, duration: number) => void} */ #onPhaseChange = () => {};
  /** @type {(progress: number, phase: BreathPhase) => void} */ #onTick = () => {};

  /** @param {BreathPhases} phases */
  constructor(phases) {
    this.#phases = phases;
  }

  get currentPhase() { return PHASE_ORDER[this.#phaseIndex]; }
  get status() { return this.#status; }

  onPhaseChange(cb) { this.#onPhaseChange = cb; }
  onTick(cb) { this.#onTick = cb; }

  start() {
    if (this.#status === 'running') return;
    this.#status = 'running';
    this.#phaseIndex = 0;
    this.#phaseElapsed = 0;
    this.#lastTimestamp = 0;
    this.#skipZeroDurationPhases();
    this.#emitPhaseChange();
    this.#emitTick(0);
    this.#scheduleFrame();
  }

  stop() {
    this.#status = 'idle';
    this.#cancelFrame();
    this.#phaseIndex = 0;
    this.#phaseElapsed = 0;
  }

  #scheduleFrame() {
    this.#cancelFrame();
    this.#rafId = requestAnimationFrame((ts) => this.#frame(ts));
  }

  #cancelFrame() {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  /** @param {number} timestamp */
  #frame(timestamp) {
    if (this.#status !== 'running') return;
    if (this.#lastTimestamp === 0) this.#lastTimestamp = timestamp;

    this.#phaseElapsed += (timestamp - this.#lastTimestamp) / 1000;
    this.#lastTimestamp = timestamp;

    const phase = this.currentPhase;
    const duration = this.#phases[phase];

    if (duration <= 0) {
      this.#advancePhase();
      this.#scheduleFrame();
      return;
    }

    const progress = Math.min(this.#phaseElapsed / duration, 1);
    this.#emitTick(progress);

    if (this.#phaseElapsed >= duration) this.#advancePhase();
    if (this.#status === 'running') this.#scheduleFrame();
  }

  #advancePhase() {
    this.#phaseElapsed = 0;
    this.#phaseIndex += 1;

    if (this.#phaseIndex >= PHASE_ORDER.length) {
      this.#phaseIndex = 0;
    }

    this.#skipZeroDurationPhases();
    this.#emitPhaseChange();
    this.#emitTick(0);
  }

  #skipZeroDurationPhases() {
    for (let i = 0; i < PHASE_ORDER.length; i++) {
      if (this.#phaseIndex >= PHASE_ORDER.length) {
        this.#phaseIndex = 0;
      }
      if (this.#phases[this.currentPhase] > 0) return;
      this.#phaseIndex += 1;
    }
    if (this.#phaseIndex >= PHASE_ORDER.length) {
      this.#phaseIndex = 0;
    }
  }

  #emitPhaseChange() {
    const phase = this.currentPhase;
    this.#onPhaseChange(phase, this.#phases[phase]);
  }

  /** @param {number} progress */
  #emitTick(progress) {
    this.#onTick(progress, this.currentPhase);
  }
}
