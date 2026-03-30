// ============================================================
// MASEDOG: Dead North — Zombie Escape Mini-Game
// Side-scrolling runner. Jump/slide past obstacles.
// Zombies chase from behind — maintain speed or get caught.
// ============================================================

import { MinigameBase, GAME_WIDTH, GAME_HEIGHT } from './minigame-base.js';

const GROUND_Y = 140;
const GRAVITY = 800;
const JUMP_FORCE = -320;
const PLAYER_SPEED = 80;

export class ZombieEscape extends MinigameBase {
  constructor() {
    super();
    this.maxTime = 30;
  }

  init() {
    super.init();

    this.player = {
      x: 60, y: GROUND_Y, w: 12, h: 20,
      vy: 0, grounded: true, sliding: false, slideTimer: 0,
      color: '#44aaff',
    };

    this.scrollX = 0;
    this.speed = PLAYER_SPEED;
    this.zombieDistance = 100; // pixels behind player
    this.obstacles = [];
    this.lastObstacleX = GAME_WIDTH;
    this.survived = false;
    this.hits = 0;
    this.maxHits = 3;

    // GUN — check if player has ammo
    this.ammo = this.config?.ammo || 0;
    this.hasGun = this.ammo > 0;
    this.muzzleFlash = 0;
    this.bullets = []; // Visual bullet tracers
    this.zombieKills = 0;
    this.shotCooldown = 0;

    // Pre-generate some obstacles
    for (let i = 0; i < 8; i++) {
      this.spawnObstacle(GAME_WIDTH + i * 80 + this.rand(0, 40));
    }
  }

  spawnObstacle(x) {
    const types = [
      { type: 'car', w: 30, h: 16, y: GROUND_Y, color: '#555', jumpable: true, slidable: false },
      { type: 'barrier', w: 8, h: 24, y: GROUND_Y - 4, color: '#664422', jumpable: true, slidable: false },
      { type: 'wire', w: 40, h: 6, y: GROUND_Y - 14, color: '#888', jumpable: false, slidable: true },
      { type: 'debris', w: 20, h: 10, y: GROUND_Y, color: '#443322', jumpable: true, slidable: false },
    ];
    const template = types[this.randInt(0, types.length - 1)];
    this.obstacles.push({ ...template, x });
  }

  update(dt) {
    this.timer += dt;

    // Scroll
    this.scrollX += this.speed * dt;
    this.speed = PLAYER_SPEED + this.timer * 2; // Gradually speed up

    // Zombie gets closer over time
    this.zombieDistance = Math.max(10, 100 - this.timer * 2.5);

    // Jump
    if ((this.isKeyDown('Space') || this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW')) && this.player.grounded) {
      this.player.vy = JUMP_FORCE;
      this.player.grounded = false;
    }

    // SHOOT — LEFT CLICK or E/F key
    if (this.hasGun && this.ammo > 0 && this.shotCooldown <= 0 &&
        (this.touch.active || this.isKeyPressed('KeyE') || this.isKeyPressed('KeyF'))) {
      this.ammo--;
      this.shotCooldown = 0.4; // Rate limit
      this.muzzleFlash = 0.15;
      this.zombieDistance += 30; // Push zombies back!
      this.zombieKills++;
      // Bullet tracer visual
      this.bullets.push({ x: this.player.x + 12, y: GROUND_Y - 10, life: 0.3 });
    }
    this.shotCooldown -= dt;
    this.muzzleFlash -= dt;

    // Update bullets
    for (const b of this.bullets) { b.x += 300 * dt; b.life -= dt; }
    this.bullets = this.bullets.filter(b => b.life > 0);

    // Slide
    if ((this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS')) && this.player.grounded) {
      this.player.sliding = true;
      this.player.slideTimer = 0.4;
    }

    // Physics
    if (!this.player.grounded) {
      this.player.vy += GRAVITY * dt;
      this.player.y += this.player.vy * dt;
      if (this.player.y >= GROUND_Y) {
        this.player.y = GROUND_Y;
        this.player.vy = 0;
        this.player.grounded = true;
      }
    }

    // Slide timer
    if (this.player.sliding) {
      this.player.slideTimer -= dt;
      if (this.player.slideTimer <= 0) this.player.sliding = false;
    }

    // Collision with obstacles
    const playerBox = this.player.sliding
      ? { x: this.player.x, y: GROUND_Y, w: this.player.w, h: 8 }
      : { x: this.player.x, y: this.player.y - this.player.h, w: this.player.w, h: this.player.h };

    for (const obs of this.obstacles) {
      const screenX = obs.x - this.scrollX;
      if (screenX < -50 || screenX > GAME_WIDTH + 50) continue;

      const obsBox = { x: screenX, y: obs.y - obs.h, w: obs.w, h: obs.h };

      if (this.collides(playerBox, obsBox)) {
        // Check if player can avoid it
        if (obs.slidable && this.player.sliding) continue;
        if (obs.jumpable && this.player.y < GROUND_Y - 10) continue;

        // Hit!
        this.hits++;
        obs.x = -100; // Remove obstacle
        this.speed *= 0.7; // Slow down on hit

        if (this.hits >= this.maxHits) {
          this.complete(false, Math.floor(this.scrollX / 10), { caught: true });
          return;
        }
      }
    }

    // Spawn new obstacles
    const furthestObs = this.obstacles.reduce((max, o) => Math.max(max, o.x), 0);
    if (furthestObs - this.scrollX < GAME_WIDTH + 100) {
      this.spawnObstacle(furthestObs + 60 + this.rand(20, 60));
    }

    // Win condition: survive the full timer
    if (this.timer >= this.maxTime) {
      this.complete(true, Math.floor(this.scrollX / 10), {
        ammoUsed: (this.config?.ammo || 0) - this.ammo,
        zombieKills: this.zombieKills,
      });
    }
  }

  render(ctx) {
    // Sky
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Distant buildings (parallax)
    ctx.fillStyle = '#111118';
    for (let i = 0; i < 10; i++) {
      const bx = (i * 50 - (this.scrollX * 0.2) % 500);
      const bh = 30 + (i * 17) % 40;
      ctx.fillRect(bx, GROUND_Y - bh, 25, bh);
    }

    // Ground
    ctx.fillStyle = '#222';
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    // Road lines (scrolling)
    ctx.fillStyle = '#333';
    for (let x = -(this.scrollX % 30); x < GAME_WIDTH; x += 30) {
      ctx.fillRect(x, GROUND_Y + 8, 15, 2);
    }

    // Obstacles
    for (const obs of this.obstacles) {
      const screenX = obs.x - this.scrollX;
      if (screenX < -50 || screenX > GAME_WIDTH + 50) continue;
      ctx.fillStyle = obs.color;
      ctx.fillRect(Math.round(screenX), obs.y - obs.h, obs.w, obs.h);
    }

    // Player
    const py = this.player.sliding ? GROUND_Y - 8 : this.player.y - this.player.h;
    const pw = this.player.sliding ? 18 : this.player.w;
    const ph = this.player.sliding ? 8 : this.player.h;
    ctx.fillStyle = this.player.color;
    ctx.fillRect(Math.round(this.player.x), Math.round(py), pw, ph);

    // Player head
    if (!this.player.sliding) {
      ctx.fillStyle = '#ddb88c';
      ctx.fillRect(Math.round(this.player.x) + 2, Math.round(py) - 6, 8, 8);
    }

    // GUN in player's hand (if has ammo)
    if (this.hasGun) {
      const gunX = Math.round(this.player.x) + pw;
      const gunY = Math.round(py) + 6;
      ctx.fillStyle = '#555';
      ctx.fillRect(gunX, gunY, 8, 3);
      ctx.fillStyle = '#444';
      ctx.fillRect(gunX + 6, gunY - 1, 3, 5);

      // Muzzle flash
      if (this.muzzleFlash > 0) {
        ctx.fillStyle = `rgba(255, 200, 50, ${this.muzzleFlash * 6})`;
        ctx.fillRect(gunX + 8, gunY - 3, 6, 8);
        ctx.fillStyle = `rgba(255, 255, 200, ${this.muzzleFlash * 4})`;
        ctx.fillRect(gunX + 10, gunY - 1, 4, 4);
      }
    }

    // Bullet tracers
    for (const b of this.bullets) {
      const alpha = b.life * 3;
      ctx.fillStyle = `rgba(255, 230, 100, ${alpha})`;
      ctx.fillRect(Math.round(b.x), Math.round(b.y), 12, 2);
      ctx.fillStyle = `rgba(255, 150, 50, ${alpha * 0.5})`;
      ctx.fillRect(Math.round(b.x) - 6, Math.round(b.y), 6, 2);
    }

    // Zombie horde behind player
    const zombieX = this.player.x - this.zombieDistance;
    ctx.fillStyle = '#663333';
    for (let i = 0; i < 5; i++) {
      const zx = zombieX - i * 12 + Math.sin(this.timer * 5 + i) * 3;
      const zy = GROUND_Y - 18 + Math.abs(Math.sin(this.timer * 8 + i * 2)) * 4;
      ctx.fillRect(Math.round(zx), Math.round(zy), 10, 18);
      // Zombie heads
      ctx.fillStyle = '#445544';
      ctx.fillRect(Math.round(zx) + 1, Math.round(zy) - 6, 7, 7);
      ctx.fillStyle = '#663333';
    }

    // Hits indicator
    for (let i = 0; i < this.maxHits; i++) {
      ctx.fillStyle = i < this.hits ? '#cc3333' : '#333';
      ctx.fillRect(GAME_WIDTH - 40 + i * 12, 8, 8, 8);
    }

    // Distance
    this.drawText(ctx, `${Math.floor(this.scrollX / 10)}m`, 8, 14, '#aaa', 8);

    // Ammo display
    if (this.hasGun) {
      this.drawText(ctx, `AMMO: ${this.ammo}`, 8, 26, this.ammo > 0 ? '#ccaa44' : '#cc3333', 7);
      // Ammo pips
      for (let i = 0; i < Math.min(10, this.ammo); i++) {
        ctx.fillStyle = '#ccaa44';
        ctx.fillRect(8 + i * 7, 30, 4, 8);
      }
    }

    // Zombie kill count
    if (this.zombieKills > 0) {
      this.drawText(ctx, `KILLS: ${this.zombieKills}`, GAME_WIDTH - 80, 26, '#aa4444', 7);
    }

    // Controls hint
    if (this.timer < 4) {
      const gunHint = this.hasGun ? '  E/F: Shoot' : '';
      this.drawText(ctx, `UP/W: Jump  DOWN/S: Slide${gunHint}`, 40, GAME_HEIGHT - 10, '#555', 5);
    }
  }
}
