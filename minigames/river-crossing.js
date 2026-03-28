// ============================================================
// MASEDOG: Dead North — River Crossing Mini-Game
// Side-view raft on a river. Avoid rocks and debris.
// Steer with left/right. Survive the crossing.
// ============================================================

import { MinigameBase, GAME_WIDTH, GAME_HEIGHT } from './minigame-base.js';

export class RiverCrossing extends MinigameBase {
  constructor() {
    super();
    this.maxTime = 20;
  }

  init() {
    super.init();

    this.raft = {
      x: GAME_WIDTH / 2 - 15,
      y: 100,
      w: 30, h: 12,
      speed: 60,
    };

    this.scrollY = 0;
    this.riverSpeed = 40;
    this.obstacles = [];
    this.ripples = [];
    this.hits = 0;
    this.maxHits = 4;
    this.distance = 0;
    this.targetDistance = 200; // "meters" to cross

    // Spawn initial obstacles
    for (let i = 0; i < 6; i++) {
      this.spawnObstacle(this.rand(-50, -300));
    }
  }

  spawnObstacle(yOffset = 0) {
    const types = [
      { type: 'rock', w: 16, h: 12, color: '#555566' },
      { type: 'log', w: 30, h: 6, color: '#553311' },
      { type: 'debris', w: 12, h: 10, color: '#444' },
      { type: 'ice', w: 20, h: 8, color: '#aabbcc' },
    ];
    const t = types[this.randInt(0, types.length - 1)];
    this.obstacles.push({
      ...t,
      x: this.rand(10, GAME_WIDTH - 30),
      y: yOffset - this.rand(10, 60),
      bobPhase: this.rand(0, Math.PI * 2),
    });
  }

  update(dt) {
    this.timer += dt;

    // Steer raft
    if (this.isKeyDown('ArrowLeft') || this.isKeyDown('KeyA')) {
      this.raft.x -= this.raft.speed * dt;
    }
    if (this.isKeyDown('ArrowRight') || this.isKeyDown('KeyD')) {
      this.raft.x += this.raft.speed * dt;
    }

    // Current drift
    const driftAmount = Math.sin(this.timer * 0.5) * 15 * dt;
    this.raft.x += driftAmount;

    this.raft.x = this.clamp(this.raft.x, 5, GAME_WIDTH - this.raft.w - 5);

    // River scrolls
    this.scrollY += this.riverSpeed * dt;
    this.distance += this.riverSpeed * dt * 0.3;

    // Speed increases over time
    this.riverSpeed = 40 + this.timer * 2;

    // Obstacles scroll toward raft
    for (const obs of this.obstacles) {
      obs.y += this.riverSpeed * dt;
      obs.x += Math.sin(obs.bobPhase + this.timer) * 8 * dt;

      // Collision with raft
      const raftBox = { x: this.raft.x, y: this.raft.y, w: this.raft.w, h: this.raft.h };
      const obsBox = { x: obs.x, y: obs.y, w: obs.w, h: obs.h };

      if (!obs.hit && this.collides(raftBox, obsBox)) {
        obs.hit = true;
        this.hits++;
        // Push raft away from obstacle
        if (obs.x < this.raft.x) this.raft.x += 15;
        else this.raft.x -= 15;

        if (this.hits >= this.maxHits) {
          this.complete(false, Math.floor(this.distance), { capsized: true });
          return;
        }
      }
    }

    // Remove passed obstacles, spawn new ones
    this.obstacles = this.obstacles.filter(o => o.y < GAME_HEIGHT + 20);
    while (this.obstacles.length < 5) {
      this.spawnObstacle(-this.rand(20, 80));
    }

    // Ripple effects
    if (Math.random() < 0.3) {
      this.ripples.push({
        x: this.rand(0, GAME_WIDTH),
        y: this.rand(0, GAME_HEIGHT),
        size: this.rand(2, 6),
        life: 1,
      });
    }
    for (const r of this.ripples) r.life -= dt * 2;
    this.ripples = this.ripples.filter(r => r.life > 0);

    // Win condition
    if (this.distance >= this.targetDistance) {
      this.complete(true, Math.floor(this.distance));
    }

    // Time up
    if (this.timer >= this.maxTime) {
      this.complete(this.distance > this.targetDistance * 0.7, Math.floor(this.distance));
    }
  }

  render(ctx) {
    // Water background
    const waterGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    waterGrad.addColorStop(0, '#1a3344');
    waterGrad.addColorStop(0.5, '#224455');
    waterGrad.addColorStop(1, '#1a3344');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Water flow lines
    ctx.strokeStyle = 'rgba(100, 150, 180, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const baseX = i * 45 + Math.sin(this.timer + i) * 10;
      ctx.beginPath();
      for (let y = 0; y < GAME_HEIGHT; y += 4) {
        const x = baseX + Math.sin((y + this.scrollY) * 0.05 + i) * 8;
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Ripples
    for (const r of this.ripples) {
      ctx.strokeStyle = `rgba(150, 200, 220, ${r.life * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.size * (2 - r.life), 0, Math.PI * 2);
      ctx.stroke();
    }

    // River banks
    ctx.fillStyle = '#2a3322';
    ctx.fillRect(0, 0, 4, GAME_HEIGHT);
    ctx.fillRect(GAME_WIDTH - 4, 0, 4, GAME_HEIGHT);

    // Obstacles
    for (const obs of this.obstacles) {
      if (obs.hit) {
        ctx.fillStyle = '#442222';
      } else {
        ctx.fillStyle = obs.color;
      }
      ctx.fillRect(Math.round(obs.x), Math.round(obs.y), obs.w, obs.h);
      // Highlight
      if (!obs.hit) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(Math.round(obs.x) + 1, Math.round(obs.y) + 1, obs.w - 2, 2);
      }
    }

    // Raft
    ctx.fillStyle = '#664422';
    ctx.fillRect(Math.round(this.raft.x), this.raft.y, this.raft.w, this.raft.h);
    // Raft planks
    ctx.fillStyle = '#553311';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(Math.round(this.raft.x) + 1, this.raft.y + i * 4 + 1, this.raft.w - 2, 1);
    }
    // Player on raft
    ctx.fillStyle = '#44aaff';
    ctx.fillRect(Math.round(this.raft.x) + 10, this.raft.y - 10, 8, 10);
    ctx.fillStyle = '#ddb88c';
    ctx.fillRect(Math.round(this.raft.x) + 11, this.raft.y - 14, 6, 5);

    // Damage indicators
    for (let i = 0; i < this.maxHits; i++) {
      ctx.fillStyle = i < this.hits ? '#cc3333' : '#224455';
      ctx.fillRect(8 + i * 12, 8, 8, 8);
    }

    // Distance progress
    const pct = Math.min(1, this.distance / this.targetDistance);
    ctx.fillStyle = '#224455';
    ctx.fillRect(GAME_WIDTH - 16, 10, 8, GAME_HEIGHT - 20);
    ctx.fillStyle = '#44aa44';
    ctx.fillRect(GAME_WIDTH - 16, 10 + (GAME_HEIGHT - 20) * (1 - pct), 8, (GAME_HEIGHT - 20) * pct);

    // Distance text
    this.drawText(ctx, `${Math.floor(pct * 100)}%`, GAME_WIDTH - 50, 16, '#aaa', 7);

    // Controls hint
    if (this.timer < 3) {
      this.drawText(ctx, 'LEFT/RIGHT: Steer raft', 70, GAME_HEIGHT - 8, '#446666', 5);
    }
  }
}
