// ============================================================
// MASEDOG: Dead North — Animated 16-Bit Background Scenes
// Procedural pixel-art scenes rendered on Canvas.
// Each scene has subtle animated elements for atmosphere.
// ============================================================

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
  renderScene();
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
            const flicker = Math.sin(t * 8 + bx * wx) > 0.9 ? 0.3 : 0.7;
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
      const glow = 0.3 + Math.sin(t * 2 + i * 2) * 0.15;
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
      const flicker = Math.sin(t * 12 + i * 7) > 0.85 ? 0.1 : 0.7;
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
    const redFlash = Math.sin(t * 4) > 0;
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
    const signOn = Math.sin(t * 6) > 0.3;
    if (signOn) {
      ctx.fillStyle = `rgba(255, 50, 50, ${0.3 + Math.sin(t * 8) * 0.2})`;
      ctx.fillRect(200, 50, 40, 10);
      ctx.fillStyle = `rgba(255, 50, 50, 0.05)`;
      ctx.fillRect(190, 40, 60, 40);
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
    const glowR = 60 + Math.sin(t * 3) * 10;
    ctx.fillStyle = `rgba(180, 80, 20, ${0.04 + Math.sin(t * 4) * 0.02})`;
    ctx.beginPath();
    ctx.arc(SW / 2, 120, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Fire
    const fireX = SW / 2 - 8;
    const fireY = 108;
    for (let i = 0; i < 5; i++) {
      const fh = 12 + Math.sin(t * 6 + i * 2) * 5;
      const fw = 4 + Math.sin(t * 5 + i * 3) * 2;
      const fx = fireX + i * 4 + Math.sin(t * 4 + i) * 2;
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
