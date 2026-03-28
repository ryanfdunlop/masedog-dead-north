// ============================================================
// MASEDOG: Dead North — Visual Dice System (VS MODE)
// WHITE dice = Player roll. RED dice = Enemy/Zombie roll.
// Player clicks to roll their dice, then enemy auto-rolls.
// Higher total wins! Creates dramatic head-to-head tension.
// ============================================================

let diceCanvas = null;
let diceCtx = null;
let diceContainer = null;
let rolling = false;
let rollCallback = null;
let animFrameId = null;

// Canvas size
const CANVAS_W = 400;
const CANVAS_H = 220;
const DIE_SIZE = 50;
const DOT_RADIUS = 4.5;

// Player dice (white)
let playerDie1 = { value: 1, _display: 1, x: 0, y: 0, vx: 0, vy: 0, angle: 0, targetAngle: 0 };
let playerDie2 = { value: 1, _display: 1, x: 0, y: 0, vx: 0, vy: 0, angle: 0, targetAngle: 0 };

// Enemy dice (red)
let enemyDie1 = { value: 1, _display: 1, x: 0, y: 0, vx: 0, vy: 0, angle: 0, targetAngle: 0 };
let enemyDie2 = { value: 1, _display: 1, x: 0, y: 0, vx: 0, vy: 0, angle: 0, targetAngle: 0 };

// State
let phase = 'waiting'; // waiting | player_rolling | player_done | enemy_rolling | enemy_done | result
let phaseTimer = 0;
let playerTotal = 0;
let enemyTotal = 0;
let skillBonus = 0;
let enemyBonus = 0;
let rollInfoText = '';
let vsMode = false; // true for combat, false for skill checks

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

  document.getElementById('dice-roll-btn').addEventListener('click', onRollClick);
  diceContainer.style.display = 'none';
}

/**
 * Roll dice for a skill check (player only, vs target number).
 */
export function rollDice(options) {
  return new Promise(resolve => {
    const { skill = '', bonus = 0, target = 7, rolls = 1, label = '' } = options;

    vsMode = false;
    skillBonus = bonus;
    enemyBonus = target; // Target is stored as "enemy score to beat"
    rollCallback = resolve;
    rollInfoText = label || `${skill.toUpperCase()} CHECK`;

    resetDice();
    diceContainer.style.display = 'flex';

    const infoEl = document.getElementById('dice-info');
    infoEl.innerHTML = `
      <div class="dice-label">${rollInfoText}</div>
      <div class="dice-target">Your roll + ${bonus} skill must beat ${target}</div>
    `;

    document.getElementById('dice-result').textContent = '';
    document.getElementById('dice-roll-btn').textContent = 'ROLL YOUR DICE';
    document.getElementById('dice-roll-btn').style.display = 'block';
    phase = 'waiting';

    if (animFrameId) cancelAnimationFrame(animFrameId);
    renderLoop();
  });
}

/**
 * Roll dice in VS MODE — player white dice vs enemy red dice.
 * Used for combat and contested checks.
 */
export function rollDiceVS(options) {
  return new Promise(resolve => {
    const { label = 'BATTLE', playerBonus = 0, enemyBonusVal = 0, enemyName = 'ZOMBIE' } = options;

    vsMode = true;
    skillBonus = playerBonus;
    enemyBonus = enemyBonusVal;
    rollCallback = resolve;
    rollInfoText = label;

    resetDice();
    diceContainer.style.display = 'flex';

    const infoEl = document.getElementById('dice-info');
    infoEl.innerHTML = `
      <div class="dice-label">${label}</div>
      <div class="dice-vs-header">
        <span class="dice-player-label">YOU (+${playerBonus})</span>
        <span class="dice-vs-text">VS</span>
        <span class="dice-enemy-label">${enemyName} (+${enemyBonusVal})</span>
      </div>
    `;

    document.getElementById('dice-result').textContent = '';
    document.getElementById('dice-roll-btn').textContent = 'ROLL YOUR DICE';
    document.getElementById('dice-roll-btn').style.display = 'block';
    phase = 'waiting';

    if (animFrameId) cancelAnimationFrame(animFrameId);
    renderLoop();
  });
}

function resetDice() {
  // Player dice (left side)
  playerDie1.x = 30; playerDie1.y = 80; playerDie1.value = 1; playerDie1._display = 1; playerDie1.angle = 0;
  playerDie2.x = 95; playerDie2.y = 80; playerDie2.value = 1; playerDie2._display = 1; playerDie2.angle = 0;
  // Enemy dice (right side)
  enemyDie1.x = CANVAS_W - 30 - DIE_SIZE * 2 - 15; enemyDie1.y = 80; enemyDie1.value = 1; enemyDie1._display = 1; enemyDie1.angle = 0;
  enemyDie2.x = CANVAS_W - 30 - DIE_SIZE; enemyDie2.y = 80; enemyDie2.value = 1; enemyDie2._display = 1; enemyDie2.angle = 0;
  phaseTimer = 0;
  playerTotal = 0;
  enemyTotal = 0;
}

function onRollClick() {
  if (rolling) return;
  rolling = true;
  phase = 'player_rolling';
  phaseTimer = 0;

  // Set player final values
  playerDie1.value = Math.floor(Math.random() * 6) + 1;
  playerDie2.value = Math.floor(Math.random() * 6) + 1;

  // Bounce player dice
  playerDie1.vx = 2 + Math.random() * 3;
  playerDie1.vy = -1 + Math.random() * 2;
  playerDie2.vx = 2 + Math.random() * 3;
  playerDie2.vy = 1 - Math.random() * 2;
  playerDie1.targetAngle = (3 + Math.random() * 5) * Math.PI * 2;
  playerDie2.targetAngle = (3 + Math.random() * 5) * Math.PI * 2;

  document.getElementById('dice-roll-btn').style.display = 'none';
}

function startEnemyRoll() {
  phase = 'enemy_rolling';
  phaseTimer = 0;

  // Set enemy final values
  enemyDie1.value = Math.floor(Math.random() * 6) + 1;
  enemyDie2.value = Math.floor(Math.random() * 6) + 1;

  // Bounce enemy dice
  enemyDie1.vx = -2 - Math.random() * 3;
  enemyDie1.vy = -1 + Math.random() * 2;
  enemyDie2.vx = -2 - Math.random() * 3;
  enemyDie2.vy = 1 - Math.random() * 2;
  enemyDie1.targetAngle = (3 + Math.random() * 5) * Math.PI * 2;
  enemyDie2.targetAngle = (3 + Math.random() * 5) * Math.PI * 2;
}

// ========== GAME LOOP ==========

function renderLoop() {
  const ctx = diceCtx;
  const dt = 1 / 60;
  phaseTimer += dt;

  // Clear
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Felt table
  ctx.fillStyle = '#1a2a1a';
  ctx.beginPath();
  roundRect(ctx, 10, 10, CANVAS_W - 20, CANVAS_H - 20, 12);
  ctx.fill();
  ctx.strokeStyle = '#2a3a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  roundRect(ctx, 10, 10, CANVAS_W - 20, CANVAS_H - 20, 12);
  ctx.stroke();

  // Center divider (VS line)
  if (vsMode) {
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 20);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', CANVAS_W * 0.25, 30);
    ctx.fillStyle = '#cc3333';
    ctx.fillText('ENEMY', CANVAS_W * 0.75, 30);
    ctx.textAlign = 'left';
  }

  // Update and draw dice based on phase
  if (phase === 'player_rolling') {
    updateDiceSpin(playerDie1, playerDie2, dt);
    if (phaseTimer > 1.3) {
      playerDie1._display = playerDie1.value;
      playerDie2._display = playerDie2.value;
      playerTotal = playerDie1.value + playerDie2.value;
      phase = 'player_done';
      phaseTimer = 0;
    }
  } else if (phase === 'player_done') {
    playerDie1._display = playerDie1.value;
    playerDie2._display = playerDie2.value;
    if (phaseTimer > 0.8) {
      if (vsMode) {
        startEnemyRoll();
      } else {
        // Skill check mode — resolve immediately
        resolveResult();
      }
    }
  } else if (phase === 'enemy_rolling') {
    updateDiceSpin(enemyDie1, enemyDie2, dt);
    if (phaseTimer > 1.3) {
      enemyDie1._display = enemyDie1.value;
      enemyDie2._display = enemyDie2.value;
      enemyTotal = enemyDie1.value + enemyDie2.value;
      phase = 'enemy_done';
      phaseTimer = 0;
    }
  } else if (phase === 'enemy_done') {
    enemyDie1._display = enemyDie1.value;
    enemyDie2._display = enemyDie2.value;
    if (phaseTimer > 0.6) {
      resolveResult();
    }
  }

  // Draw player dice (WHITE)
  drawDie(ctx, playerDie1.x, playerDie1.y, playerDie1._display, playerDie1.angle, phase === 'player_rolling', 'white');
  drawDie(ctx, playerDie2.x, playerDie2.y, playerDie2._display, playerDie2.angle, phase === 'player_rolling', 'white');

  // Draw enemy dice (RED) — only if VS mode
  if (vsMode) {
    const showEnemy = phase === 'enemy_rolling' || phase === 'enemy_done' || phase === 'result';
    if (showEnemy) {
      drawDie(ctx, enemyDie1.x, enemyDie1.y, enemyDie1._display, enemyDie1.angle, phase === 'enemy_rolling', 'red');
      drawDie(ctx, enemyDie2.x, enemyDie2.y, enemyDie2._display, enemyDie2.angle, phase === 'enemy_rolling', 'red');
    } else {
      // Show enemy dice as face-down (grey) before they roll
      drawDie(ctx, enemyDie1.x, enemyDie1.y, 0, 0, false, 'hidden');
      drawDie(ctx, enemyDie2.x, enemyDie2.y, 0, 0, false, 'hidden');
    }
  }

  // Show running totals
  ctx.font = '12px "Press Start 2P", monospace';
  if (playerTotal > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const pText = `${playerDie1.value}+${playerDie2.value}=${playerTotal}` + (skillBonus > 0 ? ` +${skillBonus}` : '');
    ctx.fillText(pText, vsMode ? CANVAS_W * 0.25 : CANVAS_W / 2, CANVAS_H - 25);
  }
  if (vsMode && enemyTotal > 0) {
    ctx.fillStyle = '#cc3333';
    ctx.textAlign = 'center';
    const eText = `${enemyDie1.value}+${enemyDie2.value}=${enemyTotal}` + (enemyBonus > 0 ? ` +${enemyBonus}` : '');
    ctx.fillText(eText, CANVAS_W * 0.75, CANVAS_H - 25);
  }
  ctx.textAlign = 'left';

  animFrameId = requestAnimationFrame(renderLoop);
}

function updateDiceSpin(d1, d2, dt) {
  const progress = Math.min(1, phaseTimer / 1.3);
  const ease = easeOutCubic(progress);

  // Movement
  d1.x += d1.vx; d1.y += d1.vy;
  d2.x += d2.vx; d2.y += d2.vy;
  d1.vx *= 0.96; d1.vy *= 0.96;
  d2.vx *= 0.96; d2.vy *= 0.96;

  // Bounce off walls
  if (d1.x < 15 || d1.x > CANVAS_W - 15 - DIE_SIZE) d1.vx *= -0.7;
  if (d1.y < 15 || d1.y > CANVAS_H - 15 - DIE_SIZE) d1.vy *= -0.7;
  if (d2.x < 15 || d2.x > CANVAS_W - 15 - DIE_SIZE) d2.vx *= -0.7;
  if (d2.y < 15 || d2.y > CANVAS_H - 15 - DIE_SIZE) d2.vy *= -0.7;

  d1.x = Math.max(15, Math.min(CANVAS_W - 15 - DIE_SIZE, d1.x));
  d1.y = Math.max(40, Math.min(CANVAS_H - 40 - DIE_SIZE, d1.y));
  d2.x = Math.max(15, Math.min(CANVAS_W - 15 - DIE_SIZE, d2.x));
  d2.y = Math.max(40, Math.min(CANVAS_H - 40 - DIE_SIZE, d2.y));

  // Spin angles
  d1.angle = d1.targetAngle * ease;
  d2.angle = d2.targetAngle * ease;

  // Display values
  if (progress < 0.7) {
    d1._display = Math.floor(Math.random() * 6) + 1;
    d2._display = Math.floor(Math.random() * 6) + 1;
  } else {
    d1._display = d1.value;
    d2._display = d2.value;
  }
}

function resolveResult() {
  if (phase === 'result') return;
  phase = 'result';
  rolling = false;

  const resultEl = document.getElementById('dice-result');
  let success, playerFinal, enemyFinal;

  if (vsMode) {
    // VS mode: compare totals + bonuses
    playerFinal = playerTotal + skillBonus;
    enemyFinal = enemyTotal + enemyBonus;
    success = playerFinal > enemyFinal;

    resultEl.innerHTML = `
      <div class="dice-final">
        <div class="dice-vs-result">
          <span class="dice-vs-score player">${playerFinal}</span>
          <span class="dice-vs-label">VS</span>
          <span class="dice-vs-score enemy">${enemyFinal}</span>
        </div>
        <span class="dice-outcome ${success ? 'success' : 'failure'}">${success ? 'YOU WIN!' : 'THEY WIN!'}</span>
      </div>
    `;
  } else {
    // Skill check mode: player total + bonus vs target
    playerFinal = playerTotal + skillBonus;
    enemyFinal = enemyBonus; // target number
    success = playerFinal >= enemyFinal;

    resultEl.innerHTML = `
      <div class="dice-final">
        <div class="dice-breakdown-line">
          Die 1: ${playerDie1.value} | Die 2: ${playerDie2.value} | Dice: ${playerTotal} + Skill: ${skillBonus}
        </div>
        <div class="dice-total-line">
          <strong>${playerFinal}</strong> vs target <strong>${enemyFinal}</strong>
        </div>
        <span class="dice-outcome ${success ? 'success' : 'failure'}">${success ? 'SUCCESS!' : 'FAILED!'}</span>
      </div>
    `;
  }

  // Auto-close after delay
  setTimeout(() => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    diceContainer.style.display = 'none';
    if (rollCallback) {
      rollCallback({
        success,
        playerTotal,
        enemyTotal,
        total: playerFinal,
        bonus: skillBonus,
        rolls: [playerTotal],
        critSuccess: playerDie1.value === 6 && playerDie2.value === 6,
        critFail: playerDie1.value === 1 && playerDie2.value === 1,
      });
      rollCallback = null;
    }
  }, 2200);
}

// ========== DRAWING ==========

function drawDie(ctx, x, y, value, angle, isSpinning, color = 'white') {
  ctx.save();
  const cx = x + DIE_SIZE / 2;
  const cy = y + DIE_SIZE / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  roundRect(ctx, x + 3, y + 3, DIE_SIZE, DIE_SIZE, 7);
  ctx.fill();

  // Wobble when spinning
  if (isSpinning) {
    const wobble = Math.sin(angle * 3) * 0.06;
    ctx.translate(cx, cy);
    ctx.rotate(wobble);
    ctx.translate(-cx, -cy);
  }

  if (color === 'hidden') {
    // Face-down die — grey with question mark
    ctx.fillStyle = '#333';
    ctx.beginPath();
    roundRect(ctx, x, y, DIE_SIZE, DIE_SIZE, 7);
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, x, y, DIE_SIZE, DIE_SIZE, 7);
    ctx.stroke();
    ctx.fillStyle = '#555';
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('?', cx, cy + 6);
    ctx.textAlign = 'left';
    ctx.restore();
    return;
  }

  // Die body
  let grad;
  if (color === 'red') {
    grad = ctx.createLinearGradient(x, y, x + DIE_SIZE, y + DIE_SIZE);
    grad.addColorStop(0, '#991111');
    grad.addColorStop(0.3, '#cc2222');
    grad.addColorStop(0.7, '#bb1a1a');
    grad.addColorStop(1, '#881010');
  } else {
    grad = ctx.createLinearGradient(x, y, x + DIE_SIZE, y + DIE_SIZE);
    grad.addColorStop(0, '#eeeee8');
    grad.addColorStop(0.3, '#ffffff');
    grad.addColorStop(0.7, '#f8f8f4');
    grad.addColorStop(1, '#ddddd5');
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  roundRect(ctx, x, y, DIE_SIZE, DIE_SIZE, 7);
  ctx.fill();

  // Border
  ctx.strokeStyle = color === 'red' ? '#661111' : '#bbb';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  roundRect(ctx, x, y, DIE_SIZE, DIE_SIZE, 7);
  ctx.stroke();

  // Highlight edge
  ctx.strokeStyle = color === 'red' ? 'rgba(255,100,100,0.3)' : 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(ctx, x + 2, y + 2, DIE_SIZE - 4, DIE_SIZE - 4, 5);
  ctx.stroke();

  // Dots
  if (value >= 1 && value <= 6) {
    ctx.fillStyle = color === 'red' ? '#ffffff' : '#1a1a1a';
    const offsets = getDotPositions(value);
    for (const [dx, dy] of offsets) {
      ctx.beginPath();
      ctx.arc(cx + dx * 14, cy + dy * 14, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function getDotPositions(value) {
  switch (value) {
    case 1: return [[0, 0]];
    case 2: return [[-0.7, -0.7], [0.7, 0.7]];
    case 3: return [[-0.7, -0.7], [0, 0], [0.7, 0.7]];
    case 4: return [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]];
    case 5: return [[-0.7, -0.7], [0.7, -0.7], [0, 0], [-0.7, 0.7], [0.7, 0.7]];
    case 6: return [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0], [0.7, 0], [-0.7, 0.7], [0.7, 0.7]];
    default: return [];
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

// ========== EXPORTS FOR OTHER MODULES ==========

/**
 * Calculate success chance for skill checks (2d6+bonus vs target).
 */
export function calculateSuccessChance(bonus, target, numRolls = 1) {
  const needed = target - bonus;
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

/**
 * Calculate win chance in VS mode (your 2d6 vs enemy 2d6 + enemyBonus).
 * Exact enumeration of all 1296 dice combinations.
 */
export function calculateVSChance(playerBonus, enemyBonus) {
  let wins = 0;
  const total = 36 * 36; // 1296
  for (let a1 = 1; a1 <= 6; a1++)
    for (let b1 = 1; b1 <= 6; b1++)
      for (let a2 = 1; a2 <= 6; a2++)
        for (let b2 = 1; b2 <= 6; b2++)
          if ((a1 + b1 + playerBonus) > (a2 + b2 + enemyBonus)) wins++;
  return Math.round((wins / total) * 100);
}

/**
 * Convert d20 DC to 2d6 target.
 */
export function convertDCtoTarget(dc) {
  return Math.max(7, Math.min(20, Math.round(dc * 1.1 + 0.5)));
}

/**
 * Determine roll count from DC.
 */
export function getRollCount(dc) {
  if (dc <= 13) return 1;
  if (dc <= 16) return 2;
  return 3;
}
