// ============================================================
// MASEDOG: Dead North — Convenience Store Location
// Small tight store with 3 aisles, counter, and storage room.
// Loot focus: food, water, medicine.
// ============================================================

import { LocationBase, TILE } from './location-base.js';

export class LocationStore extends LocationBase {
  constructor() {
    super();
    this.mapCols = 15;
    this.mapRows = 9;
    this.locationName = 'CORNER STORE';
    this.maxTime = 60;
    this.floorColor = '#1c1a1e';
    this.wallColor = '#3a3540';
    this.wallInner = '#2e2a33';
  }

  buildMap() {
    // Initialize all floor
    this.map = [];
    for (let y = 0; y < this.mapRows; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.mapCols; x++) {
        this.map[y][x] = 0;
      }
    }

    // Outer walls
    for (let x = 0; x < this.mapCols; x++) {
      this.map[0][x] = 1;
      this.map[this.mapRows - 1][x] = 1;
    }
    for (let y = 0; y < this.mapRows; y++) {
      this.map[y][0] = 1;
      this.map[y][this.mapCols - 1] = 1;
    }

    // ── Layout ──
    // Entry door on left wall at y=4
    // 3 aisles of shelves running vertically (cols 3, 6, 9)
    // Counter at back (col 12)
    // Storage room behind locked door (cols 11-13, rows 1-3)

    // Aisle 1 — shelves at col 3, rows 2-6
    for (let y = 2; y <= 6; y++) this.map[y][3] = 1;
    // Aisle 2 — shelves at col 6, rows 2-6
    for (let y = 2; y <= 6; y++) this.map[y][6] = 1;
    // Aisle 3 — shelves at col 9, rows 2-6
    for (let y = 2; y <= 6; y++) this.map[y][9] = 1;

    // Counter — a wall block at back right
    this.map[5][12] = 1;
    this.map[6][12] = 1;
    this.map[7][12] = 1;

    // Storage room walls (top-right corner)
    // Back wall already exists (row 0). Add internal walls:
    this.map[3][11] = 1;
    this.map[3][12] = 1;
    this.map[3][13] = 1;
    // Door into storage at col 11, row 3 (locked)
    this.map[3][11] = 0; // clear for door placement
    this.addDoor(11, 3, true, 30);

    // Glass on floor near entry (tile type 4)
    this.map[4][1] = 4;
    this.map[5][1] = 4;
    this.map[3][2] = 4;

    // ── Entry door on left wall ──
    this.map[4][0] = 0; // open entry

    // ── Exit ──
    this.exitPos = { x: 1, y: 4 };
    this.map[4][0] = 2; // exit marker on wall

    // ── Player start ──
    this.player.x = 2;
    this.player.y = 4;

    // ── Containers ──
    // Shelves — food and water along aisle tops/sides
    this.addContainer(3, 2, 'food', 1, 8);
    this.addContainer(3, 4, 'water', 1, 8);
    this.addContainer(6, 2, 'food', 1, 8);
    this.addContainer(6, 5, 'water', 1, 8);
    this.addContainer(9, 3, 'food', 1, 8);
    this.addContainer(9, 6, 'water', 1, 8);

    // Counter — medicine
    this.addContainer(12, 5, 'medicine', 1, 10);

    // Cash register on counter (very noisy, gives scrap)
    this.addContainer(12, 6, 'scrap', 2, 35);

    // Storage room — good loot behind locked door
    this.addContainer(12, 1, 'food', 2, 8);
    this.addContainer(13, 1, 'scrap', 1, 8);
    this.addContainer(13, 2, 'ammo', 2, 8);

    // ── Zombies ──
    this.zombies.push({ x: 4, y: 3, moveTimer: 0, type: 'shambler' });
    this.zombies.push({ x: 7, y: 5, moveTimer: 0, type: 'shambler' });

    // ── Spawn points — entry door and a vent in the back ──
    this.spawnPoints = [
      { x: 1, y: 4 },
      { x: 13, y: 7 }
    ];
  }

  onPlayerMove(x, y) {
    // Glass tiles — extra noise when walked on
    if (this.map[y] && this.map[y][x] === 4) {
      this.addNoise(15);
    }
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
        } else if (tile === 4) {
          // Glass shards on floor
          ctx.fillStyle = this.floorColor;
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.fillStyle = '#556688';
          ctx.fillRect(tx + 2, ty + 5, 3, 1);
          ctx.fillRect(tx + 8, ty + 3, 4, 1);
          ctx.fillRect(tx + 5, ty + 10, 3, 1);
          ctx.fillRect(tx + 11, ty + 8, 2, 1);
        } else {
          ctx.fillStyle = this.floorColor;
          ctx.fillRect(tx, ty, TILE, TILE);
        }
      }
    }
  }
}
