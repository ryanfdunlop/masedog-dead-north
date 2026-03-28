// ============================================================
// MASEDOG: Dead North — NPC Name Pools & Templates
// ============================================================

import { pick, range, shuffle } from '../engine/random.js';

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Sam', 'Morgan', 'Casey', 'Quinn', 'Riley',
  'Devon', 'Skyler', 'Blake', 'Cameron', 'Drew', 'Finley', 'Harper', 'Jamie',
  'Kai', 'Logan', 'Noel', 'Reese', 'Avery', 'Dakota', 'Emerson', 'Frankie',
  'Maria', 'James', 'Sarah', 'Marcus', 'Elena', 'Trevor', 'Priya', 'Chen',
  'Omar', 'Yuki', 'Dmitri', 'Aisha', 'Bruno', 'Mei', 'Lars', 'Fatima',
  'Miguel', 'Anya', 'Kofi', 'Suki', 'Raj', 'Ingrid', 'Jean-Pierre', 'Rosa',
];

const LAST_NAMES = [
  'Chen', 'Williams', 'Patel', 'Johnson', 'Kim', 'Garcia', 'Lavoie', 'Singh',
  'Brown', 'Wilson', 'Nakamura', 'Thompson', 'Martinez', 'Anderson', 'Park',
  'Tremblay', 'Hassan', 'Berg', 'Santos', 'Mitchell', 'Okafor', 'Ivanov',
  'Bergstrom', 'Dubois', 'Fernandez', 'O\'Brien', 'Kowalski', 'Yamamoto',
];

const BACKSTORIES = [
  'Was a high school teacher before the outbreak. Still carries a red pen out of habit.',
  'Former paramedic. Knows how to keep people alive. Seen too much death.',
  'Construction worker. Built things for a living. Now just tries not to break.',
  'College student. Was studying biology. The irony isn\'t lost on them.',
  'Retired military. Thought they\'d left the fighting behind.',
  'Single parent. Lost their kids in the first week. Has nothing left to lose.',
  'Mechanic. Can fix anything with an engine. People are harder.',
  'Chef. Keeps the group fed and morale up with impossibly good meals from canned goods.',
  'Nurse. Left the hospital when the patients started biting the staff.',
  'Farmer. Knows the land. Knows how to survive winter.',
  'Software engineer. Ironic — they helped build the systems that turned on humanity.',
  'Indigenous elder. Knows traditional survival skills. The land speaks to them.',
  'Teenager who grew up too fast. Tough on the outside. Terrified on the inside.',
  'Former RCMP officer. Still tries to keep order. It\'s getting harder.',
  'Artist. Documents everything in a sketchbook. Someone has to remember.',
];

/**
 * Generate a random NPC.
 */
export function generateNPC(rng, options = {}) {
  const firstName = pick(rng, FIRST_NAMES);
  const lastName = pick(rng, LAST_NAMES);
  const age = options.age || range(rng, 16, 55);
  const backstory = pick(rng, BACKSTORIES);

  // Generate skills with some specialization
  const baseSkill = 3;
  const skills = {
    combat: baseSkill + range(rng, -1, 3),
    athletics: baseSkill + range(rng, -1, 3),
    perception: baseSkill + range(rng, -1, 3),
    medical: baseSkill + range(rng, -1, 3),
    mechanics: baseSkill + range(rng, -1, 3),
    charisma: baseSkill + range(rng, -1, 3),
    stealth: baseSkill + range(rng, -1, 3),
    survival: baseSkill + range(rng, -1, 3),
  };

  // Give 1-2 specializations (skill bumped to 6-8)
  const skillKeys = shuffle(rng, Object.keys(skills));
  skills[skillKeys[0]] = range(rng, 6, 8);
  if (range(rng, 1, 3) > 1) skills[skillKeys[1]] = range(rng, 5, 7);

  const POSITIVE_TRAITS = ['determined', 'adaptable', 'cautious', 'empathetic', 'resourceful', 'leader', 'calm'];
  const NEGATIVE_TRAITS = ['aggressive', 'loner', 'paranoid', 'reckless', 'cowardly'];

  const traits = [pick(rng, POSITIVE_TRAITS)];
  if (range(rng, 1, 4) === 1) traits.push(pick(rng, NEGATIVE_TRAITS));

  return {
    id: `npc_${firstName.toLowerCase()}_${Date.now()}`,
    name: `${firstName} ${lastName}`,
    age,
    health: range(rng, 50, 90),
    maxHealth: 100,
    morale: range(rng, 30, 70),
    skills,
    traits,
    relationships: {},
    status: [],
    infectionState: 'HEALTHY',
    infectionTimer: 0,
    isAlive: true,
    isCureCarrier: false,
    isPlayer: false,
    joinedTurn: 0,
    equipment: { weapon: null, armor: null, accessory: null },
    backstory,
  };
}
