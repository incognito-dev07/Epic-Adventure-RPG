//COMBAT SYSTEM
function getScaledEnemy(baseEnemy, playerLevel) {
  const scaledEnemy = JSON.parse(JSON.stringify(baseEnemy));
  const baseScale = 1 + (playerLevel * 0.15);
  const questBonus = 1 + ((player.quests ? Object.values(player.quests).filter(q => q && q.status === 'COMPLETED').length : 0) * 0.08);
  const gearBonus = 1 + (Math.log(Math.max(1, ((player.Attack || 0) + (player.MaxHealth || 0)) / 30)) * 0.12);
  const totalScale = baseScale * questBonus * gearBonus;
  scaledEnemy.health = Math.max(1, Math.floor(baseEnemy.health * totalScale));
  scaledEnemy.MaxHealth = scaledEnemy.health;
  scaledEnemy.Attack = Math.max(1, Math.floor(baseEnemy.Attack * totalScale * 1.08));
  scaledEnemy.gold = Math.floor(baseEnemy.gold * (1 + (totalScale - 1) * 0.15));
  scaledEnemy.exp = Math.floor(baseEnemy.exp * (1 + (totalScale - 1) * 0.2));
  return scaledEnemy;
}

function fightEnemy(enemy, mode = "normal", alreadyScaled = false) {
  updateBestiary(enemy.name, "encounter");
  let scaledEnemy = enemy;
  if (!alreadyScaled) {
    scaledEnemy = getScaledEnemy(enemy, player.level, player.stats);
  }
  console.log(`SCALING DEBUG: ${alreadyScaled ? 'Already scaled' : 'Scaling now'}, Enemy HP: ${scaledEnemy.health}`);
  clearOutput();
  log(`⚔️ You encounter a ${scaledEnemy.name}!`, true);
  log(`📊 Enemy Stats: ${scaledEnemy.health} HP, ${scaledEnemy.Attack} ATK`, true);
  updateEnemyBar(scaledEnemy);
  updateStatBars();
  let tempEffects = {};
  for(const skillId in player.skillCooldowns) {
    player.skillCooldowns[skillId]--;
    if(player.skillCooldowns[skillId] <= 0) delete player.skillCooldowns[skillId];
  }
  playerTurn(scaledEnemy, tempEffects, mode);
}

function updateEnemyBar(enemy) {
  if (!enemy) {
    enemyHealthBar.style.display = "none";
    return;
  }
  const MaxHealth = enemy.MaxHealth || enemy.health;
  const currentHealth = Math.max(0, enemy.health);
  enemyHealthBar.style.display = "block";
  const percent = MaxHealth > 0 ? (currentHealth / MaxHealth) * 100 : 0;
  enemyHealthBarFill.style.width = Math.max(0, percent) + "%";
  enemyHealthText.textContent = `${currentHealth} / ${MaxHealth}`;
  if (enemy.health <= 0) {
    setTimeout(() => { enemyHealthBar.style.display = "none"; }, 300);
  }
}

function getEnemiesForLocation(location) {
  let enemies = enemyMap[location] || [];
  enemies = enemies.filter(e => !(e.boss && player.bossesDefeated.includes(e.name)));
  return enemies;
}

function playAttackAnimation(Attacker) {
  const anim = document.createElement('span');
  anim.className = Attacker === 'player' ? 'player-Attack-anim' : 'enemy-Attack-anim';
  anim.textContent = Attacker === 'player' ? '⚔️' : '💢';
  animationContainer.appendChild(anim);
  anim.addEventListener('animationend', () => anim.remove());
}

function playerTurn(enemy, tempEffects, mode) {
  updatePotionEffects();
  controls.innerHTML = "";
  if (enemy.health <= 0) return endFight(enemy, mode);
  applyEquipmentEffects(enemy, tempEffects);
  updateStatBars();
  const companionActionTaken = processCompanionTurn(enemy, tempEffects, mode);
  if (enemy.health <= 0) {
    return endFight(enemy, mode);
  }
  if (!companionActionTaken && Object.keys(player.companions || {}).length > 0) {
    const activeCompanion = Object.keys(player.companions).find(name => 
      player.companions[name].active === true
    );
    if (activeCompanion) {
      log(`${companions[activeCompanion].icon} ${activeCompanion} is waiting for an opportunity...`, true);
    }
  }
  addAction("Attack", () => {
    let baseDmg = player.Attack + player.bonusAttack;
    let dmg = Math.floor(baseDmg * (0.7 + Math.random() * 0.3));
    dmg = Math.max(10, dmg);
    if (player.equipped.weapon === "Dragon Slayer Sword" && enemy.name.includes("Dragon")) {
      dmg = Math.floor(dmg * 1.5);
      log("⚔️ The Dragon Slayer Sword flares with power!", true);
    }
    enemy.health -= dmg;
    log(`⚔️ You dealt ${dmg} damage to ${enemy.name}! (Your Attack: ${baseDmg})`, true);
    playAttackAnimation('player');
    updateEnemyBar(enemy);
    setTimeout(() => {
      if (enemy.health <= 0) {
        endFight(enemy, mode);
      } else {
        enemyAttack(enemy, tempEffects, mode);
      }
    }, 300);
  });
  function processCompanionTurn(enemy, tempEffects, mode) {
    if (!player.companions) return false; 
    const activeCompanionName = Object.keys(player.companions).find(name => 
      player.companions[name] && player.companions[name].active === true
    );
    if (!activeCompanionName) return false;
    const companionData = companions[activeCompanionName];
    const companionState = player.companions[activeCompanionName];
    if (!companionData || !companionData.skills) return false;
    if (companionState.cooldowns) {
      Object.keys(companionState.cooldowns).forEach(skillName => {
        if (companionState.cooldowns[skillName] > 0) {
          companionState.cooldowns[skillName]--;
          if (companionState.cooldowns[skillName] <= 0) {
            delete companionState.cooldowns[skillName];
          }
        }
      });
    }
    const availableSkills = companionData.skills.filter(skill => {
      const isUnlocked = companionState.skillsUnlocked && companionState.skillsUnlocked.includes(skill.name);
      const isOffCooldown = !companionState.cooldowns || !companionState.cooldowns[skill.name] || companionState.cooldowns[skill.name] <= 0;
      return isUnlocked && isOffCooldown;
    });
    if (availableSkills.length === 0) return false;
    const chosenSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    if (!companionState.cooldowns) companionState.cooldowns = {};
    companionState.cooldowns[chosenSkill.name] = chosenSkill.cooldown || 3;
    applyCompanionSkill(activeCompanionName, chosenSkill, enemy, tempEffects);
  return true; 
  }
  function applyCompanionSkill(companionName, skill, enemy, tempEffects) {
    const companionData = companions[companionName];
    const companionState = player.companions[companionName];
    log(`\n${companionData.icon} ${companionName} uses ${skill.name}!`, true);
    if (skill.damage) {
      const baseDamage = skill.damage || 0;
      const levelBonus = companionState.level * 2;
      const damage = baseDamage + levelBonus;
      enemy.health -= damage;
      log(`${companionData.icon} deals ${damage} damage to ${enemy.name}!`, true);
      updateEnemyBar(enemy);
    }
    if (skill.heal) {
      const baseHeal = skill.heal || 0;
      const levelBonus = companionState.level * 3;
      const healAmount = baseHeal + levelBonus;
      const oldHealth = player.health;
      player.health = Math.min(player.MaxHealth + player.bonusMaxHealth, player.health + healAmount);
      const actualHeal = player.health - oldHealth;
      if (actualHeal > 0) {
        log(`${companionData.icon} heals you for ${actualHeal} HP!`, true);
        updateStatBars();
      }
    }
    if (skill.effect === "buff") {
      if (skill.stat === "Attack") {
        tempEffects.companionAttackBuff = { 
          multiplier: skill.value || 1.2, 
          duration: skill.duration || 2,
          source: companionName 
        };
        log(`📈 ${companionName} increases your Attack by ${((skill.value - 1) * 100).toFixed(0)}%!`, true);
      }
    }
    if (skill.effect === "restore" && skill.amount) {
      const baseMana = skill.amount || 0;
      const levelBonus = companionState.level * 2;
      const manaAmount = baseMana + levelBonus;
      const oldMana = player.Mana;
      player.Mana = Math.min(player.maxMana + player.bonusMana, player.Mana + manaAmount);
      const actualMana = player.Mana - oldMana;
      if (actualMana > 0) {
        log(`${companionData.icon} restores ${actualMana} MP!`, true);
        updateStatBars();
      }
    }
    if (skill.effect === "gold" && skill.multiplier) {
      tempEffects.companionGoldBuff = {
        multiplier: skill.multiplier,
        source: companionName
      };
      log(`💰 ${companionName} enhances gold finding for this battle!`, true);
    }
    saveGame();
  }
  function updateCompanionCooldowns() {
    if (!player.companions) return;
    Object.keys(player.companions).forEach(companionName => {
      const companionState = player.companions[companionName];
      if (companionState.cooldowns) {
        Object.keys(companionState.cooldowns).forEach(skillName => {
          if (companionState.cooldowns[skillName] > 0) {
            companionState.cooldowns[skillName]--;
          }
        });
      }
    });
  }
  function applyCompanionPassives() {
    if (!player.companions) return;
    const activeCompanionName = Object.keys(player.companions).find(name => 
      player.companions[name].active);
    if (!activeCompanionName) return;
    const companionData = companions[activeCompanionName];
    switch (activeCompanionName) {
      case "Treasure Goblin Companion":
        player.goldFind += 0.2;
        break;
      case "Mystic Owl Companion":
        break;
      case "Healing Sprite Companion":
        break;
    }
  }
  if (player.skills.length > 0) {
    addAction("Use Skills", () => {
      clearOutput();
      controls.innerHTML = "";
      log("Choose a skill to use:", true);
      player.skills.forEach(skill => {
        const onCooldown = player.skillCooldowns[skill.name];
        const canUse = !onCooldown && player.Mana >= skill.ManaCost;
        const buttonText = canUse 
          ? `${skill.name} (${skill.ManaCost} MP)` 
          : `${skill.name} 🔒`;
        addAction(buttonText, () => {
          if (!canUse) {
            if (onCooldown) log(`❌ ${skill.name} is on cooldown!`, true);
            else log(`❌ Not enough Mana to use ${skill.name}!`, true);
            setTimeout(() => playerTurn(enemy, tempEffects, mode), 300);
            return;
          }
          player.Mana -= skill.ManaCost;
          player.skillCooldowns[skill.name] = skill.cooldown;
          let dmg = 0, usedSkill = false;
          if (skill.type === "Attack") {
            let baseDmg = player.Attack + player.bonusAttack;
            dmg = Math.floor(baseDmg * (0.6 + Math.random() * 0.3));
            if (skill.name === "Power Strike") dmg = Math.floor(dmg * 1.5);
            if (skill.name === "Fireball") { 
              dmg = Math.floor(dmg * 1.2); 
              tempEffects.burn = { duration: 3, damage: 5 }; 
              log(`🔥 ${enemy.name} is now burning!`, true);
            }
            if (skill.name === "Sneak Attack" && Math.random() < (skill.chance || 0.25)) { 
              dmg = Math.floor(dmg * 2.5); 
              log("💥 Critical hit!", true); 
            }
            if (skill.name === "Arcane Burst") { 
              dmg = Math.floor(dmg * 2.5); 
              tempEffects.stun = { duration: 1 };
            }
            enemy.health -= dmg;
            log(`🌀 Used ${skill.name}, dealing ${dmg} damage!`, true);
            usedSkill = true;
          }
          else if (skill.type === "defense") {
            if (skill.name === "Shield Block") {
              tempEffects.defense = { duration: 1, multiplier: 0.5 };
              log("🛡️ You raise your shield, ready to block the next Attack!", true);
            }
            if (skill.name === "Mana Shield") {
              tempEffects.defense = { duration: 1, multiplier: 0.3 };
              log("🔵 A magical shield envelops you!", true);
            }
            if (skill.name === "Dodge Roll") {
              if (Math.random() < (skill.chance || 0.7)) { 
                tempEffects.evade = { duration: 1 }; 
                log(`🌪️ You prepared to evade!`, true); 
              } else {
                log(`💨 You failed to prepare your dodge.`, true);
              }
            }
            usedSkill = true;
          }
          else if (skill.type === "counter") {
            if (skill.name === "Shield Bash") { 
              tempEffects.counterAttack = { duration: 1, damage: (player.Attack + player.bonusAttack) * 0.5 }; 
              log("🛡️ You prepare a counter-Attack!", true); 
            }
            usedSkill = true;
          }
          else if (skill.type === "utility") {
            if (skill.name === "Teleport" || skill.name === "Smoke Bomb") {
              log("💨 You escaped from combat!", true); 
              if(mode === "exploration") {
                log("❌ You lost all loot from this exploration due to running away!", true);
                player.explorationData = null;
                player.minigameCooldowns.exploration = Date.now() + 10000;
                saveGame();
              }
              showLocation();
              return;
            }
          }
          else if (skill.type === "heal") {
            if (skill.name === "Inspiring Song") {
              const healAmount = 25 + Math.floor(player.level * 2);
              player.health = Math.min(player.MaxHealth + player.bonusMaxHealth, player.health + healAmount);
              log(`🎶 Your Inspiring Song heals you for ${healAmount} HP!`, true);
            }
            usedSkill = true;
          }
          else if (skill.type === "buff") {
            if (skill.name === "Battle Cry") {
              tempEffects.AttackBuff = { duration: 2, amount: Math.floor((player.Attack + player.bonusAttack) * 0.5) };
              log("📢 You let out a powerful battle cry! Attack increased!", true);
            }
            if (skill.name === "Hero's Anthem") {
              tempEffects.AttackBuff = { duration: 3, amount: Math.floor((player.Attack + player.bonusAttack) * 0.2) };
              log("🎵 You sing a heroic anthem! Attack increased!", true);
            }
            usedSkill = true;
          }
          else if (skill.type === "debuff") {
            if (skill.name === "Siren's Call") {
              tempEffects.enemyMiss = { duration: 1 };
              log("🎵 The enemy is mesmerized by your song and will likely miss their next Attack!", true);
            }
            usedSkill = true;
          }
          if (usedSkill) {
            playAttackAnimation('player');
            updateStats();
            updateEnemyBar(enemy);
            setTimeout(() => {
              if (enemy.health <= 0) {
                endFight(enemy, mode);
              } else {
                enemyAttack(enemy, tempEffects, mode);
              }
            }, 300);
          }
        });
      });
      addAction("⬅️ Back", () => {
        clearOutput();
        log(`⚔️ You encounter a ${enemy.name}!`, true);
        updateEnemyBar(enemy);
        playerTurn(enemy, tempEffects, mode);
      });
    });
  }
  addAction("Use Potion", () => {
    clearOutput();
    controls.innerHTML = "";
    log("Choose a potion to use:", true);
    let hasPotions = false;
    for (const item in player.inventory) {
      const def = shopItems[item];
      if (!def) continue;
      if (def.type === "consumable" && (player.inventory[item] > 0 || def.infinite)) {
        hasPotions = true;
        const displayQty = def.infinite ? '∞' : `x${player.inventory[item]}`;
        addAction(`${item} ${displayQty}`, () => {
          if (def.heal) {
            const healAmount = def.heal;
            const oldHealth = player.health;
            player.health = Math.min(player.MaxHealth + player.bonusMaxHealth, player.health + healAmount);
            const actualHeal = player.health - oldHealth;
            log(`💖 You used ${item} and healed ${actualHeal} HP!`, true);
          }
          if (def.Mana) {
            const ManaAmount = def.Mana;
            const oldMana = player.Mana;
            player.Mana = Math.min(player.maxMana + player.bonusMana, player.Mana + ManaAmount);
            const actualMana = player.Mana - oldMana;
            log(`🔮 You used ${item} and restored ${actualMana} Mana!`, true);
          }
          if (def.effect) {
            applyPotionEffect(item);
          }
          if (def.revive) {
            log(`🔥 ${item} can only be used when dead!`, true);
            setTimeout(() => playerTurn(enemy, tempEffects, mode), 300);
            return;
          }
          if (!def.infinite) {
            player.inventory[item]--;
            if (player.inventory[item] <= 0) delete player.inventory[item];
          }
          saveGame();
          updateStats();
          setTimeout(() => enemyAttack(enemy, tempEffects, mode), 200);
        });
      }
    }
    if (!hasPotions) {
      log("❌ You have no potions in your inventory!", true);
    }
    setTimeout(() => {
      processCompanionTurn(enemy, tempEffects, mode);
      setTimeout(() => {
        if (enemy.health <= 0) {
          endFight(enemy, mode);
        } else {
          enemyAttack(enemy, tempEffects, mode);
        }
      }, 500);
    }, 100);
    addAction("⬅️ Back", () => {
      clearOutput();
      log(`⚔️ You encounter a ${enemy.name}!`, true);
      updateEnemyBar(enemy);
      playerTurn(enemy, tempEffects, mode);
    });
  });
  if (mode === "normal") {
    addAction("Run", () => {
      if (Math.random() < 0.4) {
        log("You successfully fled from the fight!", true);
        enemyHealthBar.style.display = "none";
        showLocation();
      } 
      else {
        log("❌ You failed to escape!", true);
        setTimeout(() => enemyAttack(enemy, tempEffects, mode), 300);
      }
    });
  } 
  else {
    const escapeSkill = player.skills.find(s => s.type === "utility" && (s.name === "Teleport" || s.name === "Smoke Bomb"));
    if (escapeSkill) {
      const onCooldown = player.skillCooldowns[escapeSkill.name];
      const canUseEscape = !onCooldown && player.Mana >= escapeSkill.ManaCost;
      const buttonText = canUseEscape ? `Use ${escapeSkill.name}` : `${escapeSkill.name} (CD: ${player.skillCooldowns[escapeSkill.name] || escapeSkill.cooldown} turns)`;
      addAction(buttonText, () => {
        if (canUseEscape) {
          player.Mana -= escapeSkill.ManaCost;
          player.skillCooldowns[escapeSkill.name] = escapeSkill.cooldown;
          log("💨 You escaped from combat!", true); 
          if (mode === "exploration") {
            log("❌ You lost all loot from this exploration due to running away!", true);
            player.explorationData = null;
            player.minigameCooldowns.exploration = Date.now() + 10000;
          }
          enemyHealthBar.style.display = "none";
          saveGame();
          showLocation();
        } 
        else {
          log(`❌ ${escapeSkill.name} is on cooldown or you don't have enough Mana!`, true);
          setTimeout(() => playerTurn(enemy, tempEffects, mode), 300);
        }
      });
    }
  }
}

function applyEquipmentEffects(enemy, tempEffects) {
  if (!player.equipped) return;
  if (player.equipped.weapon) {
    const weapon = shopItems[player.equipped.weapon];
    if (weapon && weapon.special) {
      switch (weapon.special) {
        case "Lifesteal":
          break;
        case "DragonSlayer":
          if (enemy.name.includes("Dragon")) {
            tempEffects.dragonSlayer = { multiplier: weapon.value || 1.5 };
          }
          break;
      }
    }
  }
  if (player.equipped.armor) {
    const armor = shopItems[player.equipped.armor];
    if (armor && armor.special) {
      switch (armor.special) {
        case "ManaShield":
          tempEffects.ManaShield = { value: armor.value || 0.15 };
          break;
        case "NatureRegen":
          if (player.location.includes("Forest")) {
            player.health = Math.min(player.MaxHealth + player.bonusMaxHealth, player.health + (armor.value || 5));
            log(`🌿 Your armor regenerates ${armor.value || 5} HP in the forest!`, true);
          }
          break;
      }
    }
  }
  if (player.equipped.accessory) {
    const accessory = shopItems[player.equipped.accessory];
    if (accessory && accessory.special) {
      switch (accessory.special) {
        case "Dodge":
          if (Math.random() < (accessory.value || 0.08)) {
            tempEffects.evade = { duration: 1 };
            log(`🍃 Your accessory helps you evade the next Attack!`, true);
          }
          break;
        case "FireAura":
          if (Math.random() < 0.3) {
            tempEffects.fireAura = { damage: 10, duration: 3 };
            log(`🔥 Your accessory creates a fiery aura!`, true);
          }
          break;
      }
    }
  }
  if (player.equipped.accessory === "Crystal Crown") {
    if (Math.random() < 0.1) {
      tempEffects.crystalReflect = {
        duration: 1, multiplier: 0.3 };
      log(`👑 Your Crystal Crown glows, ready to reflect damage!`, true);
    }
  }
  if (player.equipped.weapon === "Void Blade") {
    if (Math.random() < 0.15) {
      tempEffects.voidStrike = { multiplier: 1.5 };
      log(`⚫ The Void Blade pulses with dark energy!`, true);
    }
  }
  if (player.equipped.armor === "Cosmic Armor") {
    if (Math.random() < 0.2) {
      tempEffects.cosmicBarrier = { damageReduction: 0.5, duration: 1 };
      log(`🌌 Cosmic energy forms a protective barrier around you!`, true);
    }
  }
  if (player.equipped.weapon === "Primordial Staff") {
    tempEffects.primordialPower = { multiplier: 1.25 };
  }
}

function calculatePlayerDamage(enemy) {
  const playerAttack = Math.max(10, player.Attack || 10);
  const playerBonusAttack = Math.max(0, player.bonusAttack || 0);
  let baseDmg = playerAttack + playerBonusAttack;
  let dmg = Math.floor(baseDmg * (0.6 + Math.random() * 0.3));
  dmg = Math.max(10, dmg);
  if (player.equipped && player.equipped.weapon) {
    const weapon = shopItems[player.equipped.weapon];
    if (weapon) {
      if (weapon.special === "DragonSlayer" && enemy && enemy.name && enemy.name.includes("Dragon")) {
        dmg = Math.floor(dmg * (weapon.value || 1.5));
      }
      if (weapon.bonus && weapon.bonus.Attack) {
        dmg += weapon.bonus.Attack;
      }
    }
  }
  if (activePotionEffects.Attack.active) {
    dmg = Math.floor(dmg * activePotionEffects.Attack.multiplier);
  }
  return Math.max(8, dmg);
}

function useItem(itemName, enemy, tempEffects, mode) {
  const details = shopItems[itemName];
  if (!details.infinite) {
    player.inventory[itemName]--;
    if (player.inventory[itemName] <= 0) delete player.inventory[itemName];
  }
  if (details.heal) {
    player.health = Math.min(player.MaxHealth + player.bonusMaxHealth, player.health + details.heal);
    log(`🧪 Used ${itemName} and restored ${details.heal} HP!`, true);
  }
  if (details.Mana) {
    player.Mana = Math.min(player.maxMana + player.bonusMana, player.Mana + details.Mana);
    log(`🔮 Used ${itemName} and restored ${details.Mana} Mana!`, true);
  }
  if (details.effect) {
    applyPotionEffect(itemName);
  }
  saveGame();
  updateStats();
  if (enemy) {
    enemyAttack(enemy, tempEffects, mode);
  } else {
    (showLocation)();
  }
  updateStatBars();
}

function applyPotionEffect(potionName) {
  const effects = {
    "Strength Elixir": { stat: "Attack", multiplier: 1.15, duration: 5 },
    "Fortitude Potion": { stat: "MaxHealth", multiplier: 1.2, duration: 5 },
    "Wisdom Draught": { stat: "maxMana", multiplier: 1.25, duration: 5 }
  };
  const effect = effects[potionName];
  if (effect) {
    activePotionEffects[effect.stat] = {
      active: true,
      multiplier: effect.multiplier,
      duration: effect.duration
    };
    log(`✨ ${potionName} effect applied! ${effect.stat.toUpperCase()} boosted by ${((effect.multiplier - 1) * 100).toFixed(0)}% for ${effect.duration} turns.`, true);
    calculateStats();
    updateStats();
  }
}

function updatePotionEffects() {
  for (const stat in activePotionEffects) {
    if (activePotionEffects[stat].active) {
      activePotionEffects[stat].duration--;
      if (activePotionEffects[stat].duration <= 0) {
        activePotionEffects[stat].active = false;
        activePotionEffects[stat].multiplier = 1;
        log(`⏰ ${stat.toUpperCase()} potion effect has worn off.`, true);
      }
    }
  }
}

function enemyAttack(enemy, tempEffects, mode) {
  if (enemy.health <= 0) return endFight(enemy, mode);
  if (tempEffects.burn) {
    const burnDmg = tempEffects.burn.damage || 5;
    enemy.health -= burnDmg;
    log(`🔥 ${enemy.name} burns for ${burnDmg} damage!`, true);
    tempEffects.burn.duration--;
    if(tempEffects.burn.duration <= 0) delete tempEffects.burn;
    updateEnemyBar(enemy);
  }
  if (tempEffects.enemyMiss) {
    if (Math.random() < 0.8) {
      log("🎵 The enemy is too mesmerized to Attack properly!", true);
      delete tempEffects.enemyMiss;
      setTimeout(() => playerTurn(enemy, tempEffects, mode), 300);
      return;
    }
    delete tempEffects.enemyMiss;
  }
  if (tempEffects.AttackBuff) {
    tempEffects.AttackBuff.duration--;
    if(tempEffects.AttackBuff.duration <= 0) {
      log("📢 Your battle cry wears off.", true);
      delete tempEffects.AttackBuff;
    }
  }
  if (tempEffects.stun) {
    log("💫 You are stunned and cannot act next turn!", true);
    delete tempEffects.stun;
    setTimeout(() => {
      const edmg = Math.floor(Math.random() * enemy.Attack) + 1;
      player.health -= edmg;
      log(`The ${enemy.name} hits you for ${edmg} damage while you're stunned.`, true);
      playAttackAnimation('enemy');
      updateStats();
      setTimeout(() => playerTurn(enemy, tempEffects, mode), 200);
    }, 300);
    return;
  }
  setTimeout(() => {
    if (tempEffects.evade) {
      if (Math.random() < 0.7) { 
        log("🌪️ You dodged the enemy's Attack!", true);
      } 
      else {
        log("💨 You tried to dodge but failed!", true);
        tempEffects.evade = null;
      }
      delete tempEffects.evade;
      setTimeout(() => playerTurn(enemy, tempEffects, mode), 300);
      return;
    }
    const edmg = Math.floor(Math.random() * enemy.Attack) + 1;
    let finalDmg = edmg;
    if (tempEffects.defense) {
      finalDmg = Math.floor(finalDmg * tempEffects.defense.multiplier);
      log(`🛡️ Your defense reduces the damage to ${finalDmg}!`, true);
      delete tempEffects.defense;
    }
    if (tempEffects.ManaShield && player.Mana > 0) {
      const ManaDamage = Math.floor(finalDmg * tempEffects.ManaShield.value);
      const healthDamage = finalDmg - ManaDamage;
      player.Mana = Math.max(0, player.Mana - ManaDamage);
      player.health -= healthDamage;
      log(`🔵 Your Mana shield absorbed ${ManaDamage} damage!`, true);
    } 
    else {
      player.health -= finalDmg;
    }
    log(`The ${enemy.name} hits you for ${finalDmg} damage.`, true);
    playAttackAnimation('enemy');
    updateStats();
    if (tempEffects.fireAura) {
      const fireDmg = tempEffects.fireAura.damage || 5;
      enemy.health -= fireDmg;
      log(`🔥 Your fire aura burns the enemy for ${fireDmg} damage!`, true);
      tempEffects.fireAura.duration--;
      if (tempEffects.fireAura.duration <= 0) {
        delete tempEffects.fireAura;
      }
      updateEnemyBar(enemy);
    }
    if (tempEffects.counterAttack) {
      const counterDmg = tempEffects.counterAttack.damage;
      enemy.health -= counterDmg;
      log(`💥 Your Shield Bash countered the Attack, dealing ${counterDmg} damage!`, true);
      delete tempEffects.counterAttack;
      updateEnemyBar(enemy);
    }
    if (player.equipped && player.equipped.weapon) {
      const weapon = shopItems[player.equipped.weapon];
      if (weapon && weapon.special === "Lifesteal") {
        const healAmount = Math.floor(finalDmg * (weapon.value || 0.1));
        player.health = Math.min(player.MaxHealth + player.bonusMaxHealth, player.health + healAmount);
        log(`🩸 Your weapon drains ${healAmount} health from the enemy!`, true);
        updateStats();
      }
    }
    if (player.health <= 0) {
      const hasFeather = player.inventory["Phoenix"] > 0;
      const hasReviveSkill = player.skills.find(s => s.revive);
      if (hasFeather || hasReviveSkill) {
        setTimeout(() => showReviveMenu(enemy, tempEffects, mode, hasFeather, hasReviveSkill), 300);
      } 
      else {
        setTimeout(() => playerDied(mode), 500);
      }
    } 
    else {
      setTimeout(() => playerTurn(enemy, tempEffects, mode), 300);
    }
  }, 400);
}

function showReviveMenu(enemy, tempEffects, mode, hasFeather, hasReviveSkill) {
  clearOutput();
  controls.innerHTML = "";
  log("💀 You have been defeated!", true);
  log("Do you wish to use a revive item or skill?", true);
  if (hasFeather) {
    addAction("Use Phoenix", () => {
      player.health = player.MaxHealth + player.bonusMaxHealth;
      player.inventory["Phoenix"]--;
      if (player.inventory["Phoenix"] <= 0) delete player.inventory["Phoenix"];
      log("🔥 Your Phoenix bursts into flames, reviving you!", true);
      updateStats();
      saveGame();
      playerTurn(enemy, tempEffects, mode);
    });
  }
  if (hasReviveSkill) {
    const reviveSkill = player.skills.find(s => s.revive && !player.skillCooldowns[s.name]);
    addAction(`Use ${reviveSkill.name}`, () => {
      if(player.Mana >= reviveSkill.ManaCost) {
        player.health = Math.floor((player.MaxHealth + player.bonusMaxHealth) * 0.5);
        player.Mana -= reviveSkill.ManaCost;
        player.skillCooldowns[reviveSkill.name] = reviveSkill.cooldown;
        log(`🎶 You use your ${reviveSkill.name} and revive with 50% HP!`, true);
        updateStats();
        saveGame();
        playerTurn(enemy, tempEffects, mode);
      } 
      else {
        log("❌ Not enough Mana to use that skill!", true);
        showReviveMenu(enemy, tempEffects, mode, hasFeather, hasReviveSkill);
      }
    });
  }
  addAction("Decline (Respawn at Home)", () => playerDied(mode));
}

function playerDied(mode) {
  if (mode === "infiniteDungeon") {
    endInfiniteDungeonSession(false);
    return;
  }
  log("💀 You have been defeated!", true);
  log("The world fades to black...", true);
  playBackgroundMusic();
  if (mode === "exploration") {
    if (player.explorationData) {
      const savedGold = Math.floor(player.explorationData.gold / 2);
      const savedExp = Math.floor(player.explorationData.exp / 2);
      if (savedGold > 0) {
        player.gold += savedGold;
        log(`💰 You Managed to save ${savedGold} gold from the exploration.`, true);
      }
      if (savedExp > 0) {
        gainExp(savedExp);
        log(`✨ You gained ${savedExp} experience from the exploration.`, true);
      }
      let savedItems = 0;
      for (const item in player.explorationData.loot) {
        const savedQty = Math.floor(player.explorationData.loot[item] / 2);
        if (savedQty > 0) {
        addItemToInventory(item, savedQty, { silent: true });
        savedItems += savedQty;
        }
      }
      if (savedItems > 0) {
        log(`🎁 You salvaged ${savedItems} items from the exploration.`, true);
      }
      log("❌ You died during exploration and lost half of your loot!", true);
      player.explorationData = null;
    }
    enemyHealthBar.style.display = "none";
    if (!player.minigameCooldowns) player.minigameCooldowns = {};
    player.minigameCooldowns.exploration = Date.now() + 10000;
  }
  activePotionEffects = {
    Attack: { active: false, multiplier: 1, duration: 0 },
    health: { active: false, multiplier: 1, duration: 0 },
    Mana: { active: false, multiplier: 1, duration: 0 }
  };
  player.health = Math.floor((player.MaxHealth + player.bonusMaxHealth) / 2);
  player.Mana = Math.floor((player.maxMana + player.bonusMana) / 2);
  player.location = "Player Home";
  saveGame();
  setTimeout(() => {
    log("You wake up in your bed at home, feeling weak but relieved you saved some loot...", true);
    showLocation();
  }, 3000);
}

function endFight(enemy, mode) {
  if (mode === "infiniteDungeon") {
    handleInfiniteDungeonVictory(enemy);
    return;
  }
  log(`🏆 You defeated the ${enemy.name}!`, true);
  if (!player.stats) initializePlayerStats();
  player.stats.enemiesDefeated = (player.stats.enemiesDefeated || 0) + 1;
  updateCompanionExp(enemy.exp);
  checkAchievements();
  if (typeof QuestManager !== "undefined" && QuestManager.updateQuestProgress) {
    QuestManager.updateQuestProgress("KILL", enemy.name);
  }
  if (mode === "exploration") {
    if (enemy.boss && enemy.item) {
      const bossDropChance = 0.7;
      if (Math.random() < bossDropChance) {
        player.explorationData.loot[enemy.item] = (player.explorationData.loot[enemy.item] || 0) + 1;
        log(`🎉 You obtained the ${enemy.item} from the boss!`, true);
      } else {
        log(`💔 The ${enemy.name} didn't drop its special item.`, true);
      }
    }
    if (enemy.drops && enemy.drops.length > 0) {
      enemy.drops.forEach(dropInfo => {
        let itemName, dropChance;
        if (typeof dropInfo === 'string') {
          itemName = dropInfo;
          dropChance = enemy.boss ? 0.5 : 0.3; 
        } 
        else {
          itemName = dropInfo.item;
          dropChance = enemy.boss ? (dropInfo.chance || 0.5) : (dropInfo.chance || 0.3);
        }
        if (Math.random() < dropChance) {
          if (mode === "exploration") {
            player.explorationData.loot[itemName] = (player.explorationData.loot[itemName] || 0) + 1;
          } 
          else {
            addItemToInventory(itemName, 1, { silent: true });
            if (!dropsObtained) dropsObtained = [];
            dropsObtained.push(itemName);
          }
          log(`🎁 Found ${itemName} from the defeated ${enemy.boss ? 'boss' : 'enemy'}!`, true);
          if (typeof QuestManager !== "undefined" && QuestManager.updateQuestProgress) {
            QuestManager.updateQuestProgress("COLLECT", itemName);
          }
        }
      });
    }
    let finalGold = enemy.gold;
    addGold(finalGold, "Looted");
    player.explorationData.gold += finalGold;
    player.explorationData.exp += enemy.exp;
    log(`✨ Gained ${enemy.exp} EXP.`, true);
    updateBestiary(enemy.name, "defeat");
    player.explorationData.wave++;
    if (player.explorationData.wave <= 5) {
      addAction("Next Wave", () => proceedExploration());
    } else {
      showExplorationResults();
      enemyHealthBar.style.display = "none";
    }
  } else {
    clearOutput();
    log(`🎉 BATTLE VICTORY!`, true);
    log(`🏆 Defeated: ${enemy.name}`, true);
    updateBestiary(enemy.name, "defeat");
    let finalGold = enemy.gold;
    if (player.goldFind) finalGold = Math.floor(finalGold * (1 + player.goldFind));
    const dropsObtained = [];
    if (enemy.boss && enemy.item) {
      const bossDropChance = 0.7;
      if (Math.random() < bossDropChance) {
        addItemToInventory(enemy.item, 1, { silent: true });
        dropsObtained.push(enemy.item);
        log(`🎉 You obtained the ${enemy.item} from the boss!`, true);
      } else {
        log(`💔 The ${enemy.name} didn't drop its special item.`, true);
      }
    }
    if (enemy.drops && enemy.drops.length > 0) {
     enemy.drops.forEach(dropInfo => {
      let itemName, dropChance;
      if (typeof dropInfo === 'string') {
       itemName = dropInfo;
       dropChance = enemy.boss ? 0.5 : 0.3; 
      } 
      else {
       itemName = dropInfo.item;
       dropChance = enemy.boss ? (dropInfo.chance || 0.5) : (dropInfo.chance || 0.3);
      }
      if (!itemName) {
       console.warn("Undefined item name in enemy drops:", dropInfo);
       return; 
      }
      if (Math.random() < dropChance) {
       if (mode === "exploration") {
        player.explorationData.loot[itemName] = (player.explorationData.loot[itemName] || 0) + 1;
       } 
       else {
        addItemToInventory(itemName, 1, { silent: true });
        if (!dropsObtained) dropsObtained = [];
        dropsObtained.push(itemName);
       }
       log(`🎁 Found ${itemName} from the defeated ${enemy.boss ? 'boss' : 'enemy'}!`, true);
       if (typeof QuestManager !== "undefined" && QuestManager.updateQuestProgress) {
        QuestManager.updateQuestProgress("COLLECT", itemName);
       }
      }
     });
    }
    if (dropsObtained.length > 0) {
      log(`🎁 Items obtained: ${dropsObtained.join(', ')}`, true);
    } else {
      log(`💔 No items dropped from the ${enemy.boss ? 'boss' : 'enemy'}.`, true);
    }
    if (enemy.boss) {
      if (!player.bossesDefeated) player.bossesDefeated = [];
      if (!player.bossesDefeated.includes(enemy.name)) {
        player.bossesDefeated.push(enemy.name);
        log(`⭐ New boss defeated: ${enemy.name}!`, true);
      }
    }
    player.gold += finalGold;
    gainExp(enemy.exp);
    addAction("Continue", () => {
      enemyHealthBar.style.display = "none";
      showLocation();
    });
  }
}

function showExplorationResults() {
  clearOutput();
  log(`--- Exploration Complete! ---`, true);
  log(`🎉 You successfully cleared 5 waves in the ${player.location}!`, true);
  if (!player.stats) initializePlayerStats();
  player.stats.explorationsCompleted = (player.stats.explorationsCompleted || 0) + 1;
  const finalGold = Math.floor(player.explorationData.gold * 0.7);
  const finalExp = Math.floor(player.explorationData.exp * 0.7);
  log(`\n📊 Exploration Results:`, true);
  log(`✨ Total EXP gained: ${finalExp}`, true);
  log(`💰 Total Gold found: ${finalGold}`, true);
  let totalItems = 0;
  for (const item in player.explorationData.loot) {
    totalItems += player.explorationData.loot[item];
  }
  log(`🎁 Total items collected: ${totalItems}`, true);
  if (totalItems > 0) {
    log(`Items found:`, true);
    for (const item in player.explorationData.loot) {
      if (player.explorationData.loot[item] > 0) {
        log(`• ${item} x${player.explorationData.loot[item]}`, true);
      }
    }
  }
  addGold(finalGold, "Exploration");
  gainExp(finalExp);
  for (const item in player.explorationData.loot) {
    if (player.explorationData.loot[item] > 0) {
      addItemToInventory(item, player.explorationData.loot[item], { silent: true });
    }
  }
  if (!player.minigameCooldowns) player.minigameCooldowns = {};
  player.minigameCooldowns.exploration = Date.now() + 10000;
  player.explorationData.bossEncountered = false;
  addAction("Continue", () => {
    playBackgroundMusic();
    player.explorationData = null;
    saveGame();
    showLocation();
  });
}


//EXPLORATION SYSTEM
function startExploration() {
  clearOutput();
  controls.innerHTML = "";
  log(`⚔️ You venture into the ${player.location} for an exploration! You will face 5 enemies.`, true);
  player.explorationData = { wave: 1, loot: {}, gold: 0, exp: 0, trapSet: false, bossEncountered: false, };
  if (player.inventory["Trap Kit"] && player.inventory["Trap Kit"] > 0) {
    addAction("Set Trap 🪤", () => {
      player.inventory["Trap Kit"]--;
      if (player.inventory["Trap Kit"] <= 0) delete player.inventory["Trap Kit"];
      player.explorationData.trapSet = true;
      saveGame();
      proceedExploration();
    });
  }
  addAction("Explore Without Trap", () => {
    player.explorationData.trapSet = false;
    proceedExploration();
  });
  addAction("⬅️ Back", showLocation)
}

function proceedExploration() {
  playBattleMusic();
  if (player.explorationData.wave > 5) {
    endExploration();
    return;
  }
  log(`--- Wave ${player.explorationData.wave} of 5 ---`, true);
  let enemies = getEnemiesForLocation(player.location);
  if (player.explorationData.wave < 5) {
    enemies = enemies.filter(enemy => !enemy.boss);
  }
  if (player.explorationData.wave === 5 && !player.explorationData.bossEncountered) {
    const bossEnemies = enemies.filter(enemy => enemy.boss);
    if (bossEnemies.length > 0 && Math.random() < 0.3) {
      const boss = {...bossEnemies[Math.floor(Math.random() * bossEnemies.length)]};
      log(`💀 A powerful ${boss.name} appears for the final challenge!`, true);
      player.explorationData.bossEncountered = true;
      fightEnemy(boss, "exploration");
      return;
    }
  }
  if (enemies.length > 0) {
    const nextEnemy = { ...enemies[Math.floor(Math.random() * enemies.length)] };
    const originalMaxHealth = nextEnemy.health;
    if (player.explorationData.trapSet && player.explorationData.wave === 1) {
      if (Math.random() < 0.8) {
        const scaledEnemy = getScaledEnemy(nextEnemy, player.level, player.stats);
        const originalScaledHealth = scaledEnemy.health;
        const originalScaledAttack = scaledEnemy.Attack;
        const trapDmg = Math.floor(Math.random() * 30 + 10);
        scaledEnemy.health -= trapDmg;
        scaledEnemy.Attack = Math.floor(scaledEnemy.Attack * 0.8);
        log(`✅ An enemy fell into your trap and took ${trapDmg} damage! (Health: ${originalScaledHealth} → ${scaledEnemy.health}, Attack: ${originalScaledAttack} → ${scaledEnemy.Attack})`, true);
        enemyHealthBar.style.display = "block";
        const percent = Math.max(0, (scaledEnemy.health / originalScaledHealth) * 100);
        enemyHealthBarFill.style.width = percent + "%";
        enemyHealthText.textContent = `${Math.max(0, scaledEnemy.health)} / ${originalScaledHealth}`;
        setTimeout(() => {
          player.explorationData.trapSet = false;
          fightEnemy(scaledEnemy, "exploration", true);
        }, 1500);
        return;
      } 
      else {
        log("❌ The trap was a dud. An enemy found you instead!", true);
      }
    }
    player.explorationData.trapSet = false;
    nextEnemy.MaxHealth = nextEnemy.health;
    fightEnemy(nextEnemy, "exploration");
  } 
  else {
    log("The area is quiet for now.", true);
    endExploration();
  }
}



//INFINITE DUNGEON SYSTEM
function showInfiniteDungeon() {
  clearOutput();
  controls.innerHTML = "";
  if (player.level < infiniteDungeon.minLevel) {
    log(`❌ You must be at least level ${infiniteDungeon.minLevel} to enter the ${infiniteDungeon.name}!`, true);
    addAction("⬅️ Back", showTravelMenu);
    return;
  }
  const now = Date.now();
  const lastAttempt = player.minigameCooldowns?.infiniteDungeon || 0;
  const cooldownRemaining = lastAttempt + infiniteDungeon.cooldown - now;
  if (cooldownRemaining > 0) {
    const minutes = Math.floor(cooldownRemaining / 60000);
    const seconds = Math.floor((cooldownRemaining % 60000) / 1000);
    log(`⏰ The ${infiniteDungeon.name} is not ready for another challenge.`, true);
    log(`Come back in ${minutes}m ${seconds}s.`, true);
    addAction("🌍Travel", showTravelMenu);
    return;
  }
  log(`🏰 ${infiniteDungeon.name}`, true);
  log(infiniteDungeon.description, true);
  log(`\n📊 Requirements:`, true);
  log(`• Level ${infiniteDungeon.minLevel}+`, true);
  log(`• 10-minute cooldown between attempts`, true);
  log(`\n🎯 Challenge: Defeat as many floor guardians as you can!`, true);
  log(`💎 Rewards accumulate and are awarded when you die or leave.`, true);
  const highestFloor = player.stats?.highestDungeonFloor || 0;
  if (highestFloor > 0) {
    log(`\n🏆 Your record: Floor ${highestFloor}`, true);
    if (player.achievements?.dungeon_crawler) {
      log(`✅ Dungeon Crawler (Floor 10) - Completed!`, true);
    } else {
      log(`🎯 Dungeon Crawler: ${highestFloor}/10 floors`, true);
    }
    if (player.achievements?.dungeon_master) {
      log(`✅ Dungeon Master (Floor 25) - Completed!`, true);
    } else {
      log(`🎯 Dungeon Master: ${highestFloor}/25 floors`, true);
    }
  } else {
    log(`\n🎯 Achievements:`, true);
    log(`• Dungeon Crawler: Reach Floor 10`, true);
    log(`• Dungeon Master: Reach Floor 25`, true);
  }
  addAction("Enter the Tower", startInfiniteDungeon);
  addAction("⬅️ Back", showTravelMenu);
}

function startInfiniteDungeon() {
  clearOutput();
  controls.innerHTML = "";
  player.infiniteDungeonSession = {
    currentFloor: 1,
    accumulatedGold: 0,
    accumulatedExp: 0,
    accumulatedItems: {},
    bossesDefeated: 0,
    startTime: Date.now()
  };
  log(`🌀 You enter the ${infiniteDungeon.name}...`, true);
  log(`The air grows heavy with ancient power as you ascend to Floor 1.`, true);
  playBattleMusic();
  proceedToNextFloor();
}

function proceedToNextFloor() {
  const session = player.infiniteDungeonSession;
  const bossData = enemyMap["Infinite Dungeon"][session.currentFloor - 1];
  if (!bossData) {
    const floor = session.currentFloor;
    const baseStats = infiniteDungeon.baseBossStats;
    const scaledBoss = {
      name: `Ancient Guardian (Floor ${floor})`,
      health: Math.floor(baseStats.health * Math.pow(baseStats.scaling.health, floor - 1)),
      Attack: Math.floor(baseStats.attack * Math.pow(baseStats.scaling.attack, floor - 1)),
      gold: Math.floor(infiniteDungeon.rewards.baseGold * Math.pow(infiniteDungeon.rewards.scaling, floor - 1)),
      exp: Math.floor(infiniteDungeon.rewards.baseExp * Math.pow(infiniteDungeon.rewards.scaling, floor - 1)),
      boss: true,
      drops: infiniteDungeon.rewards.rareDrops,
      infiniteDungeon: true,
      floor: floor
    };
    fightEnemy(scaledBoss, "infiniteDungeon", true);
  } 
  else {
    fightEnemy(bossData, "infiniteDungeon", true);
  }
}

function handleInfiniteDungeonVictory(enemy) {
  const session = player.infiniteDungeonSession;
  session.accumulatedGold += enemy.gold;
  session.accumulatedExp += enemy.exp;
  session.bossesDefeated++;
  if (enemy.drops && enemy.drops.length > 0) {
    enemy.drops.forEach(drop => {
      if (Math.random() < 0.7) {
        session.accumulatedItems[drop] = (session.accumulatedItems[drop] || 0) + 1;
      }
    });
  }
  const oldHighestFloor = player.stats.highestDungeonFloor || 0;
  if (!player.stats.highestDungeonFloor || session.currentFloor > player.stats.highestDungeonFloor) {
    player.stats.highestDungeonFloor = session.currentFloor;
    if (session.currentFloor > oldHighestFloor) {
      checkAchievements();
    }
  }
  session.currentFloor++;
  clearOutput();
  log(`🏆 Floor ${enemy.floor} Cleared!`, true);
  log(`✨ Defeated: ${enemy.name}`, true);
  log(`💰 Gold earned this floor: ${enemy.gold}`, true);
  log(`⚔️ EXP earned this floor: ${enemy.exp}`, true);
  log(`\n📊 Session Total:`, true);
  log(`• Floors cleared: ${session.bossesDefeated}`, true);
  log(`• Total Gold: ${session.accumulatedGold}`, true);
  log(`• Total EXP: ${session.accumulatedExp}`, true);
  showDungeonAchievementProgress();
  const nextFloor = session.currentFloor;
  const nextBoss = enemyMap["Infinite Dungeon"][nextFloor - 1] || { name: `Ancient Guardian (Floor ${nextFloor})`, health: "???", Attack: "???" };
  log(`\n⬆️ Next: Floor ${nextFloor}`, true);
  log(`👹 Guardian: ${nextBoss.name}`, true);
  log(`❤️ Estimated Health: ${nextBoss.health || "Extremely High"}`, true);
  log(`⚔️ Estimated Attack: ${nextBoss.Attack || "Extremely High"}`, true);
  addAction("Continue to Next Floor", () => {
    const healAmount = Math.floor((player.MaxHealth + player.bonusMaxHealth) * 0.25);
    player.health = Math.min(player.MaxHealth + player.bonusMaxHealth, player.health + healAmount);
    const manaAmount = Math.floor((player.maxMana + player.bonusMana) * 0.25);
    player.Mana = Math.min(player.maxMana + player.bonusMana, player.Mana + manaAmount);
    log(`💖 Restored ${healAmount} HP and ${manaAmount} MP between floors.`, true);
    updateStatBars();
    proceedToNextFloor();
  });
  addAction("Leave with Rewards", () => {
    endInfiniteDungeonSession(true);
  });
}

function showDungeonAchievementProgress() {
  const highestFloor = player.stats.highestDungeonFloor || 0;
  if (highestFloor >= 10 && !player.achievements?.dungeon_crawler) {
    log(`🎯 Progress: Floor ${highestFloor}/10 for Dungeon Crawler achievement`, true);
  }
  if (highestFloor >= 25 && !player.achievements?.dungeon_master) {
    log(`🎯 Progress: Floor ${highestFloor}/25 for Dungeon Master achievement`, true);
  }
  if (highestFloor < 10) {
    log(`🎯 Next Achievement: Reach Floor 10 (${10 - highestFloor} floors to go)`, true);
  } else if (highestFloor < 25) {
    log(`🎯 Next Achievement: Reach Floor 25 (${25 - highestFloor} floors to go)`, true);
  } else if (highestFloor >= 25) {
    log(`🎯 All dungeon achievements completed!`, true);
  }
}

function endInfiniteDungeonSession(voluntaryExit = false) {
  const session = player.infiniteDungeonSession;
  clearOutput();
  if (voluntaryExit) {
    log(`🏃 You wisely decide to leave the ${infiniteDungeon.name}.`, true);
  } 
  else {
    log(`💀 You have been defeated in the ${infiniteDungeon.name}!`, true);
  }
  log(`\n🎉 DUNGEON COMPLETE!`, true);
  log(`📊 Final Results:`, true);
  log(`• Floors Cleared: ${session.bossesDefeated}`, true);
  log(`• Total Gold Earned: ${session.accumulatedGold}`, true);
  log(`• Total EXP Earned: ${session.accumulatedExp}`, true);
  if (session.accumulatedGold > 0) {
    addGold(session.accumulatedGold, "Infinite Dungeon");
  }
  if (session.accumulatedExp > 0) {
    gainExp(session.accumulatedExp);
  }
  let totalItems = 0;
  for (const item in session.accumulatedItems) {
    const quantity = session.accumulatedItems[item];
    addItemToInventory(item, quantity, { silent: true });
    totalItems += quantity;
  }
  if (totalItems > 0) {
    log(`• Items Found: ${totalItems}`, true);
  }
  checkAchievements();
  if (session.bossesDefeated >= 5) {
    const bonusMultiplier = 1 + (session.bossesDefeated * 0.05);
    const bonusGold = Math.floor(session.accumulatedGold * (bonusMultiplier - 1));
    const bonusExp = Math.floor(session.accumulatedExp * (bonusMultiplier - 1));
    
    if (bonusGold > 0) {
      addGold(bonusGold, "Floor Bonus");
      log(`✨ Floor Bonus: +${bonusGold} gold!`, true);
    }
    if (bonusExp > 0) {
      gainExp(bonusExp);
      log(`✨ Floor Bonus: +${bonusExp} EXP!`, true);
    }
  }
  player.minigameCooldowns.infiniteDungeon = Date.now();
  delete player.infiniteDungeonSession;
  playBackgroundMusic();
  if (!player.stats.totalDungeonFloors) player.stats.totalDungeonFloors = 0;
  player.stats.totalDungeonFloors += session.bossesDefeated;
  
  if (!player.stats.dungeonAttempts) player.stats.dungeonAttempts = 0;
  player.stats.dungeonAttempts++;
  addAction("Return to Adventure", showLocation);
}