// ============================================================
// MASEDOG: Dead North — Scavenge Mini-Game (JUICED)
// Top-down building exploration with FOG OF WAR.
// Search containers for loot. Noise attracts zombies.
// You can't see what's in the next room until you step in.
// ============================================================

import { MinigameBase, GAME_WIDTH, GAME_HEIGHT } from './minigame-base.js';
import {
  updateJuice, renderJuice, resetJuice,
  isHitstopped, getTimeScale, getShakeOffset,
  shake, flash, slowmo, hitstop,
  gunFire, zombieDeath, playerHit, lootPickup, sparks, dustCloud,
  floatingText, addCombo, renderCombo,
  spawnParticles, bloodSplatter,
} from './juice.js';

const TILE = 16;
const COLS = 20; // 320/16
const ROWS = 11; // 176/16 (leaving space for HUD)

// Fog of war settings
const FOG_RADIUS = 4; // tiles the player can see around them
const FOG_VISITED_ALPHA = 0.55; // how dark visited-but-out-of-sight tiles are

// Zombie types
const ZOMBIE_TYPES = {
  shambler: { color: '#772222', glowColor: 'rgba(180,40,40,0.35)', speed: [0.5, 0.8], name: 'shambler' },
  crawler:  { color: '#665533', glowColor: 'rgba(160,120,60,0.3)',  speed: [0.7, 1.0], name: 'crawler' },
  bloater:  { color: '#336633', glowColor: 'rgba(60,180,60,0.3)',   speed: [0.8, 1.2], name: 'bloater' },
};
const ZOMBIE_TYPE_KEYS = Object.keys(ZOMBIE_TYPES);

export class Scavenge extends MinigameBase {
  constructor() {
    super();
    this.maxTime = 45;
  }

  init() {
    super.init();

    this.player = { x: 2, y: 5, w: 1, h: 1, moveTimer: 0 };
    this.moveDelay = 0.12; // seconds between moves

    // Generate building layout
    this.map = this.generateMap();
    this.containers = this.generateContainers();
    this.loot = [];
    this.noise = 0; // 0-100
    this.maxNoise = 100;
    this.zombies = [];
    this.zombieSpawnTimer = 0;
    this.exit = { x: 1, y: 5 }; // Exit door

    // GUN
    this.ammo = this.config?.ammo || 0;
    this.hasGun = this.ammo > 0;
    this.shotFlash = 0;
    this.zombieKills = 0;
    this.searching = false;
    this.searchProgress = 0;
    this.searchTarget = null;
    this.escaped = false;

    // Fog of war — track which tiles have been visited
    this.visited = [];
    for (let y = 0; y < ROWS; y++) {
      this.visited[y] = [];
      for (let x = 0; x < COLS; x++) {
        this.visited[y][x] = false;
      }
    }
    // Mark starting area as visited
    this._revealAroundPlayer();

    // Noise rings (visual expanding circles)
    this.noiseRings = [];

    // Environmental details — blood stains & bodies (random, visual only)
    this.bloodStains = this._generateBloodStains();
    this.bodies = this._generateBodies();

    // Flickering lights — some tiles pulse
    this.flickerTiles = this._generateFlickerTiles();
    this.flickerTimer = 0;

    // Dying zombies (death animation)
    this.dyingZombies = [];

    // Create offscreen canvas for fog of war
    this.fogCanvas = document.createElement('canvas');
    this.fogCanvas.width = GAME_WIDTH;
    this.fogCanvas.height = GAME_HEIGHT;
    this.fogCtx = this.fogCanvas.getContext('2d');

    // Reset juice systems
    resetJuice();
  }

  // ========== MAP GENERATION ==========

  generateMap() {
    const map = [];
    for (let y = 0; y < ROWS; y++) {
      map[y] = [];
      for (let x = 0; x < COLS; x++) {
        if (y === 0 || y === ROWS - 1 || x === 0 || x === COLS - 1) {
          map[y][x] = 1; // Wall
        } else {
          map[y][x] = 0; // Floor
        }
      }
    }

    // Internal walls creating rooms
    for (let y = 1; y < ROWS - 1; y++) { map[y][7] = 1; map[y][13] = 1; }
    // Doorways
    map[3][7] = 0; map[7][7] = 0;
    map[4][13] = 0; map[8][13] = 0;

    // Exit door
    map[5][0] = 2; // Exit marker

    return map;
  }

  generateContainers() {
    const containers = [];
    const positions = [
      { x: 3, y: 2 }, { x: 5, y: 2 }, { x: 3, y: 8 }, { x: 5, y: 8 },
      { x: 9, y: 2 }, { x: 11, y: 2 }, { x: 9, y: 8 }, { x: 11, y: 6 },
      { x: 15, y: 2 }, { x: 17, y: 3 }, { x: 15, y: 7 }, { x: 17, y: 8 },
    ];

    const lootTypes = ['food', 'water', 'medicine', 'ammo', 'scrap'];

    for (const pos of positions) {
      containers.push({
        ...pos,
        searched: false,
        lootType: lootTypes[this.randInt(0, lootTypes.length - 1)],
        lootAmount: this.randInt(1, 3),
        noiseLevel: this.randInt(8, 20),
      });
    }
    return containers;
  }

  // ========== ENVIRONMENTAL GENERATION ==========

  _generateBloodStains() {
    const stains = [];
    for (let i = 0; i < 15; i++) {
      const x = this.randInt(1, COLS - 2);
      const y = this.randInt(1, ROWS - 2);
      if (this.map[y][x] === 0) {
        stains.push({
          x, y,
          size: this.randInt(2, 6),
          opacity: 0.15 + Math.random() * 0.25,
        });
      }
    }
    return stains;
  }

  _generateBodies() {
    const bodies = [];
    // Place 3-5 bodies in random floor tiles
    const count = this.randInt(3, 5);
    for (let i = 0; i < count; i++) {
      const x = this.randInt(2, COLS - 3);
      const y = this.randInt(2, ROWS - 3);
      if (this.map[y][x] === 0) {
        bodies.push({
          x, y,
          rotation: Math.random() * Math.PI * 2,
          type: this.randInt(0, 2), // different body styles
        });
      }
    }
    return bodies;
  }

  _generateFlickerTiles() {
    const tiles = [];
    for (let i = 0; i < 8; i++) {
      const x = this.randInt(1, COLS - 2);
      const y = this.randInt(1, ROWS - 2);
      if (this.map[y][x] === 0) {
        tiles.push({ x, y, phase: Math.random() * Math.PI * 2, speed: 1.5 + Math.random() * 3 });
      }
    }
    return tiles;
  }

  // ========== FOG OF WAR ==========

  _revealAroundPlayer() {
    const px = this.player.x;
    const py = this.player.y;
    const r = FOG_RADIUS;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const tx = px + dx;
        const ty = py + dy;
        if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= r) {
            this.visited[ty][tx] = true;
          }
        }
      }
    }
  }

  _isTileVisible(tx, ty) {
    const dx = tx - this.player.x;
    const dy = ty - this.player.y;
    return Math.sqrt(dx * dx + dy * dy) <= FOG_RADIUS;
  }

  // ========== NOISE RINGS ==========

  _spawnNoiseRing(worldX, worldY, intensity) {
    this.noiseRings.push({
      x: worldX,
      y: worldY,
      radius: 4,
      maxRadius: intensity * 1.5,
      life: 1.0,
      intensity,
    });
  }

  // ========== UPDATE ==========

  update(dt) {
    // Update juice first (always, even during hitstop)
    updateJuice(dt);

    // Hitstop — freeze game logic
    if (isHitstopped()) return;

    // Slowmo — scale delta time
    const timeScale = getTimeScale();
    dt *= timeScale;

    this.timer += dt;
    this.flickerTimer += dt;

    // Update noise rings
    for (let i = this.noiseRings.length - 1; i >= 0; i--) {
      const ring = this.noiseRings[i];
      ring.radius += 60 * dt;
      ring.life -= dt * 1.5;
      if (ring.life <= 0) this.noiseRings.splice(i, 1);
    }

    // Update dying zombies
    for (let i = this.dyingZombies.length - 1; i >= 0; i--) {
      const dz = this.dyingZombies[i];
      dz.timer -= dt;
      if (dz.timer <= 0) this.dyingZombies.splice(i, 1);
    }

    // Player movement (grid-based)
    this.player.moveTimer -= dt;
    if (this.player.moveTimer <= 0 && !this.searching) {
      let dx = 0, dy = 0;
      if (this.isKeyDown('ArrowLeft') || this.isKeyDown('KeyA')) dx = -1;
      if (this.isKeyDown('ArrowRight') || this.isKeyDown('KeyD')) dx = 1;
      if (this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW')) dy = -1;
      if (this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS')) dy = 1;

      if (dx !== 0 || dy !== 0) {
        const nx = this.player.x + dx;
        const ny = this.player.y + dy;
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && this.map[ny][nx] !== 1) {
          this.player.x = nx;
          this.player.y = ny;
          this.player.moveTimer = this.moveDelay;
          this.noise = Math.min(this.maxNoise, this.noise + 2);

          // Reveal fog around new position
          this._revealAroundPlayer();
        }

        // Check exit
        if (this.map[ny]?.[nx] === 2) {
          this.escaped = true;
          this.complete(true, this.loot.length * 10, { loot: this.loot });
          return;
        }
      }
    }

    // SHOOT — mouse click or E/F key
    if (this.hasGun && this.ammo > 0 && this.shotFlash <= 0 &&
        (this.touch.active || this.isKeyPressed('KeyE') || this.isKeyPressed('KeyF'))) {
      let nearest = null;
      let nearestDist = Infinity;
      for (const z of this.zombies) {
        const dist = Math.abs(z.x - this.player.x) + Math.abs(z.y - this.player.y);
        if (dist < nearestDist) { nearestDist = dist; nearest = z; }
      }
      if (nearest && nearestDist <= 5) {
        this.ammo--;
        this.shotFlash = 0.3;
        this.noise = Math.min(this.maxNoise, this.noise + 25); // Guns are LOUD

        // Juice: gun fire effects
        const px = this.player.x * TILE + TILE / 2;
        const py = this.player.y * TILE + TILE / 2;
        const dirX = Math.sign(nearest.x - this.player.x) || 1;
        gunFire(px, py, dirX);

        // Noise ring from gunshot
        this._spawnNoiseRing(px, py, 40);

        // Kill the zombie
        const zx = nearest.x * TILE + TILE / 2;
        const zy = nearest.y * TILE + TILE / 2;

        // Death animation: add to dying list
        this.dyingZombies.push({
          x: nearest.x, y: nearest.y,
          timer: 0.3,
          maxTimer: 0.3,
          type: nearest.type,
        });

        // Juice: zombie death effects
        zombieDeath(zx, zy);
        slowmo(0.12, 0.2);
        floatingText(zx - 4, zy - 8, '+1', '#ff4444', 7);
        addCombo();

        this.zombies = this.zombies.filter(z => z !== nearest);
        this.zombieKills++;
      }
    }
    this.shotFlash -= dt;

    // Auto-search containers when standing on/next to them
    if (!this.searching) {
      const container = this.containers.find(c =>
        !c.searched && Math.abs(c.x - this.player.x) <= 1 && Math.abs(c.y - this.player.y) <= 1
      );
      if (container) {
        this.searching = true;
        this.searchProgress = 0;
        this.searchTarget = container;
      }
    }

    // ALSO allow Space/Enter to search (legacy)
    if (this.isKeyPressed('Space') || this.isKeyPressed('Enter')) {
      if (!this.searching) {
        const container = this.containers.find(c =>
          !c.searched && Math.abs(c.x - this.player.x) <= 1 && Math.abs(c.y - this.player.y) <= 1
        );
        if (container) {
          this.searching = true;
          this.searchProgress = 0;
          this.searchTarget = container;
        }
      }
    }

    // Search progress
    if (this.searching && this.searchTarget) {
      this.searchProgress += dt;
      this.noise = Math.min(this.maxNoise, this.noise + this.searchTarget.noiseLevel * dt);

      // Small noise ring from searching
      if (Math.random() < dt * 3) {
        const sx = this.searchTarget.x * TILE + TILE / 2;
        const sy = this.searchTarget.y * TILE + TILE / 2;
        this._spawnNoiseRing(sx, sy, 10);
      }

      if (this.searchProgress >= 1.5) {
        this.searchTarget.searched = true;
        this.loot.push({ type: this.searchTarget.lootType, amount: this.searchTarget.lootAmount });
        this.score += 10;

        // Juice: loot found!
        const lx = this.searchTarget.x * TILE + TILE / 2;
        const ly = this.searchTarget.y * TILE + TILE / 2;
        lootPickup(lx, ly);
        const label = '+' + this.searchTarget.lootType.toUpperCase();
        floatingText(lx - 12, ly - 10, label, '#44dd44', 6);

        this.searching = false;
        this.searchTarget = null;
      }
    }

    // Cancel search on movement
    if (this.searching && (this.isKeyDown('ArrowLeft') || this.isKeyDown('ArrowRight') ||
        this.isKeyDown('ArrowUp') || this.isKeyDown('ArrowDown') ||
        this.isKeyDown('KeyA') || this.isKeyDown('KeyD') ||
        this.isKeyDown('KeyW') || this.isKeyDown('KeyS'))) {
      this.searching = false;
      this.searchTarget = null;
    }

    // Noise decay
    this.noise = Math.max(0, this.noise - 3 * dt);

    // Zombie spawning based on noise
    this.zombieSpawnTimer += dt;
    if (this.noise > 40 && this.zombieSpawnTimer > 3) {
      this.spawnZombie();
      this.zombieSpawnTimer = 0;
    }
    if (this.noise > 70 && this.zombieSpawnTimer > 1.5) {
      this.spawnZombie();
      this.zombieSpawnTimer = 0;
    }

    // Zombie movement — respects walls, uses doors
    for (const z of this.zombies) {
      z.moveTimer -= dt;

      // Zombies react to noise — turn toward noise source
      if (this.noiseRings.length > 0 && Math.random() < dt * 2) {
        const ring = this.noiseRings[this.noiseRings.length - 1];
        z.alertX = ring.x / TILE;
        z.alertY = ring.y / TILE;
        z.alertTimer = 1.5;
      }
      if (z.alertTimer > 0) z.alertTimer -= dt;

      if (z.moveTimer <= 0) {
        // Target: player if close, or noise alert, or wander toward player
        let targetX = this.player.x;
        let targetY = this.player.y;
        if (z.alertTimer > 0 && z.alertX !== undefined) {
          targetX = z.alertX;
          targetY = z.alertY;
        }

        const dx = Math.sign(targetX - z.x);
        const dy = Math.sign(targetY - z.y);

        const canWalk = (x, y) => {
          if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
          return this.map[y][x] !== 1;
        };

        let moved = false;
        if (dx !== 0 && dy !== 0 && canWalk(z.x + dx, z.y + dy)) {
          z.x += dx; z.y += dy; moved = true;
        } else if (dx !== 0 && canWalk(z.x + dx, z.y)) {
          z.x += dx; moved = true;
        } else if (dy !== 0 && canWalk(z.x, z.y + dy)) {
          z.y += dy; moved = true;
        } else if (!moved) {
          const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
          for (const [ddx, ddy] of dirs) {
            if (canWalk(z.x + ddx, z.y + ddy)) {
              z.x += ddx; z.y += ddy; moved = true; break;
            }
          }
        }

        const typeInfo = ZOMBIE_TYPES[z.type] || ZOMBIE_TYPES.shambler;
        z.moveTimer = typeInfo.speed[0] + Math.random() * (typeInfo.speed[1] - typeInfo.speed[0]);
      }

      // Collision with player
      if (z.x === this.player.x && z.y === this.player.y) {
        // Juice: getting caught
        const px = this.player.x * TILE + TILE / 2;
        const py = this.player.y * TILE + TILE / 2;
        playerHit(px, py);
        flash('#ff0000', 0.15);
        shake(6, 0.3);

        this.complete(false, this.loot.length * 10, { loot: this.loot, caught: true });
        return;
      }
    }

    // Time up
    if (this.timer >= this.maxTime) {
      this.complete(this.loot.length > 0, this.loot.length * 10, { loot: this.loot });
    }
  }

  spawnZombie() {
    const spawnPoints = [
      { x: 1, y: 5 },
      { x: 6, y: 3 },
      { x: 6, y: 7 },
      { x: 12, y: 4 },
      { x: 12, y: 8 },
    ];
    const sp = spawnPoints[this.randInt(0, spawnPoints.length - 1)];
    const typeKey = ZOMBIE_TYPE_KEYS[this.randInt(0, ZOMBIE_TYPE_KEYS.length - 1)];
    const typeInfo = ZOMBIE_TYPES[typeKey];
    this.zombies.push({
      x: sp.x, y: sp.y,
      moveTimer: 0,
      type: typeKey,
      alertX: undefined, alertY: undefined, alertTimer: 0,
    });
  }

  // ========== RENDER ==========

  render(ctx) {
    // Apply shake offset
    const shakeOff = getShakeOffset();
    ctx.save();
    ctx.translate(shakeOff.x, shakeOff.y);

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(-4, -4, GAME_WIDTH + 8, GAME_HEIGHT + 8);

    // --- Draw map tiles ---
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const tx = x * TILE;
        const ty = y * TILE;
        if (this.map[y][x] === 1) {
          ctx.fillStyle = '#333340';
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.fillStyle = '#2a2a35';
          ctx.fillRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
        } else if (this.map[y][x] === 2) {
          ctx.fillStyle = '#446644';
          ctx.fillRect(tx, ty, TILE, TILE);
        } else {
          ctx.fillStyle = '#1a1a22';
          ctx.fillRect(tx, ty, TILE, TILE);
        }
      }
    }

    // --- Flickering light effect ---
    for (const ft of this.flickerTiles) {
      const brightness = Math.sin(this.flickerTimer * ft.speed + ft.phase) * 0.5 + 0.5;
      const alpha = brightness * 0.12;
      ctx.fillStyle = `rgba(200, 180, 120, ${alpha})`;
      ctx.fillRect(ft.x * TILE, ft.y * TILE, TILE, TILE);
    }

    // --- Blood stains on floor ---
    for (const stain of this.bloodStains) {
      ctx.fillStyle = `rgba(80, 15, 15, ${stain.opacity})`;
      ctx.beginPath();
      ctx.arc(
        stain.x * TILE + TILE / 2,
        stain.y * TILE + TILE / 2,
        stain.size, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // --- Bodies on the ground ---
    for (const body of this.bodies) {
      const bx = body.x * TILE + TILE / 2;
      const by = body.y * TILE + TILE / 2;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(body.rotation);
      // Torso
      ctx.fillStyle = '#2a1a1a';
      ctx.fillRect(-5, -2, 10, 4);
      // Head
      ctx.fillStyle = '#3a2a2a';
      ctx.fillRect(-2, -4, 4, 3);
      // Blood pool under body
      ctx.fillStyle = 'rgba(60, 10, 10, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // --- Draw containers ---
    for (const c of this.containers) {
      ctx.fillStyle = c.searched ? '#222' : '#886633';
      ctx.fillRect(c.x * TILE + 2, c.y * TILE + 2, TILE - 4, TILE - 4);
      if (!c.searched) {
        ctx.fillStyle = '#aa8844';
        ctx.fillRect(c.x * TILE + 5, c.y * TILE + 3, TILE - 10, 2);
      }
    }

    // --- Draw dying zombies (death animation: flash white then fade) ---
    for (const dz of this.dyingZombies) {
      const progress = 1 - dz.timer / dz.maxTimer; // 0 -> 1
      const typeInfo = ZOMBIE_TYPES[dz.type] || ZOMBIE_TYPES.shambler;
      if (progress < 0.3) {
        // Flash white
        ctx.fillStyle = '#ffffff';
      } else {
        // Fade out
        const fadeAlpha = 1 - ((progress - 0.3) / 0.7);
        ctx.globalAlpha = Math.max(0, fadeAlpha);
        ctx.fillStyle = typeInfo.color;
      }
      ctx.fillRect(dz.x * TILE + 3, dz.y * TILE + 3, TILE - 6, TILE - 6);
      ctx.globalAlpha = 1;
    }

    // --- Draw living zombies with red glow ---
    for (const z of this.zombies) {
      const typeInfo = ZOMBIE_TYPES[z.type] || ZOMBIE_TYPES.shambler;
      const zx = z.x * TILE + TILE / 2;
      const zy = z.y * TILE + TILE / 2;

      // Glow — visible even slightly in fog (the red glow seeps through)
      const glowRadius = 12;
      const grd = ctx.createRadialGradient(zx, zy, 2, zx, zy, glowRadius);
      grd.addColorStop(0, typeInfo.glowColor);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(zx - glowRadius, zy - glowRadius, glowRadius * 2, glowRadius * 2);

      // Body
      ctx.fillStyle = typeInfo.color;
      ctx.fillRect(z.x * TILE + 3, z.y * TILE + 3, TILE - 6, TILE - 6);

      // Head — slightly different shade
      const headColor = z.type === 'bloater' ? '#445544' : z.type === 'crawler' ? '#554433' : '#554444';
      ctx.fillStyle = headColor;
      ctx.fillRect(z.x * TILE + 4, z.y * TILE + 2, TILE - 8, 4);

      // Alert indicator — zombie reacting to noise
      if (z.alertTimer > 0.5) {
        ctx.fillStyle = `rgba(255, 100, 100, ${Math.min(1, z.alertTimer - 0.5)})`;
        ctx.fillText('!', zx - 2, z.y * TILE - 1);
      }
    }

    // --- Shot flash overlay ---
    if (this.shotFlash > 0) {
      ctx.fillStyle = `rgba(255, 200, 50, ${this.shotFlash * 0.3})`;
      ctx.fillRect(-4, -4, GAME_WIDTH + 8, GAME_HEIGHT + 8);
    }

    // --- Draw player ---
    ctx.fillStyle = '#44aaff';
    ctx.fillRect(this.player.x * TILE + 2, this.player.y * TILE + 2, TILE - 4, TILE - 4);
    ctx.fillStyle = '#ddb88c';
    ctx.fillRect(this.player.x * TILE + 4, this.player.y * TILE + 1, TILE - 8, 5);

    // --- Noise rings (expanding circles) ---
    for (const ring of this.noiseRings) {
      const alpha = ring.life * 0.4 * (ring.intensity / 40);
      ctx.strokeStyle = `rgba(255, 120, 60, ${Math.min(0.5, alpha)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // --- Search progress bar ---
    if (this.searching && this.searchTarget) {
      const sx = this.searchTarget.x * TILE;
      const sy = this.searchTarget.y * TILE - 6;
      ctx.fillStyle = '#333';
      ctx.fillRect(sx, sy, TILE, 4);
      ctx.fillStyle = '#44aa44';
      ctx.fillRect(sx, sy, TILE * (this.searchProgress / 1.5), 4);
    }

    // ============================
    // FOG OF WAR — the big one
    // ============================
    this._renderFogOfWar(ctx);

    // --- Juice layer on top of fog ---
    renderJuice(ctx, GAME_WIDTH, GAME_HEIGHT);

    // --- Combo display ---
    renderCombo(ctx, GAME_WIDTH / 2 - 30, 20);

    // --- HUD elements (always on top of fog) ---

    // Noise meter
    ctx.fillStyle = '#222';
    ctx.fillRect(4, GAME_HEIGHT - 12, 60, 6);
    const noiseColor = this.noise > 70 ? '#cc3333' : this.noise > 40 ? '#ccaa22' : '#44aa44';
    ctx.fillStyle = noiseColor;
    ctx.fillRect(4, GAME_HEIGHT - 12, 60 * (this.noise / 100), 6);
    this.drawText(ctx, 'NOISE', 4, GAME_HEIGHT - 14, '#666', 5);

    // Loot count
    this.drawText(ctx, `Loot: ${this.loot.length}`, GAME_WIDTH - 60, GAME_HEIGHT - 6, '#aa8844', 6);

    // Ammo display
    if (this.hasGun) {
      this.drawText(ctx, `AMMO: ${this.ammo}`, GAME_WIDTH - 60, GAME_HEIGHT - 14, '#888', 5);
    }

    // Exit marker (only if visible)
    if (this._isTileVisible(0, 5) || this.visited[5][0]) {
      this.drawText(ctx, 'EXIT', 2, 5 * TILE + 10, '#446644', 5);
    }

    // Controls hint
    if (this.timer < 4) {
      const gunHint = this.hasGun ? '  CLICK:Shoot' : '';
      this.drawText(ctx, `WASD:Move  Walk near boxes to search${gunHint}`, 30, GAME_HEIGHT - 4, '#444', 5);
    }

    ctx.restore(); // undo shake translate
  }

  // ========== FOG OF WAR RENDERING ==========

  _renderFogOfWar(ctx) {
    const fogCtx = this.fogCtx;
    const px = this.player.x * TILE + TILE / 2;
    const py = this.player.y * TILE + TILE / 2;
    const viewRadius = FOG_RADIUS * TILE;

    // Step 1: Fill entire fog canvas with BLACK (fully hidden)
    fogCtx.globalCompositeOperation = 'source-over';
    fogCtx.fillStyle = '#000000';
    fogCtx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Step 2: Punch out visited tiles at dimmed alpha
    // (visited but out of sight = darkened)
    fogCtx.globalCompositeOperation = 'destination-out';
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (this.visited[y][x] && !this._isTileVisible(x, y)) {
          // Visited but not currently visible — show dimmed
          fogCtx.fillStyle = `rgba(0, 0, 0, ${1 - FOG_VISITED_ALPHA})`;
          fogCtx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
      }
    }

    // Step 3: Cut out a radial gradient circle around the player (full visibility)
    fogCtx.globalCompositeOperation = 'destination-out';
    const gradient = fogCtx.createRadialGradient(px, py, viewRadius * 0.3, px, py, viewRadius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');   // fully clear at center
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.9)'); // still mostly clear
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');     // fade to opaque at edge

    fogCtx.fillStyle = gradient;
    fogCtx.beginPath();
    fogCtx.arc(px, py, viewRadius, 0, Math.PI * 2);
    fogCtx.fill();

    // Step 4: Draw the fog on top of the game
    fogCtx.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.fogCanvas, 0, 0);
  }
}
