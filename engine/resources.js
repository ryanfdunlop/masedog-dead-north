// ============================================================
// MASEDOG: Dead North — Resource Consumption System
// Ticks every turn start. Party eats, drinks, uses fuel.
// ============================================================

import { dispatch, getState, getPartySize, getLivingParty } from './state.js';
import { getRNG } from './state.js';
import { chance } from './random.js';

/**
 * Process resource consumption for a single turn.
 * Returns an array of consequence messages.
 */
export function tickResources() {
  const state = getState();
  const rng = getRNG();
  const partySize = getPartySize();
  const season = state.calendar.season;
  const messages = [];

  // Food consumption
  let foodCost = partySize;
  if (season === 'winter') foodCost = Math.ceil(partySize * 1.5);
  if (state.resources.food >= foodCost) {
    dispatch('UPDATE_RESOURCES', { food: -foodCost });
  } else {
    // Not enough food — starvation (softened: -3 per deficit, max -15)
    const deficit = foodCost - state.resources.food;
    dispatch('SET_RESOURCES', { food: 0 });
    messages.push(`Not enough food! The group goes hungry.`);
    const foodDmg = Math.min(15, 3 * deficit);
    dispatch('UPDATE_PLAYER_HEALTH', -foodDmg);
    dispatch('UPDATE_PLAYER_MORALE', -5);
    for (const member of getLivingParty()) {
      dispatch('UPDATE_CHARACTER', { id: member.id, changes: { health: -foodDmg, morale: -5 } });
    }
  }

  // Water consumption
  let waterCost = partySize;
  if (season === 'summer') waterCost = Math.ceil(partySize * 1.3);
  if (state.resources.water >= waterCost) {
    dispatch('UPDATE_RESOURCES', { water: -waterCost });
  } else {
    const deficit = waterCost - state.resources.water;
    dispatch('SET_RESOURCES', { water: 0 });
    messages.push(`Running low on water! Dehydration sets in.`);
    const waterDmg = Math.min(15, 4 * deficit);
    dispatch('UPDATE_PLAYER_HEALTH', -waterDmg);
    dispatch('UPDATE_PLAYER_MORALE', -6);
    for (const member of getLivingParty()) {
      dispatch('UPDATE_CHARACTER', { id: member.id, changes: { health: -waterDmg, morale: -6 } });
    }
  }

  // Fuel consumption (if travelling by vehicle)
  if (state.flags.has_vehicle && state.resources.fuel > 0) {
    dispatch('UPDATE_RESOURCES', { fuel: -1 });
    if (state.resources.fuel <= 1) {
      messages.push(`The vehicle sputters... out of fuel. You'll have to walk.`);
      dispatch('SET_FLAG', { key: 'has_vehicle', value: false });
    }
  }

  // Morale decay if things are grim
  if (state.resources.food <= 2) {
    dispatch('UPDATE_PLAYER_MORALE', -3);
    messages.push(`Food supplies are critically low.`);
  }
  if (state.resources.water <= 2) {
    dispatch('UPDATE_PLAYER_MORALE', -3);
    messages.push(`Water is almost gone.`);
  }

  // Random sickness check (outside of zombie infection)
  if (season === 'winter' && chance(rng, 15)) {
    const living = getLivingParty();
    if (living.length > 0) {
      const unlucky = living[Math.floor(rng.next() * living.length)];
      if (!unlucky.status.includes('sick')) {
        unlucky.status.push('sick');
        dispatch('UPDATE_CHARACTER', { id: unlucky.id, changes: { health: -10 } });
        messages.push(`${unlucky.name} has fallen ill from the cold.`);
      }
    }
  }

  // Medicine heals sick characters
  if (state.resources.medicine > 0) {
    const sick = getLivingParty().filter(c => c.status.includes('sick'));
    for (const char of sick) {
      if (state.resources.medicine > 0) {
        dispatch('UPDATE_RESOURCES', { medicine: -1 });
        char.status = char.status.filter(s => s !== 'sick');
        dispatch('UPDATE_CHARACTER', { id: char.id, changes: { health: 10 } });
        messages.push(`Used medicine to treat ${char.name}.`);
      }
    }
  }

  return messages;
}

/**
 * Calculate travel distance for this turn.
 * Returns km traveled.
 */
export function calculateTravel() {
  const state = getState();
  const season = state.calendar.season;
  const weather = state.weather.current;

  let baseKm = 85; // ~85km per week on foot

  // Vehicle doubles travel speed
  if (state.flags.has_vehicle && state.resources.fuel > 0) baseKm = 180;

  // Season modifiers
  if (season === 'winter') baseKm *= 0.5;
  if (season === 'spring' && weather === 'rain') baseKm *= 0.7;

  // Weather modifiers
  if (weather === 'blizzard') baseKm *= 0.3;
  if (weather === 'storm') baseKm *= 0.6;
  if (weather === 'fog') baseKm *= 0.8;

  // Low morale slows travel
  if (state.player.morale < 20) baseKm *= 0.7;

  // Injuries slow travel
  const injured = getLivingParty().filter(c => c.health < 40).length;
  if (injured > 0) baseKm *= (1 - injured * 0.1);

  return Math.round(baseKm);
}

/**
 * Get resource status summary for display.
 */
export function getResourceStatus() {
  const state = getState();
  const r = state.resources;
  const partySize = getPartySize();

  return {
    food: { amount: r.food, daysLeft: partySize > 0 ? Math.floor(r.food / partySize) : 0, critical: r.food <= partySize },
    water: { amount: r.water, daysLeft: partySize > 0 ? Math.floor(r.water / partySize) : 0, critical: r.water <= partySize },
    medicine: { amount: r.medicine, critical: r.medicine === 0 },
    ammo: { amount: r.ammo, critical: r.ammo <= 3 },
    fuel: { amount: r.fuel, critical: r.fuel === 0 },
    scrap: { amount: r.scrap },
  };
}
