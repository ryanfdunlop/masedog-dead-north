// ============================================================
// MASEDOG: Dead North — Pro Audio Engine
// Layered procedural sound design using Web Audio API.
// Multiple oscillators + noise + filters + reverb = realistic.
// ============================================================

let ctx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let reverbNode = null;
let initialized = false;
let currentAmbience = null;
let ambienceNodes = [];

// ========== INITIALIZATION ==========

export function initAudio() {
  if (initialized) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(ctx.destination);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.35;
    musicGain.connect(masterGain);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.7;
    sfxGain.connect(masterGain);

    // Create reverb for spatial depth
    reverbNode = createReverb(1.5, 2);
    reverbNode.connect(masterGain);

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

// ========== REVERB ==========

function createReverb(duration, decay) {
  if (!ctx) return null;
  const rate = ctx.sampleRate;
  const len = rate * duration;
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = buf;
  return conv;
}

// ========== HELPERS ==========

function t() { return ctx ? ctx.currentTime : 0; }

function noise(dur) {
  if (!ctx) return null;
  const len = ctx.sampleRate * dur;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource();
  s.buffer = buf;
  return s;
}

function noiseLoop(dur = 2) {
  const s = noise(dur);
  if (s) s.loop = true;
  return s;
}

function osc(type, freq) {
  if (!ctx) return null;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  return o;
}

function g(val = 1) {
  if (!ctx) return null;
  const n = ctx.createGain();
  n.gain.value = val;
  return n;
}

function filt(type, freq, q = 1) {
  if (!ctx) return null;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function pan(val = 0) {
  if (!ctx) return null;
  const p = ctx.createStereoPanner();
  p.pan.value = val;
  return p;
}

/** Connect a chain of nodes and play */
function chain(src, nodes, dest, start = 0, stop = null) {
  if (!src || !ctx) return;
  let n = src;
  for (const c of nodes) { if (c) { n.connect(c); n = c; } }
  n.connect(dest || sfxGain);
  const now = t();
  src.start(now + start);
  if (stop) src.stop(now + stop);
}

/** Play through reverb for spatial depth */
function withReverb(src, nodes, dryVol = 0.7, wetVol = 0.3) {
  if (!src || !ctx || !reverbNode) return;
  let n = src;
  for (const c of nodes) { if (c) { n.connect(c); n = c; } }
  // Dry path
  const dry = g(dryVol);
  n.connect(dry);
  dry.connect(sfxGain);
  // Wet path (reverb)
  const wet = g(wetVol);
  n.connect(wet);
  wet.connect(reverbNode);
}

// ========== SOUND EFFECTS ==========

export function playShotgun() {
  if (!ctx) return;
  const now = t();
  // Layer 1: sharp transient crack
  const n1 = noise(0.04);
  const n1g = g(0.5);
  n1g.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
  const n1f = filt('highpass', 2000);
  chain(n1, [n1f, n1g], sfxGain, 0, 0.04);
  // Layer 2: body boom
  const n2 = noise(0.25);
  const n2g = g(0.4);
  n2g.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
  const n2f = filt('lowpass', 800);
  n2f.frequency.exponentialRampToValueAtTime(100, now + 0.2);
  chain(n2, [n2f, n2g], sfxGain, 0, 0.25);
  // Layer 3: sub thump
  const o1 = osc('sine', 80);
  const o1g = g(0.5);
  o1g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  o1.frequency.exponentialRampToValueAtTime(20, now + 0.15);
  chain(o1, [o1g], sfxGain, 0, 0.15);
  // Layer 4: mechanical click
  const n3 = noise(0.015);
  const n3g = g(0.2);
  n3g.gain.exponentialRampToValueAtTime(0.01, now + 0.015);
  const n3f = filt('bandpass', 4000, 5);
  chain(n3, [n3f, n3g], sfxGain, 0, 0.02);
}

export function playPistol() {
  if (!ctx) return;
  const now = t();
  const n1 = noise(0.08);
  const n1g = g(0.3);
  n1g.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
  const n1f = filt('bandpass', 2000, 2);
  chain(n1, [n1f, n1g], sfxGain, 0, 0.08);
  const o1 = osc('sine', 150);
  const o1g = g(0.2);
  o1g.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
  chain(o1, [o1g], sfxGain, 0, 0.07);
}

export function playZombieGroan() {
  if (!ctx) return;
  const now = t();
  const base = 65 + Math.random() * 35;
  const dur = 1.2 + Math.random() * 0.8;
  const p1 = pan((Math.random() - 0.5) * 1.6);

  // Vocal formant 1
  const o1 = osc('sawtooth', base);
  o1.frequency.linearRampToValueAtTime(base * 0.6, now + dur);
  const f1 = filt('bandpass', 300, 4);
  const lfo1 = osc('sine', 2 + Math.random() * 3);
  const lfo1g = g(40);
  lfo1.connect(lfo1g); lfo1g.connect(f1.frequency);
  lfo1.start(now); lfo1.stop(now + dur);
  const g1 = g(0);
  g1.gain.linearRampToValueAtTime(0.12, now + 0.15);
  g1.gain.linearRampToValueAtTime(0.08, now + dur * 0.7);
  g1.gain.linearRampToValueAtTime(0, now + dur);
  chain(o1, [f1, g1, p1], sfxGain, 0, dur);

  // Vocal formant 2 (higher, breathier)
  const o2 = osc('sawtooth', base * 1.5);
  o2.frequency.linearRampToValueAtTime(base * 0.9, now + dur);
  const f2 = filt('bandpass', 800, 3);
  const g2 = g(0);
  g2.gain.linearRampToValueAtTime(0.04, now + 0.2);
  g2.gain.linearRampToValueAtTime(0.02, now + dur * 0.6);
  g2.gain.linearRampToValueAtTime(0, now + dur);
  chain(o2, [f2, g2, p1], sfxGain, 0, dur);

  // Breath noise layer
  const n1 = noise(dur);
  const ng = g(0);
  ng.gain.linearRampToValueAtTime(0.03, now + 0.1);
  ng.gain.linearRampToValueAtTime(0.05, now + dur * 0.5);
  ng.gain.linearRampToValueAtTime(0, now + dur);
  const nf = filt('bandpass', 500, 1);
  chain(n1, [nf, ng, p1], sfxGain, 0, dur);
}

export function playScreamerShriek() {
  if (!ctx) return;
  const now = t();
  // Main shriek — rising pitch
  const o1 = osc('sawtooth', 600);
  o1.frequency.exponentialRampToValueAtTime(2500, now + 0.15);
  o1.frequency.linearRampToValueAtTime(2000, now + 0.6);
  o1.frequency.linearRampToValueAtTime(800, now + 1.0);
  const f1 = filt('bandpass', 1500, 3);
  f1.frequency.linearRampToValueAtTime(2500, now + 0.2);
  f1.frequency.linearRampToValueAtTime(1000, now + 1.0);
  const g1 = g(0);
  g1.gain.linearRampToValueAtTime(0.2, now + 0.04);
  g1.gain.setValueAtTime(0.18, now + 0.3);
  g1.gain.linearRampToValueAtTime(0, now + 1.0);
  chain(o1, [f1, g1], sfxGain, 0, 1.0);
  // Noise layer for rasp
  const n1 = noise(0.8);
  const ng = g(0);
  ng.gain.linearRampToValueAtTime(0.08, now + 0.05);
  ng.gain.linearRampToValueAtTime(0, now + 0.8);
  const nf = filt('highpass', 1500);
  chain(n1, [nf, ng], sfxGain, 0, 0.8);
}

export function playSlam() {
  if (!ctx) return;
  const now = t();
  // Impact
  const n1 = noise(0.15);
  const n1g = g(0.4);
  n1g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  const n1f = filt('lowpass', 600);
  chain(n1, [n1f, n1g], sfxGain, 0, 0.15);
  // Rattle
  const n2 = noise(0.3);
  const n2g = g(0.08);
  n2g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  const n2f = filt('bandpass', 1500, 2);
  chain(n2, [n2f, n2g], sfxGain, 0.05, 0.35);
  // Sub
  const o1 = osc('sine', 60);
  const o1g = g(0.3);
  o1g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  chain(o1, [o1g], sfxGain, 0, 0.1);
}

export function playUIClick() {
  if (!ctx) return;
  const now = t();
  const o1 = osc('sine', 800);
  o1.frequency.setValueAtTime(1200, now + 0.015);
  const g1 = g(0.08);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  chain(o1, [g1], sfxGain, 0, 0.04);
}

export function playSuccess() {
  if (!ctx) return;
  const now = t();
  [523, 659, 784, 1047].forEach((freq, i) => {
    const o1 = osc('sine', freq);
    const g1 = g(0);
    g1.gain.linearRampToValueAtTime(0.1, now + i * 0.12 + 0.02);
    g1.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
    chain(o1, [g1], sfxGain, i * 0.12, i * 0.12 + 0.4);
    // Octave shimmer
    const o2 = osc('sine', freq * 2);
    const g2 = g(0);
    g2.gain.linearRampToValueAtTime(0.03, now + i * 0.12 + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
    chain(o2, [g2], sfxGain, i * 0.12, i * 0.12 + 0.3);
  });
}

export function playFailure() {
  if (!ctx) return;
  const now = t();
  const o1 = osc('sawtooth', 250);
  o1.frequency.linearRampToValueAtTime(80, now + 0.5);
  const f1 = filt('lowpass', 600);
  f1.frequency.linearRampToValueAtTime(200, now + 0.5);
  const g1 = g(0.15);
  g1.gain.linearRampToValueAtTime(0, now + 0.5);
  chain(o1, [f1, g1], sfxGain, 0, 0.5);
  // Dissonant second voice
  const o2 = osc('square', 233);
  o2.frequency.linearRampToValueAtTime(75, now + 0.4);
  const g2 = g(0.04);
  g2.gain.linearRampToValueAtTime(0, now + 0.4);
  chain(o2, [g2], sfxGain, 0, 0.4);
}

export function playHeartbeat() {
  if (!ctx) return;
  const now = t();
  for (let beat = 0; beat < 2; beat++) {
    const d = beat * 0.28;
    const o1 = osc('sine', 35 + beat * 8);
    const g1 = g(0);
    g1.gain.linearRampToValueAtTime(0.25, now + d + 0.03);
    g1.gain.exponentialRampToValueAtTime(0.01, now + d + 0.2);
    chain(o1, [g1], sfxGain, d, d + 0.2);
  }
}

export function playTypeTick() {
  if (!ctx) return;
  const now = t();
  const o1 = osc('square', 3000 + Math.random() * 2000);
  const g1 = g(0.02);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
  chain(o1, [g1], sfxGain, 0, 0.01);
}

export function playHeartMonitor(flatline = false) {
  if (!ctx) return;
  const now = t();
  if (flatline) {
    const o1 = osc('sine', 1000);
    const g1 = g(0.15);
    chain(o1, [g1], sfxGain, 0, 3);
  } else {
    for (let i = 0; i < 5; i++) {
      // Main beep
      const o1 = osc('sine', 1000);
      const g1 = g(0.2);
      g1.gain.setValueAtTime(0.2, now + i * 0.85);
      g1.gain.exponentialRampToValueAtTime(0.001, now + i * 0.85 + 0.12);
      chain(o1, [g1], sfxGain, i * 0.85, i * 0.85 + 0.12);
      // Soft echo
      const o2 = osc('sine', 1000);
      const g2 = g(0.04);
      g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.85 + 0.2);
      chain(o2, [g2], sfxGain, i * 0.85 + 0.06, i * 0.85 + 0.2);
    }
  }
}

export function playHospitalAmbient() {
  if (!ctx) return;
  const now = t();
  // Fluorescent hum (layered)
  const h1 = osc('sawtooth', 100);
  const h1g = g(0.025);
  const h1f = filt('lowpass', 250);
  chain(h1, [h1f, h1g], sfxGain, 0, 6);
  const h2 = osc('sine', 120);
  const h2g = g(0.015);
  chain(h2, [h2g], sfxGain, 0, 6);
  // Distant clamoring (shaped noise with movement)
  const n1 = noise(5);
  const n1g = g(0);
  n1g.gain.linearRampToValueAtTime(0.04, now + 0.5);
  n1g.gain.linearRampToValueAtTime(0.07, now + 2);
  n1g.gain.linearRampToValueAtTime(0.03, now + 4);
  n1g.gain.linearRampToValueAtTime(0, now + 5);
  const n1f = filt('bandpass', 600, 1.5);
  n1f.frequency.linearRampToValueAtTime(1000, now + 2);
  n1f.frequency.linearRampToValueAtTime(400, now + 4);
  const p1 = pan(-0.5 + Math.random());
  chain(n1, [n1f, n1g, p1], sfxGain, 0, 5);
  // PA crackle
  if (Math.random() > 0.4) {
    const d = 1 + Math.random() * 3;
    const pa = noise(0.4);
    const pag = g(0.05);
    pag.gain.exponentialRampToValueAtTime(0.001, now + d + 0.4);
    const paf = filt('bandpass', 1200, 4);
    chain(pa, [paf, pag, pan(0.3)], sfxGain, d, d + 0.4);
  }
  // Distant muffled voice/scream
  if (Math.random() > 0.5) {
    const d = 2 + Math.random() * 2;
    const v = osc('sawtooth', 250 + Math.random() * 200);
    v.frequency.linearRampToValueAtTime(450, now + d + 0.3);
    v.frequency.linearRampToValueAtTime(200, now + d + 0.6);
    const vg = g(0);
    vg.gain.linearRampToValueAtTime(0.04, now + d + 0.05);
    vg.gain.linearRampToValueAtTime(0.02, now + d + 0.3);
    vg.gain.linearRampToValueAtTime(0, now + d + 0.6);
    const vf = filt('lowpass', 700);
    chain(v, [vf, vg, pan((Math.random() - 0.5) * 1.4)], sfxGain, d, d + 0.6);
  }
}

export function playDoorCreak() {
  if (!ctx) return;
  const now = t();
  const dur = 1.5;
  // Main creak — multiple formants
  const o1 = osc('sawtooth', 180);
  o1.frequency.linearRampToValueAtTime(320, now + 0.3);
  o1.frequency.linearRampToValueAtTime(150, now + 0.7);
  o1.frequency.linearRampToValueAtTime(380, now + 1.0);
  o1.frequency.linearRampToValueAtTime(120, now + dur);
  const f1 = filt('bandpass', 220, 10);
  const g1 = g(0);
  g1.gain.linearRampToValueAtTime(0.07, now + 0.1);
  g1.gain.linearRampToValueAtTime(0.05, now + 0.8);
  g1.gain.linearRampToValueAtTime(0, now + dur);
  chain(o1, [f1, g1, pan((Math.random() - 0.5) * 1.2)], sfxGain, 0, dur);
  // High squeak
  const o2 = osc('sawtooth', 800);
  o2.frequency.linearRampToValueAtTime(1200, now + 0.4);
  o2.frequency.linearRampToValueAtTime(600, now + 0.8);
  const f2 = filt('bandpass', 900, 8);
  const g2 = g(0);
  g2.gain.linearRampToValueAtTime(0.02, now + 0.2);
  g2.gain.linearRampToValueAtTime(0, now + 1.0);
  chain(o2, [f2, g2], sfxGain, 0.1, 1.1);
}

export function playGlassBreak() {
  if (!ctx) return;
  const now = t();
  // Initial shatter
  const n1 = noise(0.15);
  const n1g = g(0.25);
  n1g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  const n1f = filt('highpass', 3000);
  chain(n1, [n1f, n1g], sfxGain, 0, 0.15);
  // Tinkling shards (8 tiny hits)
  for (let i = 0; i < 8; i++) {
    const d = 0.05 + i * 0.04 + Math.random() * 0.03;
    const freq = 2500 + Math.random() * 5000;
    const o1 = osc('sine', freq);
    const g1 = g(0.05 - i * 0.005);
    g1.gain.exponentialRampToValueAtTime(0.001, now + d + 0.1);
    chain(o1, [g1, pan((Math.random() - 0.5) * 1.4)], sfxGain, d, d + 0.1);
  }
  // Impact thud
  const o2 = osc('sine', 100);
  const g2 = g(0.15);
  g2.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
  chain(o2, [g2], sfxGain, 0, 0.08);
}

export function playFootstep(surface = 'concrete') {
  if (!ctx) return;
  const now = t();
  const p1 = pan((Math.random() - 0.5) * 0.6);
  const n1 = noise(0.1);
  const freq = surface === 'snow' ? 6000 : surface === 'gravel' ? 3500 : 1800;
  const vol = surface === 'snow' ? 0.06 : 0.12;
  const n1g = g(vol);
  n1g.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
  const n1f = filt('lowpass', freq);
  chain(n1, [n1f, n1g, p1], sfxGain, 0, 0.1);
  // Heel impact
  const o1 = osc('sine', 80);
  const g1 = g(vol * 0.5);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  chain(o1, [g1, p1], sfxGain, 0, 0.04);
}

export function playDiceRoll() {
  if (!ctx) return;
  const now = t();
  for (let i = 0; i < 8; i++) {
    const d = i * 0.04 + Math.random() * 0.02;
    const n1 = noise(0.025);
    const n1g = g(0.1 * (1 - i * 0.1));
    n1g.gain.exponentialRampToValueAtTime(0.001, now + d + 0.025);
    const n1f = filt('bandpass', 1800 + Math.random() * 2500, 3);
    chain(n1, [n1f, n1g], sfxGain, d, d + 0.025);
  }
}

export function playCrickets() {
  if (!ctx) return;
  const now = t();
  for (let i = 0; i < 10; i++) {
    const d = Math.random() * 3;
    const freq = 3800 + Math.random() * 2500;
    const p1 = pan((Math.random() - 0.5) * 1.8);
    // Rapid chirp burst (3-5 pulses)
    const pulses = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < pulses; j++) {
      const pd = d + j * 0.045;
      const o1 = osc('sine', freq + Math.random() * 200);
      const g1 = g(0.025);
      g1.gain.exponentialRampToValueAtTime(0.001, now + pd + 0.03);
      chain(o1, [g1, p1], sfxGain, pd, pd + 0.03);
    }
  }
}

export function playWindGust() {
  if (!ctx) return;
  const now = t();
  const dur = 3;
  const n1 = noiseLoop();
  const n1g = g(0);
  n1g.gain.linearRampToValueAtTime(0.06, now + 0.5);
  n1g.gain.linearRampToValueAtTime(0.12, now + 1.2);
  n1g.gain.linearRampToValueAtTime(0.04, now + 2.2);
  n1g.gain.linearRampToValueAtTime(0, now + dur);
  const n1f = filt('bandpass', 350, 0.5);
  n1f.frequency.linearRampToValueAtTime(700, now + 1.2);
  n1f.frequency.linearRampToValueAtTime(250, now + dur);
  chain(n1, [n1f, n1g, pan(-0.3 + Math.random() * 0.6)], sfxGain, 0, dur);
  // High whistle
  const n2 = noiseLoop();
  const n2g = g(0);
  n2g.gain.linearRampToValueAtTime(0.02, now + 0.8);
  n2g.gain.linearRampToValueAtTime(0, now + 2.5);
  const n2f = filt('bandpass', 2000, 5);
  chain(n2, [n2f, n2g], sfxGain, 0.3, 2.8);
}

export function playOwlHoot() {
  if (!ctx) return;
  const now = t();
  const p1 = pan(Math.random() > 0.5 ? -0.7 : 0.7);
  for (let i = 0; i < 2; i++) {
    const d = i * 0.45;
    const freq = i === 0 ? 380 : 310;
    const o1 = osc('sine', freq);
    o1.frequency.linearRampToValueAtTime(freq * 0.88, now + d + 0.3);
    const g1 = g(0);
    g1.gain.linearRampToValueAtTime(0.08, now + d + 0.05);
    g1.gain.linearRampToValueAtTime(0.05, now + d + 0.2);
    g1.gain.linearRampToValueAtTime(0, now + d + 0.35);
    chain(o1, [g1, p1], sfxGain, d, d + 0.35);
    // Breathy layer
    const n1 = noise(0.25);
    const ng = g(0.015);
    ng.gain.linearRampToValueAtTime(0, now + d + 0.25);
    const nf = filt('bandpass', freq, 3);
    chain(n1, [nf, ng, p1], sfxGain, d, d + 0.25);
  }
}

export function playThunder() {
  if (!ctx) return;
  const now = t();
  const p1 = pan((Math.random() - 0.5) * 1.4);
  // Crack
  const n1 = noise(0.2);
  const n1g = g(0.3);
  n1g.gain.exponentialRampToValueAtTime(0.05, now + 0.2);
  const n1f = filt('bandpass', 800, 1);
  chain(n1, [n1f, n1g, p1], sfxGain, 0, 0.2);
  // Rolling rumble
  const n2 = noise(3);
  const n2g = g(0);
  n2g.gain.linearRampToValueAtTime(0.12, now + 0.3);
  n2g.gain.linearRampToValueAtTime(0.08, now + 1);
  n2g.gain.linearRampToValueAtTime(0, now + 3);
  const n2f = filt('lowpass', 200);
  n2f.frequency.linearRampToValueAtTime(100, now + 2);
  chain(n2, [n2f, n2g, pan(p1.pan.value * 0.5)], sfxGain, 0.1, 3.1);
  // Sub boom
  const o1 = osc('sine', 40);
  const o1g = g(0);
  o1g.gain.linearRampToValueAtTime(0.15, now + 0.2);
  o1g.gain.linearRampToValueAtTime(0, now + 1.5);
  chain(o1, [o1g], sfxGain, 0.1, 1.6);
}

export function playFireCrackle() {
  if (!ctx) return;
  const now = t();
  for (let i = 0; i < 8; i++) {
    const d = Math.random() * 2;
    const n1 = noise(0.035 + Math.random() * 0.02);
    const n1g = g(0.05 + Math.random() * 0.05);
    n1g.gain.exponentialRampToValueAtTime(0.001, now + d + 0.05);
    const n1f = filt('bandpass', 800 + Math.random() * 3000, 3);
    chain(n1, [n1f, n1g, pan((Math.random() - 0.5) * 0.5)], sfxGain, d, d + 0.05);
  }
  // Low warm crackle base
  const n2 = noise(2);
  const n2g = g(0.02);
  const n2f = filt('lowpass', 400);
  chain(n2, [n2f, n2g], sfxGain, 0, 2);
}

export function playRainLoop() {
  if (!ctx) return;
  const n1 = noiseLoop();
  const n1g = g(0.07);
  const n1f = filt('lowpass', 4000, 0.3);
  n1.connect(n1f); n1f.connect(n1g); n1g.connect(musicGain);
  n1.start(t());
  ambienceNodes.push(n1, n1g, n1f);
}

// ========== AMBIENT MUSIC ==========

const AMB = {
  exploration: { wave: 'sine', freq: 55, vol: 0.05, fFreq: 200, lfo: 0.05, depth: 30, nVol: 0.01, nFreq: 300 },
  tension:     { wave: 'sawtooth', freq: 45, vol: 0.04, fFreq: 150, lfo: 0.15, depth: 20, nVol: 0.025, nFreq: 800 },
  combat:      { wave: 'sawtooth', freq: 60, vol: 0.07, fFreq: 400, lfo: 0.4, depth: 50, nVol: 0.03, nFreq: 1000 },
  sorrow:      { wave: 'sine', freq: 65, vol: 0.04, fFreq: 180, lfo: 0.03, depth: 15, nVol: 0.005, nFreq: 200 },
  hope:        { wave: 'sine', freq: 130, vol: 0.04, fFreq: 400, lfo: 0.04, depth: 25, nVol: 0, nFreq: 0 },
  winter:      { wave: 'sine', freq: 40, vol: 0.04, fFreq: 120, lfo: 0.02, depth: 10, nVol: 0.04, nFreq: 2000 },
};

export function startAmbience(mood) {
  if (!ctx || currentAmbience === mood) return;
  stopAmbience();
  currentAmbience = mood;
  const p = AMB[mood] || AMB.exploration;

  const d1 = osc(p.wave, p.freq);
  const dg = g(p.vol);
  const df = filt('lowpass', p.fFreq);
  d1.connect(df); df.connect(dg); dg.connect(musicGain);
  d1.start(); ambienceNodes.push(d1, dg, df);

  const d2 = osc('sine', p.freq * 1.5);
  const d2g = g(p.vol * 0.4);
  d2.connect(d2g); d2g.connect(musicGain);
  d2.start(); ambienceNodes.push(d2, d2g);

  // Third voice for richness
  const d3 = osc('triangle', p.freq * 2);
  const d3g = g(p.vol * 0.15);
  d3.connect(d3g); d3g.connect(musicGain);
  d3.start(); ambienceNodes.push(d3, d3g);

  const lfo = osc('sine', p.lfo);
  const lfog = g(p.depth);
  lfo.connect(lfog); lfog.connect(df.frequency);
  lfo.start(); ambienceNodes.push(lfo, lfog);

  if (p.nVol > 0) {
    const n = noiseLoop();
    const ng = g(p.nVol);
    const nf = filt('bandpass', p.nFreq, 0.5);
    n.connect(nf); nf.connect(ng); ng.connect(musicGain);
    n.start(); ambienceNodes.push(n, ng, nf);
  }
}

export function stopAmbience() {
  for (const n of ambienceNodes) {
    try { if (n.stop) n.stop(); n.disconnect(); } catch (e) {}
  }
  ambienceNodes = [];
  currentAmbience = null;
}

export function crossfadeAmbience(newMood, duration = 2) {
  if (!ctx || currentAmbience === newMood) return;
  if (musicGain) musicGain.gain.linearRampToValueAtTime(0, t() + duration / 2);
  setTimeout(() => {
    stopAmbience();
    if (musicGain) musicGain.gain.value = 0.35;
    startAmbience(newMood);
  }, (duration / 2) * 1000);
}

export function getAmbienceForState(state) {
  if (!state) return 'exploration';
  if (state.meta?.phase === 'GAME_OVER') return 'sorrow';
  if (state.meta?.phase === 'VICTORY') return 'hope';
  if (state.meta?.phase === 'MINIGAME') return 'combat';
  if (state.calendar?.season === 'winter') return 'winter';
  if (state.player?.health < 30) return 'tension';
  if (state.resources?.food <= 1 || state.resources?.water <= 1) return 'tension';
  if (state.currentEvent?.type === 'combat') return 'combat';
  if (state.currentEvent?.type === 'crisis') return 'tension';
  return 'exploration';
}
