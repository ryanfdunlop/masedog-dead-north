// ============================================================
// MASEDOG: Dead North — Items Database
// ============================================================

export const ITEMS = {
  // Weapons
  kitchen_knife: { id: 'kitchen_knife', name: 'Kitchen Knife', type: 'weapon', damage: 3, durability: 30, weight: 1, description: 'Better than nothing.' },
  baseball_bat: { id: 'baseball_bat', name: 'Baseball Bat', type: 'weapon', damage: 5, durability: 50, weight: 2, description: 'Solid aluminum. Dents don\'t matter when you\'re swinging at skulls.' },
  fire_axe: { id: 'fire_axe', name: 'Fire Axe', type: 'weapon', damage: 7, durability: 60, weight: 3, description: 'Heavy, sharp, and built to break through doors — or anything else.' },
  hunting_rifle: { id: 'hunting_rifle', name: 'Hunting Rifle', type: 'weapon', damage: 10, durability: 80, weight: 4, description: 'Bolt-action. Reliable. Loud.' },
  pistol: { id: 'pistol', name: 'Pistol', type: 'weapon', damage: 7, durability: 70, weight: 2, description: '9mm handgun. 15 round magazine.' },
  shotgun: { id: 'shotgun', name: 'Shotgun', type: 'weapon', damage: 12, durability: 60, weight: 4, description: 'Pump-action. Devastating at close range.' },
  crossbow: { id: 'crossbow', name: 'Crossbow', type: 'weapon', damage: 8, durability: 90, weight: 3, description: 'Silent. Bolts can be recovered. Perfect for stealth.' },
  machete: { id: 'machete', name: 'Machete', type: 'weapon', damage: 6, durability: 70, weight: 2, description: 'A blade built for clearing paths — through brush or bodies.' },

  // Medicine
  first_aid_kit: { id: 'first_aid_kit', name: 'First Aid Kit', type: 'medicine_item', uses: 3, healAmount: 25, weight: 1, description: 'Bandages, antiseptic, painkillers. The basics.' },
  antibiotics: { id: 'antibiotics', name: 'Antibiotics', type: 'medicine_item', uses: 5, healAmount: 15, weight: 1, description: 'Broad-spectrum. Could save a life — or at least buy time.' },
  surgical_kit: { id: 'surgical_kit', name: 'Surgical Kit', type: 'medicine_item', uses: 2, healAmount: 40, weight: 2, description: 'Professional medical tools. Needs someone who knows how to use them.' },

  // Tools
  binoculars: { id: 'binoculars', name: 'Binoculars', type: 'tool', weight: 1, description: 'See trouble before it sees you.', bonus: { perception: 2 } },
  toolbox: { id: 'toolbox', name: 'Toolbox', type: 'tool', weight: 3, description: 'Wrenches, screwdrivers, pliers. Essential for repairs.', bonus: { mechanics: 3 } },
  ham_radio: { id: 'ham_radio', name: 'HAM Radio', type: 'tool', weight: 2, description: 'Pick up transmissions from other survivors. Maybe even Ottawa.', flags: ['can_scan_frequencies'] },
  compass: { id: 'compass', name: 'Compass', type: 'tool', weight: 0, description: 'Never lose your way.', bonus: { survival: 1 } },
  flashlight: { id: 'flashlight', name: 'Flashlight', type: 'tool', weight: 1, description: 'Essential for dark buildings. Uses batteries.', bonus: { perception: 1 } },
  lockpicks: { id: 'lockpicks', name: 'Lockpick Set', type: 'tool', weight: 0, description: 'Open doors that want to stay closed.', flags: ['can_lockpick'] },

  // Armor
  leather_jacket: { id: 'leather_jacket', name: 'Leather Jacket', type: 'armor', defense: 2, weight: 2, description: 'Thick leather. Won\'t stop a bullet but might stop a bite.' },
  riot_gear: { id: 'riot_gear', name: 'Riot Gear', type: 'armor', defense: 5, weight: 4, description: 'Police-issue body armor. Heavy but protective.' },
  winter_coat: { id: 'winter_coat', name: 'Winter Coat', type: 'armor', defense: 1, weight: 2, description: 'Rated to -40C. You\'ll need this.', flags: ['cold_protection'] },

  // Special
  photo_of_family: { id: 'photo_of_family', name: 'Family Photo', type: 'special', weight: 0, description: 'A crumpled photo of better days. Looking at it hurts, but it reminds you why you keep going.', moraleBoost: 5 },
  cure_sample: { id: 'cure_sample', name: 'Blood Sample', type: 'special', weight: 0, description: 'A vial of blood from the immune carrier. The most important object in the world.', flags: ['has_cure_sample'] },
  map_of_canada: { id: 'map_of_canada', name: 'Road Map', type: 'special', weight: 0, description: 'A tattered road map of Canada. Highway routes marked in pen.', flags: ['has_map'] },
  car_keys: { id: 'car_keys', name: 'Car Keys', type: 'special', weight: 0, description: 'Keys to a vehicle. Now you just need to find one with gas.', flags: ['has_car_keys'] },
};

/**
 * Get item by ID.
 */
export function getItem(id) {
  return ITEMS[id] || null;
}

/**
 * Get all items of a specific type.
 */
export function getItemsByType(type) {
  return Object.values(ITEMS).filter(item => item.type === type);
}
