// ============================================================
// MASEDOG: Dead North — Visual Effects System
// Weather particles, day/night cycle, ambient atmosphere.
// ============================================================

let effectsCanvas = null;
let effectsCtx = null;
let particles = [];
let animFrameId = null;
let currentEffect = null;

const MAX_PARTICLES = 300;

/**
 * Initialize the effects canvas overlay.
 */
export function initEffects() {
  effectsCanvas = document.getElementById('effects-canvas');
  if (!effectsCanvas) {
    effectsCanvas = document.createElement('canvas');
    effectsCanvas.id = 'effects-canvas';
    effectsCanvas.className = 'effects-canvas';
    document.body.appendChild(effectsCanvas);
  }
  effectsCtx = effectsCanvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (!effectsCanvas) return;
  effectsCanvas.width = window.innerWidth;
  effectsCanvas.height = window.innerHeight;
}

/**
 * Set the weather effect based on current weather type.
 */
export function setWeatherEffect(weatherType) {
  stopEffect();
  currentEffect = weatherType;
  particles = [];

  switch (weatherType) {
    case 'rain':
    case 'storm':
      startRain(weatherType === 'storm');
      break;
    case 'snow':
    case 'blizzard':
      startSnow(weatherType === 'blizzard');
      break;
    case 'fog':
      startFog();
      break;
    case 'heatwave':
      startHeatShimmer();
      break;
    case 'clear':
    case 'clear_cold':
    case 'mud':
    case 'flood':
    case 'ice_storm':
    default:
      // No particle effect, but may have tinting
      break;
  }
}

/**
 * Stop all particle effects.
 */
export function stopEffect() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (effectsCtx && effectsCanvas) {
    effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
  }
  particles = [];
  currentEffect = null;
}

// ---- RAIN ----
function startRain(isStorm) {
  const count = isStorm ? 250 : 120;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * effectsCanvas.width,
      y: Math.random() * effectsCanvas.height,
      speed: 8 + Math.random() * 8 + (isStorm ? 6 : 0),
      length: 10 + Math.random() * 15,
      wind: isStorm ? 3 + Math.random() * 4 : 0.5,
      opacity: 0.15 + Math.random() * 0.2,
    });
  }
  animateRain();
}

function animateRain() {
  if (!effectsCtx) return;
  effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

  for (const p of particles) {
    effectsCtx.strokeStyle = `rgba(150, 170, 200, ${p.opacity})`;
    effectsCtx.lineWidth = 1;
    effectsCtx.beginPath();
    effectsCtx.moveTo(p.x, p.y);
    effectsCtx.lineTo(p.x + p.wind, p.y + p.length);
    effectsCtx.stroke();

    p.x += p.wind;
    p.y += p.speed;

    if (p.y > effectsCanvas.height) {
      p.y = -p.length;
      p.x = Math.random() * effectsCanvas.width;
    }
    if (p.x > effectsCanvas.width) p.x = 0;
  }

  animFrameId = requestAnimationFrame(animateRain);
}

// ---- SNOW ----
function startSnow(isBlizzard) {
  const count = isBlizzard ? 200 : 80;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * effectsCanvas.width,
      y: Math.random() * effectsCanvas.height,
      speed: 1 + Math.random() * 2 + (isBlizzard ? 3 : 0),
      size: 1 + Math.random() * 3,
      wind: (Math.random() - 0.5) * 2 + (isBlizzard ? 4 : 0),
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      opacity: 0.4 + Math.random() * 0.5,
    });
  }
  animateSnow();
}

function animateSnow() {
  if (!effectsCtx) return;
  effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

  for (const p of particles) {
    effectsCtx.fillStyle = `rgba(220, 225, 240, ${p.opacity})`;
    effectsCtx.beginPath();
    effectsCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    effectsCtx.fill();

    p.wobble += p.wobbleSpeed;
    p.x += p.wind + Math.sin(p.wobble) * 0.5;
    p.y += p.speed;

    if (p.y > effectsCanvas.height) {
      p.y = -p.size;
      p.x = Math.random() * effectsCanvas.width;
    }
    if (p.x > effectsCanvas.width) p.x = 0;
    if (p.x < 0) p.x = effectsCanvas.width;
  }

  animFrameId = requestAnimationFrame(animateSnow);
}

// ---- FOG ----
function startFog() {
  animateFog();
}

let fogOffset = 0;
function animateFog() {
  if (!effectsCtx) return;
  effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

  fogOffset += 0.3;

  // Layered fog bands
  for (let layer = 0; layer < 3; layer++) {
    const y = effectsCanvas.height * (0.3 + layer * 0.2);
    const alpha = 0.05 + layer * 0.03;
    const offset = fogOffset * (1 + layer * 0.5);

    effectsCtx.fillStyle = `rgba(180, 190, 200, ${alpha})`;
    effectsCtx.beginPath();

    for (let x = 0; x < effectsCanvas.width + 100; x += 50) {
      const waveY = y + Math.sin((x + offset) * 0.01) * 40 + Math.cos((x - offset) * 0.007) * 20;
      if (x === 0) {
        effectsCtx.moveTo(x, waveY);
      } else {
        effectsCtx.lineTo(x, waveY);
      }
    }

    effectsCtx.lineTo(effectsCanvas.width, effectsCanvas.height);
    effectsCtx.lineTo(0, effectsCanvas.height);
    effectsCtx.closePath();
    effectsCtx.fill();
  }

  animFrameId = requestAnimationFrame(animateFog);
}

// ---- HEAT SHIMMER ----
function startHeatShimmer() {
  animateHeat();
}

let heatTime = 0;
function animateHeat() {
  if (!effectsCtx) return;
  effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

  heatTime += 0.02;

  // Subtle wavy heat distortion lines at bottom of screen
  const gradient = effectsCtx.createLinearGradient(0, effectsCanvas.height * 0.7, 0, effectsCanvas.height);
  gradient.addColorStop(0, 'rgba(255, 200, 100, 0)');
  gradient.addColorStop(1, 'rgba(255, 200, 100, 0.06)');
  effectsCtx.fillStyle = gradient;
  effectsCtx.fillRect(0, 0, effectsCanvas.width, effectsCanvas.height);

  // Shimmer lines
  effectsCtx.strokeStyle = 'rgba(255, 220, 150, 0.04)';
  effectsCtx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const baseY = effectsCanvas.height * 0.6 + i * 30;
    effectsCtx.beginPath();
    for (let x = 0; x < effectsCanvas.width; x += 4) {
      const y = baseY + Math.sin(x * 0.02 + heatTime + i) * 3;
      if (x === 0) effectsCtx.moveTo(x, y);
      else effectsCtx.lineTo(x, y);
    }
    effectsCtx.stroke();
  }

  animFrameId = requestAnimationFrame(animateHeat);
}

/**
 * Apply day/night tinting based on game time.
 * Call this when displaying the game screen.
 */
export function applyDayNightTint(season, hour) {
  const tintEl = document.getElementById('daytime-tint');
  if (!tintEl) return;

  // In winter, days are shorter — more blue tinting
  let tint = 'rgba(0, 0, 0, 0)';

  if (season === 'winter') {
    tint = 'rgba(20, 30, 60, 0.15)'; // Cold blue overlay
  } else if (season === 'fall') {
    tint = 'rgba(40, 25, 10, 0.08)'; // Warm amber overlay
  } else if (season === 'summer') {
    tint = 'rgba(0, 0, 0, 0)'; // No tint
  } else if (season === 'spring') {
    tint = 'rgba(20, 30, 15, 0.05)'; // Slight green
  }

  tintEl.style.background = tint;
}

/**
 * Set the background theme based on current location region.
 */
export function setLocationTheme(region) {
  const body = document.body;

  // Remove all region classes
  body.classList.remove('region-vancouver', 'region-bc-interior', 'region-alberta',
    'region-saskatchewan', 'region-manitoba', 'region-ontario-north',
    'region-ontario-south', 'region-ottawa');

  // Map region IDs to CSS class names
  const regionMap = {
    'vancouver': 'region-vancouver',
    'bc_interior': 'region-bc-interior',
    'alberta': 'region-alberta',
    'saskatchewan': 'region-saskatchewan',
    'manitoba': 'region-manitoba',
    'ontario_north': 'region-ontario-north',
    'ontario_south': 'region-ontario-south',
    'ottawa_approach': 'region-ottawa',
  };
  const regionClass = regionMap[region] || `region-${region.replace(/_/g, '-')}`;
  body.classList.add(regionClass);
}
