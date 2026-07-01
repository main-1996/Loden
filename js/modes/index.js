import { PRESETS, resolvePresetId } from '../lib/breathing.js';
import { SESSION_PAGE } from '../lib/config.js';
import { DEFAULT_MODE_ID } from '../lib/settings.js';
import { CircleMode } from './circle.js';

export const MODES = {
  circle: {
    id: 'circle',
    Mode: CircleMode,
    available: true,
    supportsPresets: true,
    sessionPage: SESSION_PAGE,
  },
  wave: {
    id: 'wave',
    available: false,
    supportsPresets: true,
  },
};

export const MODE_LIST = Object.values(MODES);

/** @param {string} modeId */
export function resolveModeId(modeId) {
  return MODES[modeId]?.available ? modeId : DEFAULT_MODE_ID;
}

/** @param {string} modeId */
export function getModeDefinition(modeId) {
  return MODES[resolveModeId(modeId)];
}

/** @param {string} modeId @param {string} presetId */
export function getSessionPhases(modeId, presetId) {
  const def = getModeDefinition(modeId);
  if (def.supportsPresets) {
    return PRESETS[resolvePresetId(presetId)].phases;
  }
  return PRESETS.relax.phases;
}

/** @param {string} modeId */
export function getSessionPage(modeId) {
  return getModeDefinition(modeId).sessionPage ?? SESSION_PAGE;
}
