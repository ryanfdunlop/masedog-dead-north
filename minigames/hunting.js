// ============================================================
// MASEDOG: Dead North — Hunting Mini-Game
// Side-view forest. Animals cross the screen.
// Aim and shoot (timing-based). Ammo limited.
// ============================================================

import { MinigameBase, GAME_WIDTH, GAME_HEIGHT } from './minigame-base.js';

const GROUND_Y = 145;

export class Hunting extends MinigameBase {
  constructor() {
    super();
    this.maxTime = 25;
  }

  init() {
    super.init();

    this.crosshair = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
    this.crosshairSpeed = 120;
    this.ammo = 6;
    this.kills = 0;
    this.animals = [];
    this.spawnTimer = 0;
    this.trees = this.generateTrees();
    this.shots = []; // Visual shot effects
  }

  generateTrees() {
    const trees = [];
    for (let i = 0; i < 12; i++) {
      trees.push({
        x: i * 30 + this.rand(-10, 10),
        h: this.rand(25, 50),
        w: this.rand(15, 25),
        shade: this.randInt(0, 2),
      });
    }
    return trees;
  }

  update(dt) {
    this.timer += dt;

    // Move crosshair
    if (this.isKeyDown('ArrowLeft') || this.isKeyDown('KeyA')) this.crosshair.x -= this.crosshairSpeed * dt;
    if (this.isKeyDown('ArrowRight') || this.isKeyDown('KeyD')) this.crosshair.x += this.crosshairSpeed * dt;
    if (this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW')) this.crosshair.y -= this.crosshairSpeed * dt;
    if (this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS')) this.crosshair.y += this.crosshairSpeed * dt;

    this.crosshair.x = this.clamp(this.crosshair.x, 0, GAME_WIDTH);
    this.crosshair.y = this.clamp(this.crosshair.y, 0, GAME_HEIGHT);

    // Mouse/touch override
    if (this.touch.active) {
      this.crosshair.x = this.touch.x;
      this.crosshair.y = this.touch.y;
    }

    // Shoot
    if (this.isKeyPressed('Space') || this.isKeyPressed('Enter')) {
      this.shoot();
    }

    // Spawn animals
    this.spawnTimer += dt;
    if (this.spawnTimer > 2.5 + this.rand(0, 2)) {
      this.spawnAnimal();
      this.spawnTimer = 0;
    }

    // Update animals
    for (const animal of this.animals) {
      animal.x += animal.speed * dt;
      animal.bobTimer += dt;
      animal.y = animal.baseY + Math.sin(animal.bobTimer * 4) * 2;

      // Scare animals near recent shots
      for (const shot of this.shots) {
        if (Math.abs(shot.x - animal.x) < 40 && shot.age < 0.5) {
          animal.speed *= 1.5;
          animal.scared = true;
        }
      }
    }

    // Remove off-screen animals
    this.animals = this.animals.filter(a => a.x > -30 && a.x < GAME_WIDTH + 30);

    // Update shots
    for (const shot of this.shots) {
      shot.age += dt;
    }
    this.shots = this.shots.filter(s => s.age < 0.5);

    // Time up or out of ammo
    if (this.timer >= this.maxTime || (this.ammo <= 0 && this.animals.length === 0)) {
      const foodGained = this.kills * 2;
      this.complete(this.kills > 0, this.kills * 15, { food: foodGained, kills: this.kills });
    }
  }

  shoot() {
    if (this.ammo <= 0) return;
    this.ammo--;

    this.shots.push({ x: this.crosshair.x, y: this.crosshair.y, age: 0 });

    // Check hits
    for (const animal of this.animals) {
      if (animal.hit) continue;
      const dx = Math.abs(this.crosshair.x - animal.x);
      const dy = Math.abs(this.crosshair.y - animal.y);
      const hitRadius = animal.size === 'large' ? 14 : 10;

      if (dx < hitRadius && dy < hitRadius) {
        animal.hit = true;
        animal.speed = 0;
        this.kills++;
        this.score += animal.points;
        break; // Only hit one per shot
      }
    }
  }

  spawnAnimal() {
    const types = [
      { name: 'deer', size: 'large', w: 20, h: 16, speed: 30, color: '#8b6914', points: 20 },
      { name: 'rabbit', size: 'small', w: 10, h: 8, speed: 50, color: '#aa9977', points: 10 },
      { name: 'bird', size: 'small', w: 8, h: 6, speed: 60, color: '#555', points: 5, flying: true },
    ];

    const template = types[this.randInt(0, types.length - 1)];
    const fromLeft = Math.random() > 0.5;
    const baseY = template.flying ? this.rand(30, 80) : GROUND_Y - template.h;

    this.animals.push({
      ...template,
      x: fromLeft ? -20 : GAME_WIDTH + 20,
      y: baseY,
      baseY,
      speed: (fromLeft ? 1 : -1) * template.speed * (0.8 + Math.random() * 0.4),
      bobTimer: Math.random() * Math.PI * 2,
      hit: false,
      scared: false,
    });
  }

  render(ctx) {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    grad.addColorStop(0, '#1a2233');
    grad.addColorStop(0.6, '#2a3344');
    grad.addColorStop(1, '#1a1a22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Trees (background)
    for (const tree of this.trees) {
      const colors = ['#1a3322', '#1a2a1a', '#223322'];
      ctx.fillStyle = '#332211';
      ctx.fillRect(tree.x + tree.w / 2 - 3, GROUND_Y - tree.h, 6, tree.h);
      ctx.fillStyle = colors[tree.shade];
      // Triangle canopy
      ctx.beginPath();
      ctx.moveTo(tree.x, GROUND_Y - tree.h + 10);
      ctx.lineTo(tree.x + tree.w / 2, GROUND_Y - tree.h - 15);
      ctx.lineTo(tree.x + tree.w, GROUND_Y - tree.h + 10);
      ctx.closePath();
      ctx.fill();
    }

    // Ground
    ctx.fillStyle = '#2a3322';
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    ctx.fillStyle = '#334433';
    for (let x = 0; x < GAME_WIDTH; x += 8) {
      ctx.fillRect(x, GROUND_Y, 4, 2);
    }

    // Animals
    for (const animal of this.animals) {
      if (animal.hit) {
        ctx.fillStyle = '#663333';
        ctx.fillRect(Math.round(animal.x) - 2, GROUND_Y - 4, animal.w, 4);
        continue;
      }

      ctx.fillStyle = animal.scared ? '#cc8844' : animal.color;
      ctx.fillRect(Math.round(animal.x), Math.round(animal.y), animal.w, animal.h);

      // Head
      if (animal.size === 'large') {
        ctx.fillRect(Math.round(animal.x) + (animal.speed > 0 ? animal.w : -6), Math.round(animal.y) - 2, 6, 8);
      }
    }

    // Shot effects
    for (const shot of this.shots) {
      const alpha = 1 - shot.age * 2;
      ctx.strokeStyle = `rgba(255, 200, 100, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, 8 + shot.age * 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crosshair
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 1;
    const cx = Math.round(this.crosshair.x);
    const cy = Math.round(this.crosshair.y);
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy); ctx.lineTo(cx - 3, cy);
    ctx.moveTo(cx + 3, cy); ctx.lineTo(cx + 8, cy);
    ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy - 3);
    ctx.moveTo(cx, cy + 3); ctx.lineTo(cx, cy + 8);
    ctx.stroke();

    // Ammo display
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i < this.ammo ? '#ccaa44' : '#333';
      ctx.fillRect(8 + i * 10, 8, 6, 12);
    }

    // Kills
    this.drawText(ctx, `Kills: ${this.kills}`, GAME_WIDTH - 70, 14, '#aa4444', 7);

    // Controls hint
    if (this.timer < 3) {
      this.drawText(ctx, 'WASD:Aim  SPACE:Shoot', 70, GAME_HEIGHT - 8, '#444', 5);
    }
  }
}
