// ============================================================
// MASEDOG: Dead North — Event Pool Manager
// Filters, weights, and selects events each turn.
// ============================================================

import { getState, getRNG, dispatch } from './state.js';
import { weightedPick, chance, pick, range, roll, skillCheck } from './random.js';

// Event registries — populated by data files
const eventPool = [];
const firedOnceEvents = new Set();

/**
 * Register events into the pool (called by data files).
 */
export function registerEvents(events) {
  eventPool.push(...events);
}

/**
 * Select an event for the current turn.
 * Filters by eligibility, applies dynamic weighting, picks one.
 */
export function selectEvent() {
  const state = getState();
  const rng = getRNG();

  // 1. Filter eligible events
  const eligible = eventPool.filter(evt => isEligible(evt, state));

  if (eligible.length === 0) {
    return getFallbackEvent(state);
  }

  // 2. Apply dynamic weights
  const weighted = eligible.map(evt => ({
    ...evt,
    weight: calculateWeight(evt, state),
  }));

  // 3. Pick
  const selected = weightedPick(rng, weighted);

  // Track once-only events
  if (selected.onceOnly) {
    firedOnceEvents.add(selected.id);
  }

  return selected;
}

function isEligible(evt, state) {
  const { calendar, journey, flags, party, resources, meta } = state;

  // Once-only check
  if (evt.onceOnly && firedOnceEvents.has(evt.id)) return false;

  // Region check
  if (evt.region && !evt.region.includes(getCurrentRegion(journey.currentKm))) return false;

  // Season check
  if (evt.season && !evt.season.includes(calendar.season)) return false;

  // Turn range check
  if (evt.turnRange) {
    if (meta.turnNumber < evt.turnRange[0] || meta.turnNumber > evt.turnRange[1]) return false;
  }

  // Required flags
  if (evt.requirements?.flags) {
    for (const [key, value] of Object.entries(evt.requirements.flags)) {
      if (flags[key] !== value) return false;
    }
  }

  // Excluded flags
  if (evt.excludeIf?.flags) {
    for (const [key, value] of Object.entries(evt.excludeIf.flags)) {
      if (flags[key] === value) return false;
    }
  }

  // Min party size
  if (evt.requirements?.minPartySize) {
    const living = party.filter(c => c.isAlive).length + 1;
    if (living < evt.requirements.minPartySize) return false;
  }

  return true;
}

function calculateWeight(evt, state) {
  let weight = evt.baseWeight || 10;
  const { resources, player, pressure, calendar, meta } = state;

  // Resource-driven weighting
  if (evt.type === 'scavenge' && resources.food <= 3) weight *= 2.0;
  if (evt.type === 'scavenge' && resources.water <= 3) weight *= 1.8;
  if (evt.type === 'combat' && meta.turnsSinceCombat >= 3) weight *= 1.8;
  if (evt.type === 'social' && player.morale < 30) weight *= 1.5;

  // Story events get boosted when they're due
  if (evt.type === 'story') weight *= 2.5;
  if (evt.type === 'special') weight *= 3.0;

  // Pressure adjustment
  if (pressure > 65 && evt.difficulty === 'hard') weight *= 1.5;
  if (pressure < 35 && evt.type === 'scavenge') weight *= 1.8;

  // Season-driven
  if (calendar.season === 'winter' && evt.winterBoost) weight *= 2.0;

  return Math.max(1, weight);
}

/**
 * Get the current region based on km traveled.
 */
function getCurrentRegion(km) {
  if (km < 350) return 'vancouver';
  if (km < 700) return 'bc_interior';
  if (km < 1300) return 'alberta';
  if (km < 1900) return 'saskatchewan';
  if (km < 2500) return 'manitoba';
  if (km < 3500) return 'ontario_north';
  if (km < 4100) return 'ontario_south';
  return 'ottawa_approach';
}

export { getCurrentRegion };

/**
 * Fallback event if nothing is eligible (should rarely happen).
 */
function getFallbackEvent(state) {
  const rng = getRNG();
  const templates = [
    {
      id: 'fallback_travel',
      type: 'travel',
      title: 'On the Road',
      segments: [{
        narration: `Another week on the road. The landscape stretches endlessly ahead. ${state.calendar.season === 'winter' ? 'The cold gnaws at your bones.' : 'The silence is almost worse than the groaning.'}`,
        choices: [
          { text: 'Push hard — cover more ground', effects: { travel: 30, food: -1, morale: -3 } },
          { text: 'Take it slow — conserve energy', effects: { travel: 15, morale: 2 } },
          { text: 'Scout the area for supplies', effects: { travel: 5, food: range(rng, 0, 3), water: range(rng, 0, 2) } },
        ],
      }],
    },
    {
      id: 'fallback_quiet',
      type: 'travel',
      title: 'A Quiet Week',
      segments: [{
        narration: 'For once, nothing goes wrong. The group moves in exhausted silence, grateful for the reprieve.',
        choices: [
          { text: 'Rest and recover', effects: { travel: 10, health: 5, morale: 5 } },
          { text: 'Use the calm to forage', effects: { travel: 10, food: range(rng, 1, 4), water: range(rng, 1, 3) } },
        ],
      }],
    },
  ];

  return pick(rng, templates);
}

/**
 * Process a player choice from an event.
 * Applies effects, sets flags, returns narrative result.
 */
export function resolveChoice(choice) {
  const state = getState();
  const rng = getRNG();
  const messages = [];

  // Apply resource effects
  if (choice.effects) {
    const { travel, health, morale, food, water, medicine, ammo, fuel, scrap, ...rest } = choice.effects;
    if (travel) dispatch('TRAVEL', travel);
    if (health) dispatch('UPDATE_PLAYER_HEALTH', health);
    if (morale) dispatch('UPDATE_PLAYER_MORALE', morale);

    const resourceChanges = {};
    if (food) resourceChanges.food = food;
    if (water) resourceChanges.water = water;
    if (medicine) resourceChanges.medicine = medicine;
    if (ammo) resourceChanges.ammo = ammo;
    if (fuel) resourceChanges.fuel = fuel;
    if (scrap) resourceChanges.scrap = scrap;
    if (Object.keys(resourceChanges).length > 0) {
      dispatch('UPDATE_RESOURCES', resourceChanges);
    }
  }

  // Apply flag changes
  if (choice.setFlags) {
    for (const [key, value] of Object.entries(choice.setFlags)) {
      dispatch('SET_FLAG', { key, value });
    }
  }

  // Skill check if required
  if (choice.skillCheck) {
    const { skill, dc } = choice.skillCheck;
    const modifier = state.player.skills[skill] || 0;
    const result = skillCheck(rng, modifier, dc);
    choice._checkResult = result;
    messages.push(result.success
      ? `[${skill.toUpperCase()} check: ${result.total} vs DC ${dc} — Success!]`
      : `[${skill.toUpperCase()} check: ${result.total} vs DC ${dc} — Failed]`
    );
  }

  return messages;
}

/**
 * Process the result text for a choice (handles success/failure branching).
 */
export function getChoiceResultText(choice) {
  if (choice._checkResult) {
    return choice._checkResult.success
      ? (choice.successText || 'You succeed.')
      : (choice.failureText || 'You fail.');
  }
  return choice.resultText || '';
}
