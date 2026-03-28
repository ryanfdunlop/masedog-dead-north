// ============================================================
// MASEDOG: Dead North — Screen Manager
// Routes between title, game, camp, gameover, victory screens.
// ============================================================

import { getState, getLivingParty, getPartySize } from '../engine/state.js';
import { getResourceStatus } from '../engine/resources.js';
import { getInfectionStatus } from '../engine/infection.js';
import { getCurrentWaypoint, getNextWaypoint, getProgress } from '../data/locations.js';
import { getMonthName } from '../data/seasons.js';
import { initNarrator, clearNarration } from './narrator.js';

let screens = {};
let hudEl = null;
let currentScreen = null;

/**
 * Initialize screen manager — call after DOM ready.
 */
export function initScreens() {
  screens = {
    title: document.getElementById('screen-title'),
    game: document.getElementById('screen-game'),
    camp: document.getElementById('screen-camp'),
    gameover: document.getElementById('screen-gameover'),
    victory: document.getElementById('screen-victory'),
  };
  hudEl = document.getElementById('hud');

  const narratorEl = document.getElementById('narrator');
  const choicesEl = document.getElementById('choices');
  initNarrator(narratorEl, choicesEl);
}

/**
 * Show a specific screen, hiding all others.
 */
export function showScreen(name, data = {}) {
  // Hide all screens
  for (const [key, el] of Object.entries(screens)) {
    if (el) el.classList.remove('active');
  }

  currentScreen = name;

  if (screens[name]) {
    screens[name].classList.add('active');
  }

  // Show/hide HUD
  if (hudEl) {
    hudEl.classList.toggle('hidden', name === 'title');
  }

  // Screen-specific setup
  switch (name) {
    case 'title':
      setupTitleScreen(data);
      break;
    case 'game':
      clearNarration();
      break;
    case 'camp':
      setupCampScreen(data);
      break;
    case 'gameover':
      setupGameOverScreen(data);
      break;
    case 'victory':
      setupVictoryScreen(data);
      break;
  }
}

function setupTitleScreen(data) {
  const startBtn = document.getElementById('btn-new-game');
  if (startBtn) {
    startBtn.onclick = () => {
      if (data.onNewGame) data.onNewGame();
    };
  }
}

function setupCampScreen(data) {
  const state = getState();
  const campContent = document.getElementById('camp-content');
  if (!campContent) return;

  const resources = getResourceStatus();
  const waypoint = getCurrentWaypoint(state.journey.currentKm);
  const nextWp = getNextWaypoint(state.journey.currentKm);
  const progress = getProgress(state.journey.currentKm);
  const living = getLivingParty();

  campContent.innerHTML = `
    <div class="camp-header">
      <h2>CAMP — Week ${state.calendar.week}</h2>
      <div class="camp-date">${getMonthName(state.calendar.month)} ${state.calendar.year} — ${state.calendar.season.toUpperCase()}</div>
      <div class="camp-location">Near ${waypoint.name} — ${progress}% to Ottawa</div>
      <div class="camp-weather">Weather: ${state.weather.current.replace('_', ' ')} (${state.weather.temperature}°C)</div>
    </div>

    <div class="camp-section">
      <h3>SUPPLIES</h3>
      <div class="camp-resources">
        ${resourceBar('Food', resources.food.amount, 20, resources.food.critical)}
        ${resourceBar('Water', resources.water.amount, 20, resources.water.critical)}
        ${resourceBar('Medicine', resources.medicine.amount, 10, resources.medicine.critical)}
        ${resourceBar('Ammo', resources.ammo.amount, 30, resources.ammo.critical)}
        ${resourceBar('Fuel', resources.fuel.amount, 10, resources.fuel.critical)}
        ${resourceBar('Scrap', resources.scrap.amount, 20, false)}
      </div>
    </div>

    <div class="camp-section">
      <h3>PARTY (${getPartySize()} members)</h3>
      <div class="camp-party">
        ${characterCard(state.player)}
        ${living.map(c => characterCard(c)).join('')}
      </div>
    </div>

    <div class="camp-section">
      <h3>JOURNEY</h3>
      <div class="journey-bar">
        <div class="journey-fill" style="width: ${progress}%"></div>
        <span class="journey-text">${state.journey.currentKm} / ${state.journey.totalKm} km</span>
      </div>
      <div class="camp-next">Next: ${nextWp.name} (${Math.max(0, nextWp.km - state.journey.currentKm)} km)</div>
    </div>

    <button class="btn-continue" id="btn-continue-turn">CONTINUE JOURNEY</button>
  `;

  const continueBtn = document.getElementById('btn-continue-turn');
  if (continueBtn) {
    continueBtn.onclick = () => {
      if (data.onContinue) data.onContinue();
    };
  }
}

function resourceBar(name, amount, max, critical) {
  const pct = Math.min(100, (amount / max) * 100);
  const cls = critical ? 'resource-bar critical' : 'resource-bar';
  return `
    <div class="${cls}">
      <span class="resource-name">${name}</span>
      <div class="resource-track">
        <div class="resource-fill" style="width: ${pct}%"></div>
      </div>
      <span class="resource-amount">${amount}</span>
    </div>
  `;
}

function characterCard(char) {
  const infection = getInfectionStatus(char);
  const healthPct = (char.health / char.maxHealth) * 100;
  const healthColor = healthPct > 60 ? '#4a4' : healthPct > 30 ? '#aa4' : '#a44';

  return `
    <div class="char-card ${!char.isAlive ? 'dead' : ''}">
      <div class="char-name">${char.name} ${char.isPlayer ? '(YOU)' : ''}</div>
      <div class="char-age">Age ${char.age}</div>
      <div class="char-health">
        <div class="health-bar">
          <div class="health-fill" style="width: ${healthPct}%; background: ${healthColor}"></div>
        </div>
        <span>HP: ${char.health}/${char.maxHealth}</span>
      </div>
      <div class="char-morale">Morale: ${char.morale}/100</div>
      ${infection ? `<div class="char-infection" style="color: ${infection.color}">${infection.label} (${infection.turnsLeft} weeks)</div>` : ''}
      ${char.traits.map(t => `<span class="trait-tag">${t}</span>`).join(' ')}
      ${char.status.filter(s => s !== 'dead').map(s => `<span class="status-tag">${s}</span>`).join(' ')}
    </div>
  `;
}

function setupGameOverScreen(data) {
  const content = document.getElementById('gameover-content');
  if (!content) return;

  content.innerHTML = `
    <div class="gameover-header">
      <h1>GAME OVER</h1>
      <div class="gameover-skull">&#9760;</div>
    </div>
    <div class="gameover-reason">${data.reason || 'Your journey has ended.'}</div>
    <div class="gameover-stats">
      <div>Survived: ${data.stats?.turnsLived || 0} weeks</div>
      <div>Distance: ${data.stats?.kmTraveled || 0} km of 4,400</div>
      <div>Party members lost: ${data.stats?.partyLost || 0}</div>
    </div>
    <div class="gameover-history">
      <h3>Your Story:</h3>
      ${(data.stats?.history || []).map(h => `<div class="history-entry">Week ${h.week}: ${h.text}</div>`).join('')}
    </div>
    <button class="btn-restart" id="btn-restart">TRY AGAIN</button>
  `;

  const restartBtn = document.getElementById('btn-restart');
  if (restartBtn) {
    restartBtn.onclick = () => {
      if (data.onRestart) data.onRestart();
    };
  }
}

function setupVictoryScreen(data) {
  const content = document.getElementById('victory-content');
  if (!content) return;

  const cureText = data.cureAlive
    ? `${data.cureCarrierName} carries the cure. The scientists at the National Microbiology Lab can synthesize an antivirus. Humanity has a chance.`
    : `The cure carrier didn't make it. But you did. And in Ottawa's lab, the scientists find something in YOUR blood — exposure to the carrier left traces. Enough to work with. Maybe.`;

  content.innerHTML = `
    <div class="victory-header">
      <h1>YOU MADE IT</h1>
      <div class="victory-subtitle">Ottawa. ${data.stats?.turnsLived || 52} weeks. ${data.stats?.kmTraveled || 4400} km.</div>
    </div>
    <div class="victory-narration">
      <p>The Parliament buildings stand scarred but unbroken. Behind them, the National Microbiology Lab hums with emergency generators. Armed guards — real, living guards — wave you through the checkpoint.</p>
      <p>${cureText}</p>
      <p>You made it. Against a 40% chance. Against AI overlords and zombie hordes and Canadian winter and your own despair. MASEDOG made it.</p>
      <p>The world isn't saved yet. But for the first time in a year, it could be.</p>
    </div>
    <div class="victory-stats">
      <h3>Journey Summary:</h3>
      <div>Weeks survived: ${data.stats?.turnsLived || 0}</div>
      <div>Final party size: ${data.stats?.partySize || 0}</div>
      <div>Distance: ${data.stats?.kmTraveled || 0} km</div>
    </div>
    <div class="victory-history">
      <h3>Your Story:</h3>
      ${(data.stats?.history || []).map(h => `<div class="history-entry">Week ${h.week}: ${h.text}</div>`).join('')}
    </div>
    <button class="btn-restart" id="btn-restart-victory">PLAY AGAIN</button>
  `;

  const restartBtn = document.getElementById('btn-restart-victory');
  if (restartBtn) {
    restartBtn.onclick = () => {
      if (data.onRestart) data.onRestart();
    };
  }
}

/**
 * Update the HUD with current game state.
 */
export function updateHUD() {
  if (!hudEl) return;
  const state = getState();
  if (!state) return;

  const resources = getResourceStatus();
  const progress = getProgress(state.journey.currentKm);

  hudEl.innerHTML = `
    <div class="hud-left">
      <span class="hud-item ${resources.food.critical ? 'critical' : ''}">Food: ${resources.food.amount}</span>
      <span class="hud-item ${resources.water.critical ? 'critical' : ''}">Water: ${resources.water.amount}</span>
      <span class="hud-item ${resources.medicine.critical ? 'critical' : ''}">Med: ${resources.medicine.amount}</span>
      <span class="hud-item ${resources.ammo.critical ? 'critical' : ''}">Ammo: ${resources.ammo.amount}</span>
    </div>
    <div class="hud-center">
      <span class="hud-week">Week ${state.calendar.week}/52</span>
      <span class="hud-progress">${progress}% to Ottawa</span>
    </div>
    <div class="hud-right">
      <span class="hud-item">HP: ${state.player.health}</span>
      <span class="hud-item">Morale: ${state.player.morale}</span>
      <span class="hud-item">Party: ${getPartySize()}</span>
    </div>
  `;
}
