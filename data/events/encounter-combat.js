// ============================================================
// MASEDOG: Dead North — Combat Encounter Events
// ============================================================

import { range } from '../../engine/random.js';

export const COMBAT_EVENTS = [
  {
    id: 'evt_hospital_horde',
    type: 'combat',
    region: ['vancouver'],
    season: null,
    turnRange: [1, 3],
    baseWeight: 20,
    onceOnly: true,
    title: 'The Hospital Horde',
    segments: [{
      narration: 'The hospital parking lot. You thought you were clear, but the emergency doors burst open behind you. A wave of hospital gowns and scrubs — patients, nurses, doctors — all turned. They pour out like a dam breaking.',
      choices: [
        {
          text: 'Fight through them to the ambulance bay',
          skillCheck: { skill: 'combat', dc: 10 },
          successText: 'You swing hard and fast, clearing a path. The ambulance bay is just ahead — and there are vehicles.',
          failureText: 'They\'re too many. You take hits fighting through, but you make it. Barely.',
          effects: { travel: 10 },
          successEffects: { morale: 5 },
          failureEffects: { health: -15, morale: -5 },
        },
        {
          text: 'Run for the street — don\'t look back',
          skillCheck: { skill: 'athletics', dc: 8 },
          successText: 'Your legs burn but you outpace them. The groaning fades behind you.',
          failureText: 'You trip on a curb. A crawler grabs your ankle. You kick free but not before taking damage.',
          effects: { travel: 15 },
          failureEffects: { health: -10 },
        },
        {
          text: 'Duck into the underground parking garage',
          skillCheck: { skill: 'stealth', dc: 12 },
          successText: 'In the darkness of the garage, you hold your breath. They shuffle past. You find a working vehicle.',
          failureText: 'The garage is worse. More of them in the dark. You barely escape through a fire exit.',
          successEffects: { morale: 5 },
          failureEffects: { health: -20, morale: -10 },
          setFlags: { found_garage_vehicle: true },
        },
      ],
    }],
  },

  {
    id: 'evt_highway_ambush',
    type: 'combat',
    region: ['bc_interior', 'alberta', 'saskatchewan'],
    season: null,
    turnRange: [3, 30],
    baseWeight: 15,
    title: 'Highway Ambush',
    segments: [{
      narration: 'A tangle of crashed vehicles blocks the highway. As you pick your way through, movement erupts from inside the cars. Doors fly open. The dead spill out.',
      choices: [
        {
          text: 'Stand and fight — clear the road',
          combat: { zombieType: 'shambler', count: 5, difficulty: 'normal', canFlee: true },
          successText: 'The last one drops. You catch your breath among the wreckage. Time to search for supplies.',
          effects: { travel: 5 },
        },
        {
          text: 'Retreat and find a detour through the fields',
          effects: { travel: -10, food: -1 },
          resultText: 'The detour costs you time and food, but you avoid the fight. Smart or cowardly? Does it matter anymore?',
        },
        {
          text: 'Try to sneak through the wreckage without waking them',
          skillCheck: { skill: 'stealth', dc: 14 },
          successText: 'You move like a ghost between the rusted husks. Not a single one stirs.',
          failureText: 'A car alarm blares. Every head turns your way. RUN.',
          effects: { travel: 5 },
          failureEffects: { health: -10, morale: -5 },
        },
      ],
    }],
  },

  {
    id: 'evt_night_attack',
    type: 'combat',
    region: null,
    season: null,
    turnRange: [2, 52],
    baseWeight: 12,
    title: 'They Come at Night',
    segments: [{
      narration: 'You\'re jolted awake by screaming. Your camp perimeter is breached. Shapes move in the darkness — fast, hungry, relentless. Runners.',
      choices: [
        {
          text: 'Rally the group — defensive circle!',
          skillCheck: { skill: 'charisma', dc: 10 },
          successText: 'Everyone snaps into position. Back to back, you hold the line until dawn.',
          failureText: 'Panic. Someone breaks formation. The runners pour through the gap.',
          combat: { zombieType: 'runner', count: 4, difficulty: 'hard', canFlee: true },
        },
        {
          text: 'Grab what you can and run into the night',
          skillCheck: { skill: 'athletics', dc: 12 },
          successText: 'You escape into the darkness. Behind you, the camp is lost.',
          failureText: 'Running blind in the dark. Someone falls. You can\'t go back for them.',
          effects: { food: -3, water: -2 },
          failureEffects: { health: -10 },
        },
        {
          text: 'Light everything on fire — create a barrier',
          effects: { fuel: -2, scrap: -2 },
          resultText: 'Flames roar to life. The fire wall holds them at bay long enough to escape. But you\'ve burned through supplies.',
          setFlags: { used_fire_defense: true },
        },
      ],
    }],
  },

  {
    id: 'evt_screamer_bridge',
    type: 'combat',
    region: ['ontario_north', 'ontario_south'],
    season: null,
    turnRange: [8, 45],
    baseWeight: 10,
    title: 'The Screamer on the Bridge',
    segments: [{
      narration: 'A lone figure stands in the middle of the bridge. Motionless. Head tilted back. Then it opens its mouth and the SOUND — a piercing mechanical shriek that cuts through your skull. Behind you, you hear answering groans. Lots of them.',
      choices: [
        {
          text: 'Kill the screamer before more arrive',
          skillCheck: { skill: 'combat', dc: 12 },
          successText: 'You close the distance and silence it forever. The reinforcements scatter without their beacon.',
          failureText: 'You\'re too slow. The horde arrives before you reach it.',
          combat: { zombieType: 'screamer', count: 1, difficulty: 'normal', canFlee: true },
          failureCombat: { zombieType: 'shambler', count: 8, difficulty: 'hard', canFlee: true },
        },
        {
          text: 'Shoot it from a distance',
          requirements: { minAmmo: 1 },
          effects: { ammo: -1 },
          skillCheck: { skill: 'combat', dc: 14 },
          successText: 'One shot. It crumples. Silence.',
          failureText: 'You miss. The shrieking intensifies.',
          failureEffects: { morale: -5 },
        },
        {
          text: 'Turn around — find another way across',
          effects: { travel: -20 },
          resultText: 'You backtrack for hours, finding a shallow river crossing downstream. Time lost, but teeth avoided.',
        },
      ],
    }],
  },

  {
    id: 'evt_bloater_mall',
    type: 'combat',
    region: ['alberta', 'manitoba', 'ontario_south'],
    season: null,
    turnRange: [12, 52],
    baseWeight: 8,
    title: 'The Shopping Mall',
    segments: [{
      narration: 'A shopping mall. The doors are smashed open. Inside could be a goldmine of supplies... or a death trap. Then you see it — a Bloater, swollen and pulsating, wandering the food court. One wrong move and it pops.',
      choices: [
        {
          text: 'Carefully pick it off from range',
          skillCheck: { skill: 'combat', dc: 16 },
          successText: 'A clean hit from across the food court. It bursts at a safe distance. The gas cloud dissipates.',
          failureText: 'You hit it, but not clean enough. The cloud catches the edge of your group.',
          effects: { ammo: -2 },
          failureEffects: { health: -10 },
        },
        {
          text: 'Sneak past it to the pharmacy',
          skillCheck: { skill: 'stealth', dc: 13 },
          successText: 'Holding your breath, you inch past. The pharmacy is stocked.',
          failureText: 'A shard of glass under your boot. The Bloater turns. Starts waddling toward you.',
          successEffects: { medicine: 3, food: 2 },
          failureEffects: { health: -15, morale: -5 },
        },
        {
          text: 'Forget it — not worth the risk',
          effects: { morale: -3 },
          resultText: 'You walk away. Sometimes the smart play is knowing when to fold.',
        },
      ],
    }],
  },
];
