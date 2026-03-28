// ============================================================
// MASEDOG: Dead North — Push-Your-Luck Camp Actions
// Roll dice to win resources. Keep rolling to win MORE —
// but fail and zombies come, costing you what you gained.
// Also: share/transfer resources between party members.
// ============================================================

import { dispatch, getState, getRNG, getLivingParty, getPartySize } from './state.js';
import { getCurrentRegion } from './events.js';

// Crypto-grade random: truly unpredictable, not seeded
function trueRandom() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / 4294967296; // 0 to 1
}

function trueRandInt(min, max) {
  return Math.floor(trueRandom() * (max - min + 1)) + min;
}

// ========== PUSH-YOUR-LUCK RESOURCE ACTIONS ==========

/**
 * The resource actions available for push-your-luck.
 * Each has a base difficulty and reward range.
 */
export function getResourceActions() {
  const state = getState();
  const season = state.calendar.season;
  const region = getCurrentRegion(state.journey.currentKm);
  const isUrban = ['vancouver', 'alberta', 'manitoba', 'ontario_south', 'ottawa_approach'].includes(region);
  const isWinter = season === 'winter';

  // VS MODE: Both sides roll 2d6. Zombie gets a small bonus.
  // zombieEdge = how many bonus points the zombie adds to their 2d6.
  // zombieEdge 0 = 50/50, +1 = ~40% player, +2 = ~30%, +3 = ~20%
  // Each consecutive roll adds +1 to zombie edge (they get alerted)
  // Roll 1: base edge. Roll 2: +1. Roll 3: +2. Roll 4: +3.
  return [
    {
      id: 'water',
      name: 'Scout for Water',
      icon: '💧',
      reward: { type: 'water', min: 2, max: isWinter ? 3 : 5 },
      zombieEdge: isWinter ? 2 : 0,
      description: isWinter ? 'Melt snow and ice for water.' : 'Search for streams or stored water.',
    },
    {
      id: 'food',
      name: 'Hunt & Forage',
      icon: '🍖',
      reward: { type: 'food', min: 2, max: isWinter ? 3 : 5 },
      zombieEdge: isWinter ? 2 : 0,
      description: isWinter ? 'Set traps in the snow.' : 'Hunt game or gather supplies.',
    },
    {
      id: 'medicine',
      name: 'Medical Supply Run',
      icon: '💊',
      reward: { type: 'medicine', min: 1, max: isUrban ? 3 : 2 },
      zombieEdge: isUrban ? 0 : 2,
      description: isUrban ? 'Raid a pharmacy or clinic.' : 'Search farmhouses for first aid.',
    },
    {
      id: 'ammo',
      name: 'Scavenge Ammo',
      icon: '🔫',
      reward: { type: 'ammo', min: 2, max: isUrban ? 6 : 3 },
      zombieEdge: isUrban ? 0 : 1,
      description: isUrban ? 'Check police cars, gun stores.' : 'Search hunting cabins.',
    },
    {
      id: 'scrap',
      name: 'Salvage Materials',
      icon: '🔧',
      reward: { type: 'scrap', min: 2, max: 5 },
      zombieEdge: 0,
      description: 'Pull apart wreckage for useful parts.',
    },
    {
      id: 'rest',
      name: 'Rest & Recover',
      icon: '🛏️',
      reward: { type: 'health', min: 8, max: 20 },
      zombieEdge: 0,
      description: 'Find shelter and rest. Recover HP.',
    },
  ];
}

/**
 * Roll for a single resource action.
 * Uses CRYPTO randomness — truly fair dice, no seed manipulation.
 * @returns { success, die1, die2, total, reward }
 */
export function rollForResource(action, rollNumber) {
  // Crypto random dice — 100% fair
  const die1 = trueRandInt(1, 6);
  const die2 = trueRandInt(1, 6);
  const total = die1 + die2;

  // In VS mode, success is determined by the VS dice roll in the UI.
  // This function just generates the reward amounts.
  // The zombieEdge + rollNumber escalation is handled in the UI.
  const success = true; // Always returns reward; UI decides if the roll won

  let reward = null;
  if (success) {
    const amount = trueRandInt(action.reward.min, action.reward.max);
    reward = { type: action.reward.type, amount };
  }

  return {
    success,
    die1,
    die2,
    total,
    target: 0,
    reward,
    critSuccess: die1 === 6 && die2 === 6,
    critFail: die1 === 1 && die2 === 1,
  };
}

/**
 * Calculate the penalty when a push-your-luck chain fails.
 * Lose a percentage of what you gained this session.
 * Worse penalties for failing later in the chain.
 */
export function calculateFailPenalty(gainedResources, rollNumber) {
  const lossPercent = Math.min(0.75, 0.3 + (rollNumber - 1) * 0.15);
  // Roll 1 fail: lose 30% of gains
  // Roll 2 fail: lose 45%
  // Roll 3 fail: lose 60%
  // Roll 4+: lose 75%

  const losses = {};
  for (const [type, amount] of Object.entries(gainedResources)) {
    const loss = Math.ceil(amount * lossPercent);
    if (loss > 0) losses[type] = loss;
  }

  // Also lose some existing resources (zombies ransack your bag)
  const state = getState();
  const extraLoss = Math.min(2, Math.floor(rollNumber / 2));
  if (extraLoss > 0 && state.resources.food > 0) losses.food = (losses.food || 0) + extraLoss;
  if (extraLoss > 0 && state.resources.water > 0) losses.water = (losses.water || 0) + extraLoss;

  // If player has nothing to lose, zombies inflict DAMAGE instead (10-25% HP)
  const totalLossValue = Object.values(losses).reduce((a, b) => a + b, 0);
  let healthDamage = 0;
  if (totalLossValue === 0) {
    // Random 10-25% of max health
    healthDamage = Math.round(state.player.maxHealth * (0.1 + trueRandom() * 0.15));
  }

  // Random chance zombies also hurt party members
  const living = getLivingParty();
  const partyDamage = [];
  if (rollNumber >= 2 && living.length > 0) {
    // Pick 1-2 random party members to take damage
    const numHurt = Math.min(living.length, trueRandInt(1, Math.min(3, rollNumber)));
    for (let i = 0; i < numHurt; i++) {
      const target = living[trueRandInt(0, living.length - 1)];
      const dmg = trueRandInt(5, 15);
      partyDamage.push({ id: target.id, name: target.name, damage: dmg });
    }
  }

  return { losses, lossPercent: Math.round(lossPercent * 100), healthDamage, partyDamage };
}

/**
 * Apply the gains from a successful push-your-luck session.
 */
export function applyGains(gainedResources) {
  const resourceChanges = {};
  const messages = [];

  for (const [type, amount] of Object.entries(gainedResources)) {
    if (type === 'health') {
      dispatch('UPDATE_PLAYER_HEALTH', amount);
      messages.push(`Recovered ${amount} HP.`);
    } else if (type === 'morale') {
      dispatch('UPDATE_PLAYER_MORALE', amount);
      messages.push(`Morale +${amount}.`);
    } else {
      resourceChanges[type] = amount;
      messages.push(`Gained ${amount} ${type}.`);
    }
  }

  if (Object.keys(resourceChanges).length > 0) {
    dispatch('UPDATE_RESOURCES', resourceChanges);
  }

  return messages;
}

/**
 * Apply the losses from a failed push-your-luck.
 * Subtracts from gained resources AND existing stockpile.
 */
export function applyLosses(losses) {
  const messages = [];

  for (const [type, amount] of Object.entries(losses)) {
    if (type === 'health') {
      dispatch('UPDATE_PLAYER_HEALTH', -amount);
      messages.push(`Lost ${amount} HP from the encounter!`);
    } else {
      dispatch('UPDATE_RESOURCES', { [type]: -amount });
      messages.push(`Lost ${amount} ${type}!`);
    }
  }

  // Morale hit from the failure
  dispatch('UPDATE_PLAYER_MORALE', -8);
  messages.push('Morale dropped from the failed scavenge.');

  return messages;
}

// ========== RESOURCE SHARING ==========

/**
 * Get shareable resources and party members for transfer UI.
 */
export function getShareOptions() {
  const state = getState();
  const living = getLivingParty();

  return {
    resources: { ...state.resources },
    player: {
      id: 'masedog',
      name: 'MASEDOG',
      health: state.player.health,
      maxHealth: state.player.maxHealth,
    },
    party: living.map(c => ({
      id: c.id,
      name: c.name,
      health: c.health,
      maxHealth: c.maxHealth,
      morale: c.morale,
      status: c.status,
      infectionState: c.infectionState,
    })),
  };
}

/**
 * Transfer health (emergency care) from one character to another.
 * The giver loses HP, the receiver gains it.
 */
export function transferHealth(fromId, toId, amount) {
  const state = getState();
  const messages = [];

  // Cap at giver's available HP (can't give below 20)
  const from = fromId === 'masedog' ? state.player : state.party.find(c => c.id === fromId);
  const maxGive = Math.max(0, from.health - 20);
  const actualAmount = Math.min(amount, maxGive);

  if (actualAmount <= 0) {
    return { success: false, messages: [`${from.name} doesn't have enough health to share.`] };
  }

  if (fromId === 'masedog') {
    dispatch('UPDATE_PLAYER_HEALTH', -actualAmount);
  } else {
    dispatch('UPDATE_CHARACTER', { id: fromId, changes: { health: -actualAmount } });
  }

  if (toId === 'masedog') {
    dispatch('UPDATE_PLAYER_HEALTH', actualAmount);
  } else {
    dispatch('UPDATE_CHARACTER', { id: toId, changes: { health: actualAmount } });
  }

  const fromName = from.name;
  const to = toId === 'masedog' ? state.player : state.party.find(c => c.id === toId);
  messages.push(`${fromName} shares ${actualAmount} HP with ${to.name}.`);
  messages.push(`${fromName}: -${actualAmount} HP | ${to.name}: +${actualAmount} HP`);

  // Morale boost from helping
  dispatch('UPDATE_PLAYER_MORALE', 3);
  messages.push('The act of helping boosts team morale.');

  return { success: true, messages };
}

/**
 * Give medicine to a specific party member.
 */
export function useMedicineOn(targetId) {
  const state = getState();
  if (state.resources.medicine <= 0) {
    return { success: false, messages: ['No medicine available!'] };
  }

  const target = targetId === 'masedog' ? state.player : state.party.find(c => c.id === targetId);
  if (!target) return { success: false, messages: ['Character not found.'] };

  dispatch('UPDATE_RESOURCES', { medicine: -1 });

  const healAmount = 20;
  if (targetId === 'masedog') {
    dispatch('UPDATE_PLAYER_HEALTH', healAmount);
  } else {
    dispatch('UPDATE_CHARACTER', { id: targetId, changes: { health: healAmount } });
  }

  const messages = [`Used medicine on ${target.name}. Healed ${healAmount} HP.`];

  // Clear sick status
  if (target.status.includes('sick')) {
    target.status = target.status.filter(s => s !== 'sick');
    messages.push(`${target.name} is no longer sick.`);
  }

  return { success: true, messages };
}

// ========== TRAINING ==========

/**
 * Train a specific skill. Always succeeds, awards XP.
 */
export function trainSkill(skillName) {
  dispatch('ADD_SKILL_XP', { characterId: 'masedog', skill: skillName, xp: 3 });

  const state = getState();
  const currentLevel = state.player.skills[skillName] || 0;
  const currentXP = state.player.skillXP?.[skillName] || 0;
  const threshold = currentLevel * 3;

  return {
    messages: [
      `Practiced ${skillName}. (+3 XP)`,
      `${skillName}: Level ${currentLevel} — ${currentXP}/${threshold} XP to next level`,
      'Every bit of training could save your life.',
    ],
  };
}
