// ============================================================
// MASEDOG: Dead North — Route Map UI
// Visual journey progress from Vancouver to Ottawa
// ============================================================

import { getState } from '../engine/state.js';
import { WAYPOINTS, getCurrentWaypoint, getNextWaypoint, getProgress } from '../data/locations.js';

/**
 * Render the route map into a container element.
 */
export function renderMap(container) {
  const state = getState();
  if (!state || !container) return;

  const currentKm = state.journey.currentKm;
  const progress = getProgress(currentKm);
  const currentWp = getCurrentWaypoint(currentKm);
  const nextWp = getNextWaypoint(currentKm);

  let html = `
    <div class="map-container">
      <h3 class="map-title">ROUTE: VANCOUVER → OTTAWA</h3>
      <div class="map-distance">${currentKm.toLocaleString()} / 4,400 km — ${progress}%</div>

      <div class="map-track">
  `;

  for (const wp of WAYPOINTS) {
    const wpProgress = (wp.km / 4400) * 100;
    const reached = currentKm >= wp.km;
    const isCurrent = wp.id === currentWp.id;
    const isNext = wp.id === nextWp.id && !reached;

    let markerClass = 'map-marker';
    if (reached) markerClass += ' reached';
    if (isCurrent) markerClass += ' current';
    if (isNext) markerClass += ' next';

    html += `
      <div class="${markerClass}" style="left: ${wpProgress}%">
        <div class="marker-dot"></div>
        <div class="marker-label">${wp.name}</div>
        <div class="marker-km">${wp.km} km</div>
      </div>
    `;
  }

  // Player position indicator
  const playerPos = Math.min(100, (currentKm / 4400) * 100);
  html += `
        <div class="map-line">
          <div class="map-line-fill" style="width: ${playerPos}%"></div>
        </div>
        <div class="map-player" style="left: ${playerPos}%">▲</div>
      </div>

      <div class="map-info">
        <div class="map-current">
          <strong>Current area:</strong> ${currentWp.name}
          <div class="map-flavor">${currentWp.description}</div>
        </div>
  `;

  if (nextWp.id !== currentWp.id) {
    const distToNext = nextWp.km - currentKm;
    html += `
        <div class="map-next-info">
          <strong>Next stop:</strong> ${nextWp.name} — ${distToNext} km away
          <div class="map-flavor">${nextWp.flavor}</div>
        </div>
    `;
  } else {
    html += `
        <div class="map-next-info arrived">
          <strong>YOU HAVE ARRIVED AT OTTAWA</strong>
        </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}
