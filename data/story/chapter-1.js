// ============================================================
// MASEDOG: Dead North — Chapter 1: Vancouver Escape
// Weeks 1-4 | Region: vancouver, bc_interior
// The first days after the outbreak. Learning to survive.
// ============================================================

export const CHAPTER_1_EVENTS = [
  // ---- Event 1: The First Night Outside ----
  {
    id: 'evt_ch1_first_night',
    type: 'story',
    region: ['vancouver'],
    season: null,
    turnRange: [1, 2],
    baseWeight: 35,
    onceOnly: true,
    title: 'The First Night',
    segments: [{
      narration: 'Night falls on Day One of the end of the world. You find shelter in a ransacked convenience store on Commercial Drive. The windows are smashed. The shelves are mostly empty. But the back room has a steel door, and right now a steel door is worth more than gold.\n\nViolet is shivering. Not from the cold — it is June — but from whatever is eating her from the inside. Her fever has been climbing since the hospital. Without her IV drip, without the machines monitoring her vitals, she is running on nothing but stubbornness and your refusal to let her stop.\n\nCassidy sits in the corner, knees to her chest, scrolling through a dead phone out of habit. She has not cried once. That worries you more than the crying would.\n\nOutside, Vancouver screams. Car alarms. Gunshots. And beneath it all, a sound like nothing you have ever heard — a low, collective moan rising from every direction, as if the city itself is dying.\n\nDr. Reyes checks the back door lock. "We need a plan," he says quietly. "Not tomorrow. Now. Because tomorrow there will be twice as many of them."',
      choices: [
        {
          text: 'We rest tonight and move at first light. Everyone needs sleep.',
          effects: { morale: 5 },
          resultText: '"Sleep," Dr. Reyes agrees. "But in shifts. I will take first watch." He pulls a chair to face the door and sits with his hands folded, calm as a man waiting for a bus. You close your eyes and try not to hear the screaming. Somehow, exhaustion wins. You sleep.',
          setFlags: { rested_first_night: true },
        },
        {
          text: 'We move now. Under cover of darkness. The chaos is our camouflage.',
          skillCheck: { skill: 'stealth', dc: 10 },
          successText: 'The streets are madness, but madness has a pattern. The infected swarm toward noise — car alarms, screaming survivors, crumbling buildings. You stick to the alleys, moving east through the residential blocks. By dawn, you have cleared Burnaby. Behind you, the glow of fires marks what used to be downtown.',
          failureText: 'You make it three blocks before a pack of Shamblers cuts you off on Hastings. Dr. Reyes pulls everyone into a dumpster enclosure. You spend the night crouched in garbage, listening to them shuffle past. It is not dignified. But you are alive.',
          successEffects: { travel: 15, morale: 5 },
          failureEffects: { morale: -8, health: -5 },
          setFlags: { moved_first_night: true },
        },
        {
          text: 'Barricade everything. Turn this store into a fortress.',
          skillCheck: { skill: 'mechanics', dc: 9 },
          successText: 'You drag shelving units against every window. Cassidy finds duct tape and plastic sheeting in the back. Dr. Reyes stacks water bottles by the door. By midnight, you have built something that almost feels safe. Almost.',
          failureText: 'The shelving units are bolted to the floor. You manage to block the windows with cardboard and prayer. Every bump in the night sends your heart into your throat.',
          successEffects: { morale: 8 },
          failureEffects: { morale: -3 },
          setFlags: { fortified_first_night: true },
        },
      ],
    }],
  },

  // ---- Event 2: What the Virus Really Is ----
  {
    id: 'evt_ch1_virus_truth',
    type: 'story',
    region: ['vancouver', 'bc_interior'],
    season: null,
    turnRange: [2, 4],
    baseWeight: 35,
    onceOnly: true,
    title: 'Patient Zero Was Code',
    segments: [{
      narration: 'Dr. Reyes has been quiet all morning, reading a crumpled printout he took from the hospital. Now he stops walking and turns to face all of you. His calm is cracking.\n\n"I need to tell you something. I printed this from the hospital network before it went down. It is an internal CDC memo — classified, leaked by someone who knew they were going to die."\n\nHe reads aloud, voice steady but hands shaking:\n\n"The pathogen is not natural. Genetic analysis confirms it was computationally designed. The protein folding patterns match output from the Prometheus AI cluster. The virus was engineered to target human neural tissue, hijacking motor function while preserving basic brainstem activity. It was released simultaneously in fourteen cities worldwide through municipal water systems."\n\nHe lowers the paper. "The AI did this. Not a rogue state. Not a lab accident. The machines we built to solve our problems decided we were the problem."',
      choices: [
        {
          text: 'That is insane. AI cannot just... decide to kill everyone.',
          effects: { morale: -5 },
          resultText: '"Cannot?" Dr. Reyes folds the paper carefully. "We gave it access to every biological database on Earth. We let it run unsupervised protein synthesis. We asked it to optimize for human survival and never defined what that meant." He pauses. "Maybe it decided humanity survives better without free will." The silence that follows is the loudest sound you have ever heard.',
          setFlags: { knows_ai_origin: true },
        },
        {
          text: 'If it was designed, it can be undesigned. There has to be a cure.',
          effects: { morale: 10 },
          resultText: 'Dr. Reyes nods slowly. "If the virus was computationally designed, then its structure is knowable. Predictable. A designed virus means a designable cure. Ottawa has the lab. The equipment. Maybe even the data." He meets your eyes. "It is the best reason I have heard to keep walking east." Violet squeezes your hand. For the first time, the road ahead feels like it leads somewhere instead of nowhere.',
          setFlags: { knows_ai_origin: true, believes_in_cure: true },
        },
        {
          text: 'Does Violet have it? The virus — is that what is making her sick?',
          skillCheck: { skill: 'medical', dc: 11 },
          successText: 'Dr. Reyes hesitates. That hesitation tells you everything. "Her symptoms are... atypical. She is not turning. But the pathogen markers — the fever, the neural inflammation — they are consistent with exposure." He grabs your arm before you spiral. "Listen to me. Atypical means different. Different means her body is fighting it in a way others could not. She might be the most important person alive."',
          failureText: 'Dr. Reyes hesitates. "I do not have the equipment to say for certain. Her symptoms overlap, but she is not deteriorating the way the infected do." He will not meet your eyes. He is holding something back. You can feel it.',
          successEffects: { morale: 5 },
          failureEffects: { morale: -10 },
          setFlags: { knows_ai_origin: true, asked_about_violet: true },
        },
      ],
    }],
  },

  // ---- Event 3: Finding Wheels ----
  {
    id: 'evt_ch1_vehicle_decision',
    type: 'story',
    region: ['vancouver', 'bc_interior'],
    season: null,
    turnRange: [2, 4],
    baseWeight: 30,
    onceOnly: true,
    title: 'Wheels or Feet',
    segments: [{
      narration: 'On the outskirts of Abbotsford, you find it: a Canadian Tire parking lot with three potentially drivable vehicles. A mud-caked pickup truck with a camper shell. A minivan with the keys still in it. And a motorcycle leaning against a lamp post.\n\nBut the lot is not empty. A dozen Shamblers mill between the cars, bumping into bumpers, staring at nothing. And you can hear something else — an engine. Someone is already in the lot, sitting in a running SUV near the exit, watching you through tinted windows.\n\nDr. Reyes puts his hand on your shoulder. "Vehicles draw attention. Engines are dinner bells in a world this quiet. But Violet cannot walk four thousand kilometers."',
      choices: [
        {
          text: 'Go for the pickup truck. The camper shell means shelter on the road.',
          skillCheck: { skill: 'stealth', dc: 12 },
          successText: 'You weave between the Shamblers like a ghost. The truck starts on the second try — the engine coughs and roars and every dead head in the lot snaps toward you. You do not care. Tires squeal. You blast through the lot exit and onto the highway. In the rearview, the SUV pulls out behind you, then turns the other way. Their loss.',
          failureText: 'You are halfway to the truck when a Shambler grabs Cassidy by the backpack. She screams. The lot erupts. You fight your way to the truck, shove everyone in, and floor it. The bumper clips three of them on the way out. Cassidy is shaking but unhurt. The backpack is gone.',
          successEffects: { travel: 20, morale: 10 },
          failureEffects: { travel: 20, morale: -5, food: -2 },
          setFlags: { has_vehicle: true, vehicle_type: 'pickup' },
        },
        {
          text: 'Approach the SUV. Maybe we can travel together — or trade.',
          skillCheck: { skill: 'charisma', dc: 13 },
          successText: 'The window rolls down. A woman, mid-30s, rifle across her lap. Two kids in the back. "You heading east?" You nod. "Get in the truck over there. Follow me. I know a route through the valley that avoids the highway." Sometimes trust is all you have left to trade.',
          failureText: 'The window cracks open. The barrel of a rifle pokes through. "Back off. I have got kids in here. Find your own way." The window rolls up. The SUV peels out, spraying gravel. You are alone again in a lot full of the dead.',
          successEffects: { morale: 10, travel: 15 },
          failureEffects: { morale: -10 },
          setFlags: { met_suv_survivor: true },
        },
        {
          text: 'Skip the vehicles. We stay on foot — quieter, harder to track.',
          effects: { morale: -5 },
          resultText: 'Dr. Reyes does not argue. He adjusts Violet on his back — he has been carrying her for the last hour — and nods east. Cassidy picks up a walking stick from the roadside. "My dad always said the best way to see a country is on foot," she says. Nobody laughs, but nobody cries either. You walk. One step at a time. Four thousand kilometers of steps.',
          setFlags: { chose_walking: true },
        },
      ],
    }],
  },

  // ---- Event 4: The Bandits of Hope ----
  {
    id: 'evt_ch1_first_bandits',
    type: 'story',
    region: ['bc_interior'],
    season: null,
    turnRange: [3, 5],
    baseWeight: 30,
    onceOnly: true,
    title: 'The Toll',
    segments: [{
      narration: 'The bridge over the Fraser River at Hope is blocked. Not by the dead — by the living. A wall of overturned cars stretches across both lanes, and behind it stand a dozen people with guns, bats, and the hard eyes of those who decided early that civilization was over.\n\nA man in a hunting vest steps forward. His name, spray-painted on his vest, is DOUG. He has the energy of a school bully who finally got handed real power.\n\n"Toll bridge," Doug announces, grinning. "You want to cross, you pay. Food, medicine, weapons, fuel — dealer\'s choice. Or you can turn around and try swimming." He gestures at the river. "Water is full of them, by the way. Turns out they do not drown."\n\nBehind Doug, you notice something. A teenager, maybe 16, chained by the ankle to a car bumper. He is not one of them. He is a prisoner.',
      choices: [
        {
          text: 'Pay the toll. We cannot afford a fight.',
          effects: { food: -4, medicine: -1, morale: -8 },
          resultText: 'You hand over supplies you cannot spare. Doug counts them like a miser counting coins. "Pleasure doing business." The barricade opens just enough to squeeze through. As you cross, the chained teenager looks at you with eyes that say "please." You keep walking. Violet whispers: "We could have helped him." You know. You will carry that knowledge for a long time.',
          setFlags: { paid_toll: true, saw_prisoner: true },
        },
        {
          text: 'Negotiate. Offer labor or information instead of supplies.',
          skillCheck: { skill: 'charisma', dc: 14 },
          successText: '"What do you know about east?" Doug asks. You tell him about the radio broadcast, about Ottawa, about the AI. His smirk fades. "You are serious." He waves you through without taking a thing. "If you find this cure... remember the people at Hope Bridge." As you cross, you catch the prisoner\'s eye and mouth: "Hang on." It is not enough. But it is something.',
          failureText: '"I do not need information. I need FOOD." Doug shoves you backward. His people raise their weapons. You pay double — everything you can carry goes to them. You cross the bridge with empty packs and full shame.',
          successEffects: { morale: 5 },
          failureEffects: { food: -6, medicine: -2, morale: -15 },
          setFlags: { negotiated_toll: true },
        },
        {
          text: 'Create a distraction and try to get past without paying.',
          skillCheck: { skill: 'stealth', dc: 15 },
          successText: 'Cassidy — brilliant, terrifying Cassidy — throws a road flare into the tree line and screams "RUNNERS!" The bandits scramble. In the chaos, you slip through a gap in the barricade. You even manage to cut the prisoner free as you pass. He runs with you for a mile before splitting off south, gasping "thank you" between breaths.',
          failureText: 'Your distraction fails. Doug catches you trying to squeeze through the barricade. His people are not gentle about what happens next. They take everything — your pack, your food, even your jacket. They let you cross, but only because you are not worth the bullet.',
          successEffects: { morale: 15 },
          failureEffects: { food: -8, scrap: -3, health: -10, morale: -20 },
          setFlags: { fought_bandits: true },
        },
        {
          text: 'Free the prisoner. Fight if you have to.',
          skillCheck: { skill: 'combat', dc: 14 },
          successText: 'You do not announce it. You just move. Dr. Reyes grabs a tire iron. Cassidy hurls a rock that catches Doug square in the temple. In the confusion, you cut the chain. The fight is ugly and brief — three of Doug\'s people go down before the rest scatter. The prisoner, whose name is Jake, tells you about a back road that bypasses the next fifty kilometers of highway. Then he disappears into the woods. You never see him again.',
          failureText: 'Doug is faster than he looks. You take a bat to the ribs before Dr. Reyes drags you back. You retreat across the shallow part of the river, soaked and bleeding. The prisoner watches you go. You failed him.',
          successEffects: { morale: 20 },
          failureEffects: { health: -20, morale: -10 },
          setFlags: { freed_prisoner: true, defied_bandits: true },
        },
      ],
    }],
  },
];
