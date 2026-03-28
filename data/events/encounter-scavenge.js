// ============================================================
// MASEDOG: Dead North — Scavenge & Supply Events
// ============================================================

export const SCAVENGE_EVENTS = [
  {
    id: 'evt_abandoned_gas_station',
    type: 'scavenge',
    region: null,
    season: null,
    turnRange: [2, 52],
    baseWeight: 18,
    title: 'Abandoned Gas Station',
    segments: [{
      narration: 'A gas station appears on the highway shoulder. The pumps are dark, but the convenience store door hangs open. Could be supplies inside. Could be a trap.',
      choices: [
        {
          text: 'Search the store quickly',
          skillCheck: { skill: 'perception', dc: 8 },
          successText: 'Jackpot. Shelves aren\'t fully looted. You grab canned food, bottled water, and a first aid kit from behind the counter.',
          failureText: 'You find a few scraps, but most of it\'s been picked clean.',
          successEffects: { food: 4, water: 3, medicine: 1 },
          failureEffects: { food: 1, water: 1 },
        },
        {
          text: 'Check the back room and storage',
          skillCheck: { skill: 'stealth', dc: 12 },
          successText: 'The storage room is untouched. Cases of water, canned goods, even a gas can.',
          failureText: 'Something\'s in the back room. You hear it before you see it — a Crawler erupts from behind a shelf.',
          successEffects: { food: 6, water: 5, fuel: 2 },
          failureCombat: { zombieType: 'crawler', count: 2, difficulty: 'normal', canFlee: true },
        },
        {
          text: 'Skip it — keep moving',
          effects: { travel: 10 },
          resultText: 'You push on. Time is more valuable than a maybe.',
        },
      ],
    }],
  },

  {
    id: 'evt_pharmacy_raid',
    type: 'scavenge',
    region: ['vancouver', 'alberta', 'manitoba', 'ontario_south'],
    season: null,
    turnRange: [1, 52],
    baseWeight: 14,
    title: 'Pharmacy Run',
    segments: [{
      narration: 'A pharmacy. The windows are smashed, the alarm long dead. Most of the good stuff is probably gone, but pharmacies have back rooms that civilians don\'t know about.',
      choices: [
        {
          text: 'Quick grab — front shelves only',
          effects: { medicine: 1 },
          resultText: 'Bandages, some aspirin, antiseptic wipes. Better than nothing.',
        },
        {
          text: 'Break into the dispensary in back',
          skillCheck: { skill: 'mechanics', dc: 10 },
          successText: 'The lock gives way. Antibiotics, surgical supplies, painkillers — the real stuff.',
          failureText: 'You can\'t get the door open. The noise attracts attention.',
          successEffects: { medicine: 4 },
          failureEffects: { morale: -3 },
        },
        {
          text: 'Search thoroughly — take your time',
          skillCheck: { skill: 'perception', dc: 11 },
          successText: 'Patience pays off. You find a hidden safe under the counter with valuable medicine.',
          failureText: 'You spend too long searching. When you look up, three Shamblers are blocking the exit.',
          successEffects: { medicine: 5, scrap: 2 },
          failureCombat: { zombieType: 'shambler', count: 3, difficulty: 'normal', canFlee: true },
        },
      ],
    }],
  },

  {
    id: 'evt_abandoned_campsite',
    type: 'scavenge',
    region: ['bc_interior', 'ontario_north'],
    season: ['summer', 'fall'],
    turnRange: [3, 35],
    baseWeight: 12,
    title: 'Someone Else\'s Camp',
    segments: [{
      narration: 'Tents. A cold firepit. Scattered belongings. Whoever was here left in a hurry — or didn\'t leave at all. A journal lies open on the ground, the last entry smeared with something dark.',
      choices: [
        {
          text: 'Search the camp for supplies',
          effects: { food: 3, water: 2, scrap: 1 },
          resultText: 'Canned beans, a water purifier, some useful odds and ends. These people won\'t be needing them anymore.',
        },
        {
          text: 'Read the journal',
          resultText: 'The journal tells of a group heading east, same as you. They made it to Kamloops before things went bad. The final entry: "They\'re in the trees. They watch us at night. The new ones — they THINK."',
          setFlags: { stalker_warning: true },
          effects: { morale: -5 },
        },
        {
          text: 'Set up camp here for the night',
          effects: { health: 10, morale: 5 },
          resultText: 'The tents are intact. For one night, you sleep in something other than dirt. It feels almost normal.',
        },
      ],
    }],
  },

  {
    id: 'evt_military_checkpoint',
    type: 'scavenge',
    region: ['alberta', 'manitoba', 'ontario_south', 'ottawa_approach'],
    season: null,
    turnRange: [5, 52],
    baseWeight: 10,
    onceOnly: false,
    title: 'Abandoned Military Checkpoint',
    segments: [{
      narration: 'Sandbags. Razor wire. Military vehicles, some overturned. A checkpoint that was meant to hold the line. It didn\'t. But the military doesn\'t leave empty-handed — there might be gear here.',
      choices: [
        {
          text: 'Search the vehicles',
          skillCheck: { skill: 'perception', dc: 10 },
          successText: 'MREs, ammo boxes, a medical kit with military-grade supplies. Whoever was here, they left in a hurry.',
          failureText: 'The vehicles have been stripped, but you find some ammo under a seat.',
          successEffects: { food: 5, ammo: 8, medicine: 2 },
          failureEffects: { ammo: 3 },
        },
        {
          text: 'Check the command tent',
          skillCheck: { skill: 'stealth', dc: 13 },
          successText: 'Maps, radio equipment, and a locked case with a pistol inside. You also find a transmission log mentioning Ottawa.',
          failureText: 'Booby trap! A tripwire sets off an alarm — and something much worse.',
          successEffects: { ammo: 5 },
          failureCombat: { zombieType: 'runner', count: 6, difficulty: 'hard', canFlee: true },
          setFlags: { heard_ottawa_transmission: true },
        },
        {
          text: 'This place gives you a bad feeling — move on',
          effects: { travel: 5 },
          resultText: 'Trust your gut. The checkpoint fades behind you. Some doors are better left unopened.',
        },
      ],
    }],
  },

  {
    id: 'evt_grocery_store',
    type: 'scavenge',
    region: null,
    season: null,
    turnRange: [1, 52],
    baseWeight: 15,
    title: 'Ransacked Grocery Store',
    segments: [{
      narration: 'The grocery store has been looted, but looters are messy. There\'s always something left behind — under shelves, in the stockroom, in the deli\'s walk-in cooler.',
      choices: [
        {
          text: 'Systematic search — aisle by aisle',
          skillCheck: { skill: 'survival', dc: 9 },
          successText: 'Behind a toppled shelf: canned goods. In the cooler: still-frozen meat. In the back: cases of water.',
          failureText: 'Slim pickings. A few cans, some stale crackers.',
          successEffects: { food: 5, water: 3 },
          failureEffects: { food: 2 },
        },
        {
          text: 'Rush in, grab, get out',
          effects: { food: 2, water: 1 },
          resultText: 'You grab what you can see and bolt. Speed over thoroughness.',
        },
        {
          text: 'Check if the loading dock has undelivered trucks',
          skillCheck: { skill: 'mechanics', dc: 11 },
          successText: 'A delivery truck, locked but not looted. Inside: pallets of supplies. You load up everything you can carry.',
          failureText: 'The dock is empty. Wasted time.',
          successEffects: { food: 8, water: 6 },
          failureEffects: { morale: -2 },
        },
      ],
    }],
  },
];
