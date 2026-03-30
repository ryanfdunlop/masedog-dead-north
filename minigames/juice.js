// ============================================================
// MASEDOG: Dead North — Game Juice System
// Makes mini-games feel POWERFUL. Hitstop, screen shake,
// particles, flash, slowmo, knockback — the Vlambeer secret.
// ============================================================

// ========== HITSTOP ==========
// Freeze the game for N frames on impact. Makes hits feel heavy.

let hitstopFrames = 0;

export function hitstop(frames = 4) {
  hitstopFrames = Math.max(hitstopFrames, frames);
}

export function isHitstopped() {
  return hitstopFrames > 0;
}

export function tickHitstop() {
  if (hitstopFrames > 0) hitstopFrames--;
}

// ========== SCREEN SHAKE ==========
// Directional shake that decays. Call before render to offset the canvas.

let shakeX = 0;
let shakeY = 0;
let shakeIntensity = 0;
let shakeDuration = 0;
let shakeTimer = 0;
let shakeDirX = 0;
let shakeDirY = 0;

export function shake(intensity = 5, duration = 0.3, dirX = 0, dirY = 0) {
  shakeIntensity = intensity;
  shakeDuration = duration;
  shakeTimer = 0;
  shakeDirX = dirX;
  shakeDirY = dirY;
}

export function updateShake(dt) {
  if (shakeDuration <= 0) { shakeX = 0; shakeY = 0; return; }
  shakeTimer += dt;
  if (shakeTimer >= shakeDuration) {
    shakeX = 0; shakeY = 0; shakeDuration = 0;
    return;
  }
  const decay = 1 - shakeTimer / shakeDuration;
  const i = shakeIntensity * decay;
  shakeX = (Math.random() - 0.5) * i * 2 + shakeDirX * i * 0.5;
  shakeY = (Math.random() - 0.5) * i * 2 + shakeDirY * i * 0.5;
}

export function getShakeOffset() {
  return { x: Math.round(shakeX), y: Math.round(shakeY) };
}

// ========== PARTICLES ==========
// Object-pooled particle system. Blood, sparks, debris, shells.

const MAX_PARTICLES = 200;
const particles = [];
for (let i = 0; i < MAX_PARTICLES; i++) {
  particles.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 2, color: '#f00', gravity: 0, friction: 1 });
}

export function spawnParticles(x, y, count, options = {}) {
  const { color = '#cc3333', speed = 80, spread = Math.PI * 2, angle = 0, size = 2, life = 0.5, gravity = 200, friction = 0.98 } = options;

  for (let i = 0; i < count; i++) {
    const p = particles.find(p => !p.active);
    if (!p) break;

    const a = angle + (Math.random() - 0.5) * spread;
    const s = speed * (0.5 + Math.random() * 0.5);

    p.active = true;
    p.x = x + (Math.random() - 0.5) * 4;
    p.y = y + (Math.random() - 0.5) * 4;
    p.vx = Math.cos(a) * s;
    p.vy = Math.sin(a) * s;
    p.life = life * (0.7 + Math.random() * 0.6);
    p.maxLife = p.life;
    p.size = size * (0.5 + Math.random());
    p.color = color;
    p.gravity = gravity;
    p.friction = friction;
  }
}

export function updateParticles(dt) {
  for (const p of particles) {
    if (!p.active) continue;
    p.life -= dt;
    if (p.life <= 0) { p.active = false; continue; }
    p.vy += p.gravity * dt;
    p.vx *= p.friction;
    p.vy *= p.friction;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

export function renderParticles(ctx) {
  for (const p of particles) {
    if (!p.active) continue;
    const alpha = Math.min(1, p.life / p.maxLife * 2);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.size), Math.ceil(p.size));
  }
  ctx.globalAlpha = 1;
}

// ========== PRESET PARTICLE EFFECTS ==========

export function bloodSplatter(x, y, dirX = 0, dirY = -1) {
  const angle = Math.atan2(dirY, dirX);
  spawnParticles(x, y, 12, { color: '#aa2222', speed: 60, spread: 1.2, angle, size: 2, life: 0.6, gravity: 150 });
  spawnParticles(x, y, 6, { color: '#cc3333', speed: 40, spread: 2, angle, size: 3, life: 0.4, gravity: 100 });
}

export function sparks(x, y) {
  spawnParticles(x, y, 8, { color: '#ffcc44', speed: 100, spread: Math.PI * 2, size: 1.5, life: 0.3, gravity: 50, friction: 0.95 });
  spawnParticles(x, y, 4, { color: '#ffffff', speed: 60, spread: Math.PI * 2, size: 1, life: 0.2, gravity: 0 });
}

export function shellCasing(x, y, dirX = 1) {
  spawnParticles(x, y, 1, { color: '#ccaa44', speed: 30, spread: 0.3, angle: dirX > 0 ? -1 : Math.PI + 1, size: 2, life: 1.5, gravity: 300, friction: 0.99 });
}

export function dustCloud(x, y) {
  spawnParticles(x, y, 6, { color: '#887766', speed: 20, spread: Math.PI * 2, size: 3, life: 0.6, gravity: -10, friction: 0.9 });
}

export function muzzleFlash(x, y, dirX = 1) {
  const angle = dirX > 0 ? 0 : Math.PI;
  spawnParticles(x, y, 5, { color: '#ffee88', speed: 80, spread: 0.5, angle, size: 2, life: 0.1, gravity: 0, friction: 0.8 });
  spawnParticles(x, y, 3, { color: '#ffffff', speed: 40, spread: 0.3, angle, size: 3, life: 0.08, gravity: 0 });
}

export function explosion(x, y) {
  spawnParticles(x, y, 20, { color: '#ff6622', speed: 100, spread: Math.PI * 2, size: 3, life: 0.5, gravity: 50 });
  spawnParticles(x, y, 15, { color: '#ffcc44', speed: 80, spread: Math.PI * 2, size: 2, life: 0.3, gravity: 0 });
  spawnParticles(x, y, 10, { color: '#333333', speed: 50, spread: Math.PI * 2, size: 4, life: 0.8, gravity: -20, friction: 0.95 });
  shake(8, 0.4);
  hitstop(6);
}

export function zombieDeath(x, y) {
  bloodSplatter(x, y, 0, -1);
  spawnParticles(x, y, 4, { color: '#445544', speed: 30, spread: Math.PI * 2, size: 2, life: 0.8, gravity: 200 });
  shake(3, 0.15);
  hitstop(3);
}

export function playerHit(x, y) {
  bloodSplatter(x, y, 0, -0.5);
  shake(4, 0.2);
  hitstop(4);
}

export function gunFire(x, y, dirX = 1) {
  muzzleFlash(x + dirX * 8, y, dirX);
  shellCasing(x, y + 2, -dirX);
  shake(2, 0.1, -dirX, 0);
}

export function lootPickup(x, y) {
  spawnParticles(x, y, 8, { color: '#44aaff', speed: 40, spread: Math.PI * 2, size: 2, life: 0.4, gravity: -30 });
  spawnParticles(x, y, 4, { color: '#ffffff', speed: 30, spread: Math.PI * 2, size: 1.5, life: 0.3, gravity: -20 });
}

// ========== FLASH ON HIT ==========
// White flash overlay for N frames when damaged.

let flashTimer = 0;
let flashColor = '#ffffff';

export function flash(color = '#ffffff', duration = 0.08) {
  flashColor = color;
  flashTimer = duration;
}

export function updateFlash(dt) {
  if (flashTimer > 0) flashTimer -= dt;
}

export function renderFlash(ctx, w, h) {
  if (flashTimer > 0) {
    ctx.fillStyle = flashColor;
    ctx.globalAlpha = Math.min(0.6, flashTimer * 8);
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }
}

// ========== SLOWMO ==========
// Brief time slowdown on kills. Returns time scale (0-1).

let slowmoTimer = 0;
let slowmoScale = 1;

export function slowmo(duration = 0.08, scale = 0.3) {
  slowmoTimer = duration;
  slowmoScale = scale;
}

export function getTimeScale() {
  if (slowmoTimer > 0) return slowmoScale;
  return 1;
}

export function updateSlowmo(dt) {
  if (slowmoTimer > 0) slowmoTimer -= dt;
}

// ========== FLOATING TEXT ==========
// Damage numbers, +LOOT, etc.

const floatingTexts = [];

export function floatingText(x, y, text, color = '#ffffff', size = 8) {
  floatingTexts.push({ x, y, text, color, size, life: 1.0, vy: -30 });
}

export function updateFloatingTexts(dt) {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const t = floatingTexts[i];
    t.life -= dt;
    t.y += t.vy * dt;
    t.vy *= 0.95;
    if (t.life <= 0) floatingTexts.splice(i, 1);
  }
}

export function renderFloatingTexts(ctx) {
  for (const t of floatingTexts) {
    ctx.globalAlpha = Math.min(1, t.life * 2);
    ctx.fillStyle = t.color;
    ctx.font = `${t.size}px "Press Start 2P", monospace`;
    ctx.fillText(t.text, Math.round(t.x), Math.round(t.y));
  }
  ctx.globalAlpha = 1;
}

// ========== COMBO SYSTEM ==========
// Track kills for combo multiplier display.

let comboCount = 0;
let comboTimer = 0;

export function addCombo() {
  comboCount++;
  comboTimer = 3; // Reset decay timer
}

export function updateCombo(dt) {
  if (comboTimer > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) comboCount = 0;
  }
}

export function getCombo() {
  return comboCount;
}

export function renderCombo(ctx, x, y) {
  if (comboCount >= 2) {
    ctx.fillStyle = comboCount >= 5 ? '#ff4444' : comboCount >= 3 ? '#ffaa44' : '#ffff44';
    ctx.font = `${10 + comboCount}px "Press Start 2P", monospace`;
    ctx.globalAlpha = Math.min(1, comboTimer);
    ctx.fillText(`${comboCount}x COMBO!`, x, y);
    ctx.globalAlpha = 1;
  }
}

// ========== MASTER UPDATE ==========
// Call once per frame to update all juice systems.

export function updateJuice(dt) {
  tickHitstop();
  updateShake(dt);
  updateParticles(dt);
  updateFlash(dt);
  updateSlowmo(dt);
  updateFloatingTexts(dt);
  updateCombo(dt);
}

// ========== MASTER RENDER ==========
// Call after game render to draw all juice effects on top.

export function renderJuice(ctx, w, h) {
  renderParticles(ctx);
  renderFloatingTexts(ctx);
  renderFlash(ctx, w, h);
}

// ========== RESET ==========
export function resetJuice() {
  hitstopFrames = 0;
  shakeX = 0; shakeY = 0; shakeDuration = 0;
  for (const p of particles) p.active = false;
  flashTimer = 0;
  slowmoTimer = 0;
  floatingTexts.length = 0;
  comboCount = 0; comboTimer = 0;
}
