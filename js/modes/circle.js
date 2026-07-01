import { activePhaseScaleProgress } from '../lib/motion.js';

/** @typedef {'inhale' | 'holdIn' | 'exhale' | 'holdOut'} BreathPhase */

const SCALE_MIN = 0.2;
const SCALE_RANGE = 0.8;

/**
 * @param {number} progress
 * @param {BreathPhase} phase
 * @param {number} durationSec
 */
function scaleForPhase(progress, phase, durationSec) {
  if (phase === 'holdIn') return 1;
  if (phase === 'holdOut') return SCALE_MIN;

  const animProgress = activePhaseScaleProgress(progress, durationSec);

  if (phase === 'inhale') {
    return SCALE_MIN + animProgress * SCALE_RANGE;
  }
  if (phase === 'exhale') {
    return 1 - animProgress * SCALE_RANGE;
  }
  return SCALE_MIN;
}

export class CircleMode {
  /** @type {HTMLElement | null} */ #root = null;
  /** @type {HTMLElement | null} */ #scaleEl = null;
  /** @type {HTMLElement | null} */ #circle = null;
  /** @type {number} */ #phaseDuration = 4;

  /** @param {HTMLElement} container */
  mount(container) {
    this.#root = document.createElement('div');
    this.#root.className = 'circle-mode';
    this.#root.innerHTML = `
      <div class="circle-mode__ring" aria-hidden="true"></div>
      <div class="circle-mode__scale">
        <div class="circle-mode__circle"></div>
      </div>
    `;
    this.#scaleEl = this.#root.querySelector('.circle-mode__scale');
    this.#circle = this.#root.querySelector('.circle-mode__circle');
    container.appendChild(this.#root);
  }

  unmount() {
    this.#root?.remove();
    this.#root = null;
    this.#scaleEl = null;
    this.#circle = null;
  }

  /** @param {boolean} active */
  setPrep(active) {
    this.#root?.classList.toggle('circle-mode--prep', active);
  }

  /** @param {BreathPhase} phase @param {number} duration */
  onPhaseChange(phase, duration) {
    this.#phaseDuration = duration;
    if (this.#root) this.#root.dataset.phase = phase;
    if (this.#circle) this.#circle.dataset.phase = phase;
  }

  /** @param {number} progress @param {BreathPhase} phase */
  onTick(progress, phase) {
    if (!this.#scaleEl) return;
    this.#scaleEl.style.transform = `scale(${scaleForPhase(progress, phase, this.#phaseDuration)})`;
  }
}
