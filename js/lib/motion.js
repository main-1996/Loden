import { CIRCLE_COLOR_CROSSFADE_MS } from './config.js';

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const COLOR_LEAD_SEC = CIRCLE_COLOR_CROSSFADE_MS / 1000;
export const PAUSE_LEAD_SEC = 0.15;

const MAX_LEAD_RATIO = 0.35;

/** @param {number} t */
export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/**
 * @param {number} wallProgress
 * @param {number} durationSec
 */
export function activePhaseScaleProgress(wallProgress, durationSec) {
  if (durationSec <= 0) return wallProgress >= 1 ? 1 : 0;

  if (prefersReducedMotion()) {
    const leadFrac = Math.min(0.12 / durationSec, 0.12);
    if (wallProgress <= leadFrac) return 0;
    return (wallProgress - leadFrac) / (1 - leadFrac);
  }

  const leadSec = COLOR_LEAD_SEC + PAUSE_LEAD_SEC;
  const leadFrac = Math.min(leadSec / durationSec, MAX_LEAD_RATIO);

  if (wallProgress <= leadFrac) return 0;

  const animT = (wallProgress - leadFrac) / (1 - leadFrac);
  return easeInOut(Math.min(1, Math.max(0, animT)));
}
