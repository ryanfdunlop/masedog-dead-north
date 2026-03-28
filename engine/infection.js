// ============================================================
// MASEDOG: Dead North — Infection State Machine
// HEALTHY → BITTEN → INFECTED → TURNING → TURNED
// ============================================================

import { dispatch, getState, getRNG, INFECTION } from './state.js';
import { chance } from './random.js';

/**
 * Process infection progression for all characters each turn.
 * Returns array of messages.
 */
export function tickInfections() {
  const state = getState();
  const rng = getRNG();
  const messages = [];

  const allChars = [state.player, ...state.party.filter(c => c.isAlive)];

  for (const char of allChars) {
    if (char.infectionState === INFECTION.HEALTHY) continue;

    // Cure carriers recover fast
    if (char.isCureCarrier && char.infectionState === INFECTION.BITTEN) {
      char.infectionTimer--;
      if (char.infectionTimer <= 0) {
        char.infectionState = INFECTION.HEALTHY;
        messages.push(`${char.name}'s bite wound has healed remarkably fast. Almost... unnaturally fast.`);
      }
      continue;
    }

    char.infectionTimer--;

    switch (char.infectionState) {
      case INFECTION.BITTEN:
        if (char.infectionTimer <= 0) {
          // Time's up for treatment — progresses to INFECTED
          char.infectionState = INFECTION.INFECTED;
          char.infectionTimer = 5; // 5 turns until turning (was 3)
          messages.push(`${char.name}'s bite has become infected. The veins around the wound are turning black.`);
        } else {
          messages.push(`${char.name}'s bite wound festers. ${char.infectionTimer} week(s) to treat it before it's too late.`);
        }
        break;

      case INFECTION.INFECTED:
        dispatch('UPDATE_CHARACTER', { id: char.id, changes: { health: -15, morale: -10 } });
        if (char.infectionTimer <= 0) {
          char.infectionState = INFECTION.TURNING;
          char.infectionTimer = 1; // 1 turn — last chance
          messages.push(`${char.name} is turning. Eyes glazing over. Skin going pale. You don't have long.`);
        } else {
          messages.push(`${char.name} grows weaker. The infection spreads. ${char.infectionTimer} week(s) remain.`);
        }
        break;

      case INFECTION.TURNING:
        if (char.infectionTimer <= 0) {
          char.infectionState = INFECTION.TURNED;
          char.isAlive = false;
          messages.push(`${char.name} has turned. The person you knew is gone. Only a shell remains.`);

          // Turned party members can attack — trigger danger event
          dispatch('SET_FLAG', { key: `${char.id}_turned`, value: true });
          dispatch('SET_FLAG', { key: 'party_member_turned', value: true });

          if (char.isPlayer) {
            dispatch('GAME_OVER', 'The infection took you. MASEDOG is no more.');
          }
        }
        break;
    }
  }

  return messages;
}

/**
 * Attempt to treat a bitten character with medicine.
 * Returns { success, message }.
 */
export function treatBite(characterId) {
  const state = getState();
  const rng = getRNG();
  const char = characterId === 'masedog'
    ? state.player
    : state.party.find(c => c.id === characterId);

  if (!char) return { success: false, message: 'Character not found.' };
  if (char.infectionState !== INFECTION.BITTEN) {
    return { success: false, message: `${char.name} can't be treated at this stage.` };
  }
  if (state.resources.medicine <= 0) {
    return { success: false, message: 'No medicine available!' };
  }

  dispatch('UPDATE_RESOURCES', { medicine: -1 });

  // 65% base chance, +15% if party has a doctor (was 50/+20)
  let cureChance = 65;
  const hasDoctor = state.party.some(c => c.isAlive && c.skills.medical >= 7);
  if (hasDoctor) cureChance += 15;

  if (chance(rng, cureChance)) {
    char.infectionState = INFECTION.HEALTHY;
    char.infectionTimer = 0;
    dispatch('UPDATE_CHARACTER', { id: char.id, changes: { health: 10 } });
    return { success: true, message: `The medicine works! ${char.name}'s wound begins to heal.` };
  } else {
    return { success: false, message: `The medicine didn't take effect. ${char.name} is still infected.` };
  }
}

/**
 * Get infection status display for a character.
 */
export function getInfectionStatus(char) {
  switch (char.infectionState) {
    case INFECTION.HEALTHY: return null;
    case INFECTION.BITTEN: return { label: 'BITTEN', color: '#ff8800', urgent: true, turnsLeft: char.infectionTimer };
    case INFECTION.INFECTED: return { label: 'INFECTED', color: '#ff4400', urgent: true, turnsLeft: char.infectionTimer };
    case INFECTION.TURNING: return { label: 'TURNING', color: '#cc0000', urgent: true, turnsLeft: char.infectionTimer };
    case INFECTION.TURNED: return { label: 'TURNED', color: '#660000', urgent: false, turnsLeft: 0 };
    default: return null;
  }
}
