// ============================================================
// MASEDOG: Dead North — Weather & Season System
// ============================================================

import { dispatch, getState, getRNG } from './state.js';
import { weightedPick, range } from './random.js';

const WEATHER_TABLES = {
  summer: [
    { type: 'clear', weight: 40, tempRange: [18, 32] },
    { type: 'rain', weight: 25, tempRange: [14, 22] },
    { type: 'storm', weight: 15, tempRange: [12, 20] },
    { type: 'heatwave', weight: 10, tempRange: [30, 38] },
    { type: 'fog', weight: 10, tempRange: [15, 22] },
  ],
  fall: [
    { type: 'clear', weight: 30, tempRange: [2, 15] },
    { type: 'rain', weight: 30, tempRange: [0, 10] },
    { type: 'fog', weight: 20, tempRange: [-2, 8] },
    { type: 'snow', weight: 10, tempRange: [-8, 0] },
    { type: 'storm', weight: 10, tempRange: [-5, 5] },
  ],
  winter: [
    { type: 'snow', weight: 30, tempRange: [-25, -5] },
    { type: 'blizzard', weight: 20, tempRange: [-40, -15] },
    { type: 'clear_cold', weight: 25, tempRange: [-30, -10] },
    { type: 'ice_storm', weight: 15, tempRange: [-20, -5] },
    { type: 'fog', weight: 10, tempRange: [-15, -5] },
  ],
  spring: [
    { type: 'rain', weight: 30, tempRange: [2, 12] },
    { type: 'clear', weight: 25, tempRange: [5, 18] },
    { type: 'mud', weight: 20, tempRange: [0, 10] },
    { type: 'flood', weight: 15, tempRange: [3, 12] },
    { type: 'fog', weight: 10, tempRange: [0, 8] },
  ],
};

const WEATHER_DESCRIPTIONS = {
  clear: 'The sky is clear and the air is calm.',
  rain: 'A steady rain falls, soaking everything.',
  storm: 'Thunder rolls across the sky. Lightning cracks in the distance.',
  heatwave: 'The heat is oppressive. Every step drains you.',
  fog: 'A thick fog blankets everything. Visibility is near zero.',
  snow: 'Snow falls steadily, blanketing the world in white silence.',
  blizzard: 'A howling blizzard tears at you. You can barely see your hand in front of your face.',
  clear_cold: 'The air is still and brutally cold. Every breath stings.',
  ice_storm: 'Freezing rain coats every surface in a deadly glaze of ice.',
  mud: 'Spring thaw has turned the ground to thick, boot-sucking mud.',
  flood: 'Meltwater has flooded the low areas. Finding dry passage is a challenge.',
};

/**
 * Generate weather for the current turn.
 * Returns a description string.
 */
export function generateWeather() {
  const state = getState();
  const rng = getRNG();
  const season = state.calendar.season;

  const table = WEATHER_TABLES[season] || WEATHER_TABLES.summer;
  const selected = weightedPick(rng, table);

  const temp = range(rng, selected.tempRange[0], selected.tempRange[1]);

  // Severity: 0 = mild, 1 = moderate, 2 = severe
  let severity = 0;
  if (['storm', 'blizzard', 'ice_storm', 'flood', 'heatwave'].includes(selected.type)) {
    severity = 2;
  } else if (['rain', 'snow', 'fog', 'mud'].includes(selected.type)) {
    severity = 1;
  }

  dispatch('SET_WEATHER', {
    current: selected.type,
    temperature: temp,
    severity,
  });

  return WEATHER_DESCRIPTIONS[selected.type] || 'The weather is unremarkable.';
}

/**
 * Get weather effects for display and gameplay.
 */
export function getWeatherEffects() {
  const state = getState();
  const w = state.weather;
  const effects = [];

  if (w.severity >= 2) {
    effects.push('Travel speed severely reduced');
  } else if (w.severity === 1) {
    effects.push('Travel speed slightly reduced');
  }

  if (w.temperature < -20) {
    effects.push('Extreme cold: risk of frostbite and exposure damage');
  } else if (w.temperature < -5) {
    effects.push('Cold: extra food needed to stay warm');
  } else if (w.temperature > 35) {
    effects.push('Extreme heat: extra water needed');
  }

  if (w.current === 'blizzard') {
    effects.push('Blizzard: cannot travel, must find shelter');
  }

  if (w.current === 'fog') {
    effects.push('Low visibility: stealth easier, navigation harder');
  }

  return effects;
}

/**
 * Apply weather damage to party (called during turn start).
 * Returns messages about weather effects.
 */
export function applyWeatherEffects() {
  const state = getState();
  const messages = [];

  if (state.weather.temperature < -25 && !state.flags.has_shelter) {
    dispatch('UPDATE_PLAYER_HEALTH', -10);
    messages.push('The extreme cold saps your strength.');
    for (const member of state.party.filter(c => c.isAlive)) {
      dispatch('UPDATE_CHARACTER', { id: member.id, changes: { health: -10 } });
    }
  } else if (state.weather.temperature < -10 && !state.flags.has_shelter) {
    dispatch('UPDATE_PLAYER_HEALTH', -5);
    messages.push('The cold bites at exposed skin.');
  }

  if (state.weather.current === 'heatwave') {
    dispatch('UPDATE_RESOURCES', { water: -Math.ceil(state.party.filter(c => c.isAlive).length * 0.5) });
    messages.push('The heatwave forces extra water consumption.');
  }

  return messages;
}
