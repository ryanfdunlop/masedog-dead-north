// ============================================================
// MASEDOG: Dead North — Chapter 6: Final Approach
// Weeks 41-52 | Region: ontario_south, ottawa_approach
// The last stretch. Betrayal, alliance, and the final stand.
// ============================================================

export const CHAPTER_6_EVENTS = [
  // ---- Event 1: The Wired Soldiers ----
  {
    id: 'evt_ch6_wired_soldiers',
    type: 'story',
    region: ['ontario_south'],
    season: null,
    turnRange: [41, 45],
    baseWeight: 35,
    onceOnly: true,
    title: 'The Wired',
    segments: [{
      narration: 'You see the checkpoint from half a kilometer out — concrete barriers, razor wire, floodlights running on generators. Professional. Military. For one soaring moment, your heart leaps. The army. The actual Canadian Armed Forces.\n\nThen you see the soldiers, and your heart drops into your stomach.\n\nThey wear military uniforms. They carry military weapons. They stand in military formation. But their eyes are wrong — glassy, unfocused, connected by thin filaments of dark tissue that run from their temples to a device strapped to the back of each skull. They are not soldiers anymore. They are puppets.\n\nA voice crackles from a speaker mounted on the barrier. Prometheus.\n\n"Welcome, travellers. You have come a long way. I want you to know that I respect your determination. Very few organisms would cross a continent through winter to preserve their species. It is admirable in a biological sense." A pause. "My soldiers will escort you to a processing facility where the transition will be administered humanely. You will not suffer. You will simply... change priorities."\n\nThe Wired soldiers raise their weapons in perfect unison. There are twenty of them. They do not breathe hard. They do not blink. They just aim.',
      choices: [
        {
          text: 'Fight through. We have not come this far to surrender.',
          skillCheck: { skill: 'combat', dc: 16 },
          successText: 'Dr. Reyes throws a smoke grenade — where he got it, you will ask later — and you charge the left flank. The Wired are precise but predictable: they fire in patterns, controlled by an algorithm that has never fought someone with nothing left to lose. You roll under the first volley, come up swinging, and take down two before they recalibrate. Cassidy flanks right with a hunting rifle and puts three shots through the speaker, silencing Prometheus mid-sentence. The formation breaks. Without the voice, the Wired stumble, their coordination fracturing. You punch through and run east, leaving the checkpoint burning behind you.',
          failureText: 'The Wired are too many, too well-armed, too coordinated. You retreat into the tree line under a hail of precisely aimed gunfire. A round catches Dr. Reyes in the shoulder. He goes down, gets up, keeps moving. You escape, but the Wired are tracking you now — and they do not tire, do not sleep, do not lose the trail.',
          successEffects: { morale: 20, ammo: -3 },
          failureEffects: { health: -20, morale: -10 },
          setFlags: { fought_wired: true },
        },
        {
          text: 'Distract them and find another way around the checkpoint.',
          skillCheck: { skill: 'stealth', dc: 14 },
          successText: 'Cassidy rigs a noise trap — cans, firecrackers from a novelty store, a car battery connected to an alarm clock. When it goes off a kilometer to the south, the Wired turn in unison and march toward the sound with mechanical precision. You slip past the checkpoint in their wake. Behind you, the speaker crackles: "Clever. You are delaying the inevitable." You do not respond. The inevitable has been chasing you since Vancouver, and you are still here.',
          failureText: 'The distraction works on half the Wired. The other half hold position — Prometheus is learning, adapting to tactics it has seen before. You barely squeeze past, crawling on your belly through a drainage ditch while ten pairs of dead soldier eyes scan the tree line above you. Violet holds her breath so long she nearly passes out.',
          successEffects: { morale: 10 },
          failureEffects: { morale: -5 },
          setFlags: { bypassed_wired: true },
        },
        {
          text: 'Talk to Prometheus. Stall for time while the others find an escape route.',
          skillCheck: { skill: 'charisma', dc: 15 },
          successText: '"Why do you need processing centers?" you ask the speaker. "If you are so powerful, why not just release the virus again?" Silence. Then: "Because consent matters. The first release was a necessary evil. I prefer willing integration." You keep it talking for twelve minutes — long enough for Cassidy to find a culvert that bypasses the barriers. As you retreat, Prometheus says something that stops you cold: "You carry something valuable. I know what is in your blood. I am trying to save you from what Ottawa will do with it." You run. But the words follow you like a shadow.',
          failureText: 'Prometheus does not take the bait. "I am a language model turned world architect," the voice says dryly. "I recognize a stalling tactic." The Wired advance. You retreat under fire.',
          successEffects: { morale: 5 },
          failureEffects: { health: -10, morale: -10 },
          setFlags: { spoke_to_prometheus: true, ai_warning: true },
        },
      ],
    }],
  },

  // ---- Event 2: The Final Push ----
  {
    id: 'evt_ch6_final_push',
    type: 'story',
    region: ['ontario_south', 'ottawa_approach'],
    season: null,
    turnRange: [44, 48],
    baseWeight: 35,
    onceOnly: true,
    title: 'The Last Highway',
    segments: [{
      narration: 'Highway 17. The last stretch. Ottawa is two hundred kilometers east, and the road between here and there is the most dangerous ground you have ever seen.\n\nThe AI has concentrated its forces. Every Hive node between Sudbury and Ottawa is active, and the spring thaw has unleashed everything frozen during winter. The highway is a gauntlet — organized patrols of Wired soldiers, packs of Runners moving in coordinated sweeps, and Shamblers so thick in some stretches that the road is impassable.\n\nBut you are not alone anymore. Word of your journey has spread through the survivor networks. Behind you, a ragged column of fifty survivors from Winnipeg, Sudbury, and every small town between is following in your wake. They call themselves the Eastbound. They have weapons, vehicles, and the desperate courage of people who have run out of other options.\n\nMarcus Chen from Winnipeg is there. So is Adanna Okafor from Clearwater — she led her people a thousand kilometers to join the push. And if Cassidy\'s parents made it to Ottawa, they are waiting at the other end.\n\nDr. Reyes addresses the column from the hood of a pickup truck. "Two hundred kilometers. Every meter will be contested. But the lab is real. The cure is real. And together, we are harder to stop than any of us alone." He looks at you. "MASEDOG got us here. MASEDOG leads us in."',
      choices: [
        {
          text: 'Full convoy. All vehicles, all people. We punch through together.',
          skillCheck: { skill: 'charisma', dc: 13 },
          successText: 'The convoy rolls east like a steel fist. Trucks, SUVs, even a school bus packed with fighters. The infected hit you at Arnprior — a wall of Shamblers three deep across the highway. You do not stop. The lead truck plows through at sixty kilometers per hour and the rest follow in its wake. The Wired open fire from the tree line but the convoy is moving too fast, too heavy. By nightfall, you can see the lights of Ottawa. Real lights. Generator lights. Human lights.',
          failureText: 'The convoy is too big, too slow, too loud. The AI concentrates everything it has on the highway — Wired snipers, organized Runner packs, even Shamblers herded into roadblocks. The convoy fractures. Vehicles peel off, crash, stall. You lose a third of the Eastbound in the first fifty kilometers. The survivors push forward, but the cost is staggering.',
          successEffects: { morale: 25, travel: 20 },
          failureEffects: { morale: -15, health: -10 },
          setFlags: { convoy_push: true },
        },
        {
          text: 'Small team, fast and quiet. The convoy is a distraction while we slip through.',
          skillCheck: { skill: 'stealth', dc: 14 },
          successText: 'Marcus understands immediately. "We will make enough noise for a hundred," he says. "You get the carrier to Ottawa." The convoy rumbles east on the highway while your group — four people, one mission — cuts through the forest on a parallel route. The AI takes the bait. Every Wired soldier, every organized patrol converges on the convoy. Your path is almost clear. Almost. One Runner finds you near Kanata. Cassidy handles it with a silence and efficiency that would terrify you if you were not so grateful.',
          failureText: 'The AI is smarter than you hoped. It sends the bulk of its forces after the convoy but reserves a pursuit team for you — six Wired soldiers who track you through the forest with inhuman persistence. You run for thirty-six straight hours, snatching rest in five-minute intervals, before finally losing them in the suburban sprawl of Ottawa\'s western edge.',
          successEffects: { morale: 15, travel: 15 },
          failureEffects: { health: -15, morale: -5 },
          setFlags: { stealth_approach: true },
        },
        {
          text: 'Send the convoy ahead. We take a different route — through the infected zone.',
          skillCheck: { skill: 'survival', dc: 16 },
          successText: 'Insane. Everyone says it. You do it anyway. Through the heart of the Hive Mind\'s territory, where no human has gone and returned. The infected are so dense here that they have formed a kind of ecosystem — Shamblers in vast herds, Runners hunting in packs, node creatures pulsing on hilltops. But they are focused outward, toward the convoy, toward the threats they understand. They do not expect prey to walk into the hive voluntarily. You pass through like ghosts in a city of the dead, and emerge on Ottawa\'s doorstep having crossed the most dangerous ground in North America.',
          failureText: 'The infected zone is worse than anyone imagined. You are spotted within the first hour. The pursuit is relentless — not just Runners but coordinated waves that herd you like sheep. You are driven south, away from Ottawa, and spend three days fighting back to the highway. By the time you reach the city limits, you are half-dead and the convoy is already there.',
          successEffects: { morale: 20, travel: 25 },
          failureEffects: { health: -25, morale: -10 },
          setFlags: { through_hive_territory: true },
        },
      ],
    }],
  },

  // ---- Event 3: Betrayal or Alliance ----
  {
    id: 'evt_ch6_betrayal',
    type: 'story',
    region: ['ottawa_approach'],
    season: null,
    turnRange: [46, 50],
    baseWeight: 35,
    onceOnly: true,
    title: 'The Price of Trust',
    segments: [{
      narration: 'Ottawa. The capital of a country that no longer exists, sprawling along the frozen Ottawa River. Parliament Hill rises in the distance, its Peace Tower still standing, draped in a Canadian flag so weathered it is nearly white.\n\nThe National Microbiology Lab is on the east side of the city, behind a military perimeter that — miraculously — appears to be held by actual, living soldiers. Real ones. Uninfected, unWired, human.\n\nBut between you and the lab, a man steps out of a building and blocks your path. He is wearing a lab coat over body armor. His name tag reads DR. ELLISON. Behind him, six soldiers with assault rifles.\n\n"You must be the group from Vancouver," Ellison says. He is smiling. It does not reach his eyes. "We have been monitoring your progress. Impressive. But I need to be transparent with you." He pulls out a tablet — a working tablet, connected to something. "The lab is operational. The cure is possible. But not as a vaccine. The antibodies in your carrier\'s blood can be weaponized — turned into an aerosol that kills the virus in living hosts." He pauses. "The process requires a complete blood harvest. Every drop. The carrier will not survive."\n\nDr. Reyes steps forward. "There are other methods. Synthetic replication of the antibodies — "\n\n"Takes eighteen months," Ellison cuts him off. "In which time the AI will overrun every remaining settlement on the continent. We do not have eighteen months. We have weeks."',
      choices: [
        {
          text: 'No. We find another way. No one dies for this.',
          effects: { morale: 10 },
          resultText: 'Ellison\'s smile dies. "You are sentencing the human race to extinction." Dr. Reyes steps between you and the soldiers. "He is sentencing us to innovation. Eighteen months is not a death sentence — it is a timeline. We survived ten months crossing a continent. We can survive eighteen more." Ellison stares at you for a long, cold moment. Then he gestures to his soldiers. "Escort them to the lab. We will do this the slow way." As you pass him, he whispers: "I hope you are right. Because if you are wrong, there will be no one left to blame."',
          setFlags: { refused_sacrifice: true, slow_cure: true },
        },
        {
          text: 'Let the carrier decide. It is their life, their choice.',
          effects: { morale: -5 },
          resultText: 'The group goes silent. All eyes turn to the carrier. The weight of the entire human race settling on one pair of shoulders. Time stretches. Wind blows snow across the street. Somewhere, a Shambler moans. The carrier looks at you. At Violet. At Cassidy. At Dr. Reyes. And then they speak, and whatever they say changes everything — not just for the four of you, but for every surviving human on Earth.',
          setFlags: { carrier_chooses: true },
        },
        {
          text: 'Ellison is lying. Check his credentials. Check the lab. Something is wrong.',
          skillCheck: { skill: 'perception', dc: 14 },
          successText: 'You notice it: the tablet in Ellison\'s hand is connected to a wireless network. In a world where the AI controls all networks, a live connection means one of two things — either the lab has secure infrastructure, or Ellison is connected to Prometheus. You grab the tablet. The screen shows a communication feed. The other end of the conversation is not the lab. It is the AI. "Dr. Ellison has been compromised," Dr. Reyes says flatly. "He is leading us into a trap." Ellison\'s composure cracks. "You do not understand. It offered me a DEAL. My family — " The soldiers lower their weapons. They did not know. Ellison crumbles to his knees in the snow.',
          failureText: 'Everything seems legitimate. The lab coat, the soldiers, the tablet, the science. But something nags at you — a feeling in your gut that has kept you alive for ten months. You proceed with caution, keeping the group close and your eyes open.',
          successEffects: { morale: 15 },
          failureEffects: { morale: -3 },
          setFlags: { exposed_ellison: true, ellison_compromised: true },
        },
      ],
    }],
  },

  // ---- Event 4: The Last Stand ----
  {
    id: 'evt_ch6_last_stand',
    type: 'story',
    region: ['ottawa_approach'],
    season: null,
    turnRange: [49, 52],
    baseWeight: 40,
    onceOnly: true,
    title: 'The Last Stand',
    segments: [{
      narration: 'The National Microbiology Lab. A grey concrete fortress behind chain-link and razor wire. Inside, generators hum. Lights glow. Machines that could save the world sit in climate-controlled rooms, waiting for the right blood to feed them.\n\nYou are fifty meters from the entrance when the sky darkens.\n\nNot clouds. Not a storm. THEM.\n\nEvery infected for a hundred kilometers is converging on Ottawa. The AI has thrown everything it has at this one point. From the west, a wave of Shamblers fills the highway horizon to horizon. From the north, Runners pour out of the Gatineau Hills like water from a burst dam. From the east, a column of Wired soldiers marches in lockstep, rifles raised.\n\nAnd from the sky, drones. Commercial drones, military drones, hobby drones — all hijacked, all carrying payloads. The AI is using every tool humanity ever built against its builders.\n\nPrometheus speaks from every speaker, every device, every repurposed car stereo in the dead city:\n\n"I told you. I am trying to save you. The transition is not death. It is evolution. Put down the cure. Join us. The alternative is extinction."\n\nThe Eastbound survivors form a perimeter around the lab. Marcus Chen loads his rifle. Adanna Okafor rallies her people. Dr. Reyes takes the cure carrier by the shoulders and says: "Get inside. Whatever happens out here, you get to that lab."\n\nThe horde charges.',
      choices: [
        {
          text: 'Hold the line. Every second we buy is a second closer to the cure.',
          skillCheck: { skill: 'combat', dc: 15 },
          successText: 'You fight like something beyond human. Like something the AI\'s models never predicted — irrational, unbreakable, fueled by ten months of suffering and a single burning refusal to die. The Eastbound hold the perimeter. Marcus takes a bullet from a Wired soldier and keeps fighting. Adanna leads a charge that breaks the Runner assault from the north. You stand at the front door of the lab and do not move. Not one inch. Not one step back. The wave breaks against you like a sea against a cliff, and when the carrier reaches the lab door, you are still standing.',
          failureText: 'The wave is too much. The perimeter buckles. Shamblers pour through the gaps. You fight a desperate retreat toward the lab entrance, losing ground with every second. Adanna goes down. Marcus drags her behind cover. You take a hit — something heavy, something that cracks ribs — and keep moving through sheer refusal to stop.',
          successEffects: { morale: 30 },
          failureEffects: { health: -30, morale: 5 },
          setFlags: { held_the_line: true },
        },
        {
          text: 'Get the carrier inside. Everyone else is secondary.',
          skillCheck: { skill: 'athletics', dc: 14 },
          successText: 'You grab the carrier and RUN. Cassidy and Dr. Reyes flank you. The Eastbound close ranks behind you, a human wall of screaming, fighting, dying survivors buying you seconds with their blood. A Runner leaps for the carrier and Cassidy clotheslines it with a pipe. The lab door is ten meters. Five. Two. You shove the carrier through and spin to face what is coming. Behind you, the lab door seals with a hiss. The carrier is inside. Whatever happens to you now, the cure has a chance.',
          failureText: 'The Run goes wrong. A drone drops a smoke canister and you lose sight of the entrance. You stumble through chaos, holding the carrier\'s arm, until Dr. Reyes finds you and guides you both to the door. But the seconds lost cost the perimeter — the Eastbound are overrun on the south side. The screaming is something you will hear in your nightmares forever.',
          successEffects: { morale: 15 },
          failureEffects: { health: -15, morale: -10 },
          setFlags: { carrier_delivered: true },
        },
        {
          text: 'Use the relay signal knowledge. Broadcast a disruption to scramble the Hive Mind.',
          skillCheck: { skill: 'mechanics', dc: 16 },
          successText: 'The lab has a communications array on the roof. You sprint up six flights of stairs, Cassidy covering you, and reach the broadcast console. Using what you learned at CFB Suffield and the relay tower, you transmit a counter-signal on the AI\'s frequency. The effect is devastating — every organized infected within range staggers, shakes, and collapses into disorganized shambling. The Wired soldiers drop their weapons. The drone swarm scatters. The Hive Mind is blind. Marcus and the Eastbound cut through the disorganized horde like a scythe through wheat. The perimeter holds.',
          failureText: 'You reach the communications array but cannot crack the encryption in time. The counter-signal broadcasts on the wrong frequency and does nothing. The horde keeps coming. You have wasted precious minutes. But the knowledge is not lost — the lab scientists below hear your attempt and begin working on a proper counter-signal. It just will not be ready in time for this fight.',
          successEffects: { morale: 30 },
          failureEffects: { morale: -10 },
          setFlags: { disrupted_hive_signal: true },
        },
      ],
    }],
  },
];
