// ============================================================
// MASEDOG: Dead North — Mini-Game Base Class
// Shared infrastructure for all canvas-based mini-games.
// Handles: canvas setup, game loop, input, sprites, camera.
// ============================================================

// Internal resolution (scaled up with CSS for pixel-perfect look)
export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;

export class MinigameBase {
  constructor(containerId = 'minigame-container') {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.animFrameId = null;
    this.lastTime = 0;
    this.accumulator = 0;
    this.tickRate = 1 / 60; // 60 updates per second

    // Input state
    this.keys = {};
    this.keysJustPressed = {};
    this.touch = { active: false, x: 0, y: 0 };

    // Game state
    this.score = 0;
    this.timer = 0;
    this.maxTime = 30; // seconds
    this.result = null; // { success, score, data }

    // Callbacks
    this.onComplete = null;

    this.containerId = containerId;
  }

  /**
   * Initialize the mini-game canvas and UI.
   */
  init() {
    // Create container
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = this.containerId;
      this.container.className = 'minigame-container';
      document.body.appendChild(this.container);
    }
    this.container.innerHTML = '';
    this.container.style.display = 'flex';

    // Create canvas at internal resolution
    this.canvas = document.createElement('canvas');
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
    this.canvas.className = 'minigame-canvas';
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // HUD overlay
    this.hudEl = document.createElement('div');
    this.hudEl.className = 'minigame-hud';
    this.container.appendChild(this.hudEl);

    // Bind input
    this._onKeyDown = (e) => {
      if (!this.keys[e.code]) this.keysJustPressed[e.code] = true;
      this.keys[e.code] = true;
      e.preventDefault();
    };
    this._onKeyUp = (e) => {
      this.keys[e.code] = false;
    };
    this._onTouchStart = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = GAME_WIDTH / rect.width;
      const scaleY = GAME_HEIGHT / rect.height;
      this.touch.active = true;
      this.touch.x = (e.touches[0].clientX - rect.left) * scaleX;
      this.touch.y = (e.touches[0].clientY - rect.top) * scaleY;
    };
    this._onTouchEnd = () => { this.touch.active = false; };
    this._onClick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = GAME_WIDTH / rect.width;
      const scaleY = GAME_HEIGHT / rect.height;
      this.touch.x = (e.clientX - rect.left) * scaleX;
      this.touch.y = (e.clientY - rect.top) * scaleY;
      this.touch.active = true;
      setTimeout(() => { this.touch.active = false; }, 100);
    };

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    this.canvas.addEventListener('touchstart', this._onTouchStart);
    this.canvas.addEventListener('touchend', this._onTouchEnd);
    this.canvas.addEventListener('click', this._onClick);
  }

  /**
   * Start the game loop.
   */
  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.timer = 0;
    this.result = null;
    this.loop(performance.now());
  }

  /**
   * Main game loop — fixed timestep update, variable render.
   */
  loop(currentTime) {
    if (!this.running) return;

    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp to prevent spiral of death
    if (dt > 0.25) dt = 0.25;

    this.accumulator += dt;

    while (this.accumulator >= this.tickRate) {
      this.update(this.tickRate);
      this.keysJustPressed = {};
      this.accumulator -= this.tickRate;
    }

    this.render(this.ctx);
    this.renderHUD();

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Override in subclass — game logic update.
   */
  update(dt) {
    this.timer += dt;
    if (this.timer >= this.maxTime) {
      this.complete(false, this.score);
    }
  }

  /**
   * Override in subclass — render the game.
   */
  render(ctx) {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  /**
   * Render the mini-game HUD (timer, score).
   */
  renderHUD() {
    if (!this.hudEl) return;
    const timeLeft = Math.max(0, Math.ceil(this.maxTime - this.timer));
    this.hudEl.innerHTML = `
      <span class="mg-timer">${timeLeft}s</span>
      <span class="mg-score">Score: ${this.score}</span>
    `;
  }

  /**
   * Complete the mini-game.
   */
  complete(success, score = 0, data = {}) {
    this.running = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    this.result = { success, score, ...data };

    // Show result banner
    this.showResultBanner(success);

    // Cleanup after delay
    setTimeout(() => {
      this.cleanup();
      if (this.onComplete) this.onComplete(this.result);
    }, 1500);
  }

  /**
   * Show success/failure banner.
   */
  showResultBanner(success) {
    const banner = document.createElement('div');
    banner.className = `minigame-result ${success ? 'success' : 'failure'}`;
    banner.textContent = success ? 'SUCCESS!' : 'FAILED!';
    this.container.appendChild(banner);
  }

  /**
   * Clean up — remove canvas, unbind input.
   */
  cleanup() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this._onTouchStart);
      this.canvas.removeEventListener('touchend', this._onTouchEnd);
      this.canvas.removeEventListener('click', this._onClick);
    }
    if (this.container) {
      this.container.style.display = 'none';
      this.container.innerHTML = '';
    }
  }

  // === UTILITY METHODS ===

  /**
   * Check if a key is currently held down.
   */
  isKeyDown(code) {
    return !!this.keys[code];
  }

  /**
   * Check if a key was just pressed this frame.
   */
  isKeyPressed(code) {
    return !!this.keysJustPressed[code];
  }

  /**
   * AABB collision detection.
   */
  collides(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }

  /**
   * Draw a pixel-art rectangle.
   */
  drawRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  /**
   * Draw text with pixel font styling.
   */
  drawText(ctx, text, x, y, color = '#fff', size = 8) {
    ctx.fillStyle = color;
    ctx.font = `${size}px "Press Start 2P", monospace`;
    ctx.fillText(text, Math.round(x), Math.round(y));
  }

  /**
   * Clamp a value between min and max.
   */
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Simple random in range.
   */
  rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Random integer in range [min, max].
   */
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
