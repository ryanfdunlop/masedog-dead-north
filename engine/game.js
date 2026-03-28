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
import { selectEvent, registerEvents, getCurrentRegion } from './events.js';
import { resolveCombat } from './combat.js';
import { autosave } from './save.js';
import { COMBAT_EVENTS } from '../data/events/encounter-combat.js';
import { SCAVENGE_EVENTS } from '../data/events/encounter-scavenge.js';
import { SOCIAL_EVENTS } from '../data/events/encounter-social.js';
import { CRISIS_EVENTS } from '../data/events/encounter-crisis.js';
import { STORY_EVENTS } from '../data/events/encounter-story.js';
import { SPECIAL_EVENTS } from '../data/events/encounter-special.js';
import { NEW_COMBAT_EVENTS, NEW_SCAVENGE_EVENTS, NEW_SOCIAL_EVENTS, NEW_CRISIS_EVENTS, NEW_STORY_EVENTS } from '../data/events/encounter-new.js';
import { EXPANSION_COMBAT, EXPANSION_SCAVENGE, EXPANSION_SOCIAL, EXPANSION_CRISIS, EXPANSION_TRAVEL, EXPANSION_WINTER } from '../data/events/encounter-expansion.js';
import { CHAPTER_1_EVENTS } from '../data/story/chapter-1.js';
import { CHAPTER_2_EVENTS } from '../data/story/chapter-2.js';
import { CHAPTER_3_EVENTS } from '../data/story/chapter-3.js';
import { CHAPTER_4_EVENTS } from '../data/story/chapter-4.js';
import { CHAPTER_5_EVENTS } from '../data/story/chapter-5.js';
import { CHAPTER_6_EVENTS } from '../data/story/chapter-6.js';
import { EPILOGUE_EVENTS } from '../data/story/epilogue.js';
import { MINIGAME_EVENTS } from '../data/events/encounter-minigame.js';
import { PROLOGUE } from '../data/story/prologue.js';
import { getCurrentWaypoint, getNextWaypoint, getProgress } from '../data/locations.js';
import { getSeasonNarration, getMonthName } from '../data/seasons.js';
import { showScreen, updateHUD } from '../ui/screens.js';
import { typeText, showChoices, clearNarration, showResults } from '../ui/narrator.js';
import { initTransitions, fadeTransition, damageFlash, screenShake, glitchEffect } from '../ui/transitions.js';
import { initEffects, setWeatherEffect, applyDayNightTint, setLocationTheme } from '../ui/effects.js';
import { initScenes, setScene, getSceneForContext } from '../ui/scenes.js';
import { triggerVisual } from '../ui/jumpscares.js';
import {
  initAudio, resumeAudio, playUIClick, playSuccess, playFailure,
  playZombieGroan, playShotgun, playHeartbeat, playScreamerShriek,
  startAmbience, crossfadeAmbience, getAmbienceForState, stopAmbience,
} from './audio.js';
import { ZombieEscape } from '../minigames/zombie-escape.js';
import { Scavenge } from '../minigames/scavenge.js';
import { Hunting } from '../minigames/hunting.js';
import { RiverCrossing } from '../minigames/river-crossing.js';
import { initDice, rollDice, rollDiceVS, calculateSuccessChance, convertDCtoTarget, getRollCount } from '../ui/dice.js';
import { initSoundbank, loadSounds, sbZombieGroan, sbHit, sbRiser, sbWhoosh, sbGhostNoise, sbStartDrone, sbStartSoundscape, isLoaded } from './soundbank.js';
// Actions are handled by ui/screens.js directly now

// Register all events
registerEvents(COMBAT_EVENTS);
registerEvents(SCAVENGE_EVENTS);
registerEvents(SOCIAL_EVENTS);
registerEvents(CRISIS_EVENTS);
registerEvents(STORY_EVENTS);
registerEvents(SPECIAL_EVENTS);
registerEvents(NEW_COMBAT_EVENTS);
registerEvents(NEW_SCAVENGE_EVENTS);
registerEvents(NEW_SOCIAL_EVENTS);
registerEvents(NEW_CRISIS_EVENTS);
registerEvents(NEW_STORY_EVENTS);
registerEvents(EXPANSION_COMBAT);
registerEvents(EXPANSION_SCAVENGE);
registerEvents(EXPANSION_SOCIAL);
registerEvents(EXPANSION_CRISIS);
registerEvents(EXPANSION_TRAVEL);
registerEvents(EXPANSION_WINTER);
registerEvents(CHAPTER_1_EVENTS);
registerEvents(CHAPTER_2_EVENTS);
registerEvents(CHAPTER_3_EVENTS);
registerEvents(CHAPTER_4_EVENTS);
registerEvents(CHAPTER_5_EVENTS);
registerEvents(CHAPTER_6_EVENTS);
registerEvents(EPILOGUE_EVENTS);
registerEvents(MINIGAME_EVENTS);

let prologuePhase = 'intro';

/**
 * Start a new game.
 */
export function startNewGame(seed) {
  initTransitions();
  initEffects();
  initScenes();
  initAudio();
  initDice();
  resumeAudio();
  // Load real sound files in background (non-blocking, fire-and-forget)
  try {
    const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
    const sfx2 = ctx2.createGain(); sfx2.gain.value = 0.7; sfx2.connect(ctx2.destination);
    const mus2 = ctx2.createGain(); mus2.gain.value = 0.3; mus2.connect(ctx2.destination);
    initSoundbank(ctx2, sfx2, mus2);
    loadSounds().then(() => {
      if (isLoaded()) {
        console.log('Real sounds loaded — upgrading audio');
        sbStartDrone('drone_1'); // Start ambient drone
      }
    });
  } catch(e) {}
  newGame(seed);
  initStartingParty();
  setLocationTheme('vancouver');
  setScene('hospital'); // Hospital scene for prologue
  startAmbience('tension');
  // Expose player skills for narrator probability display
  window._masedog_player_skills = getState().player.skills;

  dispatch('SET_PHASE', PHASE.PROLOGUE);
  prologuePhase = 'intro';
  fadeTransition(600).then(() => runPrologue());
}

/**
 * Run the prologue sequence.
 */
async function runPrologue() {
  const phase = PROLOGUE[prologuePhase];
  if (!phase) {
    finishPrologue();
    return;
  }

  // Switch scene based on prologue phase — storybook scene cuts
  const prologueScenes = {
    intro: 'hospital_room',
    phase1: 'hospital_room',
    phase2: 'hospital_room',
    phase3: 'hospital_hallway',
    phase3b: 'hospital_hallway',
    phase4: 'hospital_hallway',
    phase5: 'hospital_outside',
  };
  setScene(prologueScenes[prologuePhase] || 'hospital');

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

  // Visual effects for weather and location
  const region = getCurrentRegion(getState().journey.currentKm);
  setLocationTheme(region);
  setWeatherEffect(getState().weather.current);
  applyDayNightTint(updatedState.calendar.season);
  setScene(getSceneForContext(region, updatedState.calendar.season, null));

  // Update ambient music based on game state
  const mood = getAmbienceForState(getState());
  crossfadeAmbience(mood);

  // Low health heartbeat
  if (getState().player.health < 25) playHeartbeat();

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

  // Switch scene based on event context
  const state = getState();
  const region = getCurrentRegion(state.journey.currentKm);
  const eventScene = event.scene // Events can specify a scene directly
    || getSceneForContext(region, state.calendar.season, event.type);
  setScene(eventScene);

  // Trigger visual effect if event specifies one
  if (event.visual) {
    await triggerVisual(event.visual);
  }

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
    playUIClick();
    dispatch('SET_PHASE', PHASE.RESOLUTION);
    const messages = [];

    // Handle skill check with VISUAL DICE
    if (choice.skillCheck) {
      const state = getState();
      const { skill, dc } = choice.skillCheck;
      const modifier = state.player.skills[skill] || 0;
      const target = convertDCtoTarget(dc);
      const numRolls = getRollCount(dc);

      // Roll the visual dice!
      const result = await rollDice({
        skill,
        bonus: modifier,
        target,
        rolls: numRolls,
        label: `${skill.toUpperCase()} CHECK`,
      });

      messages.push(`[${skill.toUpperCase()}: ${result.rolls.join(' + ')} + ${modifier} = ${result.total} vs ${target}]`);

      if (result.critSuccess) {
        messages.push('DOUBLE SIXES! CRITICAL SUCCESS!');
      } else if (result.critFail) {
        messages.push('SNAKE EYES! CRITICAL FAILURE!');
      }

      // Award skill XP (success = 2, failure = 1)
      dispatch('ADD_SKILL_XP', { characterId: 'masedog', skill, xp: result.success ? 2 : 1 });

      if (result.success || result.critSuccess) {
        playSuccess();
        if (choice.successText) messages.push(choice.successText);
        if (choice.successEffects) applyEffects(choice.successEffects);

        // Handle combat on success path
        if (choice.combat && !choice.failureCombat) {
          const combatResult = resolveCombat(choice.combat);
          messages.push(...combatResult.messages);
        }
      } else {
        playFailure();
        if (choice.failureText) messages.push(choice.failureText);
        if (choice.failureEffects) applyEffects(choice.failureEffects);

        // Handle combat on failure
        if (choice.failureCombat) {
          const combatResult = resolveCombat(choice.failureCombat);
          messages.push(...combatResult.messages);
        }
      }
    } else if (choice.combat) {
      // Direct combat — VS DICE! White (player) vs Red (zombie)
      crossfadeAmbience('combat');
      const state = getState();
      const playerCombat = state.player.skills.combat || 3;
      const zombieType = choice.combat.zombieType || 'shambler';
      const zombiePower = { shambler: 2, runner: 4, crawler: 3, screamer: 3, bloater: 4, stalker: 6, hive_node: 7, wired: 8 }[zombieType] || 3;

      const vsResult = await rollDiceVS({
        label: `BATTLE vs ${zombieType.toUpperCase()}`,
        playerBonus: playerCombat,
        enemyBonusVal: zombiePower,
        enemyName: zombieType.toUpperCase(),
      });

      screenShake(6, 400);
      if (vsResult.success) {
        playSuccess();
        playShotgun();
        messages.push(`You rolled ${vsResult.playerTotal} + ${playerCombat} = ${vsResult.total}. The ${zombieType} rolled ${vsResult.enemyTotal} + ${zombiePower} = ${vsResult.enemyTotal + zombiePower}.`);
        messages.push('You won the fight!');
        if (choice.successText) messages.push(choice.successText);
        // Award skill XP for combat
        dispatch('ADD_SKILL_XP', { characterId: 'masedog', skill: 'combat', xp: 2 });
      } else {
        playFailure();
        playZombieGroan();
        damageFlash(0.5);
        messages.push(`You rolled ${vsResult.playerTotal} + ${playerCombat} = ${vsResult.total}. The ${zombieType} rolled ${vsResult.enemyTotal} + ${zombiePower} = ${vsResult.enemyTotal + zombiePower}.`);
        messages.push('The zombie overpowers you!');
        // Take damage based on zombie type
        const damage = zombiePower * 5;
        dispatch('UPDATE_PLAYER_HEALTH', -damage);
        messages.push(`You take ${damage} damage!`);
        dispatch('ADD_SKILL_XP', { characterId: 'masedog', skill: 'combat', xp: 1 });
      }
    } else {
      if (choice.resultText) messages.push(choice.resultText);
    }

    // Trigger mini-game if specified
    if (choice.triggerMinigame) {
      const mgResult = await launchMinigame(choice.triggerMinigame, choice.minigameConfig || {});
      if (mgResult.success) {
        messages.push('You made it through!');
        if (choice.minigameSuccessEffects) applyEffects(choice.minigameSuccessEffects);
        if (mgResult.loot) {
          for (const item of mgResult.loot) {
            dispatch('UPDATE_RESOURCES', { [item.type]: item.amount });
            messages.push(`Found: ${item.type} +${item.amount}`);
          }
        }
        if (mgResult.food) dispatch('UPDATE_RESOURCES', { food: mgResult.food });
      } else {
        messages.push('That didn\'t go well...');
        if (choice.minigameFailEffects) applyEffects(choice.minigameFailEffects);
        else applyEffects({ health: -10, morale: -5 });
        if (mgResult.caught) damageFlash(0.5);
      }
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
  setScene('campfire'); // Campfire scene at camp
  showScreen('camp', {
    onContinue: () => runTurn(),
  });
}

/**
 * Show game over screen.
 */
function showGameOverScreen() {
  crossfadeAmbience('sorrow');
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
 * Launch a mini-game. Returns a promise that resolves with the result.
 */
function launchMinigame(type, config = {}) {
  return new Promise(resolve => {
    let game;
    switch (type) {
      case 'zombie-escape':
        game = new ZombieEscape();
        break;
      case 'scavenge':
        game = new Scavenge();
        break;
      case 'hunting':
        game = new Hunting();
        break;
      case 'river-crossing':
        game = new RiverCrossing();
        break;
      default:
        resolve({ success: false, score: 0 });
        return;
    }

    game.onComplete = (result) => {
      resolve(result);
    };

    // Apply config overrides
    if (config.maxTime) game.maxTime = config.maxTime;
    if (config.difficulty === 'hard') game.maxTime *= 0.7;
    if (config.difficulty === 'easy') game.maxTime *= 1.3;

    dispatch('SET_PHASE', PHASE.MINIGAME);
    game.init();
    game.start();
  });
}

/**
 * Determine which ending variant to show based on flags and state.
 */
function determineEnding() {
  const state = getState();
  const cureCarrier = state.party.find(c => c.isCureCarrier);
  const cureAlive = cureCarrier ? cureCarrier.isAlive : false;
  const partyAlive = state.party.filter(c => c.isAlive).length;
  const flags = state.flags;

  if (cureAlive && partyAlive >= 2 && flags.cassidy_parents_alive) {
    return 'golden'; // Best ending — cure delivered, family reunited
  }
  if (cureAlive && partyAlive <= 1) {
    return 'pyrrhic'; // Victory but at terrible cost
  }
  if (!cureAlive && flags.carrier_sacrifice) {
    return 'sacrifice'; // Carrier died to buy time for a partial cure
  }
  if (!cureAlive && flags.defied_ai) {
    return 'defiant'; // No cure but humanity fights on
  }
  if (cureAlive) {
    return 'hopeful'; // Standard good ending
  }
  return 'bittersweet'; // Made it but no cure carrier
}

/**
 * Show victory screen.
 */
function showVictoryScreen() {
  crossfadeAmbience('hope');
  const state = getState();
  const cureCarrier = state.party.find(c => c.isCureCarrier);
  const cureAlive = cureCarrier ? cureCarrier.isAlive : false;

  const ending = determineEnding();

  showScreen('victory', {
    cureAlive,
    cureCarrierName: cureCarrier?.name || 'Unknown',
    ending,
    flags: state.flags,
    stats: {
      turnsLived: state.meta.turnNumber,
      kmTraveled: state.journey.currentKm,
      partySize: getPartySize(),
      partySurvivors: state.party.filter(c => c.isAlive).map(c => c.name),
      partyDead: state.party.filter(c => !c.isAlive).map(c => c.name),
      history: state.history,
    },
    onRestart: () => startNewGame(),
  });
}

/**
 * Attempt to grow a character's skill after a successful check.
 * 20% chance on success, modified by quick_learner trait.
 */
function trySkillGrowth(characterId, skillName) {
  const state = getState();
  const rng = getRNG();
  const char = characterId === 'masedog'
    ? state.player
    : state.party.find(c => c.id === characterId);

  if (!char || !char.skills[skillName]) return null;
  if (char.skills[skillName] >= 10) return null; // Max skill

  let growthChance = 20;
  if (char.traits.includes('quick_learner')) growthChance = 35;
  if (char.traits.includes('adaptable')) growthChance = 30;

  const { chance: doChance } = { chance: (rng, pct) => rng.next() * 100 < pct };
  if (doChance(rng, growthChance)) {
    char.skills[skillName]++;
    return `${char.name}'s ${skillName} improved to ${char.skills[skillName]}!`;
  }
  return null;
}

/**
 * Show title screen.
 */
export function showTitle() {
  showScreen('title', {
    onNewGame: (seed) => startNewGame(seed),
    onLoad: () => {
      // Resume a loaded game
      initTransitions();
      initEffects();
      initScenes();
      initAudio();
      initDice();
      resumeAudio();
      const state = getState();
      if (state) {
        window._masedog_player_skills = state.player.skills;
        const region = getCurrentRegion(state.journey.currentKm);
        setLocationTheme(region);
        setScene(getSceneForContext(region, state.calendar.season, null));
        updateHUD();
      }
      showCampScreen();
    },
  });
}
