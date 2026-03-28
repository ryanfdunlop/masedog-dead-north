// ============================================================
// MASEDOG: Dead North — Central Game State
// Single source of truth. All mutations go through dispatch().
// ============================================================

import { createRNG, generateSeed, pick, range } from './random.js';

// Game phases
export const PHASE = {
  TITLE: 'TITLE',
  PROLOGUE: 'PROLOGUE',
  TURN_START: 'TURN_START',
  EVENT: 'EVENT',
  CHOICE: 'CHOICE',
  RESOLUTION: 'RESOLUTION',
  MINIGAME: 'MINIGAME',
  TURN_END: 'TURN_END',
  CAMP: 'CAMP',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
};

// Infection stages
export const INFECTION = {
  HEALTHY: 'HEALTHY',
  BITTEN: 'BITTEN',
  INFECTED: 'INFECTED',
  TURNING: 'TURNING',
  TURNED: 'TURNED',
};

let gameState = null;
let rng = null;
let listeners = [];

/**
 * Subscribe to state changes. Returns unsubscribe function.
 */
export function subscribe(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function notify() {
  listeners.forEach(fn => fn(gameState));
}

/**
 * Get the current game state (read-only reference).
 */
export function getState() {
  return gameState;
}

/**
 * Get the RNG instance.
 */
export function getRNG() {
  return rng;
}

/**
 * Create a brand new game state.
 */
export function newGame(seed) {
  seed = seed || generateSeed();
  rng = createRNG(seed);

  gameState = {
    meta: {
      seed,
      phase: PHASE.TITLE,
      turnNumber: 0,
      totalTurns: 52,
      startDate: '2031-06-01',
      difficulty: 'normal',
      gameOver: false,
      gameOverReason: null,
      victory: false,
      turnsSinceCombat: 0,
    },

    player: createCharacter('masedog', 'MASEDOG', 20, {
      combat: 5, athletics: 6, perception: 5, medical: 2,
      mechanics: 3, charisma: 5, stealth: 4, survival: 4,
    }, ['determined', 'adaptable'], true),

    party: [],

    resources: {
      food: 8,
      water: 6,
      medicine: 2,
      ammo: 0,
      fuel: 0,
      scrap: 0,
    },

    journey: {
      currentKm: 0,
      totalKm: 4400,
      currentWaypointIndex: 0,
    },

    calendar: {
      week: 1,
      month: 6, // June
      season: 'summer',
      year: 2031,
    },

    weather: {
      current: 'clear',
      temperature: 20,
      severity: 0,
    },

    flags: {},
    history: [],
    cureCarrier: null,

    // Current event being processed
    currentEvent: null,
    currentSegmentIndex: 0,

    // Pressure system (hidden difficulty adjustment)
    pressure: 50, // 0-100, starts neutral
  };

  notify();
  return gameState;
}

/**
 * Create a character object.
 */
export function createCharacter(id, name, age, skills, traits, isPlayer = false) {
  return {
    id,
    name,
    age,
    health: isPlayer ? 100 : range(rng || { next: Math.random }, 60, 90),
    maxHealth: 100,
    morale: isPlayer ? 75 : range(rng || { next: Math.random }, 40, 70),
    skills: {
      combat: 3, athletics: 3, perception: 3, medical: 3,
      mechanics: 3, charisma: 3, stealth: 3, survival: 3,
      ...skills,
    },
    traits: traits || [],
    relationships: {},
    status: [],
    infectionState: INFECTION.HEALTHY,
    infectionTimer: 0,
    isAlive: true,
    isCureCarrier: false,
    isPlayer,
    joinedTurn: 0,
    equipment: { weapon: null, armor: null, accessory: null },
    downed: false,
    downedCount: 0,
    skillXP: {
      combat: 0, athletics: 0, perception: 0, medical: 0,
      mechanics: 0, charisma: 0, stealth: 0, survival: 0,
    },
  };
}

/**
 * Initialize the starting party (hospital characters).
 */
export function initStartingParty() {
  const violet = createCharacter('violet', 'Violet', 17, {
    combat: 2, athletics: 3, perception: 7, medical: 3,
    mechanics: 2, charisma: 6, stealth: 5, survival: 3,
  }, ['cautious', 'empathetic']);
  violet.health = 55; // She's sick
  violet.status.push('sick');

  const cassidy = createCharacter('cassidy', 'Cassidy', 13, {
    combat: 1, athletics: 5, perception: 6, medical: 1,
    mechanics: 4, charisma: 4, stealth: 7, survival: 2,
  }, ['resourceful', 'quick_learner']);
  cassidy.health = 85;

  const drReyes = createCharacter('dr_reyes', 'Dr. Reyes', 38, {
    combat: 3, athletics: 4, perception: 5, medical: 9,
    mechanics: 2, charisma: 6, stealth: 2, survival: 3,
  }, ['calm', 'leader']);
  drReyes.health = 90;

  // Randomly assign cure carrier (not MASEDOG)
  const candidates = [violet, cassidy, drReyes];
  const cureIndex = Math.floor(rng.next() * candidates.length);
  candidates[cureIndex].isCureCarrier = true;

  gameState.party = [violet, cassidy, drReyes];
  gameState.cureCarrier = candidates[cureIndex].id;

  notify();
}

/**
 * Dispatch a state change. All mutations go through here.
 */
export function dispatch(action, payload) {
  switch (action) {
    case 'SET_PHASE':
      gameState.meta.phase = payload;
      break;

    case 'ADVANCE_TURN':
      gameState.meta.turnNumber++;
      gameState.calendar.week++;
      updateCalendar();
      break;

    case 'SET_WEATHER':
      gameState.weather = { ...gameState.weather, ...payload };
      break;

    case 'UPDATE_RESOURCES':
      for (const [key, delta] of Object.entries(payload)) {
        if (gameState.resources[key] !== undefined) {
          gameState.resources[key] = Math.max(0, gameState.resources[key] + delta);
        }
      }
      break;

    case 'SET_RESOURCES':
      for (const [key, value] of Object.entries(payload)) {
        if (gameState.resources[key] !== undefined) {
          gameState.resources[key] = Math.max(0, value);
        }
      }
      break;

    case 'UPDATE_PLAYER_HEALTH':
      gameState.player.health = Math.max(0, Math.min(100, gameState.player.health + payload));
      if (gameState.player.health <= 0) {
        // DOWNED system — track total times downed, game over on 3rd
        gameState.player.downedCount++;
        if (gameState.player.downedCount >= 3) {
          // Third time down = death
          gameState.player.isAlive = false;
          gameState.meta.gameOver = true;
          gameState.meta.gameOverReason = 'MASEDOG couldn\'t get back up. The Dead North claims another soul.';
        } else {
          // Survive at 1 HP but downed
          gameState.player.health = 1;
          gameState.player.downed = true;
          gameState.player.morale = Math.max(0, gameState.player.morale - 20);
        }
      }
      // Recover from downed when health > 25
      if (gameState.player.health > 25 && gameState.player.downed) {
        gameState.player.downed = false;
      }
      break;

    case 'UPDATE_PLAYER_MORALE':
      gameState.player.morale = Math.max(0, Math.min(100, gameState.player.morale + payload));
      break;

    case 'UPDATE_CHARACTER': {
      const char = findCharacter(payload.id);
      if (char) {
        for (const [key, value] of Object.entries(payload.changes)) {
          if (key === 'health') {
            char.health = Math.max(0, Math.min(char.maxHealth, char.health + value));
            if (char.health <= 0) {
              char.isAlive = false;
              char.status.push('dead');
              addHistory(`${char.name} has died.`);
            }
          } else if (key === 'morale') {
            char.morale = Math.max(0, Math.min(100, char.morale + value));
          } else {
            char[key] = value;
          }
        }
      }
      break;
    }

    case 'ADD_PARTY_MEMBER':
      gameState.party.push(payload);
      payload.joinedTurn = gameState.meta.turnNumber;
      break;

    case 'REMOVE_PARTY_MEMBER': {
      const idx = gameState.party.findIndex(c => c.id === payload);
      if (idx !== -1) gameState.party.splice(idx, 1);
      break;
    }

    case 'SET_FLAG':
      gameState.flags[payload.key] = payload.value;
      break;

    case 'TRAVEL': {
      const km = payload;
      gameState.journey.currentKm = Math.min(
        gameState.journey.totalKm,
        gameState.journey.currentKm + km
      );
      break;
    }

    case 'SET_EVENT':
      gameState.currentEvent = payload;
      gameState.currentSegmentIndex = 0;
      break;

    case 'CLEAR_EVENT':
      gameState.currentEvent = null;
      gameState.currentSegmentIndex = 0;
      break;

    case 'NEXT_SEGMENT':
      gameState.currentSegmentIndex++;
      break;

    case 'ADD_SKILL_XP': {
      // payload: { characterId, skill, xp }
      const xpChar = payload.characterId === 'masedog'
        ? gameState.player
        : gameState.party.find(c => c.id === payload.characterId);
      if (xpChar && xpChar.skillXP && xpChar.skills[payload.skill] !== undefined) {
        xpChar.skillXP[payload.skill] = (xpChar.skillXP[payload.skill] || 0) + payload.xp;
        // Level up check: threshold = currentLevel * 3
        const threshold = xpChar.skills[payload.skill] * 3;
        if (xpChar.skillXP[payload.skill] >= threshold && xpChar.skills[payload.skill] < 10) {
          xpChar.skills[payload.skill]++;
          xpChar.skillXP[payload.skill] = 0;
        }
      }
      break;
    }

    case 'UPDATE_PRESSURE':
      gameState.pressure = Math.max(0, Math.min(100, gameState.pressure + payload));
      break;

    case 'GAME_OVER':
      gameState.meta.gameOver = true;
      gameState.meta.gameOverReason = payload || 'Your journey has ended.';
      gameState.meta.phase = PHASE.GAME_OVER;
      break;

    case 'VICTORY':
      gameState.meta.victory = true;
      gameState.meta.phase = PHASE.VICTORY;
      break;

    case 'ADD_HISTORY':
      gameState.history.push({
        turn: gameState.meta.turnNumber,
        week: gameState.calendar.week,
        text: payload,
      });
      break;

    case 'INFECT_CHARACTER': {
      const target = findCharacter(payload);
      if (target && target.infectionState === INFECTION.HEALTHY) {
        if (target.isCureCarrier) {
          target.infectionState = INFECTION.BITTEN;
          target.infectionTimer = 1; // Recovers fast — clue!
          addHistory(`${target.name} was bitten but seems to be fighting it off...`);
        } else {
          target.infectionState = INFECTION.BITTEN;
          target.infectionTimer = 5; // 5 turns to treat (was 3)
          addHistory(`${target.name} has been bitten!`);
        }
      }
      break;
    }

    default:
      console.warn(`Unknown action: ${action}`);
  }

  notify();
}

function findCharacter(id) {
  if (gameState.player.id === id) return gameState.player;
  return gameState.party.find(c => c.id === id);
}

function addHistory(text) {
  dispatch('ADD_HISTORY', text);
}

function updateCalendar() {
  const week = gameState.calendar.week;
  // Each month is ~4.33 weeks. Map week number to month.
  const monthOffset = Math.floor((week - 1) / 4.33);
  const month = ((6 - 1 + monthOffset) % 12) + 1; // Start from June (6)
  const year = monthOffset >= 7 ? 2032 : 2031; // Rolls over after December

  gameState.calendar.month = month;
  gameState.calendar.year = year;

  if (month >= 6 && month <= 8) gameState.calendar.season = 'summer';
  else if (month >= 9 && month <= 11) gameState.calendar.season = 'fall';
  else if (month === 12 || month <= 2) gameState.calendar.season = 'winter';
  else gameState.calendar.season = 'spring';
}

/**
 * Get all living party members (not including player).
 */
export function getLivingParty() {
  return gameState.party.filter(c => c.isAlive);
}

/**
 * Get total living party size (including player).
 */
export function getPartySize() {
  return 1 + getLivingParty().length;
}

/**
 * Check if journey is complete.
 */
export function hasReachedOttawa() {
  return gameState.journey.currentKm >= gameState.journey.totalKm;
}
