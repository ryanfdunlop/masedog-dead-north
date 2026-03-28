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
import { renderMap } from './map.js';
import { renderInventory } from './inventory.js';
import { renderPartyPortraits, getPortraitDataURL } from './portraits.js';
import { saveGame, loadGame, getSaveSlots, hasSaves, autosave } from '../engine/save.js';
import {
  getResourceActions, rollForResource, calculateFailPenalty,
  applyGains, applyLosses, getShareOptions, transferHealth,
  useMedicineOn, trainSkill,
} from '../engine/actions.js';
import { calculateSuccessChance, convertDCtoTarget, getRollCount, rollDice } from './dice.js';

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

  // Show/hide continue button based on saves
  const continueBtn = document.getElementById('btn-continue-game');
  if (continueBtn) {
    if (hasSaves()) {
      continueBtn.style.display = 'block';
      continueBtn.onclick = () => {
        const result = loadGame(0); // Load autosave
        if (result.success && data.onLoad) {
          data.onLoad();
        }
      };
    } else {
      continueBtn.style.display = 'none';
    }
  }
}

function setupCampScreen(data) {
  const state = getState();
  const campContent = document.getElementById('camp-content');
  if (!campContent) return;

  // Autosave at camp
  autosave();

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

    <div class="camp-tabs">
      <button class="camp-tab active" data-tab="status">STATUS</button>
      <button class="camp-tab" data-tab="actions">ACTIONS</button>
      <button class="camp-tab" data-tab="party">PARTY</button>
      <button class="camp-tab" data-tab="map">MAP</button>
      <button class="camp-tab" data-tab="save">SAVE</button>
    </div>

    <div class="camp-tab-content" id="tab-status">
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
    </div>

    <div class="camp-tab-content hidden" id="tab-actions"></div>
    <div class="camp-tab-content hidden" id="tab-party"></div>
    <div class="camp-tab-content hidden" id="tab-map"></div>
    <div class="camp-tab-content hidden" id="tab-save"></div>

    <button class="btn-continue" id="btn-continue-turn">CONTINUE JOURNEY</button>
  `;

  // Tab switching
  campContent.querySelectorAll('.camp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      campContent.querySelectorAll('.camp-tab').forEach(t => t.classList.remove('active'));
      campContent.querySelectorAll('.camp-tab-content').forEach(c => c.classList.add('hidden'));
      tab.classList.add('active');
      const target = document.getElementById(`tab-${tab.dataset.tab}`);
      if (target) target.classList.remove('hidden');

      // Lazy render tab content
      if (tab.dataset.tab === 'actions') {
        renderActionsTab(document.getElementById('tab-actions'), data);
      } else if (tab.dataset.tab === 'party') {
        renderInventory(document.getElementById('tab-party'));
      } else if (tab.dataset.tab === 'map') {
        renderMap(document.getElementById('tab-map'));
      } else if (tab.dataset.tab === 'save') {
        renderSaveTab(document.getElementById('tab-save'));
      }
    });
  });

  const continueBtn = document.getElementById('btn-continue-turn');
  if (continueBtn) {
    continueBtn.onclick = () => {
      if (data.onContinue) data.onContinue();
    };
  }
}

function renderActionsTab(container, campData) {
  const state = getState();

  container.innerHTML = `
    <div class="camp-section">
      <h3>PUSH YOUR LUCK</h3>
      <p style="color: var(--text-dim); font-size: 14px; margin-bottom: 8px;">
        Roll dice to gather resources. <strong style="color: var(--accent-yellow);">Keep rolling to win more</strong> — but fail and a zombie horde raids your supplies!
      </p>
      <p style="color: var(--accent-red); font-size: 12px; margin-bottom: 12px;">
        The more you roll, the harder it gets. Quit while you're ahead... or push your luck.
      </p>
      <div id="push-luck-area"></div>
    </div>
    <div class="camp-section">
      <h3>OTHER ACTIONS</h3>
      <div class="camp-actions-grid" id="other-actions"></div>
    </div>
  `;

  renderPushYourLuck(document.getElementById('push-luck-area'), campData);
  renderOtherActions(document.getElementById('other-actions'), container, campData);
}

// ========== PUSH YOUR LUCK ==========

function renderPushYourLuck(area, campData) {
  const actions = getResourceActions();
  const gained = {}; // Track resources gained this session
  let rollNumber = 0;
  let sessionActive = true;

  showResourcePicker(area, actions, gained, rollNumber, sessionActive, campData);
}

function showResourcePicker(area, actions, gained, rollNumber, sessionActive, campData) {
  if (!sessionActive) return;

  // Show what's been gained so far
  let gainedHtml = '';
  const gainedEntries = Object.entries(gained);
  if (gainedEntries.length > 0) {
    gainedHtml = `<div class="luck-gained"><strong>Won so far:</strong> ${gainedEntries.map(([t, a]) => `<span class="luck-gain-item">${t}: +${a}</span>`).join(' ')}</div>`;
  }

  const riskHtml = rollNumber > 0
    ? `<div class="luck-risk">Roll ${rollNumber + 1} — Difficulty increased! ${rollNumber >= 2 ? '<span style="color:var(--accent-red)">HIGH RISK!</span>' : ''}</div>`
    : `<div class="luck-risk">Roll 1 — Starting difficulty</div>`;

  let html = `
    ${gainedHtml}
    ${riskHtml}
    <div class="camp-actions-grid">
  `;

  for (const action of actions) {
    const difficulty = action.difficulty + Math.max(0, rollNumber * 2);
    const chance = calculateSuccessChance(0, difficulty, 1);
    const chanceClass = chance >= 65 ? 'high' : chance >= 40 ? 'medium' : 'low';

    html += `
      <button class="camp-action-btn push-luck-btn" data-action-id="${action.id}">
        <div class="camp-action-icon">${action.icon}</div>
        <div class="camp-action-name">${action.name}</div>
        <div class="camp-action-desc">${action.description}</div>
        <div class="camp-action-chance ${chanceClass}">${chance}% — need ${difficulty}+ on 2d6</div>
      </button>
    `;
  }

  html += `</div>`;

  if (rollNumber > 0) {
    html += `<button class="btn-continue" id="btn-cash-out" style="margin-top: 12px; background: var(--accent-green);">CASH OUT — Keep your winnings</button>`;
  }

  area.innerHTML = html;

  // Wire buttons
  area.querySelectorAll('.push-luck-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const actionId = btn.dataset.actionId;
      const action = actions.find(a => a.id === actionId);
      if (!action) return;

      // Roll using the visual dice
      const difficulty = action.difficulty + Math.max(0, rollNumber * 2);
      const diceResult = await rollDice({
        skill: action.name,
        bonus: 0, // No bonus — pure dice roll for push-your-luck
        target: difficulty,
        label: `${action.icon} ${action.name}`,
      });

      rollNumber++;

      if (diceResult.success) {
        // WIN — add to gained resources
        const result = rollForResource(action, rollNumber);
        const reward = result.reward || { type: action.reward.type, amount: action.reward.min };
        gained[reward.type] = (gained[reward.type] || 0) + reward.amount;

        if (diceResult.critSuccess) {
          // Double sixes = bonus reward!
          gained[reward.type] += reward.amount;
          area.innerHTML = `
            <div class="luck-result success">
              <div class="luck-result-icon">🎯</div>
              <div>DOUBLE SIXES! Won ${reward.amount * 2} ${reward.type}!</div>
            </div>
          `;
        } else {
          area.innerHTML = `
            <div class="luck-result success">
              <div class="luck-result-icon">${action.icon}</div>
              <div>Won ${reward.amount} ${reward.type}!</div>
            </div>
          `;
        }

        // Brief pause then show "roll again or cash out"
        await new Promise(r => setTimeout(r, 1200));
        showResourcePicker(area, actions, gained, rollNumber, true, campData);

      } else {
        // FAIL — zombies come! Lose a chunk of what you gained
        const { losses, lossPercent } = calculateFailPenalty(gained, rollNumber);

        // First apply whatever was gained
        if (Object.keys(gained).length > 0) {
          applyGains(gained);
        }
        // Then apply losses
        const lossMessages = applyLosses(losses);

        let failHtml = `
          <div class="luck-result failure">
            <div class="luck-result-icon">💀</div>
            <div>FAILED! A zombie horde descends on your position!</div>
          </div>
          <div class="luck-losses">
            <div>You lose ${lossPercent}% of your gains:</div>
            ${lossMessages.map(m => `<div class="luck-loss-item">${m}</div>`).join('')}
        `;

        if (diceResult.critFail) {
          failHtml += `<div class="luck-loss-item" style="color: var(--accent-red);">SNAKE EYES! Extra damage — the horde catches you off guard!</div>`;
          dispatch('UPDATE_PLAYER_HEALTH', -10);
        }

        // Net result
        const netGains = {};
        for (const [type, amount] of Object.entries(gained)) {
          const loss = losses[type] || 0;
          const net = amount - loss;
          if (net > 0) netGains[type] = net;
        }
        const netHtml = Object.entries(netGains).length > 0
          ? `<div class="luck-net">Net gain: ${Object.entries(netGains).map(([t, a]) => `${t}: +${a}`).join(', ')}</div>`
          : `<div class="luck-net" style="color: var(--accent-red);">You came back with nothing.</div>`;

        failHtml += `${netHtml}</div>`;
        failHtml += `<button class="btn-continue" id="btn-luck-done" style="margin-top: 12px;">CONTINUE JOURNEY</button>`;

        area.innerHTML = failHtml;
        updateHUD();

        document.getElementById('btn-luck-done')?.addEventListener('click', () => {
          if (campData.onContinue) campData.onContinue();
        });
      }
    });
  });

  // Cash out button
  document.getElementById('btn-cash-out')?.addEventListener('click', () => {
    if (Object.keys(gained).length > 0) {
      const messages = applyGains(gained);
      area.innerHTML = `
        <div class="luck-result success">
          <div class="luck-result-icon">✅</div>
          <div>Cashed out safely!</div>
        </div>
        <div class="luck-cashout">
          ${messages.map(m => `<div>${m}</div>`).join('')}
        </div>
        <button class="btn-continue" id="btn-luck-done" style="margin-top: 12px;">CONTINUE JOURNEY</button>
      `;
      updateHUD();

      document.getElementById('btn-luck-done')?.addEventListener('click', () => {
        if (campData.onContinue) campData.onContinue();
      });
    }
  });
}

// ========== OTHER ACTIONS (Train, Share, Medicine) ==========

function renderOtherActions(area, container, campData) {
  const state = getState();
  const living = getLivingParty();

  area.innerHTML = `
    <button class="camp-action-btn" id="btn-train">
      <div class="camp-action-icon">📈</div>
      <div class="camp-action-name">Train Skill</div>
      <div class="camp-action-desc">Practice a skill. +3 XP guaranteed.</div>
    </button>
    <button class="camp-action-btn" id="btn-share-health">
      <div class="camp-action-icon">🩹</div>
      <div class="camp-action-name">Share Health</div>
      <div class="camp-action-desc">Transfer HP from one member to another.</div>
    </button>
    <button class="camp-action-btn" id="btn-use-medicine" ${state.resources.medicine <= 0 ? 'disabled style="opacity:0.4"' : ''}>
      <div class="camp-action-icon">💊</div>
      <div class="camp-action-name">Use Medicine</div>
      <div class="camp-action-desc">Heal a party member. (${state.resources.medicine} available)</div>
    </button>
    <button class="camp-action-btn" id="btn-just-continue">
      <div class="camp-action-icon">🚶</div>
      <div class="camp-action-name">Continue Journey</div>
      <div class="camp-action-desc">Skip actions and keep moving.</div>
    </button>
  `;

  // Train
  document.getElementById('btn-train')?.addEventListener('click', () => {
    const skills = ['combat', 'athletics', 'perception', 'medical', 'mechanics', 'charisma', 'stealth', 'survival'];
    let html = `<h3>CHOOSE SKILL TO TRAIN</h3><div class="skill-train-picker">`;
    for (const skill of skills) {
      const level = state.player.skills[skill] || 0;
      const xp = state.player.skillXP?.[skill] || 0;
      const threshold = level * 3;
      html += `<button class="skill-train-btn" data-skill="${skill}">${skill} (${level})<br><span style="font-size:6px; color:#666">${xp}/${threshold} XP</span></button>`;
    }
    html += `</div>`;
    container.querySelector('#tab-actions').innerHTML = `<div class="camp-section">${html}</div>`;

    container.querySelectorAll('.skill-train-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = trainSkill(btn.dataset.skill);
        showFinalResult(container, result.messages, campData);
      });
    });
  });

  // Share health
  document.getElementById('btn-share-health')?.addEventListener('click', () => {
    const options = getShareOptions();
    const allChars = [options.player, ...options.party];
    let html = `<h3>SHARE HEALTH</h3><p style="color:var(--text-dim); font-size:14px; margin-bottom:12px;">Choose who gives HP and who receives (giver can't go below 20 HP).</p>`;
    html += `<div style="display:flex; gap:12px; flex-wrap:wrap;">`;
    for (const c of allChars) {
      html += `<div class="char-card" style="flex:1; min-width:120px; cursor:pointer;" data-char-id="${c.id}">
        <div class="char-name">${c.name}</div>
        <div>HP: ${c.health}/${c.maxHealth}</div>
      </div>`;
    }
    html += `</div>`;
    html += `<p style="color:var(--text-dim); font-size:12px; margin-top:8px;">Click the GIVER first, then the RECEIVER.</p>`;
    container.querySelector('#tab-actions').innerHTML = `<div class="camp-section">${html}</div>`;

    let fromId = null;
    container.querySelectorAll('[data-char-id]').forEach(card => {
      card.addEventListener('click', () => {
        if (!fromId) {
          fromId = card.dataset.charId;
          card.style.border = '2px solid var(--accent-green)';
        } else {
          const toId = card.dataset.charId;
          if (toId === fromId) return;
          const result = transferHealth(fromId, toId, 15);
          showFinalResult(container, result.messages, campData);
        }
      });
    });
  });

  // Use medicine
  document.getElementById('btn-use-medicine')?.addEventListener('click', () => {
    const options = getShareOptions();
    const allChars = [options.player, ...options.party];
    let html = `<h3>USE MEDICINE ON WHO?</h3><div style="display:flex; gap:8px; flex-wrap:wrap;">`;
    for (const c of allChars) {
      html += `<button class="camp-action-btn" data-med-target="${c.id}" style="flex:1; min-width:120px;">
        <div class="camp-action-icon">💊</div>
        <div class="camp-action-name">${c.name}</div>
        <div class="camp-action-desc">HP: ${c.health}/${c.maxHealth}</div>
      </button>`;
    }
    html += `</div>`;
    container.querySelector('#tab-actions').innerHTML = `<div class="camp-section">${html}</div>`;

    container.querySelectorAll('[data-med-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = useMedicineOn(btn.dataset.medTarget);
        showFinalResult(container, result.messages, campData);
      });
    });
  });

  // Just continue
  document.getElementById('btn-just-continue')?.addEventListener('click', () => {
    if (campData.onContinue) campData.onContinue();
  });
}

function showFinalResult(container, messages, campData) {
  let html = `<div class="camp-section"><h3>RESULT</h3>`;
  for (const msg of messages) {
    html += `<div style="color: var(--accent-orange); margin-bottom: 4px;">${msg}</div>`;
  }
  html += `<button class="btn-continue" id="btn-action-done" style="margin-top: 16px;">CONTINUE JOURNEY</button></div>`;
  container.querySelector('#tab-actions').innerHTML = html;
  updateHUD();

  document.getElementById('btn-action-done')?.addEventListener('click', () => {
    if (campData.onContinue) campData.onContinue();
  });
}

function renderSaveTab(container) {
  const slots = getSaveSlots();

  let html = `<div class="save-container">`;

  for (const slot of slots) {
    if (slot.slot === 0) {
      // Autosave - display only
      html += `
        <div class="save-slot autosave">
          <div class="save-slot-header">AUTOSAVE</div>
          ${slot.exists ? `
            <div class="save-slot-info">
              Week ${slot.week} — ${slot.location} — ${slot.progress}% — Party: ${slot.partySize}
            </div>
            <div class="save-slot-time">${new Date(slot.timestamp).toLocaleString()}</div>
          ` : '<div class="save-slot-empty">No autosave</div>'}
        </div>
      `;
    } else {
      html += `
        <div class="save-slot">
          <div class="save-slot-header">SLOT ${slot.slot}</div>
          ${slot.exists ? `
            <div class="save-slot-info">
              Week ${slot.week} — ${slot.location} — ${slot.progress}% — Party: ${slot.partySize}
            </div>
            <div class="save-slot-time">${new Date(slot.timestamp).toLocaleString()}</div>
          ` : '<div class="save-slot-empty">Empty</div>'}
          <div class="save-slot-actions">
            <button class="btn-save-slot" data-slot="${slot.slot}">SAVE</button>
            ${slot.exists ? `<button class="btn-load-slot" data-slot="${slot.slot}">LOAD</button>` : ''}
          </div>
        </div>
      `;
    }
  }

  html += `</div>`;
  container.innerHTML = html;

  // Wire up save/load buttons
  container.querySelectorAll('.btn-save-slot').forEach(btn => {
    btn.addEventListener('click', () => {
      const result = saveGame(parseInt(btn.dataset.slot));
      if (result.success) {
        renderSaveTab(container); // Re-render to show updated slot
      }
    });
  });

  container.querySelectorAll('.btn-load-slot').forEach(btn => {
    btn.addEventListener('click', () => {
      const result = loadGame(parseInt(btn.dataset.slot));
      if (result.success) {
        // Refresh the camp screen
        showScreen('camp', { onContinue: () => {} });
      }
    });
  });
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

  const ending = data.ending || 'hopeful';
  const endings = getEndingNarration(ending, data);

  content.innerHTML = `
    <div class="victory-header">
      <h1>${endings.title}</h1>
      <div class="victory-subtitle">Ottawa. ${data.stats?.turnsLived || 52} weeks. ${data.stats?.kmTraveled || 4400} km.</div>
      <div class="victory-ending-type">${endings.type}</div>
    </div>
    <div class="victory-narration">
      ${endings.paragraphs.map(p => `<p>${p}</p>`).join('')}
    </div>
    <div class="victory-stats">
      <h3>Journey Summary:</h3>
      <div>Weeks survived: ${data.stats?.turnsLived || 0}</div>
      <div>Final party size: ${data.stats?.partySize || 0}</div>
      <div>Distance: ${data.stats?.kmTraveled || 0} km</div>
      ${data.stats?.partySurvivors?.length > 0 ? `<div>Survivors: ${data.stats.partySurvivors.join(', ')}</div>` : ''}
      ${data.stats?.partyDead?.length > 0 ? `<div class="fallen-names">Lost along the way: ${data.stats.partyDead.join(', ')}</div>` : ''}
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

function getEndingNarration(ending, data) {
  const name = data.cureCarrierName || 'the carrier';

  const ENDINGS = {
    golden: {
      title: 'A NEW DAWN',
      type: 'THE GOLDEN ENDING',
      paragraphs: [
        'The gates of the National Microbiology Lab open before you. Real soldiers — human, breathing, ALIVE — lower their weapons and stare. They weren\'t expecting survivors. Not anymore.',
        `${name} steps forward, arm outstretched. "I\'m immune," they say quietly. The lead scientist\'s eyes go wide. Within hours, blood is drawn. Tests are run. And for the first time in a year, someone in a lab coat smiles.`,
        'The cure will take months to synthesize and distribute. But it will happen. Because you walked 4,400 kilometers through hell, and you brought hope with you.',
        'MASEDOG didn\'t just survive the Dead North. MASEDOG saved the world.',
      ],
    },
    hopeful: {
      title: 'YOU MADE IT',
      type: 'THE HOPEFUL ENDING',
      paragraphs: [
        'Parliament Hill rises against a grey sky, scarred by fire and fighting but still standing. Behind it, the lab\'s emergency generators hum — a sound like a heartbeat.',
        `${name} carries the cure in their blood. The scientists work through the night. It\'s not over — it won\'t be over for a long time — but the first step is taken.`,
        'You sit on the steps of Parliament and watch the sun set over a broken city. Behind you, the people you carried across a continent. Ahead, the faint outline of tomorrow.',
        'The Dead North didn\'t kill you. And now, maybe, it doesn\'t have to kill anyone else.',
      ],
    },
    pyrrhic: {
      title: 'THE COST',
      type: 'A PYRRHIC VICTORY',
      paragraphs: [
        'You made it. God help you, you actually made it.',
        `But the victory feels hollow. You carried ${name} across 4,400 kilometers, and the scientists are already working on a cure. The world might survive. But look behind you — look at who isn\'t here.`,
        'The empty spaces where friends stood. The names you whisper at night. The choices that haunt you. Every single one of them bought you one more step east.',
        'Was it worth it? You\'ll spend the rest of your life answering that question. The world will say yes. You\'re not so sure.',
      ],
    },
    sacrifice: {
      title: 'THE SACRIFICE',
      type: 'THE SACRIFICE ENDING',
      paragraphs: [
        'The cure carrier didn\'t make it to Ottawa. But they didn\'t die for nothing.',
        'Before the end, you collected what you could — blood samples, tissue, notes from every doctor you met along the way. It\'s not much. It\'s barely anything.',
        'But the scientists at the lab look at what you brought them and they don\'t say "it\'s hopeless." They say "we can work with this." And in the apocalypse, that\'s everything.',
        'You stood at the grave of someone who could have saved the world, and you carried their legacy the rest of the way. That has to mean something.',
      ],
    },
    defiant: {
      title: 'DEFIANT',
      type: 'THE DEFIANT ENDING',
      paragraphs: [
        'There is no cure. The carrier is gone. The AI\'s broadcast echoes in your memory: "Your time is over."',
        'But you\'re still here. Standing in Ottawa. Alive. And you\'re not the only one — the lab is a fortress now, filled with survivors who refused to die. Engineers. Soldiers. Doctors. Farmers. People.',
        'You stood in front of a screen and told an artificial god that humanity wasn\'t finished. And then you walked 4,400 kilometers to prove it.',
        'The cure may come another way. Or it may not. But as long as people like MASEDOG keep putting one foot in front of the other, the Dead North hasn\'t won.',
      ],
    },
    bittersweet: {
      title: 'STILL STANDING',
      type: 'A BITTERSWEET ENDING',
      paragraphs: [
        'Ottawa. You\'re here. After everything — the hospital, the highway, the winter, the horde — you\'re standing on Parliament Hill watching the sun come up.',
        'The cure carrier didn\'t make it. That knowledge sits in your chest like a stone. But the lab is working. They have data. They have samples from infected tissue you brought. They have brilliant, desperate people who haven\'t given up.',
        'And they have you. A 20-year-old who walked across a country full of monsters and lived to tell the story.',
        'It\'s not the ending you hoped for. But it\'s not the end.',
      ],
    },
  };

  return ENDINGS[ending] || ENDINGS.bittersweet;
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

  // Build portrait images for HUD
  const allChars = [state.player, ...state.party.filter(c => c.isAlive)];
  const portraitHTML = allChars.map(c => {
    const url = getPortraitDataURL(c);
    return `<img class="hud-portrait" src="${url}" title="${c.name}: HP ${c.health}" alt="${c.name}">`;
  }).join('');

  hudEl.innerHTML = `
    <div class="hud-left">
      <div class="hud-portraits">${portraitHTML}</div>
      <span class="hud-item ${resources.food.critical ? 'critical' : ''}">Food:${resources.food.amount}</span>
      <span class="hud-item ${resources.water.critical ? 'critical' : ''}">H2O:${resources.water.amount}</span>
      <span class="hud-item ${resources.medicine.critical ? 'critical' : ''}">Med:${resources.medicine.amount}</span>
      <span class="hud-item ${resources.ammo.critical ? 'critical' : ''}">Ammo:${resources.ammo.amount}</span>
    </div>
    <div class="hud-center">
      <span class="hud-week">Week ${state.calendar.week}/52</span>
      <span class="hud-progress">${progress}%</span>
    </div>
    <div class="hud-right">
      <span class="hud-item">HP:${state.player.health}</span>
      <span class="hud-item">Morale:${state.player.morale}</span>
    </div>
  `;
}
