// Système de balance du jeu amélioré
export class GameBalance {
  // Configuration des taux de base
  static BASE_CONFIG = {
    // Économie
    FORGE_BASE_COST: 25, // Augmenté de 20 à 25
    HEAL_COST: 35, // Augmenté de 30 à 35
    COMPANION_COST_MULTIPLIER: 1.2, // Coût des compagnons augmente avec le nombre
    
    // Expérience et niveaux
    LEVEL_UP_BASE_CHANCE: 15, // Réduit de 20 à 15%
    EXP_BOOST_MULTIPLIER: 2.5, // Augmenté de 2 à 2.5
    
    // Or et récompenses
    GOLD_LUCK_BONUS: 3, // 3% par point de luck (réduit de 5%)
    DEFEAT_GOLD_LOSS: 0.4, // Perte de 40% de l'or (réduit de 50%)
    
    // Taux de drop équipements
    DROP_RATES: {
      COMMON: 45, // Réduit de 50%
      RARE: 30, // Identique
      EPIC: 20, // Augmenté de 15%
      LEGENDARY: 4.5, // Réduit de 5%
      MYTHIC: 0.5, // Nouveau: chance minime en forge normale
    },
    
    // Modificateurs de difficulté
    WAVE_DIFFICULTY_SCALING: 0.35, // Réduit de 0.4
    LEVEL_DIFFICULTY_SCALING: 0.25, // Augmenté de 0.2
    
    // Bonus des compagnons
    COMPANION_DAMAGE_BONUS: 0.25, // 25% des dégâts du compagnon
    COMPANION_PROTECTION_CHANCE: 25, // 25% de chance de protection
    
    // Nouvelles mécaniques
    PRESTIGE_UNLOCK_LEVEL: 50,
    MASTERY_POINTS_PER_LEVEL: 2,
    ENCHANTMENT_BASE_COST: 100,
  };

  // Calculs d'équilibrage pour l'économie
  static calculateForgeCost(playerLevel, timesForged = 0) {
    const baseCost = this.BASE_CONFIG.FORGE_BASE_COST;
    const levelScaling = Math.floor(playerLevel / 5) * 5; // +5 or tous les 5 niveaux
    const frequencyScaling = Math.floor(timesForged / 10); // +1 or toutes les 10 forges
    
    return baseCost + levelScaling + frequencyScaling;
  }

  static calculateCompanionCost(companionIndex, currentCompanions = 0) {
    const baseCosts = [150, 200, 300, 400, 500]; // Coûts de base par rareté
    const baseCost = baseCosts[companionIndex] || 500;
    const multiplier = Math.pow(this.BASE_CONFIG.COMPANION_COST_MULTIPLIER, currentCompanions);
    
    return Math.floor(baseCost * multiplier);
  }

  static calculateGoldReward(baseGold, playerLevel, luck = 0, hasAvarice = false) {
    const levelBonus = 1 + (playerLevel - 1) * 0.3; // 30% par niveau
    const luckBonus = 1 + (luck * this.BASE_CONFIG.GOLD_LUCK_BONUS / 100);
    const avariceMultiplier = hasAvarice ? 2.5 : 1; // Augmenté de 2 à 2.5
    
    return Math.floor(baseGold * levelBonus * luckBonus * avariceMultiplier);
  }

  // Nouveau système de drop rates amélioré
  static calculateDropChance(baseChance, luck = 0, bossType = 'normal') {
    const luckBonus = luck * 1.5; // 1.5% par point de luck
    
    const bossMultipliers = {
      normal: 1,
      elite: 1.5,
      boss: 2.0,
      ultra: 3.0,
      world: 5.0
    };
    
    const multiplier = bossMultipliers[bossType] || 1;
    
    return Math.min(95, baseChance + luckBonus * multiplier); // Cap à 95%
  }

  // Système de difficulté adaptatif
  static calculateEnemyStats(baseStats, playerLevel, waveNumber = 1, difficulty = 'normal') {
    const difficultyMultipliers = {
      easy: 0.8,
      normal: 1.0,
      hard: 1.3,
      nightmare: 1.6,
      hell: 2.0
    };
    
    const diffMultiplier = difficultyMultipliers[difficulty] || 1;
    const levelMultiplier = 1 + (playerLevel - 1) * this.BASE_CONFIG.LEVEL_DIFFICULTY_SCALING;
    const waveMultiplier = 1 + (waveNumber - 1) * this.BASE_CONFIG.WAVE_DIFFICULTY_SCALING;
    
    const totalMultiplier = diffMultiplier * levelMultiplier * waveMultiplier;
    
    return {
      hp: Math.floor(baseStats.hp * totalMultiplier),
      attack: Math.floor(baseStats.attack * totalMultiplier),
      goldReward: Math.floor(baseStats.goldReward * totalMultiplier * 0.8), // Or légèrement réduit
      expReward: Math.floor(baseStats.expReward || 10 * totalMultiplier)
    };
  }

  // Nouveau système de stats d'équipement équilibré
  static generateBalancedStats(equipmentType, rarity, playerLevel = 1) {
    const rarityMultipliers = {
      COMMON: { stat: 1.0, value: 1.0 },
      RARE: { stat: 1.6, value: 1.8 },
      EPIC: { stat: 2.4, value: 3.0 },
      LEGENDARY: { stat: 3.5, value: 5.0 },
      MYTHIC: { stat: 5.0, value: 8.0 },
      TRANSCENDENT: { stat: 7.5, value: 15.0 },
      CELESTIAL: { stat: 12.0, value: 25.0 }
    };
    
    const levelScaling = 1 + (playerLevel - 1) * 0.1; // 10% par niveau
    const multiplier = rarityMultipliers[rarity] || rarityMultipliers.COMMON;
    
    const baseStatRanges = {
      attaque: { min: 8, max: 18 },
      défense: { min: 5, max: 15 },
      vie: { min: 25, max: 60 },
      mana: { min: 15, max: 40 },
      agilité: { min: 3, max: 10 },
      critique: { min: 2, max: 8 },
      esquive: { min: 1, max: 6 },
      luck: { min: 1, max: 4 }
    };
    
    const stats = {};
    
    // Génère les stats principales
    equipmentType.stats.forEach(statName => {
      const range = baseStatRanges[statName];
      if (range) {
        const baseValue = range.min + Math.random() * (range.max - range.min);
        stats[statName] = Math.floor(baseValue * multiplier.stat * levelScaling);
      }
    });
    
    // Stats bonus selon la rareté
    const bonusChances = {
      COMMON: 10,
      RARE: 25,
      EPIC: 50,
      LEGENDARY: 75,
      MYTHIC: 100,
      TRANSCENDENT: 100,
      CELESTIAL: 100
    };
    
    if (equipmentType.bonusStats && Math.random() * 100 < bonusChances[rarity]) {
      equipmentType.bonusStats.forEach(bonusStat => {
        const range = baseStatRanges[bonusStat];
        if (range && !stats[bonusStat]) {
          const baseValue = range.min + Math.random() * (range.max - range.min);
          stats[bonusStat] = Math.floor(baseValue * multiplier.stat * levelScaling * 0.7);
        }
      });
    }
    
    return stats;
  }

  // Système de prestige et maîtrise
  static calculatePrestigeBonus(prestigeLevel) {
    return {
      goldMultiplier: 1 + prestigeLevel * 0.1, // +10% or par niveau de prestige
      expMultiplier: 1 + prestigeLevel * 0.05, // +5% exp par niveau
      dropBonusFlat: prestigeLevel * 0.5, // +0.5% drop chance par niveau
      forgeDiscount: Math.min(0.5, prestigeLevel * 0.02) // Max 50% de réduction
    };
  }

  // Nouveau système d'enchantements
  static getEnchantmentCost(enchantmentLevel, equipmentRarity) {
    const rarityMultipliers = {
      COMMON: 1.0,
      RARE: 1.5,
      EPIC: 2.5,
      LEGENDARY: 4.0,
      MYTHIC: 7.0,
      TRANSCENDENT: 12.0,
      CELESTIAL: 20.0
    };
    
    const baseCost = this.BASE_CONFIG.ENCHANTMENT_BASE_COST;
    const levelMultiplier = Math.pow(1.8, enchantmentLevel);
    const rarityMultiplier = rarityMultipliers[equipmentRarity] || 1;
    
    return Math.floor(baseCost * levelMultiplier * rarityMultiplier);
  }

  // Validation d'équilibrage
  static validateGameBalance(gameState) {
    const warnings = [];
    
    // Vérifier l'inflation économique
    if (gameState.gold > gameState.playerLevel * 1000) {
      warnings.push("Possible inflation économique détectée");
    }
    
    // Vérifier la progression
    if (gameState.playerLevel > 20 && gameState.totalCombats < gameState.playerLevel * 5) {
      warnings.push("Progression trop rapide détectée");
    }
    
    // Vérifier l'équilibrage des équipements
    const avgItemValue = gameState.inventory.reduce((sum, item) => sum + item.value, 0) / gameState.inventory.length;
    if (avgItemValue > gameState.playerLevel * 100) {
      warnings.push("Équipements potentiellement trop puissants");
    }
    
    return warnings;
  }

  // Nouvelles mécaniques de jeu
  static getDailyBonuses() {
    const today = new Date().toDateString();
    const lastBonus = localStorage.getItem('lastDailyBonus');
    
    if (lastBonus !== today) {
      localStorage.setItem('lastDailyBonus', today);
      return {
        gold: 200,
        freeForges: 3,
        expBoost: 1.5, // 50% exp bonus pour 1 heure
        dropBoost: 10 // +10% drop rate pour 1 heure
      };
    }
    
    return null;
  }

  // Système d'achievements avec récompenses
  static ACHIEVEMENTS = {
    FIRST_LEGENDARY: {
      name: "Premier Légendaire",
      description: "Forgez votre premier équipement légendaire",
      reward: { gold: 500, masteryPoints: 10 }
    },
    WAVE_MASTER: {
      name: "Maître des Vagues",
      description: "Survivez à 50 vagues",
      reward: { gold: 1000, freeCompanion: true }
    },
    BOSS_SLAYER: {
      name: "Tueur de Boss",
      description: "Battez 20 boss de donjon",
      reward: { gold: 2000, unlockPrestige: true }
    },
    WEALTHY: {
      name: "Richesse",
      description: "Accumulez 10,000 or",
      reward: { masteryPoints: 25, goldMultiplier: 1.1 }
    },
    COLLECTOR: {
      name: "Collectionneur",
      description: "Possédez 50 équipements différents",
      reward: { inventorySlots: 20, masteryPoints: 15 }
    }
  };

  // Système de quêtes journalières
  static generateDailyQuests(playerLevel) {
    const questPool = [
      {
        type: "KILL_ENEMIES",
        target: 10 + playerLevel * 2,
        reward: { gold: 100 + playerLevel * 20, exp: 50 },
        description: "Tuez {target} ennemis"
      },
      {
        type: "FORGE_ITEMS",
        target: 5,
        reward: { gold: 200, masteryPoints: 5 },
        description: "Forgez {target} équipements"
      },
      {
        type: "DEFEAT_BOSS",
        target: 1,
        reward: { gold: 500, freeForges: 2 },
        description: "Battez un boss de donjon"
      },
      {
        type: "SURVIVE_WAVES",
        target: Math.max(5, playerLevel),
        reward: { gold: 300, expBoost: 2.0 },
        description: "Survivez à {target} vagues"
      }
    ];
    
    // Retourne 3 quêtes aléatoires
    return questPool.sort(() => Math.random() - 0.5).slice(0, 3);
  }
}

// Système de méta-progression
export class MetaProgression {
  static MASTERY_TREES = {
    COMBAT: {
      name: "Maîtrise Combat",
      maxLevel: 20,
      bonuses: {
        1: { criticalChance: 2 },
        5: { damageBonus: 10 },
        10: { lifeSteal: 5 },
        15: { berserkerMode: true },
        20: { combatMastery: true }
      }
    },
    ECONOMY: {
      name: "Maîtrise Économique",
      maxLevel: 20,
      bonuses: {
        1: { goldBonus: 5 },
        5: { forgeDiscount: 10 },
        10: { sellBonus: 25 },
        15: { businessAcumen: true },
        20: { economicMastery: true }
      }
    },
    CRAFTING: {
      name: "Maîtrise Artisanat",
      maxLevel: 20,
      bonuses: {
        1: { betterStats: 5 },
        5: { bonusEnchant: true },
        10: { fasterForging: 50 },
        15: { masterCrafter: true },
        20: { legendaryChance: 2 }
      }
    }
  };

  static calculateMasteryEffect(tree, level) {
    const treeData = this.MASTERY_TREES[tree];
    if (!treeData || level > treeData.maxLevel) return {};
    
    let effects = {};
    
    for (let i = 1; i <= level; i++) {
      if (treeData.bonuses[i]) {
        effects = { ...effects, ...treeData.bonuses[i] };
      }
    }
    
    return effects;
  }
}
