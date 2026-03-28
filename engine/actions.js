// ============================================================
// MASEDOG: Dead North — Player-Directed Camp Actions
// Players choose what to do at camp instead of just continuing.
// ============================================================

import { dispatch, getState, getRNG, getLivingParty, getPartySize } from './state.js';
import { range, chance } from './random.js';
import { getCurrentRegion } from './events.js';

/**
 * Get available camp actions based on current state.
 */
export function getAvailableActions() {
  const state = getState();
  const region = getCurrentRegion(state.journey.currentKm);
  const isUrban = ['vancouver', 'alberta', 'manitoba', 'ontario_south', 'ottawa_approach'].includes(region);
  const isWinter = state.calendar.season === 'winter';

  const actions = [
    {
      id: 'scout_water',
      name: 'Scout for Water',
      icon: '💧',
      description: 'Search the area for clean water sources.',
      skill: 'survival',
      detail: isWinter ? 'Melt snow or find frozen streams.' : 'Look for streams, wells, or stored water.',
      available: true,
    },
    {
      id: 'forage_food',
      name: 'Forage for Food',
      icon: '🍖',
      description: 'Hunt, trap, or gather food in the area.',
      skill: 'survival',
      detail: isWinter ? 'Slim pickings in winter. Set snares or ice fish.' : 'Hunt game, gather berries, check abandoned stores.',
      available: true,
    },
    {
      id: 'scavenge_supplies',
      name: 'Scavenge Supplies',
      icon: '🔍',
      description: 'Search nearby buildings for useful items.',
      skill: 'perception',
      detail: isUrban ? 'Urban area — better chances of finding gear.' : 'Rural — less to find but also less competition.',
      available: true,
    },
    {
      id: 'medical_run',
      name: 'Medical Supply Run',
      icon: '💊',
      description: 'Search for medicine, bandages, and medical tools.',
      skill: 'medical',
      detail: isUrban ? 'Pharmacies and clinics might still have supplies.' : 'Check farmhouses and first aid kits.',
      available: true,
    },
    {
      id: 'train_skill',
      name: 'Train & Practice',
      icon: '📈',
      description: 'Spend time improving a skill through practice.',
      skill: null, // Player picks which skill
      detail: 'Choose a skill to practice. Gain XP toward leveling up.',
      available: true,
    },
    {
      id: 'rest_recover',
      name: 'Rest & Recover',
      icon: '🛏️',
      description: 'Take time to rest, tend wounds, and recover strength.',
      skill: null,
      detail: `Recover HP and morale. ${state.player.health < 50 ? 'You really need this.' : 'A calm moment in the storm.'}`,
      available: true,
    },
    {
      id: 'repair_equipment',
      name: 'Repair Equipment',
      icon: '🔧',
      description: 'Fix gear, reinforce defenses, build useful tools.',
      skill: 'mechanics',
      detail: state.resources.scrap > 0 ? `Use ${state.resources.scrap} scrap to craft and repair.` : 'No scrap available — limited repairs.',
      available: state.resources.scrap > 0 || true, // Always available but less effective without scrap
    },
    {
      id: 'scout_ahead',
      name: 'Scout Ahead',
      icon: '🗺️',
      description: 'Explore the route ahead to prepare for dangers.',
      skill: 'perception',
      detail: 'See what\'s coming next week. Knowledge is survival.',
      available: true,
    },
  ];

  return actions.filter(a => a.available);
}

/**
 * Resolve a camp action. Returns { messages[], effects, diceNeeded }.
 * If diceNeeded is true, the caller should trigger a dice roll first.
 */
export function resolveAction(actionId, diceResult = null) {
  const state = getState();
  const rng = getRNG();
  const messages = [];
  const effects = {};

  switch (actionId) {
    case 'scout_water': {
      if (diceResult) {
        if (diceResult.success) {
          const found = diceResult.critSuccess ? range(rng, 5, 8) : range(rng, 2, 5);
          effects.water = found;
          messages.push(`You found ${found} units of clean water!`);
          if (diceResult.critSuccess) messages.push('Jackpot — a pristine underground spring!');
        } else {
          const found = range(rng, 0, 1);
          effects.water = found;
          effects.health = -3;
          messages.push(found > 0
            ? 'Slim pickings. Found a little water but wasted energy searching.'
            : 'Came back empty-handed. The search exhausted you.');
        }
        effects.skillXP = { survival: diceResult.success ? 2 : 1 };
      }
      break;
    }

    case 'forage_food': {
      if (diceResult) {
        const isWinter = state.calendar.season === 'winter';
        const winterPenalty = isWinter ? -1 : 0;
        if (diceResult.success) {
          const found = Math.max(1, (diceResult.critSuccess ? range(rng, 4, 7) : range(rng, 2, 4)) + winterPenalty);
          effects.food = found;
          messages.push(`Brought back ${found} units of food.`);
          if (diceResult.critSuccess) messages.push('A deer! Enough meat to last days.');
          if (isWinter) messages.push('Slim pickings in winter, but you managed.');
        } else {
          effects.food = Math.max(0, range(rng, 0, 1) + winterPenalty);
          effects.morale = -3;
          messages.push('The hunt came up short. Wasted time and energy.');
          if (isWinter) messages.push('The cold made everything harder.');
        }
        effects.skillXP = { survival: diceResult.success ? 2 : 1 };
      }
      break;
    }

    case 'scavenge_supplies': {
      if (diceResult) {
        if (diceResult.success) {
          const lootTypes = ['food', 'water', 'ammo', 'scrap', 'medicine'];
          const numItems = diceResult.critSuccess ? 3 : 2;
          for (let i = 0; i < numItems; i++) {
            const type = lootTypes[Math.floor(rng.next() * lootTypes.length)];
            const amount = range(rng, 1, 3);
            effects[type] = (effects[type] || 0) + amount;
            messages.push(`Found: ${type} +${amount}`);
          }
          messages.unshift('Successful scavenge run!');
        } else {
          effects.scrap = range(rng, 0, 1);
          effects.morale = -2;
          messages.push('Picked through the ruins but found almost nothing useful.');
        }
        effects.skillXP = { perception: diceResult.success ? 2 : 1 };
      }
      break;
    }

    case 'medical_run': {
      if (diceResult) {
        if (diceResult.success) {
          const found = diceResult.critSuccess ? range(rng, 3, 5) : range(rng, 1, 3);
          effects.medicine = found;
          messages.push(`Found ${found} units of medicine!`);
          // Also heal sick party members
          const sick = getLivingParty().filter(c => c.status.includes('sick'));
          if (sick.length > 0 && found >= 1) {
            messages.push(`Used medicine to treat ${sick[0].name}.`);
            dispatch('UPDATE_CHARACTER', { id: sick[0].id, changes: { health: 10 } });
            sick[0].status = sick[0].status.filter(s => s !== 'sick');
          }
        } else {
          effects.medicine = range(rng, 0, 1);
          messages.push('The pharmacy was already cleaned out. Found bandages at best.');
        }
        effects.skillXP = { medical: diceResult.success ? 2 : 1 };
      }
      break;
    }

    case 'train_skill': {
      // This doesn't need a dice roll — always succeeds
      // The skill to train is passed via diceResult.trainSkill
      const trainSkill = diceResult?.trainSkill || 'survival';
      effects.skillXP = { [trainSkill]: 3 };
      effects.morale = 3;
      messages.push(`Spent time practicing ${trainSkill}. (+3 XP)`);
      messages.push('Every bit of practice could save your life out there.');
      break;
    }

    case 'rest_recover': {
      // No dice needed — always works
      const healAmount = range(rng, 10, 20);
      const moraleGain = range(rng, 5, 12);
      effects.health = healAmount;
      effects.morale = moraleGain;
      messages.push(`Rested and recovered ${healAmount} HP and ${moraleGain} morale.`);

      // Heal downed status
      if (state.player.downed) {
        messages.push('The rest helps you get back on your feet.');
      }

      // Party also heals
      for (const member of getLivingParty()) {
        dispatch('UPDATE_CHARACTER', { id: member.id, changes: { health: Math.round(healAmount * 0.6), morale: 5 } });
      }
      messages.push('The whole group benefits from the rest.');
      break;
    }

    case 'repair_equipment': {
      if (diceResult) {
        if (diceResult.success) {
          const scrapUsed = Math.min(state.resources.scrap, 2);
          effects.scrap = -scrapUsed;
          const ammoGained = scrapUsed > 0 ? range(rng, 2, 5) : range(rng, 0, 2);
          effects.ammo = ammoGained;
          messages.push(`Repaired gear and crafted ${ammoGained} ammo from scrap.`);
          if (diceResult.critSuccess) {
            effects.fuel = range(rng, 1, 2);
            messages.push('Also managed to siphon some fuel from a wrecked car.');
          }
        } else {
          effects.scrap = -1;
          messages.push('Burned through some scrap but the repairs didn\'t hold.');
        }
        effects.skillXP = { mechanics: diceResult.success ? 2 : 1 };
      }
      break;
    }

    case 'scout_ahead': {
      if (diceResult) {
        if (diceResult.success) {
          effects.morale = 5;
          effects.travel = 10; // Bonus travel from finding a better route
          messages.push('You scouted the route ahead and found a safer path.');
          if (diceResult.critSuccess) {
            messages.push('Even spotted a supply cache along the way. Marked it on the map.');
            effects.food = range(rng, 1, 2);
          }
          dispatch('SET_FLAG', { key: 'scouted_ahead', value: true });
        } else {
          effects.morale = -2;
          messages.push('The scouting run didn\'t reveal much. The road ahead is uncertain.');
        }
        effects.skillXP = { perception: diceResult.success ? 2 : 1 };
      }
      break;
    }
  }

  // Apply effects to game state
  const { health, morale, skillXP, ...resources } = effects;
  if (health) dispatch('UPDATE_PLAYER_HEALTH', health);
  if (morale) dispatch('UPDATE_PLAYER_MORALE', morale);

  const resourceChanges = {};
  for (const [key, value] of Object.entries(resources)) {
    if (['food', 'water', 'medicine', 'ammo', 'fuel', 'scrap', 'travel'].includes(key)) {
      if (key === 'travel') {
        dispatch('TRAVEL', value);
      } else {
        resourceChanges[key] = value;
      }
    }
  }
  if (Object.keys(resourceChanges).length > 0) {
    dispatch('UPDATE_RESOURCES', resourceChanges);
  }

  return { messages, effects, skillXP: effects.skillXP };
}

/**
 * Get the skill and DC for a camp action's dice roll.
 */
export function getActionDiceParams(actionId) {
  const state = getState();
  const region = getCurrentRegion(state.journey.currentKm);
  const isUrban = ['vancouver', 'alberta', 'manitoba', 'ontario_south', 'ottawa_approach'].includes(region);
  const isWinter = state.calendar.season === 'winter';

  const params = {
    scout_water: { skill: 'survival', dc: isWinter ? 12 : 8 },
    forage_food: { skill: 'survival', dc: isWinter ? 13 : 9 },
    scavenge_supplies: { skill: 'perception', dc: isUrban ? 9 : 12 },
    medical_run: { skill: 'medical', dc: isUrban ? 10 : 14 },
    repair_equipment: { skill: 'mechanics', dc: 10 },
    scout_ahead: { skill: 'perception', dc: 10 },
  };

  return params[actionId] || null;
}
