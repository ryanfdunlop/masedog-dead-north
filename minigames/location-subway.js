// ============================================================
// MASEDOG: Dead North — Subway Station (Side-View)
// Platform -> stairs -> tracks -> train car -> opposite platform.
// Electrified rails, flickering lights, rats, crawlers.
// ============================================================

import { LocationBase, TILE } from './location-base.js';
import { GAME_WIDTH, GAME_HEIGHT } from './minigame-base.js';

const TILE_FLOOR      = 0;
const TILE_WALL       = 1;
const TILE_EXIT       = 2;
const TILE_DOOR       = 3;
const TILE_STAIRS     = 4;
const TILE_ELEC_RAIL  = 6; // Electrified rail — damages player

export class LocationSubway extends LocationBase {
  constructor() {
    super();
    this.locationName = 'Subway Station';
    this.viewType = 'sideview';
    this.mapCols = 24;
    this.mapRows = 11;
    this.maxTime = 100;

    this.floorColor = '#14121c';
    this.wallColor = '#383040';
    this.wallInner = '#2c2535';

    // Flickering light system
    this.flickerTimer = 0;
    this.flickerInterval = 4; // seconds between flickers
    this.flickering = false;
    this.flickerDuration = 0.5;

    // Rat visual system
    this.rats = [];
    this.ratSpawnTimer = 0;

    // Electrified rail damage timer
    this.railDamageTimer = 0;
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

    // Layout (y coords):
    //  0: station ceiling
    //  1-2: left platform level (y=2 walkable)
    //  3: platform edge / stairs
    //  4: stairs down
    //  5-6: track level (y=6 walkable, y=5 track space)
    //  7: stairs up
    //  8: platform edge / stairs
    //  9-10: right platform level (not used — we go left-to-right)

    // Rethink: side-view, horizontal traversal
    // Left platform (x=1..5, y=2..3)
    // Stairs down (x=6..7, y=3..6)
    // Tracks (x=6..17, y=7..8) — below platforms
    // Train car (x=9..15, y=7..8)
    // Stairs up (x=18..19, y=3..6)
    // Right platform (x=18..22, y=2..3)

    // Better layout for side-view:
    //  y=0: ceiling
    //  y=1: upper space (signage)
    //  y=2-3: platform level (walkable on y=3)
    //  y=4: platform edge
    //  y=5: transition/stairs
    //  y=6-7: track level (walkable on y=7)
    //  y=8: track bed
    //  y=9-10: sub-track (foundation)

    // Left platform (x=1..6, y=3)
    for (let x = 1; x <= 6; x++) {
      this.map[2][x] = TILE_FLOOR;
      this.map[3][x] = TILE_FLOOR;
    }

    // Left stairs down (x=6..7, y=4..6)
    for (let y = 4; y <= 6; y++) {
      this.map[y][6] = TILE_STAIRS;
      this.map[y][7] = TILE_STAIRS;
    }

    // Track level (x=6..17, y=7)
    for (let x = 6; x <= 17; x++) {
      this.map[7][x] = TILE_FLOOR;
    }

    // Electrified rail tiles (x=7..16, y=8)
    for (let x = 7; x <= 16; x++) {
      this.map[8][x] = TILE_ELEC_RAIL;
    }

    // Train car interior (x=9..15, y=6..7) — walkable inside
    for (let x = 9; x <= 15; x++) {
      this.map[6][x] = TILE_FLOOR;
    }
    // Train car "doors" at x=9 and x=15 (already walkable from track)

    // Right stairs up (x=16..17, y=4..6)
    for (let y = 4; y <= 6; y++) {
      this.map[y][16] = TILE_STAIRS;
      this.map[y][17] = TILE_STAIRS;
    }

    // Right platform (x=17..22, y=3)
    for (let x = 17; x <= 22; x++) {
      this.map[2][x] = TILE_FLOOR;
      this.map[3][x] = TILE_FLOOR;
    }

    // --- Entry / Exit ---
    this.player.x = 1;
    this.player.y = 3;
    this.map[3][0] = TILE_EXIT; // entry marker

    // Exit: right platform stairs
    this.exitPos = { x: 22, y: 3 };
    this.map[3][23] = TILE_EXIT;

    // --- Containers ---
    // Left platform: benches, ticket machine
    this.addContainer(3, 3, 'scrap', 1, 8);   // bench
    this.addContainer(5, 3, 'scrap', 2, 10);  // ticket machine

    // Train car interior: good loot
    this.addContainer(10, 6, 'ammo', 2, 8);
    this.addContainer(12, 6, 'scrap', 3, 10);
    this.addContainer(13, 6, 'ammo', 2, 10);
    this.addContainer(14, 6, 'food', 2, 8);

    // Right platform
    this.addContainer(19, 3, 'scrap', 1, 8);
    this.addContainer(21, 3, 'medicine', 1, 10);

    // --- Zombies ---
    // Left platform shambler
    this.zombies.push({ x: 4, y: 3, moveTimer: 0, type: 'shambler' });

    // Right platform shambler
    this.zombies.push({ x: 20, y: 3, moveTimer: 0, type: 'shambler' });

    // Track level
    this.zombies.push({ x: 8, y: 7, moveTimer: 0, type: 'shambler' });

    // Crawlers inside/under train
    this.zombies.push({ x: 11, y: 6, moveTimer: 0, type: 'crawler' });
    this.zombies.push({ x: 14, y: 7, moveTimer: 0, type: 'crawler' });

    // --- Spawn points ---
    this.spawnPoints = [
      { x: 1, y: 3, type: 'shambler' },
      { x: 22, y: 3, type: 'shambler' },
      { x: 8, y: 7, type: 'crawler' },
    ];

    // Initialize rats
    this.rats = [];
    for (let i = 0; i < 6; i++) {
      this.rats.push({
        x: this.randInt(7, 16) * TILE + this.rand(0, TILE),
        y: 7 * TILE + this.rand(4, 12),
        vx: this.rand(-15, 15),
        vy: 0,
        scatter: false,
        scatterTimer: 0,
      });
    }
  }

  onPlayerMove(x, y) {
    const tile = this.map[y][x];

    // Electrified rail damage
    if (tile === TILE_ELEC_RAIL) {
      this.railDamageTimer += 0.1;
      if (this.railDamageTimer >= 0.3) {
        // Deal damage via result data — the game engine reads this
        this.score -= 5;
        this.railDamageTimer = 0;
        this.addNoise(15);
      }
    } else {
      this.railDamageTimer = 0;
    }

    if (tile === TILE_STAIRS) {
      this.addNoise(4);
    }

    // Scatter nearby rats
    for (const rat of this.rats) {
      const dist = Math.abs(rat.x - x * TILE) + Math.abs(rat.y - y * TILE);
      if (dist < 48) {
        rat.scatter = true;
        rat.scatterTimer = 1.0;
        rat.vx = (rat.x < x * TILE ? -1 : 1) * this.rand(20, 40);
      }
    }
  }

  update(dt) {
    super.update(dt);

    // Flickering lights
    this.flickerTimer += dt;
    if (!this.flickering && this.flickerTimer >= this.flickerInterval) {
      this.flickering = true;
      this.flickerTimer = 0;
      this.flickerInterval = 3 + Math.random() * 4; // randomize next flicker
    }
    if (this.flickering && this.flickerTimer >= this.flickerDuration) {
      this.flickering = false;
      this.flickerTimer = 0;
    }

    // Update rats
    for (const rat of this.rats) {
      if (rat.scatter) {
        rat.x += rat.vx * dt;
        rat.scatterTimer -= dt;
        if (rat.scatterTimer <= 0) {
          rat.scatter = false;
          rat.vx = this.rand(-10, 10);
        }
      } else {
        rat.x += rat.vx * dt;
        // Bounce off boundaries
        if (rat.x < 7 * TILE || rat.x > 16 * TILE) {
          rat.vx *= -1;
        }
      }
    }
  }

  // ========== SIDE-VIEW RENDER ==========

  render(ctx) {
    ctx.fillStyle = '#08070e';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.renderStationBackground(ctx);
    this.renderMap(ctx);
    this.renderTrainCar(ctx);
    this.renderElecRails(ctx);
    this.renderRats(ctx);
    this.renderContainers(ctx);
    this.renderDoors(ctx);
    this.renderZombies(ctx);
    this.renderPlayer(ctx);
    this.renderSearchBar(ctx);
    this.renderHUD_overlay(ctx);
    this.renderShotFlash(ctx);
    this.renderFlicker(ctx);
  }

  renderStationBackground(ctx) {
    // Station ceiling
    ctx.fillStyle = '#1a1826';
    ctx.fillRect(0, 0, this.mapCols * TILE, TILE);

    // Platform lines
    ctx.strokeStyle = '#cccc44';
    ctx.lineWidth = 1;
    // Left platform edge (safety line)
    ctx.beginPath();
    ctx.moveTo(TILE, 4 * TILE);
    ctx.lineTo(6 * TILE, 4 * TILE);
    ctx.stroke();
    // Right platform edge
    ctx.beginPath();
    ctx.moveTo(17 * TILE, 4 * TILE);
    ctx.lineTo(22 * TILE, 4 * TILE);
    ctx.stroke();

    // Platform depth shading
    ctx.fillStyle = '#0e0d16';
    ctx.fillRect(TILE, 4 * TILE, 5 * TILE, TILE);
    ctx.fillRect(17 * TILE, 4 * TILE, 5 * TILE, TILE);

    // Track bed
    ctx.fillStyle = '#0a0910';
    ctx.fillRect(6 * TILE, 8 * TILE, 12 * TILE, 3 * TILE);

    // Tile pattern on platforms
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 1; x <= 6; x++) {
      if (x % 2 === 0) ctx.fillRect(x * TILE, 3 * TILE, TILE, TILE);
    }
    for (let x = 17; x <= 22; x++) {
      if (x % 2 === 0) ctx.fillRect(x * TILE, 3 * TILE, TILE, TILE);
    }

    // Labels
    ctx.globalAlpha = 0.2;
    this.drawText(ctx, 'PLATFORM', 2 * TILE, 2 * TILE + 10, '#8888cc', 4);
    this.drawText(ctx, 'TRACKS', 10 * TILE, 8 * TILE + 10, '#886644', 4);
    this.drawText(ctx, 'PLATFORM', 18 * TILE, 2 * TILE + 10, '#8888cc', 4);
    ctx.globalAlpha = 1.0;
  }

  renderTrainCar(ctx) {
    // Train car body outline (x=9..15, y=5..8)
    const tx = 9 * TILE;
    const ty = 5 * TILE;
    const tw = 7 * TILE;
    const th = 3 * TILE;

    // Car body
    ctx.fillStyle = '#1e1c28';
    ctx.fillRect(tx, ty, tw, th);

    // Car outline
    ctx.strokeStyle = '#444060';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx, ty, tw, th);

    // Windows
    for (let w = 0; w < 5; w++) {
      const wx = tx + 8 + w * (TILE + 4);
      ctx.fillStyle = '#181628';
      ctx.fillRect(wx, ty + 3, 10, 6);
      ctx.strokeStyle = '#333050';
      ctx.strokeRect(wx, ty + 3, 10, 6);
    }

    // Door openings (at entry points)
    ctx.fillStyle = '#111018';
    ctx.fillRect(9 * TILE, 6 * TILE, TILE, TILE);
    ctx.fillRect(15 * TILE, 6 * TILE, TILE, TILE);

    // Train label
    ctx.globalAlpha = 0.15;
    this.drawText(ctx, 'TRAIN', 11 * TILE, 5 * TILE + 10, '#6666aa', 4);
    ctx.globalAlpha = 1.0;
  }

  renderElecRails(ctx) {
    // Electrified rail visual (sparking)
    for (let x = 7; x <= 16; x++) {
      const tx = x * TILE;
      const ty = 8 * TILE;

      // Rail
      ctx.fillStyle = '#444';
      ctx.fillRect(tx, ty + 6, TILE, 2);

      // Sparks (random flicker)
      if (Math.random() < 0.05) {
        ctx.fillStyle = '#ffff44';
        ctx.fillRect(tx + this.randInt(2, 12), ty + 4, 2, 2);
        ctx.fillStyle = '#88aaff';
        ctx.fillRect(tx + this.randInt(2, 12), ty + 2, 1, 3);
      }

      // Warning color on the tile
      ctx.fillStyle = 'rgba(255, 200, 0, 0.06)';
      ctx.fillRect(tx, ty, TILE, TILE);
    }
  }

  renderRats(ctx) {
    ctx.fillStyle = '#443322';
    for (const rat of this.rats) {
      const rx = Math.round(rat.x);
      const ry = Math.round(rat.y);
      // Body
      ctx.fillRect(rx, ry, 3, 2);
      // Tail
      ctx.fillStyle = '#332211';
      ctx.fillRect(rx + (rat.vx > 0 ? -2 : 3), ry + 1, 2, 1);
      ctx.fillStyle = '#443322';
    }
  }

  renderFlicker(ctx) {
    if (this.flickering) {
      // Dim overlay simulating lights cutting out
      const intensity = 0.4 + Math.sin(this.flickerTimer * 20) * 0.2;
      ctx.fillStyle = `rgba(0, 0, 0, ${intensity})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
  }

  renderMap(ctx) {
    for (let y = 0; y < this.mapRows; y++) {
      for (let x = 0; x < this.mapCols; x++) {
        const tile = this.map[y][x];
        const tx = x * TILE;
        const ty = y * TILE;

        if (tile === TILE_WALL) {
          ctx.fillStyle = this.wallColor;
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.fillStyle = this.wallInner;
          ctx.fillRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
        } else if (tile === TILE_EXIT) {
          ctx.fillStyle = '#446644';
          ctx.fillRect(tx, ty, TILE, TILE);
          this.drawText(ctx, 'EXIT', tx + 1, ty + 10, '#88cc88', 4);
        } else if (tile === TILE_STAIRS) {
          ctx.fillStyle = '#1e1c28';
          ctx.fillRect(tx, ty, TILE, TILE);
          for (let s = 0; s < 4; s++) {
            ctx.fillStyle = '#333048';
            ctx.fillRect(tx + 1, ty + s * 4, TILE - 2, 2);
          }
        } else if (tile === TILE_ELEC_RAIL) {
          // Rendered separately in renderElecRails
        } else if (tile === TILE_FLOOR) {
          ctx.fillStyle = this.floorColor;
          ctx.fillRect(tx, ty, TILE, TILE);
        }
      }
    }
  }
}
