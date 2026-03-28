// ============================================================
// MASEDOG: Dead North — Social / NPC Encounter Events
// ============================================================

export const SOCIAL_EVENTS = [
  {
    id: 'evt_survivor_family',
    type: 'social',
    region: null,
    season: null,
    turnRange: [3, 40],
    baseWeight: 12,
    title: 'A Family on the Road',
    segments: [{
      narration: 'Ahead on the road — a man, a woman, and two small children. They see you and freeze. The man pushes the children behind him. The woman raises a tire iron. They\'re terrified. Of you.',
      choices: [
        {
          text: 'Hands up — "We\'re friendly. Just passing through."',
          skillCheck: { skill: 'charisma', dc: 10 },
          successText: 'The man\'s grip relaxes. "Thank God. We thought... never mind. We haven\'t seen friendly faces in weeks." They share information about the road ahead and give you some food in gratitude.',
          failureText: '"Stay back! I said STAY BACK!" They back away. You let them go. Not everyone can trust anymore.',
          successEffects: { food: 3, morale: 8 },
          failureEffects: { morale: -3 },
          setFlags: { helped_family_road: true },
        },
        {
          text: 'Offer them food and water',
          effects: { food: -3, water: -2, morale: 10 },
          resultText: 'The children\'s eyes light up. The mother starts crying. "You didn\'t have to do that," the father says. "Most people don\'t anymore." They tell you about a safe route through the next valley.',
          setFlags: { shared_with_family: true },
        },
        {
          text: 'Avoid them — can\'t trust anyone',
          effects: { morale: -2 },
          resultText: 'You circle wide around them. The children watch you go. The youngest waves. You pretend you don\'t see.',
        },
        {
          text: 'Rob them — survival of the fittest',
          effects: { food: 4, water: 3, morale: -15 },
          resultText: 'They don\'t fight. The man just stares at you with empty eyes as you take what they have. The children cry. You got what you needed. Was it worth it?',
          setFlags: { robbed_family: true },
        },
      ],
    }],
  },

  {
    id: 'evt_lone_doctor',
    type: 'social',
    region: null,
    season: null,
    turnRange: [5, 45],
    baseWeight: 8,
    requirements: { flags: {} },
    title: 'The Traveling Doctor',
    segments: [{
      narration: 'A woman steps out from behind a barricade, hands raised. She\'s wearing bloodstained scrubs. "I\'m a doctor. Well, I was. I can help if anyone\'s hurt. I just... I need to not be alone anymore."',
      choices: [
        {
          text: 'Welcome her to the group',
          effects: { morale: 8 },
          resultText: 'Dr. Sarah Chen. Trauma surgeon from Vancouver General. She lost everyone. Her hands shake when she talks about it. But they\'re steady as a rock when she treats wounds.',
          addPartyMember: {
            id: 'dr_chen',
            name: 'Dr. Chen',
            age: 34,
            skills: { combat: 2, athletics: 3, perception: 5, medical: 8, mechanics: 1, charisma: 5, stealth: 3, survival: 2 },
            traits: ['calm', 'empathetic'],
          },
        },
        {
          text: 'Ask her to treat your wounded, then part ways',
          effects: { health: 15, morale: 3 },
          resultText: 'She patches everyone up with practiced efficiency. When she leaves, she heads east. Same direction as you. You watch her walk alone into the wilderness.',
        },
        {
          text: '"Sorry. We can\'t take anyone else."',
          effects: { morale: -5 },
          resultText: 'She nods slowly. "I understand." She doesn\'t. Nobody does. You watch her walk away and wonder if you just condemned her.',
        },
      ],
    }],
  },

  {
    id: 'evt_bandits',
    type: 'social',
    region: null,
    season: null,
    turnRange: [6, 52],
    baseWeight: 14,
    title: 'Roadblock',
    segments: [{
      narration: 'Three figures step onto the road ahead. They\'re armed. One of them calls out: "Toll road, friend. Leave your food and water and you can pass. Or don\'t, and see what happens."',
      choices: [
        {
          text: 'Pay the toll — not worth fighting',
          effects: { food: -4, water: -3, morale: -8 },
          resultText: 'You hand over the supplies. The leader grins. "Smart choice. Now move along." You walk past, burning with anger.',
        },
        {
          text: 'Negotiate — "We don\'t have much, but we can share."',
          skillCheck: { skill: 'charisma', dc: 14 },
          successText: '"Fine. Half." They take some food and let you pass. One of them whispers as you go by: "Head north past the bridge. Fewer of them that way."',
          failureText: '"I said ALL of it." They close in. This is going sideways.',
          successEffects: { food: -2, water: -1 },
          failureCombat: { zombieType: 'runner', count: 0, humanCombat: true, difficulty: 'hard', canFlee: true },
        },
        {
          text: 'Fight them',
          combat: { zombieType: 'runner', count: 0, humanCombat: true, difficulty: 'hard', canFlee: true },
          successText: 'The bandits scatter. You search their camp and find supplies they\'ve stolen from others.',
          successEffects: { food: 6, water: 4, ammo: 5, morale: -3 },
          setFlags: { killed_bandits: true },
        },
        {
          text: 'Create a distraction and slip away',
          skillCheck: { skill: 'stealth', dc: 12 },
          successText: 'You throw a rock into the bushes. They spin around. By the time they look back, you\'re gone.',
          failureText: 'They see right through it. "Nice try." They advance, weapons raised.',
          failureCombat: { zombieType: 'runner', count: 0, humanCombat: true, difficulty: 'hard', canFlee: true },
        },
      ],
    }],
  },

  {
    id: 'evt_kid_alone',
    type: 'social',
    region: null,
    season: null,
    turnRange: [4, 40],
    baseWeight: 10,
    onceOnly: true,
    title: 'The Boy in the Tree',
    segments: [{
      narration: 'A child\'s voice from above: "Hey! Up here!" A boy, maybe 10, is perched in a tree. His face is streaked with tears and dirt. "They got my mom. I\'ve been up here for two days. Please. I don\'t want to die up here."',
      choices: [
        {
          text: 'Help him down and take him with you',
          effects: { morale: 10, food: -1 },
          resultText: 'His name is Marcus. He clings to your arm and won\'t let go. He\'s scared, hungry, and alone. But he\'s alive. And now he\'s your responsibility.',
          addPartyMember: {
            id: 'marcus',
            name: 'Marcus',
            age: 10,
            skills: { combat: 1, athletics: 4, perception: 5, medical: 0, mechanics: 2, charisma: 3, stealth: 8, survival: 3 },
            traits: ['cautious', 'quick_learner'],
          },
        },
        {
          text: 'Give him food and directions, but move on',
          effects: { food: -2, morale: -5 },
          resultText: 'You hand up a can of food and point east. "Follow the highway. Stay in the trees." He nods. You walk away. You don\'t look back because you know what you\'d see.',
        },
        {
          text: 'You can\'t help him — keep moving',
          effects: { morale: -12 },
          resultText: '"No! PLEASE! Don\'t leave me!" His screams follow you down the road. They\'ll follow you for a lot longer than that.',
        },
      ],
    }],
  },

  {
    id: 'evt_trader',
    type: 'social',
    region: ['alberta', 'manitoba', 'ontario_south'],
    season: null,
    turnRange: [8, 48],
    baseWeight: 10,
    title: 'The Trader',
    segments: [{
      narration: 'A fortified van. A man sits on the roof with a rifle across his lap. "I\'m a trader, not a fighter," he calls down. "But I\'ll shoot if I have to. If you want to trade, come forward slowly."',
      choices: [
        {
          text: 'Trade food for medicine',
          effects: { food: -4, medicine: 3 },
          resultText: '"Fair deal," he says. "Medicine\'s worth its weight in gold these days. Be careful out there."',
        },
        {
          text: 'Trade scrap for ammo',
          effects: { scrap: -5, ammo: 8 },
          resultText: '"Scrap I can work with. Here — .22 rounds. Not much stopping power, but better than harsh language."',
        },
        {
          text: 'Ask for information instead',
          effects: { morale: 5 },
          resultText: 'He tells you about a survivor settlement up ahead, a blocked highway to avoid, and rumors of a working lab in Ottawa. "Heard it on the radio. Government types. Still broadcasting."',
          setFlags: { trader_ottawa_info: true },
        },
        {
          text: 'Move on — you don\'t trust traders',
          resultText: '"Suit yourself." He watches you go. You wonder if you missed an opportunity or dodged a bullet.',
        },
      ],
    }],
  },
];
