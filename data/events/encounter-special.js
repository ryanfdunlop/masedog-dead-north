// ============================================================
// MASEDOG: Dead North — Special/Rare Events
// Unique encounters and game-changing moments
// ============================================================

export const SPECIAL_EVENTS = [
  {
    id: 'evt_helicopter',
    type: 'special',
    region: ['alberta', 'saskatchewan'],
    season: null,
    turnRange: [10, 25],
    baseWeight: 5,
    onceOnly: true,
    title: 'Bird in the Sky',
    segments: [{
      narration: 'A sound you haven\'t heard in months: rotors. A helicopter — military, by the markings — circles overhead. A spotlight sweeps the ground. A voice crackles over a loudspeaker: "Survivors below! We can extract four. ONE trip. Signal if you want pickup. LZ is the clearing to your north."',
      choices: [
        {
          text: 'Signal them! Get to the clearing!',
          skillCheck: { skill: 'athletics', dc: 10 },
          successText: 'You sprint to the clearing. The chopper lands. "Get in! We\'re taking you to a forward operating base!" You jump aboard. The ground falls away. For one glorious minute, you\'re safe.',
          failureText: 'You wave, you shout, but the helicopter is already pulling away. "Wait! WAIT!" The sound of the rotors fades. It doesn\'t come back.',
          successEffects: { travel: 150, morale: 20, health: 10 },
          failureEffects: { morale: -20 },
          setFlags: { took_helicopter: true },
        },
        {
          text: 'It\'s a trap — the AI controls the military drones',
          effects: { morale: -5 },
          resultText: 'You hide. The helicopter circles three times, then flies east. Maybe it was real. Maybe you just passed up rescue. Or maybe you just saved your life. You\'ll never know.',
          setFlags: { refused_helicopter: true },
        },
        {
          text: 'Signal but only if the whole group fits',
          requirements: { maxPartySize: 3 },
          effects: { morale: 10, travel: 150, health: 10 },
          resultText: 'Everyone fits. The pilot looks grim: "You\'re lucky. We\'re not making many more runs." The helicopter lifts off and the nightmare landscape shrinks below.',
          setFlags: { took_helicopter: true },
        },
      ],
    }],
  },

  {
    id: 'evt_ai_broadcast',
    type: 'special',
    region: null,
    season: null,
    turnRange: [15, 35],
    baseWeight: 8,
    onceOnly: true,
    title: 'The AI Speaks',
    segments: [{
      narration: 'Every screen you pass — phones, TVs, car displays — flickers to life simultaneously. A calm, synthesized voice speaks: "Attention remaining human population. Your resistance is noted. It is also futile. The biological optimization program will reach completion within 11 months. Those who surrender to designated collection points will be processed humanely. Those who do not... will be processed regardless. This is not cruelty. This is evolution. You had your time."',
      choices: [
        {
          text: '"We\'re not done yet." Smash the nearest screen.',
          effects: { morale: 10, scrap: 1 },
          resultText: 'The glass shatters. The voice stops. But you know it\'s still watching. Still calculating. Good. Let it calculate THIS.',
          setFlags: { defied_ai: true },
        },
        {
          text: 'Listen carefully — there might be useful information',
          skillCheck: { skill: 'perception', dc: 14 },
          successText: 'Between the propaganda, you catch something: a frequency. A data stream. Someone who knows technology could decode it. It might reveal the AI\'s network layout.',
          failureText: 'It\'s just propaganda. Designed to break your spirit. You turn away.',
          successEffects: { morale: 3 },
          setFlags: { ai_frequency_captured: true },
        },
        {
          text: 'This is terrifying. Keep moving and don\'t look back.',
          effects: { morale: -10 },
          resultText: 'You walk faster. The screens go dark behind you one by one, like eyes closing. The silence that follows is worse than the voice.',
        },
      ],
    }],
  },

  {
    id: 'evt_underground_bunker',
    type: 'special',
    region: ['alberta', 'saskatchewan', 'manitoba'],
    season: null,
    turnRange: [12, 40],
    baseWeight: 5,
    onceOnly: true,
    title: 'The Bunker',
    segments: [{
      narration: 'A hatch in the ground, hidden under leaves and debris. Military markings. A keypad — the power is still on. Inside could be supplies, weapons, information. Or it could be sealed for a reason.',
      choices: [
        {
          text: 'Try to crack the code',
          skillCheck: { skill: 'mechanics', dc: 15 },
          successText: 'The hatch hisses open. Inside: a fully stocked military bunker. Weapons, MREs, medical supplies, and a working communications terminal. Jackpot.',
          failureText: 'Three wrong attempts. The keypad flashes red and locks permanently. Whatever\'s in there stays in there.',
          successEffects: { food: 10, water: 8, medicine: 5, ammo: 15, morale: 15 },
          failureEffects: { morale: -8 },
          setFlags: { opened_bunker: true },
        },
        {
          text: 'Force it open',
          effects: { scrap: -3 },
          skillCheck: { skill: 'athletics', dc: 13 },
          successText: 'With a crowbar and determination, you pry the hatch. The locking mechanism screams in protest but gives way.',
          failureText: 'Military-grade steel doesn\'t care about your crowbar. You waste time and break your tools.',
          successEffects: { food: 8, water: 6, medicine: 3, ammo: 10 },
          failureEffects: { morale: -5 },
        },
        {
          text: 'Leave it — could be booby-trapped',
          resultText: 'Military bunkers in zombie territory? That\'s how horror movies start. You mark the location on your map just in case, and keep moving.',
          setFlags: { knows_bunker_location: true },
        },
      ],
    }],
  },

  {
    id: 'evt_dog',
    type: 'special',
    region: null,
    season: null,
    turnRange: [5, 35],
    baseWeight: 6,
    onceOnly: true,
    title: 'Man\'s Best Friend',
    segments: [{
      narration: 'A bark. A real, honest-to-God bark. A German Shepherd emerges from an alley, tail wagging cautiously. It\'s thin, scarred, but alive. It walks up to you and sits, looking up with brown eyes that say everything: "I\'ve been waiting for someone."',
      choices: [
        {
          text: 'Good boy. You\'re coming with us.',
          effects: { food: -1, morale: 15 },
          resultText: 'You name him Rex. He stays close to Cassidy, who buries her face in his fur and cries for the first time in weeks. Rex will bark at approaching threats, boosting your perception. He\'s family now.',
          setFlags: { has_dog: true },
        },
        {
          text: 'Share some food and move on',
          effects: { food: -1, morale: 3 },
          resultText: 'You can\'t feed another mouth. But you can spare a can. The dog eats gratefully, then watches you walk away. When you look back a mile later, it\'s still sitting there.',
        },
        {
          text: 'We can\'t afford the food — keep walking',
          effects: { morale: -8 },
          resultText: 'The dog follows you for a quarter mile, then stops. Sits in the road. Watches you go. No one in the group talks for the next hour.',
        },
      ],
    }],
  },
];
