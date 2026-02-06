// =====================
// MENU & UI SYSTEMS
// =====================

// MENU SYSTEM
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