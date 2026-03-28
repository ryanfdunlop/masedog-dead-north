// ============================================================
// MASEDOG: Dead North — Chapter 4: The Long Crossing
// Weeks 19-26 | Region: saskatchewan, manitoba
// Halfway there. Winter approaches. Hard choices.
// ============================================================

export const CHAPTER_4_EVENTS = [
  // ---- Event 1: The Halfway Point ----
  {
    id: 'evt_ch4_halfway',
    type: 'story',
    region: ['saskatchewan'],
    season: null,
    turnRange: [19, 22],
    baseWeight: 35,
    onceOnly: true,
    title: 'Two Thousand Kilometers',
    segments: [{
      narration: 'Regina. The flat heart of the prairies. You stand on the roof of a grain elevator and look in both directions. West: the mountains you crossed, now invisible beyond the curve of the Earth. East: two thousand more kilometers of grassland, forest, rock, and ice.\n\nYou are halfway there.\n\nThe weight of that fact sits on your chest like a stone. Half the distance behind you, half ahead. Weeks of walking, fighting, starving, freezing — and you are only HALF done.\n\nViolet sits beside you, legs dangling over the edge. She looks better than she did in BC — Dr. Reyes\'s treatments are working, or her body is winning its war against the virus. She has color in her cheeks. She can walk without help now.\n\n"Two thousand K," she says, reading the highway marker below. "That is like... Vancouver to Vancouver and back."\n\n"Roughly," Dr. Reyes says from behind you.\n\nCassidy is below, scavenging the elevator\'s office. She finds something and calls up: "Hey! There is a calendar in here. Circled date. It says \'First Frost — October 14th.\'" She pauses. "What is today?"\n\nDr. Reyes checks his mental count. "September 28th. Give or take."\n\nSixteen days until frost. The Canadian prairies in winter will kill you faster than any zombie.',
      choices: [
        {
          text: 'We push hard. Maximum distance every day before winter hits.',
          effects: { morale: 5, health: -5 },
          resultText: 'You set a brutal pace — thirty kilometers a day, no rest days, moving from dawn until the light fails. The prairies blur into an endless scroll of golden grass and grey sky. Your feet blister. Your legs ache. But the kilometers fall away. Violet keeps up, jaw set, refusing to slow you down. Cassidy turns it into a game, counting fence posts. By the time frost comes, you want to be past Winnipeg. You have to be past Winnipeg.',
          setFlags: { pushed_pace: true },
        },
        {
          text: 'Find winter gear first. Speed means nothing if we freeze to death.',
          skillCheck: { skill: 'survival', dc: 11 },
          successText: 'You spend two days raiding Regina. A Canadian Tire yields winter jackets, thermal underwear, sleeping bags rated to minus thirty. A hunting supply store provides hand warmers, fire starters, and a camp stove. Dr. Reyes finds snow goggles. "Hypothermia kills more people than zombies ever will," he says, zipping up a parka. "Now it does not get to kill us."',
          failureText: 'The stores are picked clean. Other survivors hit Regina months ago. You find some sweaters, a tattered sleeping bag, and mismatched gloves. It will not be enough. Not for what is coming.',
          successEffects: { morale: 10 },
          failureEffects: { morale: -10 },
          setFlags: { winter_prepared: true },
        },
        {
          text: 'We could winter here. Find a building, fortify it, wait for spring.',
          effects: { morale: -10 },
          resultText: 'Dr. Reyes shakes his head slowly. "Violet\'s condition is stable, not cured. Every week without real treatment is a gamble. And Ottawa..." He looks east. "If the lab is real, if the cure is real, every week we wait is a week more people die." He is right. Wintering means giving up six months. Six months of infected spreading, of the AI growing smarter, of whatever remains of civilization crumbling further. You cannot afford six months. Nobody can.',
          setFlags: { considered_wintering: true },
        },
      ],
    }],
  },

  // ---- Event 2: The Cold Comes ----
  {
    id: 'evt_ch4_first_frost',
    type: 'story',
    region: ['saskatchewan', 'manitoba'],
    season: null,
    turnRange: [22, 26],
    baseWeight: 35,
    onceOnly: true,
    title: 'The Cold Comes',
    segments: [{
      narration: 'It happens overnight. You go to sleep in autumn and wake up in winter.\n\nThe temperature plummets to minus twelve. The prairie grass, golden yesterday, is sheathed in white. Your breath forms clouds that freeze on your eyebrows. The water bottles in your pack are solid ice.\n\nBut the cold brings a gift you did not expect: the Shamblers slow down. Their joints stiffen. Their movements become jerky, mechanical, like wind-up toys running out of spring. Some of them freeze solid where they stand — grey statues in the snow, arms raised, mouths open in silent moans. They are not dead. You can see their eyes still moving behind frost-covered lids. But they cannot reach you.\n\nDr. Reyes examines a frozen Shambler from a safe distance. "The virus did not evolve for Canadian winters. The infected lack the metabolic capacity to generate body heat." He almost smiles. "For the first time in five months, the climate is on our side."\n\nCassidy kicks snow at a frozen one. It does not react. "Like hitting pause," she says.\n\nBut the Runners are different. The Runners are still moving. Slower, yes. Clumsier. But moving. And as the sun sets and the temperature drops further, you hear them in the distance — howling, like wolves, calling to each other across the frozen plains.',
      choices: [
        {
          text: 'The cold is an advantage. Push through while the Shamblers are frozen.',
          effects: { travel: 15, health: -10 },
          resultText: 'You march through a landscape of frozen horrors — Shamblers locked in place like statues of the damned, reaching for prey that is no longer there. It is deeply unsettling, walking through a gallery of frozen agony, but you cover more ground in three days than you did in the previous two weeks. The cold bites at your extremities. Violet wraps her hands in socks. Cassidy shivers inside two jackets. But the road is clear.',
          setFlags: { pushed_through_frost: true },
        },
        {
          text: 'Conserve energy. Build fires. Move only during the warmest hours.',
          skillCheck: { skill: 'survival', dc: 12 },
          successText: 'You learn the rhythm of prairie winter: move from 10 AM to 3 PM when the sun gives what little warmth it can. Build fires with dry grass and fence posts at dawn and dusk. Melt snow for water. Cassidy turns out to be a natural fire-builder — something her father taught her on camping trips. The days are short, the progress slow, but nobody gets frostbite.',
          failureText: 'Your fires sputter and die in the wind. The prairie offers no shelter from gusts that cut through every layer of clothing. You lose feeling in your toes on the second day. Dr. Reyes wraps your feet in strips of cloth and speaks sharply: "If we do not find shelter by tonight, we will lose extremities." His voice carries the weight of someone who has seen frostbite before.',
          successEffects: { morale: 5 },
          failureEffects: { health: -15, morale: -10 },
          setFlags: { winter_cautious: true },
        },
        {
          text: 'Head for Winnipeg. A city means buildings. Buildings mean warmth.',
          effects: { morale: 5 },
          resultText: 'Winnipeg. The name becomes a prayer, a mantra you repeat with every frozen step. Four hundred kilometers east. In summer, a week of walking. In this cold, maybe two. Maybe more. You set your eyes on the horizon and walk toward a city you have never seen but need more than you have ever needed anything. Violet pulls her hood tight. "Winnipeg or bust," she says through chattering teeth. Cassidy manages a laugh. It is the best sound in the world.',
          setFlags: { heading_winnipeg: true },
        },
      ],
    }],
  },

  // ---- Event 3: Winnipeg Settlement ----
  {
    id: 'evt_ch4_winnipeg',
    type: 'story',
    region: ['manitoba'],
    season: null,
    turnRange: [23, 26],
    baseWeight: 35,
    onceOnly: true,
    title: 'The Forks',
    segments: [{
      narration: 'Winnipeg is alive.\n\nNot in the way Vancouver was alive before the outbreak — no lights, no traffic, no normalcy. Alive in the way that matters: people have built something here. At The Forks, where the Red and Assiniboine rivers meet, a settlement of maybe five hundred people has risen from the ruins. They have generators. Heated buildings. Sentries with military-grade weapons. A functioning kitchen that serves hot soup twice a day.\n\nThe leader is a former city councillor named Marcus Chen, a compact man with a shaved head and the exhausted eyes of someone who has not slept properly in months. He welcomes you at the gate.\n\n"Travellers from the west. We do not get many of those." He looks at your group — ragged, frost-bitten, half-starved. "Come in. Eat. Then we talk."\n\nOver soup that tastes like the best thing you have ever eaten, Marcus explains the situation. "We have food for maybe two months. The infected are frozen now, but spring will thaw them. When that happens, we either have a plan or we have a funeral." He leans forward. "We have heard the Ottawa broadcast. We have people who want to go. But the road east — Thunder Bay, Sudbury — is controlled by something we call the Hive Mind. Organized infected. They set ambushes. They use TOOLS."\n\nHe lets that sink in.\n\n"We need scouts. People who have already crossed a thousand kilometers and lived. People like you."',
      choices: [
        {
          text: 'We will scout for you. But we need supplies and winter gear in return.',
          effects: { food: 8, medicine: 3, morale: 10 },
          resultText: 'Marcus nods. "Done. Take what you need from the armory. We have parkas, snowshoes, even a snowmobile that might run." He extends a hand. "You get us intel on the road east, and Winnipeg will owe you a debt." You shake on it. For the first time in months, you have an alliance built on something other than desperation. As you restock, one of Marcus\'s people — a quiet woman named Lena — approaches you. "Be careful past Kenora," she says softly. "We sent a team that way three weeks ago. They radioed back once. One word: \'sentient.\' Then nothing."',
          setFlags: { allied_winnipeg: true, scouting_mission: true },
        },
        {
          text: 'We are passing through. We cannot stop to scout.',
          effects: { morale: -5 },
          resultText: 'Marcus\'s jaw tightens. "I see. Take the soup, take the warmth, give nothing back." Dr. Reyes puts a hand on your arm — a warning or a plea. Marcus waves it off. "You can stay the night. But morning, you are gone." The settlement provides a warm bed and one meal. In the morning, as you pass through the gates, you see the children watching you leave. One of them waves. You do not wave back. You cannot afford to care about everyone. Can you?',
          setFlags: { refused_winnipeg: true },
        },
        {
          text: 'What can you tell us about the Hive Mind?',
          effects: { morale: 5 },
          resultText: 'Marcus pulls out a map covered in red circles and handwritten notes. "The Hive Mind is not just organized infected. It is a network. The AI — Prometheus — is using low-frequency signals to coordinate them. They share information. One infected sees you, and within hours every infected in the region knows your position." He taps Thunder Bay on the map. "There is a relay tower here. We think it is a node — a local control hub for the network. Destroy it, and the infected in the region might go feral again. Predictable. Killable." He looks at you. "We did not have anyone crazy enough to try. Until now."',
          setFlags: { allied_winnipeg: true, knows_hive_network: true, knows_relay_tower: true },
        },
      ],
    }],
  },

  // ---- Event 4: Who Do You Help? ----
  {
    id: 'evt_ch4_hard_choice',
    type: 'story',
    region: ['manitoba'],
    season: null,
    turnRange: [24, 26],
    baseWeight: 30,
    onceOnly: true,
    title: 'The Weight of a Promise',
    segments: [{
      narration: 'East of Winnipeg, on the frozen shore of Lake of the Woods, you find them. Two groups, both in crisis, barely a kilometer apart.\n\nTo the north: a school bus — not unlike the one you saw in Golden — stuck in a snowdrift. Inside, twenty-three children from a Winnipeg daycare and their two exhausted caretakers. They have been stranded for two days. No food, no heat. Some of the children are not moving.\n\nTo the south: a medical convoy — three vehicles with red crosses — overturned on the ice. The drivers are dead. But the cargo is intact: crates of medicine, surgical supplies, antibiotics, and something labeled EXPERIMENTAL ANTIVIRAL — NML OTTAWA. This is the cure research. Or part of it. And four Runners are circling the vehicles, drawn by the smell of the dead drivers.\n\nYou cannot reach both in time. The children will not survive another night. The Runners will destroy or scatter the medical supplies within the hour. Dr. Reyes has gone absolutely still.\n\n"I cannot make this choice for you," he says quietly. "I am a doctor. I will save whoever you put in front of me. But I cannot choose who that is."',
      choices: [
        {
          text: 'Save the children. Medicine can be found again. These kids cannot.',
          effects: { morale: 10, medicine: -2 },
          resultText: 'You reach the bus at a dead sprint. Cassidy is already breaking ice off the door. Inside, the children are hypothermic but alive — all twenty-three of them. You build fires, share what food you have, wrap the smallest ones inside your own jackets. Dr. Reyes works through the night, warming tiny hands, checking tiny pulses. By morning, the Runners have shredded the medical convoy. The experimental antiviral is gone. Scattered across the frozen lake. Violet watches the wreckage from the bus window. She does not say it. But you both know what was lost.',
          setFlags: { saved_children: true, lost_medical_convoy: true },
        },
        {
          text: 'Secure the medical supplies. The antiviral could save millions.',
          effects: { morale: -20, medicine: 8 },
          resultText: 'Four Runners. You have faced worse. You and Dr. Reyes hit them hard and fast while Cassidy guards Violet. The Runners go down. The cargo is intact. Dr. Reyes opens the antiviral case with shaking hands. "This is real," he breathes. "NML Ottawa. Phase 2 trials. This could be the key to everything."\n\nYou load what you can carry. Then you go to the bus.\n\nYou are too late for three of them. The smallest ones. The ones who could not hold their body heat. The caretakers are catatonic with grief and cold. You save the other twenty and spend the night hating yourself for the math you did.',
          setFlags: { secured_antiviral: true, children_died: true },
        },
        {
          text: 'Split up. Dr. Reyes takes the children, you handle the Runners.',
          skillCheck: { skill: 'combat', dc: 15 },
          successText: 'Dr. Reyes moves like a man possessed, reaching the bus in minutes. You face the Runners alone. It is the hardest fight of your life — four against one on frozen ground. But rage and desperation are powerful allies. The last Runner falls as your knife finds its temple. You secure the antiviral case. Dr. Reyes saves the children. When you collapse into the snow, bleeding from a dozen cuts, Cassidy is standing over you. "You did it," she says. "You actually did it." Both. You did both.',
          failureText: 'You face the Runners alone and it nearly kills you. You take down two but the third puts you on your back. Cassidy appears from nowhere — she was not supposed to follow — and drives a piece of rebar through its skull. The fourth Runner flees. You secure half the supplies before the cold claims the rest. Dr. Reyes saves the children but you are in bad shape. Violet holds pressure on your wounds while Dr. Reyes stitches you together with trembling hands.',
          successEffects: { morale: 25, medicine: 6 },
          failureEffects: { health: -25, medicine: 3, morale: 5 },
          setFlags: { saved_children: true, secured_antiviral: true, heroic_split: true },
        },
      ],
    }],
  },
];
