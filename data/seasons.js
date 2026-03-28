// ============================================================
// MASEDOG: Dead North — Season Definitions
// Game runs June 2031 → May 2032
// ============================================================

export const SEASONS = {
  summer: {
    name: 'Summer',
    months: [6, 7, 8],
    description: 'Long days. Hot. The infected are most active.',
    effects: {
      waterMultiplier: 1.3,    // Need more water
      foodMultiplier: 1.0,
      travelMultiplier: 1.0,
      zombieActivity: 1.3,     // More zombie encounters
      exposureDamage: 0,
    },
  },
  fall: {
    name: 'Fall',
    months: [9, 10, 11],
    description: 'The days grow shorter. Leaves fall like the last remnants of hope.',
    effects: {
      waterMultiplier: 1.0,
      foodMultiplier: 1.1,
      travelMultiplier: 0.9,
      zombieActivity: 1.0,
      exposureDamage: 0,
    },
  },
  winter: {
    name: 'Winter',
    months: [12, 1, 2],
    description: 'Canadian winter. The cold can kill faster than any zombie.',
    effects: {
      waterMultiplier: 1.0,
      foodMultiplier: 1.5,     // Need way more food to stay warm
      travelMultiplier: 0.5,   // Half travel speed
      zombieActivity: 0.6,     // Zombies slow in cold
      exposureDamage: 10,      // Damage per turn without shelter
    },
  },
  spring: {
    name: 'Spring',
    months: [3, 4, 5],
    description: 'The thaw brings floods and mud — but also the promise that this nightmare might end.',
    effects: {
      waterMultiplier: 1.0,
      foodMultiplier: 1.1,
      travelMultiplier: 0.7,   // Mud and flooding
      zombieActivity: 1.1,     // Zombies wake back up
      exposureDamage: 0,
    },
  },
};

/**
 * Get the current season data.
 */
export function getSeasonData(season) {
  return SEASONS[season] || SEASONS.summer;
}

/**
 * Get month name from number.
 */
export function getMonthName(month) {
  const MONTHS = [
    '', 'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return MONTHS[month] || 'Unknown';
}

/**
 * Get a season flavor description for narration.
 */
export function getSeasonNarration(season, month) {
  const narrations = {
    summer_6: 'The June sun beats down. It\'s been weeks since the outbreak. The world hasn\'t gotten any safer.',
    summer_7: 'July heat makes the stench of the dead unbearable. The infected swarm in the warmth.',
    summer_8: 'August. The days are still long, but you can feel the shift. Summer won\'t protect you forever.',
    fall_9: 'September. The leaves are turning. So are the people who got bitten last week.',
    fall_10: 'October. Halloween was always about pretend monsters. Now the monsters are real.',
    fall_11: 'November. The first frost. The cold slows the dead, but it slows you too.',
    winter_12: 'December. No Christmas this year. Just survival.',
    winter_1: 'January. The deepest cold. Some days it hurts to breathe.',
    winter_2: 'February. If you\'ve made it this far, you\'re tougher than you thought.',
    spring_3: 'March. The ice begins to crack. So does your resolve.',
    spring_4: 'April. Meltwater floods the roads. New paths, new dangers.',
    spring_5: 'May. Almost a year since it all began. Ottawa can\'t be far now.',
  };
  return narrations[`${season}_${month}`] || '';
}
