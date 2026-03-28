// ============================================================
// MASEDOG: Dead North — Inventory & Party Management Screen
// ============================================================

import { getState, getLivingParty, dispatch } from '../engine/state.js';
import { getResourceStatus } from '../engine/resources.js';
import { getInfectionStatus, treatBite } from '../engine/infection.js';
import { SKILLS } from '../data/skills.js';

/**
 * Render the inventory/party management panel.
 */
export function renderInventory(container) {
  const state = getState();
  if (!state || !container) return;

  const resources = getResourceStatus();
  const living = getLivingParty();
  const dead = state.party.filter(c => !c.isAlive);

  let html = `
    <div class="inventory-container">
      <div class="inv-section">
        <h3 class="inv-header">RESOURCES</h3>
        <div class="inv-grid">
          ${invItem('Food', resources.food.amount, resources.food.critical, `${resources.food.daysLeft} days supply`)}
          ${invItem('Water', resources.water.amount, resources.water.critical, `${resources.water.daysLeft} days supply`)}
          ${invItem('Medicine', resources.medicine.amount, resources.medicine.critical, 'Treats bites & illness')}
          ${invItem('Ammo', resources.ammo.amount, resources.ammo.critical, 'For ranged combat')}
          ${invItem('Fuel', resources.fuel.amount, resources.fuel.critical, 'Vehicle travel')}
          ${invItem('Scrap', resources.scrap.amount, false, 'Crafting & repairs')}
        </div>
      </div>

      <div class="inv-section">
        <h3 class="inv-header">MASEDOG (YOU)</h3>
        ${characterDetail(state.player)}
      </div>

      ${living.map(c => `
        <div class="inv-section">
          <h3 class="inv-header">${c.name.toUpperCase()} ${c.isCureCarrier && state.flags.cure_revealed ? '<span class="cure-tag">THE CURE</span>' : ''}</h3>
          ${characterDetail(c)}
        </div>
      `).join('')}

      ${dead.length > 0 ? `
        <div class="inv-section fallen">
          <h3 class="inv-header">THE FALLEN</h3>
          ${dead.map(c => `
            <div class="fallen-entry">
              ${c.name} — Died week ${c.joinedTurn || '?'}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  container.innerHTML = html;

  // Wire up treat buttons
  container.querySelectorAll('.btn-treat').forEach(btn => {
    btn.addEventListener('click', () => {
      const charId = btn.dataset.charId;
      const result = treatBite(charId);
      // Re-render to show updated state
      renderInventory(container);
      // Show result as alert (will replace with better UI later)
      const msg = document.createElement('div');
      msg.className = result.success ? 'treat-result success' : 'treat-result failure';
      msg.textContent = result.message;
      btn.parentElement.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
    });
  });
}

function invItem(name, amount, critical, desc) {
  return `
    <div class="inv-item ${critical ? 'critical' : ''}">
      <div class="inv-item-name">${name}</div>
      <div class="inv-item-amount">${amount}</div>
      <div class="inv-item-desc">${desc}</div>
    </div>
  `;
}

function characterDetail(char) {
  const infection = getInfectionStatus(char);
  const healthPct = (char.health / char.maxHealth) * 100;
  const moralePct = char.morale;

  return `
    <div class="char-detail">
      <div class="char-detail-row">
        <span>Age ${char.age}</span>
        ${char.traits.map(t => `<span class="trait-tag">${t}</span>`).join('')}
        ${char.status.filter(s => s !== 'dead').map(s => `<span class="status-tag">${s}</span>`).join('')}
      </div>

      <div class="stat-bars">
        <div class="stat-row">
          <span class="stat-label">Health</span>
          <div class="stat-track">
            <div class="stat-fill health" style="width: ${healthPct}%"></div>
          </div>
          <span class="stat-value">${char.health}/${char.maxHealth}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Morale</span>
          <div class="stat-track">
            <div class="stat-fill morale" style="width: ${moralePct}%"></div>
          </div>
          <span class="stat-value">${char.morale}/100</span>
        </div>
      </div>

      ${infection ? `
        <div class="infection-warning" style="color: ${infection.color}">
          ${infection.label} — ${infection.turnsLeft} week(s) remaining
          ${infection.label === 'BITTEN' ? `<button class="btn-treat" data-char-id="${char.id}">USE MEDICINE</button>` : ''}
        </div>
      ` : ''}

      <div class="skills-grid">
        ${Object.entries(char.skills).map(([key, val]) => `
          <div class="skill-entry">
            <span class="skill-name">${key}</span>
            <div class="skill-pips">
              ${Array.from({length: 10}, (_, i) => `<span class="pip ${i < val ? 'filled' : ''}"></span>`).join('')}
            </div>
            <span class="skill-val">${val}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
