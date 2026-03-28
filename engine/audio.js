// ============================================================
// MASEDOG: Dead North — Audio Engine
// Procedural sound effects and ambient music using Web Audio API.
// No external audio files needed — everything is synthesized.
// ============================================================

let audioCtx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let currentAmbience = null;
let ambienceNodes = [];
let initialized = false;

// Volume settings
let masterVolume = 0.5;
let musicVolume = 0.3;
let sfxVolume = 0.6;

/**
 * Initialize the audio context. Must be called after user interaction.
 */
export function initAudio() {
  if (initialized) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = masterVolume;
    masterGain.connect(audioCtx.destination);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = musicVolume;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = sfxVolume;
    sfxGain.connect(masterGain);

    initialized = true;
  } catch (e) {
    console.warn('Web Audio API not supported:', e);
  }
}

/**
 * Resume audio context (needed after user gesture on mobile).
 */
export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

/**
 * Set volume levels (0-1).
 */
export function setVolume(master, music, sfx) {
  if (master !== undefined) { masterVolume = master; if (masterGain) masterGain.gain.value = master; }
  if (music !== undefined) { musicVolume = music; if (musicGain) musicGain.gain.value = music; }
  if (sfx !== undefined) { sfxVolume = sfx; if (sfxGain) sfxGain.gain.value = sfx; }
}

// ========== SOUND EFFECTS ==========

/**
 * Play a gunshot sound.
 */
export function playShotgun() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // Noise burst for the bang
  const noise = createNoise(0.15);
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.4, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3000, now);
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.15);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(sfxGain);
  noise.start(now);
  noise.stop(now + 0.15);

  // Low thump
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
  const oscGain = audioCtx.createGain();
  oscGain.gain.setValueAtTime(0.5, now);
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  osc.connect(oscGain);
  oscGain.connect(sfxGain);
  osc.start(now);
  osc.stop(now + 0.1);
}

/**
 * Play a pistol shot (lighter than shotgun).
 */
export function playPistol() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const noise = createNoise(0.08);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  noise.start(now);
  noise.stop(now + 0.08);
}

/**
 * Play a zombie groan.
 */
export function playZombieGroan() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const baseFreq = 80 + Math.random() * 40;

  const osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.linearRampToValueAtTime(baseFreq * 0.7, now + 0.8);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.5);
  gain.gain.linearRampToValueAtTime(0, now + 0.9);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  filter.Q.value = 2;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  osc.start(now);
  osc.stop(now + 0.9);
}

/**
 * Play a door/barricade slam.
 */
export function playSlam() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const noise = createNoise(0.1);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  noise.start(now);
  noise.stop(now + 0.1);
}

/**
 * Play a UI click/select sound.
 */
export function playUIClick() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.setValueAtTime(1000, now + 0.03);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(now);
  osc.stop(now + 0.06);
}

/**
 * Play a positive chime (success, loot found).
 */
export function playSuccess() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  [523, 659, 784].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.12, now + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.3);
  });
}

/**
 * Play a negative buzz (failure, damage).
 */
export function playFailure() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.linearRampToValueAtTime(100, now + 0.3);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.3);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * Play a heartbeat (tension / low health).
 */
export function playHeartbeat() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  for (let beat = 0; beat < 2; beat++) {
    const t = now + beat * 0.25;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 40 + beat * 10;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }
}

/**
 * Play typewriter tick (narration).
 */
export function playTypeTick() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 4000 + Math.random() * 1000;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.02, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(now);
  osc.stop(now + 0.015);
}

/**
 * Play a screamer zombie shriek.
 */
export function playScreamerShriek() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.linearRampToValueAtTime(2000, now + 0.2);
  osc.frequency.linearRampToValueAtTime(1500, now + 0.8);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.5);
  gain.gain.linearRampToValueAtTime(0, now + 0.8);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 3;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  osc.start(now);
  osc.stop(now + 0.8);
}

// ========== AMBIENT MUSIC ==========

/**
 * Start ambient music for a given mood.
 * Moods: 'exploration', 'tension', 'combat', 'sorrow', 'hope', 'winter'
 */
export function startAmbience(mood) {
  if (!audioCtx) return;
  if (currentAmbience === mood) return;

  stopAmbience();
  currentAmbience = mood;

  const params = AMBIENCE_PARAMS[mood] || AMBIENCE_PARAMS.exploration;

  // Base drone
  const drone = audioCtx.createOscillator();
  drone.type = params.droneWave;
  drone.frequency.value = params.droneFreq;
  const droneGain = audioCtx.createGain();
  droneGain.gain.value = params.droneVol;

  const droneFilter = audioCtx.createBiquadFilter();
  droneFilter.type = 'lowpass';
  droneFilter.frequency.value = params.droneFilterFreq;

  drone.connect(droneFilter);
  droneFilter.connect(droneGain);
  droneGain.connect(musicGain);
  drone.start();
  ambienceNodes.push(drone, droneGain, droneFilter);

  // Second oscillator for thickness
  const drone2 = audioCtx.createOscillator();
  drone2.type = params.drone2Wave || 'sine';
  drone2.frequency.value = params.droneFreq * params.drone2Ratio;
  const drone2Gain = audioCtx.createGain();
  drone2Gain.gain.value = params.droneVol * 0.5;
  drone2.connect(drone2Gain);
  drone2Gain.connect(musicGain);
  drone2.start();
  ambienceNodes.push(drone2, drone2Gain);

  // LFO for slow movement
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = params.lfoRate;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = params.lfoDepth;
  lfo.connect(lfoGain);
  lfoGain.connect(droneFilter.frequency);
  lfo.start();
  ambienceNodes.push(lfo, lfoGain);

  // Noise layer for texture
  if (params.noiseVol > 0) {
    const noise = createNoiseLoop();
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.value = params.noiseVol;
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = params.noiseFreq || 500;
    noiseFilter.Q.value = 0.5;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(musicGain);
    noise.start();
    ambienceNodes.push(noise, noiseGain, noiseFilter);
  }
}

/**
 * Stop all ambient music.
 */
export function stopAmbience() {
  for (const node of ambienceNodes) {
    try {
      if (node.stop) node.stop();
      node.disconnect();
    } catch (e) {}
  }
  ambienceNodes = [];
  currentAmbience = null;
}

/**
 * Cross-fade to a new ambience mood.
 */
export function crossfadeAmbience(newMood, duration = 2) {
  if (!audioCtx || currentAmbience === newMood) return;

  // Fade out current
  if (musicGain) {
    musicGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration / 2);
  }

  setTimeout(() => {
    stopAmbience();
    if (musicGain) musicGain.gain.value = musicVolume;
    startAmbience(newMood);
  }, (duration / 2) * 1000);
}

const AMBIENCE_PARAMS = {
  exploration: {
    droneWave: 'sine', droneFreq: 55, droneVol: 0.06, droneFilterFreq: 200,
    drone2Wave: 'sine', drone2Ratio: 1.5, lfoRate: 0.05, lfoDepth: 30,
    noiseVol: 0.01, noiseFreq: 300,
  },
  tension: {
    droneWave: 'sawtooth', droneFreq: 45, droneVol: 0.04, droneFilterFreq: 150,
    drone2Wave: 'triangle', drone2Ratio: 1.01, lfoRate: 0.15, lfoDepth: 20,
    noiseVol: 0.02, noiseFreq: 800,
  },
  combat: {
    droneWave: 'sawtooth', droneFreq: 60, droneVol: 0.08, droneFilterFreq: 400,
    drone2Wave: 'square', drone2Ratio: 1.5, lfoRate: 0.4, lfoDepth: 50,
    noiseVol: 0.03, noiseFreq: 1000,
  },
  sorrow: {
    droneWave: 'sine', droneFreq: 65, droneVol: 0.05, droneFilterFreq: 180,
    drone2Wave: 'sine', drone2Ratio: 1.25, lfoRate: 0.03, lfoDepth: 15,
    noiseVol: 0.005, noiseFreq: 200,
  },
  hope: {
    droneWave: 'sine', droneFreq: 130, droneVol: 0.04, droneFilterFreq: 400,
    drone2Wave: 'sine', drone2Ratio: 1.5, lfoRate: 0.04, lfoDepth: 25,
    noiseVol: 0, noiseFreq: 0,
  },
  winter: {
    droneWave: 'sine', droneFreq: 40, droneVol: 0.05, droneFilterFreq: 120,
    drone2Wave: 'triangle', drone2Ratio: 2, lfoRate: 0.02, lfoDepth: 10,
    noiseVol: 0.04, noiseFreq: 2000, // Wind noise
  },
};

// ========== HELPERS ==========

function createNoise(duration) {
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  return source;
}

function createNoiseLoop() {
  const bufferSize = audioCtx.sampleRate * 2; // 2 second loop
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

/**
 * Get the appropriate ambience mood for the current game state.
 */
export function getAmbienceForState(state) {
  if (!state) return 'exploration';

  if (state.meta.phase === 'GAME_OVER') return 'sorrow';
  if (state.meta.phase === 'VICTORY') return 'hope';
  if (state.meta.phase === 'MINIGAME') return 'combat';

  if (state.calendar.season === 'winter') return 'winter';
  if (state.player.health < 30) return 'tension';
  if (state.resources.food <= 1 || state.resources.water <= 1) return 'tension';

  const currentEvent = state.currentEvent;
  if (currentEvent) {
    if (currentEvent.type === 'combat') return 'combat';
    if (currentEvent.type === 'crisis') return 'tension';
    if (currentEvent.type === 'story') return 'tension';
  }

  return 'exploration';
}
