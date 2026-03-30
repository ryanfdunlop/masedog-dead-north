// ============================================================
// MASEDOG: Dead North — Crafting System
// Combine resources to craft useful items.
// Uses dice roll — success = craft, fail = lose some materials.
// ============================================================

import { dispatch, getState } from './state.js';

// Crypto-grade random for fair crafting rolls
function trueRandInt(min, max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return Math.floor((arr[0] / 4294967296) * (max - min + 1)) + min;
}

/**
 * All crafting recipes.
 * cost: resources consumed on attempt
 * result: resources gained on success
 * failRefund: percentage of cost returned on failure (0-100)
 * skill: which skill affects success (bonus to dice)
 * difficulty: zombie edge in VS roll (higher = harder)
 */
export const RECIPES = [
  {
    id: 'craft_ammo',
    name: 'Craft Ammo',
    icon: '🔫',
    description: 'Melt scrap into bullets. Requires scrap and fuel.',
    cost: { scrap: 3, fuel: 1 },
    result: { ammo: 5 },
    bonusResult: { ammo: 8 }, // On critical success
    failRefund: 50,
    skill: 'mechanics',
    difficulty: 1,
  },
  {
    id: 'craft_fuel',
    name: 'Siphon Fuel',
    icon: '⛽',
    description: 'Extract fuel from abandoned vehicles using scrap tubing.',
    cost: { scrap: 2 },
    result: { fuel: 3 },
    bonusResult: { fuel: 5 },
    failRefund: 50,
    skill: 'mechanics',
    difficulty: 1,
  },
  {
    id: 'craft_medicine',
    name: 'Make Medicine',
    icon: '💊',
    description: 'Combine herbs and supplies into basic medicine.',
    cost: { food: 2, water: 1 },
    result: { medicine: 2 },
    bonusResult: { medicine: 3 },
    failRefund: 30,
    skill: 'medical',
    difficulty: 2,
  },
  {
    id: 'craft_bandage',
    name: 'First Aid Kit',
    icon: '🩹',
    description: 'Craft bandages and antiseptic from cloth scraps.',
    cost: { scrap: 2 },
    result: { medicine: 1 },
    bonusResult: { medicine: 2 },
    failRefund: 50,
    skill: 'medical',
    difficulty: 0,
  },
  {
    id: 'craft_molotov',
    name: 'Molotov Cocktail',
    icon: '🍾',
    description: 'Fuel + scrap = fire bomb. Powerful one-use weapon.',
    cost: { fuel: 2, scrap: 1 },
    result: { ammo: 3 },
    bonusResult: { ammo: 5 },
    failRefund: 30,
    skill: 'survival',
    difficulty: 2,
  },
  {
    id: 'craft_trap',
    name: 'Build Zombie Trap',
    icon: '🪤',
    description: 'Set traps around camp for protection. Uses scrap.',
    cost: { scrap: 4 },
    result: { ammo: 2 },
    bonusResult: { ammo: 4, morale: 5 },
    failRefund: 50,
    skill: 'mechanics',
    difficulty: 1,
    special: 'Protects camp — fewer zombie encounters next turn.',
    setFlags: { camp_trapped: true },
  },
  {
    id: 'craft_shelter',
    name: 'Reinforce Shelter',
    icon: '🏠',
    description: 'Use scrap to fortify your camp against cold and attacks.',
    cost: { scrap: 5 },
    result: { morale: 10 },
    bonusResult: { morale: 15 },
    failRefund: 40,
    skill: 'mechanics',
    difficulty: 1,
    special: 'Blocks cold damage for 2 turns.',
    setFlags: { has_shelter: true },
  },
  {
    id: 'purify_water',
    name: 'Purify Water',
    icon: '💧',
    description: 'Boil and filter dirty water to make it safe.',
    cost: { fuel: 1 },
    result: { water: 4 },
    bonusResult: { water: 6 },
    failRefund: 50,
    skill: 'survival',
    difficulty: 0,
  },
  {
    id: 'cook_meal',
    name: 'Cook Proper Meal',
    icon: '🍲',
    description: 'Turn raw supplies into a real meal. Boosts morale.',
    cost: { food: 2, fuel: 1 },
    result: { morale: 12, health: 5 },
    bonusResult: { morale: 18, health: 10 },
    failRefund: 30,
    skill: 'survival',
    difficulty: 0,
  },
];

/**
 * Check if player can afford a recipe's cost.
 */
export function canAfford(recipe) {
  const state = getState();
  for (const [resource, amount] of Object.entries(recipe.cost)) {
    if ((state.resources[resource] || 0) < amount) return false;
  }
  return true;
}

/**
 * Get all available recipes (ones the player can afford).
 */
export function getAvailableRecipes() {
  return RECIPES.map(r => ({
    ...r,
    affordable: canAfford(r),
  }));
}

/**
 * Attempt to craft a recipe.
 * Consumes materials, then rolls dice for success.
 * Returns { success, messages, diceNeeded, recipe }
 */
export function attemptCraft(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return { success: false, messages: ['Recipe not found.'] };
  if (!canAfford(recipe)) return { success: false, messages: ['Not enough materials!'] };

  // Consume materials
  for (const [resource, amount] of Object.entries(recipe.cost)) {
    dispatch('UPDATE_RESOURCES', { [resource]: -amount });
  }

  // Return recipe info — the UI will handle the dice roll
  return {
    success: true,
    recipe,
    messages: [`Using: ${Object.entries(recipe.cost).map(([r, a]) => `${r} ×${a}`).join(', ')}`],
  };
}

/**
 * Apply craft result after dice roll.
 */
export function applyCraftResult(recipe, diceSuccess, critSuccess) {
  const messages = [];

  if (diceSuccess) {
    const result = critSuccess ? recipe.bonusResult : recipe.result;

    for (const [resource, amount] of Object.entries(result)) {
      if (resource === 'health') {
        dispatch('UPDATE_PLAYER_HEALTH', amount);
        messages.push(`Recovered ${amount} HP.`);
      } else if (resource === 'morale') {
        dispatch('UPDATE_PLAYER_MORALE', amount);
        messages.push(`Morale +${amount}.`);
      } else {
        dispatch('UPDATE_RESOURCES', { [resource]: amount });
        messages.push(`Crafted ${amount} ${resource}!`);
      }
    }

    if (critSuccess) {
      messages.unshift('PERFECT CRAFT! Bonus materials!');
    }

    // Set flags if recipe has them
    if (recipe.setFlags) {
      for (const [key, value] of Object.entries(recipe.setFlags)) {
        dispatch('SET_FLAG', { key, value });
      }
      if (recipe.special) messages.push(recipe.special);
    }

    // Award skill XP
    dispatch('ADD_SKILL_XP', { characterId: 'masedog', skill: recipe.skill, xp: 2 });

  } else {
    // FAILED — refund partial materials
    const refundPct = recipe.failRefund / 100;
    for (const [resource, amount] of Object.entries(recipe.cost)) {
      const refund = Math.floor(amount * refundPct);
      if (refund > 0) {
        dispatch('UPDATE_RESOURCES', { [resource]: refund });
        messages.push(`Salvaged ${refund} ${resource} from the failed attempt.`);
      }
    }
    messages.unshift('Craft failed! Materials partially wasted.');

    // Still get 1 XP for trying
    dispatch('ADD_SKILL_XP', { characterId: 'masedog', skill: recipe.skill, xp: 1 });
  }

  return messages;
}
