// ============================================================
// MASEDOG: Dead North — Character Portrait System
// Canvas-drawn pixel art portraits for characters.
// ============================================================

const PORTRAIT_SIZE = 48;
const COLORS = {
  skin: ['#e8c8a0', '#d4a574', '#c69c6d', '#8d5524', '#6b3a1f'],
  hair: ['#2c1810', '#4a3728', '#8b6914', '#c4834c', '#1a1a1a', '#553311'],
  eyes: ['#334455', '#445533', '#554433', '#223344'],
  shirt: ['#445566', '#556644', '#665544', '#446655', '#554466', '#cc3333', '#ffffff'],
};

/**
 * Generate a deterministic portrait canvas for a character.
 * Uses character ID as seed for consistent appearance.
 */
export function generatePortrait(character) {
  const canvas = document.createElement('canvas');
  canvas.width = PORTRAIT_SIZE;
  canvas.height = PORTRAIT_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Seed from character ID
  let seed = hashString(character.id);
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  // Pick colors deterministically
  const skinColor = COLORS.skin[Math.floor(rand() * COLORS.skin.length)];
  const hairColor = COLORS.hair[Math.floor(rand() * COLORS.hair.length)];
  const eyeColor = COLORS.eyes[Math.floor(rand() * COLORS.eyes.length)];
  const shirtColor = COLORS.shirt[Math.floor(rand() * COLORS.shirt.length)];

  // Background
  ctx.fillStyle = '#1a1a25';
  ctx.fillRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);

  // Use known portraits for main characters
  const knownPortraits = {
    masedog: { skin: '#e8c8a0', hair: '#2c1810', shirt: '#445566', hasBuzz: true },
    violet: { skin: '#e8c8a0', hair: '#8b6914', shirt: '#554466', isLongHair: true },
    cassidy: { skin: '#d4a574', hair: '#1a1a1a', shirt: '#446655', isYoung: true },
    dr_reyes: { skin: '#c69c6d', hair: '#2c1810', shirt: '#ffffff', hasGlasses: true },
  };

  const known = knownPortraits[character.id];
  const skin = known?.skin || skinColor;
  const hair = known?.hair || hairColor;
  const shirt = known?.shirt || shirtColor;

  // Draw pixel portrait (16x16 grid scaled to 48x48)
  const px = 3; // pixel size (48/16)

  function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * px, y * px, px, px);
  }

  // Shirt / body (rows 12-15)
  for (let x = 4; x <= 11; x++) {
    for (let y = 12; y <= 15; y++) {
      drawPixel(x, y, shirt);
    }
  }
  // Collar
  drawPixel(6, 12, darken(shirt, 20));
  drawPixel(7, 12, skin);
  drawPixel(8, 12, skin);
  drawPixel(9, 12, darken(shirt, 20));

  // Neck
  drawPixel(7, 11, skin);
  drawPixel(8, 11, skin);

  // Head shape (rows 4-10)
  for (let x = 5; x <= 10; x++) {
    for (let y = 5; y <= 10; y++) {
      drawPixel(x, y, skin);
    }
  }
  // Head sides
  drawPixel(4, 6, skin); drawPixel(4, 7, skin); drawPixel(4, 8, skin);
  drawPixel(11, 6, skin); drawPixel(11, 7, skin); drawPixel(11, 8, skin);

  // Eyes (row 7)
  drawPixel(6, 7, eyeColor);
  drawPixel(9, 7, eyeColor);
  // Eye whites
  drawPixel(6, 7, '#ffffff');
  drawPixel(9, 7, '#ffffff');
  // Pupils
  ctx.fillStyle = '#111';
  ctx.fillRect(6 * px + 1, 7 * px + 1, 1, 1);
  ctx.fillRect(9 * px + 1, 7 * px + 1, 1, 1);

  // Mouth
  drawPixel(7, 9, darken(skin, 30));
  drawPixel(8, 9, darken(skin, 30));

  // Hair (top of head)
  for (let x = 5; x <= 10; x++) {
    drawPixel(x, 4, hair);
    drawPixel(x, 3, hair);
  }
  drawPixel(4, 4, hair); drawPixel(4, 5, hair);
  drawPixel(11, 4, hair); drawPixel(11, 5, hair);

  // Long hair for Violet
  if (known?.isLongHair) {
    for (let y = 5; y <= 11; y++) {
      drawPixel(3, y, hair);
      drawPixel(12, y, hair);
    }
  }

  // Glasses for Dr. Reyes
  if (known?.hasGlasses) {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(5 * px, 7 * px - 1, px * 2 + 1, px + 2);
    ctx.strokeRect(8 * px, 7 * px - 1, px * 2 + 1, px + 2);
    ctx.beginPath();
    ctx.moveTo(7 * px + 1, 7 * px);
    ctx.lineTo(8 * px, 7 * px);
    ctx.stroke();
  }

  // Infection indicator
  if (character.infectionState && character.infectionState !== 'HEALTHY') {
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(0, 0, PORTRAIT_SIZE, 2);
    ctx.fillRect(0, PORTRAIT_SIZE - 2, PORTRAIT_SIZE, 2);
  }

  // Dead indicator
  if (!character.isAlive) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);
    ctx.strokeStyle = '#cc3333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(PORTRAIT_SIZE - 8, PORTRAIT_SIZE - 8);
    ctx.moveTo(PORTRAIT_SIZE - 8, 8);
    ctx.lineTo(8, PORTRAIT_SIZE - 8);
    ctx.stroke();
  }

  return canvas;
}

/**
 * Get a portrait as a data URL for use in img tags.
 */
export function getPortraitDataURL(character) {
  const canvas = generatePortrait(character);
  return canvas.toDataURL();
}

/**
 * Render a row of party portraits into a container.
 */
export function renderPartyPortraits(container, player, party) {
  if (!container) return;

  container.innerHTML = '';
  const allChars = [player, ...party];

  for (const char of allChars) {
    const wrapper = document.createElement('div');
    wrapper.className = `portrait-wrapper ${!char.isAlive ? 'dead' : ''} ${char.infectionState !== 'HEALTHY' ? 'infected' : ''}`;

    const canvas = generatePortrait(char);
    canvas.className = 'portrait-canvas';
    canvas.title = `${char.name} — HP: ${char.health} Morale: ${char.morale}`;

    const nameTag = document.createElement('div');
    nameTag.className = 'portrait-name';
    nameTag.textContent = char.name.split(' ')[0]; // First name only

    const healthBar = document.createElement('div');
    healthBar.className = 'portrait-health';
    const healthFill = document.createElement('div');
    healthFill.className = 'portrait-health-fill';
    healthFill.style.width = `${(char.health / char.maxHealth) * 100}%`;
    healthFill.style.background = char.health > 60 ? '#4a4' : char.health > 30 ? '#aa4' : '#a44';
    healthBar.appendChild(healthFill);

    wrapper.appendChild(canvas);
    wrapper.appendChild(nameTag);
    wrapper.appendChild(healthBar);
    container.appendChild(wrapper);
  }
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function darken(hex, amount) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
