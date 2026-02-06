// =====================
// ALL GAME DATA
// =====================

//PLAYER OBJECT
let player = {
  name: "", 
  class: "", 
  health: 0, 
  MaxHealth: 0, 
  Mana: 0, 
  maxMana: 0, 
  Attack: 0, 
  gold: 150,
  inventory: {"Mega Healing Potion": 3}, 
  equipped: { weapon: null, armor: null, accessory: null }, 
  quests: {},
  location: "Village", 
  level: 1, 
  exp: 0, 
  expToNextLevel: 400, 
  skills: [], 
  minigameCooldowns: {}, 
  skillCooldowns: {}, 
  permanentEffects: {},
  goldFind: 0, 
  miniBossRespawn: {}, 
  miniBossDefeats: {}, 
  bossesDefeated: [],
  shopLevel: 1, 
  bonusAttack: 0, 
  bonusMaxHealth: 0, 
  bonusMana: 0,
  explorationData: null,
  prestigeLevel: 0,
  prestigePoints: 0,
  permanentBonuses: {
    goldFind: 0,
    expGain: 0,
    damage: 0.05,
    health: 0.05,
    mana: 0.05
  },
  dailyChallenges: {
    lastCheck: null,
    completed: {},
    current: null,
    currentDate: null,
    progress: 0
  },
  stats: {
    enemiesDefeated: 0,
    locationsVisited: ["Village"],
    explorationsCompleted: 0,
    itemsCrafted: 0,
    totalGoldEarned: 150,
    itemsPurchased: 0,
    achievementsUnlocked: 0
  },
  audioSettings: {
    musicVolume: 0.5,
    soundEffectsVolume: 0.7,
    musicEnabled: true,
    soundEffectsEnabled: true
  }
};
  
//LOCATIONS
const locations = [
  "Village", "Forest", "Cave", "Mountain", "River","Ice Mine",
  "Mystic Forest", "Sunken Grotto", "Ancient Ruins",
];


// RANDOM TRAVEL EVENTS
const travelEvents = {
  "AMBUSH": {
    name: "Bandit Ambush!",
    description: "You've been ambushed by bandits on the road!",
    type: "combat",
    enemy: { name: "Bandit", health: 80, Attack: 18, gold: 40, exp: 60, drops: [
     {item: "Copper Ore", chance: 0.3},
     {item: "Bone Fragment", chance: 0.3}
     ] },
    chance: 0.15
  },
  "MYSTERIOUS_STRANGER": {
    name: "Mysterious Stranger",
    description: "A cloaked figure approaches you on the road...",
    type: "dialogue",
    options: [
      { text: "Greet them politely", outcome: { gold: 50, item: "Healing Potion", message: "The stranger appreciates your manners and gifts you supplies." } },
      { text: "Draw your weapon", outcome: { combat: true, enemy: { name: "Mysterious Assassin", health: 100, Attack: 25, gold: 100, exp: 80 } } },
      { text: "Ignore and keep walking", outcome: { message: "You continue on your journey uneventfully." } }
    ],
    chance: 0.10
  },
  "TREASURE_FIND": {
    name: "Abandoned Treasure",
    description: "You stumble upon an abandoned chest partially buried off the path.",
    type: "loot",
    rewards: [
      { type: "gold", min: 50, max: 200 },
      { type: "item", items: ["Healing Potion", "Mana Potion", "Rare Herb"], chance: 0.7 }
    ],
    chance: 0.08
  },
  "INJURED_TRAVELER": {
    name: "Injured Traveler",
    description: "You find an injured traveler by the roadside. They need help.",
    type: "choice",
    options: [
      { 
        text: "Use a Healing Potion to help", 
        cost: { item: "Healing Potion", quantity: 1 },
        outcome: { 
          reward: { gold: 100, exp: 50, message: "The traveler gratefully rewards you before continuing their journey." },
          karma: 1 
        } 
      },
      { 
        text: "Rob the helpless traveler", 
        outcome: { 
          reward: { gold: 150, item: "Random Loot" },
          karma: -2,
          message: "You take what you can from the injured traveler and leave them to their fate." 
        } 
      },
      { 
        text: "Continue on your way", 
        outcome: { 
          message: "You decide not to get involved and continue your journey.",
          karma: -1
        } 
      }
    ],
    chance: 0.07
  },
  "MYSTIC_FOUNTAIN": {
    name: "Mystic Fountain",
    description: "You discover an ancient fountain glowing with magical energy.",
    type: "interaction",
    effects: [
      { text: "Drink from the fountain", outcome: { heal: 50, Mana: 50, message: "The magical waters restore your health and mana!" } },
      { text: "Make a wish and toss a coin", cost: { gold: 10 }, outcome: { randomEffect: true, message: "You make a wish and something magical happens..." } },
      { text: "Leave it alone", outcome: { message: "You decide not to tamper with ancient magic." } }
    ],
    chance: 0.05
  },
  "COMPANION_FIND": {
    name: "Wounded Animal",
    description: "You find a wounded animal by the roadside. It looks like it needs help.",
    type: "companion",
    chance: 0.03,
    options: [
      { 
        text: "Use a Healing Potion to help it", 
        cost: { item: "Healing Potion", quantity: 1 },
        outcome: { 
          companion: "Healing Sprite Companion",
          message: "The sprite gratefully accepts your help and decides to follow you as a companion!" 
        } 
      },
      { 
        text: "Try to calm it with food", 
        cost: { item: "Rare Herb", quantity: 2 },
        outcome: { 
          companion: "Battle Wolf Companion",
          message: "The wolf eats the herbs and seems to trust you now." 
        } 
      },
      { 
        text: "Leave it alone", 
        outcome: { 
          message: "You decide to continue on your journey." 
        } 
      }
    ]
  },
};


// QUEST OBJECTS
const quests = {
  'ANCIENT_RUINS_RELIC': {
    title: "The Ancient Relic",
    type: 'MAIN',
    description: "The Village Elder spoke of a powerful relic hidden in the Ancient Ruins. Find the map and claim the artifact.",
    npc: "Village Elder",
    location: "Village",
    startCondition: (p) => p.level >= 5,
    objective: { type: 'COLLECT', target: 'Ancient Relic', amount: 1 },
    reward: { gold: 1000, exp: 1000, item: 'Village Elder\'s Blessing' },
    dialogue: {
      start: ["Welcome, adventurer. The legends speak of an Ancient Relic of immense power, hidden within the ruins to the east.", "I believe you are the one destined to find it. But first, you'll need a map. It's said to be held by a rare creature of the wilds."],
      active: ["Have you found the Ancient Relic yet? The fate of the valley may depend on it."],
      complete: ["Incredible! You've returned with the relic! You are a true hero. Please, take this reward for your bravery."]
    },
    followUpQuest: 'DEFEAT_MOUNTAIN_DRAGON'
  },
  'DEFEAT_MOUNTAIN_DRAGON': {
    title: "The Mountain Dragon",
    type: 'MAIN',
    description: "A fearsome dragon has taken residence in the mountains, threatening all nearby lands. Slay the beast.",
    npc: "Village Elder",
    location: "Village",
    startCondition: (p) => p.quests['ANCIENT_RUINS_RELIC']?.status === 'COMPLETED',
    objective: { type: 'KILL', target: 'Mountain Dragon', amount: 1 },
    reward: { gold: 1000, exp: 1200, item: 'Dragon Slayer Sword' },
    dialogue: {
      start: ["Your work is not yet done, hero. The relic you found pulses with energy, reacting to a great threat in the mountains...", "A dragon has made its lair there. You must defeat it!"],
      active: ["Be swift, the dragon's presence grows stronger each day."],
      complete: ["You have done the impossible! The lands are safe once more. This Dragon Slayer Sword is now yours."]
    }
  },
  'MYSTIC_FOREST_TREANT': {
    title: "The Treant Bark Map",
    type: 'MAIN',
    description: "Rumors tell of an Ancient Treant in the Mystic Forest that holds a valuable map. Defeat it and claim the map.",
    npc: "Village Elder",
    location: "Village",
    startCondition: (p) => p.level >= 3,
    objective: { type: 'COLLECT', target: 'Treant Bark Map', amount: 1 },
    reward: { gold: 750, exp: 500 },
    dialogue: {
      start: ["The Mystic Forest is a dangerous place, but it's said that a map to its secrets is held by an Ancient Treant.", "Find this map and bring it back, if you can."],
      active: ["Have you found the map yet? Be careful, the Mystic Forest is not to be trifled with."],
      complete: ["Ah, the Treant Bark Map! You have proven your worth. Now you can find your way through the Mystic Forest."]
    }
  },
  'CRYSTAL_CAVERNS_RITUAL': {
    title: "Ice Mine Ritual",
    type: 'SIDE',
    description: "A mysterious figure in the Ice Mine needs 5 Crystal Shards for an ancient ritual.",
    npc: "Crystal Sage",
    location: "Ice Mine",
    startCondition: (p) => p.level >= 4 && p.stats.locationsVisited.includes("Ice Mine"),
    objective: { type: 'COLLECT', target: 'Crystal Shard', amount: 5 },
    reward: { gold: 600, exp: 400, item: "Crystal Amulet" },
    dialogue: {
      start: ["The crystals in these caverns resonate with ancient magic. I need 5 pure Crystal Shards for a ritual that could reveal hidden truths.", "Will you help me gather them?"],
      active: ["Have you found the 5 Crystal Shards yet? The ritual awaits."],
      complete: ["Excellent! These shards are perfect. The ritual can now begin. Take this Crystal Amulet as thanks - it will protect you."]
    }
  },
  'HERBALIST_HERBS': {
    title: "Herbalist's Herbs",
    type: 'SIDE',
    description: "The Herbalist in the Forest needs 5 Rare Herbs for a special Healing Amulet.",
    npc: "Herbalist",
    location: "Forest",
    startCondition: (p) => true,
    objective: { type: 'COLLECT', target: 'Rare Herb', amount: 5 },
    reward: { gold: 300, exp: 200, item: "Healing Amulet" },
    dialogue: {
      start: ["I need rare herbs from the Forest.", "Bring me 5 rare herbs and I'll craft a Healing Amulet."],
      active: ["How goes the herb gathering? I need 5 Rare Herbs in total."],
      complete: ["Ah, perfect! Thank you, adventurer. As promised, here is your Healing Amulet."]
    }
  },
  'MINER_GOBLINS': {
    title: "Miner's Goblin Problem",
    type: 'SIDE',
    description: "A Miner in the Cave is being harassed by Goblins. Defeat 5 of them and he'll reward you.",
    npc: "Miner",
    location: "Cave",
    startCondition: (p) => true,
    objective: { type: 'KILL', target: 'Goblin', amount: 5 },
    reward: { gold: 300, exp: 300, item: "Iron Pickaxe" },
    dialogue: {
      start: ["Goblins have overrun the mines, I can't get any work done!", "Please, defeat 5 of them for me. I'll give you my spare pickaxe."],
      active: ["Have you dealt with those Goblins yet? They're still causing a ruckus."],
      complete: ["You did it! It's much safer now. Thank you! Here is the Iron Pickaxe, as promised."]
    }
  },
  'DWARF_ALE': {
    title: "Dwarf's Stolen Ale",
    type: 'SIDE',
    description: "A Dwarf Warrior's ale was stolen by Frost Wolves. Retrieve 5 bottles from them.",
    npc: "Dwarf Warrior",
    location: "Mountain",
    startCondition: (p) => true,
    objective: { type: 'COLLECT', target: 'Dwarven Ale', amount: 5 },
    reward: { gold: 400, exp: 400, item: "Dwarven Mead" },
    dialogue: {
      start: ["The frost wolves stole my ale!", "Retrieve 5 bottles of ale from the Mountain and I'll reward you handsomely."],
      active: ["Still searching for my ale? Those wolves can't have gone far."],
      complete: ["My ale! You found it! I am in your debt, warrior. Take this, and my thanks!"]
    }
  },
  'FISHERMAN_NET': {
    title: "The Serpent Problem",
    type: 'SIDE',
    description: "A Fisherman's net was stolen by a serpent. He wants you to thin the numbers of River Serpents.",
    npc: "Fisherman",
    location: "River",
    startCondition: (p) => true,
    objective: { type: 'KILL', target: 'River Serpent', amount: 5 },
    reward: { gold: 300, exp: 300, item: "Fisherman's Net" },
    dialogue: {
      start: ["My best net was stolen by a serpent, but the real problem is how many of them there are!", "Defeat 5 River Serpents to make the waters safer, and I'll give you a new net."],
      active: ["The waters are still dangerous. Have you defeated 5 of the serpents yet?"],
      complete: ["Thank you! The river feels much safer for fishing now. Here is the net I promised."]
    }
  },
  'BLACKSMITH_ORE': {
    title: "Blacksmith's Ore Delivery",
    type: 'SIDE',
    description: "The Blacksmith needs 10 Copper Ore to fulfill an order. Bring them to him.",
    npc: "Blacksmith",
    location: "Blacksmith's Forge",
    startCondition: (p) => p.level >= 4 && p.location === "Blacksmith's Forge",
    objective: { type: 'COLLECT', target: 'Copper Ore', amount: 10 },
    reward: { gold: 250, exp: 300, item: "Iron Sword" },
    dialogue: {
      start: ["I've got a big order to fill but I'm running low on Copper Ore.", "Could you bring me 10 pieces? I'll make it worth your while."],
      active: ["How's that ore collection coming along? I need 10 Copper Ore."],
      complete: ["Perfect! This will keep me going for a while. Here's your reward."]
    }
  },
  'MYSTIC_FOREST_RITUAL': {
    title: "Mystic Forest Ritual",
    type: 'SIDE',
    description: "A Mystic Sprite needs 3 Mystic Stones for an ancient ritual. Find them in the Mystic Forest.",
    npc: "Mystic Sprite",
    location: "Mystic Forest",
    startCondition: (p) => p.level >= 7 && p.stats.locationsVisited.includes("Mystic Forest"),
    objective: { type: 'COLLECT', target: 'Mystic Stone', amount: 3 },
    reward: { gold: 200, exp: 150, item: "Mystic Owl Companion"},
    dialogue: {
      start: ["The ancient stones of this forest hold great power.", "I need 3 Mystic Stones for a ritual. Can you help me?"],
      active: ["Have you found the Mystic Stones yet? I need 3 of them."],
      complete: ["Wonderful! These stones will help restore balance to the forest. Thank you!"]
    }
  },
  'FIND_BATTLE_WOLF': {
    title: "The Lone Wolf",
    type: 'SIDE',
    description: "A hunter in the Forest wants you to track down and befriend a rare white wolf.",
    npc: "Hunter",
    location: "Forest",
    startCondition: (p) => p.level >= 3,
    objective: { type: 'COLLECT', target: 'Wolf Whistle', amount: 1 },
    reward: { gold: 400, exp: 300, item: "Battle Wolf Companion" },
    dialogue: {
      start: ["I've seen a magnificent white wolf in the deep forest. It's unlike any other.", "If you can befriend it using this special whistle, it might join you as a companion."],
      active: ["Any luck finding that white wolf? Use the whistle I gave you near wolf tracks."],
      complete: ["Amazing! The wolf actually accepted you. It must see something special in you."]
    }
  }
};
Object.values(quests).forEach(quest => {
  if (quest.reward) {
    if (quest.reward.gold) quest.reward.gold = Math.floor(quest.reward.gold * 0.7);
    if (quest.reward.exp) quest.reward.exp = Math.floor(quest.reward.exp * 0.75);
  }
});


//DAILY CHALLENGES
const dailyChallenges = {
  "challenge_1": { 
    title: "Goblin Hunter",
    objective: "KILL", 
    target: "Goblin", 
    amount: 10,
    reward: { gold: 500, exp: 300, item: "Healing Potion" }
  },
  "challenge_2": { 
    title: "Herbalist Apprentice",
    objective: "COLLECT", 
    target: "Rare Herb", 
    amount: 8,
    reward: { gold: 400, exp: 250, item: "Mana Potion" }
  },
  "challenge_3": { 
    title: "Ore Miner",
    objective: "COLLECT", 
    target: "Copper Ore", 
    amount: 15,
    reward: { gold: 600, exp: 350, item: "Iron Sword" }
  },
  "challenge_4": { 
    title: "Serpent Slayer",
    objective: "KILL", 
    target: "River Serpent", 
    amount: 7,
    reward: { gold: 550, exp: 400, item: "Trap Kit" }
  },
  "challenge_5": { 
    title: "Treasure Hunter",
    objective: "COLLECT", 
    target: "Rare Gem", 
    amount: 3,
    reward: { gold: 700, exp: 500, item: "Leather Armor" }
  }
};


//ACHIEVEMENTS
const achievements = {
  "first_blood": {
    name: "First Blood",
    desc: "Defeat your first enemy",
    reward: { gold: 100, exp: 50 },
    icon: "🩸",
    check: (player) => player.stats?.enemiesDefeated >= 1
  },
  "veteran": {
    name: "Battle Veteran",
    desc: "Defeat 100 enemies",
    reward: { gold: 500, exp: 300, item: "Steel Sword" },
    icon: "⚔️",
    check: (player) => player.stats?.enemiesDefeated >= 100
  },
  "slayer": {
    name: "Monster Slayer",
    desc: "Defeat 500 enemies",
    reward: { gold: 1500, exp: 1000, item: "Golden Sword" },
        icon: "🔪",
    check: (player) => player.stats?.enemiesDefeated >= 500
  },
  "dragon_slayer": {
    name: "Dragon Slayer",
    desc: "Defeat the Mountain Dragon",
    reward: { gold: 600, exp: 1200 },
    icon: "🐉",
    check: (player) => player.bossesDefeated?.includes("Mountain Dragon")
  },
  "first_quest": {
    name: "First Mission",
    desc: "Complete your first quest",
    reward: { gold: 150, exp: 100 },
    icon: "📜",
    check: (player) => Object.values(player.quests || {}).filter(q => q.status === 'COMPLETED').length >= 1
  },
  "quest_master": {
    name: "Quest Master",
    desc: "Complete 10 quests",
    reward: { gold: 1000, exp: 750 },
    icon: "🏆",
    check: (player) => Object.values(player.quests || {}).filter(q => q.status === 'COMPLETED').length >= 10
  },
  "main_story": {
    name: "Hero of the Realm",
    desc: "Complete all main story quests",
    reward: { gold: 2000, exp: 1500,item: "Emberglow Ring" },
    icon: "👑",
    check: (player) => {
      const mainQuests = Object.entries(quests || {})
      .filter(([id, q]) => q.type === 'MAIN')
      .map(([id]) => id);
    return mainQuests.every(id => player.quests?.[id]?.status === 'COMPLETED');
    }
  },
  "explorer": {
    name: "World Explorer",
    desc: "Visit all locations",
    reward: { gold: 1200, exp: 800 },
    icon: "🗺️",
    check: (player) => {
      const visited = player.stats?.locationsVisited || [];
      return locations.every(loc => visited.includes(loc));
    }
  },
  "master_explorer": {
    name: "Exploration Master",
    desc: "Complete 25 explorations",
    reward: { gold: 2000, exp: 1200 },
    icon: "🏰",
    check: (player) => player.stats?.explorationsCompleted >= 25
  },
  "apprentice_crafter": {
    name: "Apprentice Crafter",
    desc: "Craft your first item",
    reward: { gold: 300, exp: 200 },
    icon: "🔨",
    check: (player) => player.stats?.itemsCrafted >= 1
  },
  "master_crafter": {
    name: "Master Crafter",
    desc: "Craft 20 items",
    reward: { gold: 1500, exp: 1000 },
    icon: "⚒️",
    check: (player) => player.stats?.itemsCrafted >= 20
  },
  "wealthy": {
    name: "Wealthy Adventurer",
    desc: "Accumulate 5000 gold",
    reward: { gold: 1000, exp: 500 },
    icon: "💰",
    check: (player) => player.stats?.totalGoldEarned >= 5000
  },
  "tycoon": {
    name: "Tycoon",
    desc: "Accumulate 20000 gold",
    reward: { gold: 3000, exp: 2000 },
    icon: "💎",
    check: (player) => player.stats?.totalGoldEarned >= 20000
  },
  "shopkeeper": {
    name: "Shopkeeper's Best Friend",
    desc: "Purchase 50 items from the shop",
    reward: { gold: 800, exp: 400 },
    icon: "🛒",
    check: (player) => player.stats?.itemsPurchased >= 50
  },
  "novice": {
    name: "Novice Adventurer",
    desc: "Reach level 10",
    reward: { gold: 500, exp: 300 },
    icon: "⭐",
    check: (player) => player.level >= 10
  },
  "champion": {
    name: "Champion",
    desc: "Reach level 25",
    reward: { gold: 2000, exp: 1500 },
    icon: "🌟",
    check: (player) => player.level >= 25
  },
  "legend": {
    name: "Living Legend",
    desc: "Reach level 50",
    reward: { gold: 5000, exp: 3000, item: "Thunderfury Blade" },
    icon: "✨",
    check: (player) => player.level >= 50
  },
  "collector": {
    name: "Collector",
    desc: "Obtain 30 different items",
    reward: { gold: 1000, exp: 600 },
    icon: "🎒",
    check: (player) => Object.keys(player.inventory || {}).length >= 30
  },
  "hoarder": {
    name: "Hoarder",
    desc: "Obtain 75 different items",
    reward: { gold: 2500, exp: 1500 },
    icon: "📦",
    check: (player) => Object.keys(player.inventory || {}).length >= 75
  },
  "master_of_arts": {
    name: "Master of Arts",
    desc: "Learn all skills for your class",
    reward: { gold: 1800, exp: 1200 },
    icon: "🎓",
    check: (player) => {
      const classSkills = skillUnlocks[player.class] ? Object.values(skillUnlocks[player.class]) : [];
      return (player.skills || []).length >= classSkills.length;
    }
  },
  "daily_player": {
    name: "Daily Player",
    desc: "Complete 7 daily challenges",
    reward: { gold: 1500, exp: 1000 },
    icon: "📅",
    check: (player) => Object.keys(player.dailyChallenges?.completed || {}).length >= 7
  },
  "challenge_master": {
    name: "Challenge Master",
    desc: "Complete 30 daily challenges",
    reward: { gold: 4000, exp: 2500 },
    icon: "🏅",
    check: (player) => Object.keys(player.dailyChallenges?.completed || {}).length >= 30
  },
  "dungeon_crawler": {
    name: "Dungeon Crawler",
    desc: "Reach floor 10 in the Infinite Dungeon",
    reward: { gold: 2000, exp: 1500, item: "Void Crystal" },
    icon: "🏰",
    check: (player) => player.stats?.highestDungeonFloor >= 10
  },
  "dungeon_master": {
    name: "Dungeon Master",
    desc: "Reach floor 25 in the Infinite Dungeon",
    reward: { gold: 5000, exp: 3000, item: "Cosmic Fragment" },
    icon: "👑",
    check: (player) => player.stats?.highestDungeonFloor >= 25
  }
};


// LEVEL-UP CONFIGURATION
const levelUpStatGrowth = {
  MaxHealth: (level, classBase) => Math.floor(classBase * 0.1 + level * 2),
  maxMana: (level, classBase) => Math.floor(classBase * 0.08 + level * 1.5),
  Attack: (level, classBase) => Math.floor(classBase * 0.07 + level * 1.2)
};


//SKILL UNLOCK
const skillUnlocks = {
  Warrior: {
    1: { name: "Power Strike", desc: "Deals 150% damage.", type: "Attack", ManaCost: 10, cooldown: 2 },
    3: { name: "Shield Block", desc: "Halve next damage.", type: "defense", ManaCost: 15, cooldown: 3 },
    6: { name: "Shield Bash", desc: "Defends and counters with 50% of your Attack.", type: "counter", ManaCost: 20, cooldown: 4},
    9: { name: "Battle Cry", desc: "Increases your Attack by 50% for 2 turns.", type: "buff", ManaCost: 25, cooldown: 5}
  },
  Mage: {
    1: { name: "Fireball", desc: "Deals 150% damage and burns.", type: "Attack",  ManaCost: 10, cooldown: 2 },
    3: { name: "Mana Shield", desc: "Reduces next damage by 70%.", type: "defense",  ManaCost: 15, cooldown: 3 },
    6: { name: "Arcane Burst", desc: "Massive damage but stuns you next turn.", type: "Attack",  ManaCost: 20, cooldown: 5},
    9: { name: "Teleport", desc: "Escape from combat instantly.", type: "utility", ManaCost: 25, cooldown: 10}
  },
  Rogue: {
    1: { name: "Sneak Attack", desc: "50% chance for a critical hit.", type: "Attack", chance: 0.5, ManaCost: 10, cooldown: 2 },
    3: { name: "Dodge Roll", desc: "A 70% chance to evade the next Attack completely.", type: "defense", chance: 0.7, ManaCost: 15, cooldown: 3 },
    6: { name: "Poison Blade", desc: "Applies a damage-over-time effect.", type: "Attack", dot: 10, duration: 3, ManaCost: 20, cooldown: 4},
    9: { name: "Smoke Bomb", desc: "Guaranteed escape from combat.", type: "utility", ManaCost: 25, cooldown: 8}
  },
  Bard: {
    1: { name: "Inspiring Song", desc: "Heals you for a small amount.", type: "heal", ManaCost: 10, cooldown: 2 },
    3: { name: "Siren's Call", desc: "Causes the enemy to miss their next Attack.", type: "debuff", ManaCost: 15, cooldown: 3 },
    6: { name: "Hero's Anthem", desc: "Buffs your Attack by 20% for 3 turns.", type: "buff", ManaCost: 20, cooldown: 5},
    9: { name: "Resurrection Hymn", desc: "Revives you from death with 50% health.", type: "utility", revive: true, ManaCost: 30, cooldown: 15}
  }
};


// CLASSES
const CLASSES = {
  Warrior: {
    MaxHealth: 250,
    maxMana: 75,
    Attack: 25,
    skills: [skillUnlocks.Warrior[1]],
    icon: "⚔️"
  },
  Mage: {
    MaxHealth: 175,
    maxMana: 125,
    Attack: 30,
    skills: [skillUnlocks.Mage[1]],
    icon: "🧙‍♂️"
  },
  Rogue: {
    MaxHealth: 200,
    maxMana: 100,
    Attack: 30,
    skills: [skillUnlocks.Rogue[1]],
    icon: "🗡️"
  },
  Bard: {
    MaxHealth: 225,
    maxMana: 110,
    Attack: 25,
    skills: [skillUnlocks.Bard[1]],
    icon: "📜"
  }
};


// ITEMS / SHOP
const shopItems = {
  "Trap Kit": { price: 100, type: "consumable", category: "Traps", icon: "🪤" },
  "Healing Potion": { price: 50, type: "consumable", category: "Potions", heal: 50, icon: "🧪" },
  "Mega Healing Potion": { price: 200, type: "consumable", category: "Potions", heal: 150, icon: "💖" },
  "Mana Potion": { price: 80, type: "consumable", category: "Potions", Mana: 50, icon: "🔮" },
  "Mega Mana Potion": { price: 250, type: "consumable", category: "Potions", Mana: 150, icon: "🌌" },
  "Phoenix": { price: 1500, type: "consumable", category: "Special", revive: true, icon: "🔥", nonSellable: true },
  "Strength Elixir": { price: 120, type: "consumable", category: "Potions", effect: { stat: "Attack", modifier: 0.15, duration: 5 }, icon: "💪" },
  "Fortitude Potion": { price: 150, type: "consumable", category: "Potions", effect: { stat: "MaxHealth", modifier: 0.2, duration: 5 }, icon: "🛡️" },
  "Wisdom Draught": { price: 140, type: "consumable", category: "Potions", effect: { stat: "maxMana", modifier: 0.25, duration: 5 }, icon: "📚" },
  "Vampiric Blade": { price: 800, type: "weapon", category: "Weapons", bonus: { Attack: 15 }, special: "Lifesteal", value: 0.1, icon: "⚔️" },
  "Manaweave Robes": { price: 700, type: "armor", category: "Armor", bonus: { MaxHealth: 60, Mana: 30 }, special: "ManaShield", value: 0.15, icon: "👘" },
  "Swiftfoot Boots": { price: 600, type: "accessory", category: "Accessories", bonus: { Attack: 5, MaxHealth: 20 }, special: "Dodge", value: 0.08, icon: "👟" },
  "Steel Ingot": { price: 75, type: "material", category: "Materials", icon: "🔩" },
  "Reinforced Leather": { price: 60, type: "material", category: "Materials", icon: "🧵" },
  "Dragon Scale": { price: 120, type: "material", category: "Materials", icon: "🐉" },
  "Enchanted Essence": { price: 80, type: "material", category: "Materials", icon: "✨" },
  "Ancient Core": { price: 200, type: "material", category: "Materials", icon: "🔮" },
  "Treant Bark": { price: 30, type: "material", category: "Materials", icon: "🌳" },
  "Mystic Stone": { price: 50, type: "material", category: "Materials", icon: "🔮" },
  "Coral Fragment": { price: 25, type: "material", category: "Materials", icon: "🐚" },
  "Dwarven Mead": { price: 0, type: "consumable", category: "Potions", heal: 100, Mana: 100, icon: "🍺", nonSellable: true, unique: true, infinite: true },
  "Ancient Relic Map": { price: 0, type: "unique", category: "Quest", icon: "🗺️", nonSellable: true },
  "Blacksmith's Hammer": { price: 0, type: "unique", category: "Quest", icon: "🔨", nonSellable: true },
  "Treant Bark Map": { price: 0, type: "unique", category: "Quest", icon: "🗺️", nonSellable: true },
  "Coral Fragment Map": { price: 0, type: "unique", category: "Quest", icon: "🗺️", nonSellable: true },
  "Thunderfury Blade": { price: 0, type: "weapon", category: "Weapons", bonus: { Attack: 50 }, icon: "⚔️", nonSellable: true, legendary: true, unique: true },
  "Aegis Shield": { price: 0, type: "armor", category: "Armor", bonus: { MaxHealth: 200, Attack: 15 }, icon: "🛡️", nonSellable: true, legendary: true, unique: true },
  "Iron Sword": { price: 150, type: "weapon", category: "Weapons", bonus: { Attack: 5 }, icon: "⚔️" },
  "Steel Sword": { price: 400, type: "weapon", category: "Weapons", bonus: { Attack: 10 }, icon: "⚔️" },
  "Silver Sword": { price: 750, type: "weapon", category: "Weapons", bonus: { Attack: 15 }, icon: "⚔️" },
  "Golden Sword": { price: 1200, type: "weapon", category: "Weapons", bonus: { Attack: 20 }, icon: "⚔️" },
  "Obsidian Blade": { price: 2500, type: "weapon", category: "Weapons", bonus: { Attack: 30 }, icon: "⚔️" },
  "Leather Armor": { price: 120, type: "armor", category: "Armor", bonus: { MaxHealth: 20 }, icon: "🛡️" },
  "Chainmail Armor": { price: 300, type: "armor", category: "Armor", bonus: { MaxHealth: 40 }, icon: "🛡️" },
  "Steel Armor": { price: 600, type: "armor", category: "Armor", bonus: { MaxHealth: 60 }, icon: "🛡️" },
  "Golden Armor": { price: 1000, type: "armor", category: "Armor", bonus: { MaxHealth: 100 }, icon: "🛡️" },
  "Obsidian Armor": { price: 2000, type: "armor", category: "Armor", bonus: { MaxHealth: 180 }, icon: "🛡️" },
  "Emberglow Ring": { price: 0, type: "accessory", category: "Accessories", bonus: { Attack: 10, MaxHealth: 20 }, icon: "💍", nonSellable: true, legendary: true, unique: true },
  "Rare Gem": { price: 200, type: "sellable", category: "Loot", icon: "💎" },
  "Ancient Coin": { price: 350, type: "sellable", category: "Loot", icon: "🪙" },
  "Copper Ore": { price: 10, type: "sellable", category: "Loot", icon: "🪨" },
  "Silver Ore": { price: 25, type: "sellable", category: "Loot", icon: "🪨" },
  "Gold Ore": { price: 50, type: "sellable", category: "Loot", icon: "🪨" },
  "Water Orb": { price: 80, type: "sellable", category: "Loot", icon: "🔵" },
  "Small Fish": { price: 5, type: "sellable", category: "Loot", icon: "🐟" },
  "Salmon": { price: 15, type: "sellable", category: "Loot", icon: "🐠" },
  "Golden Fish": { price: 40, type: "sellable", category: "Loot", icon: "🐡" },
  "Goblin Ear": { price: 15, type: "sellable", category: "Loot", icon: "👂" },
  "Bone Fragment": { price: 12, type: "sellable", category: "Loot", icon: "🦴" },
  "Enchanted Arrowhead": { price: 20, type: "sellable", category: "Loot", icon: "🏹" },
  "Rare Herb": { price: 25, type: "sellable", category: "Loot", icon: "🌿" },
  "River Serpent Scale": { price: 15, type: "sellable", category: "Loot", icon: "🪶" },
  "Frost Wolf Pelt": { price: 15, type: "sellable", category: "Loot", icon: "🐺" },
  "Treant Bark": { price: 30, type: "sellable", category: "Loot", icon: "🌳" },
  "Mystic Stone": { price: 50, type: "sellable", category: "Loot", icon: "🔮" },
  "Coral Fragment": { price: 25, type: "sellable", category: "Loot", icon: "🐚" },
  "Dwarven Ale": { price: 40, type: "sellable", category: "Loot", icon: "🍺" },
  "Iron Pickaxe": { price: 0, type: "unique", category: "Quest", icon: "⛏️", nonSellable: true },
  "Fisherman's Net": { price: 0, type: "unique", category: "Quest", icon: "🕸️", nonSellable: true },
  "Healing Amulet": { price: 0, type: "unique", category: "Quest", icon: "❣️", nonSellable: true },
  "Village Elder's Blessing": { price: 0, type: "unique", category: "Quest", icon: "✨", nonSellable: true },
  "Dragon Slayer Sword": { price: 0, type: "weapon", category: "Weapons", bonus: { Attack: 45 }, icon: "⚔️", nonSellable: true, unique: true, unique_effect: { target: "Mountain Dragon", bonus: 1.5 } },
  "Blacksmith's Hammer": { price: 0, type: "unique", category: "Quest", icon: "🔨", nonSellable: true },
  "Ancient Relic": { price: 0, type: "unique", category: "Special", icon: "🏺", nonSellable: true, unique: true, unique_effect: { bonusAttack: 10, bonusMaxHealth: 50 }, permanent: true,
    description: "An ancient artifact pulsing with mysterious energy. Grants permanent bonuses to Attack and health." },
  "Ancient Treant Robes": { price: 0, type: "armor", category: "Armor", bonus: { MaxHealth: 200, Mana: 50 }, icon: "🛡️", nonSellable: true, unique: true,
    description: "Robes woven from the bark of the Ancient Treant. Provide exceptional protection and Mana enhancement." },
  "Coral Blade": { price: 0, type: "weapon", category: "Weapons", bonus: { Attack: 40, Mana: 25 }, icon: "⚔️", nonSellable: true, unique: true,
    description: "A blade forged from enchanted coral. Exceptionally sharp and enhances magical abilities." },
  "Crystal Shard": { price: 45, type: "material", category: "Materials", icon: "🔮" },
  "Geode Core": { price: 60, type: "material", category: "Materials", icon: "💎" },
  "Shadow Essence": { price: 55, type: "material", category: "Materials", icon: "👻" },
  "Crystal Amulet": { price: 0, type: "accessory", category: "Quest", bonus: { MaxHealth: 30, Mana: 20 },icon: "💠", nonSellable: true, description: "A gift from the Crystal Sage. Provides minor boosts to health and mana." },
  "Void Crystal": { price: 300, type: "material", category: "Special Materials", icon: "⚫", description: "A crystal that seems to absorb light. Used in crafting powerful void-themed equipment." },
  "Cosmic Fragment": { price: 500, type: "material", category: "Special Materials", icon: "🌌", description: "A piece of celestial material that glows with cosmic energy. Essential for high-tier crafting." },
  "Primordial Essence": { price: 400, type: "material", category: "Special Materials", icon: "🔥",description: "The raw essence of creation itself. Can be used to craft legendary items." },
  "Void Blade": { type: "weapon", category: "weapon", bonus: { Attack: 35 }, special: "VoidStrike", value: 0.15, description: "A blade that seems to cut through reality itself. Has a chance to ignore enemy defense." },
  "Cosmic Armor": { type: "armor", category: "armor",bonus: { MaxHealth: 120, Mana: 50 },special: "CosmicBarrier",value: 0.2, description: "Armor infused with cosmic energy. Provides excellent protection and has a chance to create a protective barrier when hit." },
  "Primordial Staff": { type: "weapon", category: "weapon", bonus: { Attack: 25, Mana: 60 }, special: "PrimordialPower", value: 1.25, description: "A staff channeling primordial forces. Increases magic damage significantly." },
  "Crystal Crown": { 
    price: 0, 
    type: "accessory", 
    category: "Special", 
    bonus: { MaxHealth: 80, Mana: 40, Attack: 12 },
    special: "CrystalProtection", 
    value: 0.1,
    icon: "👑", 
    nonSellable: true, 
    unique: true,
    description: "A crown forged from the purest crystals. Provides excellent protection and enhances magical abilities with a chance to reflect damage."
  },
  "Emberglow Amulet": { 
    price: 0, 
    type: "accessory", 
    category: "Special", 
    bonus: { Attack: 15, MaxHealth: 30, Mana: 20 },
    special: "FireAura", 
    value: 0.2,
    icon: "🔥", 
    nonSellable: true, 
    unique: true,
    description: "An upgraded version of the Emberglow Ring, pulsating with intense fiery energy. Grants enhanced stats and has a 20% chance to burn attackers when struck."
  },
  "Ancient Treant Robes II": { 
    price: 0, 
    type: "armor", 
    category: "Special", 
    bonus: { MaxHealth: 250, Mana: 75 },
    special: "NatureRegen", 
    value: 5,
    icon: "🌿", 
    nonSellable: true, 
    unique: true,
    description: "Enhanced robes woven from the ancient Treant's most sacred bark. Provides exceptional protection and mana enhancement, with the added ability to regenerate health in forest areas."
  },
  "Dragon Slayer Sword II": { 
    price: 0, 
    type: "weapon", 
    category: "Special", 
    bonus: { Attack: 60 },
    special: "DragonSlayer", 
    value: 1.5,
    icon: "🐉⚔️", 
    nonSellable: true, 
    unique: true,
    description: "A masterfully reforged Dragon Slayer Sword, now even more deadly against draconic foes. Deals 150% bonus damage against dragons and has significantly increased attack power."
  }
};


//SHOP UNLOCK
const shopUnlocks = {
  1: ["Healing Potion", "Mana Potion", "Iron Sword", "Leather Armor"],
  2: ["Mega Healing Potion", "Mega Mana Potion", "Trap Kit", "Strength Elixir"],
  3: ["Steel Sword", "Steel Armor", "Phoenix", "Fortitude Potion"],
  4: ["Golden Sword", "Golden Armor", "Wisdom Draught", "Vampiric Blade"],
  5: ["Obsidian Blade", "Obsidian Armor", "Manaweave Robes", "Swiftfoot Boots"]
};


// CRAFTING RECIPES
const craftingRecipes = {
  "Reinforced Leather": { 
    materials: { "Frost Wolf Pelt": 2, "River Serpent Scale": 3 }, 
    type: "material", 
    successRate: 0.9 
  },
  "Steel Ingot": { 
    materials: { "Copper Ore": 3, "Silver Ore": 1 }, 
    type: "material", 
    successRate: 0.95 
  },
  "Golden Sword": { 
    materials: { "Steel Sword": 1, "Gold Ore": 3, "Steel Ingot": 1 }, 
    type: "weapon", 
    successRate: 0.8 
  },
  "Golden Armor": { 
    materials: { "Steel Armor": 1, "Gold Ore": 5 }, 
    type: "armor", 
    successRate: 0.8 
  },
  "Obsidian Blade": { 
    materials: { "Golden Sword": 1, "Ancient Core": 2, "Dragon Scale": 1 }, 
    type: "weapon", 
    successRate: 1 
  },
  "Obsidian Armor": { 
    materials: { "Golden Armor": 1, "Ancient Core": 3, "Reinforced Leather": 2 }, 
    type: "armor", 
    successRate: 1
  },
  "Crystal Amulet": { 
  materials: { "Crystal Shard": 3, "Silver Ore": 2 }, 
  type: "accessory", 
  successRate: 1 
  },
  "Void Blade": { 
    materials: { "Steel Sword": 1, "Void Crystal": 2, "Shadow Essence": 3 }, 
    type: "weapon", 
    successRate: 1
  },
  "Cosmic Armor": { 
    materials: { "Steel Armor": 1, "Cosmic Fragment": 1, "Geode Core": 3 }, 
    type: "armor", 
    successRate: 1
  },
  "Primordial Staff": { 
    materials: { "Ancient Core": 1, "Primordial Essence": 2, "Mystic Stone": 3 }, 
    type: "weapon", 
    successRate: 1
  },
  "Coral Blade": { 
    materials: { "Silver Sword": 1, "Coral Fragment": 5, "Water Orb": 3 }, 
    type: "weapon", 
    successRate: 1 
  },
  "Rare Gem": { 
    materials: { "Gold Ore": 5, "Mystic Stone": 2 }, 
    type: "material", 
    successRate: 0.6 
  },
  "Vampiric Blade": { 
    materials: { "Steel Sword": 1, "Dragon Scale": 2, "Enchanted Essence": 3 }, 
    type: "weapon", 
    successRate: 0.9 
  },
  "Manaweave Robes": { 
    materials: { "Chainmail Armor": 1, "Enchanted Essence": 5, "Mystic Stone": 2 }, 
    type: "armor", 
    successRate: 1
  },
  "Dragon Slayer Sword II": { 
    materials: { "Dragon Slayer Sword": 1, "Dragon Scale": 5, "Ancient Core": 1 }, 
    type: "weapon", 
    successRate: 1,
    requires: ["DEFEAT_MOUNTAIN_DRAGON"],
  },
  "Ancient Treant Robes II": { 
    materials: { "Ancient Treant Robes": 1, "Treant Bark": 10, "Enchanted Essence": 5 }, 
    type: "armor", 
    successRate: 1,
    requires: ["MYSTIC_FOREST_TREANT"],
  },
  "Emberglow Amulet": {
    materials: { "Emberglow Ring": 1, "Gold Ore": 10, "Ancient Core": 1 },
    type: "accessory",
    category: "special",
    successRate: 1,
    requires: ["ANCIENT_RUINS_RELIC"],
  }
};


// COMPANIONS SYSTEM
const companions = {
  "Battle Wolf Companion": {
    name: "Battle Wolf Companion",
    type: "combat",
    description: "A loyal wolf companion that fights by your side with fierce attacks and protective howls.",
    acquisition: "Complete 'The Lone Wolf' quest from the Hunter in the Forest",
    stats: { 
      health: 100, 
      attack: 15, 
      level: 1,
      exp: 0
    },
    skills: [
      { 
        name: "Bite", 
        damage: 20, 
        cooldown: 2, 
        description: "The wolf bites an enemy for moderate damage.",
        effect: "damage"
      },
      { 
        name: "Howl", 
        effect: "buff", 
        stat: "Attack", 
        value: 1.2, 
        duration: 2, 
        cooldown: 4, 
        description: "The wolf howls, increasing your Attack by 20% for 2 turns." 
      },
      { 
        name: "Savage Charge", 
        damage: 35, 
        cooldown: 3, 
        description: "The wolf charges fiercely, dealing heavy damage and having a 25% chance to stun the enemy.",
        effect: "damage",
        chance: 0.25,
        stun: 1
      },
      { 
        name: "Pack Leader", 
        effect: "buff", 
        stat: "Attack", 
        value: 1.3, 
        duration: 3, 
        cooldown: 6, 
        description: "The wolf inspires you with leadership, increasing Attack by 30% for 3 turns." 
      }
    ],
    passive: "Increases damage against beast-type enemies by 15%",
    icon: "🐺",
    unlockLevel: 1
  },
  "Mystic Owl Companion": {
    name: "Mystic Owl Companion",
    type: "utility", 
    description: "A wise owl that provides magical assistance, mana restoration, and reveals enemy weaknesses.",
    acquisition: "Complete the 'Mystic Forest Ritual' quest from the Mystic Sprite",
    stats: { 
      health: 60, 
      mana: 50, 
      level: 1,
      exp: 0
    },
    skills: [
      { 
        name: "Wisdom Gaze", 
        effect: "debuff", 
        stat: "defense", 
        value: 0.8, 
        duration: 2, 
        cooldown: 3, 
        description: "The owl reveals enemy weaknesses, reducing their defense by 20% for 2 turns." 
      },
      { 
        name: "Mana Transfer", 
        effect: "restore", 
        amount: 30, 
        cooldown: 3, 
        description: "The owl transfers mana to you, restoring 30 MP." 
      },
      { 
        name: "Arcane Insight", 
        effect: "buff", 
        stat: "maxMana", 
        value: 1.25, 
        duration: 4, 
        cooldown: 5, 
        description: "The owl shares arcane knowledge, increasing your maximum mana by 25% for 4 turns." 
      },
      { 
        name: "Precognitive Warning", 
        effect: "evade", 
        chance: 0.5, 
        duration: 2, 
        cooldown: 6, 
        description: "The owl warns you of incoming attacks, giving you a 50% chance to evade for 2 turns." 
      }
    ],
    passive: "Increases mana regeneration by 20% and reveals enemy stats in bestiary after first encounter",
    icon: "🦉",
    unlockLevel: 3
  },
  "Treasure Goblin Companion": {
    name: "Treasure Goblin Companion",
    type: "economic",
    description: "A mischievous goblin that helps find treasure, extra gold, and rare items from battles.",
    acquisition: "Defeat the Crystal Golem boss",
    stats: { 
      health: 40, 
      level: 1,
      exp: 0
    },
    skills: [
      { 
        name: "Lucky Find", 
        effect: "gold", 
        multiplier: 1.5, 
        cooldown: 5, 
        description: "The goblin finds extra gold after battle, increasing gold gain by 50% for this fight." 
      },
      { 
        name: "Item Sense", 
        effect: "loot", 
        chance: 1.3, 
        cooldown: 6, 
        description: "The goblin's keen senses increase item drop chance by 30% for this battle." 
      },
      { 
        name: "Pocket Loot", 
        effect: "steal", 
        chance: 0.4, 
        cooldown: 4, 
        description: "The goblin attempts to steal an extra item from the enemy (40% success rate)." 
      },
      { 
        name: "Treasure Magnet", 
        effect: "gold", 
        multiplier: 2.0, 
        duration: 1, 
        cooldown: 8, 
        description: "The goblin becomes a magnet for treasure, doubling gold found in this battle." 
      }
    ],
    passive: "Increases gold find by 25% and has a 5% chance to find rare items after battles",
    icon: "👺",
    unlockLevel: 2
  },
  "Healing Sprite Companion": {
    name: "Healing Sprite Companion",
    type: "support",
    description: "A small nature spirit that provides healing, status cleansing, and health regeneration.",
    acquisition: "Random Travel Event",
    stats: { 
      health: 70, 
      mana: 40, 
      level: 1,
      exp: 0
    },
    skills: [
      { 
        name: "Nature's Touch", 
        heal: 40, 
        cooldown: 3, 
        description: "The sprite heals you for a moderate amount of health.",
        effect: "heal"
      },
      { 
        name: "Revitalize", 
        effect: "cleanse", 
        cooldown: 6, 
        description: "Removes all negative effects from you and provides minor healing." 
      },
      { 
        name: "Bloom of Life", 
        heal: 75, 
        cooldown: 5, 
        description: "The sprite channels nature's energy for a powerful heal.",
        effect: "heal"
      },
      { 
        name: "Eternal Spring", 
        effect: "regen", 
        heal: 15, 
        duration: 4, 
        cooldown: 8, 
        description: "Creates a healing aura that regenerates 15 HP per turn for 4 turns." 
      }
    ],
    passive: "Provides gradual health regeneration (5 HP per turn) out of combat and increases healing potion effectiveness by 20%",
    icon: "✨",
    unlockLevel: 1
  },
};


//BESTIARY SYSTEM
const bestiary = {
  "Forest Wolf": {
    name: "Forest Wolf",
    lore: "Common predators found throughout the forest. Hunt in packs and are fiercely territorial.",
    locations: ["Forest"],
    stats: { health: "60", attack: "13", gold: "25", exp: "35" },
    weaknesses: ["Fire", "Piercing"],
    resistances: ["Cold"],
    drops: ["Rare Herb", "Frost Wolf Pelt", "Bone Fragment"],
    trivia: "Wolf pelts are highly valued by hunters and craftsmen for their durability.",
    behavior: "Aggressive when threatened, often attacks in packs"
  },
  "Forest Spirit": {
    name: "Forest Spirit", 
    lore: "Ancient nature spirits that protect the forest. They manifest when the balance of nature is threatened.",
    locations: ["Forest"],
    stats: { health: "80", attack: "17", gold: "40", exp: "55" },
    weaknesses: ["Iron", "Holy"],
    resistances: ["Nature", "Magic"],
    drops: ["Rare Herb", "Enchanted Arrowhead", "Mystic Stone"],
    trivia: "Some say these spirits can be appeased with offerings of rare herbs.",
    behavior: "Defensive, attacks those who harm the forest"
  },
  "Alpha Wolf": {
    name: "Alpha Wolf",
    lore: "The leader of a wolf pack, larger and more dangerous than its kin. Recognizable by its distinctive scars and commanding presence.",
    locations: ["Forest", "Mystic Forest"],
    stats: { health: "250", attack: "30", gold: "300", exp: "700" },
    weaknesses: ["Fire"],
    resistances: ["Cold", "Physical"],
    drops: ["Treant Bark", "Treant Bark Map", "Rare Herb", "Frost Wolf Pelt"],
    trivia: "Defeating an Alpha Wolf often causes the rest of the pack to disperse.",
    behavior: "Aggressive leader, protects its pack at all costs",
    boss: true
  },
  "Goblin": {
    name: "Goblin",
    lore: "Small, cunning creatures that infest caves and ruins. Known for their traps and ambush tactics.",
    locations: ["Cave"],
    stats: { health: "50", attack: "11", gold: "20", exp: "30" },
    weaknesses: ["Light", "Holy"],
    resistances: ["Darkness"],
    drops: ["Goblin Ear", "Copper Ore", "Bone Fragment"],
    trivia: "Goblins have an irrational fear of water and will avoid crossing even small streams.",
    behavior: "Cowardly but dangerous in groups, uses hit-and-run tactics"
  },
  "Cave Bat": {
    name: "Cave Bat",
    lore: "Blind bats that navigate through echolocation. They swarm intruders in dark caves.",
    locations: ["Cave"],
    stats: { health: "35", attack: "8", gold: "15", exp: "25" },
    weaknesses: ["Light", "Piercing"],
    resistances: ["Darkness", "Sound"],
    drops: ["Bone Fragment", "Mystic Stone"],
    trivia: "Cave bats can detect the slightest movements through sound waves.",
    behavior: "Swarming attacker, weak individually but dangerous in numbers"
  },
  "Crystal Golem": {
    name: "Crystal Golem",
    lore: "Ancient constructs made of living crystal. Guard precious mineral deposits in deep caves.",
    locations: ["Cave", "Ice Mine"],
    stats: { health: "300", attack: "30", gold: "300", exp: "800" },
    weaknesses: ["Blunt", "Earth"],
    resistances: ["Slashing", "Magic"],
    drops: ["Bone Fragment", "Silver Ore", "Ancient Relic Map", "Copper Ore", "Ancient Core"],
    trivia: "Crystal Golems are created by ancient magic to protect valuable resources.",
    behavior: "Slow but powerful, defends its territory relentlessly",
    boss: true
  },
  "Frost Wolf": {
    name: "Frost Wolf",
    lore: "Arctic wolves adapted to mountain climates. Their white fur provides perfect camouflage in snow.",
    locations: ["Mountain"],
    stats: { health: "70", attack: "15", gold: "30", exp: "45" },
    weaknesses: ["Fire"],
    resistances: ["Cold", "Ice"],
    drops: ["Dwarven Ale", "Frost Wolf Pelt", "Bone Fragment"],
    trivia: "Frost Wolves can survive in temperatures that would freeze most creatures solid.",
    behavior: "Patient hunters, often stalk prey for hours before attacking"
  },
  "Mountain Troll": {
    name: "Mountain Troll",
    lore: "Large, dim-witted creatures that inhabit mountain passes. Incredibly strong but slow.",
    locations: ["Mountain"],
    stats: { health: "120", attack: "22", gold: "60", exp: "80" },
    weaknesses: ["Fire", "Acid"],
    resistances: ["Blunt", "Cold"],
    drops: ["Bone Fragment", "Gold Ore", "Reinforced Leather"],
    trivia: "Trolls can regenerate from wounds, but fire prevents this ability.",
    behavior: "Simple-minded but territorial, attacks anything that enters its domain"
  },
  "Mountain Dragon": {
    name: "Mountain Dragon",
    lore: "A fearsome dragon that has claimed the highest peaks as its territory. Breathes fire and hoards treasure.",
    locations: ["Mountain"],
    stats: { health: "350", attack: "38", gold: "350", exp: "800" },
    weaknesses: ["Ice", "Dragonbane"],
    resistances: ["Fire", "Magic"],
    drops: ["Dragon Scale", "Ancient Core"],
    trivia: "This dragon is said to have destroyed three villages before being driven to the mountains.",
    behavior: "Apex predator, attacks with overwhelming force and ancient magic",
    boss: true
  },
  "River Serpent": {
    name: "River Serpent",
    lore: "Aquatic serpents that patrol river systems. Can hold their breath for hours while hunting.",
    locations: ["River"],
    stats: { health: "90", attack: "19", gold: "50", exp: "80" },
    weaknesses: ["Lightning", "Ice"],
    resistances: ["Water", "Poison"],
    drops: ["River Serpent Scale", "Coral Fragment", "Coral Fragment Map", "Water Orb"],
    trivia: "River Serpents can grow up to 30 feet long and have been known to capsize small boats.",
    behavior: "Ambush predator, strikes from underwater with surprise attacks"
  },
  "Geode Elemental": {
    name: "Geode Elemental",
    lore: "Elemental beings formed from crystalline structures. They guard the deepest parts of the mine.",
    locations: ["Ice Mine"],
    stats: { health: "95", attack: "26", gold: "65", exp: "85" },
    weaknesses: ["Blunt", "Earth"],
    resistances: ["Slashing", "Cold"],
    drops: ["Crystal Shard", "Geode Core", "Silver Ore", "Gold Ore"],
    trivia: "Geode Elementals can shatter and reform themselves at will.",
    behavior: "Methodical defender, uses crystalline barriers and ranged attacks"
  },
  "Shadow Crawler": {
    name: "Shadow Crawler",
    lore: "Creatures born from darkness and negative energy. They feed on fear and despair.",
    locations: ["Ice Mine"],
    stats: { health: "85", attack: "28", gold: "75", exp: "95" },
    weaknesses: ["Light", "Holy"],
    resistances: ["Darkness", "Poison"],
    drops: ["Shadow Essence", "Ancient Coin", "Enchanted Arrowhead"],
    trivia: "Shadow Crawlers are invisible in complete darkness, only revealing themselves when attacking.",
    behavior: "Stealthy ambusher, prefers to attack from shadows and retreat"
  },
  "Crystal Queen": {
    name: "Crystal Queen",
    lore: "The ruler of the Ice Mine, a being of pure crystal with command over ice and light.",
    locations: ["Ice Mine"],
    stats: { health: "400", attack: "45", gold: "400", exp: "800" },
    weaknesses: ["Fire", "Blunt"],
    resistances: ["Ice", "Magic"],
    drops: ["Crystal Crown", "Primordial Essence", "Rare Gem", "Ancient Core", "Dragon Scale"],
    trivia: "The Crystal Queen is said to be as old as the mountains themselves.",
    behavior: "Royal commander, uses powerful magic and commands lesser crystal beings",
    boss: true
  },
  "Skeleton Warrior": {
    name: "Skeleton Warrior",
    lore: "The animated remains of ancient warriors, bound to protect the ruins for eternity.",
    locations: ["Ancient Ruins"],
    stats: { health: "80", attack: "18", gold: "50", exp: "65" },
    weaknesses: ["Holy", "Blunt"],
    resistances: ["Poison", "Piercing"],
    drops: ["Bone Fragment", "Silver Ore", "Ancient Coin"],
    trivia: "Skeleton Warriors retain fragments of their former combat skills from life.",
    behavior: "Relentless guardian, never tires and feels no pain"
  },
  "Phantom Archer": {
    name: "Phantom Archer",
    lore: "Ghostly archers that haunt the ruins. Their ethereal arrows can pass through armor.",
    locations: ["Ancient Ruins"],
    stats: { health: "90", attack: "20", gold: "60", exp: "75" },
    weaknesses: ["Holy", "Light"],
    resistances: ["Physical", "Poison"],
    drops: ["Enchanted Arrowhead", "Gold Ore", "Rare Gem"],
    trivia: "Phantom Archers were once elite archers who swore to protect the ruins even in death.",
    behavior: "Ranged attacker, keeps distance and uses hit-and-run tactics"
  },
  "Ruins Wraith": {
    name: "Ruins Wraith",
    lore: "Malevolent spirits formed from centuries of negative energy accumulation.",
    locations: ["Ancient Ruins"],
    stats: { health: "70", attack: "19", gold: "55", exp: "70" },
    weaknesses: ["Holy", "Light"],
    resistances: ["Darkness", "Magic"],
    drops: ["Mystic Stone", "Ancient Coin", "Enchanted Essence"],
    trivia: "Wraiths can possess living beings and control them like puppets.",
    behavior: "Ethereal attacker, phases through walls and uses fear-based attacks"
  },
  "Ancient Guardian": {
    name: "Ancient Guardian",
    lore: "A massive construct built by an ancient civilization to protect their most valuable relics.",
    locations: ["Ancient Ruins"],
    stats: { health: "300", attack: "35", gold: "400", exp: "700" },
    weaknesses: ["Lightning", "Acid"],
    resistances: ["Physical", "Magic"],
    drops: ["Emberglow Ring", "Aegis Shield", "Thunderfury Blade", "Ancient Coin", "Ancient Core"],
    trivia: "The Ancient Guardian has stood watch for over a thousand years without moving.",
    behavior: "Immobile defender, uses powerful area attacks and summons minions",
    boss: true
  },
  "Mystic Sprite": {
    name: "Mystic Sprite",
    lore: "Small, magical beings that maintain the balance of nature in the Mystic Forest.",
    locations: ["Mystic Forest"],
    stats: { health: "100", attack: "20", gold: "80", exp: "110" },
    weaknesses: ["Iron", "Fire"],
    resistances: ["Nature", "Magic"],
    drops: ["Mystic Stone", "Enchanted Essence"],
    trivia: "Mystic Sprites can communicate with plants and animals.",
    behavior: "Support caster, heals allies and uses nature magic"
  },
  "Ancient Treant": {
    name: "Ancient Treant",
    lore: "An ancient tree spirit that has watched over the forest since time immemorial.",
    locations: ["Mystic Forest"],
    stats: { health: "400", attack: "37", gold: "400", exp: "900" },
    weaknesses: ["Fire", "Axe"],
    resistances: ["Nature", "Blunt"],
    drops: ["Treant Bark", "Mystic Stone", "Ancient Core"],
    trivia: "Ancient Treants can live for thousands of years and remember events from centuries past.",
    behavior: "Slow but powerful, uses root attacks and nature magic",
    boss: true
  },
  "Water Elemental": {
    name: "Water Elemental",
    lore: "Beings of pure water given consciousness by ancient magic. They protect underwater sanctuaries.",
    locations: ["Sunken Grotto"],
    stats: { health: "120", attack: "22", gold: "90", exp: "120" },
    weaknesses: ["Lightning", "Cold"],
    resistances: ["Water", "Fire"],
    drops: ["Water Orb", "Coral Fragment"],
    trivia: "Water Elementals can control water pressure and create powerful whirlpools.",
    behavior: "Fluid combatant, changes form to adapt to different attacks"
  },
  "Coral Golem": {
    name: "Coral Golem",
    lore: "Constructs made from living coral, animated by ocean magic to protect underwater treasures.",
    locations: ["Sunken Grotto"],
    stats: { health: "350", attack: "35", gold: "300", exp: "800" },
    weaknesses: ["Blunt", "Acid"],
    resistances: ["Slashing", "Water"],
    drops: ["Coral Fragment", "Water Orb", "Rare Gem"],
    trivia: "Coral Golems continuously grow and repair themselves using minerals from the water.",
    behavior: "Sturdy defender, uses coral spikes and water manipulation",
    boss: true
  },
  "Abyssal Sentinel": {
    name: "Abyssal Sentinel",
    lore: "Guardians of the infinite tower, their power scales with each floor ascended.",
    locations: ["Infinite Dungeon"],
    stats: { health: "Scales with floor", attack: "Scales with floor", gold: "Scales with floor", exp: "Scales with floor" },
    weaknesses: ["Varies"],
    resistances: ["Varies"],
    drops: ["Ancient Core", "Dragon Scale", "Rare Gem", "Enchanted Essence", "Void Crystal", "Cosmic Fragment", "Primordial Essence"],
    trivia: "Each Sentinel has unique abilities based on the floor they guard.",
    behavior: "Adapts to challengers, uses different strategies each encounter",
    boss: true
  }
};


// DUNGEONS / WAVES
const enemyMap = {
  "Forest": [
    { name: "Forest Wolf", health: 60, Attack: 13, gold: 25, exp: 35, drops: ["Rare Herb", "Frost Wolf Pelt", "Bone Fragment", {item: "Wolf Whistle", chance: 0.3}] },
    { name: "Forest Spirit", health: 80, Attack: 17, gold: 40, exp: 55, drops: ["Rare Herb", "Enchanted Arrowhead", "Mystic Stone"] },
    { name: "Alpha Wolf", health: 200, Attack: 25, gold: 300, exp: 700, boss: true, drops: ["Treant Bark", "Treant Bark Map", "Rare Herb", "Frost Wolf Pelt"] }
  ],
  "Cave": [
    { name: "Crystal Golem", health: 200, Attack: 25, gold: 300, exp: 800, boss: true, drops: ["Bone Fragment", "Silver Ore", "Ancient Relic Map", "Copper Ore", "Ancient Core"] },
    { name: "Goblin", health: 50, Attack: 11, gold: 20, exp: 30, drops: ["Goblin Ear", "Copper Ore", "Bone Fragment"] },
    { name: "Cave Bat", health: 35, Attack: 8, gold: 15, exp: 25, drops: ["Bone Fragment", "Mystic Stone"] }
  ],
  "Mountain": [
    { name: "Frost Wolf", health: 70, Attack: 15, gold: 30, exp: 45, drops: ["Dwarven Ale", "Frost Wolf Pelt", "Bone Fragment"] },
    { name: "Mountain Dragon", health: 350, Attack: 38, gold: 350, exp: 800, boss: true, 
      item: "Dragon Slayer Sword",
      drops: [
         { item: "Dragon Scale", chance: 0.9 },
         { item: "Ancient Core", chance: 0.7}
      ] 
    },
    { name: "Mountain Troll", health: 120, Attack: 22, gold: 60, exp: 80, drops: ["Bone Fragment", "Gold Ore", "Reinforced Leather"] }
  ],
  "River": [
    { name: "River Serpent", health: 90, Attack: 19, gold: 50, exp: 80, drops: ["River Serpent Scale","Coral Fragment","Coral Fragment Map", "Water Orb"] }
  ],
  "Ice Mine": [
    { name: "Crystal Golem", health: 110, Attack: 24, gold: 70, exp: 90, drops: ["Crystal Shard", "Rare Gem", "Enchanted Essence", "Mystic Stone", "Treasure Goblin Companion"] },
    { name: "Geode Elemental", health: 95, Attack: 26, gold: 65, exp: 85, drops: ["Crystal Shard", "Geode Core", "Silver Ore", "Gold Ore"] },
    { name: "Shadow Crawler", health: 85, Attack: 28, gold: 75, exp: 95, drops: ["Shadow Essence", "Ancient Coin", "Enchanted Arrowhead"] },
    { name: "Crystal Queen", health: 400, Attack: 45, gold: 400, exp: 800, boss: true, item: "Crystal Crown", drops: ["Crystal Crown", "Primordial Essence", "Rare Gem", "Ancient Core", "Dragon Scale"] }
  ],
  "Ancient Ruins": [
    { name: "Skeleton Warrior", health: 80, Attack: 18, gold: 50, exp: 65, drops: ["Bone Fragment", "Silver Ore", "Ancient Coin"] },
    { name: "Phantom Archer", health: 90, Attack: 20, gold: 60, exp: 75, drops: ["Enchanted Arrowhead", "Gold Ore", "Rare Gem"] },
    { name: "Ancient Guardian", health: 300, Attack: 35, gold: 400, exp: 700, boss: true, 
      item: "Ancient Relic", 
      drops: [
        { item: "Emberglow Ring", chance: 0.7},
        { item: "Aegis Shield", chance: 0.6 },
        { item: "Thunderfury Blade", chance: 0.6 },
        { item: "Ancient Coin", chance: 0.8 }, { item: "Ancient Core", chance: 0.8 }
      ] 
    },
    { name: "Ruins Wraith", health: 70, Attack: 19, gold: 55, exp: 70, drops: ["Mystic Stone", "Ancient Coin", "Enchanted Essence"] }
  ],
  "Mystic Forest": [
    { name: "Alpha Wolf", health: 150, Attack: 25, gold: 100, exp: 150, drops: ["Treant Bark","Rare Herb", "Frost Wolf Pelt"] },
    { name: "Mystic Sprite", health: 100, Attack: 20, gold: 80, exp: 110, drops: ["Mystic Stone", "Enchanted Essence"] },
    { name: "Ancient Treant", health: 400, Attack: 37, gold: 400, exp: 900, boss: true, 
      item: "Ancient Treant Robes", 
      drops: [
        { item: "Treant Bark", chance: 0.8},
        { item: "Mystic Stone", chance: 0.7},
        { item: "Ancient Core", chance: 0.6}
      ] 
    }
  ],
  "Sunken Grotto": [
    { name: "Water Elemental", health: 120, Attack: 22, gold: 90, exp: 120, drops: ["Water Orb", "Coral Fragment"] },
    { name: "Coral Golem", health: 350, Attack: 35, gold: 300, exp: 800, boss: true, 
      item: "Coral Blade", 
      drops: [
        { item: "Coral Fragment", chance: 0.8 },
        { item:"Water Orb", chance: 0.7 },
        { item: "Rare Gem", chance: 0.6 }
      ] 
    }
  ]
};


//INFINITE DUNGEON SYSTEM
const infiniteDungeon = {
  name: "Abyssal Tower",
  description: "A tower that extends infinitely upwards, with increasingly powerful guardians on each floor.",
  minLevel: 5,
  cooldown: 600000,
  baseBossStats: {
    health: 500,
    attack: 50,
    scaling: {
      health: 1.25,
      attack: 1.15   
    }
  },
  bosses: [
    "Abyssal Sentinel",
    "Void Walker", 
    "Chaos Bringer",
    "Dimensional Horror",
    "Elder Titan",
    "Cosmic Devourer",
    "Primordial Beast",
    "Reality Warper",
    "Omnipotent Being",
    "The Final Guardian"
  ],
  rewards: {
    baseGold: 400,
    baseExp: 300,
    scaling: 1.2,
    rareDrops: [
      "Ancient Core", "Dragon Scale", "Rare Gem", "Enchanted Essence",
      "Void Crystal", "Cosmic Fragment", "Primordial Essence"
    ]
  }
};
locations.push("Infinite Dungeon");
enemyMap["Infinite Dungeon"] = [];
infiniteDungeon.bosses.forEach((bossName, index) => {
  const floor = index + 1;
  enemyMap["Infinite Dungeon"].push({
    name: `${bossName} (Floor ${floor})`,
    health: Math.floor(infiniteDungeon.baseBossStats.health * Math.pow(infiniteDungeon.baseBossStats.scaling.health, floor - 1)),
    Attack: Math.floor(infiniteDungeon.baseBossStats.attack * Math.pow(infiniteDungeon.baseBossStats.scaling.attack, floor - 1)),
    gold: Math.floor(infiniteDungeon.rewards.baseGold * Math.pow(infiniteDungeon.rewards.scaling, floor - 1)),
    exp: Math.floor(infiniteDungeon.rewards.baseExp * Math.pow(infiniteDungeon.rewards.scaling, floor - 1)),
    boss: true,
    drops: [...infiniteDungeon.rewards.rareDrops, "Mega Healing Potion", "Mega Mana Potion"],
    infiniteDungeon: true,
    floor: floor
  });
});