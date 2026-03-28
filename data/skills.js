// ============================================================
// MASEDOG: Dead North — Skills & Traits
// ============================================================

export const SKILLS = {
  combat: {
    id: 'combat',
    name: 'Combat',
    description: 'Fighting ability. Melee and ranged weapon proficiency.',
    icon: 'sword',
  },
  athletics: {
    id: 'athletics',
    name: 'Athletics',
    description: 'Running, jumping, climbing, dodging. Physical fitness.',
    icon: 'run',
  },
  perception: {
    id: 'perception',
    name: 'Perception',
    description: 'Noticing details, spotting danger, awareness of surroundings.',
    icon: 'eye',
  },
  medical: {
    id: 'medical',
    name: 'Medical',
    description: 'Healing wounds, treating illness, using medicine effectively.',
    icon: 'cross',
  },
  mechanics: {
    id: 'mechanics',
    name: 'Mechanics',
    description: 'Fixing vehicles, picking locks, building things from scrap.',
    icon: 'wrench',
  },
  charisma: {
    id: 'charisma',
    name: 'Charisma',
    description: 'Persuasion, leadership, negotiation with NPCs.',
    icon: 'speech',
  },
  stealth: {
    id: 'stealth',
    name: 'Stealth',
    description: 'Moving quietly, hiding, avoiding detection.',
    icon: 'shadow',
  },
  survival: {
    id: 'survival',
    name: 'Survival',
    description: 'Foraging, hunting, navigation, weather sense.',
    icon: 'leaf',
  },
};

export const TRAITS = {
  // Positive
  determined: { id: 'determined', name: 'Determined', type: 'positive', description: 'Won\'t give up. Morale drops slower.', effect: 'morale_decay_half' },
  adaptable: { id: 'adaptable', name: 'Adaptable', type: 'positive', description: 'Quick to adjust. Skills improve faster.', effect: 'skill_growth_bonus' },
  cautious: { id: 'cautious', name: 'Cautious', type: 'positive', description: 'Thinks before acting. +2 perception checks.', effect: 'perception_bonus_2' },
  empathetic: { id: 'empathetic', name: 'Empathetic', type: 'positive', description: 'Cares deeply. Morale boost when helping others.', effect: 'help_morale_bonus' },
  resourceful: { id: 'resourceful', name: 'Resourceful', type: 'positive', description: 'Finds more when scavenging. Bonus loot.', effect: 'scavenge_bonus' },
  leader: { id: 'leader', name: 'Leader', type: 'positive', description: 'Inspires others. Party morale bonus.', effect: 'party_morale_bonus' },
  quick_learner: { id: 'quick_learner', name: 'Quick Learner', type: 'positive', description: 'Skills improve rapidly with experience.', effect: 'fast_skill_growth' },
  calm: { id: 'calm', name: 'Calm', type: 'positive', description: 'Cool under pressure. No panic penalties.', effect: 'no_panic' },

  // Negative (can be assigned to NPCs for variety)
  aggressive: { id: 'aggressive', name: 'Aggressive', type: 'negative', description: '+2 combat but -1 stealth. May start fights.', effect: 'combat_boost_stealth_penalty' },
  loner: { id: 'loner', name: 'Loner', type: 'negative', description: 'No morale penalty from deaths, but can\'t rally.', effect: 'no_death_morale_no_rally' },
  paranoid: { id: 'paranoid', name: 'Paranoid', type: 'negative', description: 'Trusts no one. NPC interactions harder.', effect: 'social_penalty' },
  reckless: { id: 'reckless', name: 'Reckless', type: 'negative', description: 'Takes unnecessary risks. Random danger events.', effect: 'random_danger' },
  cowardly: { id: 'cowardly', name: 'Cowardly', type: 'negative', description: 'Flees from danger. May abandon group in crisis.', effect: 'flee_chance' },
};

/**
 * Get all positive traits.
 */
export function getPositiveTraits() {
  return Object.values(TRAITS).filter(t => t.type === 'positive');
}

/**
 * Get all negative traits.
 */
export function getNegativeTraits() {
  return Object.values(TRAITS).filter(t => t.type === 'negative');
}
