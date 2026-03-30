// ============================================================
// MASEDOG: Dead North — Zombie Escape Mini-Game (JUICED)
// Side-scrolling runner. Jump/slide past obstacles.
// Zombies chase from behind — maintain speed or get caught.
// NOW WITH: juice system, varied zombies, power-ups, speed
// lines, heartbeat, burning cars, collapsing signs, and more.
// ============================================================

import { MinigameBase, GAME_WIDTH, GAME_HEIGHT } from './minigame-base.js';
import {
  hitstop, isHitstopped, updateJuice, renderJuice,
  getShakeOffset, shake, getTimeScale, slowmo,
  flash, gunFire, shellCasing, dustCloud, zombieDeath,
  playerHit, floatingText, addCombo, getCombo, renderCombo,
  spawnParticles, lootPickup, explosion, resetJuice,
} from './juice.js';

const GROUND_Y = 140;
const GRAVITY = 800;
const JUMP_FORCE = -320;
const PLAYER_SPEED = 80;

// Zombie types
const ZOMBIE_SPRINTER = 'sprinter';
const ZOMBIE_BLOATER = 'bloater';
const ZOMBIE_CRAWLER = 'crawler';

// Power-up types
const POWERUP_AMMO = 'ammo';
const POWERUP_HEALTH = 'health';
const POWERUP_SPEED = 'speed';

export class ZombieEscape extends MinigameBase {
  constructor() {
    super();
    this.maxTime = 30;
  }

  init() {
    super.init();
    resetJuice();

    this.player = {
      x: 60, y: GROUND_Y, w: 12, h: 20,
      vy: 0, grounded: true, sliding: false, slideTimer: 0,
      color: '#44aaff',
      invincible: 0, // brief i-frames after hit
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
    this.bullets = [];
    this.zombieKills = 0;
    this.shotCooldown = 0;

    // Zombie horde — varied types
    this.hordeZombies = [];
    this._spawnInitialHorde();

    // Crawler zombies (pop up from ground ahead)
    this.crawlers = [];
    this.nextCrawlerTime = 8 + this.rand(0, 5);

    // Power-ups
    this.powerups = [];
    this.nextPowerupTime = 5 + this.rand(0, 4);
    this.speedBoostTimer = 0;

    // Speed lines for velocity feel
    this.speedLines = [];

    // Heartbeat overlay
    this.heartbeatPhase = 0;

    // Screen edge danger pulse
    this.dangerPulse = 0;

    // Collapsing sign warnings
    this.collapsingWarnings = []; // visual telegraph markers

    // Was grounded last frame (for landing detection)
    this.wasGrounded = true;

    // Pre-generate some obstacles
    for (let i = 0; i < 8; i++) {
      this.spawnObstacle(GAME_WIDTH + i * 80 + this.rand(0, 40));
    }
  }

  // ----------------------------------------------------------
  // ZOMBIE HORDE
  // ----------------------------------------------------------

  _spawnInitialHorde() {
    // Mix of sprinters and bloaters behind the player
    for (let i = 0; i < 5; i++) {
      this.hordeZombies.push(this._makeHordeZombie(i));
    }
  }

  _makeHordeZombie(index) {
    const roll = this.rand(0, 1);
    let type, color, headColor, speed, w, h;
    if (roll < 0.35) {
      // Sprinter — fast, red tint
      type = ZOMBIE_SPRINTER;
      color = '#883333';
      headColor = '#aa4444';
      speed = 1.3;
      w = 9; h = 17;
    } else if (roll < 0.55) {
      // Bloater — slow, green, big
      type = ZOMBIE_BLOATER;
      color = '#336633';
      headColor = '#448844';
      speed = 0.6;
      w = 14; h = 20;
    } else {
      // Regular
      type = 'regular';
      color = '#663333';
      headColor = '#445544';
      speed = 1.0;
      w = 10; h = 18;
    }
    return {
      type, color, headColor, speed, w, h,
      offsetX: -index * 14 + this.rand(-4, 4),
      bobPhase: this.rand(0, Math.PI * 2),
      alive: true,
    };
  }

  // ----------------------------------------------------------
  // OBSTACLES — expanded variety
  // ----------------------------------------------------------

  spawnObstacle(x) {
    const roll = this.rand(0, 1);
    let template;

    if (roll < 0.15) {
      // Burning car — fire particles
      template = { type: 'burning_car', w: 32, h: 16, y: GROUND_Y, color: '#553322', jumpable: true, slidable: false, burning: true };
    } else if (roll < 0.28) {
      // Collapsing sign — telegraphed, falls as you approach
      template = { type: 'collapsing_sign', w: 10, h: 28, y: GROUND_Y - 4, color: '#666644', jumpable: true, slidable: false, collapsing: false, collapseTimer: 0, fallen: false, telegraphDist: 120 };
    } else if (roll < 0.40) {
      // Gap in road — must jump
      template = { type: 'gap', w: 24, h: 40, y: GROUND_Y, color: '#000000', jumpable: true, slidable: false, isGap: true };
    } else if (roll < 0.50) {
      // Zombie arm reaching from ground
      template = { type: 'zombie_arm', w: 8, h: 14, y: GROUND_Y, color: '#556644', jumpable: true, slidable: true, armPhase: 0 };
    } else if (roll < 0.62) {
      // Car (original)
      template = { type: 'car', w: 30, h: 16, y: GROUND_Y, color: '#555', jumpable: true, slidable: false };
    } else if (roll < 0.74) {
      // Barrier (original)
      template = { type: 'barrier', w: 8, h: 24, y: GROUND_Y - 4, color: '#664422', jumpable: true, slidable: false };
    } else if (roll < 0.87) {
      // Wire (original)
      template = { type: 'wire', w: 40, h: 6, y: GROUND_Y - 14, color: '#888', jumpable: false, slidable: true };
    } else {
      // Debris (original)
      template = { type: 'debris', w: 20, h: 10, y: GROUND_Y, color: '#443322', jumpable: true, slidable: false };
    }

    this.obstacles.push({ ...template, x });
  }

  // ----------------------------------------------------------
  // POWER-UPS
  // ----------------------------------------------------------

  _spawnPowerup() {
    const roll = this.rand(0, 1);
    let type, color, label;
    if (roll < 0.4 && this.hasGun) {
      type = POWERUP_AMMO; color = '#ccaa44'; label = '+3 AMMO';
    } else if (roll < 0.7) {
      type = POWERUP_HEALTH; color = '#44cc44'; label = '+1 HP';
    } else {
      type = POWERUP_SPEED; color = '#4488ff'; label = 'SPEED!';
    }
    this.powerups.push({
      type, color, label,
      x: this.scrollX + GAME_WIDTH + this.rand(20, 60),
      y: GROUND_Y - 12 - this.rand(0, 8),
      w: 10, h: 10,
      bobPhase: this.rand(0, Math.PI * 2),
      collected: false,
    });
  }

  // ----------------------------------------------------------
  // SPEED LINES
  // ----------------------------------------------------------

  _updateSpeedLines(dt) {
    // Spawn new speed lines based on current speed
    const spawnRate = Math.max(0, (this.speed - 80) / 20);
    if (this.rand(0, 1) < spawnRate * dt * 10) {
      const side = this.rand(0, 1) < 0.5 ? 0 : 1; // left or right
      this.speedLines.push({
        x: side === 0 ? this.rand(0, 30) : this.rand(GAME_WIDTH - 30, GAME_WIDTH),
        y: this.rand(0, GROUND_Y),
        len: this.rand(15, 40),
        life: 0.3,
        maxLife: 0.3,
        alpha: this.rand(0.2, 0.5),
      });
    }
    // Update existing
    for (let i = this.speedLines.length - 1; i >= 0; i--) {
      const l = this.speedLines[i];
      l.life -= dt;
      l.y += this.speed * dt * 0.5;
      if (l.life <= 0) this.speedLines.splice(i, 1);
    }
  }

  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------

  update(dt) {
    // Juice: apply time scale (slowmo)
    dt *= getTimeScale();

    // Juice: update all juice systems
    updateJuice(dt);

    // Juice: skip game logic during hitstop
    if (isHitstopped()) return;

    this.timer += dt;

    // Speed boost timer
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= dt;
    }

    // Invincibility timer
    if (this.player.invincible > 0) {
      this.player.invincible -= dt;
    }

    // Scroll
    const speedMultiplier = this.speedBoostTimer > 0 ? 1.6 : 1.0;
    this.speed = (PLAYER_SPEED + this.timer * 2.5) * speedMultiplier;
    this.scrollX += this.speed * dt;

    // Zombie distance — gets closer over time
    this.zombieDistance = Math.max(10, 100 - this.timer * 2.5);

    // Speed lines
    this._updateSpeedLines(dt);

    // Heartbeat phase (when zombies close)
    if (this.zombieDistance < 30) {
      this.heartbeatPhase += dt * 8;
    } else {
      this.heartbeatPhase *= 0.9;
    }

    // Danger pulse
    this.dangerPulse = this.clamp(1 - this.zombieDistance / 60, 0, 1);

    // === JUMP ===
    if ((this.isKeyDown('Space') || this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW')) && this.player.grounded) {
      this.player.vy = JUMP_FORCE;
      this.player.grounded = false;
      // Dust on takeoff
      dustCloud(this.player.x + 6, GROUND_Y);
    }

    // === SHOOT ===
    if (this.hasGun && this.ammo > 0 && this.shotCooldown <= 0 &&
        (this.touch.active || this.isKeyPressed('KeyE') || this.isKeyPressed('KeyF'))) {
      this.ammo--;
      this.shotCooldown = 0.35;
      this.muzzleFlash = 0.15;
      this.zombieDistance += 30;
      this.zombieKills++;

      // Bullet tracer
      this.bullets.push({ x: this.player.x + 12, y: GROUND_Y - 10, life: 0.3 });

      // JUICE: gun feedback
      const gunTipX = this.player.x + this.player.w + 8;
      const gunTipY = this.player.y - this.player.h + 6;
      gunFire(gunTipX, gunTipY, -1); // fires left toward horde
      shellCasing(this.player.x + 6, gunTipY + 2, 1);

      // JUICE: zombie kill
      const killX = this.player.x - this.zombieDistance;
      zombieDeath(killX + 5, GROUND_Y - 10);
      slowmo(0.1, 0.25);
      floatingText(killX, GROUND_Y - 30, '+1 KILL', '#ff4444', 7);
      addCombo();

      // Kill a random horde zombie (respawns)
      const aliveZ = this.hordeZombies.filter(z => z.alive);
      if (aliveZ.length > 0) {
        const victim = aliveZ[this.randInt(0, aliveZ.length - 1)];
        victim.alive = false;
        // Respawn after delay
        setTimeout(() => {
          victim.alive = true;
          Object.assign(victim, this._makeHordeZombie(this.hordeZombies.indexOf(victim)));
        }, 2000);
      }
    }
    this.shotCooldown -= dt;
    this.muzzleFlash -= dt;

    // Update bullets
    for (const b of this.bullets) { b.x += 300 * dt; b.life -= dt; }
    this.bullets = this.bullets.filter(b => b.life > 0);

    // === SLIDE ===
    if ((this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS')) && this.player.grounded) {
      this.player.sliding = true;
      this.player.slideTimer = 0.4;
    }

    // === PHYSICS ===
    this.wasGrounded = this.player.grounded;
    if (!this.player.grounded) {
      this.player.vy += GRAVITY * dt;
      this.player.y += this.player.vy * dt;
      if (this.player.y >= GROUND_Y) {
        this.player.y = GROUND_Y;
        this.player.vy = 0;
        this.player.grounded = true;
        // JUICE: landing dust
        if (!this.wasGrounded) {
          dustCloud(this.player.x + 6, GROUND_Y);
        }
      }
    }

    // Slide timer
    if (this.player.sliding) {
      this.player.slideTimer -= dt;
      if (this.player.slideTimer <= 0) this.player.sliding = false;
    }

    // === OBSTACLE COLLISION ===
    const playerBox = this.player.sliding
      ? { x: this.player.x, y: GROUND_Y, w: this.player.w, h: 8 }
      : { x: this.player.x, y: this.player.y - this.player.h, w: this.player.w, h: this.player.h };

    for (const obs of this.obstacles) {
      const screenX = obs.x - this.scrollX;
      if (screenX < -50 || screenX > GAME_WIDTH + 50) continue;

      // Collapsing sign — telegraph and trigger
      if (obs.type === 'collapsing_sign' && !obs.fallen) {
        const dist = obs.x - this.scrollX - this.player.x;
        if (dist < obs.telegraphDist && dist > 0 && !obs.collapsing) {
          obs.collapsing = true;
          obs.collapseTimer = 0;
        }
        if (obs.collapsing) {
          obs.collapseTimer += dt;
          if (obs.collapseTimer > 0.6) {
            obs.fallen = true;
            // Dust on impact
            dustCloud(screenX + obs.w / 2, GROUND_Y);
            shake(2, 0.15);
          }
        }
        // Not collidable until fallen
        if (!obs.fallen) continue;
      }

      // Zombie arm — animate
      if (obs.type === 'zombie_arm') {
        obs.armPhase += dt * 4;
      }

      // Gap obstacle — only dangerous if on ground
      if (obs.isGap && this.player.y < GROUND_Y - 10) continue;

      const obsBox = { x: screenX, y: obs.y - obs.h, w: obs.w, h: obs.h };

      if (this.collides(playerBox, obsBox)) {
        if (obs.slidable && this.player.sliding) continue;
        if (obs.jumpable && this.player.y < GROUND_Y - 10) continue;

        // Already invincible? Skip
        if (this.player.invincible > 0) continue;

        // HIT!
        this.hits++;
        this.player.invincible = 0.8; // brief i-frames
        obs.x = -100;
        this.speed *= 0.7;

        // JUICE: hit feedback
        playerHit(this.player.x + 6, this.player.y - 10);
        flash('#ff0000', 0.12);
        dustCloud(this.player.x + 6, GROUND_Y);
        floatingText(this.player.x, this.player.y - 30, 'HIT!', '#ff3333', 8);

        if (this.hits >= this.maxHits) {
          // Death explosion
          explosion(this.player.x + 6, this.player.y - 10);
          flash('#ff0000', 0.3);
          this.complete(false, Math.floor(this.scrollX / 10), { caught: true });
          return;
        }
      }
    }

    // === BURNING CAR PARTICLES ===
    for (const obs of this.obstacles) {
      if (obs.burning) {
        const screenX = obs.x - this.scrollX;
        if (screenX > -50 && screenX < GAME_WIDTH + 50) {
          if (this.rand(0, 1) < dt * 15) {
            spawnParticles(screenX + this.rand(4, obs.w - 4), obs.y - obs.h, 1, {
              color: this.rand(0, 1) < 0.5 ? '#ff6622' : '#ffaa33',
              speed: 15, spread: 1.0, angle: -Math.PI / 2, size: 2, life: 0.4, gravity: -40, friction: 0.95,
            });
          }
          if (this.rand(0, 1) < dt * 5) {
            spawnParticles(screenX + this.rand(4, obs.w - 4), obs.y - obs.h - 4, 1, {
              color: '#333', speed: 8, spread: 0.8, angle: -Math.PI / 2, size: 3, life: 0.8, gravity: -15, friction: 0.92,
            });
          }
        }
      }
    }

    // === SPAWN OBSTACLES ===
    const furthestObs = this.obstacles.reduce((max, o) => Math.max(max, o.x), 0);
    if (furthestObs - this.scrollX < GAME_WIDTH + 100) {
      this.spawnObstacle(furthestObs + 60 + this.rand(20, 60));
    }

    // === CRAWLER ZOMBIES ===
    if (this.timer >= this.nextCrawlerTime) {
      this.nextCrawlerTime = this.timer + 4 + this.rand(0, 6);
      this.crawlers.push({
        x: this.scrollX + GAME_WIDTH + this.rand(40, 100),
        emergeTimer: 0,
        emerged: false,
        groundPhase: 0,
        alive: true,
      });
    }

    for (let i = this.crawlers.length - 1; i >= 0; i--) {
      const c = this.crawlers[i];
      const screenX = c.x - this.scrollX;

      if (screenX < -30) {
        this.crawlers.splice(i, 1);
        continue;
      }

      // Emerge when player gets close
      if (!c.emerged && screenX < this.player.x + 80) {
        c.emerged = true;
        dustCloud(screenX, GROUND_Y);
        shake(1, 0.1);
      }

      if (c.emerged) {
        c.emergeTimer += dt;
        c.groundPhase += dt * 3;
      }

      // Collision with emerged crawler
      if (c.emerged && c.alive && c.emergeTimer > 0.3) {
        const cBox = { x: screenX - 4, y: GROUND_Y - 12, w: 10, h: 12 };
        if (this.collides(playerBox, cBox) && this.player.invincible <= 0) {
          this.hits++;
          this.player.invincible = 0.8;
          c.alive = false;
          playerHit(this.player.x + 6, this.player.y - 10);
          flash('#ff0000', 0.12);
          floatingText(screenX, GROUND_Y - 30, 'GRABBED!', '#ff5555', 7);

          if (this.hits >= this.maxHits) {
            explosion(this.player.x + 6, this.player.y - 10);
            this.complete(false, Math.floor(this.scrollX / 10), { caught: true });
            return;
          }
        }
      }
    }

    // === POWER-UPS ===
    if (this.timer >= this.nextPowerupTime) {
      this.nextPowerupTime = this.timer + 6 + this.rand(0, 5);
      this._spawnPowerup();
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i];
      const screenX = pu.x - this.scrollX;
      pu.bobPhase += dt * 4;

      if (screenX < -20) {
        this.powerups.splice(i, 1);
        continue;
      }

      if (pu.collected) continue;

      const puBox = { x: screenX, y: pu.y - 5 + Math.sin(pu.bobPhase) * 3, w: pu.w, h: pu.h };
      if (this.collides(playerBox, puBox)) {
        pu.collected = true;
        lootPickup(screenX + 5, pu.y);
        floatingText(screenX, pu.y - 16, pu.label, pu.color, 7);

        switch (pu.type) {
          case POWERUP_AMMO:
            this.ammo += 3;
            this.hasGun = true;
            break;
          case POWERUP_HEALTH:
            this.hits = Math.max(0, this.hits - 1);
            break;
          case POWERUP_SPEED:
            this.speedBoostTimer = 3;
            flash('#4488ff', 0.1);
            break;
        }
      }
    }

    // === SPRINTER WAVE — occasional rush ===
    if (this.timer > 10 && this.rand(0, 1) < dt * 0.1) {
      // Sprinters push closer briefly
      const hasActiveSprinter = this.hordeZombies.some(z => z.type === ZOMBIE_SPRINTER && z.alive);
      if (hasActiveSprinter) {
        this.zombieDistance = Math.max(10, this.zombieDistance - 5);
        if (this.zombieDistance < 25) {
          shake(1, 0.05);
        }
      }
    }

    // === BLOATER PROXIMITY — massive damage if they reach you ===
    if (this.zombieDistance < 15) {
      const hasBloater = this.hordeZombies.some(z => z.type === ZOMBIE_BLOATER && z.alive);
      if (hasBloater && this.player.invincible <= 0 && this.rand(0, 1) < dt * 2) {
        this.hits += 2; // Massive damage
        this.player.invincible = 1.0;
        playerHit(this.player.x, this.player.y - 10);
        flash('#33ff33', 0.15);
        shake(6, 0.3);
        floatingText(this.player.x, this.player.y - 30, 'BLOATER!', '#44ff44', 9);
        explosion(this.player.x - 20, GROUND_Y - 10);

        if (this.hits >= this.maxHits) {
          this.complete(false, Math.floor(this.scrollX / 10), { caught: true });
          return;
        }
      }
    }

    // === WIN CONDITION ===
    if (this.timer >= this.maxTime) {
      this.complete(true, Math.floor(this.scrollX / 10), {
        ammoUsed: (this.config?.ammo || 0) - this.ammo,
        zombieKills: this.zombieKills,
      });
    }
  }

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  render(ctx) {
    // JUICE: apply screen shake offset
    const shakeOff = getShakeOffset();
    ctx.save();
    ctx.translate(shakeOff.x, shakeOff.y);

    // === SKY ===
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(-4, -4, GAME_WIDTH + 8, GAME_HEIGHT + 8);

    // === DISTANT BUILDINGS (parallax) ===
    ctx.fillStyle = '#111118';
    for (let i = 0; i < 12; i++) {
      const bx = (i * 45 - (this.scrollX * 0.2) % 540);
      const bh = 30 + (i * 17) % 40;
      ctx.fillRect(bx, GROUND_Y - bh, 22, bh);
      // Window lights
      ctx.fillStyle = '#1a1a22';
      for (let wy = GROUND_Y - bh + 4; wy < GROUND_Y - 4; wy += 8) {
        ctx.fillRect(bx + 3, wy, 3, 3);
        ctx.fillRect(bx + 12, wy, 3, 3);
      }
      ctx.fillStyle = '#111118';
    }

    // === GROUND ===
    ctx.fillStyle = '#222';
    ctx.fillRect(-4, GROUND_Y, GAME_WIDTH + 8, GAME_HEIGHT - GROUND_Y + 4);

    // Road lines (scrolling)
    ctx.fillStyle = '#333';
    for (let x = -(this.scrollX % 30); x < GAME_WIDTH; x += 30) {
      ctx.fillRect(x, GROUND_Y + 8, 15, 2);
    }

    // === SPEED LINES ===
    for (const l of this.speedLines) {
      const alpha = (l.life / l.maxLife) * l.alpha;
      ctx.strokeStyle = `rgba(200, 200, 220, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x + (l.x < GAME_WIDTH / 2 ? -1 : 1) * 4, l.y + l.len);
      ctx.stroke();
    }

    // === OBSTACLES ===
    for (const obs of this.obstacles) {
      const screenX = obs.x - this.scrollX;
      if (screenX < -50 || screenX > GAME_WIDTH + 50) continue;

      if (obs.type === 'burning_car') {
        // Car body
        ctx.fillStyle = '#553322';
        ctx.fillRect(Math.round(screenX), obs.y - obs.h, obs.w, obs.h);
        // Flames on top (animated)
        const flicker = Math.sin(this.timer * 12) * 2;
        ctx.fillStyle = '#ff6622';
        ctx.fillRect(Math.round(screenX) + 4, obs.y - obs.h - 6 + flicker, 6, 6);
        ctx.fillStyle = '#ffaa33';
        ctx.fillRect(Math.round(screenX) + 14, obs.y - obs.h - 4 + flicker * 0.7, 5, 4);
        ctx.fillStyle = '#ff4411';
        ctx.fillRect(Math.round(screenX) + 22, obs.y - obs.h - 5 - flicker, 4, 5);
      } else if (obs.type === 'collapsing_sign') {
        if (!obs.fallen) {
          // Standing sign — maybe shaking
          const wobble = obs.collapsing ? Math.sin(obs.collapseTimer * 30) * 2 : 0;
          ctx.fillStyle = obs.collapsing ? '#aa8833' : obs.color;
          ctx.fillRect(Math.round(screenX) + wobble, obs.y - obs.h, obs.w, obs.h);
          // Warning indicator
          if (obs.collapsing) {
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(Math.round(screenX) + 2, obs.y - obs.h - 4, 6, 3);
          }
        } else {
          // Fallen — horizontal obstacle on ground
          ctx.fillStyle = '#555533';
          ctx.fillRect(Math.round(screenX) - 6, GROUND_Y - 6, obs.h, 6);
        }
      } else if (obs.type === 'gap') {
        // Dark gap in the road
        ctx.fillStyle = '#000';
        ctx.fillRect(Math.round(screenX), GROUND_Y, obs.w, 40);
        // Jagged edges
        ctx.fillStyle = '#222';
        ctx.fillRect(Math.round(screenX) - 2, GROUND_Y, 3, 5);
        ctx.fillRect(Math.round(screenX) + obs.w - 1, GROUND_Y, 3, 5);
      } else if (obs.type === 'zombie_arm') {
        // Arm reaching up from ground
        const reach = Math.sin(obs.armPhase) * 4;
        ctx.fillStyle = '#556644';
        ctx.fillRect(Math.round(screenX), obs.y - obs.h - reach, obs.w, obs.h + reach);
        // Fingers
        ctx.fillStyle = '#667755';
        ctx.fillRect(Math.round(screenX) - 1, obs.y - obs.h - reach - 3, 3, 4);
        ctx.fillRect(Math.round(screenX) + 3, obs.y - obs.h - reach - 4, 3, 5);
        ctx.fillRect(Math.round(screenX) + 6, obs.y - obs.h - reach - 2, 3, 3);
      } else {
        // Default obstacle render
        ctx.fillStyle = obs.color;
        ctx.fillRect(Math.round(screenX), obs.y - obs.h, obs.w, obs.h);
      }
    }

    // === CRAWLER ZOMBIES ===
    for (const c of this.crawlers) {
      if (!c.alive) continue;
      const screenX = c.x - this.scrollX;
      if (screenX < -20 || screenX > GAME_WIDTH + 20) continue;

      if (!c.emerged) {
        // Rumbling ground hint
        const rumble = Math.sin(this.timer * 15 + c.x) * 1;
        ctx.fillStyle = '#443322';
        ctx.fillRect(Math.round(screenX) - 3, GROUND_Y - 2 + rumble, 8, 2);
      } else {
        // Emerging zombie
        const emergeH = Math.min(12, c.emergeTimer * 20);
        ctx.fillStyle = '#556644';
        ctx.fillRect(Math.round(screenX) - 4, GROUND_Y - emergeH, 10, emergeH);
        // Head
        if (emergeH > 6) {
          ctx.fillStyle = '#667755';
          ctx.fillRect(Math.round(screenX) - 2, GROUND_Y - emergeH - 5, 7, 6);
          // Eyes
          ctx.fillStyle = '#cc3333';
          ctx.fillRect(Math.round(screenX), GROUND_Y - emergeH - 3, 2, 2);
        }
      }
    }

    // === POWER-UPS ===
    for (const pu of this.powerups) {
      if (pu.collected) continue;
      const screenX = pu.x - this.scrollX;
      if (screenX < -20 || screenX > GAME_WIDTH + 20) continue;

      const bob = Math.sin(pu.bobPhase) * 3;
      const py = pu.y + bob;

      // Glow behind
      ctx.fillStyle = pu.color;
      ctx.globalAlpha = 0.3 + Math.sin(pu.bobPhase * 2) * 0.1;
      ctx.fillRect(Math.round(screenX) - 2, Math.round(py) - 2, pu.w + 4, pu.h + 4);
      ctx.globalAlpha = 1;

      // Power-up box
      ctx.fillStyle = pu.color;
      ctx.fillRect(Math.round(screenX), Math.round(py), pu.w, pu.h);

      // Icon inside
      ctx.fillStyle = '#fff';
      if (pu.type === POWERUP_AMMO) {
        // Bullet shape
        ctx.fillRect(Math.round(screenX) + 3, Math.round(py) + 2, 4, 6);
      } else if (pu.type === POWERUP_HEALTH) {
        // Cross
        ctx.fillRect(Math.round(screenX) + 4, Math.round(py) + 2, 2, 6);
        ctx.fillRect(Math.round(screenX) + 2, Math.round(py) + 4, 6, 2);
      } else {
        // Lightning bolt
        ctx.fillRect(Math.round(screenX) + 4, Math.round(py) + 1, 3, 3);
        ctx.fillRect(Math.round(screenX) + 3, Math.round(py) + 4, 3, 3);
        ctx.fillRect(Math.round(screenX) + 5, Math.round(py) + 6, 2, 3);
      }
    }

    // === PLAYER ===
    const invFlicker = this.player.invincible > 0 && Math.sin(this.timer * 30) > 0;
    if (!invFlicker) {
      const py = this.player.sliding ? GROUND_Y - 8 : this.player.y - this.player.h;
      const pw = this.player.sliding ? 18 : this.player.w;
      const ph = this.player.sliding ? 8 : this.player.h;
      ctx.fillStyle = this.speedBoostTimer > 0 ? '#66ccff' : this.player.color;
      ctx.fillRect(Math.round(this.player.x), Math.round(py), pw, ph);

      // Player head
      if (!this.player.sliding) {
        ctx.fillStyle = '#ddb88c';
        ctx.fillRect(Math.round(this.player.x) + 2, Math.round(py) - 6, 8, 8);
      }

      // GUN in player's hand
      if (this.hasGun) {
        const gunX = Math.round(this.player.x) + pw;
        const gunY = Math.round(py) + 6;
        ctx.fillStyle = '#555';
        ctx.fillRect(gunX, gunY, 8, 3);
        ctx.fillStyle = '#444';
        ctx.fillRect(gunX + 6, gunY - 1, 3, 5);

        // Muzzle flash (legacy visual — juice particles handle the feel)
        if (this.muzzleFlash > 0) {
          ctx.fillStyle = `rgba(255, 200, 50, ${this.muzzleFlash * 6})`;
          ctx.fillRect(gunX + 8, gunY - 3, 6, 8);
          ctx.fillStyle = `rgba(255, 255, 200, ${this.muzzleFlash * 4})`;
          ctx.fillRect(gunX + 10, gunY - 1, 4, 4);
        }
      }
    }

    // === BULLET TRACERS ===
    for (const b of this.bullets) {
      const alpha = b.life * 3;
      ctx.fillStyle = `rgba(255, 230, 100, ${alpha})`;
      ctx.fillRect(Math.round(b.x), Math.round(b.y), 12, 2);
      ctx.fillStyle = `rgba(255, 150, 50, ${alpha * 0.5})`;
      ctx.fillRect(Math.round(b.x) - 6, Math.round(b.y), 6, 2);
    }

    // === ZOMBIE HORDE ===
    const hordeBaseX = this.player.x - this.zombieDistance;
    for (const z of this.hordeZombies) {
      if (!z.alive) continue;
      const zx = hordeBaseX + z.offsetX + Math.sin(this.timer * 5 + z.bobPhase) * 3;
      const zy = GROUND_Y - z.h + Math.abs(Math.sin(this.timer * 8 + z.bobPhase)) * 4;

      // Body
      ctx.fillStyle = z.color;
      ctx.fillRect(Math.round(zx), Math.round(zy), z.w, z.h);

      // Head
      ctx.fillStyle = z.headColor;
      const headSize = z.type === ZOMBIE_BLOATER ? 9 : 7;
      ctx.fillRect(Math.round(zx) + 1, Math.round(zy) - headSize + 1, headSize, headSize);

      // Sprinter eyes glow red
      if (z.type === ZOMBIE_SPRINTER) {
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(Math.round(zx) + 2, Math.round(zy) - 4, 2, 2);
        ctx.fillRect(Math.round(zx) + 5, Math.round(zy) - 4, 2, 2);
      }

      // Bloater drip
      if (z.type === ZOMBIE_BLOATER && this.rand(0, 1) < 0.02) {
        spawnParticles(zx + z.w / 2, zy + z.h, 1, {
          color: '#44aa44', speed: 5, spread: 0.5, angle: Math.PI / 2,
          size: 2, life: 0.5, gravity: 80, friction: 0.99,
        });
      }
    }

    // === DANGER PULSE — red edges when zombies close ===
    if (this.dangerPulse > 0) {
      const pulseAlpha = this.dangerPulse * 0.4 * (0.5 + Math.sin(this.timer * 6) * 0.5);
      // Left edge gradient
      const grad = ctx.createLinearGradient(0, 0, 40, 0);
      grad.addColorStop(0, `rgba(200, 0, 0, ${pulseAlpha})`);
      grad.addColorStop(1, 'rgba(200, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 40, GAME_HEIGHT);
    }

    // === HEARTBEAT OVERLAY ===
    if (this.heartbeatPhase > 0) {
      const beat = Math.sin(this.heartbeatPhase) * 0.5 + 0.5;
      const hbAlpha = beat * 0.15;
      ctx.fillStyle = `rgba(180, 0, 0, ${hbAlpha})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // === SPEED BOOST OVERLAY ===
    if (this.speedBoostTimer > 0) {
      const boostAlpha = Math.min(0.1, this.speedBoostTimer * 0.05);
      ctx.fillStyle = `rgba(50, 100, 255, ${boostAlpha})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    ctx.restore(); // undo shake translate

    // === JUICE RENDER LAYER (particles, floating text, flash) ===
    renderJuice(ctx, GAME_WIDTH, GAME_HEIGHT);

    // === COMBO COUNTER (top-right) ===
    renderCombo(ctx, GAME_WIDTH - 90, 50);

    // === HUD ===

    // Hits indicator
    for (let i = 0; i < this.maxHits; i++) {
      ctx.fillStyle = i < this.hits ? '#cc3333' : '#333';
      ctx.fillRect(GAME_WIDTH - 40 + i * 12, 8, 8, 8);
      if (i >= this.hits) {
        // Heart shape outline for remaining HP
        ctx.fillStyle = '#555';
        ctx.fillRect(GAME_WIDTH - 40 + i * 12 + 1, 7, 2, 2);
        ctx.fillRect(GAME_WIDTH - 40 + i * 12 + 5, 7, 2, 2);
      }
    }

    // Distance
    this.drawText(ctx, `${Math.floor(this.scrollX / 10)}m`, 8, 14, '#aaa', 8);

    // Ammo display
    if (this.hasGun) {
      this.drawText(ctx, `AMMO: ${this.ammo}`, 8, 26, this.ammo > 0 ? '#ccaa44' : '#cc3333', 7);
      for (let i = 0; i < Math.min(10, this.ammo); i++) {
        ctx.fillStyle = '#ccaa44';
        ctx.fillRect(8 + i * 7, 30, 4, 8);
      }
    }

    // Zombie kill count
    if (this.zombieKills > 0) {
      this.drawText(ctx, `KILLS: ${this.zombieKills}`, GAME_WIDTH - 80, 26, '#aa4444', 7);
    }

    // Speed boost indicator
    if (this.speedBoostTimer > 0) {
      this.drawText(ctx, `BOOST ${Math.ceil(this.speedBoostTimer)}s`, 8, this.hasGun ? 44 : 26, '#4488ff', 6);
    }

    // Controls hint
    if (this.timer < 4) {
      const gunHint = this.hasGun ? '  E/F: Shoot' : '';
      this.drawText(ctx, `UP/W: Jump  DOWN/S: Slide${gunHint}`, 40, GAME_HEIGHT - 10, '#555', 5);
    }
  }
}
