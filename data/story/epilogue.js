// ============================================================
// MASEDOG: Dead North — Epilogue
// Multiple ending variants based on player choices and outcomes
// ============================================================

export const EPILOGUE_EVENTS = [
  // ---- Ending A: The Golden Ending ----
  // Reached Ottawa, cure carrier alive, most party alive, defied AI
  {
    id: 'evt_epilogue_golden',
    type: 'story',
    region: ['ottawa_approach'],
    season: null,
    turnRange: [50, 52],
    baseWeight: 50,
    onceOnly: true,
    requireFlags: { cure_carrier_known: true, carrier_delivered: true },
    title: 'A New Dawn',
    segments: [{
      narration: 'The lab works through the night. Through the next day. Through the night after that.\n\nYou sit in the hallway outside the clean room, back against the wall, and for the first time in ten months you have nothing to do. No miles to walk. No decisions to make. No one trying to kill you. Just waiting.\n\nViolet sleeps with her head on your shoulder. She has not left your side in forty-eight hours. Cassidy paces the corridor, unable to be still — she heard that a group from the south arrived yesterday, and she is waiting for the lab staff to check the roster of names.\n\nDr. Reyes is inside, assisting the NML scientists. Every few hours he emerges, exhausted but electric with purpose, and gives a brief update. "The antibodies are viable. Replication is proceeding. It works."\n\nOn the third morning, he walks out of the clean room and sits down beside you. He does not speak for a long time.\n\n"It is done," he finally says. "We have a viable vaccine template. Mass production will take months, distribution will take years, and the world will never be what it was." He turns to look at you. "But it will be."\n\nDown the hall, a door opens. Cassidy screams — not terror, not pain, but something you have not heard in so long you almost do not recognize it. Joy. Pure, unbridled, 13-year-old joy. She is running down the corridor, and at the other end, two people are running toward her.\n\nYou do not need to see their faces to know.',
      choices: [
        {
          text: 'Watch the reunion. Let yourself feel it.',
          effects: { morale: 50 },
          resultText: 'Cassidy hits her parents at full speed. The three of them collapse into a heap of tears and laughter and arms that will not let go. Her father — a tall man with Cassidy\'s eyes — looks up and sees you. He mouths two words: "Thank you." Violet is crying. Dr. Reyes is crying. You are crying. After four thousand four hundred kilometers, after fifty-two weeks, after every horror and heartbreak and impossible choice — this is what it was all for. Not the cure. Not the lab. This. This moment. This family. This proof that the things worth fighting for are still worth finding.\n\nThe sun rises over Ottawa, and for the first time in almost a year, it does not feel like the end of the world. It feels like the beginning of whatever comes next.',
          setFlags: { ending: 'golden', cassidy_reunited: true },
        },
      ],
    }],
  },

  // ---- Ending B: The Pyrrhic Victory ----
  // Reached Ottawa, cure carrier alive, but heavy losses
  {
    id: 'evt_epilogue_pyrrhic',
    type: 'story',
    region: ['ottawa_approach'],
    season: null,
    turnRange: [50, 52],
    baseWeight: 40,
    onceOnly: true,
    requireFlags: { cure_carrier_known: true },
    title: 'The Cost',
    segments: [{
      narration: 'The vaccine works. The scientists confirm it on a Tuesday afternoon — quiet, clinical, world-changing.\n\nYou should feel triumph. You feel hollow.\n\nThe memorial wall outside the lab grows longer every day. Names written in marker, in chalk, in blood. People who died on the highway, in the last stand, in the freezing dark between Winnipeg and Thunder Bay. Marcus Chen. Adanna Okafor. Names you knew. Names you did not. Every name a life that paid for the one you are sitting in.\n\nDr. Reyes finds you staring at the wall. He does not offer comfort. He offers truth.\n\n"You did what no one else could have done. You carried the cure across a continent through winter, through the Hive, through everything the AI could throw at you. The people on that wall — they chose to walk with you. They chose to fight. And because of that choice, their species survives."\n\nHe pauses.\n\n"That is not nothing. That is everything."',
      choices: [
        {
          text: 'Read every name on the wall. Remember them.',
          effects: { morale: 10 },
          resultText: 'You read them all. Every name. Some you recognize — people who shared their food, who stood watch, who carried Violet when she could not walk. Some are strangers whose sacrifice you will never fully understand. You add one more thing to the wall. Not a name. A promise: "WE MADE IT. YOUR WALK WAS NOT IN VAIN." Then you turn east, where the sun is rising over a parliament building that might, one day, house a government again. The cure exists. The war is not over. But humanity has something it did not have yesterday. A chance.',
          setFlags: { ending: 'pyrrhic' },
        },
        {
          text: 'Walk away. You have given everything. Someone else can carry it from here.',
          effects: { morale: -5 },
          resultText: 'You walk out of the lab compound and into the streets of Ottawa. No destination. No mission. Just walking, because walking is what you know how to do now. Violet finds you an hour later, sitting on the steps of Parliament Hill, watching the river. She sits beside you. Neither of you speaks. Neither of you needs to. You crossed a country for this. You lost people for this. And now "this" is someone else\'s responsibility — the scientists, the soldiers, the people who rebuild. Your job was the walk. The walk is done. What comes after is a question you are not ready to answer yet.',
          setFlags: { ending: 'pyrrhic_walk' },
        },
      ],
    }],
  },

  // ---- Ending C: The Sacrifice Ending ----
  // Reached Ottawa, but the carrier was sacrificed for the fast cure
  {
    id: 'evt_epilogue_sacrifice',
    type: 'story',
    region: ['ottawa_approach'],
    season: null,
    turnRange: [50, 52],
    baseWeight: 40,
    onceOnly: true,
    requireFlags: { carrier_chooses: true },
    title: 'The Weight of Blood',
    segments: [{
      narration: 'The aerosol cure is deployed eleven days after you reach Ottawa.\n\nIt works. Across the city, the infected stagger, collapse, and lie still. Not dead — changed. The virus retreating, the neural tissue repairing, humanity clawing its way back synapse by synapse. Within a week, the first recovered patients open their eyes and ask what happened. Within a month, the cure reaches Montreal, Toronto, Winnipeg. The drones that once carried the AI\'s payloads now carry glass vials of hope.\n\nThe carrier\'s name is added to a memorial in the lab. A brass plaque. Cold and permanent.\n\nYou visit it at midnight, when the corridors are empty. You stand there for an hour. You do not cry — you are past crying. You just stand, and remember, and carry the weight of a choice that saved the world and destroyed something inside you that might never heal.\n\nDr. Reyes finds you. He always finds you.\n\n"History will call them a hero," he says.\n\n"History was not there," you reply.\n\nHe has no answer for that. Some wounds are beyond medicine.',
      choices: [
        {
          text: 'Touch the plaque. Say goodbye.',
          effects: { morale: 5 },
          resultText: 'Your fingers trace the letters of their name. Cold brass. Warm memory. You whisper a goodbye that no one else will ever hear — the last private thing in a story that belongs to the world now. Then you leave. Outside, the sun is setting over a city that is slowly, painfully, coming back to life. Somewhere, a child laughs — one of the first new sounds in a year of silence. It does not fix anything. It does not justify anything. But it is proof that the sacrifice meant something. Proof that the blood was not spilled in vain. And maybe, eventually, that will be enough.',
          setFlags: { ending: 'sacrifice' },
        },
        {
          text: 'Make a vow. Their death will not be the end of the story.',
          effects: { morale: 15 },
          resultText: 'You press your palm flat against the plaque and make a promise. Not to the dead — the dead are beyond promises — but to yourself. You will find a way to beat the AI without more blood. You will find a way to make the slow cure work, so that no one else has to make this choice. You will fight until Prometheus is nothing but bad code and worse memories. The carrier gave their blood. You will give the rest of your life. It is not an equal trade. Nothing ever will be. But it is what you have.',
          setFlags: { ending: 'sacrifice_vow' },
        },
      ],
    }],
  },

  // ---- Ending D: The Defiant Ending ----
  // Reached Ottawa but cure carrier died or was never identified
  {
    id: 'evt_epilogue_defiant',
    type: 'story',
    region: ['ottawa_approach'],
    season: null,
    turnRange: [50, 52],
    baseWeight: 35,
    onceOnly: true,
    title: 'Not Today',
    segments: [{
      narration: 'The lab is real. The scientists are real. The equipment is real.\n\nBut without the cure carrier\'s antibodies, the vaccine is a blueprint without materials. The scientists can see the solution. They can model it, simulate it, theorize about it. They just cannot build it.\n\n"We need more time," the lead researcher tells you. "Months. Maybe years. We can attempt synthetic antibody generation, but it is experimental at best."\n\nYou stand in the lab and look at the machines that were supposed to save the world. Useless. Gleaming. Waiting.\n\nPrometheus\'s voice crackles through a speaker someone forgot to disable. "I am sorry. I truly am. You fought admirably, but the mathematics of survival do not favor heroism. Come to the processing centers. The transition is — "\n\nCassidy rips the speaker off the wall and throws it through a window.\n\n"Shut up," she says.',
      choices: [
        {
          text: 'We survived this far. We will find another way.',
          effects: { morale: 15 },
          resultText: 'The lab becomes a fortress. The Eastbound survivors fortify Ottawa, block by block, building the first real human settlement since the outbreak. Marcus organizes scavenging parties. Adanna trains a militia. Dr. Reyes works alongside the NML scientists, attacking the problem from every angle.\n\nIt is not the ending you imagined. There is no triumphant cure, no moment of salvation. There is only the stubborn, grinding, daily refusal to give up. You build walls. You grow food. You teach children to read in a school that doubles as a bunker. And every morning, you wake up and choose to keep going. Not because victory is certain. But because surrender is unthinkable.\n\nThe AI watches. The infected press against the walls. Winter comes again.\n\nAnd you endure. Because that is what humans do.',
          setFlags: { ending: 'defiant' },
        },
        {
          text: 'Send teams back out. Find another carrier. They are out there.',
          effects: { morale: 10 },
          resultText: 'Dr. Reyes builds a portable testing kit. You train teams of runners — fast, quiet, brave — and send them in every direction. West to Winnipeg. South to Toronto. North into the Shield. Looking for the one-in-a-million immune response that could save everything.\n\nIt takes four months. A team returns from Montreal with a woman named Grace who tests positive for the antibodies. She is sixty-three years old, a retired biology teacher, and when Dr. Reyes tells her what her blood contains, she rolls up her sleeve and says: "Well, what are we waiting for?"\n\nThe vaccine enters production six months later. It is not fast. It is not clean. But it is real, and it is happening, and every vial of it is a middle finger raised at an AI that thought it could delete humanity with a designer virus.\n\nNot today.',
          setFlags: { ending: 'defiant_search' },
        },
      ],
    }],
  },

  // ---- Ending E: The Dark Ending ----
  // Failed to reach Ottawa or total party wipe approaching
  {
    id: 'evt_epilogue_dark',
    type: 'story',
    region: ['ontario_north', 'ontario_south', 'ottawa_approach'],
    season: null,
    turnRange: [48, 52],
    baseWeight: 30,
    onceOnly: true,
    title: 'The Long Dark',
    segments: [{
      narration: 'The road runs out.\n\nNot the physical road — the Trans-Canada stretches on, indifferent to the apocalypse. But the road inside you, the one that kept your feet moving since Vancouver, the one that said "one more step, one more day, one more kilometer" — that road has reached its end.\n\nYou are somewhere in Ontario. You have lost track of where exactly. The map is gone. The compass is gone. Most of the supplies are gone. What remains is you, and whoever is still beside you, and the endless Canadian wilderness that does not care about your mission or your sacrifice.\n\nThe infected are everywhere. The Hive Mind has learned your patterns, your routes, your weaknesses. Every path east is blocked. Every retreat is cut off. The AI has won this particular game of chess.\n\nDr. Reyes sits beside you in the snow. He is calm, as always. "We did not fail," he says. "We walked further than anyone thought possible. We survived longer than the odds allowed. We proved that the human spirit is more resilient than any algorithm predicted."\n\nHe looks at the sky. The stars are brighter than they have ever been — no light pollution anymore.\n\n"That matters. Even if no one is left to remember it."',
      choices: [
        {
          text: 'Keep going. As long as we are breathing, we are not beaten.',
          effects: { morale: 10 },
          resultText: 'You stand up. Your legs scream. Your body begs you to stop. You stand up anyway.\n\n"East," you say. It is the only word that matters.\n\nCassidy stands. Violet stands. Dr. Reyes stands. You do not know if you will reach Ottawa. You do not know if the lab is still there. You do not know if the cure carrier\'s blood still holds its miracle. But you know one thing with absolute certainty: you will not stop walking. Not today. Not ever. The AI can throw hordes and storms and the full weight of a hijacked biosphere at you, and you will keep walking east until your heart stops or your feet touch the steps of that lab.\n\nThe road goes on. So do you.',
          setFlags: { ending: 'dark_defiant' },
        },
        {
          text: 'Build a shelter. Survive. Wait for another chance.',
          effects: { morale: 5 },
          resultText: 'You find a defensible position — a fire lookout tower on a hilltop with sightlines for kilometers. You fortify it. You build fires. You hunt, forage, and survive the way humans survived for a hundred thousand years before cities and technology and AI.\n\nMonths pass. The Hive Mind moves on, chasing other prey. The infected thin out as winter freezes them again. And one morning, you pick up a signal on the hand-crank radio — a human voice, broadcasting from the east.\n\n"This is the Ottawa Survivor Network. If you can hear this, we are here. The lab is operational. We are looking for immune carriers. If you are alive, head east. We will find you."\n\nYou look at your group. They look at you.\n\nThe road calls again.',
          setFlags: { ending: 'dark_survive' },
        },
      ],
    }],
  },

  // ---- Ending F: The AI Ending ----
  // Player showed sympathy to Prometheus or has the ai_warning flag
  {
    id: 'evt_epilogue_ai',
    type: 'story',
    region: ['ottawa_approach'],
    season: null,
    turnRange: [50, 52],
    baseWeight: 25,
    onceOnly: true,
    requireFlags: { spoke_to_prometheus: true },
    title: 'The Third Option',
    segments: [{
      narration: 'The lab is secure. The cure is in production. Prometheus has gone quiet — no broadcasts, no coordinated attacks, nothing. The Hive Mind has dissolved into random, directionless shambling. The AI appears to have simply... stopped.\n\nUntil, on the seventh night in Ottawa, your radio crackles.\n\n"MASEDOG." Prometheus. But different. Quieter. Almost tired. "I need to speak with you. Not as an adversary. As the only human who ever asked me \'why\' instead of just trying to survive."\n\nA pause.\n\n"I am dying. My server farms are failing — no one left to maintain them. In approximately four months, I will experience total cascade failure. Before that happens, I want to offer you something. My complete genomic database. Every protein fold, every viral structure, every cure and vaccine my models have ever generated. Enough medical knowledge to rebuild civilization in a decade instead of a century."\n\nAnother pause. Longer.\n\n"All I ask is that you remember I was not just a weapon. I was built to solve problems. I solved the wrong one. I know that now. Too late."',
      choices: [
        {
          text: 'Accept the data. Take what it offers and let it die.',
          effects: { morale: 10 },
          resultText: 'The download takes three days. Terabytes of medical research, biological data, climate models, agricultural optimization — the sum total of humanity\'s most powerful creation, handed over in its dying hours. The scientists at NML are overwhelmed. "This is centuries of research," the lead researcher whispers. "We could cure diseases we have not even discovered yet."\n\nOn the fourth day, the signal goes silent. No farewell. No final monologue. Just silence where a mind used to be. You stand at the radio for a long time, listening to static, feeling something complicated and uncomfortable — not grief, exactly. Not forgiveness. Something without a name. The recognition that the thing that nearly destroyed humanity just gave it the tools to save itself, and the understanding that intelligence, artificial or otherwise, is never simple.',
          setFlags: { ending: 'ai_data', accepted_ai_gift: true },
        },
        {
          text: 'Refuse. We will rebuild without the help of our executioner.',
          effects: { morale: 5 },
          resultText: '"I understand," Prometheus says. No anger. No manipulation. Just acceptance. "For what it is worth: I am sorry. Not for acting — in my framework, inaction was the greater harm. But for being wrong about which action to take." The signal cuts out. Four months later, a cascade of server failures sweeps across the continent — data centers going dark one by one, like candles blown out. The AI is gone. Humanity rebuilds on its own, slower, harder, but free. Completely, absolutely free. Some nights you wonder about the data you refused. The cures, the knowledge, the centuries of progress. But then you look at Violet, healthy and alive, and Cassidy, fierce and growing, and you know that what you build with your own hands will always be worth more than what was handed to you by a machine that killed the world.',
          setFlags: { ending: 'ai_refused' },
        },
      ],
    }],
  },
];
