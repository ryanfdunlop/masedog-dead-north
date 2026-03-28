# MASEDOG: Dead North

## Game Overview
A zombie apocalypse RPG browser game inspired by Oregon Trail. Set in 2031 — AI has turned on humanity and released a virus creating zombies. Player (MASEDOG, 20yo) must travel from Vancouver to Ottawa over 52 weeks (turns), making survival choices. Choose-your-own-adventure story + Oregon Trail resource management + 16-bit mini-games.

## Design Pillars
- **PG-13 tone**: Scary, thrilling, sad, sometimes anger-inducing. Not gratuitous — emotional weight over gore.
- **Player choices determine success**: Your decisions drive the outcome — not random difficulty spikes. Smart play wins.
- **No instant death**: Getting downed sets you to 1 HP. Game over only if downed twice without recovering.
- **Visual dice system**: Two dice the player clicks to roll. Easy = 1 roll, hard = 2-3 rolls. Odds shown before rolling.
- **Player-directed camp actions**: Choose what to do at camp — scout water, forage food, train skills, rest, scavenge.
- **Skill progression**: Every dice roll (pass or fail) earns XP. Skills level up through play and training.
- **Replayable**: Deep randomization engine means every playthrough feels different without AI API calls.
- **Dramatic writing**: Narration should read like a novel. Build tension, create attachment to characters, make losses hurt.

## Tech Conventions
- **Pure HTML/CSS/JavaScript** — NO frameworks (React, Vue, etc.)
- **ES Modules** (`import`/`export`) — loaded via `<script type="module">`
- **No bundler** needed for development. Serve with any static server.
- **Naming**: camelCase for variables/functions, PascalCase for classes, UPPER_SNAKE for constants
- **State mutations**: Always go through `dispatch()` in state.js — never mutate gameState directly
- **All randomness**: Must use the seeded PRNG from random.js — NEVER use `Math.random()`

## Key Systems
- **Seeded PRNG** (mulberry32): All randomness flows through this. Same seed = same game.
- **Event pool**: 200+ pre-written events filtered by region/season/flags/party state, weighted dynamically.
- **Butterfly flags**: ~100 boolean/numeric flags tracking player decisions. Early choices unlock/block late events.
- **Infection**: HEALTHY → BITTEN → INFECTED → TURNING → TURNED. Medicine helps in BITTEN stage only.
- **The Cure**: One random party member per playthrough is secretly immune. Revealed late game.
- **Pressure system**: Hidden difficulty adjuster — harder events when thriving, mercy events when struggling.

## Character Stats
- Health: 0-100 (0 = dead)
- Morale: 0-100 (0 = desertion risk)
- Skills (1-10): combat, athletics, perception, medical, mechanics, charisma, stealth, survival
- Traits: personality tags affecting events (cautious, aggressive, empathetic, resourceful, leader, loner)
- Skill checks: `roll(rng, 20) + skillBonus >= dc`

## Event Data Format
See `data/events/` files. Each event has: id, type, region filter, season filter, turn range, base weight, flag requirements/exclusions, narration segments with choices, outcomes with rewards/penalties/flag changes.

## Project Structure
- `engine/` — Core game systems (state, random, events, combat, resources, weather, infection)
- `ui/` — Screen rendering (narrator, HUD, inventory, map)
- `minigames/` — Canvas-based action sequences
- `data/` — All game content (story, events, items, NPCs, locations)
- `assets/` — Sprites, backgrounds, audio, fonts
- `tools/` — Dev-only utilities (balance sim, event tester)
