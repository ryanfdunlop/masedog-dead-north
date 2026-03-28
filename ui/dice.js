// ============================================================
// MASEDOG: Dead North — Visual Dice System
// Two realistic dice with click-to-roll tumbling animation.
// Replaces hidden d20 with visible 2d6 + skill bonus.
// ============================================================

let diceCanvas = null;
let diceCtx = null;
let diceContainer = null;
let rolling = false;
let rollCallback = null;

// Dice state
let die1 = { value: 1, angle: 0, targetAngle: 0, x: 0, y: 0, vx: 0, vy: 0 };
let die2 = { value: 1, angle: 0, targetAngle: 0, x: 0, y: 0, vx: 0, vy: 0 };
let rollPhase = 0; // 0 = waiting, 1 = spinning, 2 = settling, 3 = done
let rollTimer = 0;
let animFrameId = null;

// Visual constants
const DIE_SIZE = 56;
const DOT_RADIUS = 5;
const CANVAS_W = 320;
const CANVAS_H = 180;

// Roll tracking for multi-roll challenges
let rollResults = [];
let rollsNeeded = 1;
let currentRollIndex = 0;
let targetNumber = 7;
let skillBonus = 0;
let rollInfoText = '';

/**
 * Initialize the dice UI.
 */
export function initDice() {
  diceContainer = document.getElementById('dice-container');
  if (!diceContainer) {
    diceContainer = document.createElement('div');
    diceContainer.id = 'dice-container';
    diceContainer.className = 'dice-container';
    document.body.appendChild(diceContainer);
  }

  diceContainer.innerHTML = `
    <canvas id="dice-canvas" width="${CANVAS_W}" height="${CANVAS_H}"></canvas>
    <div id="dice-info" class="dice-info"></div>
    <div id="dice-result" class="dice-result-display"></div>
    <button id="dice-roll-btn" class="dice-roll-btn">ROLL THE DICE</button>
  `;

  diceCanvas = document.getElementById('dice-canvas');
  diceCtx = diceCanvas.getContext('2d');
  diceCtx.imageSmoothingEnabled = false;

  document.getElementById('dice-roll-btn').addEventListener('click', onRollClick);
  diceContainer.style.display = 'none';
}

/**
 * Show the dice for a skill check.
 * @param {Object} options
 *   - skill: skill name
 *   - bonus: skill bonus value
 *   - target: target number to beat
 *   - rolls: how many rolls needed (1-3)
 *   - label: display text (e.g., "ATHLETICS CHECK")
 * @returns {Promise<{success, total, rolls[]}>}
 */
export function rollDice(options) {
  return new Promise(resolve => {
    const { skill = '', bonus = 0, target = 7, rolls = 1, label = '' } = options;

    rollResults = [];
    rollsNeeded = rolls;
    currentRollIndex = 0;
    targetNumber = target;
    skillBonus = bonus;
    rollCallback = resolve;

    // Show dice UI
    diceContainer.style.display = 'flex';

    // Update info text
    rollInfoText = label || `${skill.toUpperCase()} CHECK`;
    const infoEl = document.getElementById('dice-info');
    infoEl.innerHTML = `
      <div class="dice-label">${rollInfoText}</div>
      <div class="dice-target">Need: ${target}+ ${rolls > 1 ? `(${rolls} rolls combined)` : ''}</div>
      <div class="dice-bonus">Skill bonus: +${bonus}</div>
      <div class="dice-rolls-left">Roll ${currentRollIndex + 1} of ${rollsNeeded}</div>
    `;

    document.getElementById('dice-result').textContent = '';
    document.getElementById('dice-roll-btn').textContent = 'ROLL THE DICE';
    document.getElementById('dice-roll-btn').style.display = 'block';

    // Position dice at rest
    die1.x = CANVAS_W / 2 - DIE_SIZE - 10;
    die1.y = CANVAS_H / 2 - DIE_SIZE / 2;
    die2.x = CANVAS_W / 2 + 10;
    die2.y = CANVAS_H / 2 - DIE_SIZE / 2;
    die1.value = 1;
    die2.value = 1;
    die1.angle = 0;
    die2.angle = 0;
    rollPhase = 0;

    // Start render loop
    if (animFrameId) cancelAnimationFrame(animFrameId);
    renderDice();
  });
}

function onRollClick() {
  if (rolling) return;
  rolling = true;
  rollPhase = 1;
  rollTimer = 0;

  // Randomize final values
  die1.value = Math.floor(Math.random() * 6) + 1;
  die2.value = Math.floor(Math.random() * 6) + 1;

  // Set spin parameters
  die1.vx = 3 + Math.random() * 4;
  die1.vy = -2 + Math.random() * 4;
  die2.vx = -3 - Math.random() * 4;
  die2.vy = -2 + Math.random() * 4;
  die1.targetAngle = die1.angle + (4 + Math.random() * 6) * Math.PI * 2;
  die2.targetAngle = die2.angle + (4 + Math.random() * 6) * Math.PI * 2;

  document.getElementById('dice-roll-btn').style.display = 'none';
}

function renderDice() {
  const ctx = diceCtx;
  const dt = 1 / 60;

  // Clear
  ctx.fillStyle = 'rgba(10, 10, 15, 0.95)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Felt background
  ctx.fillStyle = '#1a2a1a';
  ctx.beginPath();
  roundRect(ctx, 20, 20, CANVAS_W - 40, CANVAS_H - 40, 12);
  ctx.fill();
  ctx.strokeStyle = '#2a3a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  roundRect(ctx, 20, 20, CANVAS_W - 40, CANVAS_H - 40, 12);
  ctx.stroke();

  if (rollPhase === 1) {
    // Spinning
    rollTimer += dt;

    // Bounce dice around
    die1.x += die1.vx;
    die1.y += die1.vy;
    die2.x += die2.vx;
    die2.y += die2.vy;

    // Friction
    die1.vx *= 0.97;
    die1.vy *= 0.97;
    die2.vx *= 0.97;
    die2.vy *= 0.97;

    // Bounce off walls
    if (die1.x < 30 || die1.x > CANVAS_W - 30 - DIE_SIZE) die1.vx *= -0.8;
    if (die1.y < 30 || die1.y > CANVAS_H - 30 - DIE_SIZE) die1.vy *= -0.8;
    if (die2.x < 30 || die2.x > CANVAS_W - 30 - DIE_SIZE) die2.vx *= -0.8;
    if (die2.y < 30 || die2.y > CANVAS_H - 30 - DIE_SIZE) die2.vy *= -0.8;

    // Clamp positions
    die1.x = Math.max(30, Math.min(CANVAS_W - 30 - DIE_SIZE, die1.x));
    die1.y = Math.max(30, Math.min(CANVAS_H - 30 - DIE_SIZE, die1.y));
    die2.x = Math.max(30, Math.min(CANVAS_W - 30 - DIE_SIZE, die2.x));
    die2.y = Math.max(30, Math.min(CANVAS_H - 30 - DIE_SIZE, die2.y));

    // Spin angles
    const spinProgress = Math.min(1, rollTimer / 1.5);
    die1.angle = die1.targetAngle * easeOutCubic(spinProgress);
    die2.angle = die2.targetAngle * easeOutCubic(spinProgress);

    // Show random faces during spin
    if (spinProgress < 0.8) {
      die1._displayValue = Math.floor(Math.random() * 6) + 1;
      die2._displayValue = Math.floor(Math.random() * 6) + 1;
    } else {
      die1._displayValue = die1.value;
      die2._displayValue = die2.value;
    }

    if (rollTimer > 1.5) {
      rollPhase = 2;
      rollTimer = 0;
    }
  } else if (rollPhase === 2) {
    // Settling
    rollTimer += dt;
    die1._displayValue = die1.value;
    die2._displayValue = die2.value;

    if (rollTimer > 0.5) {
      rollPhase = 3;
      onRollComplete();
    }
  } else {
    die1._displayValue = die1.value;
    die2._displayValue = die2.value;
  }

  // Draw dice
  drawDie(ctx, die1.x, die1.y, die1._displayValue || die1.value, die1.angle, rollPhase === 1);
  drawDie(ctx, die2.x, die2.y, die2._displayValue || die2.value, die2.angle, rollPhase === 1);

  // Draw previous roll results
  if (rollResults.length > 0) {
    ctx.fillStyle = '#666';
    ctx.font = '10px "Press Start 2P", monospace';
    for (let i = 0; i < rollResults.length; i++) {
      ctx.fillText(`Roll ${i + 1}: ${rollResults[i]}`, 30, CANVAS_H - 15 - (rollResults.length - 1 - i) * 14);
    }
  }

  animFrameId = requestAnimationFrame(renderDice);
}

function onRollComplete() {
  rolling = false;
  const thisRoll = die1.value + die2.value;
  rollResults.push(thisRoll);
  currentRollIndex++;

  const totalSoFar = rollResults.reduce((a, b) => a + b, 0) + skillBonus;

  // Update display
  const resultEl = document.getElementById('dice-result');
  resultEl.innerHTML = `<span class="dice-roll-value">${die1.value} + ${die2.value} = ${thisRoll}</span>`;

  if (currentRollIndex < rollsNeeded) {
    // More rolls needed
    const infoEl = document.getElementById('dice-info');
    infoEl.innerHTML = `
      <div class="dice-label">${rollInfoText}</div>
      <div class="dice-target">Need: ${targetNumber}+ (running total: ${totalSoFar})</div>
      <div class="dice-bonus">Skill bonus: +${skillBonus}</div>
      <div class="dice-rolls-left">Roll ${currentRollIndex + 1} of ${rollsNeeded}</div>
    `;
    document.getElementById('dice-roll-btn').textContent = `ROLL AGAIN (${rollsNeeded - currentRollIndex} left)`;
    document.getElementById('dice-roll-btn').style.display = 'block';
    rollPhase = 0;
  } else {
    // All rolls done — resolve
    const total = totalSoFar;
    const success = total >= targetNumber;

    resultEl.innerHTML = `
      <div class="dice-final">
        <span class="dice-total">Total: ${rollResults.join(' + ')} + ${skillBonus} = ${total}</span>
        <span class="dice-outcome ${success ? 'success' : 'failure'}">${success ? 'SUCCESS!' : 'FAILED'}</span>
        <span class="dice-vs">vs target ${targetNumber}</span>
      </div>
    `;

    // Auto-close after delay
    setTimeout(() => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      diceContainer.style.display = 'none';
      if (rollCallback) {
        rollCallback({
          success,
          total,
          rolls: [...rollResults],
          bonus: skillBonus,
          critSuccess: rollResults.some(r => r === 12), // Double sixes
          critFail: rollResults.every(r => r === 2), // Snake eyes on all rolls
        });
        rollCallback = null;
      }
    }, 2000);
  }
}

// ========== DRAWING ==========

function drawDie(ctx, x, y, value, angle, isSpinning) {
  ctx.save();

  const cx = x + DIE_SIZE / 2;
  const cy = y + DIE_SIZE / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  roundRect(ctx, x + 4, y + 4, DIE_SIZE, DIE_SIZE, 8);
  ctx.fill();

  // Wobble effect when spinning
  if (isSpinning) {
    const wobble = Math.sin(angle * 3) * 0.05;
    ctx.translate(cx, cy);
    ctx.rotate(wobble);
    ctx.translate(-cx, -cy);
  }

  // Die body — white with subtle gradient
  const grad = ctx.createLinearGradient(x, y, x + DIE_SIZE, y + DIE_SIZE);
  grad.addColorStop(0, '#f5f5f0');
  grad.addColorStop(0.5, '#ffffff');
  grad.addColorStop(1, '#e8e8e0');
  ctx.fillStyle = grad;
  ctx.beginPath();
  roundRect(ctx, x, y, DIE_SIZE, DIE_SIZE, 8);
  ctx.fill();

  // Border
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  roundRect(ctx, x, y, DIE_SIZE, DIE_SIZE, 8);
  ctx.stroke();

  // Inner highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(ctx, x + 2, y + 2, DIE_SIZE - 4, DIE_SIZE - 4, 6);
  ctx.stroke();

  // Dots
  ctx.fillStyle = '#1a1a1a';
  drawDots(ctx, cx, cy, value);

  ctx.restore();
}

function drawDots(ctx, cx, cy, value) {
  const offsets = getDotPositions(value);
  for (const [dx, dy] of offsets) {
    ctx.beginPath();
    ctx.arc(cx + dx * 16, cy + dy * 16, DOT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

function getDotPositions(value) {
  switch (value) {
    case 1: return [[0, 0]];
    case 2: return [[-0.7, -0.7], [0.7, 0.7]];
    case 3: return [[-0.7, -0.7], [0, 0], [0.7, 0.7]];
    case 4: return [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]];
    case 5: return [[-0.7, -0.7], [0.7, -0.7], [0, 0], [-0.7, 0.7], [0.7, 0.7]];
    case 6: return [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0], [0.7, 0], [-0.7, 0.7], [0.7, 0.7]];
    default: return [[0, 0]];
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Calculate success chance for display (2d6 + bonus vs target).
 * Returns percentage 0-100.
 */
export function calculateSuccessChance(bonus, target, numRolls = 1) {
  const needed = target - bonus; // What we need from dice alone

  if (numRolls === 1) {
    // Single 2d6: outcomes are 2-12
    if (needed <= 2) return 100;
    if (needed > 12) return 0;
    let successes = 0;
    for (let a = 1; a <= 6; a++) {
      for (let b = 1; b <= 6; b++) {
        if (a + b >= needed) successes++;
      }
    }
    return Math.round((successes / 36) * 100);
  }

  if (numRolls === 2) {
    // Two rolls of 2d6: range 4-24, simulate all combos
    if (needed <= 4) return 100;
    if (needed > 24) return 0;
    let successes = 0;
    const total = 36 * 36; // 1296 combos
    for (let a1 = 1; a1 <= 6; a1++)
      for (let b1 = 1; b1 <= 6; b1++)
        for (let a2 = 1; a2 <= 6; a2++)
          for (let b2 = 1; b2 <= 6; b2++)
            if (a1 + b1 + a2 + b2 >= needed) successes++;
    return Math.round((successes / total) * 100);
  }

  // 3 rolls: use approximation (normal distribution)
  // Mean of Nd6 dice where N=numRolls*2: mean = N*3.5, std = sqrt(N*35/12)
  const numDice = numRolls * 2;
  const mean = numDice * 3.5;
  const std = Math.sqrt(numDice * 35 / 12);
  // Normal CDF approximation
  const z = (needed - mean) / std;
  const chance = 1 - normalCDF(z);
  return Math.max(1, Math.min(99, Math.round(chance * 100)));
}

function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

/**
 * Convert old d20 DC to new 2d6 target system.
 * Targets are HIGH so skill bonus matters and low rolls fail.
 * 2d6 range: 2-12, avg 7. With bonus 5, avg total = 12.
 * We want: easy ~75%, medium ~50%, hard ~25%, extreme ~10%
 *
 * DC 8 (easy)    → target 9  (need 4+ on dice with bonus 5 = 92%)
 * DC 10 (medium) → target 12 (need 7+ = 58%)
 * DC 12 (tough)  → target 14 (need 9+ = 28%)
 * DC 14 (hard)   → target 16 (need 11+ = 8% per roll)
 * DC 16+ (extreme) → target 18 (need 13+, impossible single roll, needs multi-roll)
 */
export function convertDCtoTarget(dc) {
  // Higher targets = harder. Skill bonus is the key to success.
  return Math.max(7, Math.min(20, Math.round(dc * 1.1 + 0.5)));
}

/**
 * Determine number of rolls needed based on difficulty.
 * More rolls = more dice totaled together = higher possible sum.
 */
export function getRollCount(dc) {
  if (dc <= 10) return 1;      // Easy: 1 roll (2d6, range 2-12)
  if (dc <= 13) return 1;      // Medium: 1 roll, higher target
  if (dc <= 16) return 2;      // Hard: 2 rolls (4d6 total, range 4-24)
  return 3;                     // Extreme: 3 rolls (6d6 total, range 6-36)
}
