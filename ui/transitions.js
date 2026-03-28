// ============================================================
// MASEDOG: Dead North — Screen Transitions & Effects
// Cinematic transitions between screens and moments.
// ============================================================

let overlayEl = null;

/**
 * Initialize the transition overlay element.
 */
export function initTransitions() {
  overlayEl = document.getElementById('transition-overlay');
  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.id = 'transition-overlay';
    overlayEl.className = 'transition-overlay';
    document.body.appendChild(overlayEl);
  }
}

/**
 * Fade to black and back.
 */
export function fadeTransition(duration = 800) {
  return new Promise(resolve => {
    if (!overlayEl) { resolve(); return; }
    overlayEl.style.transition = `opacity ${duration / 2}ms ease-in`;
    overlayEl.style.background = '#000';
    overlayEl.style.opacity = '1';
    overlayEl.style.pointerEvents = 'all';

    setTimeout(() => {
      overlayEl.style.transition = `opacity ${duration / 2}ms ease-out`;
      overlayEl.style.opacity = '0';
      setTimeout(() => {
        overlayEl.style.pointerEvents = 'none';
        resolve();
      }, duration / 2);
    }, duration / 2);
  });
}

/**
 * Red flash (damage / danger).
 */
export function damageFlash(intensity = 0.4) {
  return new Promise(resolve => {
    if (!overlayEl) { resolve(); return; }
    overlayEl.style.transition = 'opacity 50ms';
    overlayEl.style.background = `rgba(200, 30, 30, ${intensity})`;
    overlayEl.style.opacity = '1';
    overlayEl.style.pointerEvents = 'none';

    setTimeout(() => {
      overlayEl.style.transition = 'opacity 400ms ease-out';
      overlayEl.style.opacity = '0';
      setTimeout(resolve, 400);
    }, 80);
  });
}

/**
 * Green flash (healing / positive).
 */
export function healFlash() {
  return new Promise(resolve => {
    if (!overlayEl) { resolve(); return; }
    overlayEl.style.transition = 'opacity 50ms';
    overlayEl.style.background = 'rgba(50, 180, 70, 0.3)';
    overlayEl.style.opacity = '1';
    overlayEl.style.pointerEvents = 'none';

    setTimeout(() => {
      overlayEl.style.transition = 'opacity 500ms ease-out';
      overlayEl.style.opacity = '0';
      setTimeout(resolve, 500);
    }, 100);
  });
}

/**
 * Glitch effect (AI / horror moments).
 */
export function glitchEffect(duration = 600) {
  return new Promise(resolve => {
    const gameArea = document.querySelector('.screen.active');
    if (!gameArea) { resolve(); return; }

    gameArea.classList.add('glitch-active');
    setTimeout(() => {
      gameArea.classList.remove('glitch-active');
      resolve();
    }, duration);
  });
}

/**
 * Screen shake (combat / explosions).
 */
export function screenShake(intensity = 5, duration = 300) {
  return new Promise(resolve => {
    const gameArea = document.querySelector('.screen.active');
    if (!gameArea) { resolve(); return; }

    const startTime = Date.now();
    const originalTransform = gameArea.style.transform;

    function shake() {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        gameArea.style.transform = originalTransform || '';
        resolve();
        return;
      }

      const decay = 1 - elapsed / duration;
      const x = (Math.random() - 0.5) * intensity * 2 * decay;
      const y = (Math.random() - 0.5) * intensity * 2 * decay;
      gameArea.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(shake);
    }

    shake();
  });
}

/**
 * Slow fade-in text reveal (for dramatic moments).
 */
export function dramaticReveal(element, duration = 2000) {
  return new Promise(resolve => {
    if (!element) { resolve(); return; }
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-in`;

    requestAnimationFrame(() => {
      element.style.opacity = '1';
      setTimeout(resolve, duration);
    });
  });
}

/**
 * Static/noise overlay (radio / AI interference).
 */
export function staticNoise(duration = 1000) {
  return new Promise(resolve => {
    if (!overlayEl) { resolve(); return; }

    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');

    let frame = 0;
    const maxFrames = duration / 50;

    function drawNoise() {
      if (frame >= maxFrames) {
        overlayEl.style.backgroundImage = '';
        overlayEl.style.opacity = '0';
        resolve();
        return;
      }

      const imgData = ctx.createImageData(200, 150);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.random() * 255;
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 60;
      }
      ctx.putImageData(imgData, 0, 0);

      overlayEl.style.backgroundImage = `url(${canvas.toDataURL()})`;
      overlayEl.style.backgroundSize = 'cover';
      overlayEl.style.opacity = '0.3';
      overlayEl.style.pointerEvents = 'none';

      frame++;
      setTimeout(drawNoise, 50);
    }

    drawNoise();
  });
}
