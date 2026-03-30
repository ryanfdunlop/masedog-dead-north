// ============================================================
// MASEDOG: Dead North — Scavenge Mini-Game
// Top-down building exploration. Search containers for loot.
// Noise meter attracts zombies. Escape before overwhelmed.
// ============================================================

import { MinigameBase, GAME_WIDTH, GAME_HEIGHT } from './minigame-base.js';

const TILE = 16;
const COLS = 20; // 320/16
const ROWS = 11; // 176/16 (leaving space for HUD)

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

    // GUN — check if player has ammo
    this.ammo = this.config?.ammo || 0;
    this.hasGun = this.ammo > 0;
    this.shotFlash = 0;
    this.zombieKills = 0;
    this.searching = false;
    this.searchProgress = 0;
    this.searchTarget = null;
    this.escaped = false;
  }

  generateMap() {
    // Simple building: walls around edges, some internal walls
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

  update(dt) {
    this.timer += dt;

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
      // Kill nearest zombie
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
        this.zombies = this.zombies.filter(z => z !== nearest);
        this.zombieKills++;
      }
    }
    this.shotFlash -= dt;

    // Auto-search containers when standing on/next to them (no button needed)
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

      if (this.searchProgress >= 1.5) {
        this.searchTarget.searched = true;
        this.loot.push({ type: this.searchTarget.lootType, amount: this.searchTarget.lootAmount });
        this.score += 10;
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
      if (z.moveTimer <= 0) {
        const dx = Math.sign(this.player.x - z.x);
        const dy = Math.sign(this.player.y - z.y);

        // Check if a tile is walkable (not a wall)
        const canWalk = (x, y) => {
          if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
          return this.map[y][x] !== 1;
        };

        // Try moves in priority order: toward player, then sideways
        let moved = false;

        // 1. Try diagonal (both axes toward player)
        if (dx !== 0 && dy !== 0 && canWalk(z.x + dx, z.y + dy)) {
          z.x += dx; z.y += dy; moved = true;
        }
        // 2. Try horizontal toward player
        else if (dx !== 0 && canWalk(z.x + dx, z.y)) {
          z.x += dx; moved = true;
        }
        // 3. Try vertical toward player
        else if (dy !== 0 && canWalk(z.x, z.y + dy)) {
          z.y += dy; moved = true;
        }
        // 4. Wall-slide: try perpendicular directions to find a door
        else if (!moved) {
          // Try all 4 directions to find a way around the wall
          const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
          for (const [ddx, ddy] of dirs) {
            if (canWalk(z.x + ddx, z.y + ddy)) {
              z.x += ddx; z.y += ddy; moved = true; break;
            }
          }
        }

        z.moveTimer = 0.5 + Math.random() * 0.3;
      }

      // Collision with player
      if (z.x === this.player.x && z.y === this.player.y) {
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
    // Spawn at DOORWAYS only — zombies enter through doors, not walls
    const spawnPoints = [
      { x: 1, y: 5 },   // Exit door (left wall)
      { x: 6, y: 3 },   // Doorway in first internal wall
      { x: 6, y: 7 },   // Second doorway in first wall
      { x: 12, y: 4 },  // Doorway in second internal wall
      { x: 12, y: 8 },  // Second doorway in second wall
    ];
    const sp = spawnPoints[this.randInt(0, spawnPoints.length - 1)];
    this.zombies.push({ x: sp.x, y: sp.y, moveTimer: 0 });
  }

  render(ctx) {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw map
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

    // Draw containers
    for (const c of this.containers) {
      ctx.fillStyle = c.searched ? '#222' : '#886633';
      ctx.fillRect(c.x * TILE + 2, c.y * TILE + 2, TILE - 4, TILE - 4);
      if (!c.searched) {
        ctx.fillStyle = '#aa8844';
        ctx.fillRect(c.x * TILE + 5, c.y * TILE + 3, TILE - 10, 2);
      }
    }

    // Draw zombies
    for (const z of this.zombies) {
      ctx.fillStyle = '#664444';
      ctx.fillRect(z.x * TILE + 3, z.y * TILE + 3, TILE - 6, TILE - 6);
      ctx.fillStyle = '#445544';
      ctx.fillRect(z.x * TILE + 4, z.y * TILE + 2, TILE - 8, 4);
    }

    // Shot flash overlay
    if (this.shotFlash > 0) {
      ctx.fillStyle = `rgba(255, 200, 50, ${this.shotFlash * 0.3})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // Draw player
    ctx.fillStyle = '#44aaff';
    ctx.fillRect(this.player.x * TILE + 2, this.player.y * TILE + 2, TILE - 4, TILE - 4);
    ctx.fillStyle = '#ddb88c';
    ctx.fillRect(this.player.x * TILE + 4, this.player.y * TILE + 1, TILE - 8, 5);

    // Search progress bar
    if (this.searching && this.searchTarget) {
      const sx = this.searchTarget.x * TILE;
      const sy = this.searchTarget.y * TILE - 6;
      ctx.fillStyle = '#333';
      ctx.fillRect(sx, sy, TILE, 4);
      ctx.fillStyle = '#44aa44';
      ctx.fillRect(sx, sy, TILE * (this.searchProgress / 1.5), 4);
    }

    // Noise meter
    ctx.fillStyle = '#222';
    ctx.fillRect(4, GAME_HEIGHT - 12, 60, 6);
    const noiseColor = this.noise > 70 ? '#cc3333' : this.noise > 40 ? '#ccaa22' : '#44aa44';
    ctx.fillStyle = noiseColor;
    ctx.fillRect(4, GAME_HEIGHT - 12, 60 * (this.noise / 100), 6);
    this.drawText(ctx, 'NOISE', 4, GAME_HEIGHT - 14, '#666', 5);

    // Loot count
    this.drawText(ctx, `Loot: ${this.loot.length}`, GAME_WIDTH - 60, GAME_HEIGHT - 6, '#aa8844', 6);

    // Exit marker
    this.drawText(ctx, 'EXIT', 2, 5 * TILE + 10, '#446644', 5);

    // Controls hint
    if (this.timer < 4) {
      const gunHint = this.hasGun ? '  CLICK:Shoot' : '';
      this.drawText(ctx, `WASD:Move  Walk near boxes to search${gunHint}`, 30, GAME_HEIGHT - 4, '#444', 5);
    }
  }
}
