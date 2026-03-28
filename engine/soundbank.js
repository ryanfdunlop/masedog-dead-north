// ============================================================
// MASEDOG: Dead North — Real Sound Bank
// Loads and plays actual WAV files from assets/audio/.
// Falls back to procedural audio.js if files fail to load.
// ============================================================

const BASE = './assets/audio/';
let audioCtx = null;
let sfxGain = null;
let musicGain = null;
const buffers = {};
let loaded = false;

// Sound manifest — maps game sound names to file paths
const MANIFEST = {
  // Ambient drones (loop)
  drone_1: 'ambient/drone_001.wav',
  drone_2: 'ambient/drone_002.wav',
  drone_3: 'ambient/drone_003.wav',
  drone_4: 'ambient/drone_004.wav',
  soundscape_1: 'ambient/soundscape_002.wav',
  soundscape_2: 'ambient/soundscape_003.wav',
  soundscape_3: 'ambient/soundscape_005.wav',

  // Zombie growls
  growl_1: 'sfx/growl_001.wav',
  growl_2: 'sfx/growl_003.wav',
  growl_3: 'sfx/growl_004.wav',
  growl_4: 'sfx/growl_005.wav',
  growl_5: 'sfx/growl_006.wav',
  growl_6: 'sfx/growl_007.wav',

  // Ghost/eerie
  ghost_1: 'sfx/ghost_001.wav',
  ghost_2: 'sfx/ghost_002.wav',
  ghost_3: 'sfx/ghost_003.wav',
  ghost_4: 'sfx/ghost_004.wav',
  ghost_5: 'sfx/ghost_005.wav',

  // Combat hits
  hit_1: 'sfx/hit_001.wav',
  hit_2: 'sfx/hit_002.wav',
  hit_3: 'sfx/hit_003.wav',
  hit_4: 'sfx/hit_004.wav',
  hit_5: 'sfx/hit_007.wav',
  hit_6: 'sfx/hit_008.wav',

  // Bass sub-impacts
  bass_1: 'sfx/bass_001.wav',
  bass_2: 'sfx/bass_002.wav',

  // Dark SFX
  darksfx_1: 'sfx/darksfx_001.wav',
  darksfx_2: 'sfx/darksfx_002.wav',
  darksfx_3: 'sfx/darksfx_003.wav',

  // Percussion (UI + combat layer)
  kick_1: 'sfx/kick_1.wav',
  kick_2: 'sfx/kick_2.wav',
  snap_1: 'sfx/snap_1.wav',
  snap_2: 'sfx/snap_2.wav',
  click_1: 'ui/click_1.wav',
  click_2: 'ui/click_2.wav',
  click_3: 'ui/click_3.wav',

  // Tension risers
  riser_1: 'risers/riser_001.wav',
  riser_2: 'risers/riser_002.wav',
  riser_3: 'risers/riser_003.wav',
  riser_4: 'risers/riser_004.wav',
  riser_5: 'risers/riser_005.wav',

  // Transitions
  whoosh_1: 'transitions/whoosh_001.wav',
  whoosh_2: 'transitions/whoosh_002.wav',
  whoosh_3: 'transitions/whoosh_003.wav',
  whoosh_4: 'transitions/whoosh_004.wav',
  whoosh_5: 'transitions/whoosh_005.wav',

  // Combat music loops
  combat_loop_1: 'music/combat_loop_1.wav',
  combat_loop_2: 'music/combat_loop_2.wav',
};

/**
 * Initialize the soundbank — connect to the existing audio context.
 */
export function initSoundbank(ctx, sfx, music) {
  audioCtx = ctx;
  sfxGain = sfx;
  musicGain = music;
}

/**
 * Load all sounds. Call after audio context is initialized.
 * Loads lazily — doesn't block game start.
 */
export async function loadSounds() {
  if (!audioCtx || loaded) return;

  const promises = Object.entries(MANIFEST).map(async ([name, path]) => {
    try {
      const resp = await fetch(BASE + path);
      if (!resp.ok) return;
      const arrayBuf = await resp.arrayBuffer();
      const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
      buffers[name] = audioBuf;
    } catch (e) {
      // File not found or decode error — silently skip
    }
  });

  await Promise.allSettled(promises);
  loaded = true;
  console.log(`Soundbank: loaded ${Object.keys(buffers).length} / ${Object.keys(MANIFEST).length} sounds`);
}

/**
 * Play a named sound from the bank.
 * @param {string} name — sound name from MANIFEST
 * @param {Object} options — { volume, pan, loop, playbackRate }
 * @returns {AudioBufferSourceNode|null}
 */
export function playSound(name, options = {}) {
  const buf = buffers[name];
  if (!buf || !audioCtx) return null;

  const { volume = 1, panVal = 0, loop = false, playbackRate = 1 } = options;

  const source = audioCtx.createBufferSource();
  source.buffer = buf;
  source.loop = loop;
  source.playbackRate.value = playbackRate;

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volume;

  const panNode = audioCtx.createStereoPanner();
  panNode.pan.value = panVal;

  source.connect(gainNode);
  gainNode.connect(panNode);
  panNode.connect(options.music ? musicGain : sfxGain);

  source.start();
  return source;
}

/**
 * Play a random sound from a category prefix.
 * e.g., playRandom('growl') picks from growl_1 through growl_6
 */
export function playRandom(prefix, options = {}) {
  const matching = Object.keys(buffers).filter(k => k.startsWith(prefix + '_'));
  if (matching.length === 0) return null;
  const name = matching[Math.floor(Math.random() * matching.length)];
  return playSound(name, options);
}

/**
 * Check if a specific sound is loaded.
 */
export function hasSound(name) {
  return !!buffers[name];
}

/**
 * Check if the soundbank has any sounds loaded.
 */
export function isLoaded() {
  return loaded && Object.keys(buffers).length > 0;
}

// ========== CONVENIENCE FUNCTIONS ==========

/** Play a random zombie growl with spatial panning */
export function sbZombieGroan() {
  return playRandom('growl', { volume: 0.35, panVal: (Math.random() - 0.5) * 1.4 });
}

/** Play a random combat hit */
export function sbHit() {
  return playRandom('hit', { volume: 0.3 });
}

/** Play a bass impact */
export function sbBassImpact() {
  return playRandom('bass', { volume: 0.4 });
}

/** Play a ghost/eerie presence sound */
export function sbGhostNoise() {
  return playRandom('ghost', { volume: 0.25, panVal: (Math.random() - 0.5) * 1.6 });
}

/** Play a dark ambient SFX */
export function sbDarkSFX() {
  return playRandom('darksfx', { volume: 0.25 });
}

/** Play a tension riser (for dice rolls, dramatic moments) */
export function sbRiser() {
  return playRandom('riser', { volume: 0.3 });
}

/** Play a transition whoosh */
export function sbWhoosh() {
  return playRandom('whoosh', { volume: 0.25 });
}

/** Play a UI click */
export function sbClick() {
  return playRandom('click', { volume: 0.2 });
}

/** Start a drone loop for ambient background */
export function sbStartDrone(name = 'drone_1') {
  return playSound(name, { volume: 0.08, loop: true, music: true });
}

/** Start a soundscape loop */
export function sbStartSoundscape(name = 'soundscape_1') {
  return playSound(name, { volume: 0.06, loop: true, music: true });
}

/** Start combat music loop */
export function sbStartCombatLoop() {
  return playRandom('combat_loop', { volume: 0.12, loop: true, music: true });
}

/** Play a kick (heartbeat thud) */
export function sbKick() {
  return playRandom('kick', { volume: 0.3 });
}

/** Play a snap (gunshot layer) */
export function sbSnap() {
  return playRandom('snap', { volume: 0.3 });
}
