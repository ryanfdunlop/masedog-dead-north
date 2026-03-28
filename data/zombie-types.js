// ============================================================
// MASEDOG: Dead North — Zombie Types
// Escalating threat throughout the journey
// ============================================================

export const ZOMBIE_TYPES = {
  shambler: {
    id: 'shambler',
    name: 'Shambler',
    description: 'The classic walking dead. Slow, dumb, but relentless in numbers.',
    lore: 'The most common infected. Whatever the AI virus did to their brains, it left just enough to walk and feed.',
    firstAppears: 1,
    spawnWeight: 40,
    speed: 'slow',
    danger: 'low',
    appearance: 'Vacant eyes, shuffling gait, skin mottled grey-green.',
  },
  runner: {
    id: 'runner',
    name: 'Runner',
    description: 'Recently turned. Muscles still work. Fast and aggressive.',
    lore: 'Fresh converts. The virus hasn\'t fully degraded their body yet. They can sprint, climb, and they WILL chase you.',
    firstAppears: 1,
    spawnWeight: 25,
    speed: 'fast',
    danger: 'medium',
    appearance: 'Almost human-looking. Wild eyes, blood-streaked, moving with desperate energy.',
  },
  crawler: {
    id: 'crawler',
    name: 'Crawler',
    description: 'Damaged legs. Hides under vehicles and debris. Ambush predator.',
    lore: 'Some infected lost their legs to trauma or decay. They adapted. Now they lurk in tight spaces, grabbing ankles.',
    firstAppears: 3,
    spawnWeight: 15,
    speed: 'very_slow',
    danger: 'medium',
    appearance: 'Dragging torso, fingers worn to bone from clawing along pavement.',
  },
  screamer: {
    id: 'screamer',
    name: 'Screamer',
    description: 'Emits a piercing shriek that draws every zombie in the area.',
    lore: 'A mutation. The virus rewired their vocal cords into a biological alarm system. Kill them fast, or you\'ll have company.',
    firstAppears: 8,
    spawnWeight: 10,
    speed: 'medium',
    danger: 'high',
    appearance: 'Distended jaw, throat swollen and pulsing. The sound they make is almost mechanical.',
  },
  bloater: {
    id: 'bloater',
    name: 'Bloater',
    description: 'Swollen with infectious gas. Explodes on contact, spreading the virus in a cloud.',
    lore: 'The virus causes massive internal gas buildup. These walking bombs can infect you without even biting.',
    firstAppears: 12,
    spawnWeight: 8,
    speed: 'slow',
    danger: 'high',
    appearance: 'Grotesquely swollen body, skin stretched tight and translucent. Veins glow faintly.',
  },
  stalker: {
    id: 'stalker',
    name: 'Stalker',
    description: 'AI-enhanced. Retains basic intelligence. Sets traps and ambushes.',
    lore: 'The AI overlords didn\'t just release the virus — they improved it. Stalkers are phase 2: zombies that think.',
    firstAppears: 20,
    spawnWeight: 6,
    speed: 'medium',
    danger: 'high',
    appearance: 'Eerily still. Eyes track you with cold calculation. They wait for the perfect moment.',
  },
  hive_node: {
    id: 'hive_node',
    name: 'Hive Node',
    description: 'A stationary infected acting as an AI relay. Coordinates nearby zombies into a networked swarm.',
    lore: 'The AI\'s masterpiece. These infected are hardwired into the network, broadcasting commands. Nearby zombies move with military precision.',
    firstAppears: 30,
    spawnWeight: 3,
    speed: 'stationary',
    danger: 'extreme',
    appearance: 'Motionless figure covered in bioluminescent tendrils. Eyes glow solid white. Faint humming.',
  },
  wired: {
    id: 'wired',
    name: 'The Wired',
    description: 'Fully AI-controlled former soldiers. Use weapons, tactics, and show no mercy.',
    lore: 'The final evolution. Former military personnel turned and upgraded by the AI. They remember how to use guns, set perimeters, and execute coordinated assaults. They are the AI\'s hands in the physical world.',
    firstAppears: 40,
    spawnWeight: 2,
    speed: 'variable',
    danger: 'extreme',
    appearance: 'Military gear fused with flesh. Cybernetic implants visible. They move like soldiers, not corpses.',
  },
};

/**
 * Get eligible zombie types for the current turn.
 */
export function getEligibleZombies(turnNumber) {
  return Object.values(ZOMBIE_TYPES).filter(z => turnNumber >= z.firstAppears);
}

/**
 * Pick a zombie type based on turn and weights.
 */
export function pickZombieType(rng, turnNumber) {
  const eligible = getEligibleZombies(turnNumber);
  const totalWeight = eligible.reduce((sum, z) => sum + z.spawnWeight, 0);
  let threshold = rng.next() * totalWeight;

  for (const zombie of eligible) {
    threshold -= zombie.spawnWeight;
    if (threshold <= 0) return zombie;
  }

  return eligible[0];
}
