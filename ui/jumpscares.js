// ============================================================
// MASEDOG: Dead North — Jump Scares & Visual Event System
// Full-screen cinematic horror effects rendered with Canvas 2D.
// Pixel art style at 320x180 internal resolution, scaled up.
// ============================================================

// Internal pixel art resolution
const PX_W = 320;
const PX_H = 180;

// ---- Overlay Management ----

/**
 * Create a full-screen overlay canvas for rendering an effect.
 * Returns { canvas, ctx, cleanup } where cleanup removes the element.
 */
function createOverlay() {
  const canvas = document.createElement('canvas');
  canvas.width = PX_W;
  canvas.height = PX_H;
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: 500;
    pointer-events: none;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  `;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  function cleanup() {
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }

  return { canvas, ctx, cleanup };
}

/**
 * Wait for the given number of milliseconds.
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Animate a sequence of frames using requestAnimationFrame.
 * drawFn receives (ctx, progress) where progress goes from 0 to 1.
 * Returns a promise that resolves when duration has elapsed.
 */
function animate(ctx, duration, drawFn) {
  return new Promise(resolve => {
    const start = performance.now();
    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      drawFn(ctx, progress);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

// ---- Screen Shake Helper ----

function shakeScreen(intensity, duration) {
  return new Promise(resolve => {
    const el = document.querySelector('.screen.active') || document.body;
    const startTime = Date.now();
    const origTransform = el.style.transform;

    function tick() {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        el.style.transform = origTransform || '';
        resolve();
        return;
      }
      const decay = 1 - elapsed / duration;
      const x = (Math.random() - 0.5) * intensity * 2 * decay;
      const y = (Math.random() - 0.5) * intensity * 2 * decay;
      el.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(tick);
    }
    tick();
  });
}

// ---- Pixel Art Drawing Helpers ----

/**
 * Draw a filled rectangle in pixel coords.
 */
function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/**
 * Draw a row of pixels from an array of color strings (null = skip).
 */
function pxRow(ctx, startX, y, pixelSize, colors) {
  for (let i = 0; i < colors.length; i++) {
    if (colors[i]) {
      ctx.fillStyle = colors[i];
      ctx.fillRect(startX + i * pixelSize, y, pixelSize, pixelSize);
    }
  }
}

// ---- Zombie Face Sprite ----

/**
 * Draw a detailed pixel art zombie face that fills the canvas.
 * The face is drawn on a grid where each "pixel" is a block.
 */
function drawZombieFace(ctx, offsetY = 0, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.clearRect(0, 0, PX_W, PX_H);

  // Background: dark reddish-black
  px(ctx, 0, 0, PX_W, PX_H, '#0a0505');

  // Face fills most of the canvas
  // Each block is 8x8 pixels in our 320x180 space
  const B = 8;
  // Face is roughly 30 blocks wide, 20 blocks tall, centered
  const faceW = 30;
  const faceH = 20;
  const faceX = Math.floor((PX_W / B - faceW) / 2);
  const faceY = Math.floor((PX_H / B - faceH) / 2) + Math.floor(offsetY / B);

  // Skin colors
  const skin = '#3a5a3a';      // sickly green
  const skinDark = '#2a4028';  // darker green
  const skinLight = '#4a6a42'; // lighter spots
  const flesh = '#6a3030';     // exposed flesh / wounds
  const bone = '#c8b890';      // exposed bone
  const blood = '#8a1010';     // blood
  const bloodDrip = '#6a0808';
  const eyeSocket = '#0a0a0a'; // empty sockets
  const eyeGlow = '#ff1a1a';   // red glow in eyes
  const teeth = '#d8c898';     // yellowed teeth
  const teethDark = '#a89868'; // darker teeth
  const mouth = '#1a0808';     // inside mouth
  const gum = '#5a2020';       // gums
  const nostril = '#1a1a0a';   // nostrils
  const hair = '#2a1a10';      // matted hair

  // Draw face outline (oval-ish shape made of blocks)
  // Row by row from top to bottom
  const faceMap = [
    // row 0: top of head - sparse hair
    { x: 8, w: 14, c: hair },
    // row 1: forehead top
    { x: 6, w: 18, c: skinDark },
    // row 2: forehead
    { x: 5, w: 20, c: skin },
    // row 3: brow ridge
    { x: 4, w: 22, c: skinDark },
    // row 4: brow ridge heavy
    { x: 4, w: 22, c: skinDark },
    // row 5: upper eye area
    { x: 3, w: 24, c: skin },
    // row 6: eyes top
    { x: 3, w: 24, c: skin },
    // row 7: eyes middle
    { x: 3, w: 24, c: skin },
    // row 8: eyes bottom
    { x: 3, w: 24, c: skin },
    // row 9: cheek / nose bridge
    { x: 4, w: 22, c: skin },
    // row 10: nose
    { x: 4, w: 22, c: skin },
    // row 11: nose base / upper lip area
    { x: 4, w: 22, c: skinDark },
    // row 12: mouth top
    { x: 5, w: 20, c: skin },
    // row 13: mouth - teeth
    { x: 5, w: 20, c: skin },
    // row 14: mouth bottom - teeth
    { x: 5, w: 20, c: skin },
    // row 15: lower mouth
    { x: 5, w: 20, c: skinDark },
    // row 16: chin top
    { x: 6, w: 18, c: skin },
    // row 17: chin
    { x: 7, w: 16, c: skinDark },
    // row 18: chin bottom
    { x: 9, w: 12, c: skinDark },
    // row 19: jaw drip
    { x: 11, w: 8, c: flesh },
  ];

  // Draw base face shape
  for (let r = 0; r < faceMap.length; r++) {
    const row = faceMap[r];
    px(ctx, (faceX + row.x) * B, (faceY + r) * B, row.w * B, B, row.c);
  }

  // --- Eye sockets (large, hollow) ---
  // Left eye socket (rows 5-8, cols 7-12)
  const lEyeX = faceX + 7;
  const lEyeY = faceY + 5;
  for (let r = 0; r < 4; r++) {
    const indent = r === 0 || r === 3 ? 1 : 0;
    const w = r === 0 || r === 3 ? 4 : 6;
    px(ctx, (lEyeX + indent) * B, (lEyeY + r) * B, w * B, B, eyeSocket);
  }
  // Red glow dots in left eye
  px(ctx, (lEyeX + 2) * B, (lEyeY + 1) * B, B * 2, B * 2, eyeGlow);
  // Tiny bright center
  px(ctx, (lEyeX + 2) * B + 3, (lEyeY + 2) * B - 2, B, B, '#ff6644');

  // Right eye socket (rows 5-8, cols 18-23)
  const rEyeX = faceX + 18;
  const rEyeY = faceY + 5;
  for (let r = 0; r < 4; r++) {
    const indent = r === 0 || r === 3 ? 1 : 0;
    const w = r === 0 || r === 3 ? 4 : 6;
    px(ctx, (rEyeX + indent) * B, (rEyeY + r) * B, w * B, B, eyeSocket);
  }
  // Red glow dots in right eye
  px(ctx, (rEyeX + 2) * B, (rEyeY + 1) * B, B * 2, B * 2, eyeGlow);
  px(ctx, (rEyeX + 3) * B - 3, (rEyeY + 2) * B - 2, B, B, '#ff6644');

  // --- Nose (two dark nostrils) ---
  const noseX = faceX + 13;
  const noseY = faceY + 9;
  px(ctx, noseX * B, noseY * B, B * 4, B * 2, skinLight);
  px(ctx, (noseX + 0) * B + 2, (noseY + 1) * B, B, B, nostril);
  px(ctx, (noseX + 3) * B - 2, (noseY + 1) * B, B, B, nostril);
  // Nose bridge
  px(ctx, (noseX + 1) * B, (noseY - 2) * B, B * 2, B * 2, skinLight);

  // --- Mouth (wide open, showing teeth) ---
  const mouthX = faceX + 8;
  const mouthY = faceY + 12;
  const mouthW = 14;
  const mouthH = 4;

  // Mouth cavity
  px(ctx, mouthX * B, mouthY * B, mouthW * B, mouthH * B, mouth);

  // Upper teeth (irregular, some missing)
  const upperTeeth = [
    teeth, teeth, teethDark, teeth, null, teeth, teeth, null,
    teeth, teethDark, teeth, teeth, teeth, teethDark,
  ];
  for (let i = 0; i < upperTeeth.length; i++) {
    if (upperTeeth[i]) {
      const tw = B;
      const th = B + (i % 3 === 0 ? 3 : 0); // Some teeth longer
      px(ctx, (mouthX + i) * B, mouthY * B, tw, th, upperTeeth[i]);
    }
  }

  // Lower teeth (fewer, more jagged)
  const lowerTeeth = [
    null, teethDark, teeth, null, null, teeth, null, null,
    teeth, null, teethDark, null, teeth, null,
  ];
  for (let i = 0; i < lowerTeeth.length; i++) {
    if (lowerTeeth[i]) {
      const th = B + (i % 2 === 0 ? 2 : 0);
      px(ctx, (mouthX + i) * B, (mouthY + mouthH) * B - th, B, th, lowerTeeth[i]);
    }
  }

  // Gums
  px(ctx, mouthX * B, (mouthY) * B - 2, mouthW * B, 3, gum);
  px(ctx, mouthX * B, (mouthY + mouthH) * B - 1, mouthW * B, 3, gum);

  // --- Blood drips from mouth ---
  px(ctx, (mouthX + 3) * B, (mouthY + mouthH) * B, B, B * 3, blood);
  px(ctx, (mouthX + 7) * B, (mouthY + mouthH) * B, B, B * 5, blood);
  px(ctx, (mouthX + 7) * B, (mouthY + mouthH) * B + B * 5, B, B * 2, bloodDrip);
  px(ctx, (mouthX + 10) * B, (mouthY + mouthH) * B, B, B * 2, blood);

  // --- Flesh wounds on cheeks ---
  px(ctx, (faceX + 5) * B, (faceY + 9) * B, B * 2, B, flesh);
  px(ctx, (faceX + 5) * B, (faceY + 10) * B, B, B, blood);
  px(ctx, (faceX + 23) * B, (faceY + 8) * B, B * 2, B * 2, flesh);
  px(ctx, (faceX + 24) * B, (faceY + 10) * B, B, B, bone);

  // --- Cracks / damage on forehead ---
  px(ctx, (faceX + 10) * B, (faceY + 2) * B, B, B * 2, flesh);
  px(ctx, (faceX + 11) * B, (faceY + 3) * B, B, B, blood);
  px(ctx, (faceX + 19) * B, (faceY + 1) * B, B, B * 3, flesh);

  // --- Matted hair strands ---
  for (let i = 0; i < 14; i++) {
    const hx = (faceX + 8 + i) * B;
    const hy = (faceY - 1) * B;
    const hLen = 3 + (i % 4);
    if (i % 2 === 0) {
      px(ctx, hx, hy, B, B * hLen, hair);
    }
  }

  ctx.restore();
}

// ---- Zombie Body Sprite (for rise effect) ----

function drawZombieBody(ctx, riseProgress, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.clearRect(0, 0, PX_W, PX_H);

  // Background darkens as zombie rises
  px(ctx, 0, 0, PX_W, PX_H, `rgba(5, 2, 2, ${0.3 + riseProgress * 0.6})`);

  const B = 6;
  // Zombie rises from bottom. At progress=0, top of head is at bottom edge.
  // At progress=1, face fills most of screen.
  const bodyHeight = 30 * B;
  const startY = PX_H - bodyHeight * riseProgress;

  const skin = '#3a5a3a';
  const skinDark = '#2a4028';
  const cloth = '#2a2a3a';
  const clothTorn = '#1a1a28';
  const blood = '#6a1010';
  const eyeGlow = '#ff1a1a';
  const eyeSocket = '#0a0a0a';
  const teeth = '#c8b890';
  const mouth = '#1a0808';

  // Shoulders and torso (wide)
  const torsoX = Math.floor((PX_W / B - 36) / 2);
  const torsoY = startY + 16 * B;
  px(ctx, torsoX * B, torsoY, 36 * B, 14 * B, cloth);
  // Torn clothing details
  px(ctx, (torsoX + 5) * B, torsoY + 2 * B, 3 * B, B, clothTorn);
  px(ctx, (torsoX + 20) * B, torsoY + 4 * B, 4 * B, B, clothTorn);
  px(ctx, (torsoX + 10) * B, torsoY + 8 * B, 2 * B, 3 * B, blood);
  // Exposed flesh on shoulder
  px(ctx, (torsoX + 2) * B, torsoY, 4 * B, 3 * B, skin);
  px(ctx, (torsoX + 30) * B, torsoY + B, 3 * B, 2 * B, skin);

  // Arms reaching upward
  const armY = torsoY - 4 * B;
  // Left arm
  px(ctx, (torsoX - 2) * B, armY, 4 * B, 8 * B, skinDark);
  px(ctx, (torsoX - 4) * B, armY - 3 * B, 3 * B, 5 * B, skin);
  // Right arm
  px(ctx, (torsoX + 34) * B, armY, 4 * B, 8 * B, skinDark);
  px(ctx, (torsoX + 37) * B, armY - 3 * B, 3 * B, 5 * B, skin);
  // Fingers / claws
  px(ctx, (torsoX - 5) * B, armY - 5 * B, B, 3 * B, skin);
  px(ctx, (torsoX - 3) * B, armY - 6 * B, B, 3 * B, skin);
  px(ctx, (torsoX + 38) * B, armY - 5 * B, B, 3 * B, skin);
  px(ctx, (torsoX + 40) * B, armY - 6 * B, B, 3 * B, skin);

  // Neck
  const neckX = Math.floor((PX_W / B - 8) / 2);
  px(ctx, neckX * B, startY + 13 * B, 8 * B, 4 * B, skinDark);

  // Head (simplified face)
  const headX = Math.floor((PX_W / B - 16) / 2);
  const headY = startY;
  // Skull shape
  px(ctx, (headX + 2) * B, headY, 12 * B, B, skinDark);
  px(ctx, (headX + 1) * B, headY + B, 14 * B, B, skin);
  for (let r = 2; r < 12; r++) {
    const indent = r > 10 ? 2 : r < 2 ? 1 : 0;
    px(ctx, (headX + indent) * B, headY + r * B, (16 - indent * 2) * B, B, r < 5 ? skinDark : skin);
  }
  px(ctx, (headX + 2) * B, headY + 12 * B, 12 * B, B, skinDark);

  // Eyes
  px(ctx, (headX + 3) * B, headY + 5 * B, 3 * B, 3 * B, eyeSocket);
  px(ctx, (headX + 10) * B, headY + 5 * B, 3 * B, 3 * B, eyeSocket);
  px(ctx, (headX + 4) * B, headY + 6 * B, B, B, eyeGlow);
  px(ctx, (headX + 11) * B, headY + 6 * B, B, B, eyeGlow);

  // Mouth
  px(ctx, (headX + 4) * B, headY + 9 * B, 8 * B, 2 * B, mouth);
  // Teeth
  for (let i = 0; i < 8; i++) {
    if (i % 3 !== 1) {
      px(ctx, (headX + 4 + i) * B, headY + 9 * B, B, B - 1, teeth);
    }
  }
  // Blood from mouth
  px(ctx, (headX + 6) * B, headY + 11 * B, B, B * 2, blood);

  ctx.restore();
}

// ---- Small Critter Sprites ----

function drawCat(ctx, x, y, facingLeft) {
  ctx.save();
  const B = 3;
  const dir = facingLeft ? -1 : 1;
  // Simple pixel cat: body, head, ears, tail, legs
  const bodyColor = '#6a5a4a';
  const earColor = '#8a6a50';
  const eyeColor = '#aaff44';
  const noseColor = '#d08888';

  // Body
  px(ctx, x, y, B * 6, B * 3, bodyColor);
  // Head
  const headX = facingLeft ? x - B * 3 : x + B * 6;
  px(ctx, headX, y - B, B * 3, B * 3, bodyColor);
  // Ears
  px(ctx, headX + (facingLeft ? 0 : B * 2), y - B * 2, B, B, earColor);
  px(ctx, headX + (facingLeft ? B * 2 : 0), y - B * 2, B, B, earColor);
  // Eyes
  px(ctx, headX + (facingLeft ? 0 : B * 2), y - B + 1, B, B, eyeColor);
  px(ctx, headX + (facingLeft ? B * 2 : 0), y - B + 1, B, B, eyeColor);
  // Nose
  px(ctx, headX + B, y + 1, B, B, noseColor);
  // Tail (curves up)
  const tailX = facingLeft ? x + B * 6 : x - B * 3;
  px(ctx, tailX, y - B * 2, B, B * 3, bodyColor);
  px(ctx, tailX + (facingLeft ? B : -B), y - B * 3, B, B * 2, bodyColor);
  // Legs
  px(ctx, x + B, y + B * 3, B, B * 2, bodyColor);
  px(ctx, x + B * 4, y + B * 3, B, B * 2, bodyColor);

  ctx.restore();
}

function drawRat(ctx, x, y, facingLeft) {
  const B = 2;
  const color = '#5a4a3a';
  const tailColor = '#7a5a4a';
  const eyeColor = '#ee3333';

  // Body (oval-ish)
  px(ctx, x, y, B * 5, B * 2, color);
  // Head
  const headX = facingLeft ? x - B * 2 : x + B * 5;
  px(ctx, headX, y, B * 2, B * 2, color);
  // Snout
  const snoutX = facingLeft ? headX - B : headX + B * 2;
  px(ctx, snoutX, y + B, B, B, '#8a6a5a');
  // Eye
  px(ctx, headX + (facingLeft ? 0 : B), y, B, B, eyeColor);
  // Tail
  const tailX = facingLeft ? x + B * 5 : x - B * 4;
  px(ctx, tailX, y + B, B * 4, B, tailColor);
  // Legs
  px(ctx, x + B, y + B * 2, B, B, color);
  px(ctx, x + B * 3, y + B * 2, B, B, color);
}

function drawBird(ctx, x, y) {
  const B = 3;
  // Simple bird in flight
  const color = '#3a3a3a';
  // Body
  px(ctx, x, y, B * 2, B, color);
  // Wings (V shape)
  px(ctx, x - B * 2, y - B, B, B, color);
  px(ctx, x - B, y, B, B, color);
  px(ctx, x + B * 2, y, B, B, color);
  px(ctx, x + B * 3, y - B, B, B, color);
}

// ============================================================
// PUBLIC API: Visual Effect Functions
// ============================================================

/**
 * ZOMBIE JUMP SCARE
 * Zombie face fills the screen suddenly, screen shakes, then fades out.
 * Total duration: ~900ms
 */
export async function zombieJumpScare() {
  const { ctx, cleanup } = createOverlay();

  // INSTANT: draw zombie face at full opacity
  drawZombieFace(ctx, 0, 1);

  // Shake the screen while the face is visible (400ms)
  const shakePromise = shakeScreen(12, 400);

  // Hold for 400ms
  await wait(400);

  // Wait for shake to finish
  await shakePromise;

  // Fade out over 300ms
  await animate(ctx, 300, (c, p) => {
    drawZombieFace(c, 0, 1 - p);
  });

  // Brief darkness then clear
  await wait(100);
  cleanup();
}

/**
 * FAKE JUMP SCARE
 * Tension builds for 2 seconds (screen darkens, edges creep in),
 * then either nothing (relief) or a critter scurries across.
 * variant: 'cat' | 'rat' | 'bird' | 'nothing'
 */
export async function fakeJumpScare(variant = 'cat') {
  const { canvas, ctx, cleanup } = createOverlay();

  // Phase 1: Tension build (2 seconds) - screen slowly darkens
  await animate(ctx, 2000, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);
    // Darkening vignette from edges
    const alpha = p * 0.6;
    const gradient = c.createRadialGradient(
      PX_W / 2, PX_H / 2, PX_W * 0.15,
      PX_W / 2, PX_H / 2, PX_W * 0.6
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${alpha})`);
    c.fillStyle = gradient;
    c.fillRect(0, 0, PX_W, PX_H);

    // Occasional subtle flickers in last 30%
    if (p > 0.7 && Math.random() < 0.1) {
      c.fillStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.15})`;
      c.fillRect(0, 0, PX_W, PX_H);
    }
  });

  // Phase 2: The "payoff" (or lack thereof)
  if (variant === 'nothing') {
    // Just fade the darkness back out - nothing happened
    await animate(ctx, 800, (c, p) => {
      c.clearRect(0, 0, PX_W, PX_H);
      const alpha = 0.6 * (1 - p);
      const gradient = c.createRadialGradient(
        PX_W / 2, PX_H / 2, PX_W * 0.15,
        PX_W / 2, PX_H / 2, PX_W * 0.6
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, `rgba(0, 0, 0, ${alpha})`);
      c.fillStyle = gradient;
      c.fillRect(0, 0, PX_W, PX_H);
    });
  } else {
    // Critter scurries across the screen
    const critterY = PX_H * 0.65 + Math.random() * (PX_H * 0.2);
    const startX = -30;
    const endX = PX_W + 30;
    const facingLeft = false;

    await animate(ctx, 600, (c, p) => {
      c.clearRect(0, 0, PX_W, PX_H);

      // Keep the vignette but slightly lighter
      const vAlpha = 0.4 * (1 - p);
      const gradient = c.createRadialGradient(
        PX_W / 2, PX_H / 2, PX_W * 0.15,
        PX_W / 2, PX_H / 2, PX_W * 0.6
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, `rgba(0, 0, 0, ${vAlpha})`);
      c.fillStyle = gradient;
      c.fillRect(0, 0, PX_W, PX_H);

      // Draw critter moving across
      const critterX = startX + (endX - startX) * p;
      // Bouncing motion
      const bounce = Math.abs(Math.sin(p * Math.PI * 6)) * 5;

      if (variant === 'cat') {
        drawCat(c, critterX, critterY - bounce, facingLeft);
      } else if (variant === 'rat') {
        drawRat(c, critterX, critterY - bounce, facingLeft);
      } else if (variant === 'bird') {
        drawBird(c, critterX, critterY - bounce - 40);
      }
    });

    // Quick fade out
    await animate(ctx, 300, (c, p) => {
      c.clearRect(0, 0, PX_W, PX_H);
      const alpha = 0.15 * (1 - p);
      c.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      c.fillRect(0, 0, PX_W, PX_H);
    });
  }

  cleanup();
}

/**
 * ZOMBIE RISE
 * A zombie figure rises from the bottom of the screen over 2 seconds,
 * fills the view, holds briefly, then fades.
 * Total duration: ~3.5s
 */
export async function zombieRise() {
  const { ctx, cleanup } = createOverlay();

  // Phase 1: Zombie rises from bottom (2 seconds)
  await animate(ctx, 2000, (c, p) => {
    // Ease-in curve: slow start, accelerates
    const eased = p * p;
    drawZombieBody(c, eased, 1);
  });

  // Phase 2: Hold with face filling screen (600ms)
  // Transition from body to close-up face
  await animate(ctx, 600, (c, p) => {
    // Cross-fade from body to face
    if (p < 0.5) {
      drawZombieBody(c, 1, 1);
    } else {
      drawZombieFace(c, 0, (p - 0.5) * 2);
    }
  });

  // Shake while face is shown
  const shakePromise = shakeScreen(8, 400);

  // Hold
  await wait(400);
  await shakePromise;

  // Phase 3: Fade out (500ms)
  await animate(ctx, 500, (c, p) => {
    drawZombieFace(c, 0, 1 - p);
  });

  cleanup();
}

/**
 * SHADOW APPROACH
 * A dark silhouette figure walks toward the camera from the distance.
 * The figure grows larger as it approaches. Tension effect.
 * Total duration: ~3s
 */
export async function shadowApproach() {
  const { ctx, cleanup } = createOverlay();

  await animate(ctx, 3000, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);

    // Darkening background
    c.fillStyle = `rgba(0, 0, 0, ${0.1 + p * 0.5})`;
    c.fillRect(0, 0, PX_W, PX_H);

    // Shadow figure - starts small in center, grows to fill screen
    // Eased scaling: slow approach then rushes at end
    const eased = p < 0.7 ? (p / 0.7) * 0.4 : 0.4 + ((p - 0.7) / 0.3) * 0.6;
    const scale = 0.05 + eased * 0.95;

    const figW = PX_W * 0.3 * scale;
    const figH = PX_H * 0.8 * scale;
    const figX = PX_W / 2 - figW / 2;
    const figY = PX_H - figH;

    // The figure is pure black silhouette with slight transparency
    c.fillStyle = `rgba(5, 5, 5, ${0.7 + p * 0.3})`;

    // Head (circle-ish)
    const headR = figW * 0.25;
    const headX = figX + figW / 2;
    const headY = figY + headR;
    c.beginPath();
    c.arc(headX, headY, headR, 0, Math.PI * 2);
    c.fill();

    // Body (trapezoid - wider at bottom)
    c.beginPath();
    c.moveTo(figX + figW * 0.3, figY + headR * 1.8);
    c.lineTo(figX + figW * 0.7, figY + headR * 1.8);
    c.lineTo(figX + figW, figY + figH);
    c.lineTo(figX, figY + figH);
    c.closePath();
    c.fill();

    // Eyes appear in last 30% of approach
    if (p > 0.7) {
      const eyeAlpha = (p - 0.7) / 0.3;
      c.fillStyle = `rgba(255, 20, 20, ${eyeAlpha})`;
      const eyeSize = headR * 0.2;
      c.fillRect(headX - headR * 0.35, headY - headR * 0.1, eyeSize, eyeSize);
      c.fillRect(headX + headR * 0.15, headY - headR * 0.1, eyeSize, eyeSize);
    }

    // Subtle fog at the bottom
    const fogGrad = c.createLinearGradient(0, PX_H * 0.7, 0, PX_H);
    fogGrad.addColorStop(0, 'rgba(40, 40, 50, 0)');
    fogGrad.addColorStop(1, `rgba(40, 40, 50, ${0.2 + p * 0.3})`);
    c.fillStyle = fogGrad;
    c.fillRect(0, PX_H * 0.7, PX_W, PX_H * 0.3);
  });

  // Quick shake at the end
  const shakePromise = shakeScreen(6, 200);
  await wait(200);
  await shakePromise;

  // Fade out
  await animate(ctx, 400, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);
    c.fillStyle = `rgba(0, 0, 0, ${0.6 * (1 - p)})`;
    c.fillRect(0, 0, PX_W, PX_H);
  });

  cleanup();
}

/**
 * LIGHTS OUT
 * Screen goes completely black. After a beat, pairs of red eyes
 * appear in the darkness. Then lights flicker back on.
 * Total duration: ~4s
 */
export async function lightsOut() {
  const { ctx, cleanup } = createOverlay();

  // Phase 1: Lights go out (300ms quick blackout)
  await animate(ctx, 300, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);
    c.fillStyle = `rgba(0, 0, 0, ${p})`;
    c.fillRect(0, 0, PX_W, PX_H);
  });

  // Phase 2: Total darkness with eyes appearing (2 seconds)
  // Pre-generate eye positions
  const eyePairs = [];
  for (let i = 0; i < 6; i++) {
    eyePairs.push({
      x: 30 + Math.random() * (PX_W - 60),
      y: 20 + Math.random() * (PX_H - 40),
      size: 2 + Math.random() * 3,
      spacing: 6 + Math.random() * 8,
      appearAt: 0.1 + Math.random() * 0.5, // When they appear (0-1 of this phase)
      blinkPhase: Math.random() * Math.PI * 2,
    });
  }

  await animate(ctx, 2000, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);

    // Full black background
    c.fillStyle = '#000000';
    c.fillRect(0, 0, PX_W, PX_H);

    // Draw eye pairs that have appeared
    for (const eyes of eyePairs) {
      if (p >= eyes.appearAt) {
        const fadeIn = Math.min((p - eyes.appearAt) / 0.15, 1);
        // Occasional blink
        const blink = Math.sin(p * 8 + eyes.blinkPhase);
        if (blink < -0.85) continue; // Blinking shut

        const alpha = fadeIn * (0.6 + 0.4 * Math.abs(Math.sin(p * 3 + eyes.blinkPhase)));
        c.fillStyle = `rgba(255, 15, 15, ${alpha})`;
        // Left eye
        c.fillRect(
          Math.floor(eyes.x - eyes.spacing / 2),
          Math.floor(eyes.y),
          Math.floor(eyes.size),
          Math.floor(eyes.size)
        );
        // Right eye
        c.fillRect(
          Math.floor(eyes.x + eyes.spacing / 2),
          Math.floor(eyes.y),
          Math.floor(eyes.size),
          Math.floor(eyes.size)
        );
      }
    }
  });

  // Phase 3: Lights flicker back on (1.5 seconds)
  await animate(ctx, 1500, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);

    // Flickering: alternates between black and mostly clear
    const flickerRate = 15;
    const flicker = Math.sin(p * flickerRate * Math.PI);
    let blackness;

    if (p < 0.3) {
      // Still mostly dark with brief flashes of light
      blackness = flicker > 0.7 ? 0.3 : 0.95;
    } else if (p < 0.6) {
      // More frequent light
      blackness = flicker > 0.3 ? 0.2 : 0.8;
    } else {
      // Stabilizing
      blackness = (1 - p) * 0.8;
    }

    c.fillStyle = `rgba(0, 0, 0, ${blackness})`;
    c.fillRect(0, 0, PX_W, PX_H);

    // Eyes fade as lights return
    if (blackness > 0.5) {
      for (const eyes of eyePairs) {
        const alpha = blackness * 0.5;
        c.fillStyle = `rgba(255, 15, 15, ${alpha})`;
        c.fillRect(
          Math.floor(eyes.x - eyes.spacing / 2),
          Math.floor(eyes.y),
          Math.floor(eyes.size),
          Math.floor(eyes.size)
        );
        c.fillRect(
          Math.floor(eyes.x + eyes.spacing / 2),
          Math.floor(eyes.y),
          Math.floor(eyes.size),
          Math.floor(eyes.size)
        );
      }
    }
  });

  cleanup();
}

/**
 * DOOR OPENS
 * A pixel art door in the center of screen slowly creaks open,
 * revealing darkness (and maybe eyes) behind it.
 * Total duration: ~3s
 */
export async function doorOpens() {
  const { ctx, cleanup } = createOverlay();

  await animate(ctx, 3000, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);

    // Dark background
    c.fillStyle = `rgba(0, 0, 0, ${0.7 + p * 0.2})`;
    c.fillRect(0, 0, PX_W, PX_H);

    const B = 4;
    // Door frame (centered)
    const frameW = 20 * B;
    const frameH = 30 * B;
    const frameX = (PX_W - frameW) / 2;
    const frameY = (PX_H - frameH) / 2;

    // Wall around the door
    const wallColor = '#4a4040';
    const wallDark = '#3a3030';
    // Draw wall bricks pattern
    for (let wy = 0; wy < PX_H; wy += B * 2) {
      for (let wx = 0; wx < PX_W; wx += B * 4) {
        const offset = (Math.floor(wy / (B * 2)) % 2) * B * 2;
        c.fillStyle = (wx + wy) % (B * 8) < B * 4 ? wallColor : wallDark;
        c.fillRect(wx + offset, wy, B * 4 - 1, B * 2 - 1);
      }
    }

    // Door frame (wood)
    const woodFrame = '#5a3a20';
    px(c, frameX - B, frameY - B, frameW + B * 2, B, woodFrame);
    px(c, frameX - B, frameY, B, frameH, woodFrame);
    px(c, frameX + frameW, frameY, B, frameH, woodFrame);

    // Darkness behind door
    c.fillStyle = '#050505';
    c.fillRect(frameX, frameY, frameW, frameH);

    // Red eyes in the darkness (appear after door is half open)
    if (p > 0.5) {
      const eyeAlpha = (p - 0.5) * 2;
      c.fillStyle = `rgba(255, 15, 15, ${eyeAlpha * 0.7})`;
      const eyeY = frameY + frameH * 0.35;
      const eyeCenterX = frameX + frameW * 0.4;
      c.fillRect(eyeCenterX - 5, eyeY, 3, 3);
      c.fillRect(eyeCenterX + 5, eyeY, 3, 3);
    }

    // The door itself (swings open via perspective distortion)
    // Ease the opening: slow start, acceleration
    const openEased = p < 0.3 ? (p / 0.3) * 0.15 : 0.15 + ((p - 0.3) / 0.7) * 0.85;
    const doorOpenAmount = openEased; // 0 = closed, 1 = fully open

    if (doorOpenAmount < 0.95) {
      const doorColor = '#6a4a2a';
      const doorDark = '#5a3a1a';
      const doorKnob = '#c0a040';

      // Door narrows as it opens (perspective)
      const doorVisibleW = frameW * (1 - doorOpenAmount);
      const doorX = frameX + frameW - doorVisibleW; // Hinged on right side

      // Skew effect: top is narrower as door opens
      const skewTop = doorOpenAmount * frameW * 0.3;

      c.fillStyle = doorColor;
      c.beginPath();
      c.moveTo(doorX + skewTop, frameY);
      c.lineTo(doorX + doorVisibleW, frameY);
      c.lineTo(doorX + doorVisibleW, frameY + frameH);
      c.lineTo(doorX, frameY + frameH);
      c.closePath();
      c.fill();

      // Door panels (decorative rectangles)
      if (doorVisibleW > 10) {
        c.fillStyle = doorDark;
        const panelInset = doorVisibleW * 0.15;
        const panelW = doorVisibleW * 0.7;
        const panelSkew = skewTop * 0.15;
        // Upper panel
        c.fillRect(
          doorX + panelInset + panelSkew,
          frameY + frameH * 0.1,
          Math.max(panelW - panelSkew, 0),
          frameH * 0.3
        );
        // Lower panel
        c.fillRect(
          doorX + panelInset,
          frameY + frameH * 0.5,
          panelW,
          frameH * 0.35
        );
      }

      // Door knob
      if (doorVisibleW > 15) {
        c.fillStyle = doorKnob;
        c.beginPath();
        c.arc(
          doorX + doorVisibleW * 0.15,
          frameY + frameH * 0.48,
          B,
          0, Math.PI * 2
        );
        c.fill();
      }

      // Shadow on the door (light from the opening)
      const shadowGrad = c.createLinearGradient(doorX, 0, doorX + doorVisibleW, 0);
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = shadowGrad;
      c.fillRect(doorX, frameY, doorVisibleW, frameH);
    }

    // Light spill from doorway (subtle on floor)
    if (p > 0.2) {
      const spillAlpha = Math.min((p - 0.2) * 0.3, 0.15);
      const spillGrad = c.createLinearGradient(
        frameX + frameW / 2, frameY + frameH,
        frameX + frameW / 2, PX_H
      );
      spillGrad.addColorStop(0, `rgba(20, 15, 10, ${spillAlpha})`);
      spillGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      c.fillStyle = spillGrad;
      c.beginPath();
      c.moveTo(frameX, frameY + frameH);
      c.lineTo(frameX + frameW, frameY + frameH);
      c.lineTo(frameX + frameW + p * 40, PX_H);
      c.lineTo(frameX - p * 40, PX_H);
      c.closePath();
      c.fill();
    }
  });

  // Brief hold then fade
  await wait(300);
  await animate(ctx, 400, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);
    c.fillStyle = `rgba(0, 0, 0, ${0.9 * (1 - p)})`;
    c.fillRect(0, 0, PX_W, PX_H);
  });

  cleanup();
}

/**
 * WINDOW SHATTER
 * A window with faint light shatters inward. Glass shards fly toward camera.
 * Total duration: ~2s
 */
export async function windowShatter() {
  const { ctx, cleanup } = createOverlay();

  // Pre-generate glass shards
  const shards = [];
  for (let i = 0; i < 40; i++) {
    // Shards originate from window center area
    const originX = PX_W / 2 + (Math.random() - 0.5) * 60;
    const originY = PX_H / 2 + (Math.random() - 0.5) * 40;
    shards.push({
      ox: originX,
      oy: originY,
      // Velocity: outward from center
      vx: (originX - PX_W / 2) * 0.15 + (Math.random() - 0.5) * 4,
      vy: (originY - PX_H / 2) * 0.12 + Math.random() * 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      size: 3 + Math.random() * 8,
      // Glass colors: light blue, white, transparent
      color: Math.random() < 0.5
        ? `rgba(180, 210, 240, ${0.4 + Math.random() * 0.4})`
        : `rgba(240, 245, 255, ${0.3 + Math.random() * 0.4})`,
    });
  }

  // Phase 1: Window with faint light (500ms)
  await animate(ctx, 500, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);

    // Dark room
    c.fillStyle = `rgba(0, 0, 0, ${0.6 + p * 0.15})`;
    c.fillRect(0, 0, PX_W, PX_H);

    // Window frame
    const winW = 80;
    const winH = 60;
    const winX = (PX_W - winW) / 2;
    const winY = (PX_H - winH) / 2 - 10;
    const frameColor = '#4a3a2a';

    // Window light (moonlight)
    c.fillStyle = `rgba(100, 120, 160, ${0.15 + p * 0.1})`;
    c.fillRect(winX, winY, winW, winH);

    // Cross frame
    c.fillStyle = frameColor;
    c.fillRect(winX - 3, winY - 3, winW + 6, 3); // top
    c.fillRect(winX - 3, winY + winH, winW + 6, 3); // bottom
    c.fillRect(winX - 3, winY, 3, winH); // left
    c.fillRect(winX + winW, winY, 3, winH); // right
    c.fillRect(winX + winW / 2 - 1, winY, 3, winH); // center vertical
    c.fillRect(winX, winY + winH / 2 - 1, winW, 3); // center horizontal

    // Something moving outside (shadow passing)
    if (p > 0.5) {
      const shadowX = winX + winW * ((p - 0.5) * 2);
      c.fillStyle = 'rgba(0, 0, 0, 0.5)';
      c.fillRect(shadowX - 10, winY, 20, winH);
    }
  });

  // Phase 2: SHATTER (instant flash + shards flying, 1.2s)
  const shakePromise = shakeScreen(10, 500);

  await animate(ctx, 1200, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);

    // Brief white flash at start
    if (p < 0.05) {
      c.fillStyle = `rgba(255, 255, 255, ${0.6 * (1 - p / 0.05)})`;
      c.fillRect(0, 0, PX_W, PX_H);
    }

    // Dark background
    c.fillStyle = `rgba(0, 0, 0, ${0.7})`;
    c.fillRect(0, 0, PX_W, PX_H);

    // Broken window frame (still visible)
    const winW = 80;
    const winH = 60;
    const winX = (PX_W - winW) / 2;
    const winY = (PX_H - winH) / 2 - 10;

    // Empty window (dark outside with slight blue)
    c.fillStyle = 'rgba(20, 25, 40, 0.8)';
    c.fillRect(winX, winY, winW, winH);

    // Broken frame pieces
    c.fillStyle = '#4a3a2a';
    c.fillRect(winX - 3, winY - 3, winW + 6, 3);
    c.fillRect(winX - 3, winY + winH, winW + 6, 3);
    c.fillRect(winX - 3, winY, 3, winH);
    c.fillRect(winX + winW, winY, 3, winH);
    // Broken cross pieces (jagged)
    c.fillRect(winX + winW / 2 - 1, winY, 3, winH * 0.3);
    c.fillRect(winX + winW / 2 + 2, winY + winH * 0.6, 3, winH * 0.4);

    // Flying glass shards
    const gravity = 2;
    for (const shard of shards) {
      const t = p * 1.5; // Shards move fast
      const sx = shard.ox + shard.vx * t * 60;
      const sy = shard.oy + shard.vy * t * 60 + gravity * t * t * 200;
      const rot = shard.rotation + shard.rotSpeed * t * 60;
      const fadeOut = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;

      if (fadeOut <= 0) continue;

      c.save();
      c.translate(sx, sy);
      c.rotate(rot);
      c.globalAlpha = fadeOut;
      c.fillStyle = shard.color;
      // Triangular shard
      c.beginPath();
      c.moveTo(0, -shard.size / 2);
      c.lineTo(shard.size / 3, shard.size / 2);
      c.lineTo(-shard.size / 3, shard.size / 2);
      c.closePath();
      c.fill();
      // Highlight edge
      c.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      c.lineWidth = 0.5;
      c.stroke();
      c.restore();
    }
    c.globalAlpha = 1;
  });

  await shakePromise;

  // Fade out
  await animate(ctx, 300, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);
    c.fillStyle = `rgba(0, 0, 0, ${0.7 * (1 - p)})`;
    c.fillRect(0, 0, PX_W, PX_H);
  });

  cleanup();
}

/**
 * BLOOD DRIP
 * Blood runs down the screen from the top in multiple streaks.
 * Total duration: ~3s
 */
export async function bloodDrip() {
  const { ctx, cleanup } = createOverlay();

  // Pre-generate blood drip paths
  const drips = [];
  for (let i = 0; i < 8; i++) {
    const x = 20 + Math.random() * (PX_W - 40);
    const width = 3 + Math.random() * 5;
    const speed = 0.3 + Math.random() * 0.5; // How far down it reaches (0-1) by end
    const startDelay = Math.random() * 0.3; // Staggered start
    const wobble = Math.random() * 2 - 1; // Side-to-side tendency
    drips.push({ x, width, speed, startDelay, wobble });
  }

  await animate(ctx, 3000, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);

    // Slight red tint on entire screen
    c.fillStyle = `rgba(80, 0, 0, ${Math.min(p * 0.15, 0.08)})`;
    c.fillRect(0, 0, PX_W, PX_H);

    for (const drip of drips) {
      const dripProgress = Math.max(0, (p - drip.startDelay) / (1 - drip.startDelay));
      if (dripProgress <= 0) continue;

      const reachY = PX_H * drip.speed * dripProgress;

      // Main blood streak
      const bloodGrad = c.createLinearGradient(0, 0, 0, reachY);
      bloodGrad.addColorStop(0, 'rgba(120, 10, 10, 0.85)');
      bloodGrad.addColorStop(0.6, 'rgba(100, 5, 5, 0.75)');
      bloodGrad.addColorStop(0.9, 'rgba(80, 0, 0, 0.6)');
      bloodGrad.addColorStop(1, 'rgba(60, 0, 0, 0.3)');

      c.fillStyle = bloodGrad;

      // Draw drip as a path with slight wobble
      c.beginPath();
      c.moveTo(drip.x - drip.width / 2, 0);
      c.lineTo(drip.x + drip.width / 2, 0);

      // Wobble down
      const segments = 10;
      for (let s = 1; s <= segments; s++) {
        const sy = reachY * (s / segments);
        const sx = drip.x + Math.sin(s * 0.8 + drip.wobble) * 2;
        const sw = drip.width / 2 * (1 - s / segments * 0.3); // Narrows
        c.lineTo(sx + sw, sy);
      }
      // Come back up on the other side
      for (let s = segments; s >= 1; s--) {
        const sy = reachY * (s / segments);
        const sx = drip.x + Math.sin(s * 0.8 + drip.wobble) * 2;
        const sw = drip.width / 2 * (1 - s / segments * 0.3);
        c.lineTo(sx - sw, sy);
      }
      c.closePath();
      c.fill();

      // Drip bulge at the bottom (teardrop)
      if (dripProgress > 0.1) {
        const bulgeSize = drip.width * 0.7;
        const bulgeX = drip.x + Math.sin(reachY * 0.1 + drip.wobble) * 2;
        c.fillStyle = 'rgba(110, 8, 8, 0.8)';
        c.beginPath();
        c.arc(bulgeX, reachY, bulgeSize, 0, Math.PI * 2);
        c.fill();
      }
    }

    // Pooling at top edge (where blood originates)
    c.fillStyle = 'rgba(100, 5, 5, 0.7)';
    c.fillRect(0, 0, PX_W, 2);
    c.fillStyle = 'rgba(80, 0, 0, 0.4)';
    c.fillRect(0, 2, PX_W, 2);

    // Fade out in last 20%
    if (p > 0.8) {
      const fadeAlpha = (p - 0.8) / 0.2;
      c.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
      c.fillRect(0, 0, PX_W, PX_H);
    }
  });

  // Clear
  await animate(ctx, 200, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);
  });

  cleanup();
}

/**
 * TEXT FLASH
 * A word or phrase flashes on screen in large pixel text.
 * Appears with a flash, holds, then fades with screen shake.
 * Examples: "RUN", "BEHIND YOU", "THEY'RE HERE"
 * Total duration: ~1.5s
 */
export async function textFlash(text = 'RUN', color = '#ff1a1a') {
  const { ctx, cleanup } = createOverlay();

  // Phase 1: White flash (100ms)
  await animate(ctx, 100, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);
    c.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - p)})`;
    c.fillRect(0, 0, PX_W, PX_H);
  });

  // Phase 2: Text holds with slight shake (800ms)
  const shakePromise = shakeScreen(4, 800);

  await animate(ctx, 800, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);

    // Dark background with red tint
    c.fillStyle = `rgba(15, 0, 0, ${0.75})`;
    c.fillRect(0, 0, PX_W, PX_H);

    // Chromatic aberration effect: text drawn 3 times offset
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    // Calculate font size to fit width
    const maxWidth = PX_W * 0.85;
    let fontSize = 48;
    c.font = `bold ${fontSize}px monospace`;
    while (c.measureText(text).width > maxWidth && fontSize > 12) {
      fontSize -= 2;
      c.font = `bold ${fontSize}px monospace`;
    }

    const centerX = PX_W / 2;
    const centerY = PX_H / 2;

    // Jitter offset
    const jx = (Math.random() - 0.5) * 2;
    const jy = (Math.random() - 0.5) * 2;

    // Blue channel offset (left and up)
    c.fillStyle = `rgba(0, 50, 255, 0.4)`;
    c.fillText(text, centerX - 2 + jx, centerY - 1 + jy);

    // Green channel offset (right)
    c.fillStyle = `rgba(0, 255, 50, 0.3)`;
    c.fillText(text, centerX + 2 + jx, centerY + jy);

    // Main text in specified color
    c.fillStyle = color;
    c.fillText(text, centerX + jx, centerY + jy);

    // Scanline effect
    c.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < PX_H; y += 3) {
      c.fillRect(0, y, PX_W, 1);
    }

    // Occasional glitch bars
    if (Math.random() < 0.15) {
      const barY = Math.random() * PX_H;
      const barH = 2 + Math.random() * 4;
      c.fillStyle = `rgba(${Math.random() * 100}, 0, 0, 0.3)`;
      c.fillRect(0, barY, PX_W, barH);
    }
  });

  await shakePromise;

  // Phase 3: Fade out (600ms)
  await animate(ctx, 600, (c, p) => {
    c.clearRect(0, 0, PX_W, PX_H);

    const alpha = 1 - p;
    c.fillStyle = `rgba(15, 0, 0, ${0.75 * alpha})`;
    c.fillRect(0, 0, PX_W, PX_H);

    // Text fades
    const fontSize = 48;
    c.font = `bold ${fontSize}px monospace`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.fillText(text, PX_W / 2, PX_H / 2);
    c.globalAlpha = 1;
  });

  cleanup();
}

/**
 * SCREEN STATIC
 * TV static / AI interference effect. The screen fills with noise,
 * occasionally flashing distorted fragments of the underlying view.
 * Total duration: configurable (default 1500ms)
 */
export async function screenStatic(duration = 1500) {
  const { canvas, ctx, cleanup } = createOverlay();

  // Make overlay block interaction during static
  canvas.style.pointerEvents = 'all';

  // Pre-create a noise buffer for performance
  const noiseW = 80;
  const noiseH = 45;
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = noiseW;
  noiseCanvas.height = noiseH;
  const noiseCtx = noiseCanvas.getContext('2d');

  await animate(ctx, duration, (c, p) => {
    // Generate noise frame
    const imgData = noiseCtx.createImageData(noiseW, noiseH);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;       // R
      data[i + 1] = v;   // G
      data[i + 2] = v;   // B
      data[i + 3] = 200; // A
    }

    // Occasional color tint bands
    if (Math.random() < 0.3) {
      const bandY = Math.floor(Math.random() * noiseH);
      const bandH = 1 + Math.floor(Math.random() * 3);
      for (let y = bandY; y < Math.min(bandY + bandH, noiseH); y++) {
        for (let x = 0; x < noiseW; x++) {
          const idx = (y * noiseW + x) * 4;
          data[idx] = Math.min(255, data[idx] + 80);     // Red tint
          data[idx + 1] = Math.max(0, data[idx + 1] - 40); // Less green
          data[idx + 2] = Math.max(0, data[idx + 2] - 40); // Less blue
        }
      }
    }

    noiseCtx.putImageData(imgData, 0, 0);

    // Draw noise scaled up to fill canvas (pixelated)
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, PX_W, PX_H);

    // Intensity varies: builds up, peaks, fades out
    let intensity;
    if (p < 0.1) {
      intensity = p / 0.1;
    } else if (p > 0.85) {
      intensity = (1 - p) / 0.15;
    } else {
      intensity = 0.8 + Math.random() * 0.2;
    }

    c.globalAlpha = intensity * 0.7;
    c.drawImage(noiseCanvas, 0, 0, noiseW, noiseH, 0, 0, PX_W, PX_H);
    c.globalAlpha = 1;

    // Horizontal tear / offset lines
    if (Math.random() < 0.4) {
      const tearY = Math.random() * PX_H;
      const tearH = 2 + Math.random() * 8;
      const tearOffset = (Math.random() - 0.5) * 20;
      c.drawImage(
        noiseCanvas,
        0, tearY / PX_H * noiseH, noiseW, tearH / PX_H * noiseH,
        tearOffset, tearY, PX_W, tearH
      );
    }

    // Occasional black bars (signal loss)
    if (Math.random() < 0.1) {
      c.fillStyle = '#000';
      c.fillRect(0, Math.random() * PX_H, PX_W, 5 + Math.random() * 15);
    }

    // AI text fragments that glitch through
    if (Math.random() < 0.08) {
      const fragments = [
        'SIGNAL LOST', 'ERR_0x4F2A', 'NO CARRIER',
        '///BREACH///', 'THEY KNOW', 'CORRUPTED',
        '01101000', 'OVERRIDE', 'DISCONNECT',
      ];
      const frag = fragments[Math.floor(Math.random() * fragments.length)];
      c.font = 'bold 10px monospace';
      c.fillStyle = `rgba(0, 255, 0, ${0.3 + Math.random() * 0.4})`;
      c.fillText(frag, Math.random() * PX_W, Math.random() * PX_H);
    }

    // Scanlines
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let y = 0; y < PX_H; y += 3) {
      c.fillRect(0, y, PX_W, 1);
    }
  });

  canvas.style.pointerEvents = 'none';
  cleanup();
}

// ============================================================
// EVENT INTEGRATION: Trigger visuals from event data
// ============================================================

/**
 * Map of visual effect names (used in event data) to their functions.
 * In event JSON, use: visual: 'zombie_jumpscare'
 */
const VISUAL_EFFECTS = {
  zombie_jumpscare: zombieJumpScare,
  fake_jumpscare_cat: () => fakeJumpScare('cat'),
  fake_jumpscare_rat: () => fakeJumpScare('rat'),
  fake_jumpscare_bird: () => fakeJumpScare('bird'),
  fake_jumpscare_nothing: () => fakeJumpScare('nothing'),
  zombie_rise: zombieRise,
  shadow_approach: shadowApproach,
  lights_out: lightsOut,
  door_opens: doorOpens,
  window_shatter: windowShatter,
  blood_drip: bloodDrip,
  text_flash_run: () => textFlash('RUN', '#ff1a1a'),
  text_flash_behind_you: () => textFlash('BEHIND YOU', '#ff3333'),
  text_flash_theyre_here: () => textFlash("THEY'RE HERE", '#cc1111'),
  text_flash_dont_look: () => textFlash("DON'T LOOK", '#ff2222'),
  text_flash_get_out: () => textFlash('GET OUT', '#ee0000'),
  screen_static: () => screenStatic(1500),
  screen_static_short: () => screenStatic(800),
  screen_static_long: () => screenStatic(3000),
};

/**
 * Trigger a visual effect by its event data key.
 * Returns a promise that resolves when the effect completes.
 * If the key is not recognized, resolves immediately.
 *
 * Usage in event data:
 *   { visual: 'zombie_jumpscare' }
 *   { visual: 'text_flash_run' }
 *   { visual: 'lights_out' }
 *
 * Usage from code:
 *   import { triggerVisual } from './jumpscares.js';
 *   await triggerVisual('zombie_jumpscare');
 */
export async function triggerVisual(key) {
  const effect = VISUAL_EFFECTS[key];
  if (effect) {
    await effect();
  } else {
    console.warn(`[jumpscares] Unknown visual effect key: "${key}"`);
  }
}

/**
 * Get all available visual effect keys (for tooling / dev use).
 */
export function getVisualEffectKeys() {
  return Object.keys(VISUAL_EFFECTS);
}
