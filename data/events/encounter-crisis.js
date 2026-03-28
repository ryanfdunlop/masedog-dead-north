// ============================================================
// MASEDOG: Dead North — Crisis Events
// Storms, obstacles, betrayals, hard choices
// ============================================================

export const CRISIS_EVENTS = [
  {
    id: 'evt_river_crossing',
    type: 'crisis',
    region: ['bc_interior', 'manitoba', 'ontario_north'],
    season: ['spring', 'summer'],
    turnRange: [3, 45],
    baseWeight: 12,
    title: 'Swollen River',
    segments: [{
      narration: 'The bridge is out. Collapsed into the river below. The water is fast and high — spring melt has turned this river into a killer. You need to get across.',
      choices: [
        {
          text: 'Build a raft from debris',
          skillCheck: { skill: 'mechanics', dc: 12 },
          successText: 'It\'s ugly, but it floats. You paddle hard against the current and make it across, soaked but alive.',
          failureText: 'The raft breaks apart midstream. You make it, but you lose supplies to the water.',
          effects: { travel: 5 },
          failureEffects: { food: -3, water: -2, health: -10 },
        },
        {
          text: 'Look for a shallow crossing upstream',
          skillCheck: { skill: 'survival', dc: 10 },
          successText: 'Half a mile upstream, you find a section where the river fans wide and shallow. You wade across waist-deep.',
          failureText: 'You search for hours and find nothing. The detour costs a full day.',
          effects: { travel: -5 },
        },
        {
          text: 'Swim for it',
          skillCheck: { skill: 'athletics', dc: 14 },
          successText: 'The cold hits like a fist, but you power through. Everyone makes it across, gasping on the far bank.',
          failureText: 'The current is too strong. You barely make it. Someone didn\'t.',
          failureEffects: { health: -20 },
        },
      ],
    }],
  },

  {
    id: 'evt_blizzard_shelter',
    type: 'crisis',
    region: ['alberta', 'saskatchewan', 'manitoba', 'ontario_north'],
    season: ['winter'],
    turnRange: [14, 30],
    baseWeight: 20,
    winterBoost: true,
    title: 'Whiteout',
    segments: [{
      narration: 'It hits fast. One minute you can see the road. The next, everything is white. Wind screams past at 80 km/h. Temperature dropping. This blizzard will kill you before any zombie does.',
      choices: [
        {
          text: 'Find shelter NOW — nearest building',
          skillCheck: { skill: 'perception', dc: 10 },
          successText: 'Through the whiteout, you spot a farmhouse. The door is frozen shut, but you break through. Inside is cold but out of the wind. You\'ll survive.',
          failureText: 'You stumble through the snow for what feels like hours. When you finally find shelter — a barn — everyone is half-frozen.',
          successEffects: { morale: 5 },
          failureEffects: { health: -20, morale: -10 },
          setFlags: { has_shelter: true },
        },
        {
          text: 'Dig a snow shelter — survival training',
          skillCheck: { skill: 'survival', dc: 13 },
          successText: 'You dig into a snowbank and create a small shelter. It\'s cramped and cold, but the wind can\'t reach you. You ride it out.',
          failureText: 'The snow shelter collapses. You\'re buried. By the time you dig out, frostbite has set in.',
          successEffects: { morale: 3 },
          failureEffects: { health: -25, morale: -8 },
        },
        {
          text: 'Burn fuel to keep warm in the open',
          effects: { fuel: -3 },
          resultText: 'You huddle around the fire, burning through fuel at a terrifying rate. But everyone stays warm enough to survive. The blizzard passes by morning.',
        },
      ],
    }],
  },

  {
    id: 'evt_vehicle_breakdown',
    type: 'crisis',
    region: null,
    season: null,
    turnRange: [3, 52],
    baseWeight: 10,
    requirements: { flags: { has_vehicle: true } },
    title: 'Engine Failure',
    segments: [{
      narration: 'A grinding sound. A cloud of smoke from under the hood. The vehicle shudders and dies in the middle of the highway. In the rearview mirror, shapes are moving.',
      choices: [
        {
          text: 'Try to fix it — fast',
          skillCheck: { skill: 'mechanics', dc: 12 },
          successText: 'Belt snapped. You jerry-rig a replacement from a strip of rubber. The engine coughs back to life. Move. NOW.',
          failureText: 'It\'s beyond your skill. The engine is dead. You\'ll be walking from here.',
          failureEffects: { morale: -10 },
          setFlags: { has_vehicle: false },
        },
        {
          text: 'Grab everything from the vehicle and run',
          effects: { morale: -8 },
          resultText: 'You strip what you can — food, water, the med kit, ammo. Everything else stays. The vehicle that saved you so many miles is now just another roadside grave marker.',
          setFlags: { has_vehicle: false },
        },
        {
          text: 'Use the vehicle as a barricade while you assess',
          effects: { ammo: -3 },
          resultText: 'You position the vehicle to block the road and take up defensive positions. The approaching shapes are just Shamblers — slow enough to deal with while you salvage parts.',
          setFlags: { has_vehicle: false },
        },
      ],
    }],
  },

  {
    id: 'evt_food_poisoning',
    type: 'crisis',
    region: null,
    season: null,
    turnRange: [4, 52],
    baseWeight: 10,
    title: 'Bad Supplies',
    segments: [{
      narration: 'Something was wrong with that last batch of food. You can tell by the vomiting that starts at 3 AM. Half the group is doubled over, pale and shaking.',
      choices: [
        {
          text: 'Use medicine to treat the sickness',
          effects: { medicine: -2 },
          resultText: 'The meds help settle stomachs. By morning, everyone can walk again. A miserable night, but survivable.',
        },
        {
          text: 'Ride it out — save the medicine',
          effects: { health: -10, morale: -8 },
          resultText: 'A brutal 24 hours. Dehydration makes it worse. When it finally passes, everyone is weaker. Much weaker.',
        },
        {
          text: 'Throw out all questionable food and start fresh',
          effects: { food: -5, morale: -3 },
          resultText: 'You dump anything that looks or smells suspicious. It hurts to waste food, but it would hurt more to lose someone to botulism.',
        },
      ],
    }],
  },

  {
    id: 'evt_betrayal',
    type: 'crisis',
    region: null,
    season: null,
    turnRange: [15, 45],
    baseWeight: 6,
    requirements: { minPartySize: 3 },
    onceOnly: true,
    title: 'In the Night',
    segments: [{
      narration: 'You wake to find supplies missing. Food. Water. Ammo. And one of your party members is gone. They left a note: "Sorry. I have people to get back to. You\'ll be fine. — " The name hits you like a punch.',
      choices: [
        {
          text: 'Track them down',
          skillCheck: { skill: 'survival', dc: 14 },
          successText: 'You find them a mile out, struggling with the weight of your supplies. They break down crying. "I have a daughter. She\'s out there somewhere." You take the supplies back. Whether you forgive them is another matter.',
          failureText: 'The trail goes cold. They\'re gone. And so are your supplies.',
          failureEffects: { food: -4, water: -3, ammo: -4, morale: -15 },
        },
        {
          text: 'Let them go — everyone has their reasons',
          effects: { food: -4, water: -3, ammo: -4, morale: -10 },
          resultText: 'You stare at the note for a long time. Then you fold it and put it in your pocket. Not everyone can carry the weight.',
        },
        {
          text: 'Redistribute what\'s left and keep moving',
          effects: { food: -4, water: -3, ammo: -4, morale: -5 },
          resultText: 'No time for anger. You split what remains among the group and put one foot in front of the other. That\'s all you can do.',
        },
      ],
    }],
  },
];
