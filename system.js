// =====================
// UI HELPERS
// =====================

//UI/UX HELPERS
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


//SIDEBAR FUNCTIONS
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


//MENU SYSTEM
function showQuests() {
  clearOutput();
  controls.innerHTML = "";
  log("📜 Quest Journal", true);
  const questTypes = { 'MAIN': [], 'SIDE': [], 'COMPLETED': [] };
  for (const questId in player.quests) {
    const playerQuestState = player.quests[questId];
    if(!playerQuestState) continue;
    const questData = quests[questId];
    if (playerQuestState.status === 'COMPLETED') {
      questTypes.COMPLETED.push({ data: questData, state: playerQuestState });
    } 
    else if (playerQuestState.status === 'ACTIVE' || playerQuestState.status === 'READY_TO_COMPLETE') {
      if (questData.type === 'MAIN') questTypes.MAIN.push({ data: questData, state: playerQuestState });
      else questTypes.SIDE.push({ data: questData, state: playerQuestState });
    }
  }
  log("\n--- Main Quests ---");
  if (questTypes.MAIN.length > 0) {
    questTypes.MAIN.forEach(q => {
      const progress = q.state.status === 'READY_TO_COMPLETE' ? '✅' : `(${q.state.progress}/${q.data.objective.amount})`;
      log(`${q.data.title} ${progress}`);
      log(`${q.data.description}`);
    });
  } 
  else log("No active main quests.");
  log("\n--- Side Quests ---");
  if (questTypes.SIDE.length > 0) {
    questTypes.SIDE.forEach(q => {
      const progress = q.state.status === 'READY_TO_COMPLETE' ? '✅' : `(${q.state.progress}/${q.data.objective.amount})`;
      log(`${q.data.title} ${progress}`);
      log(`   ${q.data.description}`);
    });
  } 
  else log("No active side quests.");
  log("\n--- Completed Quests ---");
  if (questTypes.COMPLETED.length > 0) {
    questTypes.COMPLETED.forEach(q => log(`✅ ${q.data.title}`));
  } 
  else log("No quests completed yet.");
  addAction("⬅️ Back", () => showLocation());
}

function showInventory() {
  clearOutput();
  controls.innerHTML = "";
  log("🎒 Inventory", true);
  const equippedWeapon = player.equipped.weapon ? (shopItems[player.equipped.weapon]?.icon || "") + " " + player.equipped.weapon : "None";
  const equippedArmor = player.equipped.armor ? (shopItems[player.equipped.armor]?.icon || "") + " " + player.equipped.armor : "None";
  const equippedAccessory = player.equipped.accessory ? (shopItems[player.equipped.accessory]?.icon || "") + " " + player.equipped.accessory : "None";
  log(`---📜 Equipped---`, true);
  log(`⚔ Weapon: ${equippedWeapon}\n ⚔ Armor: ${equippedArmor}\n ⚔ Accessory: ${equippedAccessory}`, true);
  if (player.equipped.weapon) addAction(`Unequip Weapon`, () => unequipItem("weapon"));
  if (player.equipped.armor) addAction(`Unequip Armor`, () => unequipItem("armor"));
  if (player.equipped.accessory) addAction(`Unequip Accessory`, () => unequipItem("accessory"));
  const categories = {
    "⚔️ Equipment": [],
    "🛠 Materials": [],
    "🧪 Consumables": [],
    "💰 Loot": [],
    "📜 Quest Items": [],
    "✨ Special": [],
    "Others": []
  };
  for (const item in player.inventory) {
    const qty = player.inventory[item];
    if (qty <= 0) continue;
    const details = shopItems[item] || {};
    if (item === player.equipped.weapon || item === player.equipped.armor || item === player.equipped.accessory) {
      continue;
    }
    if (details.type === "consumable") {
      categories["🧪 Consumables"].push({item, qty, details});
    } else if (details.type === "weapon" || details.type === "armor" || details.type === "accessory") {
      categories["⚔️ Equipment"].push({item, qty, details});
    } else if (details.type === "material") {
      categories["🛠 Materials"].push({item, qty, details});
    } else if (details.category === "Quest") {
      categories["📜 Quest Items"].push({item, qty, details});
    } else if (details.category === "Loot") {
      categories["💰 Loot"].push({item, qty, details});
    } else if (details.category === "Special") {
      categories["✨ Special"].push({item, qty, details});
    } else {
      categories["Others"].push({item, qty, details});
    }
  }
  let hasItems = false;
  Object.entries(categories).forEach(([categoryName, items]) => {
    if (items.length > 0) {
      hasItems = true;
      createCategoryAccordion(categoryName, items);
    }
  });
  if (!hasItems) {
    log("Inventory is empty.", true);
  }
  addAction("⬅️ Back", () => showLocation());
}

function createCategoryAccordion(categoryName, items) {
  items.forEach(({item, qty, details}) => {
    if (item.includes("Companion")) {
    return;
    }
  });
  const accordion = document.createElement("div");
  accordion.className = "accordion";
  const accordionHeader = document.createElement("button");
  accordionHeader.className = "accordion-header";
  accordionHeader.innerHTML = `
    <span>${categoryName} (${items.length})</span>
    <span class="accordion-icon">▼</span>
  `;
  const accordionContent = document.createElement("div");
  accordionContent.className = "accordion-content";
  const itemsContainer = document.createElement("div");
  itemsContainer.className = "accordion-items";
  items.forEach(({item, qty, details}) => {
    const itemLine = document.createElement("div");
    itemLine.className = "inventory-item-line";
    const displayQty = details.infinite ? '∞' : `x${qty}`;
    itemLine.innerHTML = `
      <span class="item-name">${details.icon || ""} ${item} ${displayQty}</span>
      <div class="item-actions">
        ${categoryName === "⚔️ Equipment" ? `<button class="small-btn equip-btn">Equip</button>` : ''}
        <button class="small-btn detail-btn">🔍</button>
      </div>
    `;
    const detailBtn = itemLine.querySelector('.detail-btn');
    detailBtn.onclick = () => showItemDetails(item);
    if (categoryName === "⚔️ Equipment") {
      const equipBtn = itemLine.querySelector('.equip-btn');
      equipBtn.onclick = () => { 
        equipItem(item); 
        showInventory();
      };
    }
    itemsContainer.appendChild(itemLine);
  });
  accordionContent.appendChild(itemsContainer);
  accordion.appendChild(accordionHeader);
  accordion.appendChild(accordionContent);
  output.appendChild(accordion);
  accordionHeader.addEventListener("click", function() {
    const isOpen = accordionContent.classList.contains("open");
    const icon = this.querySelector(".accordion-icon");
    if (isOpen) {
      accordionContent.classList.remove("open");
      icon.classList.remove("open");
    } else {
      accordionContent.classList.add("open");
      icon.classList.add("open");
    }
  });
}

function shopMenu(activeTab = "buy", shopLevel = player.shopLevel) {
  clearOutput();
  controls.innerHTML = "";
  const buyBtn = createButton("🛒 Buy", () => shopMenu("buy", shopLevel));
  const sellBtn = createButton("💰 Sell", () => shopMenu("sell", shopLevel));
  buyBtn.style.background = activeTab === "buy" ? "linear-gradient(45deg,#111,#444,#111)" : "#333";
  buyBtn.style.color = activeTab === "buy" ? "#ddd" : "#111";
  sellBtn.style.background = activeTab === "sell" ? "linear-gradient(45deg,#111,#444,#111)" : "#333";
  sellBtn.style.color = activeTab === "sell" ? "#ddd" : "#111";
  controls.appendChild(buyBtn);
  controls.appendChild(sellBtn);
  log(`🏪 Shop – ${activeTab === "buy" ? "Buy Items" : "Sell Items"}`);
  if (activeTab === "buy") {
    log(`Shop Level: ${player.shopLevel}`);
    const shopLevelContainer = document.createElement("div");
    shopLevelContainer.className = "shop-level-selector";
    output.appendChild(shopLevelContainer);
    for (let i = 1; i <= Object.keys(shopUnlocks).length; i++) {
      const levelBtn = document.createElement("button");
      levelBtn.textContent = `Lv ${i}`;
      levelBtn.onclick = () => shopMenu("buy", i);
      if (i <= player.shopLevel) {
        levelBtn.classList.add('unlocked-shop-level');
      } 
      else {
        levelBtn.classList.add('locked-shop-level');
        levelBtn.disabled = true;
      }
      if (i === shopLevel) levelBtn.classList.add('current-shop-level');
      shopLevelContainer.appendChild(levelBtn);
    }
    showShopItems(shopLevel);
  } 
  else if (activeTab === "sell") {
    let hasSellable = false;
    Object.keys(player.inventory).forEach(item => {
      const details = shopItems[item];
      if (details && !details.nonSellable && player.equipped.weapon !== item && player.equipped.armor !== item) {
        hasSellable = true;
        const qty = player.inventory[item];
        const sellPrice = Math.floor((details.price || 10) / 2);
        if(details.price === 0) return;
        const line = document.createElement("div");
        line.innerHTML = `${details.icon || ""} ${item} x${qty} – Sell price: ${sellPrice}g each`;
        [1, 3, 5].forEach(amount => {
          if (qty >= amount) {
            const btn = document.createElement("button");
            btn.textContent = `x${amount}`;
            btn.className = "small-btn";
            btn.onclick = () => sellItem(item, amount, activeTab, shopLevel);
            line.appendChild(btn);
          }
        });
        output.appendChild(line);
      }
    });
    if (!hasSellable) { log("❌ You have nothing to sell.", true); }
    addAction(`🏠 Go Back to ${player.location}`, showLocation);
  }
}

function showShopItems(level) {
  let available = {};
  let unlockedItems = shopUnlocks[level] || [];
  unlockedItems.forEach(item => { 
    if (shopItems[item]) available[item] = shopItems[item]; 
  });
  Object.keys(available).forEach(item => {
    const details = available[item];
    const qty = player.inventory[item] || 0;
    const line = document.createElement("div");
    line.innerHTML = `${details.icon || ""} ${item} – ${details.price}g (🎒 ${qty})`;
    const detailBtn = document.createElement("button");
    detailBtn.textContent = "🔍";
    detailBtn.className = "small-btn";
    detailBtn.title = "View details";
    detailBtn.onclick = () => showItemDetails(item);
    line.appendChild(detailBtn);
    const btn = document.createElement("button");
    btn.textContent = `Buy`;
    btn.className = "small-btn";
    btn.onclick = () => buyItem(item, 1, level); 
    line.appendChild(btn);
    output.appendChild(line);
  });
  if (Object.keys(available).length === 0) { log("❌ No items available at this shop level.", true); }
  if (level === player.shopLevel && player.shopLevel < Object.keys(shopUnlocks).length) {
    const upgradeCost = player.shopLevel * 200;
    addAction(`Upgrade Shop (Level ${player.shopLevel} → ${player.shopLevel + 1}) – ${upgradeCost} gold`, () => {
      if (player.gold >= upgradeCost) {
        player.gold -= upgradeCost;
        player.shopLevel++;
        saveGame();
        shopMenu("buy", level); 
      } 
      else { 
        log("❌ Not enough gold to upgrade the shop.", true);
        shopMenu("buy", level);
      }
      updateStats();
    });
  }
  addAction(`🏠 Go Back to ${player.location}`, showLocation);
}

function buyItem(item, quantity = 1, currentLevel = player.shopLevel) {
  const d = shopItems[item];
  if (!d) return;
  if (d.unique && (player.inventory[item] || 0) >= 1) {
    log(`❌ You can only own one unique item: ${item}`, true);
    return;
  }
  const totalPrice = (d.price || 0) * quantity;
  if (player.gold >= totalPrice) {
    if (!player.stats) initializePlayerStats();
    player.stats.itemsPurchased = (player.stats.itemsPurchased || 0) + quantity;
    player.stats.totalGoldEarned = (player.stats.totalGoldEarned || 0) - totalPrice;
  }
  if (player.gold >= totalPrice) {
    player.gold -= totalPrice;
    addItemToInventory(item, quantity);
    log(`✅ Bought ${item} x${quantity}! You now have ${player.inventory[item]} in your inventory.`, true);
  } 
  else {
    log("❌ Not enough gold.", true);
  }
  shopMenu("buy", currentLevel);
}

function sellItem(item, quantity = 1, currentTab = "sell", currentLevel = player.shopLevel) {
  const details = shopItems[item];
  if (!details || details.nonSellable || player.equipped.weapon === item || player.equipped.armor === item) {
    log("❌ You cannot sell this item, or it is currently equipped.", true);
    return;
  }
  const qtyOwned = player.inventory[item] || 0;
  if (qtyOwned < quantity) {
    log("❌ Not enough items to sell.", true);
    return;
  }
  const sellPrice = Math.floor((details.price || 10) / 2);
  const totalEarned = sellPrice * quantity;
  player.inventory[item] -= quantity;
  if (player.inventory[item] <= 0) delete player.inventory[item];
  player.gold += totalEarned;
  log(`💰 Sold ${item} x${quantity} for ${totalEarned} gold.`, true);
  saveGame();
  updateStats();
  shopMenu(currentTab, currentLevel);
}

function showSkills() {
  clearOutput();
  controls.innerHTML = "";
  log("🌟 Skill Tree:", true);
  Object.entries(skillUnlocks[player.class]).forEach(([lvl, skill]) => {
    const learned = player.skills.find(s => s.name === skill.name);
    const line = document.createElement("div");
    let skillText = `${skill.name} – ${skill.desc}`;
    if (learned) {
      line.innerHTML = `✅ ${skillText}`;
    } 
    else {
      if (player.level >= lvl) {
        line.innerHTML = `⭐ ${skillText}`;
        const learnBtn = document.createElement("button");
        learnBtn.textContent = "Learn";
        learnBtn.className = "small-btn";
        learnBtn.onclick = () => {
          player.skills.push(skill);
          log(`✨ You learned ${skill.name}!`, true);
          saveGame();
          showSkills();
        };
        line.appendChild(learnBtn);
      } 
      else {
        line.innerHTML = `🔒 ${skillText} (Unlocks at Lv ${lvl})`;
      }
    }
    output.appendChild(line);
  });
  addAction("⬅️ Back", () => showLocation());
}

function showAudioSettings() {
  clearOutput();
  controls.innerHTML = "";
  log("🔊 Audio Settings", true);
  const musicVolContainer = document.createElement("div");
  musicVolContainer.style.marginBottom = "2vmin";
  musicVolContainer.innerHTML = `
    <div>Music Volume:</div>
    <input type="range" id="music-volume-slider-audio" min="0" max="100" value="${player.audioSettings.musicVolume * 100}" style="width: 80%">
  `;
  output.appendChild(musicVolContainer);
  const musicToggle = document.createElement("button");
  musicToggle.className = "sidebar-btn";
  musicToggle.textContent = player.audioSettings.musicEnabled ? "🔊 Music: ON" : "🔇 Music: OFF";
  musicToggle.onclick = () => {
    player.audioSettings.musicEnabled = !player.audioSettings.musicEnabled;
    musicToggle.textContent = player.audioSettings.musicEnabled ? "🔊 Music: ON" : "🔇 Music: OFF";
    if (player.audioSettings.musicEnabled) {
      if (currentMusic === 'background') {
        playBackgroundMusic();
      } 
      else if (currentMusic === 'battle') {
        playBattleMusic();
      } 
      else {
        playBackgroundMusic();
      }
    } 
      else {
      stopAllMusic();
    }
  };
  output.appendChild(musicToggle);
  const sfxVolContainer = document.createElement("div");
  sfxVolContainer.style.marginBottom = "2vmin";
  sfxVolContainer.innerHTML = `
    <div>SFX Volume:</div>
    <input type="range" id="sfx-volume-slider-audio" min="0" max="100" value="${player.audioSettings.soundEffectsVolume * 100}" style="width: 80%">
  `;
  output.appendChild(sfxVolContainer);
  const sfxToggle = document.createElement("button");
  sfxToggle.className = "sidebar-btn";
  sfxToggle.textContent = player.audioSettings.soundEffectsEnabled ? "🔊 SFX: ON" : "🔇 SFX: OFF";
  sfxToggle.onclick = () => {
    player.audioSettings.soundEffectsEnabled = !player.audioSettings.soundEffectsEnabled;
    sfxToggle.textContent = player.audioSettings.soundEffectsEnabled ? "🔊 SFX: ON" : "🔇 SFX: OFF";
  };
  output.appendChild(sfxToggle);
  document.getElementById("music-volume-slider-audio").addEventListener("input", (e) => {
    player.audioSettings.musicVolume = e.target.value / 100;
    backgroundMusic.volume = player.audioSettings.musicVolume;
    battleMusic.volume = player.audioSettings.musicVolume;
  });
  document.getElementById("sfx-volume-slider-audio").addEventListener("input", (e) => {
    player.audioSettings.soundEffectsVolume = e.target.value / 100;
  });
  addAction("Save Changes", () => {
    showLocation();
    saveGame();
  });
}

function showTutorial() {
  clearOutput();
  controls.innerHTML = "";
  log("📖 Epic Adventure RPG - Tutorial & Guide", true);
  log("=".repeat(30), true);
  log("\n🎮 BASIC GAMEPLAY", true);
  log("• Explore different locations to find enemies, quests, and resources", true);
  log("• Fight enemies to gain experience, gold, and loot", true);
  log("• Complete quests for NPCs to earn special rewards", true);
  log("• Level up to increase your stats and learn new skills", true);
  log("• Manage your inventory and equip better gear", true);
  log("\n⚔️ COMBAT SYSTEM", true);
  log("• Each class has unique skills with different effects", true);
  log("• Use potions during battle to heal or boost stats", true);
  log("• Pay attention to enemy types and use appropriate strategies", true);
  log("• Some skills have cooldowns - use them strategically", true);
  log("• Running from combat is possible but not always successful", true);
  log("\n👥 CHARACTER CLASSES", true);
  log("⚔️ WARRIOR: High health, balanced damage, defensive skills", true);
  log("🧙‍♂️ MAGE: Powerful magic attacks, lower health, mana-focused", true);
  log("🗡️ ROGUE: High critical chance, evasion skills, versatile", true);
  log("📜 BARD: Support skills, healing, buffs and debuffs", true);
  log("\n🗺️ EXPLORATION & QUESTS", true);
  log("• Each location has unique enemies and resources", true);
  log("• Exploration lets you fight 5 waves of enemies for rewards", true);
  log("• Use trap kits to weaken the first enemy in exploration", true);
  log("• Quests are marked with ❓ (available) or ❗️ (ready to complete)", true);
  log("• Some locations require special maps to unlock", true);
  log("\n🔨 CRAFTING & ECONOMY", true);
  log("• Visit the Blacksmith to craft powerful equipment", true);
  log("• Gather materials from enemies and exploration", true);
  log("• Upgrade your shop to access better items", true);
  log("• Sell unwanted items for gold", true);
  log("• Some unique items can only be obtained through crafting", true);
  log("\n🌟 ADVANCED FEATURES", true);
  log("💎 PRESTIGE: Reset your progress for permanent bonuses (Level 10+)", true);
  log("🏰 INFINITE DUNGEON: Endless challenge with scaling difficulty", true);
  log("📅 DAILY CHALLENGES: Complete special tasks each day", true);
  log("🏆 ACHIEVEMENTS: Unlock achievements for special rewards", true);
  log("⛏️🎣 MINIGAMES: Mining and fishing for extra resources", true);
  log("\n💡 TIPS & STRATEGIES", true);
  log("• Always keep healing potions in your inventory", true);
  log("• Complete main story quests to unlock new areas", true);
  log("• Equip the best gear for your class and playstyle", true);
  log("• Use daily challenges for quick gold and experience", true);
  log("• Don't forget to use your class skills in combat", true);
  log("• Prestige when you feel progression slowing down", true);
  log("\n🎯 GOOD LUCK, ADVENTURER!", true);
  log("May your journey be epic and your loot plentiful!", true);
  
  addAction("⬅️ Back", showLocation);
}

function showCredits() {
  clearOutput();
  controls.innerHTML = "";
  log("📖 The Tale of the Code-Smith", true);
  log("=".repeat(30), true);
  log("\nIn a realm of ones and zeros, a vision was born...", true);
  log("\nA single developer, armed with knowledge and passion,", true);
  log("forged this world from pure imagination.", true);
  log("\n🧭 GUIDE: Osasan Olusola", true);
  log("🎪 REALM: Epic Adventure RPG", true);
  log("⏳ TIME: Countless hours of dedication", true);
  log("\nThe story continues with every line of code written,", true);
  log("every bug squashed, every feature perfected.", true);
  log("\nThis is Chapter One.", true);
  
  addAction("⬅️ Close the Book", showLocation);
}


//ITEM POP-UP
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



// =====================
// SPECIAL FEATURES
// =====================

//ACHIEVEMENTS
function checkAchievements() {
  if (!player.achievements) player.achievements = {};
  let newAchievements = 0;
  for (const [id, achievement] of Object.entries(achievements)) {
    if (!player.achievements[id] && achievement.check(player)) {
      player.achievements[id] = true;
      player.stats.achievementsUnlocked++;
      newAchievements++;
      if (achievement.reward.gold) {
        player.gold += achievement.reward.gold;
        player.stats.totalGoldEarned += achievement.reward.gold;
      }
      if (achievement.reward.exp) gainExp(achievement.reward.exp);
      if (achievement.reward.item) addItemToInventory(achievement.reward.item, 1);
      log(`🏆 Achievement Unlocked: ${achievement.icon} ${achievement.name}!`, true);
      log(achievement.desc, true);
      log(`✨ Rewards Received!`, true);
    }
  }
  if (newAchievements > 0) {
    saveGame();
  }
}

function showAchievements() {
  clearOutput();
  controls.innerHTML = "";
  log("🏆 Achievements", true);
  log(`Unlocked: ${player.stats?.achievementsUnlocked || 0}/${Object.keys(achievements).length}`, true);
  const progressPercent = (player.stats?.achievementsUnlocked || 0) / Object.keys(achievements).length * 100;
  const progressBar = document.createElement("div");
  progressBar.style.width = "100%";
  progressBar.style.height = "4vmin";
  progressBar.style.background = "#333";
  progressBar.style.borderRadius = "2vmin";
  progressBar.style.margin = "2vmin 0";
  progressBar.style.overflow = "hidden";
  progressBar.style.position = "relative";
  const progressFill = document.createElement("div");
  progressFill.style.height = "100%";
  progressFill.style.width = `${progressPercent}%`;
  progressFill.style.background = "linear-gradient(90deg, #555, #bbb)";
  progressFill.style.transition = "width 0.3s ease";
  const progressText = document.createElement("div");
  progressText.style.position = "absolute";
  progressText.style.top = "0";
  progressText.style.left = "0";
  progressText.style.width = "100%";
  progressText.style.height = "100%";
  progressText.style.display = "flex";
  progressText.style.alignItems = "center";
  progressText.style.justifyContent = "center";
  progressText.style.fontSize = "3vmin";
  progressText.style.fontWeight = "bold";
  progressText.style.textShadow = "0.5vmin 0.5vmin 1vmin black";
  progressText.textContent = `${Math.round(progressPercent)}% Complete (${player.stats?.achievementsUnlocked || 0}/${Object.keys(achievements).length})`;
  progressBar.appendChild(progressFill);
  progressBar.appendChild(progressText);
  output.appendChild(progressBar);
  for (const [id, achievement] of Object.entries(achievements)) {
    const unlocked = player.achievements?.[id];
    const status = unlocked ? "✅" : "🔒";
    const achievementDiv = document.createElement("div");
    achievementDiv.style.marginBottom = "3vmin";
    achievementDiv.style.padding = "2vmin";
    achievementDiv.style.background = "rgba(0,0,0,0.3)";
    achievementDiv.style.borderRadius = "1vmin";
    achievementDiv.style.border = "0.2vmin solid #444";
    const header = document.createElement("div");
    header.innerHTML = `${status} ${achievement.icon} ${achievement.name}`;
    header.style.fontWeight = "bold";
    header.style.fontSize = "3.5vmin";
    header.style.marginBottom = "1vmin";
    achievementDiv.appendChild(header);
    const desc = document.createElement("div");
    desc.textContent = achievement.desc;
    desc.style.marginBottom = "1.5vmin";
    desc.style.fontStyle = "italic";
    desc.style.color = "#ddd";
    achievementDiv.appendChild(desc);
    const progressInfo = document.createElement("div");
    
    if (unlocked) {
      progressInfo.innerHTML = `<span style="color: gold;">COMPLETED</span>`;
      progressInfo.style.marginBottom = "1vmin";
    } else {
      let current = 0;
      let total = 1;
      let progressText = "";
      if (id === "first_blood") {
        current = player.stats?.enemiesDefeated || 0;
        total = 1;
        progressText = `Enemies Defeated: ${current}/${total}`;
      } else if (id === "veteran") {
        current = player.stats?.enemiesDefeated || 0;
        total = 100;
        progressText = `Enemies Defeated: ${current}/${total}`;
      } else if (id === "slayer") {
        current = player.stats?.enemiesDefeated || 0;
        total = 500;
        progressText = `Enemies Defeated: ${current}/${total}`;
      } else if (id === "dragon_slayer") {
        current = player.bossesDefeated?.includes("Mountain Dragon") ? 1 : 0;
        total = 1;
        progressText = `Mountain Dragons Defeated: ${current}/${total}`;
      }
      else if (id === "first_quest") {
        current = Object.values(player.quests || {}).filter(q => q.status === 'COMPLETED').length;
        total = 1;
        progressText = `Quests Completed: ${current}/${total}`;
      } else if (id === "quest_master") {
        current = Object.values(player.quests || {}).filter(q => q.status === 'COMPLETED').length;
        total = 10;
        progressText = `Quests Completed: ${current}/${total}`;
      } else if (id === "main_story") {
        const mainQuests = Object.entries(quests || {}).filter(([id, q]) => q.type === 'MAIN').map(([id]) => id);
        current = mainQuests.filter(id => player.quests?.[id]?.status === 'COMPLETED').length;
        total = mainQuests.length;
        progressText = `Main Quests Completed: ${current}/${total}`;
      }
      else if (id === "explorer") {
        const visited = player.stats?.locationsVisited || [];
        current = visited.length;
        total = locations.length;
        progressText = `Locations Visited: ${current}/${total}`;
      } else if (id === "master_explorer") {
        current = player.stats?.explorationsCompleted || 0;
        total = 25;
        progressText = `Explorations Completed: ${current}/${total}`;
      }
      else if (id === "apprentice_crafter") {
        current = player.stats?.itemsCrafted || 0;
        total = 1;
        progressText = `Items Crafted: ${current}/${total}`;
      } else if (id === "master_crafter") {
        current = player.stats?.itemsCrafted || 0;
        total = 20;
        progressText = `Items Crafted: ${current}/${total}`;
      }
      else if (id === "wealthy") {
        current = player.stats?.totalGoldEarned || 0;
        total = 5000;
        progressText = `Gold Earned: ${current}/${total}`;
      } else if (id === "tycoon") {
        current = player.stats?.totalGoldEarned || 0;
        total = 20000;
        progressText = `Gold Earned: ${current}/${total}`;
      } else if (id === "shopkeeper") {
        current = player.stats?.itemsPurchased || 0;
        total = 50;
        progressText = `Items Purchased: ${current}/${total}`;
      }
      else if (id === "novice") {
        current = player.level;
        total = 10;
        progressText = `Player Level: ${current}/${total}`;
      } else if (id === "champion") {
        current = player.level;
        total = 25;
        progressText = `Player Level: ${current}/${total}`;
      } else if (id === "legend") {
        current = player.level;
        total = 50;
        progressText = `Player Level: ${current}/${total}`;
      }
      else if (id === "collector") {
        current = Object.keys(player.inventory || {}).length;
        total = 30;
        progressText = `Unique Items: ${current}/${total}`;
      } else if (id === "hoarder") {
        current = Object.keys(player.inventory || {}).length;
        total = 75;
        progressText = `Unique Items: ${current}/${total}`;
      } else if (id === "master_of_arts") {
        const classSkills = skillUnlocks[player.class] ? Object.values(skillUnlocks[player.class]) : [];
        current = (player.skills || []).length;
        total = classSkills.length;
        progressText = `Class Skills Learned: ${current}/${total}`;
      }
      else if (id === "daily_player") {
        current = Object.keys(player.dailyChallenges?.completed || {}).length;
        total = 7;
        progressText = `Daily Challenges: ${current}/${total}`;
      } else if (id === "challenge_master") {
        current = Object.keys(player.dailyChallenges?.completed || {}).length;
        total = 30;
        progressText = `Daily Challenges: ${current}/${total}`;
      }
      
      const percent = Math.min(100, (current / total) * 100);
      progressInfo.innerHTML = `<div style="margin-bottom: 1vmin;">${progressText}</div>`;
      const indivProgressBar = document.createElement("div");
      indivProgressBar.style.width = "100%";
      indivProgressBar.style.height = "2.5vmin";
      indivProgressBar.style.background = "#222";
      indivProgressBar.style.borderRadius = "1vmin";
      indivProgressBar.style.margin = "1vmin 0";
      indivProgressBar.style.overflow = "hidden";
      indivProgressBar.style.position = "relative";
      const indivProgressFill = document.createElement("div");
      indivProgressFill.style.height = "100%";
      indivProgressFill.style.width = `${percent}%`;
      indivProgressFill.style.background = "linear-gradient(90deg, #555, #bbb)";
      indivProgressFill.style.transition = "width 0.3s ease";
      const indivProgressText = document.createElement("div");
      indivProgressText.style.position = "absolute";
      indivProgressText.style.top = "0";
      indivProgressText.style.left = "0";
      indivProgressText.style.width = "100%";
      indivProgressText.style.height = "100%";
      indivProgressText.style.display = "flex";
      indivProgressText.style.alignItems = "center";
      indivProgressText.style.justifyContent = "center";
      indivProgressText.style.fontSize = "2vmin";
      indivProgressText.style.fontWeight = "bold";
      indivProgressText.style.textShadow = "0.3vmin 0.3vmin 0.5vmin black";
      indivProgressText.textContent = `${Math.round(percent)}%`;
      indivProgressBar.appendChild(indivProgressFill);
      indivProgressBar.appendChild(indivProgressText);
      progressInfo.appendChild(indivProgressBar);
    }
    achievementDiv.appendChild(progressInfo);
    output.appendChild(achievementDiv);
  }
  addAction("⬅️ Back", showLocation);
}


//DAILY CHALLENGES
function showDailyChallenge() {
  clearOutput();
  controls.innerHTML = "";
  if (!player.dailyChallenges) {
    player.dailyChallenges = {
      lastCheck: null,
      completed: {},
      current: null,
      currentDate: null,
      progress: 0
    };
  }
  const today = new Date().toISOString().split('T')[0];
  if (!player.dailyChallenges.current || player.dailyChallenges.currentDate !== today) {
    player.dailyChallenges.current = getTodaysChallenge();
    player.dailyChallenges.currentDate = today;
    player.dailyChallenges.progress = 0;
    saveGame();
  }
  const challenge = player.dailyChallenges.current;
  if (!challenge) {
    log("❌ No daily challenge available today.", true);
    addAction("⬅️ Back", showLocation);
    return;
  }
  if (player.dailyChallenges.completed && player.dailyChallenges.completed[today]) {
    log("✅ Today's Daily Challenge Already Completed!", true);
    log(`You completed: ${challenge.title}`, true);
    log("Come back tomorrow for a new challenge!", true);
  } 
  else {
    log("📋 Today's Daily Challenge", true);
    log(`---🎯 ${challenge.title}---`, true);
    if (challenge.objective === "KILL") {
      log(`Defeat ${challenge.amount} ${challenge.target}s`, true);
    } 
    else {
      log(`Collect ${challenge.amount} ${challenge.target}s`, true);
    }
    log(`Progress: ${player.dailyChallenges.progress || 0}/${challenge.amount}`, true);
    log("\nRewards:", true);
    if (challenge.reward.gold || challenge.reward.exp || challenge.reward.item) log(`💰 ${challenge.reward.gold} Gold,  ✨ ${challenge.reward.exp} EXP, 🎁 ${challenge.reward.item}`,true);
  }
  addAction("⬅️ Back", showLocation);
}

function getTodaysChallenge() {
  const today = new Date().toISOString().split('T')[0];
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const challengeIndex = (dayOfYear % 5) + 1;
  return dailyChallenges[`challenge_${challengeIndex}`];
}

function checkDailyChallengeProgress(actionType, target, amount = 1) {
  if (!player.dailyChallenges) {
    player.dailyChallenges = {
      lastCheck: null,
      completed: {},
      current: null,
      currentDate: null,
      progress: 0
    };
  }
  const today = new Date().toISOString().split('T')[0];
  if (player.dailyChallenges.completed && player.dailyChallenges.completed[today]) {
    return;
  }
  if (!player.dailyChallenges.current || player.dailyChallenges.currentDate !== today) {
    player.dailyChallenges.current = getTodaysChallenge();
    player.dailyChallenges.currentDate = today;
    player.dailyChallenges.progress = 0;
    saveGame();
  }
  const challenge = player.dailyChallenges.current;
  if (!challenge) return;
  if (challenge.objective === actionType && challenge.target === target) {
    player.dailyChallenges.progress = Math.min(challenge.amount, (player.dailyChallenges.progress || 0) + amount);
    if (player.dailyChallenges.progress >= challenge.amount) {
      completeDailyChallenge();
    } 
    else {
      log(`📋 Daily Challenge: ${challenge.title} (${player.dailyChallenges.progress}/${challenge.amount})`, true);
    }
    saveGame();
  }
}

function completeDailyChallenge() {
  const challenge = player.dailyChallenges.current;
  const today = new Date().toISOString().split('T')[0];
  player.dailyChallenges.completed[today] = true;
  if (challenge.reward.gold) {
    addGold(challenge.reward.gold, "Daily challenge");
  }
  if (challenge.reward.exp) {
    gainExp(challenge.reward.exp);
  }
  if (challenge.reward.item) {
    addItemToInventory(challenge.reward.item, 1);
  }
  log(`🎉 Daily Challenge Complete: ${challenge.title}!`, true);
  updateStats();
  saveGame();
}


//CRAFTING SYSTEM
function showCraftingMenu() {
  clearOutput();
  controls.innerHTML = "";
  log("🔨 Blacksmith's Forge - Crafting Recipes:", true);
  const craftingListContainer = document.createElement("div");
  craftingListContainer.style.display = "flex";
  craftingListContainer.style.flexDirection = "column";
  craftingListContainer.style.gap = "3vmin";
  output.appendChild(craftingListContainer);
  Object.entries(craftingRecipes).forEach(([itemName, recipe]) => {
    let canCraftDueToQuests = true;
    if (recipe.requires) {
      canCraftDueToQuests = recipe.requires.every(questId => 
      player.quests[questId]?.status === 'COMPLETED');
    }
    let canCraftMaterials = true;
    let materialsList = Object.entries(recipe.materials).map(([mat, count]) => {
      const hasEnough = (player.inventory[mat] || 0) >= count;
      if (!hasEnough) canCraftMaterials = false;
      return `<span style="color:${hasEnough ? 'lime':'red'}">${mat} (${player.inventory[mat] || 0}/${count})</span>`;
    }).join(", ");
    const itemLine = document.createElement("div");
    if (recipe.requires && !canCraftDueToQuests) {
      itemLine.innerHTML = `${itemName} – <span style="color:red">Requires completing specific quests</span>`;
    } 
    else {
      itemLine.innerHTML = `${itemName} – Requires: ${materialsList}`;
      const craftBtn = document.createElement("button");
      craftBtn.textContent = `Craft`;
      craftBtn.className = "small-btn";
      craftBtn.disabled = !canCraftMaterials || !canCraftDueToQuests;
      craftBtn.onclick = () => craftItem(itemName, recipe);
            itemLine.appendChild(craftBtn);
    }
    craftingListContainer.appendChild(itemLine);
  });
  addAction("Back to Forge", () => travelTo("Blacksmith's Forge"));
}

function craftItem(itemName, recipe) {
  let canCraft = true;
  Object.entries(recipe.materials).forEach(([mat, count]) => {
    if ((player.inventory[mat] || 0) < count) canCraft = false;
  });
  if (canCraft) {
    if (!player.stats) initializePlayerStats();
    player.stats.itemsCrafted = (player.stats.itemsCrafted || 0) + 1;
  }
  if (canCraft) {
    Object.entries(recipe.materials).forEach(([mat, count]) => {
      player.inventory[mat] -= count;
      if (player.inventory[mat] <= 0) delete player.inventory[mat];
    });
    if (Math.random() < recipe.successRate) {
      addItemToInventory(itemName, 1);
    } 
    else {
    log(`❌ The crafting failed! The materials were lost.`, true);
    }
  } 
  else {
        log("❌ You don't have the required materials.", true);
  }
  saveGame();
  showCraftingMenu();
}


//COMPANION SYSTEM
function showCompanions() {
  clearOutput();
  controls.innerHTML = "";
  log("🐾 Companion Roster", true);
  log("Your loyal companions who aid you on your journey.", true);
  if (!player.companions || Object.keys(player.companions).length === 0) {
    log("❌ You don't have any companions yet.", true);
    log("Companions can be found through quests, events, or by defeating certain bosses.", true);
    log("\n🔍 How to get companions:", true);
    log("• Complete the Herbalist's quest in the Forest for a Healing Sprite Companion", true);
    log("• Complete the Mystic Forest Ritual quest for a Mystic Owl Companion", true);
    log("• Help wounded animals during travel events", true);
    log("• Defeat certain bosses for rare companion drops", true);
    addAction("⬅️ Back", showLocation);
    return;
  }
  Object.keys(player.companions).forEach(companionName => {
    const companionData = companions[companionName];
    const companionState = player.companions[companionName];
    const companionDiv = document.createElement("div");
    companionDiv.style.margin = "3vmin 0";
    companionDiv.style.padding = "4vmin";
    companionDiv.style.background = "rgba(0,0,0,0.3)";
    companionDiv.style.borderRadius = "1vmin";
    companionDiv.style.border = companionState.active ? "0.2vmin solid #ddd" : "0.2vmin solid #444";
    companionDiv.innerHTML = `
      <div style="font-size: 5vmin;">${companionData.icon} ${companionData.name} ${companionState.active ? "⭐" : ""}</div>
      <div style="font-style: italic; color: #ddd;">${companionData.description}</div>
      <div>Level: ${companionState.level} | EXP: ${companionState.exp}/${companionState.level * 100}</div>
      <div>Type: ${companionData.type} | Status: ${companionState.active ? "✅ Active" : "❌ Inactive"}</div>
      <div>Passive: ${companionData.passive}</div>
    `;
    const actionsDiv = document.createElement("div");
    actionsDiv.style.marginTop = "1vmin";
    actionsDiv.style.display = "flex";
    actionsDiv.style.gap = "1vmin";
    actionsDiv.style.flexWrap = "wrap";
    if (!companionState.active) {
      const activateBtn = document.createElement("button");
      activateBtn.textContent = "Activate";
      activateBtn.className = "small-btn";
      activateBtn.onclick = () => activateCompanion(companionName);
      actionsDiv.appendChild(activateBtn);
    } 
    else {
      const deactivateBtn = document.createElement("button");
      deactivateBtn.textContent = "Deactivate";
      deactivateBtn.className = "small-btn";
      deactivateBtn.onclick = () => deactivateCompanion(companionName);
      actionsDiv.appendChild(deactivateBtn);
    }
    const detailsBtn = document.createElement("button");
    detailsBtn.textContent = "Skills";
    detailsBtn.className = "small-btn";
    detailsBtn.onclick = () => showCompanionSkills(companionName);
    actionsDiv.appendChild(detailsBtn);
    companionDiv.appendChild(actionsDiv);
    output.appendChild(companionDiv);
  });
  addAction("⬅️ Back", showLocation);
}

function showCompanionSkills(companionName) {
  clearOutput();
  controls.innerHTML = "";
  const companionData = companions[companionName];
  const companionState = player.companions[companionName];
  log(`${companionData.icon} ${companionName} - Skills`, true);
  log(`Level ${companionState.level} Companion`, true);
  companionData.skills.forEach((skill, index) => {
    const isUnlocked = companionState.skillsUnlocked.includes(skill.name);
    const skillDiv = document.createElement("div");
    skillDiv.style.margin = "2vmin 0";
    skillDiv.style.padding = "4vmin";
    skillDiv.style.border = "0.3vmin solid #333";
    skillDiv.style.background = isUnlocked ? "rgba(0,50,0,0.3)" : "rgba(50,0,0,0.3)";
    skillDiv.style.borderRadius = "1vmin";
    if (isUnlocked) {
      skillDiv.innerHTML = `
        <div style="font-weight: bold;">✅ ${skill.name}</div>
        <div>${skill.description}</div>
        <div>Cooldown: ${skill.cooldown || 3} turns</div>
      `;
    } 
    else {
      skillDiv.innerHTML = `
        <div style="font-weight: bold;">🔒 ${skill.name} (Unlocks at level ${index + 1})</div>
        <div>${skill.description}</div>
      `;
    }
    output.appendChild(skillDiv);
  });
  addAction("⬅️ Back", showCompanions);
}

function activateCompanion(companionName) {
  if (player.companions) {
    Object.keys(player.companions).forEach(name => {
      player.companions[name].active = false;
    });
  }
  player.companions[companionName].active = true;
  log(`✅ ${companionName} is now your active companion!`, true);
  saveGame();
  showCompanions();
}

function deactivateCompanion(companionName) {
  player.companions[companionName].active = false;
  log(`❌ ${companionName} is no longer active.`, true);
  saveGame();
  showCompanions();
}

function showCompanionDetails(companionName) {
  clearOutput();
  controls.innerHTML = "";
  const companionData = companions[companionName];
  const companionState = player.companions[companionName];
  log(`${companionData.icon} ${companionData.name} - Details`, true);
  log(`Type: ${companionData.type} | Level: ${companionState.level}`, true);
  log(`Acquisition: ${companionData.acquisition}`, true);
  log(`Passive: ${companionData.passive}`, true);
  log("\nSkills:", true);
  companionData.skills.forEach(skill => {
    log(`• ${skill.name}: ${skill.description}`, true);
  });
  log(`\nStatus: ${companionState.active ? "✅ Active" : "❌ Inactive"}`, true);
  addAction("⬅️ Back", showCompanions);
}

function companionCombatAction(enemy, mode) {
  if (!player.companions) return null;
  const activeCompanionName = Object.keys(player.companions).find(name => 
    player.companions[name].active
  );
  if (!activeCompanionName) return null;
  const companionData = companions[activeCompanionName];
  const companionState = player.companions[activeCompanionName];
  const availableSkills = companionData.skills.filter(skill => 
    !companionState.cooldowns || !companionState.cooldowns[skill.name] || companionState.cooldowns[skill.name] <= 0
  );
  if (availableSkills.length === 0) return null;
  const chosenSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
  if (!companionState.cooldowns) companionState.cooldowns = {};
  companionState.cooldowns[chosenSkill.name] = chosenSkill.cooldown || 3;
  return {
    name: companionData.name,
    skill: chosenSkill,
    icon: companionData.icon
  };
}

function setupCompanionAcquisition() {
  if (!player.companions) {
    player.companions = {};
  }
  setupCompanionQuests();
  setupCompanionEvents();
}

function setupCompanionQuests() {
  if (quests['MYSTIC_FOREST_RITUAL']) {
    quests['MYSTIC_FOREST_RITUAL'].reward.item = "Mystic Owl Companion Companion";
  }
}

function setupCompanionEvents() {
  travelEvents["COMPANION_FIND"] = {
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
  };
}

function acquireCompanion(companionName) {
  if (!player.companions) {
    player.companions = {};
  }
  if (!player.companions[companionName]) {
    player.companions[companionName] = {
      level: 1,
      exp: 0,
      active: false,
      skillsUnlocked: [companions[companionName].skills[0].name],
      cooldowns: {}
    };
    log(`🎉 ${companions[companionName].icon} ${companionName} has joined your party!`, true);
    log(companions[companionName].description, true);
    initializeCompanionSkills();
    const activeCompanions = Object.keys(player.companions).filter(name => 
      player.companions[name].active
    );
    if (activeCompanions.length === 0) {
      player.companions[companionName].active = true;
      log(`✅ ${companionName} is now your active companion!`, true);
    }
    saveGame();
    return true;
  } 
  else {
    log(`ℹ️ You already have ${companionName} as a companion.`, true);
    return false;
  }
}

function addCompanionBossDrops() {
  const bossCompanionDrops = {
    "Crystal Golem": { companion: "Treasure Goblin Companion", chance: 0.1 },
    "Ancient Guardian": { companion: "Treasure Goblin Companion", chance: 0.15 },
    "Crystal Queen": { companion: "Treasure Goblin Companion", chance: 0.2 }
  };
  const originalEndFight = endFight;
  endFight = function(enemy, mode) {
    if (bossCompanionDrops[enemy.name] && Math.random() < bossCompanionDrops[enemy.name].chance) {
      const companionName = bossCompanionDrops[enemy.name].companion;
      acquireCompanion(companionName);
    }
    originalEndFight(enemy, mode);
  };
}

function gainCompanionExp(companionName, expAmount) {
  if (!player.companions[companionName]) return;
  const companion = player.companions[companionName];
  companion.exp += expAmount;
  const expRequired = companion.level * 100;
  if (companion.exp >= expRequired) {
    companion.level++;
    companion.exp -= expRequired;
    log(`⭐ ${companionName} leveled up to level ${companion.level}!`, true);
    initializeCompanionSkills();
    const companionData = companions[companionName];
    if (companionData.skills[companion.level - 1] && !companion.skillsUnlocked.includes(companionData.skills[companion.level - 1].name)) {
      companion.skillsUnlocked.push(companionData.skills[companion.level - 1].name);
      log(`✨ ${companionName} learned a new skill: ${companionData.skills[companion.level - 1].name}!`, true);
    }
    saveGame();
  }
}

function updateCompanionExp(rewardExp) {
  const activeCompanionName = Object.keys(player.companions || {}).find(name => 
    player.companions[name].active
  );
  
  if (activeCompanionName) {
    const companionExp = Math.floor(rewardExp * 0.3);
    gainCompanionExp(activeCompanionName, companionExp);
  }
}

function initializeCompanionSystem() {
  if (!player.companions) {
    player.companions = {};
  }
  Object.keys(player.companions).forEach(companionName => {
    const companionState = player.companions[companionName];
    if (!companionState.cooldowns) companionState.cooldowns = {};
    if (!companionState.skillsUnlocked) companionState.skillsUnlocked = companions[companionName]?.skills.map(s => s.name) || [];
  });
}

function initializeCompanionSkills() {
  if (!player.companions) return;
  Object.keys(player.companions).forEach(companionName => {
    const companionState = player.companions[companionName];
    const companionData = companions[companionName];
    
    if (!companionState.skillsUnlocked) {
      companionState.skillsUnlocked = [];
    }
    if (companionData.skills && companionData.skills.length > 0) {
      const firstSkill = companionData.skills[0].name;
      if (!companionState.skillsUnlocked.includes(firstSkill)) {
        companionState.skillsUnlocked.push(firstSkill);
      }
    }
    if (companionData.skills) {
      companionData.skills.forEach((skill, index) => {
        const requiredLevel = index + 1;
        if (companionState.level >= requiredLevel && 
            !companionState.skillsUnlocked.includes(skill.name)) {
          companionState.skillsUnlocked.push(skill.name);
        }
      });
    }
  });
}

function initializeCompanionCooldowns() {
  if (!player.companions) return;
  Object.keys(player.companions).forEach(companionName => {
    const companionState = player.companions[companionName];
    if (!companionState.cooldowns) {
      companionState.cooldowns = {};
    }
    const companionData = companions[companionName];
    if (companionData && companionData.skills) {
      companionData.skills.forEach(skill => {
        if (companionState.skillsUnlocked && companionState.skillsUnlocked.includes(skill.name)) {
          if (companionState.cooldowns[skill.name] === undefined) {
            companionState.cooldowns[skill.name] = 0;
          }
        }
      });
    }
  });
}


//BESTIARY FUNCTIONS
function showBestiary() {
  clearOutput();
  controls.innerHTML = "";
  log("📖 Monster Bestiary", true);
  if (!player.bestiary) player.bestiary = {};
  const totalEnemies = Object.keys(bestiary).length;
  const encounteredEnemies = Object.keys(player.bestiary).length;
  const completionPercent = Math.round((encounteredEnemies / totalEnemies) * 100);
  log(`Completion: ${encounteredEnemies}/${totalEnemies} (${completionPercent}%)`, true);
  const progressBar = document.createElement("div");
  progressBar.style.width = "100%";
  progressBar.style.height = "2vmin";
  progressBar.style.background = "#333";
  progressBar.style.borderRadius = "1vmin";
  progressBar.style.margin = "1vmin 0";
  progressBar.style.overflow = "hidden";
  const progressFill = document.createElement("div");
  progressFill.style.height = "100%";
  progressFill.style.width = `${completionPercent}%`;
  progressFill.style.background = "linear-gradient(90deg, #555, #bbb)";
  progressBar.appendChild(progressFill);
  output.appendChild(progressBar);
  const enemyGrid = document.createElement("div");
  enemyGrid.style.display = "grid";
  enemyGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
  enemyGrid.style.gap = "3vmin";
  enemyGrid.style.marginTop = "2vmin";
  Object.keys(bestiary).forEach(enemyName => {
    const enemyData = bestiary[enemyName];
    const encountered = player.bestiary[enemyName];
    const enemyCard = document.createElement("div");
    enemyCard.style.padding = "3vmin";
    enemyCard.style.background = encountered ? "rgba(0,50,0,0.3)" : "rgba(50,0,0,0.3)";
    enemyCard.style.borderRadius = "1vmin";
    enemyCard.style.border = encountered ? "0.1vmin solid green" : "0.1vmin solid red";
    enemyCard.style.fontSize = "4vmin";
    const statusIcon = encountered ? "✅" : "❌";
    enemyCard.innerHTML = `
      <span style="font-weight: bold; margin-bottom: 0.5vmin;">${statusIcon} ${enemyData.name}</span>
      <span style="font-style: italic; color: #ddd; margin-bottom: 0.5vmin;">
        ${encountered ? enemyData.lore.substring(0, 60) + "..." : "Unknown enemy"}
      </span>
    `;
    if (encountered) {
      const detailsBtn = document.createElement("button");
      detailsBtn.textContent = "Details";
      detailsBtn.className = "small-btn";
      detailsBtn.style.marginTop = "0.5vmin";
      detailsBtn.style.padding = "0.5vmin 1vmin";
      detailsBtn.onclick = () => showEnemyDetails(enemyName);
      enemyCard.appendChild(detailsBtn);
    }
    enemyGrid.appendChild(enemyCard);
  });
  output.appendChild(enemyGrid);
  addAction("⬅️ Back", showLocation);
}

function showEnemyDetails(enemyName) {
  clearOutput();
  controls.innerHTML = "";
  const enemyData = bestiary[enemyName];
  const enemyStats = player.bestiary[enemyName] || { encountered: 0, defeated: 0 };
  log(`📊 ${enemyName}`, true);
  log(`Encounters: ${enemyStats.encountered} | Defeated: ${enemyStats.defeated}`, true);
  const detailsDiv = document.createElement("div");
  detailsDiv.style.fontSize = "4vmin";
  detailsDiv.innerHTML = `
    <div style="margin: 1vmin 0;"><strong>Lore:</strong> ${enemyData.lore}</div>
    <div style="margin: 1vmin 0;"><strong>Locations:</strong> ${enemyData.locations.join(", ")}</div>
    <div style="margin: 1vmin 0;"><strong>Stats:</strong> Health: ${enemyData.stats.health}, Attack: ${enemyData.stats.attack}</div>
  `;
  if (enemyData.weaknesses) {
    detailsDiv.innerHTML += `<div style="margin: 1vmin 0;"><strong>Weaknesses:</strong> ${enemyData.weaknesses.join(", ")}</div>`;
  }
  if (enemyData.resistances) {
    detailsDiv.innerHTML += `<div style="margin: 1vmin 0;"><strong>Resistances:</strong> ${enemyData.resistances.join(", ")}</div>`;
  }
  if (enemyData.drops) {
    detailsDiv.innerHTML += `<div style="margin: 1vmin 0;"><strong>Drops:</strong> ${enemyData.drops.join(", ")}</div>`;
  }
  output.appendChild(detailsDiv);
  addAction("⬅️ Back to Bestiary", showBestiary);
}

function updateBestiary(enemyName, action) {
  if (!player.bestiary) player.bestiary = {};
  if (!player.bestiary[enemyName]) {
    player.bestiary[enemyName] = { encountered: 0, defeated: 0 };
  }
  if (action === "encounter") {
    player.bestiary[enemyName].encountered++;
  } 
  else if (action === "defeat") {
    player.bestiary[enemyName].defeated++;
  }
}


//MINI GAMES
function startMiningMinigame() {
  player.minigameCooldowns.mining = Date.now() + 45000;
  const popup = document.getElementById("minigame-popup");
  const title = document.getElementById("minigame-title");
  const content = document.getElementById("minigame-content");
  const result = document.getElementById("minigame-result");
  const closeBtn = document.getElementById("minigame-close");
  title.textContent = "⛏️ Mining Minigame";
  content.innerHTML = `
    <div class="minigame-instructions">A rich vein of ore appears! Wait for the button to turn gold, then click it as fast as you can!</div>
    <div id="minigame-timer">Get ready...</div>
    <button id="minigame-action-btn" disabled style="background: #777; color: #333;">Wait...</button>
  `;
  result.textContent = "";
  closeBtn.style.display = "none";
  let reactionStartTime;
  let timeoutId;
  let waitTime = Math.random() * 2000 + 1000;
  const actionBtn = document.getElementById("minigame-action-btn");
  const timer = document.getElementById("minigame-timer");
  setTimeout(() => {
    timer.textContent = "3...";
    setTimeout(() => {
      timer.textContent = "2...";
      setTimeout(() => {
        timer.textContent = "1...";
        setTimeout(() => {
          timer.textContent = "MINE NOW!";
          actionBtn.textContent = "⛏️ MINE!";
          actionBtn.style.background = "gold";
          actionBtn.style.color = "black";
          actionBtn.disabled = false;
          reactionStartTime = Date.now();
          timeoutId = setTimeout(() => {
            result.textContent = "❌ Too slow! The ore vein collapsed.";
            result.className = "reaction-fail";
            actionBtn.disabled = true;
            actionBtn.style.background = "#777";
            closeBtn.style.display = "block";
            closeBtn.onclick = () => {
              popup.classList.add("hidden");
              showLocation();
            };
          }, 2000);
          
        }, 1000);
      }, 1000);
    }, 1000);
  }, 500);
  
  actionBtn.onclick = () => {
    if (actionBtn.disabled) return;
    clearTimeout(timeoutId);
    const reactionTime = Date.now() - reactionStartTime;
    actionBtn.disabled = true;
    actionBtn.style.background = "#777";
    let successLevel;
    if (reactionTime < 250) {
      successLevel = "perfect";
      result.textContent = `⚡ Perfect timing! (${reactionTime}ms)`;
      result.className = "reaction-success";
    } else if (reactionTime < 500) {
      successLevel = "good";
      result.textContent = `✅ Good reaction! (${reactionTime}ms)`;
      result.className = "reaction-success";
    } else {
      successLevel = "slow";
      result.textContent = `⚠️ A bit slow... (${reactionTime}ms)`;
      result.className = "reaction-fail";
    }
    const finds = [ 
      { item: "Copper Ore", chance: 0.6 }, 
      { item: "Silver Ore", chance: 0.3 }, 
      { item: "Gold Ore", chance: 0.15 },
      { item: "Mystic Stone", chance: 0.05 },
      { item: "Ancient Coin", chance: 0.02 }
    ];
    let rewards = [];
    const baseRolls = successLevel === "perfect" ? 3 : successLevel === "good" ? 2 : 1;
    for (let i = 0; i < baseRolls; i++) {
      const roll = Math.random();
      let sum = 0;
      for (const f of finds) {
        sum += f.chance;
        if (roll <= sum) {
          rewards.push(f.item);
          break;
        }
      }
    }
    if (rewards.length > 0) {
      rewards.forEach(item => {
        player.inventory[item] = (player.inventory[item] || 0) + 1;
        if (typeof QuestManager !== "undefined" && QuestManager.updateQuestProgress) {
          QuestManager.updateQuestProgress("COLLECT", item, 1);
        }
        checkDailyChallengeProgress("COLLECT", item, 1);
      });
      result.textContent += `\n🎁 Found: ${rewards.join(", ")}`;
      rewards.forEach(item => {
        const miningQuests = Object.entries(quests).filter(([id, quest]) => 
          quest.objective?.type === "COLLECT" && 
          quest.objective?.target === item
        );
        miningQuests.forEach(([questId, questData]) => {
          if (player.quests[questId]?.status === "ACTIVE") {
            log(`📜 Mining helped your quest: ${questData.title}`, true);
          }
        });
      });
    } 
    else {
      result.textContent += "\n⛏️ Found nothing valuable.";
    }
    closeBtn.style.display = "block";
    closeBtn.onclick = () => {
      popup.classList.add("hidden");
      saveGame();
      showLocation();
    };
  };
  closeBtn.onclick = () => {
    popup.classList.add("hidden");
    showLocation();
  };
  popup.classList.remove("hidden");
}

function startFishingMinigame() {
  player.minigameCooldowns.fishing = Date.now() + 45000;
  const popup = document.getElementById("minigame-popup");
  const title = document.getElementById("minigame-title");
  const content = document.getElementById("minigame-content");
  const result = document.getElementById("minigame-result");
  const closeBtn = document.getElementById("minigame-close");
  title.textContent = "🎣 Fishing Minigame";
  content.innerHTML = `
    <div class="minigame-instructions">Something bites your line! Wait for the bobber to dip, then reel it in quickly!</div>
    <div id="minigame-timer">Watch the bobber...</div>
    <button id="minigame-action-btn" disabled style="background: #777; color: #333;">🎣 Waiting...</button>
  `;
  result.textContent = "";
  closeBtn.style.display = "none";
  let reactionStartTime;
  let timeoutId;
  let waitTime = Math.random() * 2500 + 1500;
  const actionBtn = document.getElementById("minigame-action-btn");
  const timer = document.getElementById("minigame-timer");
  const fishingStates = ["🎣 Calm waters...", "🎣 Bobber twitches...", "🎣 BITE! REEL IN!"];
  setTimeout(() => {
    timer.textContent = fishingStates[0];
    setTimeout(() => {
      timer.textContent = fishingStates[1];
      setTimeout(() => {
        timer.textContent = fishingStates[2];
        actionBtn.textContent = "🎣 REEL IN!";
        actionBtn.style.background = "gold";
        actionBtn.style.color = "black";
        actionBtn.disabled = false;
        reactionStartTime = Date.now();
        timeoutId = setTimeout(() => {
          result.textContent = "❌ Too slow! The fish got away.";
          result.className = "reaction-fail";
          actionBtn.disabled = true;
          actionBtn.style.background = "#777";
          closeBtn.style.display = "block";
          closeBtn.onclick = () => {
            popup.classList.add("hidden");
            showLocation();
          };
        }, 1500);
        
      }, 1000 + Math.random() * 1000);
    }, 1000 + Math.random() * 1000);
  }, 500);
  actionBtn.onclick = () => {
    if (actionBtn.disabled) return;
    clearTimeout(timeoutId);
    const reactionTime = Date.now() - reactionStartTime;
    actionBtn.disabled = true;
    actionBtn.style.background = "#777";
    let successLevel;
    if (reactionTime < 250) {
      successLevel = "perfect";
      result.textContent = `⚡ Lightning reflexes! (${reactionTime}ms)`;
      result.className = "reaction-success";
    } else if (reactionTime < 500) {
      successLevel = "good";
      result.textContent = `✅ Nice catch! (${reactionTime}ms)`;
      result.className = "reaction-success";
    } else {
      successLevel = "slow";
      result.textContent = `⚠️ Almost lost it... (${reactionTime}ms)`;
      result.className = "reaction-fail";
    }
    const catches = [ 
      { item: "Small Fish", chance: 0.5 }, 
      { item: "Salmon", chance: 0.3 }, 
      { item: "Golden Fish", chance: 0.1 },
      { item: "Water Orb", chance: 0.05 },
      { item: "Coral Fragment", chance: 0.04 }
    ];
    let rewards = [];
    const baseRolls = successLevel === "perfect" ? 3 : successLevel === "good" ? 2 : 1;
    for (let i = 0; i < baseRolls; i++) {
      const roll = Math.random();
      let sum = 0;
      for (const c of catches) {
        sum += c.chance;
        if (roll <= sum) {
          rewards.push(c.item);
          break;
        }
      }
    }
    if (rewards.length > 0) {
      rewards.forEach(item => {
        player.inventory[item] = (player.inventory[item] || 0) + 1;
        if (typeof QuestManager !== "undefined" && QuestManager.updateQuestProgress) {
          QuestManager.updateQuestProgress("COLLECT", item, 1);
        }
        checkDailyChallengeProgress("COLLECT", item, 1);
      });
      result.textContent += `\n🎣 Caught: ${rewards.join(", ")}`;
      rewards.forEach(item => {
        const fishingQuests = Object.entries(quests).filter(([id, quest]) => 
          quest.objective?.type === "COLLECT" && 
          quest.objective?.target === item
        );
        fishingQuests.forEach(([questId, questData]) => {
          if (player.quests[questId]?.status === "ACTIVE") {
            log(`📜 Fishing helped your quest: ${questData.title}`, true);
          }
        });
      });
    } 
    else {
      result.textContent += "\n🎣 Nothing bit this time.";
    }
    closeBtn.style.display = "block";
    closeBtn.onclick = () => {
      popup.classList.add("hidden");
      saveGame();
      showLocation();
    };
  };
  closeBtn.onclick = () => {
    popup.classList.add("hidden");
    showLocation();
  };
  popup.classList.remove("hidden");
}


//PRESTIGE SYSTEM
function showPrestigeMenu() {
  clearOutput();
  controls.innerHTML = "";
  log("💎 Prestige System", true);
  log(`Current Prestige Level: ${player.prestigeLevel}`, true);
  log(`Available Prestige Points: ${player.prestigePoints}`, true);
  if (player.level < 10) {
    log("❌ You need to reach level  10 to prestige!", true);
    log("Continue your journey and return when you're stronger.", true);
    addAction("⬅️ Back", showLocation);
    return;
  }
  log("Prestiging will reset your level, gold, and some progress, but grant permanent bonuses!", true);
  log("You'll keep: Quests, Achievements, Shop Level, and Unique Items", true);
  const pointsEarned = calculatePrestigePoints();
  log(`🎯 Prestige Rewards:`, true);
  log(`• ${pointsEarned} Prestige Points`, true);
  log(`• Permanent stat bonuses`, true);
  log(`• New cosmetic titles`, true);
  log(`• Faster leveling`, true);
  addAction("🔥 Prestige Now!", () => startPrestige());
  addAction("💎 Prestige Shop", () => showPrestigeShop());
  addAction("❌ Not Ready", showLocation);
}
function calculatePrestigePoints() {
  let points = 0;
  points += 5;
  points += Math.floor((player.stats.achievementsUnlocked || 0) / 5);
  const mainQuests = Object.entries(quests).filter(([id, q]) => q.type === 'MAIN');
  const completedMainQuests = mainQuests.filter(([id]) => player.quests[id]?.status === 'COMPLETED').length;
  points += completedMainQuests * 2;
  if (player.level > 25) {
    points += Math.floor((player.level - 25) / 5);
  }
  return Math.max(5, points);
}

function startPrestige() {
  if (player.level < 10) {
    log("❌ You need to be level 10 or higher to prestige!", true);
    return;
  }
  clearOutput();
  log("🔥 INITIATING PRESTIGE SEQUENCE 🔥", true);
  log("The world begins to shimmer around you...", true);
  const pointsEarned = calculatePrestigePoints();
  const keepQuests = {...player.quests};
  const keepAchievements = {...player.achievements};
  const keepShopLevel = player.shopLevel;
  const keepBossesDefeated = [...player.bossesDefeated];
  const keepStats = {
    achievementsUnlocked: player.stats.achievementsUnlocked,
    locationsVisited: [...player.stats.locationsVisited]
  };
  const keepItems = {};
  for (const item in player.inventory) {
    const details = shopItems[item];
    if (details && (details.unique || details.legendary || details.nonSellable)) {
      keepItems[item] = player.inventory[item];
    }
  }
  player.level = 1;
  player.exp = 0;
  player.expToNextLevel = 400;
  player.gold = 200;
  const baseClass = CLASSES[player.class];
  player.MaxHealth = baseClass.MaxHealth;
  player.health = baseClass.MaxHealth;
  player.maxMana = baseClass.maxMana;
  player.Mana = baseClass.maxMana;
  player.Attack = baseClass.Attack;
  player.inventory = {"Mega Healing Potion": 3, ...keepItems};
  player.equipped = { weapon: null, armor: null, accessory: null };
  player.skills = [skillUnlocks[player.class][1]];
  player.skillCooldowns = {};
  player.quests = keepQuests;
  player.achievements = keepAchievements;
  player.shopLevel = keepShopLevel;
  player.bossesDefeated = keepBossesDefeated;
  player.stats.achievementsUnlocked = keepStats.achievementsUnlocked;
  player.stats.locationsVisited = keepStats.locationsVisited;
  player.prestigeLevel++;
  player.prestigePoints += pointsEarned;
  player.permanentBonuses.damage += 0.02;
  player.permanentBonuses.health += 0.02;
  player.permanentBonuses.mana += 0.02;
  player.permanentBonuses.goldFind += 0.05;
  player.permanentBonuses.expGain += 0.05;
  calculateStats();
  log(`🎉 PRESTIGE COMPLETE!`, true);
  log(`🔥 You are now Prestige Level ${player.prestigeLevel}!`, true);
  log(`💎 Gained ${pointsEarned} Prestige Points`, true);
  log(`✨ Permanent bonuses increased!`, true);
  log(`🏆 You kept your quest progress and achievements!`, true);
  saveGame();
  setTimeout(() => {
    showLocation();
  }, 3000);
}

function showPrestigeShop() {
  clearOutput();
  controls.innerHTML = "";
  log("💎 Prestige Shop", true);
  log(`Available Points: ${player.prestigePoints}`, true);
  log("Spend your hard-earned prestige points on permanent upgrades!", true);
  const upgrades = [
    { name: "Damage Boost",
      desc: "Permanently increase Attack by 5%",
      cost: 3,
      stat: "damage",
      value: 0.05,
      icon: "⚔️" },
    { name: "Health Boost", 
      desc: "Permanently increase Health by 5%",
      cost: 3,
      stat: "health",
      value: 0.05,
      icon: "❤️" },
    { name: "Mana Boost",
      desc: "Permanently increase Mana by 5%",
      cost: 3,
      stat: "mana", 
      value: 0.05,
      icon: "🔵" },
    { name: "Gold Finder",
      desc: "Permanently increase gold found by 10%",
      cost: 2,
      stat: "goldFind",
      value: 0.10,
      icon: "💰" },
    { name: "EXP Boost",
      desc: "Permanently increase EXP gained by 10%",
      cost: 4,
      stat: "expGain",
      value: 0.10,
      icon: "✨" },
    { name: "Skill Mastery",
      desc: "Start with an extra skill slot",
      cost: 8,
      special: "extraSkill",
      icon: "🌟" }
  ];
  upgrades.forEach(upgrade => {
    const line = document.createElement("div");
    line.style.margin = "2vmin 0";
    line.style.padding = "2vmin";
    line.style.background = "rgba(0,0,0,0.3)";
    line.style.borderRadius = "1vmin";
    line.innerHTML = `
      <div style="font-size: 4vmin;">${upgrade.icon} ${upgrade.name}</div>
      <div style="font-style: italic; color: #ddd;">${upgrade.desc}</div>
      <div>Cost: ${upgrade.cost} points</div>
    `;
    const buyBtn = document.createElement("button");
    buyBtn.textContent = "Purchase";
    buyBtn.className = "small-btn";
    buyBtn.disabled = player.prestigePoints < upgrade.cost;
    buyBtn.onclick = () => purchaseUpgrade(upgrade);
    line.appendChild(buyBtn);
    output.appendChild(line);
  });
  addAction("Back to Prestige Menu", showPrestigeMenu);
}

function purchaseUpgrade(upgrade) {
  if (player.prestigePoints < upgrade.cost) {
    log("❌ Not enough prestige points!", true);
    return;
  }
  player.prestigePoints -= upgrade.cost;
  if (upgrade.special === "extraSkill") {
    log(`🌟 Purchased ${upgrade.name}!`, true);
    log("This upgrade will take effect on your next prestige.", true);
  } 
  else {
    player.permanentBonuses[upgrade.stat] += upgrade.value;
    log(`✅ Purchased ${upgrade.name}!`, true);
    log(`✨ ${upgrade.stat} bonus increased!`, true);
    if (['damage', 'health', 'mana'].includes(upgrade.stat)) {
      calculateStats();
      updateStats();
    }
  }
  saveGame();
  showPrestigeShop();
}



// =====================
// GAME FLOW
// =====================

//MAIN MENU
function mainMenu() {
  clearOutput();
  controls.innerHTML = "";
  miniMap.innerHTML = "";
  log("🏰 Welcome to Epic RPG Adventure!\n\nThis is a classic text-based RPG where you can choose your class, embark on quests, fight monsters, and explore various locations.\n\nGood luck, adventurer!");
  addAction("Start New Game", startNewGame);
  addAction("Load Game", showLoadMenu);
}


//GAME START/LOAD
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


//LOADING SCREEN
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

// =====================
// GAME START
// =====================

mainMenu();