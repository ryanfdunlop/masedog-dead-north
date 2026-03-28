// ============================================================
// MASEDOG: Dead North — Seeded PRNG (mulberry32)
// ALL randomness in the game MUST flow through this module.
// Never use Math.random() anywhere.
// ============================================================

/**
 * Create a seeded PRNG using the mulberry32 algorithm.
 * Returns an object with .next() that produces 0-1 floats.
 */
export function createRNG(seed) {
  let state = seed | 0;
  let callCount = 0;

  function next() {
    callCount++;
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    getCallCount: () => callCount,
    getSeed: () => seed,
  };
}

/**
 * Generate a random seed from the current time.
 */
export function generateSeed() {
  return Date.now() ^ (Math.random() * 0xffffffff);
}

/**
 * Roll a die: returns integer from 1 to sides (inclusive).
 */
export function roll(rng, sides) {
  return Math.floor(rng.next() * sides) + 1;
}

/**
 * Roll a d20 + modifier vs difficulty class.
 * Returns { total, roll, success }
 */
export function skillCheck(rng, modifier, dc) {
  const dieRoll = roll(rng, 20);
  const total = dieRoll + modifier;
  return {
    roll: dieRoll,
    total,
    success: total >= dc,
    critSuccess: dieRoll === 20,
    critFail: dieRoll === 1,
  };
}

/**
 * Returns true with the given probability (0-100).
 */
export function chance(rng, percent) {
  return rng.next() * 100 < percent;
}

/**
 * Pick a random item from an array.
 */
export function pick(rng, array) {
  if (array.length === 0) return null;
  return array[Math.floor(rng.next() * array.length)];
}

/**
 * Pick from a weighted array. Items is [{...item, weight: N}].
 * Returns the item (without the weight property) or null.
 */
export function weightedPick(rng, items) {
  if (items.length === 0) return null;
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let threshold = rng.next() * totalWeight;
  for (const item of items) {
    threshold -= item.weight || 1;
    if (threshold <= 0) return item;
  }
  return items[items.length - 1];
}

/**
 * Fisher-Yates shuffle (in-place, returns the array).
 */
export function shuffle(rng, array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Random integer in range [min, max] (inclusive).
 */
export function range(rng, min, max) {
  return Math.floor(rng.next() * (max - min + 1)) + min;
}

/**
 * Fast-forward an RNG by calling next() n times.
 * Used to restore PRNG state from a save (seed + callCount).
 */
export function fastForward(rng, n) {
  for (let i = 0; i < n; i++) rng.next();
  return rng;
}
