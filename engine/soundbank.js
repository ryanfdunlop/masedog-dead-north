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
  // Ambient drones — 12 total for scene variety
  drone_1: 'ambient/drone_001.wav',
  drone_2: 'ambient/drone_002.wav',
  drone_3: 'ambient/drone_003.wav',
  drone_4: 'ambient/drone_004.wav',
  drone_5: 'ambient/drone_006.wav',
  drone_6: 'ambient/drone_007.wav',
  drone_7: 'ambient/drone_008.wav',
  drone_8: 'ambient/drone_010.wav',
  drone_9: 'ambient/drone_015.wav',
  drone_10: 'ambient/drone_020.wav',
  drone_11: 'ambient/drone_030.wav',
  drone_12: 'ambient/drone_040.wav',

  // Soundscapes — 8 total for long-form atmosphere
  soundscape_1: 'ambient/soundscape_002.wav',
  soundscape_2: 'ambient/soundscape_003.wav',
  soundscape_3: 'ambient/soundscape_005.wav',
  soundscape_4: 'ambient/soundscape_010.wav',
  soundscape_5: 'ambient/soundscape_020.wav',
  soundscape_6: 'ambient/soundscape_030.wav',
  soundscape_7: 'ambient/soundscape_040.wav',
  soundscape_8: 'ambient/soundscape_050.wav',

  // Zombie growls — 6 variants
  growl_1: 'sfx/growl_001.wav',
  growl_2: 'sfx/growl_003.wav',
  growl_3: 'sfx/growl_004.wav',
  growl_4: 'sfx/growl_005.wav',
  growl_5: 'sfx/growl_006.wav',
  growl_6: 'sfx/growl_007.wav',

  // Ghost/eerie — 8 variants
  ghost_1: 'sfx/ghost_001.wav',
  ghost_2: 'sfx/ghost_002.wav',
  ghost_3: 'sfx/ghost_003.wav',
  ghost_4: 'sfx/ghost_004.wav',
  ghost_5: 'sfx/ghost_005.wav',
  ghost_6: 'sfx/ghost_010.wav',
  ghost_7: 'sfx/ghost_015.wav',
  ghost_8: 'sfx/ghost_020.wav',

  // Combat hits — 10 variants
  hit_1: 'sfx/hit_001.wav',
  hit_2: 'sfx/hit_002.wav',
  hit_3: 'sfx/hit_003.wav',
  hit_4: 'sfx/hit_004.wav',
  hit_5: 'sfx/hit_007.wav',
  hit_6: 'sfx/hit_008.wav',
  hit_7: 'sfx/hit_015.wav',
  hit_8: 'sfx/hit_030.wav',
  hit_9: 'sfx/hit_050.wav',
  hit_10: 'sfx/hit_080.wav',

  // Bass sub-impacts — 4 variants
  bass_1: 'sfx/bass_001.wav',
  bass_2: 'sfx/bass_002.wav',
  bass_3: 'sfx/bass_005.wav',
  bass_4: 'sfx/bass_008.wav',

  // Dark SFX — 8 variants
  darksfx_1: 'sfx/darksfx_001.wav',
  darksfx_2: 'sfx/darksfx_002.wav',
  darksfx_3: 'sfx/darksfx_003.wav',
  darksfx_4: 'sfx/darksfx_010.wav',
  darksfx_5: 'sfx/darksfx_020.wav',
  darksfx_6: 'sfx/darksfx_030.wav',
  darksfx_7: 'sfx/darksfx_050.wav',
  darksfx_8: 'sfx/darksfx_070.wav',

  // Exotic SFX — unique textures
  exotic_1: 'sfx/exotic_001.wav',
  exotic_2: 'sfx/exotic_010.wav',
  exotic_3: 'sfx/exotic_020.wav',
  exotic_4: 'sfx/exotic_030.wav',
  exotic_5: 'sfx/exotic_050.wav',

  // Percussion (UI + combat layer)
  kick_1: 'sfx/kick_1.wav',
  kick_2: 'sfx/kick_2.wav',
  snap_1: 'sfx/snap_1.wav',
  snap_2: 'sfx/snap_2.wav',
  click_1: 'ui/click_1.wav',
  click_2: 'ui/click_2.wav',
  click_3: 'ui/click_3.wav',

  // Tension risers — 8 variants
  riser_1: 'risers/riser_001.wav',
  riser_2: 'risers/riser_002.wav',
  riser_3: 'risers/riser_003.wav',
  riser_4: 'risers/riser_004.wav',
  riser_5: 'risers/riser_005.wav',
  riser_6: 'risers/riser_010.wav',
  riser_7: 'risers/riser_050.wav',
  riser_8: 'risers/riser_100.wav',

  // Transitions
  whoosh_1: 'transitions/whoosh_001.wav',
  whoosh_2: 'transitions/whoosh_002.wav',
  whoosh_3: 'transitions/whoosh_003.wav',
  whoosh_4: 'transitions/whoosh_004.wav',
  whoosh_5: 'transitions/whoosh_005.wav',

  // Combat music loops — 4 variants
  combat_loop_1: 'music/combat_loop_1.wav',
  combat_loop_2: 'music/combat_loop_2.wav',
  combat_loop_3: 'music/combat_loop_005.wav',
  combat_loop_4: 'music/combat_loop_010.wav',

  // Dark background ambient — LOOP THESE (Mason's picks)
  dark_bg_1: 'ambient/dark_bg_1.wav',  // "amazing dark background noise" — primary loop
  dark_bg_2: 'ambient/dark_bg_2.wav',  // DeLorean reese pad
  dark_bg_3: 'ambient/dark_bg_3.wav',  // Faster reese pad 01
  dark_bg_4: 'ambient/dark_bg_4.wav',  // Faster reese pad 02

  // Alarm sounds — hospital, emergency, danger
  alarm_1: 'sfx/alarm_1.wav',
  alarm_2: 'sfx/alarm_2.wav',

  // Clock ticking — high stakes countdown
  clock_tick: 'sfx/clock_tick.wav',

  // Scene transitions (Mason's picks)
  scene_piano: 'transitions/scene_piano.wav',    // "creepy dark piano keys — great!"
  scene_plucks: 'transitions/scene_plucks.wav',  // pluck scene change
  scene_reese: 'transitions/scene_reese.wav',    // reese pad scene change

  // Tunnel/underground ambient
  tunnel_ambient: 'ambient/tunnel_ambient.wav',  // "amazing ambient sounds in a tunnel"

  // Action scene music
  action_1: 'music/action_1.wav',

  // Sorrow/loss music — for game over, character death
  sorrow_1: 'music/sorrow_1.wav',
  sorrow_2: 'music/sorrow_2.wav',

  // Exploration music — journey, travel, discovery
  exploration_1: 'music/exploration_1.wav',
  exploration_2: 'music/exploration_2.wav',
  exploration_3: 'music/exploration_3.wav',

  // Hope/victory music — winning, reaching Ottawa, cure found
  hope_1: 'music/hope_1.wav',
  hope_2: 'music/hope_2.wav',
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

/** Start the dark background loop — Mason's favorite, plays a lot */
export function sbStartDarkBG(variant = null) {
  const name = variant || ['dark_bg_1', 'dark_bg_2', 'dark_bg_3', 'dark_bg_4'][Math.floor(Math.random() * 4)];
  return playSound(name, { volume: 0.08, loop: true, music: true });
}

/** Play alarm sound (hospital, emergency) */
export function sbAlarm() {
  return playRandom('alarm', { volume: 0.2 });
}

/** Start action music */
export function sbStartAction() {
  return playSound('action_1', { volume: 0.1, loop: true, music: true });
}

/** Start sorrow music (game over, death) */
export function sbStartSorrow() {
  return playRandom('sorrow', { volume: 0.1, loop: true, music: true });
}

/** Start exploration music (traveling, discovery) */
export function sbStartExploration() {
  return playRandom('exploration', { volume: 0.08, loop: true, music: true });
}

/** Start hope/victory music */
export function sbStartHope() {
  return playRandom('hope', { volume: 0.1, loop: true, music: true });
}

/** Play creepy piano scene transition */
export function sbScenePiano() {
  return playSound('scene_piano', { volume: 0.15 });
}

/** Play scene transition (random: piano, plucks, or reese) */
export function sbSceneTransition() {
  const choices = ['scene_piano', 'scene_plucks', 'scene_reese'];
  const pick = choices[Math.floor(Math.random() * choices.length)];
  return playSound(pick, { volume: 0.12 });
}

/** Start clock ticking — for high stakes timed choices */
export function sbStartClockTick() {
  return playSound('clock_tick', { volume: 0.2, loop: true });
}

/** Start tunnel ambient loop */
export function sbStartTunnel() {
  return playSound('tunnel_ambient', { volume: 0.06, loop: true, music: true });
}

/** Play an exotic/unique SFX texture */
export function sbExotic() {
  return playRandom('exotic', { volume: 0.2, panVal: (Math.random() - 0.5) * 1.0 });
}

/** Play a random soundscape (long atmosphere) */
export function sbSoundscape() {
  return playRandom('soundscape', { volume: 0.06, loop: true, music: true });
}

/**
 * Start scene-specific ambient based on game context.
 * Uses different drones/soundscapes for each region.
 */
export function sbStartSceneAmbient(scene) {
  const sceneMap = {
    hospital_room:    { drone: 'drone_1', scape: 'soundscape_1' },
    hospital:         { drone: 'drone_1', scape: 'soundscape_1' },
    hospital_hallway: { drone: 'drone_2', scape: 'soundscape_2' },
    hospital_outside: { drone: 'drone_3', scape: 'soundscape_3' },
    city_night:       { drone: 'drone_4', scape: 'soundscape_4' },
    forest:           { drone: 'drone_5', scape: 'soundscape_5' },
    mountains:        { drone: 'drone_6', scape: 'soundscape_6' },
    prairie:          { drone: 'drone_7', scape: 'soundscape_7' },
    lake:             { drone: 'drone_8', scape: 'soundscape_8' },
    winter:           { drone: 'drone_9', scape: 'soundscape_4' },
    ruins:            { drone: 'drone_10', scape: 'soundscape_5' },
    campfire:         { drone: 'drone_11', scape: 'soundscape_6' },
    ottawa:           { drone: 'drone_12', scape: 'soundscape_7' },
    highway:          { drone: 'drone_5', scape: 'soundscape_3' },
    skytrain:         { drone: 'drone_3', scape: 'soundscape_2' },
  };

  const mapping = sceneMap[scene] || sceneMap.highway;
  const sources = [];
  const d = playSound(mapping.drone, { volume: 0.05, loop: true, music: true });
  if (d) sources.push(d);
  const s = playSound(mapping.scape, { volume: 0.04, loop: true, music: true });
  if (s) sources.push(s);
  return sources;
}
