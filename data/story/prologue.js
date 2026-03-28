// ============================================================
// MASEDOG: Dead North — Prologue: The Hospital
// Multiple variants of the opening sequence
// ============================================================

export const PROLOGUE = {
  id: 'prologue',
  title: 'MASEDOG: Dead North',

  // Opening narration — sets the scene
  intro: {
    narration: [
      'June 1st, 2031.',
      '',
      'You\'re sitting in a hospital chair that was designed by someone who hates comfort. Room 412 of Vancouver General. Your sister Violet is asleep in the bed, tubes running from her arm to a bag of something clear. She\'s been sick for two weeks. Doctors don\'t know what it is.',
      '',
      'Across the room, a girl — 13, maybe — sits by the window, earbuds in, staring at her phone. Her name tag says CASSIDY. She\'s been in that bed by the window for three days. You\'ve never spoken, but you\'ve shared the kind of nod that strangers share in hospitals. The "yeah, this sucks" nod.',
      '',
      'The TV in the corner is on CNN. Something about AI systems. A new emergency declaration. You\'re not really listening.',
      '',
      'Then Violet\'s monitors start beeping. Then EVERYONE\'s monitors start beeping. Down the hall, someone screams. Not a pain scream. A terror scream.',
      '',
      'The TV cuts to an emergency broadcast. Red banner. White text: "SHELTER IN PLACE. THIS IS NOT A DRILL."',
      '',
      'The screaming gets closer.',
    ],
  },

  // Phase 1: The first choice
  phase1: {
    narration: [
      'The door to Room 412 bursts open. A nurse stumbles in — her scrubs are torn, her arm is bleeding. She slams the door behind her and locks it. She\'s hyperventilating.',
      '',
      '"They\'re... they\'re biting people. The patients in the ER — they just started ATTACKING. I saw Dr. Morrison get — " She can\'t finish.',
      '',
      'Violet wakes up. "What\'s happening?"',
      '',
      'Cassidy pulls out her earbuds. Her eyes are wide.',
      '',
      'Through the door, you hear running footsteps. Screaming. A crash. Something hits the door. Then silence.',
      '',
      'Then scratching. Slow, deliberate scratching at the door.',
    ],
    choices: [
      {
        id: 'barricade',
        text: 'Barricade the door with the heavy medical equipment',
        skillCheck: { skill: 'athletics', dc: 8 },
        successText: 'You shove the crash cart against the door. The medical cabinet goes next. Whatever\'s out there pushes, but the barricade holds.',
        failureText: 'You manage to get the crash cart against the door, but the cabinet tips and crashes. The noise from the hall intensifies.',
        effects: { morale: 3 },
        failureEffects: { morale: -3 },
        setFlags: { barricaded_door: true },
        next: 'phase2',
      },
      {
        id: 'check_hall',
        text: 'Peek through the door to see what\'s happening',
        skillCheck: { skill: 'perception', dc: 10 },
        successText: 'You crack the door an inch. The hallway is chaos — overturned gurneys, blood on the walls. And people. People who aren\'t people anymore. Shuffling, groaning, covered in blood. One of them turns toward you. You shut the door.',
        failureText: 'You open the door just as a patient — a man with a hospital gown and dead eyes — lunges at you. You slam it shut but not before he scratches your arm.',
        effects: {},
        failureEffects: { health: -10 },
        setFlags: { saw_hallway: true },
        next: 'phase2',
      },
      {
        id: 'comfort_violet',
        text: 'Go to Violet — make sure she\'s okay',
        effects: { morale: 5 },
        resultText: 'You grab Violet\'s hand. "I\'m here. I\'m not going anywhere." She\'s scared, but she squeezes back. Cassidy watches you from across the room, something like hope in her eyes.',
        setFlags: { comforted_violet: true },
        next: 'phase2',
      },
    ],
  },

  // Phase 2: The nurse
  phase2: {
    narration: [
      'The nurse — her name tag says KAREN — is sitting against the wall, holding her bleeding arm. She\'s pale. Too pale.',
      '',
      '"I\'m a nurse," she says, voice shaking. "I know what a bite wound looks like. And I know... I know what happens after." She looks at her arm. At the veins around the wound, already darkening.',
      '',
      '"You need to leave. All of you. Dr. Reyes — he\'s in the supply room on this floor. West wing. He was gathering emergency supplies when it started. He\'s smart. He\'ll know what to do."',
      '',
      'She coughs. Blood.',
      '',
      '"Go. Please. Before I... before I can\'t tell you to go anymore."',
    ],
    choices: [
      {
        id: 'help_nurse',
        text: 'Try to help the nurse — look for medicine in the room',
        skillCheck: { skill: 'medical', dc: 12 },
        successText: 'You find bandages and antiseptic in the room\'s medical cabinet. You clean her wound. It won\'t save her — you both know that — but she smiles. "Thank you for trying." She tells you the code to the supply room: 4-7-2-1.',
        failureText: 'There\'s nothing useful in the room. Band-aids aren\'t going to fix a zombie bite. She sees the look on your face. "It\'s okay. Just go."',
        successEffects: { medicine: 1, morale: 3 },
        setFlags: { helped_nurse: true, knows_supply_code: true },
        next: 'phase3',
      },
      {
        id: 'ask_info',
        text: 'Ask her what she knows — where are the exits?',
        effects: { morale: 2 },
        resultText: '"West stairwell is closest. Avoid the elevators — the power\'s flickering. Ground floor is... it\'s bad down there. ER is where it started." She draws a shaky map on a napkin. "The parking garage... level P2... there are ambulances. Keys are in the ignition."',
        setFlags: { has_exit_info: true },
        next: 'phase3',
      },
      {
        id: 'leave_now',
        text: 'She\'s right. We need to go NOW.',
        effects: { morale: -5 },
        resultText: 'Violet stares at you. "We can\'t just leave her!" You can. You have to. The scratching at the door is getting louder. There\'s more than one of them now.',
        setFlags: { left_nurse: true },
        next: 'phase3',
      },
    ],
  },

  // Phase 3: Who comes with you?
  phase3: {
    narration: [
      'It\'s time to move. Violet is weak but can walk with support. Cassidy is already on her feet, backpack on — she was ready before you were.',
      '',
      '"Where are we going?" Cassidy asks. Her voice is steady. Steadier than it should be for a 13-year-old in a zombie apocalypse.',
      '',
      'The scratching at the door turns to pounding. The barricade won\'t hold forever.',
      '',
      'You have seconds to decide.',
    ],
    choices: [
      {
        id: 'take_everyone',
        text: 'Everyone comes. Violet, Cassidy — we stick together.',
        effects: { morale: 10 },
        resultText: 'Violet leans on your shoulder. Cassidy takes Violet\'s other arm without being asked. Three people who were strangers an hour ago, now bound by something stronger than blood. You move toward the door.',
        setFlags: { took_violet: true, took_cassidy: true },
        next: 'phase4',
      },
      {
        id: 'take_violet_only',
        text: 'Violet, you\'re coming with me. Cassidy — the nurse will look after you.',
        effects: { morale: -8 },
        resultText: 'Cassidy\'s face crumbles. "No. No, PLEASE. She\'s turning. Look at her!" She points at the nurse, whose eyes are glazing. She\'s right. The nurse won\'t be protecting anyone soon.',
        setFlags: { took_violet: true, abandoned_cassidy_attempt: true },
        // Forces a follow-up choice
        next: 'phase3b',
      },
      {
        id: 'find_doctor_first',
        text: 'We find Dr. Reyes first. We need medical help for Violet.',
        effects: { morale: 5 },
        resultText: '"Smart," Cassidy says. She pulls a fire extinguisher off the wall. "Just in case." This kid might be tougher than she looks.',
        setFlags: { took_violet: true, took_cassidy: true, priority_doctor: true },
        next: 'phase4',
      },
    ],
  },

  // Phase 3b: Cassidy follow-up (if player tried to leave her)
  phase3b: {
    narration: [
      'Cassidy grabs your sleeve. Her eyes are fierce. "I\'m coming. I don\'t care what you say. My parents are in Toronto. I\'m heading east whether you take me or not. At least together we have a chance."',
      '',
      'Behind her, the nurse makes a sound that isn\'t human anymore.',
    ],
    choices: [
      {
        id: 'accept_cassidy',
        text: '"...Fine. Stay close."',
        effects: { morale: 5 },
        resultText: 'She nods sharply. No tears. This girl has steel in her. You make a mental note not to underestimate her.',
        setFlags: { took_cassidy: true },
        next: 'phase4',
      },
      {
        id: 'refuse_cassidy',
        text: '"I can\'t be responsible for you. I\'m sorry."',
        effects: { morale: -15 },
        resultText: 'You pull away. Violet whispers: "Don\'t do this." Cassidy doesn\'t cry. She just stares at you with a look that says she\'ll remember this forever. Then she picks up the fire extinguisher and heads for the other door. Alone.',
        setFlags: { cassidy_alone: true },
        // Cassidy is NOT added to party — but she may reappear later as a story event
        next: 'phase4',
      },
    ],
  },

  // Phase 4: The escape
  phase4: {
    narration: [
      'The hallway is a warzone. Overturned beds. Emergency lights painting everything in stuttering red. The fire alarm blares and stops, blares and stops.',
      '',
      'To the left: the west stairwell. Faster, but you can hear THEM in there.',
      'To the right: the supply room where Dr. Reyes might be. Further, but potential help and supplies.',
      'Ahead: the service elevator. The light says it\'s on this floor. Risky.',
    ],
    choices: [
      {
        id: 'stairwell',
        text: 'West stairwell — speed is survival',
        skillCheck: { skill: 'stealth', dc: 11 },
        successText: 'You move quietly. Three Shamblers block the stairs. You edge past them, holding your breath. They don\'t notice. Four flights down. The exit. Daylight.',
        failureText: 'You round the corner and come face-to-face with a Runner on the stairs. It shrieks. You fight past and stumble down the stairs, bruised and bleeding, but alive.',
        failureEffects: { health: -15 },
        setFlags: { escaped_stairs: true },
        next: 'phase5',
      },
      {
        id: 'supply_room',
        text: 'Find Dr. Reyes in the supply room',
        successText: 'You find Dr. Reyes barricaded in the supply room with two duffel bags of medical supplies. He\'s calm, organized, and has already mapped three exit routes. "Let\'s go. Stay behind me."',
        resultText: 'You find Dr. Reyes barricaded in the supply room with two duffel bags of medical supplies. He\'s calm, organized, and has already mapped three exit routes. "Let\'s go. Stay behind me."',
        effects: { medicine: 3, food: 2, morale: 10 },
        setFlags: { found_doctor: true, has_doctor: true },
        next: 'phase5',
      },
      {
        id: 'elevator',
        text: 'Take the service elevator',
        skillCheck: { skill: 'mechanics', dc: 13 },
        successText: 'The elevator groans but descends. You ride it to the parking level. When the doors open: silence. Cars. An ambulance. Freedom.',
        failureText: 'The elevator shudders to a stop between floors. The lights go out. In the darkness, you hear breathing that isn\'t yours. You pry the doors open and drop to the floor below.',
        successEffects: { travel: 5, morale: 5 },
        failureEffects: { health: -10, morale: -10 },
        next: 'phase5',
      },
    ],
  },

  // Phase 5: Outside — the world has changed
  phase5: {
    narration: [
      'Outside. The air smells like smoke.',
      '',
      'Vancouver is burning. Sirens wail in the distance. Cars are abandoned in the middle of the road, doors open, engines still running. A helicopter crosses the sky trailing black smoke.',
      '',
      'The hospital behind you is lost. You can see them in the windows — patients, doctors, visitors — pressing against the glass. Not alive. Not dead. Something else.',
      '',
      'Your phone buzzes. One text gets through before the network dies:',
      '',
      '"Emergency Alert: AI systems have initiated biological attack. Unknown pathogen. Extreme aggression in infected. Seek shelter. Avoid contact. Government response inbound."',
      '',
      'No government is coming.',
      '',
      'You look east. Somewhere out there — 4,400 kilometers away — is Ottawa. And maybe, just maybe, a cure.',
      '',
      'The journey begins now.',
    ],
    choices: [
      {
        id: 'start_journey_vehicle',
        text: 'Look for a working vehicle in the parking lot',
        skillCheck: { skill: 'mechanics', dc: 10 },
        successText: 'A pickup truck. Keys in the sun visor. Half a tank. It won\'t last forever, but it\'ll get you out of the city.',
        failureText: 'Every car is either locked, dead, or blocked. You\'re walking.',
        setFlags: { has_vehicle: true },
        effects: { travel: 20, fuel: 5 },
        failureEffects: { morale: -3 },
        next: 'end',
      },
      {
        id: 'start_journey_supplies',
        text: 'Raid the hospital gift shop and cafeteria before leaving',
        skillCheck: { skill: 'perception', dc: 8 },
        successText: 'Bottled water, granola bars, a pocket knife from the gift shop, and a first aid kit. You stuff it all in a bag.',
        failureText: 'The cafeteria is overrun. You grab what you can from the gift shop — not much, but something.',
        effects: { food: 3, water: 3 },
        successEffects: { food: 5, water: 4, medicine: 1, scrap: 2 },
        next: 'end',
      },
      {
        id: 'start_journey_move',
        text: 'No time to waste. Head east. NOW.',
        effects: { travel: 25, morale: 5 },
        resultText: 'Every second spent here is a second closer to being surrounded. You take one last look at the hospital where everything changed, and you run.',
        next: 'end',
      },
    ],
  },
};
