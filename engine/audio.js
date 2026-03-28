// ============================================================
// MASEDOG: Dead North — Enhanced Audio Engine
// Procedural sound effects + spatial panning + ambient layers.
// Ready for real audio files via Howler.js when available.
// ============================================================

let ctx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let initialized = false;
let currentAmbience = null;
let ambienceNodes = [];

// ========== INITIALIZATION ==========

export function initAudio() {
  if (initialized) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.3;
    musicGain.connect(masterGain);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(masterGain);

    initialized = true;
  } catch (e) {
    console.warn('Web Audio not available:', e);
  }
}

export function resumeAudio() {
  if (ctx?.state === 'suspended') ctx.resume();
}

export function setVolume(master, music, sfx) {
  if (master !== undefined && masterGain) masterGain.gain.value = Math.max(0, Math.min(1, master));
  if (music !== undefined && musicGain) musicGain.gain.value = Math.max(0, Math.min(1, music));
  if (sfx !== undefined && sfxGain) sfxGain.gain.value = Math.max(0, Math.min(1, sfx));
}

// ========== HELPERS ==========

function now() { return ctx ? ctx.currentTime : 0; }

function noise(duration) {
  if (!ctx) return null;
  const len = ctx.sampleRate * duration;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

function noiseLoop(duration = 2) {
  const src = noise(duration);
  if (src) src.loop = true;
  return src;
}

function osc(type, freq) {
  if (!ctx) return null;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  return o;
}

function gain(val = 1) {
  if (!ctx) return null;
  const g = ctx.createGain();
  g.gain.value = val;
  return g;
}

function filter(type, freq, q = 1) {
  if (!ctx) return null;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

/** Create a stereo panner. -1 = left, 0 = center, +1 = right */
function panner(pan = 0) {
  if (!ctx) return null;
  const p = ctx.createStereoPanner();
  p.pan.value = pan;
  return p;
}

function play(src, chain, start = 0, stop = null) {
  if (!src || !ctx) return;
  let node = src;
  for (const c of chain) { if (c) { node.connect(c); node = c; } }
  node.connect(sfxGain);
  src.start(now() + start);
  if (stop) src.stop(now() + stop);
}

// ========== SOUND EFFECTS ==========

export function playShotgun() {
  if (!ctx) return;
  const t = now();
  // Noise burst
  const n = noise(0.2);
  const ng = gain(0.35);
  ng.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
  const nf = filter('lowpass', 2500);
  nf.frequency.exponentialRampToValueAtTime(200, t + 0.2);
  play(n, [nf, ng], 0, 0.2);
  // Low boom
  const o = osc('sine', 120);
  const og = gain(0.4);
  og.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
  o.frequency.exponentialRampToValueAtTime(30, t + 0.12);
  play(o, [og], 0, 0.12);
  // Click
  const c = osc('square', 3000);
  const cg = gain(0.08);
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  play(c, [cg], 0, 0.03);
}

export function playPistol() {
  if (!ctx) return;
  const t = now();
  const n = noise(0.1);
  const ng = gain(0.2);
  ng.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  const nf = filter('highpass', 800);
  play(n, [nf, ng], 0, 0.1);
  const o = osc('sine', 200);
  const og = gain(0.15);
  og.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
  play(o, [og], 0, 0.06);
}

export function playZombieGroan() {
  if (!ctx) return;
  const t = now();
  const base = 70 + Math.random() * 40;
  const duration = 0.8 + Math.random() * 0.5;
  const pan = (Math.random() - 0.5) * 1.6; // Random left/right

  const o = osc('sawtooth', base);
  o.frequency.linearRampToValueAtTime(base * 0.65, t + duration);
  const g1 = gain(0);
  g1.gain.linearRampToValueAtTime(0.1, t + 0.1);
  g1.gain.linearRampToValueAtTime(0.07, t + duration * 0.6);
  g1.gain.linearRampToValueAtTime(0, t + duration);
  const f1 = filter('lowpass', 350, 3);
  // Wobble the filter for organic feel
  const lfo = osc('sine', 3 + Math.random() * 4);
  const lfoG = gain(30);
  lfo.connect(lfoG);
  lfoG.connect(f1.frequency);
  lfo.start(t);
  lfo.stop(t + duration);
  const p = panner(pan);
  play(o, [f1, g1, p], 0, duration);
}

export function playScreamerShriek() {
  if (!ctx) return;
  const t = now();
  const o = osc('sawtooth', 700);
  o.frequency.linearRampToValueAtTime(2200, t + 0.15);
  o.frequency.linearRampToValueAtTime(1800, t + 0.6);
  o.frequency.linearRampToValueAtTime(1200, t + 0.9);
  const g1 = gain(0);
  g1.gain.linearRampToValueAtTime(0.18, t + 0.05);
  g1.gain.linearRampToValueAtTime(0.12, t + 0.5);
  g1.gain.linearRampToValueAtTime(0, t + 0.9);
  const f1 = filter('bandpass', 1400, 4);
  play(o, [f1, g1], 0, 0.9);
  // High overtone
  const o2 = osc('square', 1400);
  o2.frequency.linearRampToValueAtTime(3000, t + 0.2);
  const g2 = gain(0.04);
  g2.gain.linearRampToValueAtTime(0, t + 0.5);
  play(o2, [g2], 0, 0.5);
}

export function playSlam() {
  if (!ctx) return;
  const t = now();
  const n = noise(0.12);
  const ng = gain(0.3);
  ng.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
  const nf = filter('lowpass', 400);
  play(n, [nf, ng], 0, 0.12);
}

export function playUIClick() {
  if (!ctx) return;
  const t = now();
  const o = osc('square', 800);
  o.frequency.setValueAtTime(1100, t + 0.02);
  const g1 = gain(0.06);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  play(o, [g1], 0, 0.05);
}

export function playSuccess() {
  if (!ctx) return;
  const t = now();
  [523, 659, 784].forEach((freq, i) => {
    const o = osc('sine', freq);
    const g1 = gain(0);
    g1.gain.linearRampToValueAtTime(0.1, t + i * 0.1 + 0.02);
    g1.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.35);
    play(o, [g1], i * 0.1, i * 0.1 + 0.35);
  });
}

export function playFailure() {
  if (!ctx) return;
  const t = now();
  const o = osc('sawtooth', 220);
  o.frequency.linearRampToValueAtTime(100, t + 0.35);
  const g1 = gain(0.12);
  g1.gain.linearRampToValueAtTime(0, t + 0.35);
  const f1 = filter('lowpass', 500);
  play(o, [f1, g1], 0, 0.35);
}

export function playHeartbeat() {
  if (!ctx) return;
  const t = now();
  for (let beat = 0; beat < 2; beat++) {
    const delay = beat * 0.28;
    const o = osc('sine', 35 + beat * 8);
    const g1 = gain(0);
    g1.gain.linearRampToValueAtTime(0.2, t + delay + 0.03);
    g1.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.18);
    play(o, [g1], delay, delay + 0.18);
  }
}

export function playTypeTick() {
  if (!ctx) return;
  const t = now();
  const o = osc('square', 3500 + Math.random() * 1500);
  const g1 = gain(0.015);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
  play(o, [g1], 0, 0.012);
}

export function playDoorCreak() {
  if (!ctx) return;
  const t = now();
  const duration = 1.2;
  const o = osc('sawtooth', 200);
  // Creaking sweep up and down
  o.frequency.linearRampToValueAtTime(350, t + 0.3);
  o.frequency.linearRampToValueAtTime(180, t + 0.6);
  o.frequency.linearRampToValueAtTime(400, t + 0.9);
  o.frequency.linearRampToValueAtTime(150, t + duration);
  const g1 = gain(0);
  g1.gain.linearRampToValueAtTime(0.06, t + 0.1);
  g1.gain.linearRampToValueAtTime(0.04, t + 0.8);
  g1.gain.linearRampToValueAtTime(0, t + duration);
  const f1 = filter('bandpass', 250, 8);
  play(o, [f1, g1], 0, duration);
}

export function playGlassBreak() {
  if (!ctx) return;
  const t = now();
  // High frequency shatter
  const n = noise(0.3);
  const ng = gain(0.2);
  ng.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
  const nf = filter('highpass', 2000);
  play(n, [nf, ng], 0, 0.3);
  // Tinkling fragments
  for (let i = 0; i < 4; i++) {
    const delay = 0.05 + i * 0.06;
    const freq = 3000 + Math.random() * 4000;
    const o = osc('sine', freq);
    const g1 = gain(0.04);
    g1.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.15);
    play(o, [g1], delay, delay + 0.15);
  }
}

export function playFootstep(surface = 'concrete') {
  if (!ctx) return;
  const t = now();
  const pan = (Math.random() - 0.5) * 0.6; // Slight random panning
  const n = noise(0.08);
  const ng = gain(surface === 'snow' ? 0.06 : 0.12);
  ng.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
  const freq = surface === 'snow' ? 5000 : surface === 'gravel' ? 3000 : 1500;
  const nf = filter('lowpass', freq);
  const p = panner(pan);
  play(n, [nf, ng, p], 0, 0.08);
}

export function playDiceRoll() {
  if (!ctx) return;
  const t = now();
  // Multiple clacks
  for (let i = 0; i < 6; i++) {
    const delay = i * 0.05 + Math.random() * 0.03;
    const n = noise(0.03);
    const ng = gain(0.08 * (1 - i * 0.12));
    ng.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.03);
    const nf = filter('bandpass', 2000 + Math.random() * 2000, 2);
    play(n, [nf, ng], delay, delay + 0.03);
  }
}

export function playCrickets() {
  if (!ctx) return;
  const t = now();
  const duration = 3;
  // Multiple chirps at random intervals
  for (let i = 0; i < 8; i++) {
    const delay = Math.random() * duration;
    const chirpLen = 0.05 + Math.random() * 0.03;
    const freq = 4000 + Math.random() * 2000;
    const pan = (Math.random() - 0.5) * 1.8; // Wide stereo field
    const o = osc('sine', freq);
    // Rapid on/off for chirp
    const g1 = gain(0);
    g1.gain.setValueAtTime(0.02, t + delay);
    g1.gain.setValueAtTime(0, t + delay + chirpLen);
    g1.gain.setValueAtTime(0.02, t + delay + chirpLen * 2);
    g1.gain.setValueAtTime(0, t + delay + chirpLen * 3);
    const p = panner(pan);
    play(o, [g1, p], delay, delay + chirpLen * 4);
  }
}

export function playWindGust() {
  if (!ctx) return;
  const t = now();
  const duration = 2.5;
  const n = noiseLoop();
  const ng = gain(0);
  ng.gain.linearRampToValueAtTime(0.08, t + 0.5);
  ng.gain.linearRampToValueAtTime(0.12, t + 1);
  ng.gain.linearRampToValueAtTime(0.03, t + 2);
  ng.gain.linearRampToValueAtTime(0, t + duration);
  const nf = filter('bandpass', 400, 0.5);
  // Sweep the filter for wind movement
  nf.frequency.linearRampToValueAtTime(800, t + 1);
  nf.frequency.linearRampToValueAtTime(300, t + duration);
  const p = panner(-0.4 + Math.random() * 0.8);
  play(n, [nf, ng, p], 0, duration);
}

export function playOwlHoot() {
  if (!ctx) return;
  const t = now();
  const pan = Math.random() > 0.5 ? -0.7 : 0.7; // Left or right
  // Two-tone hoot
  for (let i = 0; i < 2; i++) {
    const delay = i * 0.4;
    const freq = i === 0 ? 380 : 320;
    const o = osc('sine', freq);
    o.frequency.linearRampToValueAtTime(freq * 0.9, t + delay + 0.25);
    const g1 = gain(0);
    g1.gain.linearRampToValueAtTime(0.06, t + delay + 0.05);
    g1.gain.linearRampToValueAtTime(0.04, t + delay + 0.15);
    g1.gain.linearRampToValueAtTime(0, t + delay + 0.3);
    const p = panner(pan);
    play(o, [g1, p], delay, delay + 0.3);
  }
}

export function playHeartMonitor(flatline = false) {
  if (!ctx) return;
  const t = now();
  if (flatline) {
    // Continuous tone
    const o = osc('sine', 1000);
    const g1 = gain(0.08);
    play(o, [g1], 0, 2);
  } else {
    // Regular beeps
    for (let i = 0; i < 3; i++) {
      const o = osc('sine', 1000);
      const g1 = gain(0.06);
      g1.gain.exponentialRampToValueAtTime(0.001, t + i * 0.8 + 0.1);
      play(o, [g1], i * 0.8, i * 0.8 + 0.1);
    }
  }
}

export function playFireCrackle() {
  if (!ctx) return;
  const t = now();
  for (let i = 0; i < 5; i++) {
    const delay = Math.random() * 1.5;
    const n = noise(0.04);
    const ng = gain(0.04 + Math.random() * 0.04);
    ng.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.04);
    const nf = filter('bandpass', 1000 + Math.random() * 3000, 2);
    const p = panner((Math.random() - 0.5) * 0.6);
    play(n, [nf, ng, p], delay, delay + 0.04);
  }
}

export function playRainLoop() {
  if (!ctx) return;
  const t = now();
  const n = noiseLoop();
  const ng = gain(0.06);
  const nf = filter('lowpass', 3000, 0.3);
  n.connect(nf);
  nf.connect(ng);
  ng.connect(musicGain);
  n.start(t);
  ambienceNodes.push(n, ng, nf);
}

export function playThunder() {
  if (!ctx) return;
  const t = now();
  const pan = (Math.random() - 0.5) * 1.4;
  // Initial crack
  const n1 = noise(0.15);
  const n1g = gain(0.25);
  n1g.gain.exponentialRampToValueAtTime(0.05, t + 0.15);
  const n1f = filter('lowpass', 1500);
  const p1 = panner(pan);
  play(n1, [n1f, n1g, p1], 0, 0.15);
  // Rolling rumble
  const n2 = noise(2);
  const n2g = gain(0);
  n2g.gain.linearRampToValueAtTime(0.1, t + 0.2);
  n2g.gain.linearRampToValueAtTime(0.06, t + 1);
  n2g.gain.linearRampToValueAtTime(0, t + 2);
  const n2f = filter('lowpass', 200);
  const p2 = panner(pan * 0.5);
  play(n2, [n2f, n2g, p2], 0.1, 2.1);
}

// ========== AMBIENT MUSIC ==========

const AMBIENCE = {
  exploration: { wave: 'sine', freq: 55, vol: 0.05, filter: 200, lfo: 0.05, depth: 30, noise: 0.01, noiseFreq: 300 },
  tension:     { wave: 'sawtooth', freq: 45, vol: 0.04, filter: 150, lfo: 0.15, depth: 20, noise: 0.02, noiseFreq: 800 },
  combat:      { wave: 'sawtooth', freq: 60, vol: 0.07, filter: 400, lfo: 0.4, depth: 50, noise: 0.03, noiseFreq: 1000 },
  sorrow:      { wave: 'sine', freq: 65, vol: 0.04, filter: 180, lfo: 0.03, depth: 15, noise: 0.005, noiseFreq: 200 },
  hope:        { wave: 'sine', freq: 130, vol: 0.04, filter: 400, lfo: 0.04, depth: 25, noise: 0, noiseFreq: 0 },
  winter:      { wave: 'sine', freq: 40, vol: 0.04, filter: 120, lfo: 0.02, depth: 10, noise: 0.04, noiseFreq: 2000 },
};

export function startAmbience(mood) {
  if (!ctx || currentAmbience === mood) return;
  stopAmbience();
  currentAmbience = mood;
  const p = AMBIENCE[mood] || AMBIENCE.exploration;

  const drone = osc(p.wave, p.freq);
  const dg = gain(p.vol);
  const df = filter('lowpass', p.filter);
  drone.connect(df); df.connect(dg); dg.connect(musicGain);
  drone.start();
  ambienceNodes.push(drone, dg, df);

  const drone2 = osc('sine', p.freq * 1.5);
  const d2g = gain(p.vol * 0.4);
  drone2.connect(d2g); d2g.connect(musicGain);
  drone2.start();
  ambienceNodes.push(drone2, d2g);

  const lfo = osc('sine', p.lfo);
  const lfog = gain(p.depth);
  lfo.connect(lfog); lfog.connect(df.frequency);
  lfo.start();
  ambienceNodes.push(lfo, lfog);

  if (p.noise > 0) {
    const n = noiseLoop();
    const ng = gain(p.noise);
    const nf = filter('bandpass', p.noiseFreq, 0.5);
    n.connect(nf); nf.connect(ng); ng.connect(musicGain);
    n.start();
    ambienceNodes.push(n, ng, nf);
  }
}

export function stopAmbience() {
  for (const node of ambienceNodes) {
    try { if (node.stop) node.stop(); node.disconnect(); } catch (e) {}
  }
  ambienceNodes = [];
  currentAmbience = null;
}

export function crossfadeAmbience(newMood, duration = 2) {
  if (!ctx || currentAmbience === newMood) return;
  if (musicGain) musicGain.gain.linearRampToValueAtTime(0, now() + duration / 2);
  setTimeout(() => {
    stopAmbience();
    if (musicGain) musicGain.gain.value = 0.3;
    startAmbience(newMood);
  }, (duration / 2) * 1000);
}

export function getAmbienceForState(state) {
  if (!state) return 'exploration';
  if (state.meta.phase === 'GAME_OVER') return 'sorrow';
  if (state.meta.phase === 'VICTORY') return 'hope';
  if (state.meta.phase === 'MINIGAME') return 'combat';
  if (state.calendar?.season === 'winter') return 'winter';
  if (state.player?.health < 30) return 'tension';
  if (state.resources?.food <= 1 || state.resources?.water <= 1) return 'tension';
  if (state.currentEvent?.type === 'combat') return 'combat';
  if (state.currentEvent?.type === 'crisis') return 'tension';
  return 'exploration';
}
