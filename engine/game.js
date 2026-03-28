// ============================================================
// MASEDOG: Dead North — Main Game Controller
// Orchestrates the game loop, turn flow, and screen transitions.
// ============================================================

import {
  newGame, getState, getRNG, dispatch, subscribe,
  initStartingParty, PHASE, hasReachedOttawa, getLivingParty, getPartySize,
} from './state.js';
import { tickResources, calculateTravel } from './resources.js';
import { generateWeather, applyWeatherEffects } from './weather.js';
import { tickInfections } from './infection.js';
import { selectEvent, registerEvents, resolveChoice, getCurrentRegion } from './events.js';
import { resolveCombat } from './combat.js';
import { COMBAT_EVENTS } from '../data/events/encounter-combat.js';
import { SCAVENGE_EVENTS } from '../data/events/encounter-scavenge.js';
import { SOCIAL_EVENTS } from '../data/events/encounter-social.js';
import { CRISIS_EVENTS } from '../data/events/encounter-crisis.js';
import { STORY_EVENTS } from '../data/events/encounter-story.js';
import { SPECIAL_EVENTS } from '../data/events/encounter-special.js';
import { PROLOGUE } from '../data/story/prologue.js';
import { getCurrentWaypoint, getNextWaypoint, getProgress } from '../data/locations.js';
import { getSeasonNarration, getMonthName } from '../data/seasons.js';
import { showScreen, updateHUD } from '../ui/screens.js';
import { typeText, showChoices, clearNarration, showResults } from '../ui/narrator.js';

// Register all events
registerEvents(COMBAT_EVENTS);
registerEvents(SCAVENGE_EVENTS);
registerEvents(SOCIAL_EVENTS);
registerEvents(CRISIS_EVENTS);
registerEvents(STORY_EVENTS);
registerEvents(SPECIAL_EVENTS);

let prologuePhase = 'intro';

/**
 * Start a new game.
 */
export function startNewGame(seed) {
  newGame(seed);
  initStartingParty();
  dispatch('SET_PHASE', PHASE.PROLOGUE);
  prologuePhase = 'intro';
  runPrologue();
}

/**
 * Run the prologue sequence.
 */
async function runPrologue() {
  const phase = PROLOGUE[prologuePhase];
  if (!phase) {
    // Prologue complete — start the game
    finishPrologue();
    return;
  }

  showScreen('game');

  if (phase.narration) {
    const text = Array.isArray(phase.narration) ? phase.narration.join('\n') : phase.narration;
    await typeText(text);
  }

  if (!phase.choices || phase.choices.length === 0) {
    // No choices — auto-advance to next phase
    const nextPhase = phase.next || getNextProloguePhase(prologuePhase);
    if (nextPhase === 'end') {
      finishPrologue();
    } else if (nextPhase) {
      prologuePhase = nextPhase;
      runPrologue();
    } else {
      finishPrologue();
    }
    return;
  }

  if (phase.choices) {
    showChoices(phase.choices, async (choice) => {
      const messages = [];

      // Handle skill check
      if (choice.skillCheck) {
        const state = getState();
        const rng = getRNG();
        const { skill, dc } = choice.skillCheck;
        const modifier = state.player.skills[skill] || 0;
        const { skillCheck: doCheck } = await import('./random.js');
        const result = doCheck(rng, modifier, dc);

        if (result.success || result.critSuccess) {
          if (choice.successText) messages.push(choice.successText);
          if (choice.successEffects) applyEffects(choice.successEffects);
        } else {
          if (choice.failureText) messages.push(choice.failureText);
          if (choice.failureEffects) applyEffects(choice.failureEffects);
        }
      } else {
        if (choice.resultText) messages.push(choice.resultText);
        if (choice.successText && !choice.skillCheck) messages.push(choice.successText);
      }

      // Apply base effects
      if (choice.effects) applyEffects(choice.effects);

      // Set flags
      if (choice.setFlags) {
        for (const [key, value] of Object.entries(choice.setFlags)) {
          dispatch('SET_FLAG', { key, value });
        }
      }

      // Show result
      if (messages.length > 0) {
        await showResults(messages);
      }

      // Advance prologue
      if (choice.next === 'end') {
        finishPrologue();
      } else if (choice.next) {
        prologuePhase = choice.next;
        runPrologue();
      }
    });
  }
}

function getNextProloguePhase(current) {
  const order = ['intro', 'phase1', 'phase2', 'phase3', 'phase3b', 'phase4', 'phase5'];
  const idx = order.indexOf(current);
  if (idx >= 0 && idx < order.length - 1) return order[idx + 1];
  return null;
}

function finishPrologue() {
  const state = getState();
  dispatch('ADD_HISTORY', 'Escaped Vancouver General Hospital.');

  // Add party members based on flags
  if (!state.flags.took_violet && !state.flags.cassidy_alone) {
    // Default: both come with you
    dispatch('SET_FLAG', { key: 'took_violet', value: true });
    dispatch('SET_FLAG', { key: 'took_cassidy', value: true });
  }

  // If doctor was found, he's already in party via initStartingParty
  if (state.flags.found_doctor || state.flags.has_doctor) {
    dispatch('SET_FLAG', { key: 'has_doctor', value: true });
  }

  dispatch('SET_PHASE', PHASE.TURN_START);
  runTurn();
}

/**
 * Main turn loop.
 */
async function runTurn() {
  const state = getState();

  // Check win condition
  if (hasReachedOttawa()) {
    dispatch('VICTORY');
    showVictoryScreen();
    return;
  }

  // Check game over
  if (state.meta.gameOver) {
    showGameOverScreen();
    return;
  }

  // Check turn limit
  if (state.meta.turnNumber >= state.meta.totalTurns) {
    dispatch('GAME_OVER', 'A year has passed. You didn\'t make it to Ottawa in time. The virus won.');
    showGameOverScreen();
    return;
  }

  // === TURN START ===
  dispatch('SET_PHASE', PHASE.TURN_START);
  dispatch('ADVANCE_TURN');

  const updatedState = getState();
  const messages = [];

  // Season flavor
  const seasonNarr = getSeasonNarration(updatedState.calendar.season, updatedState.calendar.month);
  if (seasonNarr) messages.push(seasonNarr);

  // Weather
  const weatherDesc = generateWeather();
  messages.push(weatherDesc);

  // Weather effects
  const weatherMsgs = applyWeatherEffects();
  messages.push(...weatherMsgs);

  // Resource consumption
  const resourceMsgs = tickResources();
  messages.push(...resourceMsgs);

  // Infection progression
  const infectionMsgs = tickInfections();
  messages.push(...infectionMsgs);

  // Travel
  const kmTraveled = calculateTravel();
  dispatch('TRAVEL', kmTraveled);

  const current = getCurrentWaypoint(getState().journey.currentKm);
  const next = getNextWaypoint(getState().journey.currentKm);
  const progress = getProgress(getState().journey.currentKm);
  messages.push(`Week ${updatedState.calendar.week} — ${getMonthName(updatedState.calendar.month)} ${updatedState.calendar.year}`);
  messages.push(`Traveled ${kmTraveled} km this week. Now near ${current.name}. Progress: ${progress}%`);
  if (next.id !== current.id) {
    messages.push(`Next waypoint: ${next.name} (${next.km - getState().journey.currentKm} km away)`);
  }

  // Update HUD
  updateHUD();

  // Show turn start summary
  showScreen('game');
  await typeText(messages.join('\n\n'));

  // Check for game over from resource/infection damage
  if (getState().meta.gameOver) {
    await showResults([getState().meta.gameOverReason]);
    showGameOverScreen();
    return;
  }

  // Check win
  if (hasReachedOttawa()) {
    dispatch('VICTORY');
    showVictoryScreen();
    return;
  }

  // === EVENT PHASE ===
  dispatch('SET_PHASE', PHASE.EVENT);
  const event = selectEvent();
  dispatch('SET_EVENT', event);

  await runEvent(event);
}

/**
 * Run an event — show narration and choices.
 */
async function runEvent(event) {
  const segment = event.segments ? event.segments[0] : event;

  if (event.title) {
    await typeText(`\n--- ${event.title} ---\n`);
  }

  const narration = segment.narration || event.narration || '';
  if (narration) {
    await typeText(narration);
  }

  const choices = segment.choices || event.choices || [];
  if (choices.length === 0) {
    // No choices — auto-continue
    dispatch('SET_PHASE', PHASE.TURN_END);
    showCampScreen();
    return;
  }

  dispatch('SET_PHASE', PHASE.CHOICE);
  showChoices(choices, async (choice) => {
    dispatch('SET_PHASE', PHASE.RESOLUTION);
    const messages = [];

    // Handle skill check
    if (choice.skillCheck) {
      const state = getState();
      const rng = getRNG();
      const { skill, dc } = choice.skillCheck;
      const modifier = state.player.skills[skill] || 0;
      const { skillCheck: doCheck } = await import('./random.js');
      const result = doCheck(rng, modifier, dc);

      messages.push(`[${skill.toUpperCase()} check: rolled ${result.roll} + ${modifier} = ${result.total} vs DC ${dc}]`);

      if (result.critSuccess) {
        messages.push('CRITICAL SUCCESS!');
      } else if (result.critFail) {
        messages.push('CRITICAL FAILURE!');
      }

      if (result.success || result.critSuccess) {
        if (choice.successText) messages.push(choice.successText);
        if (choice.successEffects) applyEffects(choice.successEffects);

        // Handle combat on success path
        if (choice.combat && !choice.failureCombat) {
          const combatResult = resolveCombat(choice.combat);
          messages.push(...combatResult.messages);
        }
      } else {
        if (choice.failureText) messages.push(choice.failureText);
        if (choice.failureEffects) applyEffects(choice.failureEffects);

        // Handle combat on failure
        if (choice.failureCombat) {
          const combatResult = resolveCombat(choice.failureCombat);
          messages.push(...combatResult.messages);
        }
      }
    } else if (choice.combat) {
      // Direct combat (no skill check)
      const combatResult = resolveCombat(choice.combat);
      messages.push(...combatResult.messages);
      if (choice.successText && combatResult.outcome === 'victory') {
        messages.push(choice.successText);
      }
    } else {
      if (choice.resultText) messages.push(choice.resultText);
    }

    // Apply base effects
    if (choice.effects) applyEffects(choice.effects);

    // Set flags
    if (choice.setFlags) {
      for (const [key, value] of Object.entries(choice.setFlags)) {
        dispatch('SET_FLAG', { key, value });
      }
    }

    // Add party member if specified
    if (choice.addPartyMember) {
      const { createCharacter } = await import('./state.js');
      const member = choice.addPartyMember;
      const newMember = createCharacter(
        member.id, member.name, member.age,
        member.skills, member.traits
      );
      dispatch('ADD_PARTY_MEMBER', newMember);
      messages.push(`${member.name} has joined your group.`);
    }

    // Adjust pressure
    const state = getState();
    if (state.resources.food > 10 && state.resources.water > 10 && getPartySize() >= 3) {
      dispatch('UPDATE_PRESSURE', 3);
    } else if (state.resources.food < 3 || state.resources.water < 3) {
      dispatch('UPDATE_PRESSURE', -5);
    }

    // Show results
    await showResults(messages);

    updateHUD();

    // Check game over
    if (getState().meta.gameOver) {
      showGameOverScreen();
      return;
    }

    // Move to camp/turn end
    dispatch('CLEAR_EVENT');
    dispatch('SET_PHASE', PHASE.TURN_END);
    showCampScreen();
  });
}

/**
 * Apply effects object to game state.
 */
function applyEffects(effects) {
  if (!effects) return;
  const { travel, health, morale, ...resources } = effects;
  if (travel) dispatch('TRAVEL', travel);
  if (health) dispatch('UPDATE_PLAYER_HEALTH', health);
  if (morale) dispatch('UPDATE_PLAYER_MORALE', morale);

  const resourceChanges = {};
  for (const [key, value] of Object.entries(resources)) {
    if (['food', 'water', 'medicine', 'ammo', 'fuel', 'scrap'].includes(key)) {
      resourceChanges[key] = value;
    }
  }
  if (Object.keys(resourceChanges).length > 0) {
    dispatch('UPDATE_RESOURCES', resourceChanges);
  }
}

/**
 * Show camp screen between turns — player can review status and continue.
 */
function showCampScreen() {
  showScreen('camp', {
    onContinue: () => runTurn(),
  });
}

/**
 * Show game over screen.
 */
function showGameOverScreen() {
  const state = getState();
  showScreen('gameover', {
    reason: state.meta.gameOverReason,
    stats: {
      turnsLived: state.meta.turnNumber,
      kmTraveled: state.journey.currentKm,
      partyLost: state.party.filter(c => !c.isAlive).length,
      history: state.history,
    },
    onRestart: () => startNewGame(),
  });
}

/**
 * Show victory screen.
 */
function showVictoryScreen() {
  const state = getState();
  const cureCarrier = state.party.find(c => c.isCureCarrier);
  const cureAlive = cureCarrier ? cureCarrier.isAlive : false;

  showScreen('victory', {
    cureAlive,
    cureCarrierName: cureCarrier?.name || 'Unknown',
    stats: {
      turnsLived: state.meta.turnNumber,
      kmTraveled: state.journey.currentKm,
      partySize: getPartySize(),
      history: state.history,
    },
    onRestart: () => startNewGame(),
  });
}

/**
 * Show title screen.
 */
export function showTitle() {
  showScreen('title', {
    onNewGame: (seed) => startNewGame(seed),
  });
}
