// ============================================================
// MASEDOG: Dead North — Apartment Building (Side-View, 4 Floors)
// Lobby -> stairwell -> 4 floors of apartments. Danger escalates
// with height. Fire escape on right side. Must return to lobby.
// ============================================================

import { LocationBase, TILE } from './location-base.js';
import { GAME_WIDTH, GAME_HEIGHT } from './minigame-base.js';

const TILE_FLOOR    = 0;
const TILE_WALL     = 1;
const TILE_EXIT     = 2;
const TILE_DOOR     = 3;
const TILE_STAIRS   = 4;
const TILE_FIRE_ESC = 8; // Fire escape (exterior walkable)

export class LocationApartment extends LocationBase {
  constructor() {
    super();
    this.locationName = 'Apartment Block';
    this.viewType = 'sideview';
    this.mapCols = 20;
    this.mapRows = 14;
    this.maxTime = 120;

    this.floorColor = '#181620';
    this.wallColor = '#3c3448';
    this.wallInner = '#2c2638';

    this.floors = [];
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

    // Layout (y coords, each floor is 3 rows: ceiling, room, room):
    //  0-1:  Floor 4 / Roof (y=1 walkable)
    //  2:    ceiling
    //  3-4:  Floor 3 (y=4 walkable)
    //  5:    ceiling
    //  6-7:  Floor 2 (y=7 walkable)
    //  8:    ceiling
    //  9-10: Floor 1 (y=10 walkable)
    // 11:    ceiling
    // 12-13: Lobby (y=12 walkable)

    // Define floor levels (walkable y, ceiling y above)
    const floorDefs = [
      { name: 'Roof',    yWalk: 1,  yCeil: 0  },
      { name: 'Floor 3', yWalk: 4,  yCeil: 2  },
      { name: 'Floor 2', yWalk: 7,  yCeil: 5  },
      { name: 'Floor 1', yWalk: 10, yCeil: 8  },
      { name: 'Lobby',   yWalk: 12, yCeil: 11 },
    ];

    // Stairwell on left side (x=1..2)
    // Fire escape on right side (x=18..19)

    for (const f of floorDefs) {
      const yw = f.yWalk;
      // Walkable area across the floor
      for (let x = 1; x <= 18; x++) {
        this.map[yw][x] = TILE_FLOOR;
      }
      // Also open the row above for taller rooms (except roof)
      if (f.name !== 'Roof' && f.name !== 'Lobby') {
        const yAbove = yw - 1;
        for (let x = 1; x <= 18; x++) {
          this.map[yAbove][x] = TILE_FLOOR;
        }
      }
    }

    // Stairwell connections (left side, x=1..2)
    // Vertical connections between floors
    const stairPairs = [
      { from: 1, to: 4, x: 1 },   // roof to floor 3
      { from: 4, to: 7, x: 1 },   // floor 3 to floor 2
      { from: 7, to: 10, x: 1 },  // floor 2 to floor 1
      { from: 10, to: 12, x: 1 }, // floor 1 to lobby
    ];
    for (const sp of stairPairs) {
      for (let y = sp.from; y <= sp.to; y++) {
        this.map[y][sp.x] = TILE_STAIRS;
        this.map[y][sp.x + 1] = TILE_STAIRS;
      }
    }

    // Fire escape connections (right side, x=18)
    const escPairs = [
      { from: 1, to: 4 },
      { from: 4, to: 7 },
      { from: 7, to: 10 },
    ];
    for (const ep of escPairs) {
      for (let y = ep.from; y <= ep.to; y++) {
        this.map[y][18] = TILE_FIRE_ESC;
      }
    }

    // Room dividers (vertical walls between apartments on each floor)
    // Each floor has 2 apartments: left (x=3..9) and right (x=11..17)
    // Divider at x=10
    for (const f of floorDefs) {
      if (f.name === 'Lobby' || f.name === 'Roof') continue;
      const yw = f.yWalk;
      this.map[yw][10] = TILE_WALL;
      this.map[yw - 1][10] = TILE_WALL;
    }

    // --- Entry / Exit ---
    this.player.x = 2;
    this.player.y = 12;
    this.exitPos = { x: 2, y: 12 }; // Must return to lobby
    // Mark exit tile
    this.map[12][0] = TILE_EXIT;

    // --- Containers ---
    // Floor 1 (y=10): mostly looted, 1 container
    this.addContainer(8, 10, 'scrap', 1, 8);

    // Floor 2 (y=7): 2 containers
    this.addContainer(6, 7, 'food', 2, 8);
    this.addContainer(14, 7, 'scrap', 2, 10);

    // Floor 3 (y=4): 3 containers (good loot)
    this.addContainer(5, 4, 'ammo', 2, 10);
    this.addContainer(9, 4, 'medicine', 2, 10);
    this.addContainer(15, 4, 'food', 3, 12);

    // Roof (y=1): supply cache (best loot)
    this.addContainer(8, 1, 'ammo', 3, 8);
    this.addContainer(10, 1, 'medicine', 3, 8);
    this.addContainer(12, 1, 'food', 3, 8);

    // --- Doors ---
    // Apartment doors at room dividers
    this.addDoor(3, 10, false);         // Floor 1 left apt
    this.addDoor(11, 10, false);        // Floor 1 right apt
    this.addDoor(3, 7, false);          // Floor 2 left apt
    this.addDoor(11, 7, true, 15);      // Floor 2 right apt (locked)
    this.addDoor(3, 4, false);          // Floor 3 left apt
    this.addDoor(11, 4, true, 30);      // Floor 3 right apt (barricaded - extra noise)

    // --- Zombies (escalating danger per floor) ---
    // Floor 1: 1 zombie
    this.zombies.push({ x: 7, y: 10, moveTimer: 0, type: 'shambler' });

    // Floor 2: 2 zombies
    this.zombies.push({ x: 5, y: 7, moveTimer: 0, type: 'shambler' });
    this.zombies.push({ x: 15, y: 7, moveTimer: 0, type: 'shambler' });

    // Floor 3: 3 zombies
    this.zombies.push({ x: 6, y: 4, moveTimer: 0, type: 'shambler' });
    this.zombies.push({ x: 12, y: 4, moveTimer: 0, type: 'shambler' });
    this.zombies.push({ x: 16, y: 4, moveTimer: 0, type: 'bloater' });

    // Roof: 1 zombie guarding supply cache
    this.zombies.push({ x: 10, y: 1, moveTimer: 0, type: 'shambler' });

    // --- Spawn points ---
    this.spawnPoints = [
      { x: 2, y: 12, type: 'shambler' },  // lobby entrance
      { x: 18, y: 10, type: 'crawler' },   // fire escape floor 1
      { x: 18, y: 7, type: 'shambler' },   // fire escape floor 2
    ];

    // Store floor definitions for render
    this.floors = floorDefs;
  }

  onPlayerMove(x, y) {
    const tile = this.map[y][x];
    if (tile === TILE_STAIRS) {
      this.addNoise(3);
    }
    if (tile === TILE_FIRE_ESC) {
      this.addNoise(5); // Metal fire escape clanks
    }

    // Player reached exit check — must have explored at least one floor
    // (the base class handles the actual exit at exitPos)
  }

  // ========== SIDE-VIEW RENDER ==========

  render(ctx) {
    ctx.fillStyle = '#06060c';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.renderBuildingExterior(ctx);
    this.renderMap(ctx);
    this.renderContainers(ctx);
    this.renderDoors(ctx);
    this.renderZombies(ctx);
    this.renderPlayer(ctx);
    this.renderSearchBar(ctx);
    this.renderHUD_overlay(ctx);
    this.renderShotFlash(ctx);
  }

  renderBuildingExterior(ctx) {
    // Building outline
    ctx.strokeStyle = '#4a4258';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, this.mapCols * TILE, this.mapRows * TILE);

    // Floor/ceiling lines
    for (const f of this.floors) {
      const ceilY = f.yCeil * TILE;
      const walkY = (f.yWalk + 1) * TILE;

      // Ceiling
      ctx.strokeStyle = '#2a2538';
      ctx.beginPath();
      ctx.moveTo(0, ceilY);
      ctx.lineTo(this.mapCols * TILE, ceilY);
      ctx.stroke();

      // Floor (thicker)
      ctx.strokeStyle = '#4a4558';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, walkY);
      ctx.lineTo(this.mapCols * TILE, walkY);
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    // Stairwell shading (left column)
    ctx.fillStyle = 'rgba(20, 18, 30, 0.4)';
    ctx.fillRect(TILE, 0, 2 * TILE, this.mapRows * TILE);

    // Fire escape shading (right column)
    ctx.fillStyle = 'rgba(30, 25, 20, 0.3)';
    ctx.fillRect(18 * TILE, 0, 2 * TILE, this.mapRows * TILE);

    // Floor labels
    ctx.globalAlpha = 0.25;
    this.drawText(ctx, 'ROOF',  5 * TILE, 1 * TILE + 12, '#6666aa', 4);
    this.drawText(ctx, 'FL 3',  5 * TILE, 4 * TILE + 12, '#6666aa', 4);
    this.drawText(ctx, 'FL 2',  5 * TILE, 7 * TILE + 12, '#6666aa', 4);
    this.drawText(ctx, 'FL 1',  5 * TILE, 10 * TILE + 12, '#6666aa', 4);
    this.drawText(ctx, 'LOBBY', 5 * TILE, 12 * TILE + 12, '#6666aa', 4);
    ctx.globalAlpha = 1.0;

    // Fire escape ladder rungs (decorative)
    ctx.strokeStyle = '#554433';
    for (let y = 1; y <= 10; y++) {
      const py = y * TILE + TILE / 2;
      ctx.beginPath();
      ctx.moveTo(18 * TILE + 2, py);
      ctx.lineTo(19 * TILE - 2, py);
      ctx.stroke();
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
          ctx.fillStyle = '#222030';
          ctx.fillRect(tx, ty, TILE, TILE);
          for (let s = 0; s < 4; s++) {
            ctx.fillStyle = '#3a3548';
            ctx.fillRect(tx + 1, ty + s * 4, TILE - 2, 2);
          }
        } else if (tile === TILE_FIRE_ESC) {
          // Exterior metal grating
          ctx.fillStyle = '#1a1812';
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.strokeStyle = '#443828';
          ctx.lineWidth = 1;
          // Cross-hatch pattern
          for (let i = 0; i < TILE; i += 4) {
            ctx.beginPath();
            ctx.moveTo(tx + i, ty);
            ctx.lineTo(tx + i, ty + TILE);
            ctx.stroke();
          }
        } else if (tile === TILE_DOOR) {
          ctx.fillStyle = '#553322';
          ctx.fillRect(tx, ty, TILE, TILE);
        } else {
          ctx.fillStyle = this.floorColor;
          ctx.fillRect(tx, ty, TILE, TILE);
          if ((x + y) % 4 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.015)';
            ctx.fillRect(tx, ty, TILE, TILE);
          }
        }
      }
    }
  }
}
