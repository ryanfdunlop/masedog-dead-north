// ============================================================
// MASEDOG: Dead North — Pharmacy Location
// Front store → prescription counter → dispensary → office.
// Bloater zombie guards the medicine jackpot.
// Loot focus: medicine.
// ============================================================

import { LocationBase, TILE } from './location-base.js';

export class LocationPharmacy extends LocationBase {
  constructor() {
    super();
    this.mapCols = 18;
    this.mapRows = 10;
    this.locationName = 'PHARMACY';
    this.maxTime = 90;
    this.floorColor = '#1a1c1e';
    this.wallColor = '#3a3a44';
    this.wallInner = '#2c2c38';
    this.alarmTriggered = false;
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
    // Front store (cols 1-6): mostly-looted shelves
    // Prescription counter wall (col 7, rows 1-8) with locked door
    // Dispensary (cols 8-12): medicine jackpot + bloater
    // Office wall (col 13, rows 1-5) with door
    // Office (cols 14-16): safe

    // ── Front store shelves (mostly empty aesthetic) ──
    // Two short shelf rows
    this.map[3][2] = 1;
    this.map[3][3] = 1;
    this.map[3][4] = 1;
    this.map[6][2] = 1;
    this.map[6][3] = 1;
    this.map[6][4] = 1;

    // ── Prescription counter wall ──
    for (let y = 1; y <= 8; y++) this.map[y][7] = 1;
    // Locked door in counter wall at y=5
    this.map[5][7] = 0;
    this.addDoor(7, 5, true, 30);

    // ── Dispensary internal shelving ──
    this.map[2][9] = 1;
    this.map[2][10] = 1;
    this.map[6][9] = 1;
    this.map[6][10] = 1;
    this.map[4][11] = 1;

    // ── Office wall ──
    for (let y = 1; y <= 5; y++) this.map[y][13] = 1;
    // Door into office at y=4
    this.map[4][13] = 0;
    this.addDoor(13, 4, true, 20);

    // Office furniture
    this.map[2][15] = 1; // desk
    this.map[2][16] = 1;

    // ── Alarm tile near prescription door (tile type 5) ──
    this.map[5][6] = 5;

    // ── Entry on left wall at y=4 ──
    this.map[4][0] = 0;

    // ── Exit ──
    this.exitPos = { x: 1, y: 4 };
    this.map[4][0] = 2;

    // ── Player start ──
    this.player.x = 1;
    this.player.y = 4;

    // ── Front store containers (mostly picked over — 2 items left) ──
    this.addContainer(2, 3, 'food', 1, 8);
    this.addContainer(4, 6, 'water', 1, 8);

    // ── Dispensary containers — the jackpot ──
    this.addContainer(9, 2, 'medicine', 2, 10);
    this.addContainer(10, 2, 'medicine', 1, 10);
    this.addContainer(9, 6, 'medicine', 2, 10);
    this.addContainer(10, 6, 'medicine', 1, 10);
    this.addContainer(11, 4, 'medicine', 1, 12);

    // ── Office safe — big reward ──
    this.addContainer(16, 2, 'medicine', 3, 15);
    this.addContainer(15, 2, 'scrap', 2, 15);

    // ── Dead zombie in corner has the key (flavor — mechanically just break the door) ──
    // Visual: container that looks like a body
    this.addContainer(5, 8, 'scrap', 1, 5); // dead zombie's pockets

    // ── Zombies ──
    // Bloater in dispensary
    this.zombies.push({ x: 10, y: 4, moveTimer: 0, type: 'bloater' });
    // Shambler in front store
    this.zombies.push({ x: 3, y: 5, moveTimer: 0, type: 'shambler' });

    // ── Spawn points ──
    this.spawnPoints = [
      { x: 1, y: 4 },   // front entry
      { x: 16, y: 8 }    // back of pharmacy
    ];
  }

  onPlayerMove(x, y) {
    // Alarm tile — massive noise burst (one-time)
    if (this.map[y] && this.map[y][x] === 5 && !this.alarmTriggered) {
      this.alarmTriggered = true;
      this.addNoise(60);
      this.map[y][x] = 0; // disable after triggering
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
        } else if (tile === 5) {
          // Alarm tile — red-tinted floor
          ctx.fillStyle = '#2a1a1a';
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.fillStyle = '#553333';
          ctx.fillRect(tx + 4, ty + 4, 8, 8);
          ctx.fillStyle = '#cc4444';
          ctx.fillRect(tx + 6, ty + 6, 4, 4);
        } else {
          ctx.fillStyle = this.floorColor;
          ctx.fillRect(tx, ty, TILE, TILE);
        }
      }
    }
  }
}
