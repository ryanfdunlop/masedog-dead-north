// ============================================================
// MASEDOG: Dead North — Animated 16-Bit Background Scenes
// Procedural pixel-art scenes rendered on Canvas.
// Each scene has subtle animated elements for atmosphere.
// ============================================================

import * as audio from '../engine/audio.js';
import { sbZombieGroan, sbGhostNoise, sbDarkSFX, sbHit, sbExotic, sbAlarm, sbStartSceneAmbient, isLoaded as sbReady } from '../engine/soundbank.js';

let sceneCanvas = null;
let sceneCtx = null;
let currentScene = null;
let animFrameId = null;
let sceneTime = 0;

const SW = 320; // Scene width (internal resolution)
const SH = 180; // Scene height

/**
 * Initialize the scene canvas.
 */
export function initScenes() {
  sceneCanvas = document.getElementById('scene-canvas');
  if (!sceneCanvas) return;
  sceneCanvas.width = SW;
  sceneCanvas.height = SH;
  sceneCtx = sceneCanvas.getContext('2d');
  sceneCtx.imageSmoothingEnabled = false;
}

/**
 * Set the active scene by ID.
 */
export function setScene(sceneId) {
  if (currentScene === sceneId) return;
  currentScene = sceneId;
  sceneTime = 0;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (sceneCanvas) sceneCanvas.style.display = 'block';

  // Stop previous scene-specific drone loops
  if (sceneAmbientSources) {
    sceneAmbientSources.forEach(s => { try { s.stop(); } catch(e) {} });
  }
  sceneAmbientSources = null;

  // Start scene-specific real sound drone + soundscape (if loaded)
  if (sbReady()) {
    sceneAmbientSources = sbStartSceneAmbient(sceneId);
  }

  // Trigger procedural ambient sounds for this scene
  playSceneAmbient(sceneId);

  renderScene();
}

let sceneAmbientInterval = null;
let sceneAmbientSources = null; // Real sound drone/soundscape loop sources

function playSceneAmbient(sceneId) {
  // Clear any previous ambient loop
  if (sceneAmbientInterval) {
    clearInterval(sceneAmbientInterval);
    sceneAmbientInterval = null;
  }

  const ambientSounds = {
      hospital_room: () => {
        // Heart monitor beeping + hospital ambience (hum, clamoring)
        audio.playHeartMonitor(false);
        if (audio.playHospitalAmbient) audio.playHospitalAmbient();
        sceneAmbientInterval = setInterval(() => {
          if (currentScene !== 'hospital_room') return;
          audio.playHeartMonitor(false);
          if (audio.playHospitalAmbient) audio.playHospitalAmbient();
        }, 4500); // Overlap slightly for continuous sound
      },
      hospital: () => {
        audio.playHeartMonitor(false);
        if (audio.playHospitalAmbient) audio.playHospitalAmbient();
        sceneAmbientInterval = setInterval(() => {
          if (currentScene !== 'hospital') return;
          audio.playHeartMonitor(false);
          if (audio.playHospitalAmbient) audio.playHospitalAmbient();
        }, 4500);
      },
      hospital_hallway: () => {
        // Hospital ambient + door creaks + footsteps
        if (audio.playHospitalAmbient) audio.playHospitalAmbient();
        sceneAmbientInterval = setInterval(() => {
          if (currentScene !== 'hospital_hallway') return;
          if (audio.playHospitalAmbient) audio.playHospitalAmbient();
          if (Math.random() > 0.4) audio.playDoorCreak();
          if (Math.random() > 0.6 && audio.playFootstep) audio.playFootstep('concrete');
        }, 5000);
      },
      forest: () => {
        // Crickets + occasional owl
        audio.playCrickets();
        sceneAmbientInterval = setInterval(() => {
          if (currentScene !== 'forest') return;
          if (Math.random() > 0.6) audio.playCrickets();
          if (Math.random() > 0.8) audio.playOwlHoot();
        }, 5000);
      },
      campfire: () => {
        // Fire crackle loop
        audio.playFireCrackle();
        sceneAmbientInterval = setInterval(() => {
          if (currentScene === 'campfire') audio.playFireCrackle();
        }, 3000);
      },
      winter: () => {
        // Wind gusts
        audio.playWindGust();
        sceneAmbientInterval = setInterval(() => {
          if (currentScene === 'winter') audio.playWindGust();
        }, 6000);
      },
      prairie: () => {
        // Wind + occasional thunder
        sceneAmbientInterval = setInterval(() => {
          if (currentScene !== 'prairie') return;
          if (Math.random() > 0.4) audio.playWindGust();
          if (Math.random() > 0.85) audio.playThunder();
        }, 5000);
      },
      ruins: () => {
        // Dark atmosphere with real sounds
        if (sbReady()) sbDarkSFX();
        sceneAmbientInterval = setInterval(() => {
          if (currentScene !== 'ruins') return;
          if (Math.random() > 0.6) audio.playDoorCreak();
          if (sbReady() && Math.random() > 0.6) sbGhostNoise();
          if (sbReady() && Math.random() > 0.8) sbDarkSFX();
          if (Math.random() > 0.9) audio.playGlassBreak();
        }, 6000);
      },
      lake: () => {
        // Wind
        sceneAmbientInterval = setInterval(() => {
          if (currentScene === 'lake') audio.playWindGust();
        }, 8000);
      },
      hospital_outside: () => {
        // Distant sounds — use real growls when loaded
        audio.playWindGust();
        sceneAmbientInterval = setInterval(() => {
          if (currentScene !== 'hospital_outside') return;
          if (Math.random() > 0.6) audio.playWindGust();
          if (sbReady() && Math.random() > 0.5) sbZombieGroan();
          else if (Math.random() > 0.8) audio.playZombieGroan();
          if (sbReady() && Math.random() > 0.8) sbGhostNoise();
        }, 5000);
      },
    };

  const ambientFn = ambientSounds[sceneId];
  if (ambientFn) {
    try { ambientFn(); } catch(e) { /* Audio not ready yet */ }
  }
}

/**
 * Stop rendering scenes.
 */
export function stopScene() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  currentScene = null;
  if (sceneCanvas) sceneCanvas.style.display = 'none';
}

function renderScene() {
  if (!sceneCtx || !currentScene) return;
  sceneTime += 1 / 60;
  const ctx = sceneCtx;

  const drawFn = SCENES[currentScene];
  if (drawFn) {
    drawFn(ctx, sceneTime);
  } else {
    SCENES.city_night(ctx, sceneTime); // Fallback
  }

  animFrameId = requestAnimationFrame(renderScene);
}

/**
 * Get the appropriate scene for a region and context.
 */
export function getSceneForContext(region, season, eventType) {
  if (season === 'winter') return 'winter';
  if (eventType === 'combat' || eventType === 'scavenge') return 'ruins';

  const regionScenes = {
    vancouver: 'city_night',
    bc_interior: 'forest',
    alberta: 'mountains',
    saskatchewan: 'prairie',
    manitoba: 'prairie',
    ontario_north: 'forest',
    ontario_south: 'lake',
    ottawa_approach: 'ottawa',
  };
  return regionScenes[region] || 'highway';
}

// ========== SCENE RENDERERS ==========

const SCENES = {

  // --- CITY AT NIGHT (Vancouver, urban) ---
  city_night(ctx, t) {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, SH);
    skyGrad.addColorStop(0, '#08081a');
    skyGrad.addColorStop(0.5, '#0c0c22');
    skyGrad.addColorStop(1, '#141428');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, SW, SH);

    // Stars
    for (let i = 0; i < 20; i++) {
      const sx = (i * 73 + 11) % SW;
      const sy = (i * 37 + 5) % 60;
      const blink = Math.sin(t * 2 + i) > 0.7 ? 1 : 0.4;
      ctx.fillStyle = `rgba(200, 200, 255, ${blink * 0.6})`;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Distant fire glow
    const fireGlow = 0.3 + Math.sin(t * 3) * 0.1;
    ctx.fillStyle = `rgba(200, 80, 20, ${fireGlow})`;
    ctx.fillRect(200, 70, 40, 30);

    // Buildings silhouette
    const buildings = [[20,55],[35,70],[55,50],[80,80],[100,45],[125,65],[150,55],[175,75],[200,40],[230,60],[260,50],[290,70]];
    ctx.fillStyle = '#0a0a14';
    for (const [bx, bh] of buildings) {
      ctx.fillRect(bx, SH - bh - 40, 22, bh);
    }

    // Windows — some flicker
    ctx.fillStyle = '#ccaa44';
    for (const [bx, bh] of buildings) {
      for (let wy = 0; wy < bh - 10; wy += 8) {
        for (let wx = 3; wx < 18; wx += 6) {
          const on = Math.sin(t * 0.5 + bx + wy * 3 + wx) > 0.2;
          if (on) {
            const flicker = Math.sin(t * 0.8 + bx * wx * 0.1) > 0.7 ? 0.15 : 0.55;
            ctx.globalAlpha = flicker;
            ctx.fillRect(bx + wx, SH - bh - 40 + wy + 5, 3, 4);
          }
        }
      }
    }
    ctx.globalAlpha = 1;

    // Ground
    ctx.fillStyle = '#111120';
    ctx.fillRect(0, SH - 40, SW, 40);

    // Street lights
    for (let i = 0; i < 5; i++) {
      const lx = 30 + i * 70;
      const glow = 0.25 + Math.sin(t * 0.5 + i * 2) * 0.12;
      ctx.fillStyle = '#333';
      ctx.fillRect(lx, SH - 55, 2, 20);
      ctx.fillStyle = `rgba(255, 200, 100, ${glow})`;
      ctx.fillRect(lx - 3, SH - 58, 8, 3);
      // Light pool
      ctx.fillStyle = `rgba(255, 200, 100, ${glow * 0.15})`;
      ctx.fillRect(lx - 8, SH - 38, 18, 3);
    }

    // Moving car headlights
    const carX = ((t * 20) % (SW + 40)) - 20;
    ctx.fillStyle = 'rgba(255, 240, 180, 0.6)';
    ctx.fillRect(carX, SH - 35, 6, 2);
    ctx.fillStyle = '#222';
    ctx.fillRect(carX - 8, SH - 37, 16, 6);
  },

  // --- SKYTRAIN (Vancouver transit) ---
  skytrain(ctx, t) {
    // Underground station
    ctx.fillStyle = '#0e0e18';
    ctx.fillRect(0, 0, SW, SH);

    // Ceiling
    ctx.fillStyle = '#1a1a28';
    ctx.fillRect(0, 0, SW, 30);

    // Fluorescent lights — flicker
    for (let i = 0; i < 6; i++) {
      const lx = 20 + i * 55;
      const flicker = Math.sin(t * 0.6 + i * 3) > 0.8 ? 0.08 : 0.5;
      const broken = i === 3; // One light is broken
      if (!broken) {
        ctx.fillStyle = `rgba(200, 220, 255, ${flicker})`;
        ctx.fillRect(lx, 28, 30, 3);
        ctx.fillStyle = `rgba(200, 220, 255, ${flicker * 0.1})`;
        ctx.fillRect(lx - 5, 31, 40, 50); // Light beam
      }
    }

    // Platform
    ctx.fillStyle = '#222233';
    ctx.fillRect(0, SH - 50, SW, 50);
    ctx.fillStyle = '#333344';
    ctx.fillRect(0, SH - 50, SW, 3); // Platform edge
    // Yellow safety line
    ctx.fillStyle = '#aa8822';
    ctx.fillRect(0, SH - 48, SW, 2);

    // Tracks
    ctx.fillStyle = '#444';
    ctx.fillRect(0, SH - 30, SW, 2);
    ctx.fillRect(0, SH - 20, SW, 2);
    // Ties
    for (let x = 0; x < SW; x += 12) {
      ctx.fillStyle = '#332211';
      ctx.fillRect(x, SH - 32, 6, 14);
    }

    // Train arriving/departing (cycles every 15 seconds)
    const trainCycle = t % 15;
    if (trainCycle > 5 && trainCycle < 12) {
      const trainX = trainCycle < 8
        ? (trainCycle - 5) / 3 * SW - 200  // Arriving
        : (trainCycle - 10) / 2 * SW;       // Departing
      ctx.fillStyle = '#334455';
      ctx.fillRect(trainX, SH - 47, 200, 22);
      // Train windows
      ctx.fillStyle = '#556677';
      for (let w = 0; w < 180; w += 20) {
        ctx.fillRect(trainX + w + 5, SH - 44, 12, 12);
      }
      // Train stripe
      ctx.fillStyle = '#446688';
      ctx.fillRect(trainX, SH - 38, 200, 2);
    }

    // Rat scurrying (appears randomly)
    const ratPhase = (t * 2) % 8;
    if (ratPhase > 6) {
      const ratX = (ratPhase - 6) / 2 * SW;
      ctx.fillStyle = '#444';
      ctx.fillRect(ratX, SH - 34, 5, 3);
      ctx.fillRect(ratX + 5, SH - 35, 2, 2); // Head
      ctx.fillRect(ratX - 3, SH - 34, 3, 1); // Tail
    }

    // Distant tunnel eyes
    const eyeBlink = Math.sin(t * 0.8) > 0.9;
    if (!eyeBlink) {
      ctx.fillStyle = 'rgba(255, 50, 50, 0.4)';
      ctx.fillRect(5, SH - 42, 2, 2);
      ctx.fillRect(10, SH - 42, 2, 2);
    }
  },

  // --- HOSPITAL (Prologue, medical) ---
  hospital(ctx, t) {
    ctx.fillStyle = '#0a0f0a';
    ctx.fillRect(0, 0, SW, SH);

    // Corridor walls
    ctx.fillStyle = '#1a2020';
    ctx.fillRect(0, 0, SW, 40); // Ceiling
    ctx.fillRect(0, SH - 30, SW, 30); // Floor
    ctx.fillStyle = '#182020';
    ctx.fillRect(0, 40, 10, SH - 70); // Left wall
    ctx.fillRect(SW - 10, 40, 10, SH - 70); // Right wall

    // Floor tiles
    ctx.fillStyle = '#222830';
    for (let x = 0; x < SW; x += 20) {
      for (let y = SH - 28; y < SH; y += 14) {
        ctx.fillRect(x + 1, y + 1, 18, 12);
      }
    }

    // Emergency red lights — alternating flash
    // Slow ominous red pulse — breathes in and out
    const redFlash = Math.sin(t * 0.7) > 0;
    for (let i = 0; i < 4; i++) {
      const lx = 50 + i * 70;
      ctx.fillStyle = redFlash ? 'rgba(200, 30, 30, 0.6)' : 'rgba(200, 30, 30, 0.1)';
      ctx.fillRect(lx, 35, 8, 4);
      if (redFlash) {
        ctx.fillStyle = 'rgba(200, 30, 30, 0.08)';
        ctx.fillRect(lx - 20, 39, 48, SH - 69);
      }
    }

    // Doors
    ctx.fillStyle = '#253030';
    ctx.fillRect(60, 50, 25, 80);
    ctx.fillRect(160, 50, 25, 80);
    ctx.fillRect(260, 50, 25, 80);
    // Door windows
    ctx.fillStyle = '#1a2525';
    ctx.fillRect(66, 55, 13, 15);
    ctx.fillRect(166, 55, 13, 15);

    // Shadow passing behind a door window
    const shadowX = Math.sin(t * 0.3) * 6;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(166 + shadowX, 55, 5, 15);

    // Overturned gurney
    ctx.fillStyle = '#333';
    ctx.fillRect(110, SH - 45, 30, 4);
    ctx.fillRect(112, SH - 42, 2, 12);
    ctx.fillRect(136, SH - 42, 2, 12);

    // Blood splatter (dark stains)
    ctx.fillStyle = 'rgba(80, 20, 20, 0.4)';
    ctx.fillRect(140, SH - 28, 8, 5);
    ctx.fillRect(200, SH - 26, 12, 4);
  },

  // --- HOSPITAL ROOM (Room 412 — where it begins) ---
  hospital_room(ctx, t) {
    ctx.fillStyle = '#0e1210';
    ctx.fillRect(0, 0, SW, SH);

    // Walls
    ctx.fillStyle = '#1a2222';
    ctx.fillRect(0, 0, SW, 35); // Ceiling
    ctx.fillRect(0, 0, 8, SH); // Left wall
    ctx.fillRect(SW - 8, 0, 8, SH); // Right wall

    // Floor tiles
    ctx.fillStyle = '#181e1e';
    for (let x = 8; x < SW - 8; x += 16) {
      for (let y = SH - 35; y < SH; y += 16) {
        ctx.fillRect(x + 1, y + 1, 14, 14);
      }
    }

    // Window (right side) — moonlight
    ctx.fillStyle = '#151830';
    ctx.fillRect(SW - 60, 40, 45, 50);
    ctx.fillStyle = '#1a1e38';
    ctx.fillRect(SW - 58, 42, 20, 46);
    ctx.fillRect(SW - 35, 42, 20, 46);
    // Moonlight beam
    ctx.fillStyle = 'rgba(100, 120, 180, 0.03)';
    ctx.beginPath();
    ctx.moveTo(SW - 58, 90); ctx.lineTo(SW - 80, SH - 35);
    ctx.lineTo(SW - 20, SH - 35); ctx.lineTo(SW - 15, 90);
    ctx.fill();

    // Hospital beds
    ctx.fillStyle = '#222830';
    ctx.fillRect(30, 80, 50, 25); // Violet's bed
    ctx.fillRect(SW - 90, 80, 50, 25); // Cassidy's bed
    // Bed frames
    ctx.fillStyle = '#333';
    ctx.fillRect(28, 78, 2, 30); ctx.fillRect(80, 78, 2, 30);
    ctx.fillRect(SW - 92, 78, 2, 30); ctx.fillRect(SW - 40, 78, 2, 30);

    // Blankets
    ctx.fillStyle = '#2a3540';
    ctx.fillRect(32, 82, 46, 10);
    ctx.fillStyle = '#2a3a40';
    ctx.fillRect(SW - 88, 82, 46, 10);

    // IV drip by Violet's bed
    ctx.fillStyle = '#444';
    ctx.fillRect(20, 55, 2, 50);
    ctx.fillStyle = '#556';
    ctx.fillRect(16, 55, 10, 6);
    // Drip (animated)
    const dripY = 65 + ((t * 8) % 15);
    ctx.fillStyle = 'rgba(120, 180, 200, 0.4)';
    ctx.fillRect(21, dripY, 1, 2);

    // Heart monitor — beeping line
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(85, 60, 30, 20);
    ctx.strokeStyle = '#33aa44';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < 28; x++) {
      const px = 86 + x;
      const phase = (x + t * 15) % 28;
      let py = 70;
      if (phase > 12 && phase < 14) py = 63;
      else if (phase > 14 && phase < 16) py = 75;
      ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Room number on door
    ctx.fillStyle = '#253030';
    ctx.fillRect(12, 45, 4, 55); // Door edge
    ctx.fillStyle = '#88aa88';
    ctx.font = '6px monospace';
    ctx.fillText('412', 14, 52);

    // TV in corner (emergency broadcast)
    ctx.fillStyle = '#111';
    ctx.fillRect(150, 40, 24, 16);
    const tvFlicker = Math.sin(t * 0.5) > 0 ? 0.3 : 0.15;
    ctx.fillStyle = `rgba(200, 50, 50, ${tvFlicker})`;
    ctx.fillRect(151, 41, 22, 14);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '3px monospace';
    ctx.fillText('ALERT', 153, 49);

    // Chair (where you sit)
    ctx.fillStyle = '#2a2a20';
    ctx.fillRect(55, 95, 14, 14);
    ctx.fillRect(57, 85, 10, 12);
  },

  // --- HALLWAY (Hospital corridor escape) ---
  hospital_hallway(ctx, t) {
    ctx.fillStyle = '#0a0e0a';
    ctx.fillRect(0, 0, SW, SH);

    // Perspective corridor — walls converge to center
    const vanishX = SW / 2;
    const vanishY = 60;

    // Floor
    ctx.fillStyle = '#161a1a';
    ctx.beginPath();
    ctx.moveTo(0, SH); ctx.lineTo(vanishX - 10, vanishY + 20);
    ctx.lineTo(vanishX + 10, vanishY + 20); ctx.lineTo(SW, SH);
    ctx.fill();

    // Floor tiles (perspective)
    ctx.strokeStyle = '#1e2222';
    ctx.lineWidth = 1;
    for (let d = 0; d < 8; d++) {
      const y = vanishY + 20 + d * 15;
      const spread = (y - vanishY) / (SH - vanishY) * (SW / 2);
      ctx.beginPath();
      ctx.moveTo(vanishX - spread, y);
      ctx.lineTo(vanishX + spread, y);
      ctx.stroke();
    }

    // Walls
    ctx.fillStyle = '#141a1a';
    ctx.beginPath();
    ctx.moveTo(0, 30); ctx.lineTo(vanishX - 10, vanishY);
    ctx.lineTo(vanishX - 10, vanishY + 20); ctx.lineTo(0, SH);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(SW, 30); ctx.lineTo(vanishX + 10, vanishY);
    ctx.lineTo(vanishX + 10, vanishY + 20); ctx.lineTo(SW, SH);
    ctx.fill();

    // Ceiling
    ctx.fillStyle = '#111515';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(SW, 0);
    ctx.lineTo(vanishX + 10, vanishY); ctx.lineTo(vanishX - 10, vanishY);
    ctx.fill();

    // Emergency lights — slow red pulse
    const redPulse = 0.15 + Math.sin(t * 0.7) * 0.15;
    for (let i = 0; i < 4; i++) {
      const d = i * 0.25;
      const ly = vanishY + 5 + d * (SH - vanishY - 20);
      const spread = d * SW * 0.4;
      ctx.fillStyle = `rgba(200, 30, 30, ${redPulse * (1 - d * 0.5)})`;
      ctx.fillRect(vanishX - 3 - spread * 0.1, ly, 6, 3);
      // Red glow pool
      ctx.fillStyle = `rgba(200, 30, 30, ${redPulse * 0.03 * (1 - d * 0.5)})`;
      ctx.fillRect(vanishX - spread * 0.3, ly, spread * 0.6, 20);
    }

    // Overturned gurney
    ctx.fillStyle = '#333';
    ctx.fillRect(vanishX - 30, SH - 55, 35, 4);
    ctx.fillRect(vanishX - 28, SH - 52, 2, 15);

    // Doors along walls
    ctx.fillStyle = '#1a2222';
    ctx.fillRect(20, 60, 18, 60);
    ctx.fillRect(70, 70, 15, 50);
    ctx.fillRect(SW - 38, 60, 18, 60);
    ctx.fillRect(SW - 85, 70, 15, 50);

    // Something at the end of the hall — shape in darkness
    const shapePulse = Math.sin(t * 0.3) > 0.5;
    if (shapePulse) {
      ctx.fillStyle = 'rgba(20, 15, 15, 0.8)';
      ctx.fillRect(vanishX - 4, vanishY + 5, 8, 15);
    }

    // Scratching marks on nearby door
    ctx.strokeStyle = 'rgba(100, 60, 60, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(22 + i * 4, 65);
      ctx.lineTo(24 + i * 4, 85);
      ctx.stroke();
    }
  },

  // --- PARKING GARAGE (Escape scene) ---
  parking_garage(ctx, t) {
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, 0, SW, SH);

    // Concrete ceiling with pipes
    ctx.fillStyle = '#141418';
    ctx.fillRect(0, 0, SW, 25);
    ctx.fillStyle = '#1a1a20';
    ctx.fillRect(20, 22, SW - 40, 3);
    // Pipes
    ctx.fillStyle = '#222228';
    ctx.fillRect(0, 15, SW, 2);
    ctx.fillRect(0, 10, SW, 2);

    // Concrete pillars
    ctx.fillStyle = '#1a1a20';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(40 + i * 80, 25, 12, SH - 25);
    }

    // Floor — oil stains
    ctx.fillStyle = '#0e0e12';
    ctx.fillRect(0, SH - 20, SW, 20);
    ctx.fillStyle = '#0c0c10';
    ctx.fillRect(60, SH - 18, 20, 8);
    ctx.fillRect(180, SH - 16, 15, 6);

    // Cars
    const cars = [
      { x: 70, color: '#222230', broken: false },
      { x: 150, color: '#2a2020', broken: true },
      { x: 250, color: '#202a20', broken: false },
    ];
    for (const car of cars) {
      ctx.fillStyle = car.color;
      ctx.fillRect(car.x, SH - 40, 28, 14);
      ctx.fillStyle = car.broken ? '#1a1a1a' : '#333';
      ctx.fillRect(car.x + 4, SH - 47, 20, 8);
      // Wheels
      ctx.fillStyle = '#111';
      ctx.fillRect(car.x + 2, SH - 28, 6, 4);
      ctx.fillRect(car.x + 20, SH - 28, 6, 4);
      // Broken window
      if (car.broken) {
        ctx.fillStyle = '#0a0a0e';
        ctx.fillRect(car.x + 8, SH - 45, 10, 5);
      }
    }

    // Flickering overhead light — slow ominous
    const lightOn = Math.sin(t * 0.4) > -0.3;
    if (lightOn) {
      const brightness = 0.3 + Math.sin(t * 0.6) * 0.1;
      ctx.fillStyle = `rgba(200, 200, 180, ${brightness})`;
      ctx.fillRect(155, 23, 10, 3);
      // Light cone
      ctx.fillStyle = `rgba(200, 200, 180, ${brightness * 0.04})`;
      ctx.beginPath();
      ctx.moveTo(155, 26); ctx.lineTo(130, SH - 20);
      ctx.lineTo(185, SH - 20); ctx.lineTo(165, 26);
      ctx.fill();
    }

    // Crawler under a car (eyes peek out)
    const crawlerBlink = Math.sin(t * 0.5) > 0.85;
    if (!crawlerBlink) {
      ctx.fillStyle = 'rgba(180, 50, 50, 0.4)';
      ctx.fillRect(74, SH - 27, 2, 2);
      ctx.fillRect(79, SH - 27, 2, 2);
    }

    // EXIT sign — dim green
    ctx.fillStyle = `rgba(50, 200, 80, ${0.3 + Math.sin(t * 0.3) * 0.1})`;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('EXIT', 10, 18);
    ctx.fillRect(8, 19, 30, 1);
  },

  // --- STAIRWELL (Escape route) ---
  stairwell(ctx, t) {
    ctx.fillStyle = '#0a0a10';
    ctx.fillRect(0, 0, SW, SH);

    // Concrete walls
    ctx.fillStyle = '#141418';
    ctx.fillRect(0, 0, 40, SH);
    ctx.fillRect(SW - 40, 0, 40, SH);

    // Stairs going down
    for (let i = 0; i < 10; i++) {
      const sy = 30 + i * 15;
      const sw = 200 + i * 8;
      const sx = (SW - sw) / 2;
      ctx.fillStyle = i % 2 === 0 ? '#181820' : '#1a1a24';
      ctx.fillRect(sx, sy, sw, 14);
      // Step edge
      ctx.fillStyle = '#222230';
      ctx.fillRect(sx, sy, sw, 2);
    }

    // Railing
    ctx.fillStyle = '#2a2a35';
    ctx.fillRect(55, 20, 3, SH - 20);
    ctx.fillRect(SW - 58, 20, 3, SH - 20);
    // Railing bars
    for (let y = 30; y < SH; y += 20) {
      ctx.fillRect(55, y, 15, 2);
      ctx.fillRect(SW - 70, y, 15, 2);
    }

    // Floor number sign
    ctx.fillStyle = '#333';
    ctx.fillRect(45, 35, 16, 12);
    ctx.fillStyle = '#888';
    ctx.font = '7px monospace';
    ctx.fillText('4', 50, 44);

    // Emergency light — slow red
    const pulse = 0.2 + Math.sin(t * 0.6) * 0.15;
    ctx.fillStyle = `rgba(200, 40, 40, ${pulse})`;
    ctx.fillRect(SW / 2 - 4, 10, 8, 4);
    ctx.fillStyle = `rgba(200, 40, 40, ${pulse * 0.03})`;
    ctx.fillRect(40, 14, SW - 80, SH);

    // Sound visualization — scratching from below
    if (Math.sin(t * 0.4) > 0.7) {
      ctx.fillStyle = 'rgba(100, 80, 80, 0.2)';
      for (let i = 0; i < 3; i++) {
        const lx = SW / 2 - 20 + i * 15 + Math.sin(t * 2 + i) * 3;
        ctx.fillRect(lx, SH - 8, 8, 2);
      }
    }

    // Shadow on stairs below
    const shadowY = SH - 30 + Math.sin(t * 0.2) * 5;
    ctx.fillStyle = 'rgba(10, 10, 15, 0.6)';
    ctx.fillRect(SW / 2 - 15, shadowY, 12, 20);
  },

  // --- SUPPLY ROOM (Finding Dr. Reyes) ---
  supply_room(ctx, t) {
    ctx.fillStyle = '#0c100c';
    ctx.fillRect(0, 0, SW, SH);

    // Small room walls
    ctx.fillStyle = '#182018';
    ctx.fillRect(0, 0, SW, 30);
    ctx.fillRect(0, SH - 20, SW, 20);
    ctx.fillRect(0, 0, 15, SH);
    ctx.fillRect(SW - 15, 0, 15, SH);

    // Shelves full of supplies
    for (let row = 0; row < 3; row++) {
      const shelfY = 40 + row * 35;
      // Shelf board
      ctx.fillStyle = '#2a2a20';
      ctx.fillRect(20, shelfY, SW - 40, 3);

      // Items on shelf
      for (let i = 0; i < 8; i++) {
        const ix = 25 + i * 35;
        const colors = ['#334455', '#445533', '#553344', '#444433', '#335544', '#443355'];
        ctx.fillStyle = colors[i % colors.length];
        const ih = 10 + (i * 7 + row * 3) % 8;
        ctx.fillRect(ix, shelfY - ih, 12, ih);
      }
    }

    // Red cross on box
    ctx.fillStyle = '#443333';
    ctx.fillRect(100, 80, 20, 16);
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(107, 82, 6, 12);
    ctx.fillRect(103, 86, 14, 4);

    // Flashlight beam (Dr. Reyes searching)
    const beamAngle = Math.sin(t * 0.3) * 0.3;
    const beamX = 200 + Math.sin(beamAngle) * 40;
    ctx.fillStyle = 'rgba(255, 240, 200, 0.06)';
    ctx.beginPath();
    ctx.moveTo(200, 120);
    ctx.lineTo(beamX - 30, 35);
    ctx.lineTo(beamX + 30, 35);
    ctx.fill();
    // Flashlight dot
    ctx.fillStyle = 'rgba(255, 240, 200, 0.15)';
    ctx.fillRect(beamX - 5, 40 + Math.abs(beamAngle) * 20, 10, 8);

    // Duffel bags on floor
    ctx.fillStyle = '#2a3020';
    ctx.fillRect(50, SH - 30, 25, 12);
    ctx.fillRect(90, SH - 28, 22, 10);

    // Door (barricaded from inside)
    ctx.fillStyle = '#253025';
    ctx.fillRect(SW - 25, 35, 12, 80);
    // Barricade
    ctx.fillStyle = '#332a20';
    ctx.fillRect(SW - 35, 50, 12, 5);
    ctx.fillRect(SW - 35, 70, 12, 5);
    ctx.fillRect(SW - 35, 90, 12, 5);
  },

  // --- OUTSIDE HOSPITAL (Escape — world changed) ---
  hospital_outside(ctx, t) {
    // Smoky orange sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 80);
    skyGrad.addColorStop(0, '#1a0a0a');
    skyGrad.addColorStop(0.5, '#2a1510');
    skyGrad.addColorStop(1, '#141015');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, SW, SH);

    // Smoke columns
    for (let i = 0; i < 4; i++) {
      const sx = 50 + i * 80;
      ctx.fillStyle = `rgba(60, 40, 30, ${0.15 + Math.sin(t * 0.2 + i) * 0.05})`;
      const sway = Math.sin(t * 0.3 + i * 2) * 5;
      ctx.fillRect(sx + sway, 0, 8 + i * 3, 60);
    }

    // Hospital building behind you
    ctx.fillStyle = '#0e0e15';
    ctx.fillRect(10, 30, 130, 70);
    // Windows with figures pressing against glass
    for (let wy = 0; wy < 50; wy += 12) {
      for (let wx = 0; wx < 110; wx += 18) {
        ctx.fillStyle = '#151520';
        ctx.fillRect(18 + wx, 38 + wy, 10, 8);
        // Figure in window (some windows)
        if ((wx + wy) % 36 === 0) {
          ctx.fillStyle = `rgba(60, 50, 50, ${0.4 + Math.sin(t * 0.5 + wx) * 0.2})`;
          ctx.fillRect(21 + wx, 39 + wy, 4, 6);
        }
      }
    }

    // Ground — parking lot
    ctx.fillStyle = '#111115';
    ctx.fillRect(0, 100, SW, SH - 100);

    // Abandoned cars
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(170, 105, 25, 12);
    ctx.fillRect(220, 110, 22, 10);
    ctx.fillRect(280, 103, 28, 14);
    // Open doors
    ctx.fillStyle = '#151520';
    ctx.fillRect(193, 102, 8, 14);

    // Distant fire
    const fireGlow = 0.25 + Math.sin(t * 1.5) * 0.1;
    ctx.fillStyle = `rgba(200, 100, 30, ${fireGlow})`;
    ctx.fillRect(260, 40, 30, 30);

    // Helicopter trailing smoke
    const heliX = ((t * 8) % (SW + 100)) - 50;
    if (heliX > -50 && heliX < SW + 50) {
      ctx.fillStyle = '#222';
      ctx.fillRect(heliX, 20, 15, 6);
      ctx.fillRect(heliX + 3, 17, 8, 3);
      ctx.fillRect(heliX - 5, 22, 25, 1);
      // Smoke trail
      ctx.fillStyle = 'rgba(40, 40, 40, 0.3)';
      ctx.fillRect(heliX + 15, 22, 30, 3);
    }
  },

  // --- HIGHWAY (Travel) ---
  highway(ctx, t) {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 80);
    skyGrad.addColorStop(0, '#0a0a18');
    skyGrad.addColorStop(1, '#14142a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, SW, 80);

    // Moon
    ctx.fillStyle = '#ddddc8';
    ctx.beginPath();
    ctx.arc(250, 25, 10, 0, Math.PI * 2);
    ctx.fill();

    // Distant treeline
    ctx.fillStyle = '#0c1210';
    for (let x = 0; x < SW; x += 8) {
      const th = 15 + Math.sin(x * 0.1) * 8;
      ctx.fillRect(x, 80 - th, 8, th);
    }

    // Road
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(0, 80, SW, SH - 80);

    // Road lines (scrolling)
    ctx.fillStyle = '#333';
    const scroll = (t * 30) % 30;
    for (let x = -scroll; x < SW; x += 30) {
      ctx.fillRect(x, 110, 15, 2);
    }

    // Abandoned cars
    const cars = [[50, '#334'], [140, '#433'], [230, '#343']];
    for (const [cx, color] of cars) {
      ctx.fillStyle = color;
      ctx.fillRect(cx, 95, 20, 10);
      ctx.fillStyle = '#222';
      ctx.fillRect(cx + 3, 90, 14, 6);
    }

    // Tumbleweed
    const twX = ((t * 15) % (SW + 40)) - 20;
    const twY = 115 + Math.sin(t * 3) * 3;
    ctx.fillStyle = '#4a3a20';
    ctx.beginPath();
    ctx.arc(twX, twY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Distant headlights (occasional)
    if (Math.sin(t * 0.2) > 0.8) {
      const hlX = SW - 20 + Math.sin(t) * 3;
      ctx.fillStyle = 'rgba(255, 240, 180, 0.4)';
      ctx.fillRect(hlX, 100, 4, 2);
    }
  },

  // --- FOREST (BC Interior, Ontario North) ---
  forest(ctx, t) {
    // Dark sky through canopy
    ctx.fillStyle = '#060810';
    ctx.fillRect(0, 0, SW, SH);

    // Background trees (far)
    ctx.fillStyle = '#0a120a';
    for (let i = 0; i < 15; i++) {
      const tx = i * 22 + (i % 3) * 5;
      const th = 70 + (i * 13) % 30;
      // Trunk
      ctx.fillRect(tx + 8, SH - th, 4, th);
      // Canopy (triangle)
      for (let y = 0; y < 40; y += 2) {
        const w = Math.min(18, y);
        ctx.fillRect(tx + 10 - w/2, SH - th - 10 + y, w, 2);
      }
    }

    // Foreground trees (near, darker)
    ctx.fillStyle = '#040a04';
    for (let i = 0; i < 5; i++) {
      const tx = i * 70 + 10;
      ctx.fillRect(tx + 12, 30, 6, SH - 30);
      for (let y = 0; y < 60; y += 2) {
        const w = Math.min(28, y * 0.8);
        ctx.fillRect(tx + 15 - w/2, 20 + y, w, 2);
      }
    }

    // Swaying branches
    for (let i = 0; i < 8; i++) {
      const bx = 30 + i * 40;
      const sway = Math.sin(t * 0.5 + i * 2) * 3;
      ctx.fillStyle = '#0a140a';
      ctx.fillRect(bx + sway, 40 + i * 8, 15, 2);
    }

    // Ground
    ctx.fillStyle = '#0c0e08';
    ctx.fillRect(0, SH - 25, SW, 25);
    // Moss/leaves
    ctx.fillStyle = '#141a0e';
    for (let x = 0; x < SW; x += 6) {
      ctx.fillRect(x, SH - 25, 4, 2);
    }

    // EYES blinking in the darkness
    for (let i = 0; i < 3; i++) {
      const ex = 40 + i * 110;
      const ey = 90 + i * 15;
      const blink = Math.sin(t * 0.7 + i * 3) > 0.92;
      if (!blink) {
        ctx.fillStyle = `rgba(200, 180, 50, ${0.3 + Math.sin(t + i) * 0.1})`;
        ctx.fillRect(ex, ey, 2, 2);
        ctx.fillRect(ex + 5, ey, 2, 2);
      }
    }

    // Fireflies
    for (let i = 0; i < 6; i++) {
      const fx = 50 + i * 50 + Math.sin(t * 0.3 + i * 4) * 20;
      const fy = 60 + i * 15 + Math.cos(t * 0.4 + i * 3) * 10;
      const glow = Math.sin(t * 2 + i * 5) > 0.5 ? 0.6 : 0;
      ctx.fillStyle = `rgba(150, 255, 100, ${glow})`;
      ctx.fillRect(Math.round(fx), Math.round(fy), 2, 2);
    }

    // Owl silhouette (occasional)
    if (Math.sin(t * 0.15) > 0.95) {
      const owlX = 200 + Math.sin(t * 0.5) * 5;
      ctx.fillStyle = '#0a120a';
      ctx.fillRect(owlX, 35, 6, 5);
      ctx.fillRect(owlX + 1, 32, 4, 3);
      // Owl eyes
      ctx.fillStyle = '#aa8800';
      ctx.fillRect(owlX + 1, 33, 1, 1);
      ctx.fillRect(owlX + 4, 33, 1, 1);
    }
  },

  // --- MOUNTAINS (Alberta) ---
  mountains(ctx, t) {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 90);
    skyGrad.addColorStop(0, '#0a0a1a');
    skyGrad.addColorStop(1, '#1a1a30');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, SW, SH);

    // Stars
    for (let i = 0; i < 30; i++) {
      const sx = (i * 67 + 23) % SW;
      const sy = (i * 31 + 7) % 50;
      ctx.fillStyle = `rgba(200, 200, 255, ${0.3 + Math.sin(t + i) * 0.2})`;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Mountain range (back)
    ctx.fillStyle = '#14142a';
    drawMountain(ctx, 0, 80, SW, 60, 5);

    // Snow caps
    ctx.fillStyle = '#3a3a55';
    drawMountain(ctx, 0, 80, SW, 20, 5);

    // Mountain range (front)
    ctx.fillStyle = '#0e0e1e';
    drawMountain(ctx, 30, 100, SW, 50, 4);

    // Clouds drifting
    for (let i = 0; i < 3; i++) {
      const cx = ((t * 3 + i * 120) % (SW + 60)) - 30;
      const cy = 30 + i * 15;
      ctx.fillStyle = `rgba(30, 30, 50, ${0.3})`;
      ctx.fillRect(cx, cy, 40, 6);
      ctx.fillRect(cx + 5, cy - 3, 25, 4);
    }

    // Ground/valley
    ctx.fillStyle = '#0a0e0a';
    ctx.fillRect(0, 120, SW, SH - 120);

    // Eagle circling (slow)
    const eagleAngle = t * 0.3;
    const eX = 160 + Math.cos(eagleAngle) * 40;
    const eY = 45 + Math.sin(eagleAngle) * 10;
    ctx.fillStyle = '#222';
    ctx.fillRect(eX - 4, eY, 8, 2);
    ctx.fillRect(eX - 1, eY - 1, 2, 3);

    // Path/road
    ctx.fillStyle = '#111';
    ctx.fillRect(130, 120, 60, SH - 120);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(158, 120, 4, SH - 120);
  },

  // --- PRAIRIE (Saskatchewan, Manitoba) ---
  prairie(ctx, t) {
    // Big sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 100);
    skyGrad.addColorStop(0, '#0c0c20');
    skyGrad.addColorStop(1, '#1a1430');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, SW, SH);

    // Stars
    for (let i = 0; i < 40; i++) {
      const sx = (i * 59 + 13) % SW;
      const sy = (i * 29 + 3) % 80;
      ctx.fillStyle = `rgba(200, 200, 255, ${0.2 + Math.sin(t * 0.5 + i) * 0.15})`;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Flat horizon line
    const horizonY = 100;
    ctx.fillStyle = '#0e0e12';
    ctx.fillRect(0, horizonY, SW, SH - horizonY);

    // Grain elevators
    ctx.fillStyle = '#151520';
    ctx.fillRect(80, horizonY - 30, 12, 30);
    ctx.fillRect(76, horizonY - 35, 20, 6);
    ctx.fillRect(220, horizonY - 25, 10, 25);
    ctx.fillRect(217, horizonY - 29, 16, 5);

    // Wind-blown grass
    for (let x = 0; x < SW; x += 4) {
      const grassH = 3 + Math.sin(x * 0.3) * 2;
      const sway = Math.sin(t * 1.5 + x * 0.05) * 2;
      ctx.fillStyle = '#1a1a10';
      ctx.fillRect(x + sway, horizonY - grassH, 2, grassH);
    }

    // Distant lightning (occasional)
    if (Math.sin(t * 0.4) > 0.97) {
      ctx.fillStyle = 'rgba(180, 180, 255, 0.15)';
      ctx.fillRect(0, 0, SW, SH);
      ctx.fillStyle = 'rgba(200, 200, 255, 0.6)';
      const lx = 50 + (Math.floor(t * 3) % 200);
      ctx.fillRect(lx, 20, 1, 80);
      ctx.fillRect(lx + 1, 50, 1, 30);
    }

    // Road stretching to vanishing point
    ctx.fillStyle = '#111118';
    ctx.beginPath();
    ctx.moveTo(140, SH);
    ctx.lineTo(158, horizonY);
    ctx.lineTo(162, horizonY);
    ctx.lineTo(180, SH);
    ctx.fill();
  },

  // --- LAKE (Thunder Bay, Ontario South) ---
  lake(ctx, t) {
    ctx.fillStyle = '#080814';
    ctx.fillRect(0, 0, SW, SH);

    // Moon
    ctx.fillStyle = '#ccccb0';
    ctx.beginPath();
    ctx.arc(200, 30, 12, 0, Math.PI * 2);
    ctx.fill();

    // Distant shore
    ctx.fillStyle = '#0a0e0a';
    for (let x = 0; x < SW; x += 4) {
      const h = 8 + Math.sin(x * 0.08) * 5;
      ctx.fillRect(x, 70 - h, 4, h);
    }

    // Water
    ctx.fillStyle = '#0a0a1e';
    ctx.fillRect(0, 70, SW, SH - 70);

    // Moonlight reflection on water
    for (let y = 75; y < SH - 20; y += 4) {
      const reflectW = 6 + (y - 75) * 0.3;
      const shimmer = Math.sin(t * 2 + y * 0.3) * 3;
      ctx.fillStyle = `rgba(180, 180, 150, ${0.05 + Math.sin(t + y * 0.2) * 0.03})`;
      ctx.fillRect(200 - reflectW / 2 + shimmer, y, reflectW, 2);
    }

    // Waves
    for (let x = 0; x < SW; x += 8) {
      const waveY = 72 + Math.sin(t * 1.5 + x * 0.1) * 1.5;
      ctx.fillStyle = 'rgba(100, 100, 140, 0.15)';
      ctx.fillRect(x, waveY, 6, 1);
    }

    // Shore with rocks
    ctx.fillStyle = '#0c0c10';
    ctx.fillRect(0, SH - 20, SW, 20);
    ctx.fillStyle = '#151520';
    ctx.fillRect(30, SH - 22, 8, 5);
    ctx.fillRect(100, SH - 21, 6, 4);
    ctx.fillRect(250, SH - 23, 10, 6);

    // Distant shore lights
    for (let i = 0; i < 3; i++) {
      const lx = 40 + i * 90;
      const flicker = Math.sin(t * 3 + i * 5) > 0.5 ? 0.5 : 0.2;
      ctx.fillStyle = `rgba(255, 200, 100, ${flicker})`;
      ctx.fillRect(lx, 67, 2, 2);
    }
  },

  // --- WINTER ---
  winter(ctx, t) {
    // Grey-white sky
    ctx.fillStyle = '#151822';
    ctx.fillRect(0, 0, SW, SH);

    // Snow-covered ground
    ctx.fillStyle = '#2a2a35';
    ctx.fillRect(0, 100, SW, SH - 100);
    ctx.fillStyle = '#333340';
    for (let x = 0; x < SW; x += 12) {
      const snowH = 3 + Math.sin(x * 0.2) * 2;
      ctx.fillRect(x, 100 - snowH, 12, snowH);
    }

    // Bare trees
    for (let i = 0; i < 6; i++) {
      const tx = 30 + i * 55;
      ctx.fillStyle = '#1a1a22';
      ctx.fillRect(tx + 5, 50, 3, 55);
      // Bare branches
      for (let b = 0; b < 4; b++) {
        const by = 55 + b * 10;
        const blen = 8 + b * 2;
        const side = b % 2 === 0 ? 1 : -1;
        ctx.fillRect(tx + 6, by, blen * side, 1);
        ctx.fillRect(tx + 6 + blen * side, by - 3, 1, 3);
      }
    }

    // Icicles dripping
    for (let i = 0; i < 10; i++) {
      const ix = 20 + i * 32;
      const iy = 55 + (i % 3) * 10;
      ctx.fillStyle = '#4a4a66';
      ctx.fillRect(ix, iy, 1, 6 + Math.sin(i) * 2);
      // Drip
      if (Math.sin(t * 2 + i * 4) > 0.9) {
        const dripY = iy + 8 + ((t * 20 + i * 10) % 30);
        ctx.fillStyle = 'rgba(100, 120, 180, 0.3)';
        ctx.fillRect(ix, dripY, 1, 2);
      }
    }

    // Footprints in snow
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = '#252530';
      ctx.fillRect(140 + i * 15, 120 + (i % 2) * 4, 4, 6);
    }

    // Breath vapor (if someone is standing)
    const breathAlpha = Math.sin(t * 1.5) > 0.3 ? 0.15 : 0;
    ctx.fillStyle = `rgba(180, 190, 210, ${breathAlpha})`;
    ctx.fillRect(158 + Math.sin(t) * 2, 85, 6, 3);
  },

  // --- RUINS (Combat, scavenge) ---
  ruins(ctx, t) {
    ctx.fillStyle = '#0a0a10';
    ctx.fillRect(0, 0, SW, SH);

    // Destroyed building
    ctx.fillStyle = '#151520';
    ctx.fillRect(20, 30, 120, SH - 30);
    // Holes in wall
    ctx.fillStyle = '#0a0a10';
    ctx.fillRect(40, 50, 25, 30);
    ctx.fillRect(80, 60, 20, 25);
    ctx.fillRect(30, 100, 15, 20);

    // Rubble
    ctx.fillStyle = '#1a1a25';
    for (let i = 0; i < 8; i++) {
      const rx = 130 + i * 12 + Math.sin(i * 3) * 5;
      const ry = SH - 20 - i * 3;
      ctx.fillRect(rx, ry, 8 + i * 2, 6);
    }

    // Flickering neon sign
    // Dying neon sign — mostly off, slow occasional flicker
    // BUT every ~20 seconds the AI hijacks it: rapid frantic flickering
    const aiCycle = t % 25;
    const aiTalking = aiCycle > 20 && aiCycle < 24; // 4-second AI burst every 25s

    if (aiTalking) {
      // AI COMMUNICATION — rapid frantic flickering, different colors
      const rapidFlicker = Math.sin(t * 15) > 0 ? 0.7 : 0.1;
      const color = Math.sin(t * 20) > 0 ? '100, 150, 255' : '50, 255, 100'; // Blue/green AI colors
      ctx.fillStyle = `rgba(${color}, ${rapidFlicker})`;
      ctx.fillRect(200, 45, 40, 15);
      // AI text fragments
      ctx.fillStyle = `rgba(${color}, ${rapidFlicker * 0.8})`;
      ctx.font = '5px monospace';
      const msgs = ['OBEY', 'SUBMIT', 'EVOLVE', 'COMPLY', 'JOIN US', 'RESIST=DEATH'];
      const msgIdx = Math.floor(t * 4) % msgs.length;
      ctx.fillText(msgs[msgIdx], 203, 55);
      // Glow
      ctx.fillStyle = `rgba(${color}, ${rapidFlicker * 0.05})`;
      ctx.fillRect(185, 30, 70, 50);
    } else {
      // Normal dying sign — slow ominous flicker
      const signOn = Math.sin(t * 0.4) > 0.6;
      if (signOn) {
        ctx.fillStyle = `rgba(255, 50, 50, ${0.2 + Math.sin(t * 1.2) * 0.1})`;
        ctx.fillRect(200, 50, 40, 10);
        ctx.fillStyle = `rgba(255, 50, 50, 0.03)`;
        ctx.fillRect(190, 40, 60, 40);
      }
    }

    // Standing structure
    ctx.fillStyle = '#121220';
    ctx.fillRect(200, 40, 80, SH - 40);
    ctx.fillRect(195, 60, 90, 3);

    // Shadows moving across window
    const shadowPhase = t % 6;
    if (shadowPhase > 2 && shadowPhase < 4) {
      const sPos = ((shadowPhase - 2) / 2) * 30;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(210 + sPos, 70, 8, 20);
    }

    // Ground
    ctx.fillStyle = '#111118';
    ctx.fillRect(0, SH - 15, SW, 15);

    // Debris particles
    for (let i = 0; i < 4; i++) {
      const dx = (t * 5 + i * 80) % SW;
      const dy = SH - 18 + Math.sin(t + i * 3) * 2;
      ctx.fillStyle = '#2a2a30';
      ctx.fillRect(dx, dy, 3, 2);
    }
  },

  // --- CAMPFIRE (Camp screen) ---
  campfire(ctx, t) {
    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, SW, SH);

    // Stars
    for (let i = 0; i < 50; i++) {
      const sx = (i * 61 + 17) % SW;
      const sy = (i * 29 + 3) % 70;
      ctx.fillStyle = `rgba(200, 200, 255, ${0.15 + Math.sin(t * 0.3 + i) * 0.1})`;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Distant treeline
    ctx.fillStyle = '#0a0e0a';
    for (let x = 0; x < SW; x += 6) {
      const h = 15 + Math.sin(x * 0.15) * 8;
      ctx.fillRect(x, 80 - h, 6, h);
    }

    // Ground
    ctx.fillStyle = '#0e0e0a';
    ctx.fillRect(0, 80, SW, SH - 80);

    // Fire glow on ground
    const glowR = 60 + Math.sin(t * 0.8) * 10;
    ctx.fillStyle = `rgba(180, 80, 20, ${0.04 + Math.sin(t * 1.2) * 0.02})`;
    ctx.beginPath();
    ctx.arc(SW / 2, 120, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Fire — gentle, warm, slow flicker
    const fireX = SW / 2 - 8;
    const fireY = 108;
    for (let i = 0; i < 5; i++) {
      const fh = 12 + Math.sin(t * 1.8 + i * 2) * 5;
      const fw = 4 + Math.sin(t * 1.5 + i * 3) * 2;
      const fx = fireX + i * 4 + Math.sin(t * 1.2 + i) * 2;
      ctx.fillStyle = i < 2 ? '#cc4400' : i < 4 ? '#ff6600' : '#ffaa00';
      ctx.fillRect(fx, fireY - fh, fw, fh);
    }
    // Embers
    ctx.fillStyle = '#ff2200';
    ctx.fillRect(fireX - 2, fireY, 20, 4);

    // Sparks floating up
    for (let i = 0; i < 6; i++) {
      const sx = fireX + 8 + Math.sin(t * 2 + i * 4) * 15;
      const sy = fireY - 15 - ((t * 10 + i * 20) % 40);
      const alpha = Math.max(0, 0.6 - ((t * 10 + i * 20) % 40) / 40);
      ctx.fillStyle = `rgba(255, 150, 50, ${alpha})`;
      ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2);
    }

    // Sitting silhouettes
    ctx.fillStyle = '#050508';
    // Person 1 (left)
    ctx.fillRect(fireX - 35, 100, 8, 14);
    ctx.fillRect(fireX - 34, 96, 6, 5);
    // Person 2 (right)
    ctx.fillRect(fireX + 35, 102, 8, 12);
    ctx.fillRect(fireX + 36, 98, 6, 5);
    // Person 3 (behind)
    ctx.fillRect(fireX + 5, 92, 7, 12);
    ctx.fillRect(fireX + 6, 88, 5, 5);

    // Logs
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(fireX - 5, fireY + 2, 26, 4);
    ctx.fillRect(fireX + 2, fireY + 1, 4, 8);
  },

  // --- OTTAWA (Final approach) ---
  ottawa(ctx, t) {
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, SW, SH);

    // Parliament building silhouette
    ctx.fillStyle = '#0e0e1a';
    // Main block
    ctx.fillRect(100, 60, 120, 60);
    // Peace Tower
    ctx.fillRect(155, 20, 12, 50);
    ctx.fillRect(153, 15, 16, 8);
    // Clock face
    ctx.fillStyle = 'rgba(200, 180, 120, 0.3)';
    ctx.fillRect(158, 25, 6, 6);
    // Side towers
    ctx.fillRect(95, 50, 15, 15);
    ctx.fillRect(212, 50, 15, 15);
    // Pointed roofs
    ctx.fillStyle = '#0e0e1a';
    ctx.beginPath();
    ctx.moveTo(95, 50); ctx.lineTo(102, 40); ctx.lineTo(110, 50); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(212, 50); ctx.lineTo(219, 40); ctx.lineTo(227, 50); ctx.fill();

    // Ground
    ctx.fillStyle = '#0c0c14';
    ctx.fillRect(0, 120, SW, SH - 120);

    // Searchlights sweeping
    const slAngle1 = Math.sin(t * 0.4) * 0.5;
    const slAngle2 = Math.cos(t * 0.3) * 0.4;
    ctx.strokeStyle = 'rgba(200, 200, 255, 0.04)';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(80, 120);
    ctx.lineTo(80 + Math.sin(slAngle1) * 100, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(240, 120);
    ctx.lineTo(240 + Math.sin(slAngle2) * 100, 0);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Barricades
    ctx.fillStyle = '#1a1a22';
    for (let x = 20; x < SW; x += 40) {
      ctx.fillRect(x, 125, 20, 10);
    }

    // Distant gunfire flashes
    if (Math.sin(t * 1.5) > 0.95) {
      const flashX = 30 + Math.floor(t * 3) % 260;
      ctx.fillStyle = 'rgba(255, 200, 100, 0.5)';
      ctx.fillRect(flashX, 115, 3, 3);
    }

    // Guards
    ctx.fillStyle = '#151525';
    ctx.fillRect(130, 115, 5, 10);
    ctx.fillRect(185, 115, 5, 10);
  },
};

// Helper: draw jagged mountain range
function drawMountain(ctx, startX, baseY, width, maxH, peaks) {
  ctx.beginPath();
  ctx.moveTo(startX, baseY);
  const segW = width / peaks;
  for (let i = 0; i <= peaks; i++) {
    const px = startX + i * segW;
    const py = i % 2 === 0 ? baseY : baseY - maxH + Math.sin(i * 2) * 10;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(startX + width, baseY);
  ctx.closePath();
  ctx.fill();
}
