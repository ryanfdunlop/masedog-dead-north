// ============================================================
// MASEDOG: Dead North — Chapter 3: Alberta
// Weeks 11-18 | Region: alberta
// The prairies begin. Cities are graveyards. The AI adapts.
// ============================================================

export const CHAPTER_3_EVENTS = [
  // ---- Event 1: Calgary Outskirts ----
  {
    id: 'evt_ch3_calgary',
    type: 'story',
    region: ['alberta'],
    season: null,
    turnRange: [11, 14],
    baseWeight: 35,
    onceOnly: true,
    title: 'The Towers of the Dead',
    segments: [{
      narration: 'Calgary rises from the prairie like a graveyard of glass and steel. The downtown core is visible from twenty kilometers out, and even from here you can see them — shadows moving behind every window, filling every floor of every tower. Thousands. Tens of thousands. The city is a hive.\n\nBut the outskirts tell a different story. Suburban sprawl stretches in every direction, and the dead are sparse here — spread thin across too many cul-de-sacs to form a real threat. The houses are mostly untouched. Supplies, shelter, medicine — everything you need is sitting behind unlocked doors.\n\nDr. Reyes studies the skyline through binoculars. "If we cut through the southern suburbs, we can resupply and be past the city by nightfall. But if we are spotted from downtown..." He trails off. You understand. The hive will send everything it has.\n\nCassidy points at a strip mall a kilometer away. "Shoppers Drug Mart. Pharmacy. If there are antibiotics left, Violet needs them."',
      choices: [
        {
          text: 'Hit the pharmacy. Violet\'s health comes first.',
          skillCheck: { skill: 'stealth', dc: 13 },
          successText: 'You move through the suburbs like you belong there. The pharmacy is ransacked but not cleaned out — the looters took painkillers and left the antibiotics. Dr. Reyes fills his bag with amoxicillin, bandages, saline solution, and a blood pressure cuff. "Christmas morning," he whispers. Violet gets her first real dose of medicine in weeks. The color starts returning to her cheeks by evening.',
          failureText: 'The pharmacy alarm is still running on battery backup. The moment you force the door, it screams into the silence. You have ninety seconds before the hive hears. You grab what you can — hands shaking, shoving bottles into your pack without reading labels — and run. Behind you, a wave of shadows begins pouring from downtown.',
          successEffects: { medicine: 5, health: 10, morale: 10 },
          failureEffects: { medicine: 2, morale: -10 },
          setFlags: { raided_calgary_pharmacy: true },
        },
        {
          text: 'Skirt the city entirely. Not worth the risk.',
          effects: { travel: -10, morale: -5 },
          resultText: 'You add two days to the journey by swinging wide around Calgary\'s southern edge. The detour takes you through empty farmland and one ghost town where the only sound is a screen door banging in the wind. Violet watches the city recede with hollow eyes. She needed those supplies. You both know it.',
          setFlags: { avoided_calgary: true },
        },
        {
          text: 'Send a small team while the rest wait at a safe distance.',
          skillCheck: { skill: 'perception', dc: 11 },
          successText: 'You and Dr. Reyes move fast and quiet. The suburbs yield canned food, bottled water, and a hunting rifle with a box of shells from a garage workshop. The pharmacy provides what Violet needs. You are back before the hive stirs. Cassidy has a fire going and something that almost counts as dinner.',
          failureText: 'You misjudge the distance. By the time you reach the strip mall, the light is fading and the dead are waking. You grab what you can and sprint back, but the noise draws a pack of Runners. Dr. Reyes takes a hit covering your retreat — a deep scratch along his forearm. He says it is nothing. But you see the way he stares at the wound.',
          successEffects: { food: 4, medicine: 3, ammo: 3, morale: 5 },
          failureEffects: { medicine: 2, morale: -8 },
          setFlags: { scouted_calgary: true, reyes_scratched: false },
        },
      ],
    }],
  },

  // ---- Event 2: The Moral Dilemma ----
  {
    id: 'evt_ch3_moral_choice',
    type: 'story',
    region: ['alberta'],
    season: null,
    turnRange: [13, 16],
    baseWeight: 35,
    onceOnly: true,
    title: 'The Family at the Crossroads',
    segments: [{
      narration: 'You hear the screaming from half a kilometer away.\n\nA family — a man, a woman, and a boy no older than eight — trapped on the roof of a gas station. Below them, a pack of fifteen Shamblers circles the building, clawing at the walls. The woman is holding a baby. The man is throwing anything he can find off the roof — chunks of concrete, a fire extinguisher, a toolbox. It is not working.\n\nThe boy sees you. He waves his arms. "HELP! PLEASE HELP US!"\n\nDr. Reyes does the math out loud. "Fifteen Shamblers. Four of us with limited weapons. If we engage, we risk everything." He is not saying no. He is making sure you understand the price.\n\nViolet stares at the boy. Her hand finds yours. "He is eight," she says. That is all she says.\n\nCassidy is already scanning for a way in. "There is a delivery entrance on the back side. If someone draws them to the front, someone else could get the family out the back."',
      choices: [
        {
          text: 'Full rescue. Draw them off, get the family out.',
          skillCheck: { skill: 'combat', dc: 13 },
          successText: 'Cassidy bangs a pot against a dumpster while you and Dr. Reyes charge the back entrance. The family scrambles down a maintenance ladder. The man — his name is Deepak — grabs your arm with both hands. "Thank you. God, THANK you." His wife, Priya, is already moving, baby clutched to her chest. The boy, Arjun, runs to Cassidy and hugs her before she can react. For a moment, in the chaos, there is something beautiful.',
          failureText: 'The distraction works but the fight is harder than you planned. Three Shamblers come around the back. You go down swinging — one gets a hand on your jacket before Dr. Reyes puts a tire iron through its skull. The family escapes, but you are bleeding and the horde is regrouping.',
          successEffects: { morale: 20 },
          failureEffects: { health: -15, morale: 10 },
          setFlags: { saved_family: true, met_deepak: true },
        },
        {
          text: 'Create a path and guide them to safety, but we cannot take them with us.',
          effects: { morale: -5 },
          resultText: 'You use noise to draw the Shamblers east while the family climbs down. Deepak wants to come with you. You explain: Violet is sick, you are low on food, you are heading into the prairies where there is nothing. His face falls, but he nods. Priya gives you a can of formula. "We do not need it," she says, looking at the baby. "She is on breast milk." The gesture breaks something in you. You take the can and walk away.',
          setFlags: { helped_family_partially: true },
        },
        {
          text: 'We cannot help them. Fifteen Shamblers would kill us all.',
          effects: { morale: -20 },
          resultText: 'You pull everyone behind a dumpster and wait. The family screams for twenty minutes. Then they stop screaming. Violet will not look at you for two days. Cassidy does not speak for three. Dr. Reyes says nothing, but that night he sits apart from the group, staring at the sky. You saved your people. The math was right. The math does not make it easier.',
          setFlags: { abandoned_family: true },
        },
      ],
    }],
  },

  // ---- Event 3: Prairie Storm ----
  {
    id: 'evt_ch3_prairie_storm',
    type: 'story',
    region: ['alberta'],
    season: null,
    turnRange: [14, 18],
    baseWeight: 30,
    onceOnly: true,
    title: 'The Sky Turns Green',
    segments: [{
      narration: 'The sky turns the color of a bruise — green-black, pulsing with lightning. You have heard about prairie storms but never experienced one. This is not a storm. This is the atmosphere trying to kill you.\n\nThe wind hits like a wall. Cassidy grabs a fence post. Dr. Reyes shields Violet with his body. Hail the size of golf balls punches into the earth around you, each impact like a gunshot.\n\nThrough the chaos, you see a farmhouse — sturdy, stone foundation, maybe three hundred meters away. But between you and it, the open prairie offers zero cover. And beyond the farmhouse, a tornado is forming. A thin grey finger reaching down from the clouds, growing thicker every second.\n\nThe temperature drops twenty degrees in thirty seconds. This is Alberta. This is what it does.',
      choices: [
        {
          text: 'Sprint for the farmhouse. It is our only chance.',
          skillCheck: { skill: 'athletics', dc: 12 },
          successText: 'You run like the world is ending — which it is, again, in a new way. The hail pummels your back. Violet stumbles and you lift her, carrying her the last hundred meters. The farmhouse door is unlocked. You pile inside as the tornado touches down a kilometer to the west. The house shakes but holds. Inside, you find a cellar stocked with canned goods. The family who lived here was prepared for storms, if not for zombies.',
          failureText: 'The hail drives you to the ground fifty meters short. You crawl, dragging Violet, while Cassidy and Dr. Reyes shield you with their bodies. You reach the farmhouse battered and bruised. The tornado misses you by two hundred meters, close enough to rip the roof off the barn next door.',
          successEffects: { food: 4, morale: 10 },
          failureEffects: { health: -15, morale: -5 },
          setFlags: { survived_tornado: true },
        },
        {
          text: 'Find a ditch. Get low. Let the storm pass over.',
          skillCheck: { skill: 'survival', dc: 11 },
          successText: 'You spot a drainage ditch along the highway and dive in, pulling everyone down. The tornado roars overhead like a freight train. The sound is beyond anything you have ever experienced — a scream from the sky itself. Then it passes. You emerge covered in mud, ears ringing, but alive. The farmhouse you might have run to is gone. Scattered across half a kilometer of prairie. You made the right call.',
          failureText: 'The ditch fills with water in seconds. The hail finds you even pressed flat against the earth. Twenty minutes of pure survival — holding Violet above the rising water, shielding your head, praying to anything that might listen. When it ends, you are hypothermic, battered, and missing half your supplies, swept away by the runoff.',
          successEffects: { morale: 5 },
          failureEffects: { health: -20, food: -3, morale: -10 },
          setFlags: { survived_tornado: true },
        },
        {
          text: 'Check the farmhouse for a basement — get underground.',
          skillCheck: { skill: 'perception', dc: 10 },
          successText: 'You reach the farmhouse and find the cellar door on the south side. It is padlocked. Cassidy produces a hairpin — where she got it, you will never know — and picks it in forty-five seconds. You descend into darkness as the tornado demolishes the house above you. The cellar holds. When you emerge, the house is matchsticks, but you are standing. The cellar had shelves of preserves, a first aid kit, and a hunting bow with a quiver of arrows.',
          failureText: 'You reach the farmhouse but cannot find the cellar entrance in the chaos. You hunker in the ground floor bathroom as the tornado clips the north side of the house. The roof peels away like paper. You survive, barely, huddled in a bathtub while the sky screams.',
          successEffects: { food: 5, medicine: 1, ammo: 2, morale: 10 },
          failureEffects: { health: -10, morale: -5 },
          setFlags: { survived_tornado: true, found_cellar: true },
        },
      ],
    }],
  },

  // ---- Event 4: Military Remnants ----
  {
    id: 'evt_ch3_military_base',
    type: 'story',
    region: ['alberta'],
    season: null,
    turnRange: [15, 18],
    baseWeight: 30,
    onceOnly: true,
    title: 'Ghosts of CFB Suffield',
    segments: [{
      narration: 'Canadian Forces Base Suffield sprawls across the prairie like a concrete scar. The largest military base in the Commonwealth, now silent as a tomb. The perimeter fence is intact — razor wire glinting in the sun — and the gates are sealed. Not breached. Sealed. From the inside.\n\nThrough the fence, you can see vehicles: LAVs, trucks, a Chinook helicopter sitting on a pad with its blades still intact. The armory is visible from the gate — a reinforced building with blast doors. If there are weapons, ammunition, body armor anywhere in Alberta, they are in there.\n\nBut the base is not empty. In the parade square, arranged in perfect rows, stand approximately three hundred Shamblers. They are not wandering. They are not groaning. They are standing at attention. Military formation. Parade rest.\n\nSomeone — something — organized them.\n\nDr. Reyes lowers his binoculars with shaking hands. "The virus preserves motor memory. Muscle patterns. These were soldiers. Their bodies still remember drill." He pauses. "Or the AI is learning to use them."',
      choices: [
        {
          text: 'Infiltrate the armory. Those weapons could save our lives ten times over.',
          skillCheck: { skill: 'stealth', dc: 16 },
          successText: 'It takes three hours. You crawl through a drainage culvert under the perimeter, cross two hundred meters of open ground on your belly, and reach the armory while the formations stand motionless. Inside: rifles, ammunition, body armor, MREs, and a military radio that might still work. You load what you can carry and retreat the way you came, heart hammering the entire time. The formations never move. But as you slip back under the fence, you swear one of them turns its head.',
          failureText: 'You make it to the armory but the blast door is sealed with an electronic lock — and the moment you touch the keypad, the base PA system crackles. Prometheus\'s voice: "Unauthorized access detected." The formations turn in unison. Three hundred pairs of dead eyes find you. You have never run so fast in your life.',
          successEffects: { ammo: 8, food: 5, scrap: 3, morale: 15 },
          failureEffects: { morale: -15, health: -5 },
          setFlags: { infiltrated_base: true },
        },
        {
          text: 'Study them from a distance. Learn how the AI controls them.',
          skillCheck: { skill: 'perception', dc: 12 },
          successText: 'You spend four hours observing. The formations rotate every ninety minutes — a patrol pattern. The Shamblers in formation move differently from wild ones: coordinated, purposeful. And you notice something critical — they respond to a low-frequency hum from the base communications tower. Cut the signal, and they might revert to ordinary Shamblers. This information could be the difference between life and death later.',
          failureText: 'You observe for hours but cannot discern a pattern. The formations seem to move randomly, but Dr. Reyes insists there is logic. "We would need more time. Time we do not have." You leave with questions and no answers.',
          successEffects: { morale: 5 },
          failureEffects: { morale: -3 },
          setFlags: { studied_hive_military: true, knows_signal_weakness: true },
        },
        {
          text: 'This is wrong. Leave. Now. Do not engage with whatever this is.',
          effects: { morale: -5 },
          resultText: 'Every instinct you have screams to run, and you listen. The group moves double-time away from the base, not stopping until the fence is a thin line on the horizon. Cassidy keeps looking back. "They were standing at attention," she whispers. "Like they were waiting for orders." Dr. Reyes nods. "They were. The question is: whose orders?"',
          setFlags: { fled_military_base: true },
        },
      ],
    }],
  },
];
