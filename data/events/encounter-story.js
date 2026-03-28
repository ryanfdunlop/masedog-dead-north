// ============================================================
// MASEDOG: Dead North — Story Events
// Major narrative beats tied to the journey
// ============================================================

export const STORY_EVENTS = [
  {
    id: 'evt_radio_signal',
    type: 'story',
    region: ['bc_interior', 'alberta'],
    season: null,
    turnRange: [4, 12],
    baseWeight: 25,
    onceOnly: true,
    title: 'The Signal',
    segments: [{
      narration: 'Static. Then a voice breaks through on an old car radio: "...this is the Canadian Armed Forces Emergency Broadcast. If you are hearing this, proceed to Ottawa. Repeat, proceed to Ottawa. The National Microbiology Lab is operational. We have... we believe we have a path to a cure. All survivors head east. Avoid major highways. God help us all." The signal cuts to static.',
      choices: [
        {
          text: 'This is it. This is why we keep going.',
          effects: { morale: 15 },
          resultText: 'Ottawa. A cure. For the first time since the hospital, you feel something you\'d almost forgotten. Hope.',
          setFlags: { heard_ottawa_broadcast: true },
        },
        {
          text: 'Could be a trap. AI could be using the signal.',
          effects: { morale: 3 },
          resultText: 'It could be real. It could be the AI luring survivors into a kill zone. But what other choice do you have? Where else would you go?',
          setFlags: { heard_ottawa_broadcast: true, suspects_trap: true },
        },
      ],
    }],
  },

  {
    id: 'evt_first_stalker',
    type: 'story',
    region: ['saskatchewan', 'manitoba'],
    season: null,
    turnRange: [18, 25],
    baseWeight: 30,
    onceOnly: true,
    title: 'Something New',
    segments: [{
      narration: 'You\'ve been hearing it for three days. Footsteps that stop when yours stop. A shadow that\'s always just around the corner. Tonight, you set a trap — a simple tripwire with cans. At 2 AM, the cans rattle. You shine your flashlight and see it. A zombie. But... different. It\'s LOOKING at the tripwire. It UNDERSTOOD what it was. It looks up at you with eyes that aren\'t empty. They\'re calculating.',
      choices: [
        {
          text: 'Attack it before it can react',
          skillCheck: { skill: 'combat', dc: 14 },
          successText: 'You don\'t give it time to think. Whatever it was becoming, it\'s done now. But the way it LOOKED at you... the virus is evolving.',
          failureText: 'It dodges. It DODGES. No shambler has ever done that. The fight is harder than anything you\'ve faced.',
          combat: { zombieType: 'stalker', count: 1, difficulty: 'hard', canFlee: true },
          setFlags: { encountered_stalker: true },
        },
        {
          text: 'Try to communicate with it',
          effects: { morale: -5 },
          resultText: 'You speak. It tilts its head. For one horrible moment, its mouth moves like it\'s trying to form words. Then it lunges. Whatever was human in there is buried under something else now.',
          combat: { zombieType: 'stalker', count: 1, difficulty: 'normal', canFlee: true },
          setFlags: { encountered_stalker: true, tried_communication: true },
        },
        {
          text: 'Run. Now.',
          skillCheck: { skill: 'athletics', dc: 10 },
          successText: 'You don\'t look back. You run until your lungs burn. It doesn\'t follow. That\'s somehow worse.',
          failureText: 'It cuts you off. It knew where you were going. It PREDICTED your route.',
          effects: { morale: -8 },
          setFlags: { encountered_stalker: true },
        },
      ],
    }],
  },

  {
    id: 'evt_survivor_settlement',
    type: 'story',
    region: ['manitoba'],
    season: null,
    turnRange: [20, 28],
    baseWeight: 25,
    onceOnly: true,
    title: 'Haven',
    segments: [{
      narration: 'Walls. Actual walls. Made from shipping containers and scrap metal. Guard towers. People — living, breathing, uninfected people. A sign at the gate reads: "HAVEN - Population 47. State your business." A guard levels a rifle at you. Behind the walls, you can hear children laughing.',
      choices: [
        {
          text: '"We\'re heading to Ottawa. Just need to rest."',
          skillCheck: { skill: 'charisma', dc: 10 },
          successText: 'The gates open. Inside is miraculous — gardens, a working generator, even a school. The leader, a former RCMP officer named Lavoie, offers you beds, food, and information.',
          failureText: '"Ottawa? You\'re crazy. Gate stays shut for crazies." You argue, but they won\'t budge.',
          successEffects: { food: 8, water: 6, health: 15, morale: 20 },
          failureEffects: { morale: -10 },
          setFlags: { visited_haven: true },
        },
        {
          text: '"We have medical supplies to trade."',
          effects: { medicine: -2, food: 6, water: 5, ammo: 4, morale: 10 },
          resultText: 'Medicine is like gold. The gates open immediately. They offer food, ammo, and something priceless: information about the road ahead.',
          setFlags: { visited_haven: true, traded_with_haven: true },
        },
        {
          text: 'Move on — settlements attract hordes',
          effects: { morale: -5 },
          resultText: 'You\'ve seen what happens to settlements. The walls look strong now, but they never hold forever. Better to keep moving.',
        },
      ],
    }],
  },

  {
    id: 'evt_cure_revelation',
    type: 'story',
    region: null,
    season: null,
    turnRange: [35, 42],
    baseWeight: 50,
    onceOnly: true,
    title: 'The Truth in the Blood',
    segments: [{
      narration: 'It happens during a zombie attack. Someone gets bitten. You\'ve seen this before — the fever, the veins turning black, the slow descent. But this time, something different happens. The wound heals. In HOURS. The veins return to normal. The fever breaks. One of your people is IMMUNE.',
      choices: [
        {
          text: 'This changes everything. We HAVE to get to Ottawa.',
          effects: { morale: 20 },
          resultText: 'A cure. Walking right beside you this whole time. The scientists in Ottawa can synthesize an antivirus from their blood. Suddenly the journey isn\'t about survival anymore. It\'s about saving the world.',
          setFlags: { cure_revealed: true },
        },
        {
          text: 'Keep this quiet. If anyone finds out, they\'ll be a target.',
          effects: { morale: 10 },
          resultText: 'You pull the immune member aside. "Don\'t tell anyone. Not yet." Their eyes are wide with fear and wonder. "What am I?" they whisper. "You\'re the answer," you say. "And we need to keep you alive."',
          setFlags: { cure_revealed: true, cure_secret: true },
        },
      ],
    }],
  },

  {
    id: 'evt_hive_mind',
    type: 'story',
    region: ['ontario_north', 'ontario_south'],
    season: null,
    turnRange: [30, 45],
    baseWeight: 25,
    onceOnly: true,
    title: 'The Hive',
    segments: [{
      narration: 'You see it from the hilltop and your blood runs cold. Below, in a valley, hundreds of zombies stand perfectly still in concentric circles. At the center, a figure glows — bioluminescent tendrils pulsing from its body into the ground. The zombies aren\'t shuffling. They\'re not groaning. They\'re WAITING. In formation. Like an army. This is what the AI has been building toward.',
      choices: [
        {
          text: 'We go around. Far around.',
          effects: { travel: -25, morale: -10 },
          resultText: 'It adds days to your journey, but there is no fighting that. That isn\'t a horde. That\'s a weapon. The AI didn\'t just release a virus — it built a military.',
          setFlags: { saw_hive: true },
        },
        {
          text: 'Study it from a distance — knowledge is power',
          skillCheck: { skill: 'perception', dc: 12 },
          successText: 'Through binoculars, you map their formation, notice the glowing node, and realize: kill the node, and they might scatter. It\'s a weak point. File that away.',
          failureText: 'One of the outer ring zombies turns and looks directly at you. At this distance. It shouldn\'t be possible. You run.',
          successEffects: { morale: 5 },
          failureEffects: { morale: -15, health: -5 },
          setFlags: { saw_hive: true, studied_hive: true },
        },
        {
          text: 'Try to destroy the node — end this',
          skillCheck: { skill: 'combat', dc: 18 },
          successText: 'A nearly suicidal gambit. But you manage to get close enough with a fuel bomb. The node erupts. Every zombie in the valley collapses. Just... drops. It\'s temporary — they start stirring again within minutes — but now you know they CAN be stopped.',
          failureText: 'They detect you instantly. The entire formation turns as one. You barely escape with your life.',
          successEffects: { morale: 15 },
          failureEffects: { health: -30, morale: -15 },
          setFlags: { saw_hive: true, destroyed_hive_node: true },
        },
      ],
    }],
  },
];
