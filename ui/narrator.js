// ============================================================
// MASEDOG: Dead North — Narrator UI
// Typewriter text display and choice presentation.
// ============================================================

import { calculateSuccessChance, convertDCtoTarget, getRollCount } from './dice.js';
import { isTimerEnabled, getTimerDuration } from '../engine/settings.js';
import { startChoiceTimer, stopChoiceTimer } from './timer.js';

const CHAR_DELAY = 25;  // ms per character for typewriter
const LINE_DELAY = 200; // ms pause between lines

let narratorEl = null;
let choicesEl = null;
let skipRequested = false;

/**
 * Initialize narrator with DOM elements.
 */
export function initNarrator(narratorElement, choicesElement) {
  narratorEl = narratorElement;
  choicesEl = choicesElement;
}

/**
 * Display text with typewriter effect.
 * Click/keypress to skip.
 */
export function typeText(text) {
  return new Promise((resolve) => {
    if (!narratorEl) { resolve(); return; }

    // Add new paragraph
    const p = document.createElement('div');
    p.className = 'narration-block';
    narratorEl.appendChild(p);

    const lines = text.split('\n');
    let lineIndex = 0;
    let charIndex = 0;
    let currentLine = null;
    skipRequested = false;

    function onSkip() {
      skipRequested = true;
    }

    document.addEventListener('click', onSkip, { once: false });
    document.addEventListener('keydown', onSkip, { once: false });

    function tick() {
      if (skipRequested) {
        // Show all remaining text immediately
        p.innerHTML = '';
        for (const line of lines) {
          if (line === '') {
            p.appendChild(document.createElement('br'));
          } else {
            const span = document.createElement('div');
            span.className = 'narration-line';
            span.textContent = line;
            p.appendChild(span);
          }
        }
        cleanup();
        return;
      }

      if (lineIndex >= lines.length) {
        cleanup();
        return;
      }

      if (!currentLine) {
        if (lines[lineIndex] === '') {
          p.appendChild(document.createElement('br'));
          lineIndex++;
          setTimeout(tick, LINE_DELAY);
          return;
        }
        currentLine = document.createElement('div');
        currentLine.className = 'narration-line';
        p.appendChild(currentLine);
        charIndex = 0;
      }

      if (charIndex < lines[lineIndex].length) {
        currentLine.textContent += lines[lineIndex][charIndex];
        charIndex++;
        setTimeout(tick, CHAR_DELAY);
      } else {
        currentLine = null;
        lineIndex++;
        setTimeout(tick, LINE_DELAY);
      }

      // Auto-scroll
      narratorEl.scrollTop = narratorEl.scrollHeight;
    }

    function cleanup() {
      document.removeEventListener('click', onSkip);
      document.removeEventListener('keydown', onSkip);
      skipRequested = false;

      // Add continue prompt after a small delay to prevent
      // the skip-click from also dismissing the prompt
      setTimeout(() => {
        const prompt = document.createElement('div');
        prompt.className = 'continue-prompt';
        prompt.textContent = '[ Click or press any key to continue ]';
        p.appendChild(prompt);
        narratorEl.scrollTop = narratorEl.scrollHeight;

        function onContinue() {
          prompt.remove();
          document.removeEventListener('click', onContinue);
          document.removeEventListener('keydown', onContinue);
          resolve();
        }
        document.addEventListener('click', onContinue, { once: true });
        document.addEventListener('keydown', onContinue, { once: true });
      }, 100);
    }

    tick();
  });
}

/**
 * Show choice buttons. Calls callback with the chosen option.
 *
 * If any choice has a `timed` property ('urgent' | 'tense' | 'normal'),
 * the entire choice set gets a countdown timer using the most urgent
 * value found. When the timer expires, the LAST choice (worst option)
 * is auto-selected.
 */
export function showChoices(choices, callback) {
  if (!choicesEl) return;

  choicesEl.innerHTML = '';
  choicesEl.style.display = 'flex';

  // Determine if this is a timed choice set
  const urgencyRank = { urgent: 3, tense: 2, normal: 1 };
  let highestUrgency = null;

  for (const choice of choices) {
    if (choice.timed && urgencyRank[choice.timed]) {
      if (!highestUrgency || urgencyRank[choice.timed] > urgencyRank[highestUrgency]) {
        highestUrgency = choice.timed;
      }
    }
  }

  // Wrap callback to also stop the timer
  let choiceMade = false;
  function onChoiceMade(choice) {
    if (choiceMade) return; // Prevent double-fire
    choiceMade = true;
    stopChoiceTimer();
    document.removeEventListener('keydown', onKey);
    choicesEl.style.display = 'none';
    callback(choice);
  }

  choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `<span class="choice-number">${index + 1}</span> ${choice.text}`;

    // Show cost/requirement hints
    if (choice.effects) {
      const costs = [];
      for (const [key, val] of Object.entries(choice.effects)) {
        if (val < 0) costs.push(`${key}: ${val}`);
      }
      if (costs.length > 0) {
        const costSpan = document.createElement('span');
        costSpan.className = 'choice-cost';
        costSpan.textContent = ` [${costs.join(', ')}]`;
        btn.appendChild(costSpan);
      }
    }

    if (choice.skillCheck) {
      const playerSkills = window._masedog_player_skills || {};
      const bonus = playerSkills[choice.skillCheck.skill] || 0;
      const target = convertDCtoTarget(choice.skillCheck.dc);
      const numRolls = getRollCount(choice.skillCheck.dc);
      const pct = calculateSuccessChance(bonus, target, numRolls);

      const chanceClass = pct >= 65 ? 'high' : pct >= 40 ? 'medium' : 'low';
      const rollText = numRolls > 1 ? ` (${numRolls} rolls)` : '';
      const skillTag = document.createElement('span');
      skillTag.className = `choice-chance ${chanceClass}`;
      skillTag.textContent = `${choice.skillCheck.skill.toUpperCase()} — ${pct}%${rollText}`;
      btn.appendChild(skillTag);
    }

    btn.addEventListener('click', () => {
      onChoiceMade(choice);
    });

    choicesEl.appendChild(btn);
  });

  // Keyboard shortcuts (1-4)
  function onKey(e) {
    const num = parseInt(e.key);
    if (num >= 1 && num <= choices.length) {
      onChoiceMade(choices[num - 1]);
    }
  }
  document.addEventListener('keydown', onKey);

  // Start timed countdown if applicable
  if (highestUrgency && isTimerEnabled()) {
    const seconds = getTimerDuration(highestUrgency);
    if (seconds > 0) {
      startChoiceTimer(seconds, () => {
        // Timer expired — auto-select the LAST choice (worst option)
        const worstChoice = choices[choices.length - 1];
        onChoiceMade(worstChoice);
      });
    }
  }
}

/**
 * Show result messages.
 */
export function showResults(messages) {
  return new Promise((resolve) => {
    if (!narratorEl || messages.length === 0) { resolve(); return; }

    const block = document.createElement('div');
    block.className = 'result-block';

    for (const msg of messages) {
      const line = document.createElement('div');
      line.className = 'result-line';
      line.textContent = msg;
      block.appendChild(line);
    }

    narratorEl.appendChild(block);
    narratorEl.scrollTop = narratorEl.scrollHeight;

    // Wait for click/key to continue
    const prompt = document.createElement('div');
    prompt.className = 'continue-prompt';
    prompt.textContent = '[ Click or press any key to continue ]';
    block.appendChild(prompt);

    function onContinue() {
      prompt.remove();
      document.removeEventListener('click', onContinue);
      document.removeEventListener('keydown', onContinue);
      resolve();
    }
    document.addEventListener('click', onContinue, { once: true });
    document.addEventListener('keydown', onContinue, { once: true });
  });
}

/**
 * Clear the narration area.
 */
export function clearNarration() {
  if (narratorEl) narratorEl.innerHTML = '';
  if (choicesEl) {
    choicesEl.innerHTML = '';
    choicesEl.style.display = 'none';
  }
}
