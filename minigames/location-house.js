// ============================================================
// MASEDOG: Dead North — Abandoned House (Side-View Cutaway)
// 2-floor house: living room, kitchen, bathroom, bedrooms,
// attic, basement. Creaky stairs, family photos, mixed loot.
// ============================================================

import { LocationBase, TILE } from './location-base.js';
import { GAME_WIDTH, GAME_HEIGHT } from './minigame-base.js';

// Custom tile types
const TILE_FLOOR    = 0;
const TILE_WALL     = 1;
const TILE_EXIT     = 2;
const TILE_DOOR     = 3;
const TILE_STAIRS   = 4;
const TILE_CREAKY   = 5;

export class LocationHouse extends LocationBase {
  constructor() {
    super();
    this.locationName = 'Abandoned House';
    this.viewType = 'sideview';
    this.mapCols = 20;
    this.mapRows = 11;
    this.maxTime = 75;

    this.floorColor = '#1c1a20';
    this.wallColor = '#3a3040';
    this.wallInner = '#2e2835';

    // Side-view floor definitions: { yFloor, yCeiling }
    this.floors = [];
    this.creakyAlerted = false;
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
    //  0: roof/attic ceiling
    //  1: attic space
    //  2: attic floor / upper ceiling
    //  3: upper floor (bedrooms + hallway)
    //  4: upper floor bottom / ground ceiling
    //  5: ground floor (living room, kitchen, bathroom)
    //  6: ground floor bottom / basement ceiling
    //  7-8: basement
    //  9: basement floor
    // 10: foundation

    // --- Attic (y=1) ---
    for (let x = 7; x <= 12; x++) this.map[1][x] = TILE_FLOOR;

    // --- Upper floor (y=3) bedrooms + hallway ---
    // Bedroom 1 (left): x=1..6
    for (let x = 1; x <= 6; x++) this.map[3][x] = TILE_FLOOR;
    // Hallway: x=7..12
    for (let x = 7; x <= 12; x++) this.map[3][x] = TILE_FLOOR;
    // Bedroom 2 (right): x=13..18
    for (let x = 13; x <= 18; x++) this.map[3][x] = TILE_FLOOR;

    // --- Ground floor (y=5..6) ---
    // Living room (left): x=1..6
    for (let x = 1; x <= 6; x++) this.map[5][x] = TILE_FLOOR;
    // Kitchen (center): x=7..12
    for (let x = 7; x <= 12; x++) this.map[5][x] = TILE_FLOOR;
    // Bathroom (right): x=13..18
    for (let x = 13; x <= 18; x++) this.map[5][x] = TILE_FLOOR;

    // --- Basement (y=7..8) ---
    for (let x = 3; x <= 16; x++) {
      this.map[7][x] = TILE_FLOOR;
      this.map[8][x] = TILE_FLOOR;
    }

    // --- Stairs ---
    // Attic stairs (hallway up to attic): x=8, y=2 connecting y=1 and y=3
    this.map[2][8] = TILE_STAIRS;
    this.map[2][9] = TILE_STAIRS;

    // Main stairs (ground to upper): x=7, y=4 connecting y=3 and y=5
    this.map[4][7] = TILE_STAIRS;
    this.map[4][8] = TILE_STAIRS;

    // Basement stairs (ground to basement): x=5, y=6 connecting y=5 and y=7
    // These are CREAKY
    this.map[6][5] = TILE_CREAKY;
    this.map[6][6] = TILE_CREAKY;

    // --- Entry / Exit ---
    // Front door: left side, ground floor
    this.map[5][0] = TILE_EXIT; // entry side
    this.player.x = 1;
    this.player.y = 5;

    // Back door (exit): right side, ground floor
    this.exitPos = { x: 18, y: 5 };
    this.map[5][19] = TILE_EXIT;

    // --- Containers ---
    // Kitchen: food
    this.addContainer(9, 5, 'food', 2, 8);
    this.addContainer(11, 5, 'food', 1, 8);

    // Bathroom: medicine
    this.addContainer(15, 5, 'medicine', 1, 10);

    // Bedroom 1: scrap under bed
    this.addContainer(3, 3, 'scrap', 2, 6);
    // Bedroom 2: ammo under bed
    this.addContainer(16, 3, 'ammo', 2, 8);

    // Attic: best loot
    this.addContainer(9, 1, 'ammo', 3, 12);
    this.addContainer(11, 1, 'medicine', 2, 12);

    // Basement: fuel + scrap (dark and dangerous)
    this.addContainer(6, 8, 'fuel', 2, 10);
    this.addContainer(12, 8, 'scrap', 3, 10);

    // Family photo (living room) - morale boost
    this.addContainer(2, 5, 'morale', 1, 4);

    // --- Doors ---
    // Bedroom doors
    this.addDoor(7, 3, false); // hallway to bedroom 1 (unlocked)
    this.addDoor(12, 3, true, 15); // hallway to bedroom 2 (locked)

    // Bathroom door
    this.addDoor(13, 5, false);

    // --- Zombies ---
    // Ground floor shambler
    this.zombies.push({ x: 10, y: 5, moveTimer: 0, type: 'shambler' });
    // Upper floor shambler
    this.zombies.push({ x: 15, y: 3, moveTimer: 0, type: 'shambler' });
    // Attic shambler
    this.zombies.push({ x: 10, y: 1, moveTimer: 0, type: 'shambler' });
    // Basement crawlers
    this.zombies.push({ x: 8, y: 8, moveTimer: 0, type: 'crawler' });
    this.zombies.push({ x: 14, y: 8, moveTimer: 0, type: 'crawler' });

    // --- Spawn points for noise-triggered zombies ---
    this.spawnPoints = [
      { x: 1, y: 5, type: 'shambler' },   // front door
      { x: 18, y: 5, type: 'shambler' },   // back door
    ];

    // Define floor boundaries for rendering
    this.floors = [
      { label: 'Attic',    yCeiling: 0, yFloor: 1 },
      { label: 'Upper',    yCeiling: 2, yFloor: 3 },
      { label: 'Ground',   yCeiling: 4, yFloor: 5 },
      { label: 'Basement', yCeiling: 6, yFloor: 8 },
    ];
  }

  onPlayerMove(x, y) {
    const tile = this.map[y][x];

    // Creaky stairs — extra noise, alerts upstairs zombies
    if (tile === TILE_CREAKY) {
      this.addNoise(18);
      if (!this.creakyAlerted) {
        this.creakyAlerted = true;
        // Wake basement zombies — reduce their move timers
        for (const z of this.zombies) {
          if (z.y >= 7) z.moveTimer = 0;
        }
      }
    }

    // Stairs — normal noise
    if (tile === TILE_STAIRS) {
      this.addNoise(4);
    }
  }

  // ========== SIDE-VIEW RENDER ==========

  render(ctx) {
    // Background
    ctx.fillStyle = '#08080d';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.renderSideViewBackground(ctx);
    this.renderMap(ctx);
    this.renderContainers(ctx);
    this.renderDoors(ctx);
    this.renderZombies(ctx);
    this.renderPlayer(ctx);
    this.renderSearchBar(ctx);
    this.renderHUD_overlay(ctx);
    this.renderShotFlash(ctx);
  }

  renderSideViewBackground(ctx) {
    // Draw exterior walls (house outline)
    ctx.strokeStyle = '#4a4050';
    ctx.lineWidth = 1;

    // Roof peak
    ctx.beginPath();
    ctx.moveTo(6 * TILE, 0);
    ctx.lineTo(10 * TILE, -TILE);
    ctx.lineTo(14 * TILE, 0);
    ctx.stroke();

    // Draw floor/ceiling lines for each level
    for (const floor of this.floors) {
      const ceilingY = floor.yCeiling * TILE;
      const floorY = (floor.yFloor + 1) * TILE;

      // Ceiling line
      ctx.strokeStyle = '#3a3545';
      ctx.beginPath();
      ctx.moveTo(0, ceilingY);
      ctx.lineTo(this.mapCols * TILE, ceilingY);
      ctx.stroke();

      // Floor line (thicker)
      ctx.strokeStyle = '#4a4555';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(this.mapCols * TILE, floorY);
      ctx.stroke();
      ctx.lineWidth = 1;

      // Wall fill between ceiling and floor
      ctx.fillStyle = '#12111a';
      // Left wall
      ctx.fillRect(0, ceilingY, TILE, floorY - ceilingY);
      // Right wall
      ctx.fillRect((this.mapCols - 1) * TILE, ceilingY, TILE, floorY - ceilingY);
    }

    // Room divider lines (vertical)
    const dividers = [7, 13]; // between rooms
    for (const dx of dividers) {
      ctx.strokeStyle = '#2a2535';
      ctx.beginPath();
      // Ground floor dividers
      ctx.moveTo(dx * TILE, 4 * TILE);
      ctx.lineTo(dx * TILE, 6 * TILE);
      ctx.stroke();
    }

    // Room labels
    ctx.globalAlpha = 0.3;
    this.drawText(ctx, 'LIVING', 2 * TILE, 5 * TILE + 12, '#665577', 4);
    this.drawText(ctx, 'KITCHEN', 8 * TILE, 5 * TILE + 12, '#665577', 4);
    this.drawText(ctx, 'BATH', 14 * TILE, 5 * TILE + 12, '#665577', 4);
    this.drawText(ctx, 'BED 1', 2 * TILE, 3 * TILE + 12, '#665577', 4);
    this.drawText(ctx, 'BED 2', 14 * TILE, 3 * TILE + 12, '#665577', 4);
    this.drawText(ctx, 'ATTIC', 8 * TILE, 1 * TILE + 12, '#665577', 4);
    this.drawText(ctx, 'BASEMENT', 7 * TILE, 8 * TILE + 12, '#554455', 4);
    ctx.globalAlpha = 1.0;

    // Basement darkness overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(3 * TILE, 7 * TILE, 14 * TILE, 2 * TILE);
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
          // Draw stair steps
          ctx.fillStyle = '#2a2530';
          ctx.fillRect(tx, ty, TILE, TILE);
          for (let s = 0; s < 4; s++) {
            ctx.fillStyle = '#3d3848';
            ctx.fillRect(tx + 1, ty + s * 4, TILE - 2, 2);
          }
        } else if (tile === TILE_CREAKY) {
          // Creaky stairs — yellowish tint
          ctx.fillStyle = '#2a2820';
          ctx.fillRect(tx, ty, TILE, TILE);
          for (let s = 0; s < 4; s++) {
            ctx.fillStyle = '#4d4838';
            ctx.fillRect(tx + 1, ty + s * 4, TILE - 2, 2);
          }
          // Warning indicator
          if (Math.floor(this.timer * 3) % 2 === 0) {
            ctx.fillStyle = 'rgba(200, 180, 50, 0.15)';
            ctx.fillRect(tx, ty, TILE, TILE);
          }
        } else if (tile === TILE_DOOR) {
          ctx.fillStyle = '#553322';
          ctx.fillRect(tx, ty, TILE, TILE);
        } else {
          // Floor
          ctx.fillStyle = this.floorColor;
          ctx.fillRect(tx, ty, TILE, TILE);
          // Subtle floor texture
          if ((x + y) % 3 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            ctx.fillRect(tx, ty, TILE, TILE);
          }
        }
      }
    }
  }
}
