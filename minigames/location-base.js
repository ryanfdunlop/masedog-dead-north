// ============================================================
// MASEDOG: Dead North — Location Base Class
// Shared mechanics for all explorable mini-game locations.
// Extends MinigameBase with: rooms, doors, loot, zombies, noise.
// ============================================================

import { MinigameBase, GAME_WIDTH, GAME_HEIGHT } from './minigame-base.js';

const TILE = 16;

export class LocationBase extends MinigameBase {
  constructor() {
    super();
    this.maxTime = 90;

    // Map
    this.map = [];
    this.mapCols = 20;
    this.mapRows = 11;

    // Player
    this.player = { x: 1, y: 5, moveTimer: 0 };
    this.moveDelay = 0.1;

    // Loot system
    this.containers = [];
    this.loot = [];
    this.searching = false;
    this.searchProgress = 0;
    this.searchTarget = null;
    this.searchTime = 1.2; // seconds to search a container

    // Zombie system
    this.zombies = [];
    this.zombieSpawnTimer = 0;
    this.zombieSpawnRate = 8; // seconds between spawns
    this.maxZombies = 6;

    // Noise system
    this.noise = 0;
    this.maxNoise = 100;
    this.noiseDecay = 4; // per second

    // Gun
    this.ammo = 0;
    this.hasGun = false;
    this.shotFlash = 0;
    this.zombieKills = 0;

    // Doors
    this.doors = []; // { x, y, locked, broken, noiseToBreak }

    // Exit
    this.exitPos = null;

    // Visual
    this.viewType = 'topdown'; // 'topdown' or 'sideview'
    this.locationName = 'Location';
    this.floorColor = '#1a1a22';
    this.wallColor = '#333340';
    this.wallInner = '#2a2a35';
  }

  init() {
    super.init();
    this.ammo = this.config?.ammo || 0;
    this.hasGun = this.ammo > 0;

    // Subclass should override buildMap()
    this.buildMap();
  }

  /**
   * Override in subclass — generate the map, containers, zombies, exit.
   */
  buildMap() {
    // Default: empty room with walls
    this.map = [];
    for (let y = 0; y < this.mapRows; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.mapCols; x++) {
        this.map[y][x] = (y === 0 || y === this.mapRows - 1 || x === 0 || x === this.mapCols - 1) ? 1 : 0;
      }
    }
    this.exitPos = { x: this.mapCols - 2, y: Math.floor(this.mapRows / 2) };
    this.map[this.exitPos.y][this.exitPos.x + 1] = 2; // Exit marker
  }

  // ========== UPDATE ==========

  update(dt) {
    this.timer += dt;

    // Player movement
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

        if (this.canWalk(nx, ny)) {
          this.player.x = nx;
          this.player.y = ny;
          this.player.moveTimer = this.moveDelay;
          this.addNoise(2);

          // Check special tiles
          this.onPlayerMove(nx, ny);
        }

        // Check door interaction
        this.checkDoorInteraction(nx, ny);

        // Check exit
        if (this.exitPos && nx === this.exitPos.x && ny === this.exitPos.y) {
          this.complete(true, this.loot.length * 10 + this.zombieKills * 5, {
            loot: this.loot, ammoUsed: (this.config?.ammo || 0) - this.ammo, zombieKills: this.zombieKills
          });
          return;
        }
      }
    }

    // Shoot — click or E/F
    if (this.hasGun && this.ammo > 0 && this.shotFlash <= 0 &&
        (this.touch.active || this.isKeyPressed('KeyE') || this.isKeyPressed('KeyF'))) {
      this.shoot();
    }
    this.shotFlash -= dt;

    // Auto-search containers when adjacent
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

    // Search progress
    if (this.searching && this.searchTarget) {
      this.searchProgress += dt;
      this.addNoise(this.searchTarget.noiseLevel * dt);

      if (this.searchProgress >= this.searchTime) {
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
    this.noise = Math.max(0, this.noise - this.noiseDecay * dt);

    // Zombie spawning
    this.zombieSpawnTimer += dt;
    if (this.noise > 40 && this.zombieSpawnTimer > this.zombieSpawnRate && this.zombies.length < this.maxZombies) {
      this.spawnZombie();
      this.zombieSpawnTimer = 0;
    }
    if (this.noise > 70 && this.zombieSpawnTimer > this.zombieSpawnRate / 2 && this.zombies.length < this.maxZombies) {
      this.spawnZombie();
      this.zombieSpawnTimer = 0;
    }

    // Zombie movement
    this.updateZombies(dt);

    // Time up
    if (this.timer >= this.maxTime) {
      this.complete(this.loot.length > 0, this.loot.length * 10, {
        loot: this.loot, ammoUsed: (this.config?.ammo || 0) - this.ammo, zombieKills: this.zombieKills
      });
    }
  }

  // ========== ZOMBIE AI ==========

  updateZombies(dt) {
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      z.moveTimer -= dt;

      if (z.moveTimer <= 0) {
        const dx = Math.sign(this.player.x - z.x);
        const dy = Math.sign(this.player.y - z.y);

        // Wall-aware pathfinding: try toward player, then sideways
        let moved = false;
        if (dx !== 0 && dy !== 0 && this.canWalk(z.x + dx, z.y + dy)) {
          z.x += dx; z.y += dy; moved = true;
        } else if (dx !== 0 && this.canWalk(z.x + dx, z.y)) {
          z.x += dx; moved = true;
        } else if (dy !== 0 && this.canWalk(z.x, z.y + dy)) {
          z.y += dy; moved = true;
        } else {
          // Wall-slide to find doors
          const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
          for (const [ddx, ddy] of dirs) {
            if (this.canWalk(z.x + ddx, z.y + ddy)) {
              z.x += ddx; z.y += ddy; moved = true; break;
            }
          }
        }

        z.moveTimer = 0.4 + Math.random() * 0.3;
      }

      // Catch player
      if (z.x === this.player.x && z.y === this.player.y) {
        this.complete(false, this.loot.length * 5, {
          loot: this.loot, caught: true, ammoUsed: (this.config?.ammo || 0) - this.ammo, zombieKills: this.zombieKills
        });
        return;
      }
    }
  }

  spawnZombie() {
    // Override in subclass to set spawn points at doors
    if (this.spawnPoints && this.spawnPoints.length > 0) {
      const sp = this.spawnPoints[this.randInt(0, this.spawnPoints.length - 1)];
      this.zombies.push({ x: sp.x, y: sp.y, moveTimer: 0, type: sp.type || 'shambler' });
    }
  }

  shoot() {
    let nearest = null;
    let nearestDist = Infinity;
    for (const z of this.zombies) {
      const dist = Math.abs(z.x - this.player.x) + Math.abs(z.y - this.player.y);
      if (dist < nearestDist) { nearestDist = dist; nearest = z; }
    }
    if (nearest && nearestDist <= 6) {
      this.ammo--;
      this.shotFlash = 0.25;
      this.addNoise(30); // Guns are LOUD
      this.zombies = this.zombies.filter(z => z !== nearest);
      this.zombieKills++;
    }
  }

  // ========== HELPERS ==========

  canWalk(x, y) {
    if (x < 0 || x >= this.mapCols || y < 0 || y >= this.mapRows) return false;
    if (this.map[y][x] === 1) return false;
    // Check doors
    const door = this.doors.find(d => d.x === x && d.y === y);
    if (door && door.locked && !door.broken) return false;
    return true;
  }

  addNoise(amount) {
    this.noise = Math.min(this.maxNoise, this.noise + amount);
  }

  onPlayerMove(x, y) {
    // Override in subclass for special tile effects
  }

  checkDoorInteraction(x, y) {
    const door = this.doors.find(d => d.x === x && d.y === y && d.locked && !d.broken);
    if (door) {
      // Break it open (loud!)
      door.broken = true;
      door.locked = false;
      this.addNoise(door.noiseToBreak || 25);
    }
  }

  addContainer(x, y, lootType, lootAmount, noiseLevel = 10) {
    this.containers.push({ x, y, searched: false, lootType, lootAmount, noiseLevel });
  }

  addDoor(x, y, locked = true, noiseToBreak = 25) {
    this.doors.push({ x, y, locked, broken: false, noiseToBreak });
    if (locked) this.map[y][x] = 3; // Door tile
  }

  // ========== RENDER ==========

  render(ctx) {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.renderMap(ctx);
    this.renderContainers(ctx);
    this.renderDoors(ctx);
    this.renderZombies(ctx);
    this.renderPlayer(ctx);
    this.renderSearchBar(ctx);
    this.renderHUD_overlay(ctx);
    this.renderShotFlash(ctx);
  }

  renderMap(ctx) {
    for (let y = 0; y < this.mapRows; y++) {
      for (let x = 0; x < this.mapCols; x++) {
        const tile = this.map[y][x];
        const tx = x * TILE;
        const ty = y * TILE;

        if (tile === 1) {
          ctx.fillStyle = this.wallColor;
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.fillStyle = this.wallInner;
          ctx.fillRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
        } else if (tile === 2) {
          ctx.fillStyle = '#446644';
          ctx.fillRect(tx, ty, TILE, TILE);
          this.drawText(ctx, 'EXIT', tx + 1, ty + 10, '#88cc88', 5);
        } else if (tile === 3) {
          ctx.fillStyle = '#553322';
          ctx.fillRect(tx, ty, TILE, TILE);
        } else {
          ctx.fillStyle = this.floorColor;
          ctx.fillRect(tx, ty, TILE, TILE);
        }
      }
    }
  }

  renderContainers(ctx) {
    for (const c of this.containers) {
      ctx.fillStyle = c.searched ? '#222' : '#886633';
      ctx.fillRect(c.x * TILE + 2, c.y * TILE + 2, TILE - 4, TILE - 4);
      if (!c.searched) {
        ctx.fillStyle = '#aa8844';
        ctx.fillRect(c.x * TILE + 5, c.y * TILE + 3, TILE - 10, 2);
      }
    }
  }

  renderDoors(ctx) {
    for (const d of this.doors) {
      if (d.broken) {
        ctx.fillStyle = '#332211';
        ctx.fillRect(d.x * TILE + 2, d.y * TILE, TILE - 4, TILE);
      } else if (d.locked) {
        ctx.fillStyle = '#664422';
        ctx.fillRect(d.x * TILE, d.y * TILE, TILE, TILE);
        ctx.fillStyle = '#cc8833';
        ctx.fillRect(d.x * TILE + 6, d.y * TILE + 5, 4, 4); // Lock icon
      }
    }
  }

  renderZombies(ctx) {
    for (const z of this.zombies) {
      ctx.fillStyle = z.type === 'bloater' ? '#556644' : z.type === 'crawler' ? '#554433' : '#664444';
      ctx.fillRect(z.x * TILE + 3, z.y * TILE + 3, TILE - 6, TILE - 6);
      ctx.fillStyle = '#445544';
      ctx.fillRect(z.x * TILE + 4, z.y * TILE + 2, TILE - 8, 4);
    }
  }

  renderPlayer(ctx) {
    ctx.fillStyle = '#44aaff';
    ctx.fillRect(this.player.x * TILE + 2, this.player.y * TILE + 2, TILE - 4, TILE - 4);
    ctx.fillStyle = '#ddb88c';
    ctx.fillRect(this.player.x * TILE + 4, this.player.y * TILE + 1, TILE - 8, 5);

    // Gun
    if (this.hasGun && this.ammo > 0) {
      ctx.fillStyle = '#555';
      ctx.fillRect(this.player.x * TILE + TILE - 2, this.player.y * TILE + 5, 5, 2);
    }
  }

  renderSearchBar(ctx) {
    if (this.searching && this.searchTarget) {
      const sx = this.searchTarget.x * TILE;
      const sy = this.searchTarget.y * TILE - 6;
      ctx.fillStyle = '#333';
      ctx.fillRect(sx, sy, TILE, 4);
      ctx.fillStyle = '#44aa44';
      ctx.fillRect(sx, sy, TILE * (this.searchProgress / this.searchTime), 4);
    }
  }

  renderShotFlash(ctx) {
    if (this.shotFlash > 0) {
      ctx.fillStyle = `rgba(255, 200, 50, ${this.shotFlash * 0.4})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
  }

  renderHUD_overlay(ctx) {
    // Location name
    this.drawText(ctx, this.locationName, 4, 10, '#666', 6);

    // Noise meter
    ctx.fillStyle = '#222';
    ctx.fillRect(4, GAME_HEIGHT - 12, 60, 6);
    const noiseColor = this.noise > 70 ? '#cc3333' : this.noise > 40 ? '#ccaa22' : '#44aa44';
    ctx.fillStyle = noiseColor;
    ctx.fillRect(4, GAME_HEIGHT - 12, 60 * (this.noise / 100), 6);
    this.drawText(ctx, 'NOISE', 4, GAME_HEIGHT - 14, '#666', 5);

    // Ammo
    if (this.hasGun) {
      this.drawText(ctx, `AMMO:${this.ammo}`, GAME_WIDTH - 55, 10, this.ammo > 0 ? '#ccaa44' : '#cc3333', 6);
    }

    // Loot count
    this.drawText(ctx, `LOOT:${this.loot.length}`, GAME_WIDTH - 55, 20, '#aa8844', 6);

    // Kills
    if (this.zombieKills > 0) {
      this.drawText(ctx, `KILLS:${this.zombieKills}`, GAME_WIDTH - 55, 30, '#aa4444', 6);
    }

    // Time
    const timeLeft = Math.max(0, Math.ceil(this.maxTime - this.timer));
    this.drawText(ctx, `${timeLeft}s`, GAME_WIDTH - 25, GAME_HEIGHT - 6, timeLeft < 15 ? '#cc3333' : '#666', 6);

    // Controls
    if (this.timer < 3) {
      const gun = this.hasGun ? ' CLICK:Shoot' : '';
      this.drawText(ctx, `WASD:Move${gun}`, 70, GAME_HEIGHT - 4, '#444', 5);
    }
  }
}

export { TILE };
