// ============================================================
// MASEDOG: Dead North — Shopping Mall Location
// BIGGEST map. Food court, sports store, pharmacy, electronics,
// loading dock. Screamer zombie spawns extra danger.
// Loot focus: EVERYTHING.
// ============================================================

import { LocationBase, TILE } from './location-base.js';

export class LocationMall extends LocationBase {
  constructor() {
    super();
    this.mapCols = 24;
    this.mapRows = 14;
    this.locationName = 'SHOPPING MALL';
    this.maxTime = 150;
    this.maxZombies = 10;
    this.floorColor = '#1c1c20';
    this.wallColor = '#3a3840';
    this.wallInner = '#2e2c34';
    this.screamerTriggered = false;
    this.screamerPos = { x: 12, y: 7 };
  }

  buildMap() {
    this.map = [];
    for (let y = 0; y < this.mapRows; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.mapCols; x++) {
        this.map[y][x] = 0;
      }
    }

    // ── Outer walls ──
    for (let x = 0; x < this.mapCols; x++) {
      this.map[0][x] = 1;
      this.map[this.mapRows - 1][x] = 1;
    }
    for (let y = 0; y < this.mapRows; y++) {
      this.map[y][0] = 1;
      this.map[y][this.mapCols - 1] = 1;
    }

    // ══════════════════════════════════════════
    // LAYOUT:
    //
    //  Row 0:  [wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall]
    //  Row 1:  [wall] FOOD COURT (cols 1-7)        | SPORTS (9-12) | PHARMACY (14-17) | ELECTRONICS (19-22) [wall]
    //  Row 2:  [wall]                               |               |                  |                     [wall]
    //  Row 3:  [wall]                               |               |                  |                     [wall]
    //  Row 4:  [wall]===== wall separating from corridor ====================================               [wall]
    //  Row 5:  [wall]                                                                                       [wall]
    //  Row 6:  [wall] MAIN CORRIDOR (full width)    SCREAMER here                          ESCALATOR →      [wall]
    //  Row 7:  [wall]                                                                                       [wall]
    //  Row 8:  [wall]===== wall separating from bottom =====================================                [wall]
    //  Row 9:  [wall] ENTRY      | empty  | LOADING DOCK (cols 18-22)                                       [wall]
    //  Row 10: [wall]            |        |                                                                 [wall]
    //  Row 11: [wall]            |        |                                                                 [wall]
    //  Row 12: [wall]            |        |                                                                 [wall]
    //  Row 13: [wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall wall]
    // ══════════════════════════════════════════

    // ── Corridor separation walls ──
    // Top wall (row 4) — separates stores from corridor
    for (let x = 1; x <= 22; x++) this.map[4][x] = 1;
    // Bottom wall (row 8) — separates corridor from bottom area
    for (let x = 1; x <= 22; x++) this.map[8][x] = 1;

    // ── Openings in corridor walls (doorways into stores) ──
    this.map[4][3] = 0;   // food court entry
    this.map[4][10] = 0;  // sports store entry
    this.map[4][15] = 0;  // pharmacy entry
    this.map[4][20] = 0;  // electronics entry

    // Bottom wall openings
    this.map[8][2] = 0;   // entry area access
    this.map[8][20] = 0;  // loading dock access

    // ── FOOD COURT (cols 1-7, rows 1-3) ──
    // Divider wall from sports
    for (let y = 0; y <= 4; y++) this.map[y][8] = 1;
    // Tables (wall tiles as furniture)
    this.map[2][2] = 1;
    this.map[2][5] = 1;
    this.map[3][3] = 1;
    this.map[1][6] = 1;

    // ── SPORTS STORE (cols 9-12, rows 1-3) ──
    for (let y = 0; y <= 4; y++) this.map[y][13] = 1;
    // Display racks
    this.map[2][10] = 1;
    this.map[2][12] = 1;

    // ── PHARMACY SECTION (cols 14-17, rows 1-3) ──
    for (let y = 0; y <= 4; y++) this.map[y][18] = 1;
    // Shelves
    this.map[2][15] = 1;
    this.map[2][17] = 1;

    // ── ELECTRONICS (cols 19-22, rows 1-3) ──
    // Display cases
    this.map[2][20] = 1;
    this.map[2][22] = 1;

    // ── MAIN CORRIDOR (rows 5-7) ──
    // Benches/planters as obstacles
    this.map[6][6] = 1;
    this.map[6][16] = 1;

    // ── ESCALATOR AREA (top-right, cols 21-22, rows 5-7) ──
    // Escalator tiles (type 8)
    this.map[5][22] = 8;
    this.map[6][22] = 8;
    this.map[7][22] = 8;

    // ── ENTRY AREA (bottom-left, cols 1-5, rows 9-12) ──
    // Some rubble/barriers
    this.map[10][4] = 1;
    this.map[11][3] = 1;

    // Divider between entry and middle area
    for (let y = 8; y <= 13; y++) this.map[y][7] = 1;
    this.map[10][7] = 0; // passage

    // ── LOADING DOCK (cols 18-22, rows 9-12) ──
    for (let y = 8; y <= 13; y++) this.map[y][17] = 1;
    this.map[10][17] = 0; // passage from middle
    // Locked loading dock door
    this.addDoor(20, 8, true, 30);
    // Crates inside
    this.map[10][19] = 1;
    this.map[11][21] = 1;
    this.map[12][19] = 1;

    // ── Entry on left wall ──
    this.map[10][0] = 0;

    // ── Exit ──
    this.exitPos = { x: 1, y: 10 };
    this.map[10][0] = 2;

    // ── Player start ──
    this.player.x = 1;
    this.player.y = 10;

    // ══════════════════════════════
    // CONTAINERS
    // ══════════════════════════════

    // Food court — 4 food containers
    this.addContainer(2, 1, 'food', 1, 8);
    this.addContainer(4, 1, 'food', 2, 8);
    this.addContainer(6, 1, 'food', 1, 10);
    this.addContainer(5, 3, 'food', 1, 8);

    // Sports store — ammo and scrap
    this.addContainer(10, 1, 'ammo', 2, 10);
    this.addContainer(11, 3, 'scrap', 2, 10);
    this.addContainer(12, 1, 'ammo', 1, 10);

    // Pharmacy section — medicine
    this.addContainer(15, 1, 'medicine', 2, 10);
    this.addContainer(16, 3, 'medicine', 1, 10);

    // Electronics — scrap + special
    this.addContainer(20, 1, 'scrap', 2, 12);
    this.addContainer(21, 3, 'scrap', 1, 12);
    this.addContainer(21, 1, 'ammo', 1, 12); // batteries repurposed

    // Loading dock — fuel and scrap (behind locked door)
    this.addContainer(20, 10, 'fuel', 2, 8);
    this.addContainer(22, 11, 'scrap', 2, 8);
    this.addContainer(20, 12, 'fuel', 1, 8);

    // Corridor — vending machine
    this.addContainer(6, 6, 'water', 1, 25);

    // Escalator bonus area (accessible but risky)
    this.addContainer(22, 5, 'medicine', 1, 15);
    this.addContainer(22, 7, 'ammo', 2, 15);

    // Entry area scraps
    this.addContainer(2, 12, 'scrap', 1, 5);

    // ══════════════════════════════
    // ZOMBIES
    // ══════════════════════════════

    // Food court — 3 zombies
    this.zombies.push({ x: 3, y: 2, moveTimer: 0, type: 'shambler' });
    this.zombies.push({ x: 6, y: 3, moveTimer: 0, type: 'shambler' });
    this.zombies.push({ x: 1, y: 3, moveTimer: 0, type: 'shambler' });

    // Screamer in main corridor (special — handled in onPlayerMove)
    this.zombies.push({ x: 12, y: 6, moveTimer: 0, type: 'screamer' });

    // One in loading dock
    this.zombies.push({ x: 21, y: 10, moveTimer: 0, type: 'shambler' });

    // ── Spawn points ──
    this.spawnPoints = [
      { x: 1, y: 10 },   // entry
      { x: 3, y: 5 },    // corridor left
      { x: 22, y: 6 },   // corridor right
      { x: 12, y: 12 }   // bottom middle
    ];
  }

  onPlayerMove(x, y) {
    // Screamer zombie detection — if player gets within 3 tiles
    if (!this.screamerTriggered) {
      const screamer = this.zombies.find(z => z.type === 'screamer');
      if (screamer) {
        const dist = Math.abs(x - screamer.x) + Math.abs(y - screamer.y);
        if (dist <= 3) {
          this.screamerTriggered = true;
          this.addNoise(80); // Massive noise
          // Spawn 4 extra zombies from various points
          const extraSpawns = [
            { x: 3, y: 5 },
            { x: 20, y: 5 },
            { x: 10, y: 12 },
            { x: 15, y: 7 }
          ];
          for (const sp of extraSpawns) {
            if (this.zombies.length < this.maxZombies) {
              this.zombies.push({ x: sp.x, y: sp.y, moveTimer: 0.5, type: 'shambler' });
            }
          }
        }
      }
    }

    // Escalator tiles — visual flavor only
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
        } else if (tile === 8) {
          // Escalator tiles — metallic stripes
          ctx.fillStyle = '#2a2a30';
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.fillStyle = '#3a3a44';
          for (let s = 0; s < TILE; s += 4) {
            ctx.fillRect(tx, ty + s, TILE, 2);
          }
          ctx.fillStyle = '#444450';
          ctx.fillRect(tx, ty, 2, TILE);
          ctx.fillRect(tx + TILE - 2, ty, 2, TILE);
        } else {
          ctx.fillStyle = this.floorColor;
          ctx.fillRect(tx, ty, TILE, TILE);
        }
      }
    }

    // Screamer warning glow if nearby and not yet triggered
    if (!this.screamerTriggered) {
      const screamer = this.zombies.find(z => z.type === 'screamer');
      if (screamer) {
        const dist = Math.abs(this.player.x - screamer.x) + Math.abs(this.player.y - screamer.y);
        if (dist <= 5 && dist > 3) {
          // Subtle warning glow
          ctx.fillStyle = 'rgba(180, 40, 40, 0.08)';
          ctx.fillRect(screamer.x * TILE - 24, screamer.y * TILE - 24, 64, 64);
        }
      }
    }
  }

  renderZombies(ctx) {
    for (const z of this.zombies) {
      if (z.type === 'screamer' && !this.screamerTriggered) {
        // Screamer — pale, hunched, glowing eyes
        ctx.fillStyle = '#887766';
        ctx.fillRect(z.x * TILE + 2, z.y * TILE + 2, TILE - 4, TILE - 4);
        ctx.fillStyle = '#cc3333';
        ctx.fillRect(z.x * TILE + 4, z.y * TILE + 3, 3, 2);
        ctx.fillRect(z.x * TILE + 9, z.y * TILE + 3, 3, 2);
      } else if (z.type === 'bloater') {
        ctx.fillStyle = '#556644';
        ctx.fillRect(z.x * TILE + 1, z.y * TILE + 1, TILE - 2, TILE - 2);
        ctx.fillStyle = '#445534';
        ctx.fillRect(z.x * TILE + 2, z.y * TILE, TILE - 4, 5);
      } else {
        ctx.fillStyle = '#664444';
        ctx.fillRect(z.x * TILE + 3, z.y * TILE + 3, TILE - 6, TILE - 6);
        ctx.fillStyle = '#445544';
        ctx.fillRect(z.x * TILE + 4, z.y * TILE + 2, TILE - 8, 4);
      }
    }
  }
}
