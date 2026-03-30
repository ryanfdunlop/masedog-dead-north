// ============================================================
// MASEDOG: Dead North — Sewer Tunnel (Side-View, DARK)
// Manhole entry -> dark tunnel -> junction (safe/danger paths)
// -> exit ladder. Flashlight cone, water tiles, ceiling drops.
// ============================================================

import { LocationBase, TILE } from './location-base.js';
import { GAME_WIDTH, GAME_HEIGHT } from './minigame-base.js';

const TILE_FLOOR    = 0;
const TILE_WALL     = 1;
const TILE_EXIT     = 2;
const TILE_DOOR     = 3;
const TILE_STAIRS   = 4; // ladder
const TILE_WATER    = 7;

export class LocationTunnel extends LocationBase {
  constructor() {
    super();
    this.locationName = 'Sewer Tunnel';
    this.viewType = 'sideview';
    this.mapCols = 22;
    this.mapRows = 9;
    this.maxTime = 90;
    this.moveDelay = 0.12; // slightly slower base movement

    this.floorColor = '#0e0d12';
    this.wallColor = '#2a2830';
    this.wallInner = '#201e26';

    // Flashlight system
    this.flashlightRadius = 5; // tiles

    // Water slow-down
    this.waterSlowActive = false;

    // Ceiling drop system (crawlers dropping in)
    this.ceilingDropTimer = 0;
    this.ceilingDropInterval = 8; // seconds between drops
    this.ceilingDropped = 0;
    this.maxCeilingDrops = 3;

    // Glowing eyes
    this.glowingEyes = [];
    this.eyeTimer = 0;

    // Drip particles
    this.drips = [];

    // Water reflection offset
    this.waterAnimTimer = 0;
  }

  buildMap() {
    // Initialize all walls
    this.map = [];
    for (let y = 0; y < this.mapRows; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.mapCols; x++) {
        this.map[y][x] = TILE_WALL;
      }
    }

    // Layout (y coords for 9-row narrow tunnel):
    //  0: ceiling
    //  1: upper wall
    //  2-3: main tunnel (walkable on y=3..4)
    //  4: tunnel floor
    //  5-6: lower tunnel / water channels
    //  7-8: foundation

    // Entry manhole (left, x=1, ladder)
    this.map[1][1] = TILE_STAIRS;
    this.map[2][1] = TILE_STAIRS;
    this.map[3][1] = TILE_FLOOR;

    // Main tunnel left section (x=2..10, y=3..4)
    for (let x = 2; x <= 10; x++) {
      this.map[3][x] = TILE_FLOOR;
      this.map[4][x] = TILE_FLOOR;
    }

    // Water in lower parts of left section
    for (let x = 3; x <= 8; x++) {
      this.map[5][x] = TILE_WATER;
    }

    // Junction at x=11 — splits into upper (safe) and lower (danger)
    this.map[3][11] = TILE_FLOOR;
    this.map[4][11] = TILE_FLOOR;

    // Upper path (safer, less loot): y=3, x=12..19
    for (let x = 12; x <= 19; x++) {
      this.map[3][x] = TILE_FLOOR;
    }

    // Lower path (dangerous, more loot): y=5..6, x=12..19
    // Stairs down at junction
    this.map[5][11] = TILE_STAIRS;
    for (let x = 12; x <= 19; x++) {
      this.map[5][x] = TILE_FLOOR;
      this.map[6][x] = TILE_WATER; // water floor
    }
    // Stairs back up at x=19
    this.map[4][19] = TILE_STAIRS;

    // Reconnect to exit (x=20)
    this.map[3][20] = TILE_FLOOR;
    this.map[4][20] = TILE_FLOOR;

    // Exit ladder (right, x=20)
    this.map[1][20] = TILE_STAIRS;
    this.map[2][20] = TILE_STAIRS;

    // Safe room at halfway (x=7..8, y=3..4) — small lit area
    // Already part of main tunnel, just mark for render

    // --- Entry / Exit ---
    this.player.x = 1;
    this.player.y = 3;
    this.map[1][0] = TILE_EXIT; // entry visual

    this.exitPos = { x: 20, y: 1 };
    this.map[1][21] = TILE_EXIT;

    // --- Containers ---
    // Safe room container (halfway)
    this.addContainer(7, 4, 'scrap', 2, 6);

    // Upper path (less loot)
    this.addContainer(14, 3, 'scrap', 1, 8);
    this.addContainer(17, 3, 'fuel', 1, 8);

    // Lower path (more/better loot)
    this.addContainer(13, 5, 'fuel', 3, 10);
    this.addContainer(15, 5, 'scrap', 3, 10);
    this.addContainer(17, 5, 'fuel', 2, 10);
    this.addContainer(18, 5, 'ammo', 2, 12);

    // --- Zombies ---
    // Left tunnel section
    this.zombies.push({ x: 5, y: 4, moveTimer: 0, type: 'crawler' });

    // Upper path
    this.zombies.push({ x: 16, y: 3, moveTimer: 0, type: 'shambler' });

    // Lower path (more dangerous)
    this.zombies.push({ x: 14, y: 5, moveTimer: 0, type: 'crawler' });
    this.zombies.push({ x: 18, y: 5, moveTimer: 0, type: 'crawler' });

    // --- Spawn points ---
    this.spawnPoints = [
      { x: 2, y: 3, type: 'crawler' },
      { x: 19, y: 3, type: 'shambler' },
    ];

    // Initialize drip particles
    this.drips = [];
    for (let i = 0; i < 12; i++) {
      this.drips.push({
        x: this.randInt(2, 19) * TILE + this.rand(0, TILE),
        y: 0,
        speed: this.rand(20, 50),
        maxY: this.rand(3, 6) * TILE,
        active: Math.random() < 0.3,
        timer: this.rand(0, 5),
      });
    }

    // Initialize glowing eyes
    this.glowingEyes = [];
  }

  onPlayerMove(x, y) {
    const tile = this.map[y][x];

    // Water tiles slow movement
    if (tile === TILE_WATER) {
      this.player.moveTimer = this.moveDelay * 2;
      this.waterSlowActive = true;
      this.addNoise(4); // splashing
    } else {
      this.waterSlowActive = false;
    }

    if (tile === TILE_STAIRS) {
      this.addNoise(3);
    }
  }

  update(dt) {
    super.update(dt);

    // Ceiling drop crawler spawns
    this.ceilingDropTimer += dt;
    if (this.ceilingDropTimer >= this.ceilingDropInterval &&
        this.ceilingDropped < this.maxCeilingDrops &&
        this.zombies.length < this.maxZombies) {
      // Drop a crawler on an adjacent tile ahead of the player
      const dropX = this.clamp(this.player.x + this.randInt(1, 3), 2, 19);
      const dropY = this.player.y;
      if (this.canWalk(dropX, dropY)) {
        this.zombies.push({ x: dropX, y: dropY, moveTimer: 0.8, type: 'crawler' });
        this.ceilingDropped++;
        this.ceilingDropTimer = 0;
        this.ceilingDropInterval = 6 + Math.random() * 6;
      }
    }

    // Glowing eyes system — appear 3-4 tiles ahead in darkness
    this.eyeTimer += dt;
    if (this.eyeTimer > 2.5) {
      this.eyeTimer = 0;
      this.glowingEyes = [];
      // Place eyes ahead of player in dark areas
      const aheadX = this.player.x + this.randInt(3, 5);
      if (aheadX < this.mapCols - 1) {
        // Find a walkable tile
        for (let ty = 2; ty <= 6; ty++) {
          if (this.map[ty] && this.map[ty][aheadX] !== TILE_WALL) {
            this.glowingEyes.push({ x: aheadX, y: ty });
            break;
          }
        }
      }
    }

    // Update drip particles
    this.waterAnimTimer += dt;
    for (const drip of this.drips) {
      drip.timer -= dt;
      if (drip.timer <= 0 && !drip.active) {
        drip.active = true;
        drip.y = 0;
      }
      if (drip.active) {
        drip.y += drip.speed * dt;
        if (drip.y >= drip.maxY) {
          drip.active = false;
          drip.timer = this.rand(2, 8);
          drip.y = 0;
        }
      }
    }
  }

  // ========== SIDE-VIEW RENDER (DARK) ==========

  render(ctx) {
    // Pure black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Render the map, objects, etc. normally first
    this.renderTunnelBackground(ctx);
    this.renderMap(ctx);
    this.renderWaterReflections(ctx);
    this.renderDrips(ctx);
    this.renderGlowingEyes(ctx);
    this.renderContainers(ctx);
    this.renderDoors(ctx);
    this.renderZombies(ctx);
    this.renderPlayer(ctx);
    this.renderSearchBar(ctx);

    // DARKNESS OVERLAY — the key visual feature
    this.renderDarkness(ctx);

    // HUD on top of darkness
    this.renderHUD_overlay(ctx);
    this.renderShotFlash(ctx);

    // Water slow indicator
    if (this.waterSlowActive) {
      ctx.fillStyle = 'rgba(40, 60, 100, 0.15)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
  }

  renderTunnelBackground(ctx) {
    // Brick/stone wall texture
    for (let y = 0; y < this.mapRows; y++) {
      for (let x = 0; x < this.mapCols; x++) {
        if (this.map[y][x] === TILE_WALL) {
          const tx = x * TILE;
          const ty = y * TILE;
          ctx.fillStyle = '#1a1820';
          ctx.fillRect(tx, ty, TILE, TILE);
          // Brick pattern
          if ((x + y) % 2 === 0) {
            ctx.fillStyle = '#1e1c24';
            ctx.fillRect(tx + 1, ty + 1, TILE - 2, TILE / 2 - 1);
          }
        }
      }
    }

    // Pipe along ceiling
    ctx.fillStyle = '#333040';
    ctx.fillRect(2 * TILE, TILE + 2, 18 * TILE, 3);
    ctx.fillStyle = '#2a2836';
    ctx.fillRect(2 * TILE, TILE + 3, 18 * TILE, 1);

    // Safe room glow (x=7..8, y=3..4)
    const safeGlow = ctx.createRadialGradient(
      7.5 * TILE, 3.5 * TILE, 0,
      7.5 * TILE, 3.5 * TILE, 2 * TILE
    );
    safeGlow.addColorStop(0, 'rgba(80, 70, 40, 0.15)');
    safeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = safeGlow;
    ctx.fillRect(5 * TILE, 2 * TILE, 5 * TILE, 4 * TILE);
  }

  renderMap(ctx) {
    for (let y = 0; y < this.mapRows; y++) {
      for (let x = 0; x < this.mapCols; x++) {
        const tile = this.map[y][x];
        const tx = x * TILE;
        const ty = y * TILE;

        if (tile === TILE_WALL) {
          // Already rendered in background
        } else if (tile === TILE_EXIT) {
          ctx.fillStyle = '#446644';
          ctx.fillRect(tx, ty, TILE, TILE);
          this.drawText(ctx, 'EXIT', tx + 1, ty + 10, '#88cc88', 4);
        } else if (tile === TILE_STAIRS) {
          // Ladder rungs
          ctx.fillStyle = '#1a1818';
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.fillStyle = '#444038';
          for (let r = 0; r < 4; r++) {
            ctx.fillRect(tx + 3, ty + r * 4 + 1, TILE - 6, 2);
          }
          // Side rails
          ctx.fillRect(tx + 2, ty, 2, TILE);
          ctx.fillRect(tx + TILE - 4, ty, 2, TILE);
        } else if (tile === TILE_WATER) {
          // Water base
          ctx.fillStyle = '#0a1420';
          ctx.fillRect(tx, ty, TILE, TILE);
          // Water surface shimmer
          const wave = Math.sin(this.waterAnimTimer * 2 + x * 0.8) * 2;
          ctx.fillStyle = 'rgba(30, 50, 80, 0.4)';
          ctx.fillRect(tx, ty + 4 + wave, TILE, 2);
          ctx.fillStyle = 'rgba(40, 70, 110, 0.2)';
          ctx.fillRect(tx, ty + 8 + wave * 0.5, TILE, 1);
        } else if (tile === TILE_FLOOR) {
          ctx.fillStyle = this.floorColor;
          ctx.fillRect(tx, ty, TILE, TILE);
          // Damp spots
          if ((x * 7 + y * 13) % 11 === 0) {
            ctx.fillStyle = 'rgba(20, 30, 50, 0.3)';
            ctx.fillRect(tx + 2, ty + 2, TILE - 4, TILE - 4);
          }
        }
      }
    }
  }

  renderWaterReflections(ctx) {
    // Subtle reflections on water tiles
    ctx.globalAlpha = 0.08;
    for (let x = 0; x < this.mapCols; x++) {
      for (let y = 0; y < this.mapRows; y++) {
        if (this.map[y][x] === TILE_WATER) {
          const wave = Math.sin(this.waterAnimTimer * 1.5 + x * 1.2);
          ctx.fillStyle = '#4488cc';
          ctx.fillRect(x * TILE + wave * 2, y * TILE, TILE, 1);
        }
      }
    }
    ctx.globalAlpha = 1.0;
  }

  renderDrips(ctx) {
    ctx.fillStyle = '#3366aa';
    for (const drip of this.drips) {
      if (drip.active) {
        ctx.globalAlpha = 0.5;
        ctx.fillRect(Math.round(drip.x), Math.round(drip.y), 1, 3);
      }
    }
    ctx.globalAlpha = 1.0;
  }

  renderGlowingEyes(ctx) {
    for (const eye of this.glowingEyes) {
      // Only show if outside flashlight radius
      const dist = Math.abs(eye.x - this.player.x) + Math.abs(eye.y - this.player.y);
      if (dist > this.flashlightRadius - 1) {
        const ex = eye.x * TILE + 4;
        const ey = eye.y * TILE + 5;

        // Pulsing glow
        const pulse = 0.5 + Math.sin(this.timer * 4) * 0.3;
        ctx.globalAlpha = pulse;

        // Left eye
        ctx.fillStyle = '#cc2222';
        ctx.fillRect(ex, ey, 2, 2);
        // Right eye
        ctx.fillRect(ex + 6, ey, 2, 2);

        // Glow around eyes
        ctx.fillStyle = 'rgba(180, 30, 30, 0.15)';
        ctx.fillRect(ex - 2, ey - 2, 14, 6);

        ctx.globalAlpha = 1.0;
      }
    }
  }

  renderDarkness(ctx) {
    // Create darkness overlay with flashlight cone
    const px = (this.player.x + 0.5) * TILE;
    const py = (this.player.y + 0.5) * TILE;
    const radius = this.flashlightRadius * TILE;

    // Use radial gradient for flashlight effect
    const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(0.75, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');

    // Draw full dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Cut out the flashlight area using compositing
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    // Flashlight cone
    const flashGradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
    flashGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    flashGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.8)');
    flashGradient.addColorStop(0.85, 'rgba(0, 0, 0, 0.3)');
    flashGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = flashGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Also cut out safe room area (dim light)
    const safeGrad = ctx.createRadialGradient(
      7.5 * TILE, 3.5 * TILE, 0,
      7.5 * TILE, 3.5 * TILE, 2.5 * TILE
    );
    safeGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    safeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = safeGrad;
    ctx.fillRect(5 * TILE, 1 * TILE, 6 * TILE, 5 * TILE);

    ctx.restore();

    // Warm flashlight tint
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    const warmGrad = ctx.createRadialGradient(px, py, 0, px, py, radius * 0.7);
    warmGrad.addColorStop(0, 'rgba(255, 230, 180, 0.06)');
    warmGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = warmGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.restore();
  }
}
