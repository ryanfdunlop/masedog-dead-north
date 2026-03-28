// ============================================================
// MASEDOG: Dead North — Combat Resolution System
// ============================================================

import { dispatch, getState, getRNG } from './state.js';
import { roll, skillCheck, chance, pick, range } from './random.js';

/**
 * Resolve a combat encounter.
 * @param {Object} config - { zombieType, count, difficulty, canFlee }
 * @returns {Object} { outcome, messages, casualties, loot }
 *   outcome: 'victory' | 'flee' | 'defeat'
 */
export function resolveCombat(config) {
  const state = getState();
  const rng = getRNG();
  const { zombieType = 'shambler', count = 3, difficulty = 'normal', canFlee = true } = config;

  const messages = [];
  const casualties = [];
  let loot = [];

  const zombieStats = getZombieStats(zombieType);
  const partyStrength = calculatePartyStrength();
  const threatLevel = zombieStats.danger * count;

  messages.push(`${count} ${zombieStats.name}${count > 1 ? 's' : ''} ${zombieStats.attackDesc}`);

  // Combat is resolved in rounds. Each round:
  // 1. Party attacks — skill check per member
  // 2. Zombies attack — threat roll vs party defense
  // 3. Check if zombies defeated or party overwhelmed

  let zombiesRemaining = count;
  let rounds = 0;
  const maxRounds = 5;

  while (zombiesRemaining > 0 && rounds < maxRounds) {
    rounds++;

    // Party attacks
    const fighters = [state.player, ...state.party.filter(c => c.isAlive && c.health > 20)];
    for (const fighter of fighters) {
      const hasAmmo = state.resources.ammo > 0;
      const weaponBonus = hasAmmo ? 3 : 0;
      const check = skillCheck(rng, fighter.skills.combat + weaponBonus, zombieStats.defense);

      if (hasAmmo) dispatch('UPDATE_RESOURCES', { ammo: -1 });

      if (check.success || check.critSuccess) {
        zombiesRemaining--;
        if (check.critSuccess) {
          messages.push(`${fighter.name} lands a devastating blow!`);
          zombiesRemaining--; // Double kill on crit
        }
        zombiesRemaining = Math.max(0, zombiesRemaining);
      }
    }

    if (zombiesRemaining <= 0) break;

    // Zombies attack
    for (let i = 0; i < Math.min(zombiesRemaining, fighters.length); i++) {
      const target = fighters[i];
      const dodgeCheck = skillCheck(rng, target.skills.athletics, zombieStats.attack);

      if (!dodgeCheck.success) {
        const damage = range(rng, zombieStats.minDamage, zombieStats.maxDamage);

        if (target.isPlayer) {
          dispatch('UPDATE_PLAYER_HEALTH', -damage);
          messages.push(`A ${zombieStats.name} strikes you for ${damage} damage!`);
        } else {
          dispatch('UPDATE_CHARACTER', { id: target.id, changes: { health: -damage } });
          messages.push(`${target.name} takes ${damage} damage from a ${zombieStats.name}!`);
        }

        // Bite chance
        if (chance(rng, zombieStats.biteChance)) {
          dispatch('INFECT_CHARACTER', target.id);
          messages.push(`${target.name} has been BITTEN!`);
        }

        // Check for death
        const currentHealth = target.isPlayer ? state.player.health : target.health;
        if (currentHealth <= 0) {
          casualties.push(target.name);
          if (target.isPlayer) {
            return { outcome: 'defeat', messages, casualties, loot: [] };
          }
        }
      }
    }
  }

  if (zombiesRemaining <= 0) {
    messages.push(`The last ${zombieStats.name} falls. Silence returns.`);

    // Loot roll
    if (chance(rng, 40)) {
      const lootItems = rollCombatLoot(rng, zombieType);
      loot = lootItems;
      for (const item of lootItems) {
        messages.push(`Found: ${item.name} (${item.type}: +${item.amount})`);
        dispatch('UPDATE_RESOURCES', { [item.type]: item.amount });
      }
    }

    // Morale boost
    dispatch('UPDATE_PLAYER_MORALE', 5);

    // Pressure increases — player is doing well
    dispatch('UPDATE_PRESSURE', 3);

    return { outcome: 'victory', messages, casualties, loot };
  }

  // Combat dragged on — forced to flee or overwhelmed
  if (canFlee) {
    messages.push(`Too many! You break away and run.`);
    dispatch('UPDATE_PLAYER_MORALE', -10);
    dispatch('UPDATE_PRESSURE', -5);
    return { outcome: 'flee', messages, casualties, loot: [] };
  }

  messages.push(`Overwhelmed. There's no escape.`);
  dispatch('GAME_OVER', 'Overrun by the horde.');
  return { outcome: 'defeat', messages, casualties, loot: [] };
}

function getZombieStats(type) {
  const ZOMBIE_STATS = {
    shambler: {
      name: 'Shambler', attack: 8, defense: 6, danger: 1,
      minDamage: 5, maxDamage: 12, biteChance: 15,
      attackDesc: 'lumber toward you, arms outstretched, groaning.',
    },
    runner: {
      name: 'Runner', attack: 12, defense: 8, danger: 2,
      minDamage: 8, maxDamage: 18, biteChance: 25,
      attackDesc: 'sprint at you with terrifying speed!',
    },
    crawler: {
      name: 'Crawler', attack: 10, defense: 4, danger: 1.5,
      minDamage: 6, maxDamage: 15, biteChance: 30,
      attackDesc: 'drag themselves from under a vehicle, lunging at your legs!',
    },
    screamer: {
      name: 'Screamer', attack: 7, defense: 5, danger: 3,
      minDamage: 3, maxDamage: 8, biteChance: 10,
      attackDesc: 'lets out an ear-splitting shriek! More are coming!',
    },
    bloater: {
      name: 'Bloater', attack: 6, defense: 10, danger: 3,
      minDamage: 15, maxDamage: 30, biteChance: 5,
      attackDesc: 'waddles toward you, body distended and pulsing. Don\'t let it get close!',
    },
    stalker: {
      name: 'Stalker', attack: 14, defense: 12, danger: 4,
      minDamage: 10, maxDamage: 22, biteChance: 20,
      attackDesc: 'emerges from the shadows, eyes glowing with cold intelligence.',
    },
    hive_node: {
      name: 'Hive Node', attack: 5, defense: 18, danger: 5,
      minDamage: 5, maxDamage: 10, biteChance: 0,
      attackDesc: 'pulses with an eerie light. The zombies around it move in perfect coordination.',
    },
    wired: {
      name: 'Wired', attack: 16, defense: 14, danger: 5,
      minDamage: 15, maxDamage: 30, biteChance: 20,
      attackDesc: 'raises a weapon. It still remembers how to use it.',
    },
  };

  return ZOMBIE_STATS[type] || ZOMBIE_STATS.shambler;
}

function rollCombatLoot(rng, zombieType) {
  const lootPool = [
    { name: 'Canned food', type: 'food', amount: 2, weight: 30 },
    { name: 'Water bottle', type: 'water', amount: 2, weight: 25 },
    { name: 'Ammo box', type: 'ammo', amount: 5, weight: 20 },
    { name: 'Bandages', type: 'medicine', amount: 1, weight: 15 },
    { name: 'Scrap metal', type: 'scrap', amount: 3, weight: 10 },
  ];

  const items = [];
  const numItems = range(rng, 1, 2);
  for (let i = 0; i < numItems; i++) {
    const item = lootPool[Math.floor(rng.next() * lootPool.length)];
    items.push({ ...item });
  }
  return items;
}

function calculatePartyStrength() {
  const state = getState();
  let strength = state.player.skills.combat + (state.player.health / 20);

  for (const member of state.party.filter(c => c.isAlive)) {
    strength += member.skills.combat + (member.health / 25);
  }

  if (state.resources.ammo > 0) strength *= 1.3;

  return strength;
}

export { getZombieStats };
