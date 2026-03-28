// ============================================================
// MASEDOG: Dead North — Save/Load System
// Uses LocalStorage. 3 manual slots + 1 autosave.
// ============================================================

import { getState, getRNG, newGame, dispatch, initStartingParty, PHASE } from './state.js';
import { createRNG, fastForward } from './random.js';

const SAVE_PREFIX = 'masedog_save_';
const SAVE_VERSION = 1;
const MAX_SLOTS = 3;

/**
 * Save game to a slot (0 = autosave, 1-3 = manual slots).
 */
export function saveGame(slot = 0) {
  const state = getState();
  const rng = getRNG();

  if (!state || !rng) return { success: false, message: 'No game in progress.' };

  const saveData = {
    version: SAVE_VERSION,
    timestamp: new Date().toISOString(),
    seed: rng.getSeed(),
    rngCalls: rng.getCallCount(),
    gameState: deepClone(state),
    slotName: slot === 0 ? 'Autosave' : `Slot ${slot}`,
  };

  try {
    const json = JSON.stringify(saveData);
    localStorage.setItem(`${SAVE_PREFIX}${slot}`, json);

    // Simple checksum for corruption detection
    const checksum = simpleHash(json);
    localStorage.setItem(`${SAVE_PREFIX}${slot}_check`, checksum.toString());

    return {
      success: true,
      message: slot === 0 ? 'Game autosaved.' : `Game saved to Slot ${slot}.`,
      size: json.length,
    };
  } catch (e) {
    return { success: false, message: `Save failed: ${e.message}` };
  }
}

/**
 * Load game from a slot.
 */
export function loadGame(slot = 0) {
  try {
    const json = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
    if (!json) return { success: false, message: 'No save found in this slot.' };

    // Checksum verification
    const storedCheck = localStorage.getItem(`${SAVE_PREFIX}${slot}_check`);
    if (storedCheck && simpleHash(json).toString() !== storedCheck) {
      return { success: false, message: 'Save file appears corrupted.' };
    }

    const saveData = JSON.parse(json);

    // Version migration
    if (saveData.version < SAVE_VERSION) {
      migrateSave(saveData);
    }

    // Restore RNG state
    newGame(saveData.seed);
    const rng = getRNG();
    fastForward(rng, saveData.rngCalls);

    // Restore full game state
    const gs = saveData.gameState;
    restoreState(gs);

    return {
      success: true,
      message: `Loaded ${saveData.slotName} (Week ${gs.calendar.week}).`,
    };
  } catch (e) {
    return { success: false, message: `Load failed: ${e.message}` };
  }
}

/**
 * Restore full game state from a save object.
 */
function restoreState(gs) {
  // We need to set all state fields. dispatch handles individual pieces,
  // but for a full restore we directly set everything then notify.
  const state = getState();

  // Copy all top-level properties
  Object.assign(state.meta, gs.meta);
  Object.assign(state.player, gs.player);
  state.party = gs.party;
  Object.assign(state.resources, gs.resources);
  Object.assign(state.journey, gs.journey);
  Object.assign(state.calendar, gs.calendar);
  Object.assign(state.weather, gs.weather);
  state.flags = { ...gs.flags };
  state.history = [...gs.history];
  state.cureCarrier = gs.cureCarrier;
  state.currentEvent = gs.currentEvent;
  state.currentSegmentIndex = gs.currentSegmentIndex;
  state.pressure = gs.pressure;
}

/**
 * Get info about all save slots (for display in UI).
 */
export function getSaveSlots() {
  const slots = [];

  for (let i = 0; i <= MAX_SLOTS; i++) {
    const json = localStorage.getItem(`${SAVE_PREFIX}${i}`);
    if (json) {
      try {
        const data = JSON.parse(json);
        const gs = data.gameState;
        slots.push({
          slot: i,
          name: data.slotName,
          timestamp: data.timestamp,
          week: gs.calendar.week,
          progress: Math.round((gs.journey.currentKm / gs.journey.totalKm) * 100),
          partySize: gs.party.filter(c => c.isAlive).length + 1,
          location: getLocationName(gs.journey.currentKm),
          exists: true,
        });
      } catch {
        slots.push({ slot: i, exists: false });
      }
    } else {
      slots.push({
        slot: i,
        name: i === 0 ? 'Autosave' : `Slot ${i}`,
        exists: false,
      });
    }
  }

  return slots;
}

/**
 * Delete a save slot.
 */
export function deleteSave(slot) {
  localStorage.removeItem(`${SAVE_PREFIX}${slot}`);
  localStorage.removeItem(`${SAVE_PREFIX}${slot}_check`);
}

/**
 * Check if any saves exist.
 */
export function hasSaves() {
  for (let i = 0; i <= MAX_SLOTS; i++) {
    if (localStorage.getItem(`${SAVE_PREFIX}${i}`)) return true;
  }
  return false;
}

/**
 * Autosave (called at end of each turn).
 */
export function autosave() {
  return saveGame(0);
}

/**
 * Migrate old save formats to current version.
 */
function migrateSave(saveData) {
  // Future migrations go here:
  // if (saveData.version === 1) { ... migrate to v2 ... }
  saveData.version = SAVE_VERSION;
}

function getLocationName(km) {
  if (km < 350) return 'Vancouver';
  if (km < 1000) return 'Kamloops';
  if (km < 1700) return 'Calgary';
  if (km < 2300) return 'Regina';
  if (km < 3100) return 'Winnipeg';
  if (km < 3800) return 'Thunder Bay';
  if (km < 4400) return 'Sudbury';
  return 'Ottawa';
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}
