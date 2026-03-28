// ============================================================
// MASEDOG: Dead North — Chapter 5: Ontario Wilderness
// Weeks 27-40 | Region: ontario_north, ontario_south
// Deep winter. The Hive Mind. The truth about the cure.
// ============================================================

export const CHAPTER_5_EVENTS = [
  // ---- Event 1: Deep Winter ----
  {
    id: 'evt_ch5_deep_winter',
    type: 'story',
    region: ['ontario_north'],
    season: null,
    turnRange: [27, 32],
    baseWeight: 35,
    onceOnly: true,
    title: 'Forty Below',
    segments: [{
      narration: 'The thermometer — a gas station freebie that Cassidy has carried since Saskatchewan — reads minus forty-one degrees Celsius. At this temperature, exposed skin freezes in minutes. Spit crackles before it hits the ground. Metal burns like fire. Every breath is a knife in your lungs.\n\nThe Trans-Canada Highway north of Lake Superior is the loneliest road in the country. Dense boreal forest presses in from both sides, dark and infinite. The snow is waist-deep off the road. Nothing moves. Nothing can move. Even the Runners have retreated — somewhere underground, somewhere warm enough to keep their hijacked muscles from freezing solid.\n\nYou have not seen another living person in nine days.\n\nViolet has stopped complaining about the cold, which terrifies you more than the complaining did. Dr. Reyes checks her temperature obsessively — her fever runs higher than a normal person\'s, which ironically keeps her warmer, but he is watching for the tipping point where fever becomes lethal.\n\nCassidy walks point. She has become the group\'s navigator, reading the landscape with an instinct that borders on supernatural. She stops. Points.\n\n"Smoke," she says. "Two kilometers. Chimney smoke. Someone is out here."',
      choices: [
        {
          text: 'Follow the smoke. We need warmth or we die tonight.',
          effects: { morale: 5 },
          resultText: 'The smoke leads to a hunting lodge buried in snow up to its windows. Inside: a wood-burning stove, a stack of firewood, and an old Ojibwe trapper named Joseph. He has been here since the outbreak, surviving on snares and root cellars. He does not speak much but he feeds you moose stew and shows Cassidy how to build a proper winter shelter. "The forest provides," he says simply. "If you listen." He tells you the road ahead is clear — the cold has killed or frozen everything. But he warns you about spring. "When the ice breaks, they wake up. All of them. At once." He lets that image settle before adding another log to the fire.',
          setFlags: { met_joseph: true, knows_spring_thaw: true },
        },
        {
          text: 'Approach with caution. Could be a trap.',
          skillCheck: { skill: 'perception', dc: 12 },
          successText: 'You circle the lodge at a distance, looking for signs of danger. Nothing — just one set of snowshoe tracks, a snare line, and a wood pile. Whoever is here is alone and self-sufficient. You approach openly. An old Ojibwe man opens the door before you knock. "I heard you coming an hour ago," he says. "City people walk loud." His name is Joseph and he saves your lives with nothing more than fire, food, and knowledge of the land.',
          failureText: 'Your caution costs you an hour in the killing cold. By the time you reach the lodge, Violet is barely conscious. The man inside — Joseph — takes one look at her and pulls her to the fire. "You almost killed her with your fear," he says flatly. He is right.',
          successEffects: { morale: 10, food: 3 },
          failureEffects: { health: -10, morale: -5, food: 3 },
          setFlags: { met_joseph: true },
        },
        {
          text: 'Build our own fire. We cannot depend on strangers.',
          skillCheck: { skill: 'survival', dc: 15 },
          successText: 'You find a sheltered depression in the tree line and build a winter camp the way the survival books describe — snow walls for windbreak, a reflector fire, boughs for insulation. It is miserable and barely adequate, but it works. You survive the night. In the morning, you find snowshoe tracks circling your camp. Someone watched you all night and chose not to approach. A gift — a bundle of dried meat and fire-starters — sits at the edge of camp. You never see who left it.',
          failureText: 'The fire will not catch. The wood is too wet, your hands too numb, the wind too vicious. You huddle together in a snow trench, sharing body heat, while the temperature drops to minus forty-five. Dr. Reyes stays awake all night, checking pulses, making everyone wiggle their fingers and toes. Nobody sleeps. Everyone survives, but just barely.',
          successEffects: { morale: 5 },
          failureEffects: { health: -20, morale: -15 },
          setFlags: { survived_alone_winter: true },
        },
      ],
    }],
  },

  // ---- Event 2: Thunder Bay — Cassidy's Parents ----
  {
    id: 'evt_ch5_thunder_bay',
    type: 'story',
    region: ['ontario_north'],
    season: null,
    turnRange: [30, 35],
    baseWeight: 35,
    onceOnly: true,
    title: 'The Longest Day',
    segments: [{
      narration: 'Thunder Bay. Cassidy has been quiet for two days — quieter than usual, which for Cassidy means absolute silence. You know why. Her parents were in Toronto when the outbreak hit, but their family cabin is here, on the north shore of Lake Superior. "If they are alive," she told you once, weeks ago, "they would go to the cabin. Dad always said if the world ended, that is where he would be."\n\nThe cabin is six kilometers north of the city, up a logging road now buried in snow. You find it at noon. The front door is open. Snow has drifted into the living room.\n\nCassidy stands in the doorway. She does not go in.\n\nYou go in for her. The cabin is empty. No bodies, no blood. But on the kitchen table, held down by a coffee mug, is a note. Cassidy\'s father\'s handwriting:\n\n"Cass — If you made it here, we are so proud of you. We waited as long as we could. A group came through heading for Sudbury. They said there is a safe zone. We are going with them. We left supplies under the floor in the back bedroom. We love you more than you will ever know. — Dad & Mom"\n\nCassidy reads it three times. Then she folds it carefully, puts it in her pocket, and sits on the cabin floor. She does not cry. She just sits.',
      choices: [
        {
          text: 'Sit with her. She does not need words. She needs someone to be there.',
          effects: { morale: 10 },
          resultText: 'You sit beside her on the cold cabin floor. Violet sits on her other side. Dr. Reyes quietly searches the back bedroom and finds the supply cache — canned food, batteries, a hand-crank radio, and winter clothing sized for a teenager. As if her parents knew she would come. As if they packed for her specifically. When Cassidy sees the clothing, she finally breaks. Not sobbing — just tears, silent and steady, running down cheeks that have been brave for too long. Violet holds her hand. You hold the other. The three of you sit there while the northern wind howls outside, and for the first time in months, you feel like a family.',
          setFlags: { comforted_cassidy: true, found_parent_note: true, cassidy_parents_alive: true },
        },
        {
          text: 'Sudbury. Her parents are heading to Sudbury. We can catch them.',
          effects: { morale: 15 },
          resultText: 'Cassidy\'s head snaps up. "Sudbury? That is on our route. That is ON OUR ROUTE." The transformation is instantaneous — from broken to burning. She is on her feet, grabbing the supply cache, shoving things into packs. "How far? Three hundred kilometers? Four hundred?" Dr. Reyes checks the map. "Roughly seven hundred from here." Cassidy does not even blink. "Then we better move." She is out the door before anyone else is standing. You have never seen anyone move that fast on hope alone.',
          setFlags: { chasing_parents: true, found_parent_note: true, cassidy_parents_alive: true },
        },
        {
          text: 'Check the note for a date. How long ago did they leave?',
          skillCheck: { skill: 'perception', dc: 10 },
          successText: 'The note is dated three weeks ago. The supply cache under the floorboards is intact. And in the margin of the note, almost invisible, her father wrote coordinates — latitude and longitude. Dr. Reyes plots them on the map. "That is not Sudbury," he says. "That is a point forty kilometers south of Sudbury. An old mine site." He looks up. "Her father was leaving breadcrumbs. He knew someone smart enough to look would be smart enough to follow."',
          failureText: 'No date on the note. Could have been written last week or last month. The uncertainty is its own kind of cruelty. But the supplies are there, and the note is real, and her parents were alive when they wrote it. In this world, that is everything.',
          successEffects: { morale: 10 },
          failureEffects: { morale: 5 },
          setFlags: { found_parent_note: true, cassidy_parents_alive: true, has_coordinates: true },
        },
      ],
    }],
  },

  // ---- Event 3: The Hive Mind ----
  {
    id: 'evt_ch5_hive_mind',
    type: 'story',
    region: ['ontario_north', 'ontario_south'],
    season: null,
    turnRange: [33, 38],
    baseWeight: 35,
    onceOnly: true,
    title: 'The Hive',
    segments: [{
      narration: 'You hear it before you see it. A hum — low, resonant, vibrating in your teeth and behind your eyes. It comes from everywhere and nowhere, pulsing through the frozen ground like a heartbeat.\n\nThen you see them.\n\nHundreds of infected, gathered in the valley below a communications relay tower. But they are not wandering. They are not feeding. They are BUILDING. Carrying lumber, stacking stones, weaving branches into walls. Constructing something around the base of the tower with a coordination that would be impressive from a human work crew and is absolutely terrifying from the reanimated dead.\n\nAnd in the center of the construction, standing motionless on a raised platform of stacked cars, is something new. A zombie — or what used to be one. Its body is covered in a web of dark veins, visible even from this distance, pulsing with the same rhythm as the hum. Its eyes are open, staring at nothing, and the other infected move around it like planets orbiting a sun.\n\nDr. Reyes whispers: "A node. A local control hub for the network. That thing on the platform is the relay — it receives the AI\'s signal from the tower and broadcasts it to every infected in range." He swallows. "Kill the node, and the signal drops. Every infected within fifty kilometers goes feral."',
      choices: [
        {
          text: 'Destroy the relay tower. Cut the signal at the source.',
          skillCheck: { skill: 'mechanics', dc: 15 },
          successText: 'Cassidy spots the tower\'s power junction — a transformer box on the north side, away from the main construction. You circle the valley under cover of darkness, moving through the trees. The infected do not look up. They are focused on their task, slaves to the hum. You reach the junction and sever the main power cable with an axe. The hum STOPS. The effect is instantaneous — every infected in the valley freezes, then collapses into chaotic, directionless shambling. The node creature on the platform screams — a sound that is not human and not zombie but something else entirely — and falls. The construction stops. The Hive is broken.',
          failureText: 'You reach the tower but cannot find the power junction in the dark. Your flashlight catches a wire and you pull — wrong wire. An alarm blares. The node creature on the platform turns its head toward you with mechanical precision. Every infected in the valley turns with it. Hundreds of dead eyes, all seeing you at once. You run. The hive gives chase, moving as a single organism. You escape, barely, but the tower still stands.',
          successEffects: { morale: 25 },
          failureEffects: { health: -15, morale: -10 },
          setFlags: { destroyed_hive_node: true },
        },
        {
          text: 'Study the node creature. Understanding it could be the key to everything.',
          skillCheck: { skill: 'perception', dc: 14 },
          successText: 'You watch for six hours, cataloguing everything. The node creature does not eat, does not move, does not blink. The dark veins pulse in a pattern — Dr. Reyes recognizes it as binary. The AI is transmitting DATA through the infected\'s nervous system. "It is using them as a distributed computing network," he says, awed and horrified. "The infected are not just soldiers. They are processors. Every zombie is a node in the world\'s largest biological computer." This changes everything you thought you knew about the virus.',
          failureText: 'You cannot make sense of what you are seeing. The construction, the formations, the pulsing veins — it is too alien, too far beyond anything in your experience. You leave with more questions than answers and the uneasy feeling that the enemy is evolving faster than you can understand.',
          successEffects: { morale: 5 },
          failureEffects: { morale: -5 },
          setFlags: { studied_hive_node: true, knows_bio_network: true },
        },
        {
          text: 'Sneak past. This is not our fight.',
          skillCheck: { skill: 'stealth', dc: 13 },
          successText: 'You take a three-kilometer detour through dense forest, giving the valley a wide berth. The hum fades behind you. You never look back. Some horrors are best left untouched. But the knowledge of what you saw — the organized infected, the node creature, the biological network — that knowledge will not leave you. The enemy is not a virus anymore. It is an intelligence.',
          failureText: 'The detour takes you through a ravine that funnels you closer to the valley than intended. A patrol of organized infected — Runners, moving in a diamond formation like soldiers — cuts across your path. You press into the snow and hold your breath for twenty agonizing minutes while they pass. One of them pauses, sniffs the air, and looks directly at the snowbank where Violet is hiding. Then it moves on. You do not breathe again until they are gone.',
          successEffects: { morale: -3 },
          failureEffects: { morale: -15 },
          setFlags: { avoided_hive_node: true },
        },
      ],
    }],
  },

  // ---- Event 4: The Cure Carrier ----
  {
    id: 'evt_ch5_cure_reveal',
    type: 'story',
    region: ['ontario_north', 'ontario_south'],
    season: null,
    turnRange: [35, 40],
    baseWeight: 40,
    onceOnly: true,
    title: 'The Blood That Matters',
    segments: [{
      narration: 'It happens in a gas station bathroom in Hearst, Ontario. Dr. Reyes has been running blood tests with a portable kit he assembled from veterinary supplies, hospital salvage, and sheer ingenuity. He has been testing everyone in the group weekly since Clearwater — saying it is routine, checking for infection markers.\n\nHe is lying. He has been looking for something specific. And he found it.\n\nHe gathers everyone around a Coleman lantern and holds up a slide — a smear of blood, dark against the light. His voice is different. Stripped of its usual calm. Raw.\n\n"One of us is carrying antibodies to the virus. Not partial resistance. Not tolerance. Full, weaponizable antibodies. The kind you build a vaccine from." His hands are shaking. You have never seen Dr. Reyes\'s hands shake. "I have been looking for this since Vancouver. Since I first saw Violet\'s bloodwork at the hospital and realized her immune response was abnormal. I did not want to say anything until I was sure."\n\nHe turns to face the group.\n\n"I am sure now. One of you is the cure. Your blood, properly processed at a lab like Ottawa\'s, could produce a vaccine for every surviving human on Earth."\n\nThe lantern flickers. The shadows dance. Nobody speaks.\n\n"The carrier is randomly determined by factors I cannot predict — genetics, exposure timing, immune profile. I have confirmed it through repeated testing." He pauses. "And the AI knows. The coordinated infected have been tracking us since Manitoba. Not to kill us. To contain us. To stop the cure from ever reaching a lab."',
      choices: [
        {
          text: 'Who is it? We need to protect them at all costs.',
          effects: { morale: 15 },
          resultText: 'Dr. Reyes looks at each of you in turn. The answer lands like a thunderbolt. The cure carrier has been walking beside you for months — sick, exhausted, struggling through blizzards and firefights and moral impossibilities. And their blood holds the key to saving every human being left alive. Everything changes now. Every decision, every risk, every step toward Ottawa is filtered through one absolute priority: the carrier reaches the lab. Whatever it takes. Whoever it costs.',
          setFlags: { cure_revealed: true, cure_carrier_known: true },
        },
        {
          text: 'How long have you known? Why did you wait to tell us?',
          effects: { morale: -5 },
          resultText: '"Because knowledge is a weapon, and it cuts both ways," Dr. Reyes says. "If the AI is monitoring us — through devices, through organized infected, through means we do not understand — then broadcasting the existence of a cure carrier makes that person a target." He meets your eyes. "I waited until I was certain. And until we were close enough to Ottawa that the knowledge would drive us forward instead of paralyzing us with fear." He is right. And you hate him a little for being right.',
          setFlags: { cure_revealed: true, cure_carrier_known: true, angry_at_reyes: true },
        },
        {
          text: 'If the AI knows, then we are being hunted. We need a plan.',
          effects: { morale: 5 },
          resultText: 'Dr. Reyes nods. "The organized infected have been tightening a perimeter around us for weeks. I believe they are trying to herd us — away from Ottawa, toward a processing center." He pulls out the map. "But they have a weakness. The Hive Mind operates through relay nodes. If we stay in areas where nodes have been destroyed or never established, the coordinated infected lose their advantage." He draws a line on the map — a route through the gaps in the AI\'s network, threading between nodes like a needle through fabric. "It adds three hundred kilometers. But it keeps us out of the net."',
          setFlags: { cure_revealed: true, cure_carrier_known: true, evasion_plan: true },
        },
      ],
    }],
  },

  // ---- Event 5: The Spring Thaw ----
  {
    id: 'evt_ch5_spring_thaw',
    type: 'story',
    region: ['ontario_south'],
    season: null,
    turnRange: [36, 40],
    baseWeight: 30,
    onceOnly: true,
    title: 'The Thaw',
    segments: [{
      narration: 'You hear it in the trees first — the slow drip of melting ice. Then the creak of frozen rivers beginning to move. The temperature climbs above zero for the first time in months, and the world starts to wake up.\n\nSo do they.\n\nIt begins with a sound like cracking knuckles amplified a thousandfold — the frozen Shamblers, thousands of them, thawing in the spring sun. Joints pop. Ice shatters. From the forests, the fields, the roadsides, the rivers, the dead rise from their winter sleep.\n\nYou are camped near Sudbury when the first one lurches past your window, ice still clinging to its shoulders, moving with the slow determination of something that has been waiting a very long time.\n\nWithin an hour, they are everywhere. The prairie winter that held them at bay is over. Every frozen corpse between Thunder Bay and Ottawa is waking up, and they are HUNGRY.\n\nDr. Reyes does not sugarcoat it: "We have maybe two weeks before the thaw reaches full effect and the Hive Mind re-establishes network coverage. Every day we delay, the resistance we face doubles."\n\nCassidy straps on her pack. "Then let\'s stop delaying."',
      choices: [
        {
          text: 'Move fast. Day and night marches. No stops except for sleep.',
          effects: { travel: 20, health: -10, morale: 5 },
          resultText: 'You run the gauntlet. Eighteen hours of movement per day, sleeping in shifts, eating on the move. The thawing Shamblers are slow — still stiff, still clumsy — and you outpace them easily. But the Runners thaw faster, and by day three they are hunting in packs again. You lose count of the close calls. Violet runs beside you with a determination that makes you forget she was ever sick. Cassidy scouts ahead with the instincts of someone born for this broken world. Dr. Reyes brings up the rear, watching for pursuit, carrying the knowledge that one of you is worth more than the rest combined.',
          setFlags: { spring_sprint: true },
        },
        {
          text: 'Find a vehicle. We cannot outrun the thaw on foot.',
          skillCheck: { skill: 'mechanics', dc: 13 },
          successText: 'Sudbury\'s mining operations left behind heavy equipment. You find a transport truck with a diesel engine that turns over on the third try. It is loud, it is slow, and it handles like a drunk elephant, but it puts a metal shell between you and the waking dead. You barrel east on the Trans-Canada, plowing through Shamblers who stagger onto the road like sleepwalkers. Every impact sends a shudder through the cab. Cassidy keeps count. You wish she would not.',
          failureText: 'Every vehicle you find is dead — batteries drained by the cold, fuel lines frozen and cracked, engines seized. You spend a precious day searching before Dr. Reyes pulls you aside. "We are wasting time we do not have." He is right. You walk, faster than before, driven by the rising sound of the dead behind you.',
          successEffects: { travel: 25, morale: 10 },
          failureEffects: { morale: -10 },
          setFlags: { found_spring_vehicle: true },
        },
        {
          text: 'Head for the mine site from Cassidy\'s father\'s coordinates first.',
          effects: { morale: 5 },
          resultText: 'The coordinates lead to an abandoned nickel mine forty kilometers south of Sudbury. The entrance is hidden behind a rockfall, but someone has cleared a path. Inside, you find the remnants of a survivor camp — empty food cans, sleeping bags, a fire pit. On the wall, in chalk: "CASS — Headed for Ottawa with the group. Find us there. Love, Dad." Below it, a hand-drawn map of the route they took, with notes: safe houses, water sources, Hive Mind patrol patterns. Cassidy traces her father\'s handwriting with her fingertip. Then she copies the map and leads you east. Her parents are ahead. Ottawa is ahead. Everything is ahead.',
          setFlags: { found_mine_camp: true, cassidy_parents_route: true },
        },
      ],
    }],
  },
];
