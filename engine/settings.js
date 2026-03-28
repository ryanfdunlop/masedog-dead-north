// ============================================================
// MASEDOG: Dead North — Game Settings
// Persistent settings stored in localStorage.
// ============================================================

const STORAGE_KEY = 'masedog_settings';

const DEFAULTS = {
  timedChoices: true,
  timerSpeed: 'normal',
  timerSeconds: 20,     // Direct seconds setting: 5, 10, 20, 30, 60, or 0 (off)
  masterVolume: 50,     // 0-100
  musicVolume: 30,      // 0-100
  sfxVolume: 60,        // 0-100
  soundEnabled: true,
};

// Timer durations in seconds for each speed and urgency level
const TIMER_DURATIONS = {
  fast:    { urgent: 5,  tense: 8,  normal: 10 },
  normal:  { urgent: 10, tense: 15, normal: 20 },
  slow:    { urgent: 20, tense: 25, normal: 30 },
  relaxed: { urgent: 60, tense: 60, normal: 60 },
  off:     { urgent: 0,  tense: 0,  normal: 0 },
};

let settings = { ...DEFAULTS };

/**
 * Load settings from localStorage. Call on game start.
 */
export function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      settings = { ...DEFAULTS, ...parsed };
    }
  } catch (e) {
    // Corrupt data — reset to defaults
    settings = { ...DEFAULTS };
  }
  return settings;
}

/**
 * Get the current settings object (read-only copy).
 */
export function getSettings() {
  return { ...settings };
}

/**
 * Update a single setting and persist to localStorage.
 */
export function updateSetting(key, value) {
  if (!(key in DEFAULTS)) return;
  settings[key] = value;
  _save();
}

/**
 * Get the timer duration in seconds for a given urgency level.
 * Returns 0 if timers are disabled.
 * @param {'urgent' | 'tense' | 'normal'} urgency
 * @returns {number} seconds
 */
export function getTimerDuration(urgency) {
  if (!settings.timedChoices) return 0;

  const speed = settings.timerSpeed;
  if (speed === 'off') return 0;

  const durations = TIMER_DURATIONS[speed];
  if (!durations) return 0;

  return durations[urgency] || durations.normal;
}

/**
 * Check if timed choices are currently enabled.
 */
export function isTimerEnabled() {
  return settings.timedChoices && settings.timerSpeed !== 'off';
}

function _save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // localStorage full or unavailable — silently fail
  }
}
