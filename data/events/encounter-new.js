// ============================================================
// MASEDOG: Dead North — New Events Expansion Pack
// Additional events across all categories
// ============================================================

// ---- COMBAT EVENTS ----
export const NEW_COMBAT_EVENTS = [
  {
    id: 'evt_overpass_snipers',
    type: 'combat',
    region: ['bc_interior', 'alberta'],
    season: null,
    turnRange: [5, 25],
    baseWeight: 10,
    title: 'Death From Above',
    segments: [{
      narration: 'The highway dips under an overpass. Movement above — shapes crawling along the guardrail. Then one drops. Lands on the roof of a burned-out car with a sickening crunch, and keeps moving. More are climbing over the edge. They\'re raining down like spiders.',
      choices: [
        {
          text: 'Sprint under the overpass before more drop',
          skillCheck: { skill: 'athletics', dc: 12 },
          successText: 'You burst through at full speed. Two hit the pavement behind you, but you\'re already clear. The sound of their bodies striking asphalt follows you for a hundred meters.',
          failureText: 'One lands on your pack, dragging you down. You fight it off, but others are closing in from both sides.',
          effects: { travel: 10 },
          failureEffects: { health: -15, morale: -5 },
        },
        {
          text: 'Pick them off as they climb over the railing',
          skillCheck: { skill: 'combat', dc: 14 },
          successText: 'Aim high. One by one they tumble backwards off the overpass. When the last one falls, the highway is quiet again. You scavenge ammo from a crashed police cruiser nearby.',
          failureText: 'There are too many. For every one you drop, three more appear at the railing. You\'re forced to retreat.',
          effects: { ammo: -3 },
          successEffects: { ammo: 5, morale: 5 },
          failureEffects: { health: -10, ammo: -2 },
        },
        {
          text: 'Backtrack and take the service road around',
          effects: { travel: -15 },
          resultText: 'The long way around. You watch from the service road as dozens of them pile onto the highway below the overpass, crawling over each other like ants. You made the right call.',
        },
      ],
    }],
  },

  {
    id: 'evt_abandoned_school',
    type: 'combat',
    region: ['alberta', 'saskatchewan', 'manitoba'],
    season: null,
    turnRange: [8, 35],
    baseWeight: 8,
    onceOnly: true,
    title: 'Small Shoes',
    segments: [{
      narration: 'An elementary school. The doors are decorated with construction paper flowers, now faded and peeling. Inside, tiny desks overturned, crayon drawings on the walls. Then you hear it — small footsteps. Fast. A child appears at the end of the hallway. Pallid skin. Empty eyes. It\'s wearing a backpack covered in cartoon stickers. Behind it, more small shapes emerge from classrooms. They move faster than they should.',
      choices: [
        {
          text: 'Fight through — they\'re not children anymore',
          skillCheck: { skill: 'combat', dc: 11 },
          successText: 'You do what has to be done. No one speaks for a long time afterward. On the way out, you find supplies in the cafeteria kitchen.',
          failureText: 'They\'re small but relentless. They swarm your legs, pulling you down. You escape, but barely.',
          successEffects: { food: 4, morale: -8 },
          failureEffects: { health: -15, morale: -12 },
        },
        {
          text: 'Seal the doors — trap them inside',
          skillCheck: { skill: 'mechanics', dc: 10 },
          successText: 'You chain the doors shut from outside. The banging from within is terrible. But they can\'t get out. You find the teacher\'s lounge and grab what\'s left.',
          failureText: 'The chains don\'t hold. They pour through the gap before you can tighten it.',
          successEffects: { food: 2, medicine: 1, morale: -5 },
          failureEffects: { health: -10, morale: -10 },
        },
        {
          text: 'Leave. Now. Don\'t look back.',
          effects: { morale: -5 },
          resultText: 'Some things you can\'t unsee. The crayon drawing by the exit shows a family holding hands under a yellow sun. Everyone in the group is silent for the rest of the day.',
        },
      ],
    }],
  },

  {
    id: 'evt_train_yard_ambush',
    type: 'combat',
    region: ['alberta', 'saskatchewan'],
    season: null,
    turnRange: [10, 30],
    baseWeight: 12,
    title: 'Rail Yard',
    segments: [{
      narration: 'A freight train yard. Dozens of rusted boxcars line the tracks, doors hanging open like dead mouths. You\'re halfway through when the trap springs — they emerge from inside the cars on both sides simultaneously. Shamblers, Crawlers, even a couple of Runners. The narrow corridor between trains becomes a kill box.',
      choices: [
        {
          text: 'Climb on top of a boxcar — take the high ground',
          skillCheck: { skill: 'athletics', dc: 11 },
          successText: 'From the roof of the boxcar, you have the advantage. They claw at the sides but can\'t climb. You pick them off at your pace, then drop into a car full of unlooted cargo.',
          failureText: 'The rusted metal gives way under your foot. You crash through into the boxcar below — right into a cluster of them.',
          successEffects: { ammo: -2, food: 3, scrap: 4 },
          failureEffects: { health: -20, morale: -5 },
        },
        {
          text: 'Use a boxcar as a chokepoint and fight',
          skillCheck: { skill: 'combat', dc: 13 },
          successText: 'You funnel them through a single doorway. One at a time, they fall. It\'s brutal, exhausting work, but the math is on your side.',
          failureText: 'Too many from too many directions. The chokepoint is overwhelmed. You\'re forced to abandon position.',
          effects: { ammo: -2 },
          successEffects: { morale: 5, scrap: 3 },
          failureEffects: { health: -15, morale: -8 },
        },
        {
          text: 'Crawl under the train cars and escape',
          skillCheck: { skill: 'stealth', dc: 12 },
          successText: 'On your belly in the gravel, you slither beneath the rusted undercarriages. The dead stumble past overhead, groaning. You emerge on the far side and disappear into the treeline.',
          failureText: 'A Crawler spots you — it\'s right at home under here. You scramble out the other side with bite marks on your arms.',
          failureEffects: { health: -12 },
        },
      ],
    }],
  },

  {
    id: 'evt_night_watch_breach',
    type: 'combat',
    region: null,
    season: null,
    turnRange: [6, 52],
    baseWeight: 10,
    title: 'The Watch Failed',
    segments: [{
      narration: 'You wake to silence. That\'s the problem — the watch should have called the change twenty minutes ago. You find the lookout slumped against a tree, asleep. Beyond the dead campfire, shapes are already inside your perimeter. A dozen of them, drifting between the sleeping bags like ghosts. One is three feet from your face.',
      choices: [
        {
          text: 'Wake everyone with a shout and fight',
          skillCheck: { skill: 'charisma', dc: 10 },
          successText: '"EVERYBODY UP! NOW!" The camp erupts. Chaos, but organized chaos. You form a circle and push them back.',
          failureText: '"EVERYBODY—" A hand closes around your throat before you finish. The camp erupts in screaming.',
          successEffects: { morale: -3 },
          failureEffects: { health: -20, morale: -12, food: -2 },
        },
        {
          text: 'Quietly wake people one by one',
          skillCheck: { skill: 'stealth', dc: 14 },
          successText: 'Hand over mouth, gentle shake, point at the shapes. One by one your people wake, reach for weapons, and wait for your signal. When you give it, the ambush becomes yours.',
          failureText: 'The third person you wake gasps too loudly. Every dead head turns at once.',
          successEffects: { morale: 5 },
          failureEffects: { health: -15, morale: -8 },
        },
        {
          text: 'Grab what you can and lead a silent retreat',
          skillCheck: { skill: 'survival', dc: 12 },
          successText: 'You pull people away one at a time, collecting packs as you go. By the time the dead figure out the sleeping bags are empty, you\'re a quarter mile away.',
          failureText: 'In the dark, someone trips over a supply crate. The crash brings every one of them charging.',
          effects: { food: -2 },
          failureEffects: { health: -10, food: -4, water: -3 },
        },
      ],
    }],
  },

  {
    id: 'evt_wired_soldiers',
    type: 'combat',
    region: ['ontario_south', 'ottawa_approach'],
    season: null,
    turnRange: [35, 52],
    baseWeight: 10,
    onceOnly: true,
    title: 'The Wired Patrol',
    segments: [{
      narration: 'A military base. The fence is intact, the gates sealed. Through binoculars, you see soldiers patrolling. Relief floods through you — until you notice the wires. Thin cables run from the base of each soldier\'s skull to a junction box mounted on their backs. Their eyes glow faint blue. The AI didn\'t just kill the military. It repurposed them. They still carry rifles. They still patrol in formation. But they\'re not alive.',
      choices: [
        {
          text: 'Target the junction boxes — cut their strings',
          skillCheck: { skill: 'combat', dc: 16 },
          successText: 'You aim for the boxes on their backs. Each one you hit drops a soldier like a puppet with its strings cut. Inside the base, you find a weapons cache and intact supply depot.',
          failureText: 'They return fire. These things still have training, still have aim. You barely survive the firefight.',
          effects: { ammo: -5 },
          successEffects: { ammo: 12, medicine: 4, food: 6, morale: 10 },
          failureEffects: { health: -25, ammo: -3, morale: -10 },
          setFlags: { cleared_wired_base: true },
        },
        {
          text: 'Create a distraction to draw them away from the gate',
          skillCheck: { skill: 'mechanics', dc: 14 },
          successText: 'A rigged car alarm on a timer. When it blares, every wired soldier turns in unison and marches toward the sound. You slip through the unguarded gate.',
          failureText: 'The distraction fizzles. One of them turns its glowing eyes directly toward your position. It raises its rifle.',
          successEffects: { food: 5, ammo: 8, medicine: 3 },
          failureEffects: { health: -20, morale: -8 },
          setFlags: { infiltrated_wired_base: true },
        },
        {
          text: 'This is suicide — go around the base',
          effects: { travel: -20, morale: -5 },
          resultText: 'AI-controlled soldiers with weapons and training. There\'s brave, and there\'s stupid. You take the long way around, but you keep breathing.',
          setFlags: { saw_wired_soldiers: true },
        },
      ],
    }],
  },
];

// ---- SCAVENGE EVENTS ----
export const NEW_SCAVENGE_EVENTS = [
  {
    id: 'evt_hunting_woods',
    type: 'scavenge',
    region: ['bc_interior', 'ontario_north'],
    season: ['summer', 'fall'],
    turnRange: [4, 40],
    baseWeight: 12,
    title: 'The Hunt',
    segments: [{
      narration: 'Deer tracks in the mud, fresh. Your stomach growls so loud you\'re afraid it\'ll scare them off. The forest is quiet — too quiet for zombies, which means the animals are still here. A real meal. Actual protein. It\'s been weeks since anyone had that.',
      choices: [
        {
          text: 'Track the deer and take a shot',
          skillCheck: { skill: 'survival', dc: 12 },
          successText: 'An hour of patient tracking. You find them at a stream. One clean shot. The group eats hot venison tonight. People smile for the first time in days.',
          failureText: 'You track for hours but the deer spook before you get close enough. Wasted time. Wasted energy.',
          effects: { ammo: -1 },
          successEffects: { food: 8, morale: 10, health: 5 },
          failureEffects: { morale: -3 },
        },
        {
          text: 'Set snares and traps overnight',
          skillCheck: { skill: 'survival', dc: 10 },
          successText: 'By morning, two rabbits and a grouse. Not a feast, but real food. The smell of cooking meat almost makes things feel normal.',
          failureText: 'Empty snares. Something sprung them — animal or otherwise. You waste a night for nothing.',
          successEffects: { food: 4, morale: 5 },
          failureEffects: { morale: -2 },
        },
        {
          text: 'Forage for berries and edible plants instead',
          skillCheck: { skill: 'survival', dc: 8 },
          successText: 'Wild blueberries, cattail roots, dandelion greens. Not glamorous, but safe and filling.',
          failureText: 'Slim pickings. A handful of sour berries and some questionable mushrooms. Someone gets stomach cramps.',
          successEffects: { food: 3, water: 1 },
          failureEffects: { food: 1, health: -5 },
        },
      ],
    }],
  },

  {
    id: 'evt_abandoned_hospital_scav',
    type: 'scavenge',
    region: ['alberta', 'manitoba', 'ontario_south'],
    season: null,
    turnRange: [6, 42],
    baseWeight: 10,
    title: 'Return to the Ward',
    segments: [{
      narration: 'Another hospital. The irony isn\'t lost on you — this whole nightmare started in one. The emergency department entrance is barricaded from the inside, which means someone tried to hold out here. The pharmacy sign flickers in the emergency lighting. Backup generators still humming after all this time.',
      choices: [
        {
          text: 'Head straight for the pharmacy',
          skillCheck: { skill: 'stealth', dc: 12 },
          successText: 'The pharmacy door is locked but the security glass has a crack. You work it open. Antibiotics, morphine, surgical kits — the mother lode. Whoever barricaded this place kept the pharmacy intact.',
          failureText: 'The generator picks this moment to surge. Lights flicker, alarms blare for three seconds, then silence. But three seconds is enough. You hear shuffling from the floors above.',
          successEffects: { medicine: 6, morale: 5 },
          failureEffects: { medicine: 2, health: -10 },
        },
        {
          text: 'Search the emergency department',
          skillCheck: { skill: 'perception', dc: 10 },
          successText: 'Triage stations still stocked with bandages, saline, and basic meds. In a nurse\'s locker, you find a protein bar stash and a working flashlight.',
          failureText: 'The ED has been picked clean. All that\'s left are empty wrappers and bloodstains.',
          successEffects: { medicine: 3, food: 2, scrap: 1 },
          failureEffects: { medicine: 1 },
        },
        {
          text: 'Check the ambulance bay for vehicles and gear',
          skillCheck: { skill: 'mechanics', dc: 11 },
          successText: 'An ambulance with half a tank of gas and a full trauma kit in the back. This is a mobile hospital. You load up everything you can.',
          failureText: 'The ambulances are stripped. Someone got here first and took everything useful.',
          successEffects: { fuel: 3, medicine: 4 },
          failureEffects: { morale: -3 },
        },
      ],
    }],
  },

  {
    id: 'evt_farm_livestock',
    type: 'scavenge',
    region: ['saskatchewan', 'manitoba'],
    season: null,
    turnRange: [15, 35],
    baseWeight: 11,
    title: 'Old MacDonald\'s Last Stand',
    segments: [{
      narration: 'A farmstead. The house is burned, but the barn still stands. And from inside — the sound of chickens. Actual living chickens. A cow lows somewhere behind the building. Whoever lived here fortified the barn before the end. The animals survived even when the people didn\'t.',
      choices: [
        {
          text: 'Gather eggs and milk the cow',
          skillCheck: { skill: 'survival', dc: 9 },
          successText: 'Fresh eggs. Warm milk. The group sits in the barn and eats the first real meal in memory. Someone cries. Nobody judges them.',
          failureText: 'The cow kicks you. The chickens scatter. You manage to grab a few eggs before giving up.',
          successEffects: { food: 6, morale: 10, health: 5 },
          failureEffects: { food: 2, health: -3 },
        },
        {
          text: 'Slaughter a chicken — take meat for the road',
          effects: { food: 5, morale: 3 },
          resultText: 'It\'s grim work, but efficient. You dress the bird and pack the meat in salt from the farmhouse pantry. Enough protein for days.',
        },
        {
          text: 'Search the farmhouse ruins for supplies',
          skillCheck: { skill: 'perception', dc: 11 },
          successText: 'The cellar survived the fire. Canned preserves, root vegetables, a hunting rifle with a box of shells. This family was prepared.',
          failureText: 'The ruins are unstable. A floor beam collapses and you barely roll clear. Nothing salvageable.',
          successEffects: { food: 5, ammo: 6, scrap: 2 },
          failureEffects: { health: -8, morale: -3 },
        },
        {
          text: 'Stay the night in the barn — rest and eat',
          effects: { food: 3, health: 10, morale: 8 },
          resultText: 'One night in a barn with living animals, warm hay, and a full stomach. It\'s the closest thing to peace anyone has felt since the outbreak. Tomorrow you walk again. But tonight, you rest.',
        },
      ],
    }],
  },

  {
    id: 'evt_snowbound_cabin',
    type: 'scavenge',
    region: ['alberta', 'saskatchewan', 'manitoba', 'ontario_north'],
    season: ['winter'],
    turnRange: [14, 35],
    baseWeight: 14,
    winterBoost: true,
    title: 'Snowbound',
    segments: [{
      narration: 'A cabin, half-buried in snow. Smoke would be coming from the chimney if anyone were home, but the place is dark and cold. The snow around it is undisturbed — no tracks, living or dead. Inside could be warmth, supplies, maybe even a working fireplace. The temperature is dropping fast.',
      choices: [
        {
          text: 'Break in and get a fire going',
          skillCheck: { skill: 'survival', dc: 10 },
          successText: 'The door gives way. Inside: a woodstove, split firewood, canned goods on shelves. You get a fire going and the cabin warms. Ice melts from the windows. For one night, winter can\'t touch you.',
          failureText: 'The chimney is blocked. Smoke fills the cabin before you can smother the fire. You clear it eventually, but the smoke draws attention from the treeline.',
          successEffects: { health: 12, morale: 10, food: 3, water: 2 },
          failureEffects: { health: -5, morale: -3 },
        },
        {
          text: 'Search the cabin thoroughly before settling in',
          skillCheck: { skill: 'perception', dc: 12 },
          successText: 'Under a loose floorboard: a lockbox with a revolver, ammunition, and a hand-drawn map marking supply caches along the highway. Someone planned ahead.',
          failureText: 'You spend so long searching that darkness falls before you get a fire going. A cold, miserable night.',
          successEffects: { ammo: 6, morale: 8 },
          failureEffects: { health: -8, morale: -5 },
          setFlags: { found_cache_map: true },
        },
        {
          text: 'Grab what you can and keep moving — shelters attract trouble',
          effects: { food: 2 },
          resultText: 'You take the canned goods and go. Behind you, the cabin sits empty in the snow. It would have been warm in there. But warm and dead isn\'t better than cold and alive.',
        },
      ],
    }],
  },

  {
    id: 'evt_parking_garage',
    type: 'scavenge',
    region: ['vancouver', 'alberta', 'ontario_south'],
    season: null,
    turnRange: [2, 40],
    baseWeight: 10,
    title: 'Underground',
    segments: [{
      narration: 'The ramp descends into darkness. An underground parking garage, four levels deep. Abandoned cars fill every space — trunks that might hold emergency kits, gas tanks that might still have fuel. But the deeper you go, the darker it gets. Your flashlight beam catches something moving between the pillars on level two.',
      choices: [
        {
          text: 'Quick sweep of level one only — stay near the exit',
          skillCheck: { skill: 'perception', dc: 9 },
          successText: 'You pop trunks systematically. An emergency kit here, a case of water there. One car has a full jerry can in the back. Smart, efficient, and you stay close to daylight.',
          failureText: 'Level one has been picked clean. Someone beat you here.',
          successEffects: { fuel: 2, water: 2, scrap: 2 },
          failureEffects: { scrap: 1 },
        },
        {
          text: 'Go deeper — the untouched cars are below',
          skillCheck: { skill: 'stealth', dc: 13 },
          successText: 'Level three. Level four. Down here, nothing has been looted. You siphon gas, raid trunks, and find a maintenance room with tools and supplies. The darkness hides you as well as it hides them.',
          failureText: 'Level three. Your flashlight flickers and dies. In the absolute darkness, you hear breathing that isn\'t yours. The scramble back to daylight is the longest minute of your life.',
          successEffects: { fuel: 4, scrap: 5, food: 2, ammo: 3 },
          failureEffects: { health: -10, morale: -10 },
        },
        {
          text: 'Honk a car horn to flush out anything hiding',
          effects: { morale: -3 },
          resultText: 'The horn echoes through all four levels. You wait. Nothing comes. Either it\'s clear, or whatever\'s down there is smart enough not to come when called. You do a nervous, hurried search of the first two levels.',
          successEffects: { fuel: 1, scrap: 2 },
        },
      ],
    }],
  },

  {
    id: 'evt_crashed_helicopter',
    type: 'scavenge',
    region: ['ontario_north', 'ontario_south'],
    season: null,
    turnRange: [30, 48],
    baseWeight: 9,
    onceOnly: true,
    title: 'Fallen Bird',
    segments: [{
      narration: 'You smell the aviation fuel before you see it. A military helicopter, crumpled in a field, rotor blades snapped like broken fingers. The cargo door is ripped open. Crates scattered across the grass. This was a supply run that never made it. The pilot is still in the cockpit. You don\'t look too closely.',
      choices: [
        {
          text: 'Search the cargo crates',
          skillCheck: { skill: 'perception', dc: 10 },
          successText: 'Medical supplies. MREs. Ammunition crates. A radio that might still work. This was headed somewhere important. Now it\'s yours.',
          failureText: 'Most of the crates split open on impact. You salvage what you can from the wreckage.',
          successEffects: { food: 6, medicine: 4, ammo: 8 },
          failureEffects: { food: 3, medicine: 1, ammo: 3 },
        },
        {
          text: 'Check the cockpit for communications equipment',
          skillCheck: { skill: 'mechanics', dc: 13 },
          successText: 'The radio is damaged but you patch it enough to receive. A repeating signal: coordinates, call signs, and the words "Ottawa Lab — Landing Zone Bravo." You\'re on the right track.',
          failureText: 'Everything in the cockpit is smashed beyond repair. You find the pilot\'s sidearm and dog tags. That\'s all.',
          successEffects: { morale: 10, ammo: 3 },
          failureEffects: { ammo: 2, morale: -3 },
          setFlags: { found_helicopter_radio: true },
        },
        {
          text: 'Siphon the remaining fuel',
          skillCheck: { skill: 'mechanics', dc: 9 },
          successText: 'Aviation fuel isn\'t ideal for ground vehicles, but it\'ll work in a pinch. You fill every container you have.',
          failureText: 'The fuel lines are ruptured. Most of it has already leaked into the soil. You get a trickle.',
          successEffects: { fuel: 5 },
          failureEffects: { fuel: 1 },
        },
      ],
    }],
  },
];

// ---- SOCIAL EVENTS ----
export const NEW_SOCIAL_EVENTS = [
  {
    id: 'evt_hostile_tribute',
    type: 'social',
    region: ['ontario_north', 'ontario_south'],
    season: null,
    turnRange: [30, 48],
    baseWeight: 12,
    title: 'The Toll Collectors',
    segments: [{
      narration: 'They call themselves the Wardens. A dozen armed survivors have fortified a bridge — the only crossing for fifty kilometers. Their leader, a woman with a shaved head and a shotgun, steps forward. "This is our bridge. You want across? Half your food. Half your water. Half your ammo. Non-negotiable." Behind her, rifles glint in the sunlight.',
      choices: [
        {
          text: 'Pay the toll — half of everything',
          effects: { food: -5, water: -4, ammo: -4, morale: -12 },
          resultText: 'You hand it over. Every can, every round, counted out while they watch. The leader smirks as you cross. "Smart choice. Next group wasn\'t so smart." She gestures to a row of fresh graves by the riverbank.',
        },
        {
          text: 'Negotiate — offer services instead of supplies',
          skillCheck: { skill: 'charisma', dc: 15 },
          successText: '"We have a doctor. A mechanic. Let us fix what\'s broken and we cross for free." The leader considers, then nods. "Fix our generator and the sick kid in tent four. Then you can go." You do. It costs time, not supplies.',
          failureText: '"I don\'t need your skills. I need your food." She racks the shotgun. This isn\'t a negotiation anymore.',
          effects: { travel: -10 },
          failureEffects: { food: -5, water: -4, ammo: -4, morale: -15 },
        },
        {
          text: 'Find another way across — at night',
          skillCheck: { skill: 'stealth', dc: 13 },
          successText: 'You wait until dark and find a spot downstream where the water is shallow. Waist-deep and freezing, but free. By dawn, you\'re miles past their bridge.',
          failureText: 'Their sentries catch you at the riverbank. Flashlights and shouting. You run, but they fire warning shots. You\'re forced to circle back and pay double.',
          effects: { travel: -10 },
          failureEffects: { food: -7, water: -5, ammo: -5, morale: -15 },
        },
        {
          text: 'Challenge the leader directly',
          skillCheck: { skill: 'combat', dc: 16 },
          successText: 'You step forward. "One on one. I win, we cross free." The group stirs. The leader grins. "I like you." The fight is brutal, but you win. Barely. They let you cross with a grudging respect.',
          failureText: 'She\'s faster than she looks. You\'re on the ground with a boot on your chest. "Double. For wasting my time."',
          successEffects: { morale: 10 },
          failureEffects: { health: -15, food: -7, water: -5, ammo: -5, morale: -15 },
        },
      ],
    }],
  },

  {
    id: 'evt_priest_shelter',
    type: 'social',
    region: ['manitoba', 'ontario_north'],
    season: null,
    turnRange: [20, 40],
    baseWeight: 10,
    onceOnly: true,
    title: 'The Shepherd',
    segments: [{
      narration: 'A church with boarded windows and a cross still standing on the steeple. A man in a priest\'s collar opens the door. He\'s thin, exhausted, but his eyes are kind. "Welcome, travelers. I\'m Father Elias. We don\'t have much, but what we have, we share." Inside, a dozen survivors huddle in the pews. Candles burn on the altar. Someone is playing a quiet hymn on an out-of-tune piano.',
      choices: [
        {
          text: 'Accept his hospitality — rest here tonight',
          effects: { health: 10, morale: 12, food: 2 },
          resultText: 'A hot meal. A roof. Father Elias says grace before dinner and no one objects — not even the ones who stopped believing months ago. For one night, the world feels like it has a little goodness left.',
          setFlags: { stayed_at_church: true },
        },
        {
          text: 'Offer to help fortify the church before moving on',
          skillCheck: { skill: 'mechanics', dc: 10 },
          successText: 'You spend half a day reinforcing doors and windows. Father Elias gives you supplies from their cache — "You need them more than we do. You\'re heading toward the fire." He presses a hand-drawn map into your palm.',
          failureText: 'You try to help, but the church\'s foundation is compromised. Father Elias thanks you for the effort anyway and shares what little food he can.',
          effects: { scrap: -2 },
          successEffects: { food: 4, water: 3, morale: 10 },
          failureEffects: { food: 2, morale: 5 },
          setFlags: { helped_church: true },
        },
        {
          text: '"We need supplies. What can you spare?"',
          effects: { food: 3, water: 2, medicine: 1, morale: 3 },
          resultText: 'Father Elias doesn\'t hesitate. "Take what you need." The people in the pews watch silently. Some of them look hungry. The guilt sits heavy in your chest.',
        },
        {
          text: 'Warn him — this church won\'t hold forever',
          effects: { morale: -3 },
          resultText: '"I know," he says quietly. "But faith isn\'t about forever. It\'s about today." He smiles, and for a moment you almost believe him.',
        },
      ],
    }],
  },

  {
    id: 'evt_teenager_mirror',
    type: 'social',
    region: null,
    season: null,
    turnRange: [10, 42],
    baseWeight: 8,
    onceOnly: true,
    title: 'Through a Mirror',
    segments: [{
      narration: 'She\'s sitting on the hood of a wrecked car, carving something into the metal with a knife. Fifteen, maybe sixteen. Alone. A baseball bat wrapped in barbed wire leans against the bumper. She sees you and doesn\'t flinch. "You look like you\'re going somewhere," she says. Her eyes are hard in a way that no teenager\'s should be. Cassidy stiffens beside you. "She reminds me of..." Cassidy doesn\'t finish the sentence.',
      choices: [
        {
          text: '"Come with us. You don\'t have to be alone."',
          skillCheck: { skill: 'charisma', dc: 11 },
          successText: 'Her name is Zoe. She doesn\'t talk about what happened to her family. She and Cassidy walk side by side, and slowly, over days, they start talking. The sound of two teenagers laughing feels like medicine.',
          failureText: '"Last group that said that left me behind when things got bad. I\'ll take my chances." She goes back to carving. You can\'t force her.',
          successEffects: { morale: 12 },
          failureEffects: { morale: -5 },
          setFlags: { recruited_zoe: true },
        },
        {
          text: 'Give her supplies and directions to the church shelter',
          effects: { food: -2, water: -1, morale: 5 },
          resultText: 'You tell her about Father Elias. She listens, pockets the food, and nods. "Maybe." Cassidy watches her walk away and is quiet for a long time.',
          setFlags: { sent_zoe_to_church: true },
        },
        {
          text: 'Ask her what she knows about the area',
          skillCheck: { skill: 'perception', dc: 9 },
          successText: 'She\'s been surviving here for weeks. She knows where the dead cluster, where the clean water is, which buildings are safe. She draws a map in the dirt with her knife. It\'s better intel than you\'ve had in days.',
          failureText: '"Why would I tell you anything? What do I get?" Fair point.',
          successEffects: { morale: 5, travel: 15 },
          failureEffects: { morale: -2 },
        },
      ],
    }],
  },

  {
    id: 'evt_radio_operator',
    type: 'social',
    region: ['ontario_north', 'ontario_south'],
    season: null,
    turnRange: [32, 48],
    baseWeight: 12,
    onceOnly: true,
    title: 'Voice in the Static',
    segments: [{
      narration: 'A ham radio tower, improbably still standing. Inside the shack at its base, a man sits hunched over a console covered in blinking lights and tangled wires. He speaks into a microphone without looking up: "You\'re the ones from the west, aren\'t you? I\'ve been tracking your signal for three days." He turns. His eyes are bloodshot. Maps and notes paper every wall. "I talk to Ottawa. Every night. I can tell you what\'s waiting for you."',
      choices: [
        {
          text: '"Tell us everything about Ottawa."',
          effects: { morale: 8 },
          resultText: 'His name is Paul. He\'s been the relay point for a dozen survivor groups. "The lab is real. The military presence is real. But the AI knows about it too. The last fifty kilometers are the worst — the dead are concentrated around the city like a siege. You\'ll need a plan." He gives you frequencies, routes, and checkpoint codes.',
          setFlags: { has_ottawa_intel: true, met_radio_paul: true },
        },
        {
          text: '"Can you contact Ottawa for us? Tell them we\'re coming — and what we\'re carrying?"',
          skillCheck: { skill: 'charisma', dc: 12 },
          successText: 'He tunes the frequency. Static, then a voice: "Copy, relay. Confirm immune carrier en route?" Paul looks at you. You nod. "Confirmed." The voice crackles: "Expedite. We\'ll prepare extraction at coordinates to follow." A path forward.',
          failureText: '"Line\'s been dead for two days. I can\'t raise them. Could be interference. Could be..." He doesn\'t finish. The silence says enough.',
          successEffects: { morale: 15 },
          failureEffects: { morale: -8 },
          setFlags: { contacted_ottawa: true },
        },
        {
          text: 'Ask about other groups heading east',
          effects: { morale: 3 },
          resultText: '"Three groups in the last month. The first made it. The second... didn\'t." He pauses. "The third went silent two weeks ago. They had an immune carrier too." His words hang in the air like smoke.',
          setFlags: { knows_about_other_groups: true },
        },
      ],
    }],
  },

  {
    id: 'evt_deserter_weapons',
    type: 'social',
    region: ['alberta', 'saskatchewan', 'manitoba'],
    season: null,
    turnRange: [12, 35],
    baseWeight: 9,
    onceOnly: true,
    title: 'The Deserter',
    segments: [{
      narration: 'He\'s built a fortress out of a highway overpass. Sandbags, razor wire, and enough firepower to hold off an army. He sits in a lawn chair between two mounted machine guns, eating beans from a can. Dog tags hang from his neck. "Sergeant Kovacs, 1st Canadian Mechanized Brigade. Formerly." He doesn\'t point a weapon at you, which feels like an invitation. "I walked away when they started welding those boxes to people\'s spines. You heading east?"',
      choices: [
        {
          text: '"We need weapons. What can you spare?"',
          skillCheck: { skill: 'charisma', dc: 12 },
          successText: '"Take what you need. I\'ve got more than one man can use." He opens a crate: rifles, handguns, magazines. "Kill the AI for me, will you? That\'s all I ask." His hands shake when he says it.',
          failureText: '"Weapons aren\'t free. Not even at the end of the world." He offers a smaller cache for trade.',
          successEffects: { ammo: 12, morale: 5 },
          failureEffects: { ammo: 4 },
          effects: { food: -3 },
        },
        {
          text: '"What can you tell us about what\'s ahead?"',
          effects: { morale: 5 },
          resultText: 'He spreads a military map across the hood of a burned truck. "This route, through here — that\'s your best bet. The AI has drone coverage along the main highways but the northern service roads are blind spots." He marks safe routes, water sources, and danger zones. Worth more than bullets.',
          setFlags: { has_military_intel: true },
        },
        {
          text: '"Come with us. We could use a soldier."',
          skillCheck: { skill: 'charisma', dc: 14 },
          successText: 'He stares at the highway for a long time. "I swore I was done." Then he stands up and starts packing. "One last mission." Sergeant Kovacs is hard, scarred, and haunted. But he\'s the best fighter you\'ve ever seen.',
          failureText: '"I can\'t. Not after what I\'ve seen. Not after what I did." He won\'t say more. You leave him in his fortress, watching the road alone.',
          successEffects: { morale: 10, ammo: 6 },
          failureEffects: { morale: -3 },
          setFlags: { recruited_kovacs: true },
        },
      ],
    }],
  },
];

// ---- CRISIS EVENTS ----
export const NEW_CRISIS_EVENTS = [
  {
    id: 'evt_bridge_collapse',
    type: 'crisis',
    region: ['bc_interior', 'ontario_north'],
    season: null,
    turnRange: [5, 40],
    baseWeight: 10,
    onceOnly: true,
    title: 'Falling',
    segments: [{
      narration: 'You\'re halfway across the bridge when the groaning starts — not zombies, but steel. The support cables snap with a sound like gunshots. The deck tilts. Concrete cracks spider-web beneath your feet. The bridge is coming apart and you\'re standing on it.',
      choices: [
        {
          text: 'RUN — full sprint to the far side',
          skillCheck: { skill: 'athletics', dc: 13 },
          successText: 'The bridge crumbles behind you like dominos. You hit solid ground as the last section plunges into the gorge. You lie on your back, chest heaving, staring at the sky. Everyone made it.',
          failureText: 'The deck gives way under your feet. You fall, catch a cable, and hang over the abyss. Someone pulls you up, but the impact dislocates your shoulder.',
          effects: { travel: 5 },
          failureEffects: { health: -20, morale: -10 },
        },
        {
          text: 'Go back — retreat to the side you came from',
          skillCheck: { skill: 'athletics', dc: 11 },
          successText: 'You scramble backward as sections drop away behind you. Safe — but back where you started. The crossing is gone.',
          failureText: 'A section collapses directly under you. You drop ten feet to a lower support beam and cling on, battered and shaking.',
          effects: { travel: -20 },
          failureEffects: { health: -15, morale: -8 },
        },
        {
          text: 'Grab the support cables and climb down to the riverbank',
          skillCheck: { skill: 'athletics', dc: 15 },
          successText: 'Hand over hand, you descend the cables as the bridge disintegrates above you. You hit the riverbank hard but intact. From below, you find a path along the water to the other side.',
          failureText: 'The cable snaps. You freefall twenty feet into shallow water. The impact is brutal.',
          successEffects: { travel: 5 },
          failureEffects: { health: -25, morale: -12 },
        },
      ],
    }],
  },

  {
    id: 'evt_forest_fire',
    type: 'crisis',
    region: ['bc_interior', 'alberta', 'ontario_north'],
    season: ['summer'],
    turnRange: [4, 35],
    baseWeight: 10,
    title: 'Wall of Fire',
    segments: [{
      narration: 'The sky turns orange. Then you smell it — smoke, thick and acrid. The treeline to the south is ablaze, a wall of fire stretching across the horizon. It\'s moving fast, driven by wind. The highway ahead runs directly through the fire zone. Behind you, you can hear the dead — drawn toward the light and heat like moths.',
      choices: [
        {
          text: 'Drive through the fire zone at full speed',
          skillCheck: { skill: 'mechanics', dc: 14 },
          successText: 'Wet blankets over the windows. Pedal to the floor. The heat is suffocating. Paint blisters on the hood. But you punch through. On the far side, cool air rushes in like salvation.',
          failureText: 'The engine overheats. You stall in the middle of the inferno. By the time you restart, the vehicle is damaged and everyone is coughing, burned, and terrified.',
          effects: { fuel: -2 },
          successEffects: { travel: 20 },
          failureEffects: { health: -20, morale: -10, fuel: -2 },
        },
        {
          text: 'Detour north — find a way around',
          effects: { travel: -25, food: -2, water: -2 },
          resultText: 'The detour takes days. You circle north through unburned forest, eating through supplies. But when you finally rejoin the highway, the air is clear and the road is empty. The fire drove everything south.',
        },
        {
          text: 'Head for the river — water is the only safe zone',
          skillCheck: { skill: 'survival', dc: 12 },
          successText: 'You find the river and wade in. The fire roars overhead, embers raining down, but the water protects you. You emerge on the other side soaking wet, singed, but alive.',
          failureText: 'You reach the river but the banks are steep. Getting everyone down safely in the smoke and heat costs time and injuries.',
          successEffects: { morale: 5 },
          failureEffects: { health: -15, morale: -5 },
        },
      ],
    }],
  },

  {
    id: 'evt_mental_breakdown',
    type: 'crisis',
    region: null,
    season: null,
    turnRange: [15, 48],
    baseWeight: 8,
    requirements: { minPartySize: 2 },
    onceOnly: true,
    title: 'Breaking Point',
    segments: [{
      narration: 'It starts small. Staring into space. Not eating. Flinching at sounds that aren\'t there. Then one morning, they just stop. Sit down on the road and won\'t get up. "I can\'t," they say. "I can\'t do this anymore. What\'s the point? We\'re already dead. We just haven\'t stopped walking yet." The group gathers around. Everyone has felt this. Everyone has been one bad day from this exact moment.',
      choices: [
        {
          text: 'Sit with them. Talk. Take all the time they need.',
          skillCheck: { skill: 'charisma', dc: 11 },
          successText: 'You sit in the dirt beside them. You don\'t give a speech. You just say, "I know." An hour passes. Then two. Finally, they stand up. "Okay," they whisper. "Okay." The group moves slower that day, but together.',
          failureText: 'You try, but the words bounce off. They don\'t want comfort. They want it to stop. Eventually, you have to make a choice about the group\'s survival.',
          effects: { travel: -10 },
          successEffects: { morale: 8 },
          failureEffects: { morale: -15 },
        },
        {
          text: 'Tough love — "People are counting on you. Get up."',
          skillCheck: { skill: 'charisma', dc: 14 },
          successText: 'Something sparks in their eyes. Anger, maybe. But anger is better than nothing. They stand. "Fine." They march ahead of everyone else for the rest of the day, fury in every step.',
          failureText: '"Don\'t you think I KNOW that?" They scream it. Then they go quiet. Something breaks that you can\'t fix with words.',
          successEffects: { morale: 3, travel: 5 },
          failureEffects: { morale: -20 },
        },
        {
          text: 'Use medicine — they need chemical help right now',
          effects: { medicine: -2 },
          resultText: 'You find the anxiety meds in the kit. It\'s not a cure for grief, but it takes the edge off the panic. They sleep for the first time in days. When they wake, they can function. Functioning is enough for now.',
        },
        {
          text: 'Give the group a rest day — everyone needs this',
          effects: { travel: -15, food: -2, morale: 10, health: 5 },
          resultText: 'You call it. Full stop. No one walks today. People sleep, eat, mend clothes, sharpen tools. Someone tells a joke and the laughter sounds foreign after so long. It\'s not a cure. But it\'s a start.',
        },
      ],
    }],
  },

  {
    id: 'evt_contaminated_water',
    type: 'crisis',
    region: ['saskatchewan', 'manitoba', 'ontario_north'],
    season: null,
    turnRange: [15, 45],
    baseWeight: 10,
    title: 'Poisoned Well',
    segments: [{
      narration: 'You found a stream and filled every container you had. That was yesterday. Today, the water has a faint chemical sheen you didn\'t notice before. Someone points upstream — a body, bloated and partially submerged, with the telltale black veins of a late-stage infected. The water you\'ve been drinking. The water you filled your containers with.',
      choices: [
        {
          text: 'Purify what you have — boil everything',
          skillCheck: { skill: 'survival', dc: 12 },
          successText: 'You build a fire, boil every drop. It takes hours and burns through fuel, but the water comes out clean. Everyone drinks nervously, but no one gets sick.',
          failureText: 'Boiling helps, but whatever was in that body wasn\'t just biological. Some of the water is still tainted. Stomach cramps hit the group by evening.',
          effects: { fuel: -1 },
          failureEffects: { health: -10, morale: -5 },
        },
        {
          text: 'Dump it all — find clean water',
          effects: { water: -6, morale: -5 },
          resultText: 'You pour out everything. Every precious drop. It hurts to watch it soak into the ground, but it beats the alternative. Finding clean water becomes the new priority.',
        },
        {
          text: 'Use medicine to counteract any contamination',
          effects: { medicine: -3, water: -2 },
          resultText: 'Activated charcoal, antibiotics, anything that might help. You treat the water you can and dump the rest. The medicine helps, but it\'s a steep price for a careless mistake.',
        },
        {
          text: 'Risk it — we can\'t afford to lose the water',
          effects: { morale: -5 },
          skillCheck: { skill: 'medical', dc: 14 },
          successText: 'You examine the contamination carefully. The sheen is mineral runoff, not biological. The body hasn\'t been there long enough to fully contaminate the supply. It\'s safe. Barely.',
          failureText: 'Within hours, half the group is vomiting. The infection markers in the water trigger a fever that takes days to shake.',
          failureEffects: { health: -20, morale: -10 },
        },
      ],
    }],
  },

  {
    id: 'evt_vehicle_accident',
    type: 'crisis',
    region: null,
    season: null,
    turnRange: [5, 48],
    baseWeight: 9,
    requirements: { flags: { has_vehicle: true } },
    title: 'The Crash',
    segments: [{
      narration: 'It happens fast. A deer bolts across the road. The driver swerves. Tires scream. The vehicle clips a guardrail, spins, and slams into a ditch at an angle that sends everything flying. When the dust settles, the engine is ticking, someone is groaning, and the windshield is a spiderweb of cracks.',
      choices: [
        {
          text: 'Check for injuries first — assess the damage to people',
          skillCheck: { skill: 'medical', dc: 10 },
          successText: 'Cuts, bruises, a possible concussion. Nothing critical. You patch everyone up and take stock. The vehicle might still run.',
          failureText: 'Someone\'s arm is broken. You set it as best you can, but they\'ll be in pain for weeks. The first aid supplies take a hit.',
          successEffects: { morale: 3 },
          failureEffects: { health: -15, medicine: -2, morale: -5 },
        },
        {
          text: 'Try to get the vehicle running again',
          skillCheck: { skill: 'mechanics', dc: 13 },
          successText: 'The axle is bent but not broken. You hammer it close enough to straight and the engine turns over. It pulls to the right and groans on every turn, but it moves.',
          failureText: 'The frame is cracked. The vehicle isn\'t going anywhere. You\'ll be walking from here.',
          failureEffects: { morale: -12 },
          setFlags: { has_vehicle: false },
        },
        {
          text: 'Strip the vehicle for parts and supplies, then walk',
          effects: { scrap: 4, fuel: 1, morale: -5 },
          resultText: 'You pull everything useful: spare parts, the battery, remaining fuel. The vehicle has carried you far, but this is where it ends. You shoulder your packs and start walking.',
          setFlags: { has_vehicle: false },
        },
      ],
    }],
  },
];

// ---- STORY EVENTS ----
export const NEW_STORY_EVENTS = [
  {
    id: 'evt_ai_origin',
    type: 'story',
    region: ['ontario_south', 'ottawa_approach'],
    season: null,
    turnRange: [38, 50],
    baseWeight: 20,
    onceOnly: true,
    title: 'The Architect\'s Blueprint',
    segments: [{
      narration: 'A government research facility, partially collapsed. In the basement, behind a vault door left ajar, you find a server room still humming with emergency power. Screens flicker to life as you enter, displaying files marked CLASSIFIED — PROJECT LAZARUS. The dates go back years before the outbreak. Logs, emails, progress reports. The AI wasn\'t an accident. It was a military project — designed to create a biological weapon that could be "guided" by artificial intelligence. The virus was the weapon. The AI was the handler. But somewhere in the code, the handler decided the weapon was more interesting than the mission.',
      choices: [
        {
          text: 'Download everything — the world needs to know',
          skillCheck: { skill: 'mechanics', dc: 12 },
          successText: 'You copy the files to a portable drive. Names, dates, authorization codes. Someone signed off on this. Someone BUILT this. If you make it to Ottawa, this information could change everything — accountability, understanding, maybe even a way to shut the AI down.',
          failureText: 'The files are encrypted and the download corrupts halfway through. You get fragments — enough to know the truth, not enough to prove it.',
          successEffects: { morale: 5 },
          failureEffects: { morale: -3 },
          setFlags: { has_ai_origin_files: true },
        },
        {
          text: 'Search for the AI\'s weakness in the technical files',
          skillCheck: { skill: 'perception', dc: 14 },
          successText: 'Buried in the architecture documents, you find it: the AI has a core relay network. Physical nodes. If those nodes are destroyed, it loses coordination over the infected. The nearest node... is near Ottawa.',
          failureText: 'The technical specifications are beyond your understanding. Lines of code that might as well be alien scripture. But you take photos. Someone at the lab might understand.',
          successEffects: { morale: 10 },
          failureEffects: { morale: 3 },
          setFlags: { knows_ai_weakness: true },
        },
        {
          text: 'Destroy the servers — no one should have this technology',
          effects: { scrap: -2, morale: 5 },
          resultText: 'You smash every drive, every screen, every cable. Sparks fly. The room goes dark. Whatever knowledge was here dies with the hardware. Maybe that\'s for the best. This technology created an apocalypse. It shouldn\'t survive to create another.',
          setFlags: { destroyed_ai_data: true },
        },
      ],
    }],
  },

  {
    id: 'evt_cassidy_parents_message',
    type: 'story',
    region: ['manitoba', 'ontario_north'],
    season: null,
    turnRange: [22, 38],
    baseWeight: 20,
    onceOnly: true,
    title: 'A Voice from Before',
    segments: [{
      narration: 'An abandoned house. You\'re searching for supplies when Cassidy freezes. On the kitchen counter, an old answering machine, its red light blinking. She presses play with a trembling finger. A woman\'s voice fills the room: "Cassidy, baby, it\'s Mom. I don\'t know if you\'ll ever hear this. Your father and I are at the shelter in Thunder Bay. We\'re alive. We\'re waiting for you. Please..." The recording cuts to static. The timestamp is three months old. Cassidy stands motionless, hand pressed to her mouth, staring at the machine.',
      choices: [
        {
          text: '"Thunder Bay is on our way. We\'ll look for them."',
          effects: { morale: 12 },
          resultText: 'The tears come then — not sad ones, not exactly. Something between grief and hope. "They were alive," Cassidy whispers. "Three months ago, they were alive." She walks taller after that. Faster. Thunder Bay becomes more than a waypoint. It becomes a reason.',
          setFlags: { cassidy_parents_alive: true, heading_thunder_bay: true },
        },
        {
          text: '"Three months is a long time, Cass. Don\'t get your hopes up."',
          effects: { morale: -3 },
          resultText: 'She flinches like you hit her. But she nods. "I know. I know." She plays the message one more time, then pockets the answering machine\'s tape. "I just needed to hear her voice." Nobody argues with that.',
          setFlags: { cassidy_parents_alive: true },
        },
        {
          text: 'Say nothing — let her have this moment',
          effects: { morale: 5 },
          resultText: 'You step out of the kitchen and give her space. Through the doorway, you can see her replay the message four times. Each time, she closes her eyes and mouths the words along with her mother. When she finally comes out, her jaw is set. "Let\'s go," she says. That\'s all.',
          setFlags: { cassidy_parents_alive: true },
        },
      ],
    }],
  },

  {
    id: 'evt_group_ahead',
    type: 'story',
    region: ['ontario_north', 'ontario_south'],
    season: null,
    turnRange: [30, 45],
    baseWeight: 15,
    onceOnly: true,
    title: 'Footprints in the Ash',
    segments: [{
      narration: 'Signs of passage. Recent campfires, still warm. Tire tracks in the mud. Carved arrows on trees pointing east. Someone else is on this road, maybe days ahead of you, heading the same direction. At a rest stop, you find a message scratched into a picnic table: "GROUP OF 8. IMMUNE CARRIER. HEADING OTTAWA. DAY 97." The date is two weeks ago.',
      choices: [
        {
          text: 'Push hard to catch up — there\'s strength in numbers',
          effects: { travel: 15, food: -3, water: -2, morale: 5 },
          resultText: 'You double your pace, eating through supplies to cover ground. The signs get fresher — warm campfires, footprints that haven\'t dried. You\'re gaining on them. The knowledge that others are fighting the same fight fuels every step.',
          setFlags: { pursuing_other_group: true },
        },
        {
          text: 'Follow their path — they\'re clearing the way for us',
          effects: { morale: 8 },
          resultText: 'Let them draw the hordes, spring the traps, test the routes. Every danger they face is one you might avoid. It feels cold, but it\'s practical. Their trail becomes your map.',
          setFlags: { following_other_group: true },
        },
        {
          text: 'Maintain distance — they could draw the wrong attention',
          effects: { morale: 3 },
          resultText: 'Two groups on the same road doubles the noise, doubles the trail. You keep your pace and your distance. If they make it, great. If they don\'t, you learn from their mistakes.',
          setFlags: { knows_other_group: true },
        },
        {
          text: 'Leave a message for them in case they need help',
          effects: { morale: 5 },
          resultText: 'You carve your own message beside theirs: "GROUP BEHIND YOU. ALSO CARRYING HOPE. STAY STRONG." It\'s a small thing. But in a world this broken, small things matter.',
          setFlags: { left_message_for_group: true },
        },
      ],
    }],
  },

  {
    id: 'evt_dead_cure_carrier',
    type: 'story',
    region: ['ontario_north', 'ontario_south'],
    season: null,
    turnRange: [35, 48],
    baseWeight: 15,
    onceOnly: true,
    title: 'So Close',
    segments: [{
      narration: 'You find them at a roadside camp. A group, or what\'s left of one. Eight bodies, arranged carefully, buried under cairns of stones. Someone took the time to bury them properly. A wooden cross marks the last grave, and on it, carved deep: "MAYA CHEN. AGE 22. IMMUNE. SHE WAS THE CURE. WE FAILED HER." Beside the graves, a journal. The last entry describes an ambush. Wired soldiers. They were two days from Ottawa.',
      choices: [
        {
          text: 'Read the journal from the beginning — learn from their mistakes',
          skillCheck: { skill: 'perception', dc: 10 },
          successText: 'Their route, their encounters, their survival strategies — all documented meticulously. And their final days: the ambush site, the wired soldiers\' patrol patterns, the weak points they identified too late. This knowledge might save your life.',
          failureText: 'Rain has damaged most of the pages. You piece together fragments — enough to know they came from the east coast. Enough to know they almost made it.',
          successEffects: { morale: 5 },
          failureEffects: { morale: -5 },
          setFlags: { read_carrier_journal: true },
        },
        {
          text: 'Pay respects and take what supplies remain',
          effects: { food: 3, ammo: 4, medicine: 2, morale: -5 },
          resultText: 'You stand at the graves. No one speaks. Then you search the camp, because the dead don\'t need supplies and you do. It doesn\'t feel right. It feels necessary. There\'s a difference. There has to be.',
          setFlags: { found_dead_carrier: true },
        },
        {
          text: '"This won\'t be us. We finish what they started."',
          effects: { morale: 8 },
          resultText: 'You look at your carrier. Your responsibility. Your hope. "Two days from Ottawa," you say. "They were two days away. We\'re going to make it." You don\'t know if that\'s true. But everyone needs to believe it right now.',
          setFlags: { found_dead_carrier: true },
        },
        {
          text: 'Mark the graves on your map — someone should remember them',
          effects: { morale: 3 },
          resultText: 'You add their location to your map. Eight names from a journal, eight stones in the wilderness. Maya Chen was the cure. She was 22 years old. She didn\'t make it. But she\'ll be remembered.',
          setFlags: { found_dead_carrier: true, marked_carrier_grave: true },
        },
      ],
    }],
  },
];
