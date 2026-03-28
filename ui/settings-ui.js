// ============================================================
// MASEDOG: Dead North — Settings Gear UI
// Floating gear icon, opens volume/timer/settings panel.
// ============================================================

import { getSettings, updateSetting } from '../engine/settings.js';
import { setVolume } from '../engine/audio.js';

let gearBtn = null;
let panel = null;
let isOpen = false;

/**
 * Initialize the settings gear icon and panel.
 */
export function initSettingsUI() {
  gearBtn = document.createElement('button');
  gearBtn.id = 'settings-gear';
  gearBtn.className = 'settings-gear';
  gearBtn.innerHTML = '⚙';
  gearBtn.title = 'Settings';
  gearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });
  document.body.appendChild(gearBtn);

  panel = document.createElement('div');
  panel.id = 'settings-panel';
  panel.className = 'settings-panel';
  panel.style.display = 'none';
  panel.addEventListener('click', (e) => e.stopPropagation());
  document.body.appendChild(panel);

  document.addEventListener('click', () => { if (isOpen) close(); });
}

function toggle() { isOpen ? close() : open(); }

function open() {
  isOpen = true;
  gearBtn.classList.add('active');
  panel.style.display = 'block';
  render();
}

function close() {
  isOpen = false;
  gearBtn.classList.remove('active');
  panel.style.display = 'none';
}

function render() {
  const s = getSettings();

  panel.innerHTML = `
    <div class="sp-header">
      <span>SETTINGS</span>
      <button class="sp-close" id="sp-close">✕</button>
    </div>

    <div class="sp-section">
      <div class="sp-label">SOUND</div>
      <div class="sp-toggle-row">
        <span>Sound Effects</span>
        <button class="sp-toggle ${s.soundEnabled ? 'on' : ''}" data-key="soundEnabled">
          ${s.soundEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>

    <div class="sp-section">
      <div class="sp-toggle-row">
        <span>Typing Sound</span>
        <button class="sp-toggle ${s.textSound ? 'on' : ''}" data-key="textSound">
          ${s.textSound ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>

    <div class="sp-section">
      <div class="sp-label">MASTER VOLUME</div>
      <div class="sp-slider-row">
        <input type="range" min="0" max="100" value="${s.masterVolume}" class="sp-slider" data-key="masterVolume">
        <span class="sp-val">${s.masterVolume}%</span>
      </div>
    </div>

    <div class="sp-section">
      <div class="sp-label">MUSIC</div>
      <div class="sp-slider-row">
        <input type="range" min="0" max="100" value="${s.musicVolume}" class="sp-slider" data-key="musicVolume">
        <span class="sp-val">${s.musicVolume}%</span>
      </div>
    </div>

    <div class="sp-section">
      <div class="sp-label">SFX</div>
      <div class="sp-slider-row">
        <input type="range" min="0" max="100" value="${s.sfxVolume}" class="sp-slider" data-key="sfxVolume">
        <span class="sp-val">${s.sfxVolume}%</span>
      </div>
    </div>

    <div class="sp-section">
      <div class="sp-label">CHOICE TIMER</div>
      <div class="sp-toggle-row">
        <span>Countdown</span>
        <button class="sp-toggle ${s.timedChoices ? 'on' : ''}" data-key="timedChoices">
          ${s.timedChoices ? 'ON' : 'OFF'}
        </button>
      </div>
      <div class="sp-seconds-row">
        ${[5, 10, 20, 30, 60, 0].map(sec => `
          <button class="sp-sec-btn ${s.timerSeconds === sec ? 'active' : ''}" data-sec="${sec}">
            ${sec === 0 ? 'OFF' : sec + 's'}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Wire close
  document.getElementById('sp-close')?.addEventListener('click', close);

  // Wire toggles
  panel.querySelectorAll('.sp-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      updateSetting(btn.dataset.key, !getSettings()[btn.dataset.key]);
      applyAudio();
      render();
    });
  });

  // Wire sliders
  panel.querySelectorAll('.sp-slider').forEach(slider => {
    slider.addEventListener('input', () => {
      updateSetting(slider.dataset.key, parseInt(slider.value));
      slider.nextElementSibling.textContent = `${slider.value}%`;
      applyAudio();
    });
  });

  // Wire seconds buttons
  panel.querySelectorAll('.sp-sec-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = parseInt(btn.dataset.sec);
      updateSetting('timerSeconds', sec);
      if (sec === 0) {
        updateSetting('timedChoices', false);
      } else {
        updateSetting('timedChoices', true);
      }
      render();
    });
  });
}

function applyAudio() {
  const s = getSettings();
  if (!s.soundEnabled) {
    setVolume(0, 0, 0);
  } else {
    setVolume(s.masterVolume / 100, s.musicVolume / 100, s.sfxVolume / 100);
  }
}
