// ============================================================
// MASEDOG: Dead North — Journey Waypoints
// Vancouver to Ottawa, ~4,400 km
// ============================================================

export const WAYPOINTS = [
  {
    id: 'vancouver',
    name: 'Vancouver',
    km: 0,
    region: 'vancouver',
    description: 'The city burns behind you. Smoke rises from the hospital where it all began.',
    flavor: 'Once one of the most livable cities in the world. Now a graveyard.',
    eventTags: ['urban', 'hospital', 'coast'],
    scavengeQuality: 'high',
  },
  {
    id: 'kamloops',
    name: 'Kamloops',
    km: 350,
    region: 'bc_interior',
    description: 'The dry interior. The Thompson River winds through brown hills. Small towns dot the highway.',
    flavor: 'The Trans-Canada Highway stretches endlessly through sun-scorched valleys.',
    eventTags: ['rural', 'highway', 'river', 'desert'],
    scavengeQuality: 'medium',
  },
  {
    id: 'calgary',
    name: 'Calgary',
    km: 1000,
    region: 'alberta',
    description: 'The skyline of Calgary rises from the prairies. Downtown is overrun, but the outskirts might have supplies.',
    flavor: 'Oil money built this city. Now its towers stand as tombstones for civilization.',
    eventTags: ['urban', 'prairie', 'mountains_nearby'],
    scavengeQuality: 'high',
  },
  {
    id: 'regina',
    name: 'Regina',
    km: 1700,
    region: 'saskatchewan',
    description: 'Flat prairie in every direction. Nowhere to hide, but nowhere for them to hide either.',
    flavor: 'The flatlands. You can see for miles. That\'s both a blessing and a curse.',
    eventTags: ['rural', 'prairie', 'flat', 'exposed'],
    scavengeQuality: 'low',
  },
  {
    id: 'winnipeg',
    name: 'Winnipeg',
    km: 2300,
    region: 'manitoba',
    description: 'The halfway point. The forks of the Red and Assiniboine rivers. A city of survivors — or so the radio said.',
    flavor: 'If any city could survive the apocalypse through sheer stubbornness, it\'s Winnipeg.',
    eventTags: ['urban', 'river', 'cold', 'survivor_camp'],
    scavengeQuality: 'medium',
  },
  {
    id: 'thunder_bay',
    name: 'Thunder Bay',
    km: 3100,
    region: 'ontario_north',
    description: 'Lake Superior stretches to the horizon like an inland sea. The forests here are dense and dark.',
    flavor: 'The Canadian Shield. Ancient rock, deep forest, and the haunting expanse of Superior.',
    eventTags: ['wilderness', 'lake', 'forest', 'isolated'],
    scavengeQuality: 'low',
  },
  {
    id: 'sudbury',
    name: 'Sudbury',
    km: 3800,
    region: 'ontario_south',
    description: 'Mining country. The landscape is scarred but resilient. You\'re getting close.',
    flavor: 'The Big Nickel watches over a city built on extracting what\'s buried deep.',
    eventTags: ['urban', 'mining', 'industrial'],
    scavengeQuality: 'medium',
  },
  {
    id: 'ottawa',
    name: 'Ottawa',
    km: 4400,
    region: 'ottawa_approach',
    description: 'The capital. Parliament Hill. If there\'s a cure, if there\'s any hope left, it\'s here.',
    flavor: 'The seat of a government that no longer governs. But the underground labs... they might still be running.',
    eventTags: ['urban', 'government', 'military', 'lab'],
    scavengeQuality: 'high',
  },
];

/**
 * Get the current waypoint based on km traveled.
 */
export function getCurrentWaypoint(km) {
  let current = WAYPOINTS[0];
  for (const wp of WAYPOINTS) {
    if (km >= wp.km) current = wp;
    else break;
  }
  return current;
}

/**
 * Get the next waypoint to reach.
 */
export function getNextWaypoint(km) {
  for (const wp of WAYPOINTS) {
    if (wp.km > km) return wp;
  }
  return WAYPOINTS[WAYPOINTS.length - 1];
}

/**
 * Get distance to next waypoint.
 */
export function distanceToNext(km) {
  const next = getNextWaypoint(km);
  return next.km - km;
}

/**
 * Get journey progress as percentage.
 */
export function getProgress(km) {
  return Math.min(100, Math.round((km / 4400) * 100));
}
