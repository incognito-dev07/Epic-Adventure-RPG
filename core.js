// =====================
// INITIALIZATION
// =====================

// DOM ELEMENTS
const output = document.getElementById("output");
const controls = document.getElementById("controls");
const stats = document.getElementById("stats");
const statsText = document.getElementById("stats-text");
const levelBarFill = document.getElementById("levelbar-fill");
const levelBarText = document.getElementById("levelbar-text");
const healthBarFill = document.getElementById("health-bar-fill");
const healthBarText = document.getElementById("health-bar-text");
const ManaBarFill = document.getElementById("Mana-bar-fill");
const ManaBarText = document.getElementById("Mana-bar-text");
const enemyHealthBar = document.getElementById("enemy-health-bar");
const enemyHealthBarFill = document.getElementById("enemy-health-bar-fill");
const enemyHealthText = document.getElementById("enemy-health-text");
const miniMap = document.getElementById("mini-map");
const animationContainer = document.getElementById("animation-container");
const minigameContainer = document.getElementById("minigame-container");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const backgroundMusic = document.getElementById("background-music");
const battleMusic = document.getElementById("battle-music");
const loadscreen = document.getElementById("loadscreen");
const loader = document.getElementById("loadingContainer");
const loading = document.getElementById("loading");
const loadingMsg1 = document.getElementById("loadingMsg1");
const loadingMsg2 = document.getElementById("loadingMsg2");
const loadingMsg3 = document.getElementById("loadingMsg3");
const exitContainer = document.getElementById("exitPopup");

//GLOBAL VARIABLES
let currentSaveSlot = 1;
let activePotionEffects = {
    Attack: { active: false, multiplier: 1, duration: 0 },
    health: { active: false, multiplier: 1, duration: 0 },
    Mana: { active: false, multiplier: 1, duration: 0 }
};
let currentMusic = null;
let backgroundMusicPosition = 0;
let battleMusicPosition = 0;


//AUDIO FUNCTIONS
function playBattleMusic() {
  if (!player.audioSettings.musicEnabled) return;
  if (currentMusic === 'battle') return; 
  if (currentMusic === 'background') {
    backgroundMusicPosition = backgroundMusic.currentTime;
    backgroundMusic.pause();
  }
  battleMusic.currentTime = battleMusicPosition;
  battleMusic.volume = player.audioSettings.musicVolume;
  battleMusic.play().catch(e => console.log("Battle music play failed:", e));
  currentMusic = 'battle';
}

function playBackgroundMusic() {
  if (!player.audioSettings.musicEnabled) return;
  if (currentMusic === 'background') return;
  if (currentMusic === 'battle') {
    battleMusicPosition = battleMusic.currentTime;
    battleMusic.pause();
  }
  backgroundMusic.currentTime = backgroundMusicPosition;
  backgroundMusic.volume = player.audioSettings.musicVolume;
  backgroundMusic.play().catch(e => console.log("Background music play failed:", e));
  currentMusic = 'background';
}

function stopAllMusic() {
  if (currentMusic === 'background') {
    backgroundMusicPosition = backgroundMusic.currentTime;
    backgroundMusic.pause();
  } 
  else if (currentMusic === 'battle') {
    battleMusicPosition = battleMusic.currentTime;
    battleMusic.pause();
  }
  currentMusic = null;
}



// =====================
// CORE GAME SYSTEM
// =====================

//SAVE AND LOAD GAME
function saveGame(slot = currentSaveSlot) {
  localStorage.setItem(`epic_RPGv1_save_slot_${slot}`, JSON.stringify(player));
}

function loadGame(slot = 1) {
  const d = localStorage.getItem(`epic_RPGv1_save_slot_${slot}`);
  if (!d) return false;
  try {
    player = JSON.parse(d);
    if (!player.companions) player.companions = {};
    if (!player.stats) initializePlayerStats();
    if (!player.quests) player.quests = {};
    if (!player.skillCooldowns) player.skillCooldowns = {};
    if (!player.minigameCooldowns) player.minigameCooldowns = {};
    if (!player.explorationData) player.explorationData = null;
    initializeCompanionSystem();
    initializeCompanionSkills();
    QuestManager.initializeQuests();
    calculateStats();
    updateStatBars();
    document.getElementById("stats").classList.remove("hidden");
    document.getElementById("sidebar-toggle").style.display = "block";
    if (QuestManager.updateAllQuestStates) {
      QuestManager.updateAllQuestStates();
    }
    if (QuestManager.syncQuestProgressFromInventory) {
      QuestManager.syncQuestProgressFromInventory();
    }
    currentSaveSlot = slot;
    return true;
  } catch (e) {
    console.error("Error loading game:", e);
    return false;
  }
}

function showSlotMenu(slot, hasSave) {
  clearOutput();
  controls.innerHTML = "";
  log(`Slot ${slot} selected.`);
  if (hasSave) {
    addAction("Load Game", () => {
      if (loadGame(slot)) {
        document.getElementById("sidebar-toggle").style.display = "block";
      QuestManager.updateAllQuestStates();
      QuestManager.syncQuestProgressFromInventory();
      showLocation();
      }
    });
    addAction("Delete Game", () => {
      clearOutput();
      controls.innerHTML = "";
      log(`⚠️ Are you sure you want to delete the game in Slot ${slot}? This cannot be undone.`, true);
      addAction("Yes, Delete It", () => clearSave(slot));
      addAction("No, Go Back", () => showLoadMenu());
    });
  } 
  else {
    log("This slot is empty.");
  }
  addAction("⬅️ Back", showLoadMenu);
}

function clearSave(slot = 1) {
  localStorage.removeItem(`epic_RPGv1_save_slot_${slot}`);
  if (currentSaveSlot === slot) {
    player = {
    name: "", class: "", health: 0, MaxHealth: 0, Mana: 0, maxMana: 0, Attack: 0, gold: 150,inventory: {"Mega Healing Potion": 3, "Trap Kit": 1}, 
    equipped: { weapon: null, armor: null, accessory: null }, 
    quests: {},location: "Village", level: 1, exp: 0, expToNextLevel: 400, skills: [], minigameCooldowns: {}, skillCooldowns: {}, permanentEffects: {},goldFind: 0, miniBossRespawn: {}, miniBossDefeats: {}, bossesDefeated: [],shopLevel: 1, bonusAttack: 0, bonusMaxHealth: 0, bonusMana: 0,explorationData: null,prestigeLevel: 0,prestigePoints: 0,
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
      achievementsUnlocked: 0,
      highestDungeonFloor: 0,
      totalDungeonFloors: 0,
      dungeonAttempts: 0
    },
    audioSettings: {
      musicVolume: 0.5,
      soundEffectsVolume: 0.7,
      musicEnabled: true,
      soundEffectsEnabled: true
    }
  };
    document.getElementById("stats").classList.add("hidden");
    document.getElementById("sidebar-toggle").style.display = "none";
  }
  log(`❌ Save slot ${slot} deleted.`, true);
  showLoadMenu();
}


//PLAYER MANAGEMENT
function initializePlayerStats() {
  if (!player.stats) {
    player.stats = {
      enemiesDefeated: 0,
      locationsVisited: player.location ? [player.location] : ["Village"],
      explorationsCompleted: 0,
      itemsCrafted: 0,
      totalGoldEarned: player.gold || 0,
      itemsPurchased: 0,
      achievementsUnlocked: 0,
      highestDungeonFloor: 0,
      totalDungeonFloors: 0,
      dungeonAttempts: 0
    };
  }
  const defaultStats = {
    enemiesDefeated: 0,
    locationsVisited: ["Village"],
    explorationsCompleted: 0,
    itemsCrafted: 0,
    totalGoldEarned: player.gold || 0,
    itemsPurchased: 0,
    achievementsUnlocked: 0,
    highestDungeonFloor: 0,
    totalDungeonFloors: 0,
    dungeonAttempts: 0
  };
  for (const key in defaultStats) {
    if (player.stats[key] === undefined) {
      player.stats[key] = defaultStats[key];
    }
  }
  if (!player.stats.locationsVisited || !Array.isArray(player.stats.locationsVisited)) {
    player.stats.locationsVisited = [player.location || "Village"];
  } 
  else if (player.location && !player.stats.locationsVisited.includes(player.location)) {
    player.stats.locationsVisited.push(player.location);
  }
}

function calculateStats() {
  if (!player.class) return;
  let baseAttack = CLASSES[player.class].Attack || 0;
  let baseHealth = CLASSES[player.class].MaxHealth || 0;
  let baseMana = CLASSES[player.class].maxMana || 0;
  baseAttack += (player.level - 1) * levelUpStatGrowth.Attack(player.level, baseAttack);
  baseHealth += (player.level - 1) * levelUpStatGrowth.MaxHealth(player.level, baseHealth);
  baseMana += (player.level - 1) * levelUpStatGrowth.maxMana(player.level, baseMana);
  baseAttack = Math.floor(baseAttack * (1 + player.permanentBonuses.damage));
  baseHealth = Math.floor(baseHealth * (1 + player.permanentBonuses.health));
  baseMana = Math.floor(baseMana * (1 + player.permanentBonuses.mana));
  let bonusAttack = 0;
  let bonusMaxHealth = 0;
  let bonusMana = 0;
  if (player.equipped && player.equipped.weapon) {
    const item = shopItems[player.equipped.weapon];
    if (item && item.bonus && item.bonus.Attack) bonusAttack += item.bonus.Attack;
  }
  if (player.equipped && player.equipped.armor) {
    const item = shopItems[player.equipped.armor];
    if (item && item.bonus && item.bonus.MaxHealth) bonusMaxHealth += item.bonus.MaxHealth;
    if (item && item.bonus && item.bonus.Mana) bonusMana += item.bonus.Mana;
  }
  if (player.equipped && player.equipped.accessory) {
    const item = shopItems[player.equipped.accessory];
    if (item && item.bonus && item.bonus.Attack) bonusAttack += item.bonus.Attack;
    if (item && item.bonus && item.bonus.MaxHealth) bonusMaxHealth += item.bonus.MaxHealth;
    if (item && item.bonus && item.bonus.Mana) bonusMana += item.bonus.Mana;
  }
  if (player.inventory["Ancient Relic"] > 0) {
    bonusAttack += 10;
    bonusMaxHealth += 50;
  }
  let finalAttack = baseAttack + bonusAttack;
  let finalHealth = baseHealth + bonusMaxHealth;
  let finalMana = baseMana + bonusMana;
  if (activePotionEffects.Attack.active) {
    finalAttack = Math.floor(finalAttack * activePotionEffects.Attack.multiplier);
  }
  if (activePotionEffects.health.active) {
    finalHealth = Math.floor(finalHealth * activePotionEffects.health.multiplier);
  }
  if (activePotionEffects.Mana.active) {
    finalMana = Math.floor(finalMana * activePotionEffects.Mana.multiplier);
  }
  player.Attack = finalAttack;
  player.MaxHealth = finalHealth;
  player.maxMana = finalMana;
  player.bonusAttack = bonusAttack;
  player.bonusMaxHealth = bonusMaxHealth;
  player.bonusMana = bonusMana;
  const totalHealth = player.MaxHealth + player.bonusMaxHealth;
  const totalMana = player.maxMana + player.bonusMana;
  if (player.health > totalHealth) player.health = totalHealth;
  if (player.Mana > totalMana) player.Mana = totalMana;
}

function addGold(amount, source = "") {
  if (amount <= 0) return amount;
  const goldBonus = amount * (player.permanentBonuses?.goldFind || 0);
  const totalGold = amount + Math.floor(goldBonus);
  player.gold += totalGold;
  player.stats.totalGoldEarned = (player.stats.totalGoldEarned || 0) + totalGold;
  if (source) {
    log(`💰 ${source}: ${totalGold} gold${goldBonus > 0 ? ` (+${Math.floor(goldBonus)} from prestige)` : ''}`, true);
  }
  return totalGold;
}

function updateStats() {
  if (!player.stats) initializePlayerStats();
  const totalAttack = (player.Attack || 0) + (player.bonusAttack || 0);
  const totalHealth = (player.MaxHealth || 0) + (player.bonusMaxHealth || 0);
  const totalMana = (player.maxMana || 0) + (player.bonusMana || 0);
  const playerGold = player.gold || 0;
  const playerName = player.name || "Hero";
  const playerClass = player.class || "Adventurer";
  let potionStatus = "";
  if (activePotionEffects.Attack.active) {
    potionStatus += ` ⚔️${activePotionEffects.Attack.duration}`;
  }
  if (activePotionEffects.health.active) {
    potionStatus += ` ❤️${activePotionEffects.health.duration}`;
  }
  if (activePotionEffects.Mana.active) {
    potionStatus += ` 🔵${activePotionEffects.Mana.duration}`;
  }
  statsText.innerHTML = `💂 ${playerName} The ${playerClass}${potionStatus} <br/> ⚔️ ATK: ${totalAttack} | 🪙 Xgold: ${playerGold}g`;
  updateStatBars();
  if (player.name) {
    document.getElementById("stats").classList.remove("hidden");
  }
}

function updateStatBars() {
  const totalHealth = player.MaxHealth + player.bonusMaxHealth;
  const healthPercent = Math.max(0, (player.health / totalHealth) * 100);
  healthBarFill.style.width = healthPercent + "%";
  healthBarText.textContent = `HP: ${Math.max(0, player.health)} / ${totalHealth}`;
  const totalMana = player.maxMana + player.bonusMana;
  const ManaPercent = Math.max(0, (player.Mana / totalMana) * 100);
  ManaBarFill.style.width = ManaPercent + "%";
  ManaBarText.textContent = `MP: ${Math.max(0, player.Mana)} / ${totalMana}`;
  const expPercent = (player.exp / player.expToNextLevel) * 100;
  levelBarFill.style.width = expPercent + "%";
  levelBarText.textContent = `🔰 Level ${player.level}: ${player.exp} / ${player.expToNextLevel} XP`;
}

function gainExp(amount) {
  const scaledAmount = amount;
  player.exp += scaledAmount;
  while (player.exp >= player.expToNextLevel) {
    player.exp -= player.expToNextLevel;
    player.level++;
    const baseMultiplier = 1.4 + (player.level * 0.03);
    player.expToNextLevel = Math.floor(player.expToNextLevel * baseMultiplier);
    log(`⬆️ LEVEL UP! You are now level ${player.level}!`, true);
    log(`📊 Next level requires: ${player.expToNextLevel} EXP`, true);
    const classBase = CLASSES[player.class];
    const healthGain = Math.floor(levelUpStatGrowth.MaxHealth(player.level, classBase.MaxHealth));
    const ManaGain = Math.floor(levelUpStatGrowth.maxMana(player.level, classBase.maxMana));
    const AttackGain = Math.floor(levelUpStatGrowth.Attack(player.level, classBase.Attack));
    player.MaxHealth += healthGain;
    player.maxMana += ManaGain;
    player.Attack += AttackGain;
    player.health = player.MaxHealth + player.bonusMaxHealth;
    player.Mana = player.maxMana + player.bonusMana;
    log(`❤️ +${healthGain} Health, 🔵 +${ManaGain} Mana, ⚔️ +${AttackGain} Attack`, true);
    const newSkill = skillUnlocks[player.class][player.level];
    if (newSkill && !player.skills.find(s => s.name === newSkill.name)) {
      log(`✨ New Skill Available: ${newSkill.name} – ${newSkill.desc}`, true);
    }
    updateStatBars();
  }
  updateStatBars();
  updateStats();
}

function addItemToInventory(item, qty = 1, options = {}) {
  if (!item) {
    console.warn("Attempted to add undefined item to inventory");
    return;
  }
  if (item.includes("Companion")) {
    const companionName = item.replace(" Companion", "");
    if (companions[companionName]) {
      acquireCompanion(companionName);
      if (!options.silent) log(`🎉 You gained a new companion: ${companionName}!`, true);
      return;
    }
  }
  const def = shopItems[item];
  if (item.endsWith("Map") && player.inventory[item] >= 1) {
    return; 
  }
  if (def && def.unique && player.inventory[item] >= 1) {
    return; 
  }
  player.inventory[item] = (player.inventory[item] || 0) + qty;
  if (!options.silent) log(`🎁 Received ${item} x${qty}`, true);
  if (typeof QuestManager !== "undefined" && QuestManager.updateQuestProgress) {
    QuestManager.updateQuestProgress('COLLECT', item, qty);
  }
  saveGame();
  updateStats();
}

function equipItem(item) {
  const details = shopItems[item];
  if (!details || (details.type !== "weapon" && details.type !== "armor" && details.type !== "accessory")) {
    log(`❌ ${item} cannot be equipped.`, true);
    return;
  }
  if (details.type === "weapon") {
    if (player.equipped.weapon) log(`You unequipped ${player.equipped.weapon}.`, true);
    player.equipped.weapon = item;
    log(`⚔️ Equipped ${item}!`, true);
  } 
  else if (details.type === "armor") {
    if (player.equipped.armor) log(`You unequipped ${player.equipped.armor}.`, true);
    player.equipped.armor = item;
    log(`🛡️ Equipped ${item}!`, true);
  } 
  else if (details.type === "accessory") {
    if (player.equipped.accessory) log(`You unequipped ${player.equipped.accessory}.`, true);
    player.equipped.accessory = item;
    log(`💍 Equipped ${item}!`, true);
  }
  calculateStats();
  if (player.health > player.MaxHealth + player.bonusMaxHealth) player.health = player.MaxHealth + player.bonusMaxHealth;
  saveGame();
  updateStats();
  showInventory();
}

function unequipItem(type) {
  if (!player.equipped[type]) {
    log(`❌ No ${type} is equipped.`, true);
    return;
  }
  const item = player.equipped[type];
  if (type === "weapon") {
    log(`⚔️ Unequipped ${item}.`, true);
    player.equipped.weapon = null;
  } 
  else if (type === "armor") {
    log(`🛡️ Unequipped ${item}.`, true);
    player.equipped.armor = null;
  } 
  else if (type === "accessory") {
    log(`💍 Unequipped ${item}.`, true);
    player.equipped.accessory = null;
  }
  calculateStats();
  if (player.health > player.MaxHealth + player.bonusMaxHealth) player.health = player.MaxHealth + player.bonusMaxHealth;
  saveGame();
  updateStats();
  showInventory();
}


//LOCATION AND TRAVEL SYSTEM
function showLocation() {
  clearOutput();
  controls.innerHTML = "";
  updateMiniMap();
  log(`📍 You are in ${player.location}`, true);
  updateStats();
  function talkToNPC(npc, lines) {
    clearOutput();
    controls.innerHTML = "";
    let i = 0;
    function next() {
      if (i < lines.length) {
        log(`${npc}: "${lines[i++]}"`);
        controls.innerHTML = "";
        addAction("Next", next);
      } 
      else showLocation();
    }
    next();
  }
  const explorationCooldown = player.minigameCooldowns.exploration;
  const now = Date.now();
  const canExplore = !explorationCooldown || now >= explorationCooldown;
  const npcsInLocation = new Set();
  for (const questId in quests) {
    const questData = quests[questId];
    if (questData.location === player.location) {
      npcsInLocation.add(questData.npc);
    }
  }
  switch (player.location) {
    case "Village":
      npcsInLocation.forEach(npcName => {
        let questMarker = "";
        if (Object.keys(player.quests).some(id => quests[id].npc === npcName && player.quests[id].status === 'READY_TO_COMPLETE')) questMarker = " (❗️)";
        else if (Object.keys(player.quests).some(id => quests[id].npc === npcName && player.quests[id].status === 'AVAILABLE')) questMarker = " (❓)";
        addAction(`Talk to ${npcName}${questMarker}`, () => handleNPCInteraction(npcName));
      });
      addAction("🔨 Visit Blacksmith", () => travelTo("Blacksmith's Forge"));
      addAction("🏡 Go Home", () => travelTo("Player Home"));
      addAction("🌍 Travel", showTravelMenu);
      addAction("🏪 Shop", () => shopMenu());
      break;
    case "Forest":
    case "Cave":
    case "Mountain":
    case "River":
    case "Ice Mine":
    case "Mystic Forest":
    case "Sunken Grotto":
    case "Ancient Ruins":
      npcsInLocation.forEach(npcName => {
        let questMarker = "";
        if (Object.keys(player.quests).some(id => quests[id].npc === npcName && player.quests[id].status === 'READY_TO_COMPLETE')) questMarker = " (❗️)";
        else if (Object.keys(player.quests).some(id => quests[id].npc === npcName && player.quests[id].status === 'AVAILABLE')) questMarker = " (❓)";
        addAction(`Talk to ${npcName}${questMarker}`, () => handleNPCInteraction(npcName));
      });
      if (player.location === "Cave" && player.inventory["Iron Pickaxe"]) {
        const cooldown = player.minigameCooldowns.mining;
        const now = Date.now();
        if (!cooldown || now >= cooldown) {
          addAction("Go Mining ⛏️", () => startMiningMinigame());
        } 
        else {
          const remaining = Math.ceil((cooldown - now) / 1000);
          log(`Mining is on cooldown for ${remaining} seconds.`, true);
        }
      }
      if (player.location === "River" && player.inventory["Fisherman's Net"]) {
        const cooldown = player.minigameCooldowns.fishing;
        const now = Date.now();
        if (!cooldown || now >= cooldown) {
          addAction("Go Fishing 🎣", () => startFishingMinigame());
        } 
        else {
          const remaining = Math.ceil((cooldown - now) / 1000);
          log(`Fishing is on cooldown for ${remaining} seconds.`, true);
        }
      }
      const explorationCooldown = player.minigameCooldowns.exploration;
      const now = Date.now();
      const canExplore = !explorationCooldown || now >= explorationCooldown;
      const exploreContainer = document.createElement("div");
      exploreContainer.style.display = "flex";
      exploreContainer.style.gap = "3vmin";
      exploreContainer.id = "explore-container";
      const exploreBtn = document.createElement("button");
      exploreBtn.textContent = canExplore ? `Explore ${player.location}` : `Explore (${Math.ceil((explorationCooldown - now) / 1000)}s🔒)`;
      exploreBtn.disabled = !canExplore;
      exploreBtn.onclick = () => startExploration();
      const trapBtn = document.createElement("button");
      trapBtn.textContent = canExplore ? `Set Trap 🪤` : `Set Trap (${Math.ceil((explorationCooldown - now) / 1000)}s🔒)`;
      trapBtn.disabled = !canExplore;
      trapBtn.onclick = () => {
        if (!canExplore) {
          const remaining = Math.ceil((explorationCooldown - now) / 1000);
          log(`❌ Exploration is on cooldown for ${remaining} seconds. You can't set a trap now.`, true);
          return;
        }
        const trapKitCount = player.inventory["Trap Kit"] || 0;
        if (trapKitCount < 1) {
          clearOutput();
          controls.innerHTML = "";
          log("❌ You need a Trap Kit to set a trap! Buy one from the shop.", true);
          addAction("Continue Without Trap", () => {
            player.explorationData = { wave: 1, loot: {}, gold: 0, exp: 0, trapSet: false };
            proceedExploration();
          });
          addAction("Go to Shop", () => shopMenu());
          return;
        }
        clearOutput();
        controls.innerHTML = "";
        log(`🪤 You prepare to set a trap before exploring ${player.location}.`, true);
        log("A trap will weaken the first enemy you encounter.", true);
        addAction("Explore With Trap", () => {
          player.inventory["Trap Kit"]--;
          if (player.inventory["Trap Kit"] <= 0) delete player.inventory["Trap Kit"];
          player.explorationData = { wave: 1, loot: {}, gold: 0, exp: 0, trapSet: true };
          saveGame();
          proceedExploration();
        });
        addAction("Explore Without Trap", () => {
          player.explorationData = { wave: 1, loot: {}, gold: 0, exp: 0, trapSet: false };
          proceedExploration();
        });
        addAction("Cancel", showLocation);
      };

      exploreContainer.appendChild(exploreBtn);
      exploreContainer.appendChild(trapBtn);
      controls.appendChild(exploreContainer);
      if (!canExplore) {
        startCooldownTimer();
      }
      addAction("🌍Travel", showTravelMenu);
      break;

      function startCooldownTimer() {
        const exploreContainer = document.getElementById("explore-container");
        if (!exploreContainer) return;
        function updateCooldown() {
          const now = Date.now();
          const explorationCooldown = player.minigameCooldowns.exploration;
          if (!explorationCooldown || now >= explorationCooldown) {
            const exploreBtn = exploreContainer.querySelector('button:first-child');
            const trapBtn = exploreContainer.querySelector('button:last-child');
            if (exploreBtn) {
              exploreBtn.textContent = `Explore ${player.location}`;
              exploreBtn.disabled = false;
              exploreBtn.onclick = () => startExploration();
            }
            if (trapBtn) {
              trapBtn.textContent = `Set Trap 🪤`;
              trapBtn.disabled = false;
              trapBtn.onclick = () => {
                clearOutput();
                controls.innerHTML = "";
                if (!player.inventory["Trap Kit"] || player.inventory["Trap Kit"] < 1) {
                    log("❌ You need a Trap Kit to set a trap! Buy one from the shop.", true);
                    addAction("Continue Without Trap", () => {
                      player.explorationData = { wave: 1, loot: {}, gold: 0, exp: 0, trapSet: false };            proceedExploration();
                    });
                    addAction("Go to Shop", () => shopMenu());
                    return;
                }
                log(`🪤 You prepare to set a trap before exploring ${player.location}.`, true);
                log("A trap will weaken the first enemy you encounter.", true);
                addAction("Explore With Trap", () => {
                  player.inventory["Trap Kit"]--;
                  if (player.inventory["Trap Kit"] <= 0) delete player.inventory["Trap Kit"];
                  player.explorationData = { wave: 1, loot: {}, gold: 0, exp: 0, trapSet: true };
                  saveGame();
                  proceedExploration();
                });
                addAction("Explore Without Trap", () => {
                  player.explorationData = { wave: 1, loot: {}, gold: 0, exp: 0, trapSet: false };              
                  proceedExploration();
                });
                addAction("Cancel", showLocation);
              };
            }
            return;
          }
          const remaining = Math.ceil((explorationCooldown - now) / 1000);
          const exploreBtn = exploreContainer.querySelector('button:first-child');
          const trapBtn = exploreContainer.querySelector('button:last-child');
          if (exploreBtn) {
            exploreBtn.textContent = `Explore (${remaining}s🔒)`;
            exploreBtn.disabled = true;
          }
          if (trapBtn) {
            trapBtn.textContent = `Set Trap (${remaining}s🔒)`;
            trapBtn.disabled = true;
          }
          setTimeout(updateCooldown, 1000);
        }
        updateCooldown();
      }
    case "Infinite Dungeon":
      showInfiniteDungeon();
      break;
    case "Blacksmith's Forge":
      addAction("Talk to Blacksmith", () => talkToNPC("Blacksmith", ["I can craft powerful gear for you, but you'll need the right materials.", "Bring me the materials and I can try to forge something new."]));
      addAction("Craft an Item", showCraftingMenu);
      addAction("⬅️ Back", () => travelTo("Village"));
      break;
    case "Player Home":
      addAction("Rest", () => {
        player.health = player.MaxHealth + player.bonusMaxHealth;
        player.Mana = player.maxMana + player.bonusMana;
        log("🏡 You rest in the comfort of your own home, fully healed and refreshed!", true);
        updateStatBars();
        saveGame();
        showLocation();
      });
      addAction("Decorate", () => {
        log("This feature is still under construction.", true); 
        showLocation(); 
      });
      addAction("⬅️ Back", () => travelTo("Village"));
      break;
  }
}

function travelTo(newLocation) {
  if (!player.stats) initializePlayerStats();
  if (!player.stats.locationsVisited) {
    player.stats.locationsVisited = ["Village"];
  }
  if (!player.stats.locationsVisited.includes(newLocation)) {
    player.stats.locationsVisited.push(newLocation);
  }
  const safeLocations = ["Village", "Blacksmith's Forge", "Player Home"];
  const shouldTriggerEvent = Math.random() < 0.3 && !safeLocations.includes(newLocation);
  if (shouldTriggerEvent) {
    player.location = newLocation;
    const eventTriggered = triggerTravelEvent();
    if (!eventTriggered) {
      saveGame();
      showLocation();
    }
  } 
  else {
    player.location = newLocation;
    saveGame();
    showLocation();
  }
}

function showTravelMenu() {
  const popup = document.getElementById("travel-popup");
  const optionsDiv = document.getElementById("travel-options");
  const closeBtn = document.getElementById("travel-close");
  optionsDiv.innerHTML = "";
  locations.forEach(loc => {
    if (loc === "Infinite Dungeon") {
      const isUnlocked = player.level >= infiniteDungeon.minLevel;
      const isLocked = !isUnlocked;
      let questMarker = "";
      for (const questId in player.quests) {
        const quest = player.quests[questId];
        const questData = quests[questId];
        if (!quest || !questData) continue;
        if (questData.location === loc) {
          if (quest.status === "READY_TO_COMPLETE") questMarker = " ❗";
          else if (quest.status === "AVAILABLE") questMarker = " ❓";
        }
      }
      const btn = document.createElement("button");
      btn.textContent = isLocked ? 
        `${loc} (Requires Level ${infiniteDungeon.minLevel})` : 
        `${loc}${questMarker}`;
      btn.disabled = isLocked;
      btn.onclick = () => {
        if (!isLocked) {
          travelTo(loc);
          popup.classList.add("hidden");
        }
      };
      optionsDiv.appendChild(btn);
    } 
    else {
    const isLocked = (loc === "Mystic Forest" && !player.inventory["Treant Bark Map"]) || (loc === "Sunken Grotto" && !player.inventory["Coral Fragment Map"]) || (loc === "Ancient Ruins" && !player.inventory["Ancient Relic Map"]);
    let questMarker = "";
    for (const questId in player.quests) {
      const quest = player.quests[questId];
      const questData = quests[questId];
      if (!quest || !questData) continue;
      if (questData.location === loc) {
        if (quest.status === "READY_TO_COMPLETE") questMarker = " ❗";
        else if (quest.status === "AVAILABLE") questMarker = " ❓";
      }
    }
    const btn = document.createElement("button");
    btn.textContent = isLocked ? `${loc} (🔒)` : `${loc}${questMarker}`;
    btn.disabled = isLocked;
    btn.onclick = () => {
      if (!isLocked) {
        travelTo(loc);
        popup.classList.add("hidden");
      }
    };
    optionsDiv.appendChild(btn);
    }
  });
  closeBtn.addEventListener("click",()=>{
    popup.classList.add("hidden");
    showLocation();
  })
  popup.classList.remove("hidden");
}

function updateMiniMap() {
  miniMap.innerHTML = "";
  locations.forEach(loc => {
    const node = document.createElement("div");
    node.classList.add("map-node");
    if (loc === player.location) node.classList.add("map-current");
    node.textContent = loc;
    miniMap.appendChild(node);
  });
}


function triggerTravelEvent() {
  const eventRoll = Math.random();
  const events = Object.values(travelEvents);
  const validEvents = events.filter(event => 
    event && 
    event.name && 
    event.description && 
    event.type && 
    event.chance !== undefined
  );
  if (validEvents.length === 0) {
    console.log("No valid travel events found");
    return false;
  }
  let totalChance = validEvents.reduce((sum, event) => sum + event.chance, 0);
  let accumulatedChance = 0;
  const normalizedEvents = validEvents.map(event => ({
    ...event,
    normalizedChance: event.chance / totalChance
  }));
  for (const event of normalizedEvents) {
    accumulatedChance += event.normalizedChance;
    if (eventRoll <= accumulatedChance) {
      handleTravelEvent(event);
      return true;
    }
  }
  console.log("No travel event triggered, continuing normally");
  return false;
}

function handleTravelEvent(event) {
  clearOutput();
  controls.innerHTML = "";
  if (!event || !event.name || !event.description || !event.type) {
    log("The journey continues without incident.", true);
    addAction("Continue", showLocation);
    return;
  }
  log(`🚩 ${event.name}`, true);
  log(event.description, true);
  const addDefaultContinue = () => {
    addAction("Continue Journey", showLocation);
  };
  try {
    switch (event.type) {
      case "combat":
        if (event.enemy) {
          log("Prepare for battle!", true);
          addAction("Fight!", () => fightEnemy(event.enemy, "travel"));
        } else {
          log("The threat seems to have passed.", true);
          addDefaultContinue();
        }
        break;
      case "dialogue":
        if (event.options && event.options.length > 0) {
          event.options.forEach(option => {
            if (option && option.text && option.outcome) {
              addAction(option.text, () => {
                clearOutput();
                if (option.outcome.combat && option.outcome.enemy) {
                  log("The stranger attacks!", true);
                  fightEnemy(option.outcome.enemy, "travel");
                } 
                else {
                  if (option.outcome.gold) addGold(option.outcome.gold, "Mysterious stranger");
                  if (option.outcome.item) addItemToInventory(option.outcome.item, 1);
                  log(option.outcome.message || "The encounter ends.", true);
                  addAction("Continue Journey", showLocation);
                }
              });
            }
          });
        } 
        else {
          log("The stranger has nothing more to say.", true);
          addDefaultContinue();
        }
        break;
      case "loot":
        if (event.rewards) {
          let totalGold = 0;
          event.rewards.forEach(reward => {
            if (reward.type === "gold") {
              const goldAmount = Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min;
              totalGold += goldAmount;
            } 
            else if (reward.type === "item" && Math.random() < (reward.chance || 0.7)) {
              const randomItem = reward.items[Math.floor(Math.random() * reward.items.length)];
              addItemToInventory(randomItem, 1, { silent: true });
              log(`🎁 Found: ${randomItem}`, true);
            }
          });
          if (totalGold > 0) {
            addGold(totalGold, "Treasure chest");
          }
          log("You take what you can carry and continue your journey.", true);
        } else {
          log("The chest was empty.", true);
        }
        addDefaultContinue();
        break;
      case "choice":
        if (event.options && event.options.length > 0) {
          event.options.forEach(option => {
            if (option && option.text && option.outcome) {
              addAction(option.text, () => {
                clearOutput();
                if (option.cost) {
                  let canAfford = true;
                  if (option.cost.item && (!player.inventory[option.cost.item] || player.inventory[option.cost.item] < option.cost.quantity)) {
                    canAfford = false;
                  }
                  if (option.cost.gold && player.gold < option.cost.gold) {
                    canAfford = false;
                  }
                  if (!canAfford) {
                    log(`❌ You don't have the required resources!`, true);
                    addAction("Continue", showLocation);
                    return;
                  }
                  if (option.cost.item) {
                    player.inventory[option.cost.item] -= option.cost.quantity;
                    if (player.inventory[option.cost.item] <= 0) delete player.inventory[option.cost.item];
                  }
                  if (option.cost.gold) player.gold -= option.cost.gold;
                }
                if (option.outcome.reward) {
                  if (option.outcome.reward.gold) addGold(option.outcome.reward.gold, "Good deed");
                  if (option.outcome.reward.exp) gainExp(option.outcome.reward.exp);
                  if (option.outcome.reward.item) addItemToInventory(option.outcome.reward.item, 1);
                }
                if (option.outcome.karma) {
                  if (!player.karma) player.karma = 0;
                  player.karma += option.outcome.karma;
                  log(option.outcome.karma > 0 ? "✨ Your karma has improved!" : "💀 Your karma has worsened.", true);
                }
                log(option.outcome.message || "Your choice has consequences.", true);
                addAction("Continue Journey", showLocation);
              });
            }
          });
        } else {
          log("You decide to continue on your way.", true);
          addDefaultContinue();
        }
        break;
      case "interaction":
        if (event.effects && event.effects.length > 0) {
          event.effects.forEach(effect => {
            if (effect && effect.text && effect.outcome) {
              addAction(effect.text, () => {
                clearOutput();
                if (effect.cost) {
                  if (effect.cost.gold && player.gold < effect.cost.gold) {
                    log("❌ You don't have enough gold!", true);
                    addAction("Continue", showLocation);
                    return;
                  }
                  player.gold -= effect.cost.gold || 0;
                }
                if (effect.outcome.heal) {
                  player.health = Math.min(player.MaxHealth + player.bonusMaxHealth, player.health + effect.outcome.heal);
                  log(`💖 Healed ${effect.outcome.heal} HP!`, true);
                }
                if (effect.outcome.Mana) {
                  player.Mana = Math.min(player.maxMana + player.bonusMana, player.Mana + effect.outcome.Mana);
                  log(`🔵 Restored ${effect.outcome.Mana} MP!`, true);
                }
                log(effect.outcome.message || "The interaction is complete.", true);
                addAction("Continue Journey", showLocation);
              });
            }
          });
        } else {
          log("There's nothing more to do here.", true);
          addDefaultContinue();
        }
        break;
      default:
        log("The journey continues without incident.", true);
        addDefaultContinue();
        break;
    }
  } catch (error) {
    console.error("Error handling travel event:", error);
    log("The journey continues without incident.", true);
    addDefaultContinue();
  }
}


//QUEST SYSTEM
const QuestManager = {
  initializeQuests: function() {
    if (!player.quests) {
      player.quests = {};
    }
    for (const questId in quests) {
      if (!player.quests[questId]) {
        player.quests[questId] = { 
          status: 'UNAVAILABLE', 
          progress: 0 
        };
      }
      const questData = quests[questId];
      if (player.quests[questId].status === 'UNAVAILABLE' && questData.startCondition(player)) {
        player.quests[questId].status = 'AVAILABLE';
      }
    }
  },
  updateAllQuestStates: function() {
    for (const questId in quests) {
      const questData = quests[questId];
      let playerQuestState = player.quests[questId];
      if (!playerQuestState) {
        player.quests[questId] = { status: 'UNAVAILABLE', progress: 0 };
        playerQuestState = player.quests[questId];
      }
      if (playerQuestState.status === 'UNAVAILABLE' && questData.startCondition(player)) {
        playerQuestState.status = 'AVAILABLE';
      }
      if (playerQuestState.status === 'ACTIVE' && 
          playerQuestState.progress >= questData.objective.amount) {
        playerQuestState.status = 'READY_TO_COMPLETE';
      }
    }
  },
  updateQuestProgress: function(actionType, target, amount = 1) {
    let questUpdated = false;
    for (const questId in player.quests) {
      const playerQuestState = player.quests[questId];
      const questData = quests[questId];
      if (!playerQuestState || !questData) continue;
      if (playerQuestState.status === 'ACTIVE' && questData.objective.type === actionType && questData.objective.target === target) {
        playerQuestState.progress = Math.min(questData.objective.amount, playerQuestState.progress + amount);
        questUpdated = true;
        log(`📜 Quest progress: ${questData.title} (${playerQuestState.progress}/${questData.objective.amount})`, true);
        if (playerQuestState.progress >= questData.objective.amount) {
          playerQuestState.status = 'READY_TO_COMPLETE';
          log(`✅ Quest objective met for: ${questData.title}! Return to ${questData.npc}.`, true);
        }
      }
    }
    if (questUpdated) saveGame();
    checkDailyChallengeProgress(actionType, target, amount);
  },
  syncQuestProgressFromInventory: function() {
    let changed = false;
    for (const questId in player.quests) {
      const state = player.quests[questId];
      const data = quests[questId];
      if (!state || !data) continue;
      if (state.status === 'ACTIVE' && data.objective?.type === 'COLLECT') {
        const have = player.inventory[data.objective.target] || 0;
        const newProg = Math.min(data.objective.amount, have);
        if (state.progress !== newProg) {
          state.progress = newProg;
          changed = true;
          if (newProg >= data.objective.amount) state.status = 'READY_TO_COMPLETE';
          log(`📜 Quest synced: ${data.title} (${state.progress}/${data.objective.amount})`, true);
        }
      }
    }
    if (changed) saveGame();
  },
  startQuest: function(questId) {
    if (player.quests[questId] && player.quests[questId].status === 'AVAILABLE') {
      player.quests[questId].status = 'ACTIVE';
      player.quests[questId].progress = 0;
      clearOutput();
      log(`📜 New Quest Accepted: ${quests[questId].title}`, true);
      log(quests[questId].description);
      if (quests[questId].objective.type === 'COLLECT') {
        const have = player.inventory[quests[questId].objective.target] || 0;
        player.quests[questId].progress = Math.min(quests[questId].objective.amount, have);
        if (player.quests[questId].progress >= quests[questId].objective.amount) {
          player.quests[questId].status = 'READY_TO_COMPLETE';
          log(`✅ You already have the required items! Return to ${quests[questId].npc} to complete the quest.`, true);
        }
      }
      saveGame();
      showLocation();
    }
  },
  completeQuest: function(questId) {
    const playerQuestState = player.quests[questId];
    const questData = quests[questId];
    if (playerQuestState && playerQuestState.status === 'READY_TO_COMPLETE') {
      clearOutput();
      log(`🎉 Quest Complete: ${questData.title}`, true);
      if (questData.dialogue && questData.dialogue.complete && questData.dialogue.complete[0]) {
        log(`${questData.npc}: "${questData.dialogue.complete[0]}"`);
      } 
      else {
        log(`${questData.npc}: "Thank you for your help!"`);
      }
      const reward = questData.reward;
      if (reward.gold) {
        addGold(reward.gold, "Quest reward");
      }
      if (reward.item && reward.item.includes("Companion")) {
        const companionName = reward.item.replace(" Companion", "");
        if (companions[companionName]) {
          acquireCompanion(companionName);
          log(`🎉 ${companionName} has joined your party!`, true);
        } else {
          acquireCompanion(reward.item);
        }
      } 
      else if (reward.item) {
      addItemToInventory(reward.item, 1);
      }
      if (reward.exp) {
        gainExp(reward.exp);
      }
      playerQuestState.status = 'COMPLETED';
      if (questData.followUpQuest) {
        if (!player.quests[questData.followUpQuest]) {
          player.quests[questData.followUpQuest] = { status: 'UNAVAILABLE', progress: 0 };
        }
        this.updateAllQuestStates();
      }
      saveGame();
      updateStats();
      checkAchievements();
      addAction("Continue", showLocation);
    }
  }
};

function handleNPCInteraction(npcName) {
  clearOutput();
  controls.innerHTML = "";
  const npcQuests = Object.entries(quests)
    .filter(([id, quest]) => quest.npc === npcName)
    .map(([id, quest]) => ({ id, ...quest }))
    .sort((a, b) => {
      const statusOrder = { 'READY_TO_COMPLETE': 0, 'AVAILABLE': 1, 'ACTIVE': 2, 'COMPLETED': 3, 'UNAVAILABLE': 4 };
      return statusOrder[player.quests[a.id]?.status] - statusOrder[player.quests[b.id]?.status];
    });
  const completableQuests = npcQuests.filter(quest => 
    player.quests[quest.id]?.status === 'READY_TO_COMPLETE'
    );
  if (completableQuests.length > 0) {
    const questData = completableQuests[0];
    log(`${npcName}: "${questData.dialogue.complete[0] || 'You have done it! Thank you!'}"`);
    if (completableQuests.length > 1) {
      log("\nYou have multiple quests ready to complete:", true);
      completableQuests.forEach((quest, index) => {
        addAction(`Complete: ${quest.title}`, () => QuestManager.completeQuest(quest.id));
      });
      addAction("Nevermind", showLocation);
    } 
    else {
      addAction(`Complete Quest: ${questData.title}`, () => QuestManager.completeQuest(completableQuests[0].id));
      addAction("Nevermind", showLocation);
    }
    return;
  }
  const availableQuests = npcQuests.filter(quest => 
    player.quests[quest.id]?.status === 'AVAILABLE'
  );
  if (availableQuests.length > 0) {
    const questData = availableQuests[0];
    log(`${npcName}: "${questData.dialogue.start[0] || 'I have a task for you.'}"`);
    if(questData.dialogue.start[1]) log(`${npcName}: "${questData.dialogue.start[1]}"`);
    if (availableQuests.length > 1) {
      log("\nAvailable quests:", true);
      availableQuests.forEach((quest, index) => {
        addAction(`Accept: ${quest.title}`, () => QuestManager.startQuest(quest.id));
      });
      addAction("Decline", showLocation);
    } 
    else {
      addAction(`Accept Quest: ${questData.title}`, () => QuestManager.startQuest(availableQuests[0].id));
      addAction("Decline", showLocation);
    }
    return;
  }
  const activeQuests = npcQuests.filter(quest => 
    player.quests[quest.id]?.status === 'ACTIVE'
  );
  if (activeQuests.length > 0) {
    const questData = activeQuests[0];
    const playerQuestState = player.quests[activeQuests[0].id];
    log(`${npcName}: "${questData.dialogue.active[0] || 'Are you still working on that task?'}"`);
    log(`(Your progress: ${playerQuestState.progress}/${questData.objective.amount})`);
    if (activeQuests.length > 1) {
      log("\nCurrent quest progress:", true);
      activeQuests.forEach(quest => {
        const state = player.quests[quest.id];
        log(`- ${quest.title}: ${state.progress}/${quest.objective.amount}`);
      });
    }
    addAction("Continue", showLocation);
    return;
  }
  const defaultDialogues = { 
    "Village Elder": "It is good to see you, hero. What guidance do you seek?",
    "Hunter": "The woods are dangerous, but full of life. Keep your wits about you.",
    "Miner": "Careful in those caves. It's dangerous work.",
    "Dwarf Warrior": "Care for a drink? Oh, right. Nevermind.",
    "Fisherman": "The river is calm today. Good for fishing.",
    "Herbalist": "The forest provides many ingredients for my potions.",
    "Blacksmith": "I can craft powerful gear if you bring me the right materials.",
    "Mystic Sprite": "The forest whispers secrets to those who listen."
  };
  log(`${npcName}: "${defaultDialogues[npcName] || 'Greetings, traveler.'}"`);
  addAction("Continue", showLocation);
             }
