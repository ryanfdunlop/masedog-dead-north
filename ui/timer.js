// ============================================================
// MASEDOG: Dead North — Choice Timer
// Dramatic countdown timer for timed choice events.
// ============================================================

let timerContainer = null;
let timerRingSvg = null;
let timerNumberEl = null;
let timerBarEl = null;
let timerBarFill = null;
let timerLabelEl = null;

let animFrameId = null;
let timerStartTime = 0;
let timerDurationMs = 0;
let timerCallback = null;
let timerActive = false;

const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Create the timer DOM elements. Call once after DOM ready.
 */
export function initTimer() {
  // Circular timer overlay (inserted above #choices)
  timerContainer = document.createElement('div');
  timerContainer.id = 'choice-timer';
  timerContainer.className = 'choice-timer hidden';

  timerContainer.innerHTML = `
    <div class="timer-ring-wrap">
      <svg class="timer-ring-svg" width="100" height="100" viewBox="0 0 100 100">
        <circle class="timer-ring-bg" cx="50" cy="50" r="${RING_RADIUS}"
          fill="none" stroke="#1a1a25" stroke-width="6" />
        <circle class="timer-ring-fg" cx="50" cy="50" r="${RING_RADIUS}"
          fill="none" stroke="var(--accent-green)" stroke-width="6"
          stroke-dasharray="${RING_CIRCUMFERENCE}"
          stroke-dashoffset="0"
          stroke-linecap="butt"
          transform="rotate(-90 50 50)" />
      </svg>
      <div class="timer-number">20</div>
    </div>
    <div class="timer-label">CHOOSE NOW</div>
    <div class="timer-bar">
      <div class="timer-bar-fill"></div>
    </div>
  `;

  // Insert before the choices container
  const choicesEl = document.getElementById('choices');
  if (choicesEl && choicesEl.parentNode) {
    choicesEl.parentNode.insertBefore(timerContainer, choicesEl);
  } else {
    document.body.appendChild(timerContainer);
  }

  // Cache references
  timerRingSvg = timerContainer.querySelector('.timer-ring-fg');
  timerNumberEl = timerContainer.querySelector('.timer-number');
  timerBarEl = timerContainer.querySelector('.timer-bar');
  timerBarFill = timerContainer.querySelector('.timer-bar-fill');
  timerLabelEl = timerContainer.querySelector('.timer-label');
}

/**
 * Start the countdown timer.
 * @param {number} seconds — total countdown time
 * @param {Function} onExpire — called when timer reaches zero
 */
export function startChoiceTimer(seconds, onExpire) {
  if (!timerContainer) initTimer();

  timerDurationMs = seconds * 1000;
  timerStartTime = performance.now();
  timerCallback = onExpire;
  timerActive = true;

  // Show the timer
  timerContainer.classList.remove('hidden');
  timerContainer.classList.remove('timer-heartbeat');
  timerContainer.classList.remove('timer-flash-red');

  // Reset ring
  timerRingSvg.style.strokeDashoffset = '0';
  timerRingSvg.style.stroke = 'var(--accent-green)';
  timerNumberEl.textContent = seconds;
  timerBarFill.style.width = '100%';

  _tick();
}

/**
 * Stop and hide the timer. Call when the player makes a choice.
 */
export function stopChoiceTimer() {
  timerActive = false;
  timerCallback = null;

  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }

  if (timerContainer) {
    timerContainer.classList.add('hidden');
    timerContainer.classList.remove('timer-heartbeat');
    timerContainer.classList.remove('timer-flash-red');
  }
}

// ---- Internal animation loop ----

function _tick() {
  if (!timerActive) return;

  const elapsed = performance.now() - timerStartTime;
  const remaining = Math.max(0, timerDurationMs - elapsed);
  const fraction = remaining / timerDurationMs; // 1.0 → 0.0

  // Update countdown number
  const secondsLeft = Math.ceil(remaining / 1000);
  timerNumberEl.textContent = secondsLeft;

  // Update ring
  const offset = RING_CIRCUMFERENCE * (1 - fraction);
  timerRingSvg.style.strokeDashoffset = offset;

  // Update bar
  timerBarFill.style.width = `${fraction * 100}%`;

  // Color transitions based on remaining fraction
  if (fraction > 0.6) {
    // Green zone
    _setColor('var(--accent-green)');
    timerContainer.classList.remove('timer-heartbeat');
    timerContainer.classList.remove('timer-flash-red');
    timerLabelEl.textContent = 'CHOOSE NOW';
  } else if (fraction > 0.3) {
    // Yellow zone
    _setColor('var(--accent-yellow)');
    timerContainer.classList.remove('timer-heartbeat');
    timerContainer.classList.remove('timer-flash-red');
    timerLabelEl.textContent = 'HURRY...';
  } else if (fraction > 0.15) {
    // Red zone
    _setColor('var(--accent-red)');
    timerContainer.classList.remove('timer-heartbeat');
    timerContainer.classList.remove('timer-flash-red');
    timerLabelEl.textContent = 'DECIDE!';
  } else {
    // Flashing red + heartbeat under 15%
    _setColor('var(--critical)');
    timerContainer.classList.add('timer-heartbeat');
    if (secondsLeft <= 3) {
      timerContainer.classList.add('timer-flash-red');
    }
    timerLabelEl.textContent = 'NOW!';
  }

  // Timer expired
  if (remaining <= 0) {
    timerActive = false;
    _onExpired();
    return;
  }

  animFrameId = requestAnimationFrame(_tick);
}

function _setColor(color) {
  timerRingSvg.style.stroke = color;
  timerBarFill.style.background = color;
  timerNumberEl.style.color = color;
}

function _onExpired() {
  // Flash the screen red
  const flash = document.createElement('div');
  flash.className = 'timer-screen-flash';
  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
  }, 600);

  // Hide the timer
  if (timerContainer) {
    timerContainer.classList.add('hidden');
    timerContainer.classList.remove('timer-heartbeat');
    timerContainer.classList.remove('timer-flash-red');
  }

  // Invoke the expire callback
  if (timerCallback) {
    const cb = timerCallback;
    timerCallback = null;
    cb();
  }
}
