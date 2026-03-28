// ============================================================
// MASEDOG: Dead North — Mini-Game Trigger Events
// Events that launch playable action sequences
// ============================================================

export const MINIGAME_EVENTS = [
  {
    id: 'evt_mg_horde_chase',
    type: 'combat',
    region: null,
    season: null,
    turnRange: [3, 52],
    baseWeight: 12,
    title: 'RUN!',
    segments: [{
      narration: 'The sound starts low — a rumble of feet, a chorus of groans. Then you see them. Dozens of them, pouring out of every doorway, every alley, every shadow. A horde. And they\'ve seen you.',
      choices: [
        {
          text: 'RUN FOR YOUR LIFE!',
          triggerMinigame: 'zombie-escape',
          minigameConfig: { difficulty: 'normal' },
          minigameSuccessEffects: { morale: 10, travel: 15 },
          minigameFailEffects: { health: -20, morale: -10 },
          resultText: 'You sprint into the chaos.',
        },
        {
          text: 'Find a building to barricade in',
          skillCheck: { skill: 'perception', dc: 12 },
          successText: 'You spot a hardware store with a steel security door. You slam it shut just as the first of them reaches you. The door holds.',
          failureText: 'Every door is locked or broken. The horde closes in. You have to run.',
          successEffects: { morale: 5 },
          failureEffects: { health: -15, morale: -8 },
        },
        {
          text: 'Climb to the rooftops',
          skillCheck: { skill: 'athletics', dc: 14 },
          successText: 'You grab a fire escape ladder and pull everyone up. From the roof, you watch the horde pass below like a river of death.',
          failureText: 'The fire escape is rusted shut. You lose precious seconds before finding another way up. Not everyone makes it unscathed.',
          successEffects: { morale: 8 },
          failureEffects: { health: -12, morale: -5 },
        },
      ],
    }],
  },

  {
    id: 'evt_mg_supply_run',
    type: 'scavenge',
    region: null,
    season: null,
    turnRange: [2, 52],
    baseWeight: 12,
    title: 'Supply Run',
    segments: [{
      narration: 'A warehouse. The loading bay is open. Inside you can see shelves — actual stocked shelves. But you can also hear movement in the dark. Something\'s in there.',
      choices: [
        {
          text: 'Go in and scavenge — watch the noise',
          triggerMinigame: 'scavenge',
          minigameConfig: { difficulty: 'normal' },
          minigameSuccessEffects: { morale: 8 },
          minigameFailEffects: { health: -15, morale: -8 },
          resultText: 'You step into the darkness.',
        },
        {
          text: 'Quick grab from the loading bay only',
          effects: { food: 2, water: 1 },
          resultText: 'You grab what\'s near the entrance and back out. Not much, but you didn\'t risk anyone.',
        },
        {
          text: 'Too risky — move on',
          effects: { morale: -3 },
          resultText: 'You walk past. The warehouses of the old world are tombs now.',
        },
      ],
    }],
  },

  {
    id: 'evt_mg_hunt',
    type: 'scavenge',
    region: ['bc_interior', 'alberta', 'ontario_north'],
    season: ['summer', 'fall', 'spring'],
    turnRange: [3, 48],
    baseWeight: 10,
    title: 'The Hunt',
    segments: [{
      narration: 'Fresh tracks in the mud. Deer. The forest is alive with movement — birds, squirrels, maybe even a buck. Your stomach growls. It\'s been days since real meat.',
      choices: [
        {
          text: 'Take the rifle and hunt',
          triggerMinigame: 'hunting',
          minigameConfig: { difficulty: 'normal' },
          minigameSuccessEffects: { morale: 10 },
          minigameFailEffects: { ammo: -2, morale: -3 },
          resultText: 'You shoulder the rifle and head into the treeline.',
        },
        {
          text: 'Set snares instead — quieter',
          skillCheck: { skill: 'survival', dc: 10 },
          successText: 'The snares work. By morning you have two rabbits. Not a feast, but not starvation either.',
          failureText: 'The snares come up empty. A wasted day.',
          successEffects: { food: 3, morale: 5 },
          failureEffects: { morale: -3 },
        },
        {
          text: 'Forage for berries and roots',
          skillCheck: { skill: 'survival', dc: 8 },
          successText: 'Wild blueberries, cattail roots, some edible mushrooms. It\'s not much but it supplements the rations.',
          failureText: 'Everything you find looks questionable. Better not risk it.',
          successEffects: { food: 2, water: 1 },
        },
      ],
    }],
  },

  {
    id: 'evt_mg_river',
    type: 'crisis',
    region: ['bc_interior', 'ontario_north', 'manitoba'],
    season: ['spring', 'summer'],
    turnRange: [4, 45],
    baseWeight: 10,
    title: 'Raging Waters',
    segments: [{
      narration: 'The bridge is gone — swept away by the spring melt. The river roars below, swollen with ice-cold water and debris. You can see the far bank, but the current is a killer.',
      choices: [
        {
          text: 'Build a raft and cross',
          triggerMinigame: 'river-crossing',
          minigameConfig: { difficulty: 'normal' },
          minigameSuccessEffects: { travel: 20, morale: 10 },
          minigameFailEffects: { health: -15, food: -3, morale: -10 },
          effects: { scrap: -2 },
          resultText: 'You lash together logs and push off into the current.',
        },
        {
          text: 'Search for a crossing upstream',
          effects: { travel: -15 },
          skillCheck: { skill: 'survival', dc: 11 },
          successText: 'Two hours upstream, you find where the river widens into shallow rapids. Waist-deep but crossable.',
          failureText: 'You search for hours and find nothing. The detour costs you a day.',
          failureEffects: { food: -2, morale: -5 },
        },
        {
          text: 'Wait for the water level to drop',
          effects: { food: -2, water: -1 },
          resultText: 'You camp by the river for two days. The water drops enough to find a crossing. Time lost, but everyone\'s dry.',
        },
      ],
    }],
  },

  {
    id: 'evt_mg_escape_hospital',
    type: 'combat',
    region: ['vancouver'],
    season: null,
    turnRange: [1, 4],
    baseWeight: 15,
    onceOnly: true,
    title: 'Hospital Gauntlet',
    segments: [{
      narration: 'The hospital parking lot erupts. They come from the ambulance bay, from the ER entrance, from windows on every floor. The dead pour out of Vancouver General like a breaking dam. There\'s only one direction to go: THROUGH.',
      choices: [
        {
          text: 'Sprint through the parking lot!',
          triggerMinigame: 'zombie-escape',
          minigameConfig: { difficulty: 'hard', maxTime: 20 },
          minigameSuccessEffects: { travel: 20, morale: 15 },
          minigameFailEffects: { health: -25, morale: -15 },
          resultText: 'GO!',
        },
        {
          text: 'Duck through the underground parking',
          skillCheck: { skill: 'stealth', dc: 13 },
          successText: 'The underground is dark and echoing. You move between cars like ghosts. When you emerge on the far side, the horde is behind you.',
          failureText: 'It\'s worse down here. Crawlers under every car. You fight your way out bloody but alive.',
          successEffects: { morale: 8, travel: 15 },
          failureEffects: { health: -20, morale: -10 },
        },
      ],
    }],
  },

  {
    id: 'evt_mg_winter_hunt',
    type: 'scavenge',
    region: null,
    season: ['winter'],
    turnRange: [14, 35],
    baseWeight: 12,
    winterBoost: true,
    title: 'Winter Hunting',
    segments: [{
      narration: 'The snow reveals what summer hides: tracks. Fresh ones — a moose, by the size of them. In winter, a moose could feed the group for two weeks. But the forest is deep, the cold is brutal, and you\'re not the only hunter out here.',
      choices: [
        {
          text: 'Hunt the moose',
          triggerMinigame: 'hunting',
          minigameConfig: { difficulty: 'hard' },
          minigameSuccessEffects: { food: 8, morale: 15 },
          minigameFailEffects: { ammo: -3, health: -5, morale: -5 },
          resultText: 'You follow the tracks into the white silence.',
        },
        {
          text: 'Ice fish at the frozen lake instead',
          skillCheck: { skill: 'survival', dc: 12 },
          successText: 'You cut through the ice and drop a line. Hours later, you haul up enough fish to eat for a week.',
          failureText: 'The ice cracks under you. You scramble back just in time. No fish, and your clothes are soaked.',
          successEffects: { food: 5, morale: 5 },
          failureEffects: { health: -15, morale: -8 },
        },
      ],
    }],
  },
];
