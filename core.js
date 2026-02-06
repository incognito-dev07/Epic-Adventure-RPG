// =====================
// INITIALIZATION & CORE SYSTEMS
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

// GLOBAL VARIABLES
let currentSaveSlot = 1;
let activePotionEffects = {
    Attack: { active: false, multiplier: 1, duration: 0 },
    health: { active: false, multiplier: 1, duration: 0 },
    Mana: { active: false, multiplier: 1, duration: 0 }
};
let currentMusic = null;
let backgroundMusicPosition = 0;
let battleMusicPosition = 0;

// AUDIO FUNCTIONS
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

// SAVE AND LOAD GAME
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

// PLAYER MANAGEMENT
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

// UI/UX HELPERS
function log(text, isBold = false) {
  const line = document.createElement("p");
  line.innerHTML = isBold ? `${text}` : text;
  output.appendChild(line);
  output.scrollBottom = output.scrollHeight;
}

function clearOutput() { 
  output.textContent = ""; 
}

function addAction(text, handler) { controls.appendChild(createButton(text, handler)); 
}

function createButton(text, handler) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.onclick = () => { 
    clearOutput(); 
    controls.innerHTML = ""; 
    handler(); 
  };
  return btn;
}

function addSidebarButton(text, handler) {
  const btn = document.createElement("button");
  btn.className = "sidebar-btn";
  btn.textContent = text;
  btn.onclick = handler;
  document.getElementById("sidebar").appendChild(btn);
}

// SIDEBAR FUNCTIONS
function openSidebar() {
  document.getElementById("sidebar").style.left = "0px";
}
function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.style.left = "-240px";
  }
}
function isInCombat() {
  return enemyHealthBar.style.display === "block" && enemyHealthBar.style.display !== "none";
}
function openAchievementsFromSidebar() {
  if (isInCombat()) {
    log("❌ Cannot open achievements during combat!", true);
    return;
  }
  closeSidebar();
  setTimeout(showAchievements, 300);
}
function openDailyChallengeFromSidebar() {
  if (isInCombat()) {
    log("❌ Cannot open daily challenges during combat!", true);
    return;
  }
  closeSidebar();
  setTimeout(showDailyChallenge, 300);
}
function openQuestsFromSidebar() {
  if (isInCombat()) {
    log("❌ Cannot open quests during combat!", true);
    return;
  }
  closeSidebar();
  setTimeout(showQuests, 300);
}
function openInventoryFromSidebar() {
  if (isInCombat()) {
    log("❌ Cannot open inventory during combat!", true);
    return;
  }
  closeSidebar();
  setTimeout(showInventory, 300);
}
function openSkillsFromSidebar() {
  if (isInCombat()) {
    log("❌ Cannot open skills during combat!", true);
    return;
  }
  closeSidebar();
  setTimeout(showSkills, 300);
}
function showCompanionsFromSidebar() {
  if (isInCombat()) {
    log("❌ Cannot manage companions during combat!", true);
    return;
  }
  closeSidebar();
  setTimeout(showCompanions, 300);
}
function showBestiaryFromSidebar() {
  if (isInCombat()) {
    log("❌ Cannot open bestiary during combat!", true);
    return;
  }
  closeSidebar();
  setTimeout(showBestiary, 300);
}
function openPrestigeFromSidebar() {
  if (isInCombat()) {
    log("❌ Cannot prestige during combat!", true);
    return;
  }
  closeSidebar();
  setTimeout(showPrestigeMenu, 300);
}
function openAudioFromSidebar() {
  if (isInCombat()) {
    log("❌ Cannot open audio during combat!",true);
    return;
  }
  closeSidebar();
  setTimeout(showAudioSettings, 300);
}
function openCreditsFromSidebar() {
  if (isInCombat()) {
    log("❌ Cannot open daily credit during combat!", true);
    return;
  }
  closeSidebar();
  setTimeout(showCredits, 300);
}
function openTutorialFromSidebar() {
  if (isInCombat()) {
    log("❌ Cannot tutorial during combat!", true);
    return;
  }
  closeSidebar();
  setTimeout(showTutorial, 300);
}
function openExitFromSidebar() {
  exitContainer.style.display = "block";
}
function confirmExit() {
  exitContainer.style.display = "none";
  enemyHealthBar.style.display = "none";
  document.getElementById("stats").classList.add("hidden");
  sidebarToggle.style.display = "none";
  closeSidebar();
  setTimeout(mainMenu, 300);
}
function cancelExit() {
  exitContainer.style.display = "none";
}

// ITEM POP-UP
function showItemDetails(itemName) {
  const details = shopItems[itemName];
  if (!details) {
    log(`❌ No information available for ${itemName}`, true);
    return;
  }
  const popup = document.getElementById("item-popup");
  const title = document.getElementById("item-popup-title");
  const detailsDiv = document.getElementById("item-popup-details");
  const closeBtn = document.getElementById("item-popup-close");
  title.textContent = itemName;
  let html = `
    <div style="font-size: 8vmin; text-align: center; margin: 2vmin 0;">${details.icon || "📦"}</div>
    <div class="item-description">${getItemDescription(details)}</div>
  `;
  html += `
    <div class="item-detail-row">
      <span class="item-detail-label">Category: ${details.category}</span>
    </div>
  `;
  if (details.bonus) {
    for (const stat in details.bonus) {
      html += `
        <div class="item-detail-row">
          <span class="item-detail-label">${stat}: +${details.bonus[stat]}</span>
        </div>
      `;
    }
  }
  if (details.special) {
    html += `
      <div class="item-detail-row">
        <span class="item-detail-label">Special: ${details.special} (${details.value || 'Active'})</span>
      </div>
    `;
  }
  if (details.heal) {
    html += `
      <div class="item-detail-row">
        <span class="item-detail-label">Heals: ${details.heal} HP</span>
      </div>
    `;
  }
  if (details.effect) {
    html += `
      <div class="item-detail-row">
        <span class="item-detail-label">Effect: ${details.effect.stat} +${((details.effect.modifier) * 100).toFixed(0)}% for ${details.effect.duration} turns</span>
      </div>
    `;
  }
  if (details.price > 0) {
    html += `
      <div class="item-detail-row">
        <span class="item-detail-label">Shop Price: ${details.price}g</span>
      </div>
    `;
  }
  if (details.nonSellable) {
    html += `<div class="item-detail-row"><span class="item-special-effect">Cannot Be Sold</span></div>`;
  }
  if (details.unique) {
    html += `<div class="item-detail-row"><span class="item-special-effect">Unique Item</span></div>`;
  }
  detailsDiv.innerHTML = html;
  closeBtn.onclick = () => {
    popup.classList.add("hidden");
  };
  popup.classList.remove("hidden");
}

function getItemDescription(details) {
  if (details.description) return details.description;
  switch (details.type) {
    case "weapon":
      return `A powerful weapon that increases your combat effectiveness.`;
    case "armor":
      return `Protective gear that enhances your survivability in battle.`;
    case "accessory":
      return `A magical item that provides special bonuses.`;
    case "consumable":
      if (details.heal && details.Mana) return `Restores both health and Mana.`;
      if (details.heal) return `Restores health during combat.`;
      if (details.Mana) return `Restores Mana for using skills.`;
      if (details.effect) return `Temporarily enhances your abilities.`;
      return `A useful consumable item.`;
    case "material":
      return `A crafting material used to create better equipment.`;
    case "sellable":
      return `Valuable loot that can be sold for gold.`;
    case "unique":
      return `A rare and powerful artifact with special properties.`;
    default:
      return `A mysterious item with unknown properties.`;
  }
}

function closeItemPopup() {
  document.getElementById("item-popup").classList.add("hidden");
}

// GAME FLOW - MAIN MENU
function mainMenu() {
  clearOutput();
  controls.innerHTML = "";
  miniMap.innerHTML = "";
  log("🏰 Welcome to Epic RPG Adventure!\n\nThis is a classic text-based RPG where you can choose your class, embark on quests, fight monsters, and explore various locations.\n\nGood luck, adventurer!");
  addAction("Start New Game", startNewGame);
  addAction("Load Game", showLoadMenu);
}

// GAME START/LOAD
function startNewGame() {
  let emptySlot = null;
  for(let i = 1; i <= 3; i++) {
    if (!localStorage.getItem(`epic_RPGv1_save_slot_${i}`)) {
      emptySlot = i;
      break;
    }
  }
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
  if (emptySlot === null) {
    log("❌ No empty save slots available. Please delete a game to start a new one.", true);
    showLoadMenu();
    return;
  }
  QuestManager.initializeQuests();
  chooseClass(emptySlot);
}

function showLoadMenu() {
  clearOutput();
  controls.innerHTML = "";
  log("📂 Select a saved game slot:");
  for (let i = 1; i <= 3; i++) {
    const d = localStorage.getItem(`epic_RPGv1_save_slot_${i}`);
        const saveState = d ? JSON.parse(d) : null;
    const saveInfo = saveState ? `Slot ${i}: ${saveState.name} the ${saveState.class} (Lv ${saveState.level})` : `Slot ${i}: Empty`;
      addAction(saveInfo, () => showSlotMenu(i, !!d));
  }
  addAction("⬅️ Back", mainMenu);
}

function chooseClass(slot) {
  clearOutput();
  controls.innerHTML = "";
  log("Choose your class:");
  for (let cls in CLASSES) {
    controls.appendChild(createButton(cls, () => {
      showPrompt((userName) => {
      const base = CLASSES[cls];
      player.class = cls;
      player.MaxHealth = base.MaxHealth;
      player.health = base.MaxHealth;
      player.maxMana = base.maxMana;
      player.Mana = base.maxMana;
      player.Attack = base.Attack;
      player.skills = [...base.skills];
      player.name = userName || "Hero";
      calculateStats();
      updateStatBars();
      document.getElementById("stats").classList.remove("hidden");
      QuestManager.updateAllQuestStates();
      updateStats();
      currentSaveSlot = slot;
      saveGame(slot);
      document.getElementById("sidebar-toggle").style.display = "block";
      showLocation();
      })
    }));
  }
}

function showPrompt(callback){
  const promptContainer = document.createElement("div");
  promptContainer.className = "promptContainerDiv"
  promptContainer.innerHTML = `
  <p style="font-size: 5vmin">What is your name, adventurer?</p>
  <input type="text" id="promptInput" placeholder="Hero">
  <button class="okClick">Ok</button>
  `;
  document.body.appendChild(promptContainer);
  const input = document.getElementById("promptInput");
  input.focus();
  document.querySelector(".okClick").onclick = () => {
    const userName = input.value.trim();
    document.body.removeChild(promptContainer);
    callback(userName);
  };
}

// LOADING SCREEN
loadingMsg1.style.animation = "show-and-hide 4s linear forwards";
setTimeout(() => {
  loadingMsg2.style.animation = "show-and-hide 5s linear forwards";
}, 4000);
setTimeout(() => {
  loadingMsg3.style.animation = "show-only 5s linear forwards";
}, 8900);
setTimeout(() => {
  loading.style.display = "none";
  loader.style.border = "none";
  loader.innerHTML = "<h3>Tap to skip!</h3>";
  loader.style.animation = "blink 1s ease-out infinite";
  loadscreen.addEventListener("click", () => {
    playBackgroundMusic();
    loadscreen.style.display = "none";
    initializePlayerStats();
    mainMenu();
  });
  setTimeout(() => {
    if (loadscreen.style.display !== "none") {
      playBackgroundMusic();
      loadscreen.style.display = "none";
      initializePlayerStats();
      mainMenu();
    }
  }, 20000);
}, 5000);

initializeCompanionSystem();
initializeCompanionCooldowns();

// GAME START
mainMenu();