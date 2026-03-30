// ============================================================
// MASEDOG: Dead North — Roadside Motel Location
// L-shaped: parking lot → office → 6 rooms → pool area.
// Master key in office. Hope note in one room. Mixed loot.
// ============================================================

import { LocationBase, TILE } from './location-base.js';

export class LocationMotel extends LocationBase {
  constructor() {
    super();
    this.mapCols = 22;
    this.mapRows = 11;
    this.locationName = 'ROADSIDE MOTEL';
    this.maxTime = 100;
    this.floorColor = '#1e1c1a';
    this.wallColor = '#3d3830';
    this.wallInner = '#312d27';
    this.hasMasterKey = false;
    this.noteFound = false;
  }

  buildMap() {
    this.map = [];
    for (let y = 0; y < this.mapRows; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.mapCols; x++) {
        this.map[y][x] = 0;
      }
    }

    // ── Overall shape: L-shaped ──
    // Top section: parking (cols 0-4) + office (cols 5-7) + corridor + rooms (cols 8-21)
    // Bottom section: pool area (cols 10-21, rows 7-10)

    // ── Outer walls — top building ──
    // Top wall
    for (let x = 5; x <= 21; x++) this.map[0][x] = 1;
    // Bottom wall of building (row 6, cols 5-21)
    for (let x = 5; x <= 21; x++) this.map[6][x] = 1;
    // Left wall of office
    for (let y = 0; y <= 6; y++) this.map[y][5] = 1;
    // Right wall
    for (let y = 0; y <= 6; y++) this.map[y][21] = 1;

    // ── Office (cols 6-7, rows 1-5) ──
    // Office right wall
    for (let y = 0; y <= 6; y++) this.map[y][8] = 1;
    // Office door at y=3
    this.map[3][8] = 0;
    this.addDoor(8, 3, false, 15); // unlocked

    // Office furniture — desk
    this.map[2][6] = 1;
    this.map[4][7] = 1;

    // ── Corridor (row 5, cols 9-20) ──
    // Corridor runs along bottom of rooms (row 5 is open, rooms are rows 1-4)

    // ── 6 Motel rooms — each 2 tiles wide, rows 1-4 ──
    // Room divider walls
    const roomStarts = [9, 11, 13, 15, 17, 19];
    for (const rx of roomStarts) {
      // Left wall of each room (shared with previous)
      for (let y = 0; y <= 4; y++) this.map[y][rx] = 1;
    }
    // Right wall of last room already at 21

    // Room doors along corridor (row 4, into rooms)
    // Each room door is at (rx, 4) — 50% locked
    const roomDoors = [];
    for (let i = 0; i < 6; i++) {
      const dx = roomStarts[i] + 1;
      if (dx <= 20) {
        this.map[4][dx] = 0; // clear for door
        // Alternate locked/unlocked
        const locked = (i % 2 === 0);
        this.addDoor(dx, 4, locked, 20);
        roomDoors.push({ x: dx, y: 4, locked, roomIdx: i });
      }
    }

    // Clear corridor floor (row 5)
    // Already floor by default

    // ── Pool area (bottom-right) ──
    // Pool walls
    for (let x = 10; x <= 21; x++) this.map[7][x] = 1;
    for (let x = 10; x <= 21; x++) this.map[10][x] = 1;
    for (let y = 7; y <= 10; y++) this.map[y][10] = 1;
    for (let y = 7; y <= 10; y++) this.map[y][21] = 1;
    // Pool gate opening
    this.map[7][12] = 0;
    // Pool water tiles (visual — still walkable but tile type 6)
    for (let x = 13; x <= 19; x++) {
      this.map[8][x] = 6;
      this.map[9][x] = 6;
    }
    // Pool edges (walls to keep you out of water center)
    // Actually keep as walkable — pool is drained, just colored differently

    // ── Parking lot (cols 0-4) — open with a few car obstacles ──
    // Cars as wall blocks
    this.map[2][1] = 1;
    this.map[2][2] = 1;
    this.map[5][1] = 1;
    this.map[5][2] = 1;
    this.map[8][2] = 1;
    this.map[8][3] = 1;

    // ── Entry from parking lot, left side ──
    this.map[5][5] = 0; // entry through office wall
    this.addDoor(5, 5, false, 10);

    // ── Exit — back out to parking ──
    this.exitPos = { x: 0, y: 4 };
    this.map[4][0] = 2; // exit at edge of parking

    // ── Player start ──
    this.player.x = 1;
    this.player.y = 4;

    // ── Office containers — master key! ──
    this.addContainer(6, 2, 'scrap', 1, 8);    // desk drawer
    this.addContainer(7, 4, 'food', 1, 6);      // mini fridge
    // Master key — represented as a special container
    this.containers.push({
      x: 7, y: 1, searched: false, lootType: 'key', lootAmount: 1, noiseLevel: 3,
      isMasterKey: true
    });

    // ── Room loot — random-ish per room ──
    const roomLoot = [
      { type: 'food', amt: 1 },
      { type: 'water', amt: 1 },
      { type: 'medicine', amt: 1 },
      { type: 'scrap', amt: 1 },
      { type: 'ammo', amt: 2 },
      { type: 'food', amt: 1 }
    ];
    for (let i = 0; i < 6; i++) {
      const rx = roomStarts[i] + 1;
      if (rx <= 20) {
        this.addContainer(rx, 2, roomLoot[i].type, roomLoot[i].amt, 10);
      }
    }

    // Room 4 (index 3) has the hope note — handled in onPlayerMove
    // We'll use tile type 7 for the note location
    this.map[2][16] = 7;

    // ── Ice machine in corridor (high noise, gives water) ──
    this.map[5][15] = 1; // ice machine as wall tile
    this.addContainer(15, 5, 'water', 2, 40);

    // ── Zombies ──
    // 30% chance per room = ~2 zombies in rooms
    // Place 2 zombies in rooms
    this.zombies.push({ x: 10, y: 2, moveTimer: 0, type: 'shambler' });
    this.zombies.push({ x: 16, y: 2, moveTimer: 0, type: 'shambler' });
    // 1 zombie by pool
    this.zombies.push({ x: 15, y: 9, moveTimer: 0, type: 'shambler' });

    // ── Spawn points ──
    this.spawnPoints = [
      { x: 1, y: 7 },    // parking lot side
      { x: 12, y: 7 },   // pool gate
      { x: 20, y: 5 }    // end of corridor
    ];
  }

  onPlayerMove(x, y) {
    // Master key pickup — unlock all doors
    if (!this.hasMasterKey) {
      const keyContainer = this.containers.find(c => c.isMasterKey && c.searched);
      if (keyContainer) {
        this.hasMasterKey = true;
        // Unlock all remaining doors
        for (const door of this.doors) {
          if (door.locked && !door.broken) {
            door.locked = false;
            // Update map tile from door to floor
            if (this.map[door.y][door.x] === 3) {
              this.map[door.y][door.x] = 0;
            }
          }
        }
      }
    }

    // Hope note — morale boost flavor
    if (this.map[y] && this.map[y][x] === 7 && !this.noteFound) {
      this.noteFound = true;
      this.score += 5; // morale +5 represented as score
      this.map[y][x] = 0;
      // The loot system will pick up the morale bonus
      this.loot.push({ type: 'morale', amount: 5 });
    }

    // Pool tiles — cosmetic only
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
        } else if (tile === 6) {
          // Drained pool — blue-gray concrete
          ctx.fillStyle = '#1a2228';
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.fillStyle = '#223038';
          ctx.fillRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
        } else if (tile === 7) {
          // Note on floor
          ctx.fillStyle = this.floorColor;
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.fillStyle = '#aa9966';
          ctx.fillRect(tx + 3, ty + 4, 10, 8);
          ctx.fillStyle = '#665533';
          ctx.fillRect(tx + 5, ty + 6, 6, 1);
          ctx.fillRect(tx + 5, ty + 8, 4, 1);
        } else {
          ctx.fillStyle = this.floorColor;
          ctx.fillRect(tx, ty, TILE, TILE);
        }
      }
    }
  }
}
