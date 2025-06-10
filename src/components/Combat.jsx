import { useState, useEffect } from "react";
import { GameBalance } from "../utils/GameBalance";
import "./Combat.css";

// Système d'ennemis progressifs avec déverrouillage
const ENEMIES = [
  // Zone Débutant (Niveau 1-5)
  {
    name: "Gobelin",
    emoji: "👹",
    baseHp: 35,
    baseAttack: 10,
    baseGold: 18,
    expReward: 8,
    unlockLevel: 1,
    zone: "Forêt Sombre",
    description: "Un petit gobelin vicieux",
  },
  {
    name: "Loup",
    emoji: "🐺",
    baseHp: 45,
    baseAttack: 12,
    baseGold: 22,
    expReward: 10,
    unlockLevel: 2,
    zone: "Forêt Sombre",
    description: "Un loup sauvage affamé",
  },
  {
    name: "Bandit",
    emoji: "🗡️",
    baseHp: 50,
    baseAttack: 15,
    baseGold: 28,
    expReward: 12,
    unlockLevel: 3,
    zone: "Forêt Sombre",
    description: "Un bandit de grand chemin",
  },

  // Zone Intermédiaire (Niveau 4-10)
  {
    name: "Orc Guerrier",
    emoji: "🧌",
    baseHp: 70,
    baseAttack: 18,
    baseGold: 35,
    expReward: 15,
    unlockLevel: 4,
    zone: "Terres Sauvages",
    description: "Un orc brutal et expérimenté",
  },
  {
    name: "Squelette Archer",
    emoji: "💀🏹",
    baseHp: 55,
    baseAttack: 22,
    baseGold: 32,
    expReward: 18,
    unlockLevel: 5,
    zone: "Terres Sauvages",
    description: "Un archer mort-vivant précis",
  },
  {
    name: "Troll des Cavernes",
    emoji: "👺",
    baseHp: 95,
    baseAttack: 25,
    baseGold: 45,
    expReward: 22,
    unlockLevel: 6,
    zone: "Terres Sauvages",
    description: "Un troll massif et régénérant",
  },

  // Zone Avancée (Niveau 8-15)
  {
    name: "Vampire Noble",
    emoji: "🧛‍♂️",
    baseHp: 85,
    baseAttack: 30,
    baseGold: 60,
    expReward: 25,
    unlockLevel: 8,
    zone: "Château Maudit",
    description: "Un vampire aristocrate assoiffé",
  },
  {
    name: "Golem de Pierre",
    emoji: "🗿",
    baseHp: 120,
    baseAttack: 28,
    baseGold: 55,
    expReward: 28,
    unlockLevel: 9,
    zone: "Château Maudit",
    description: "Une construction magique animée",
  },
  {
    name: "Sorcier Noir",
    emoji: "🧙‍♂️",
    baseHp: 75,
    baseAttack: 35,
    baseGold: 65,
    expReward: 30,
    unlockLevel: 10,
    zone: "Château Maudit",
    description: "Un mage corrompu par les ténèbres",
  },

  // Zone Expert (Niveau 12-20)
  {
    name: "Dragon Mineur",
    emoji: "🐲",
    baseHp: 150,
    baseAttack: 40,
    baseGold: 85,
    expReward: 35,
    unlockLevel: 12,
    zone: "Montagnes Draconiques",
    description: "Un jeune dragon territorial",
  },
  {
    name: "Démon Garde",
    emoji: "😈",
    baseHp: 130,
    baseAttack: 45,
    baseGold: 90,
    expReward: 38,
    unlockLevel: 14,
    zone: "Montagnes Draconiques",
    description: "Un démon gardien féroce",
  },
  {
    name: "Hydre Bicéphale",
    emoji: "🐍🐍",
    baseHp: 110,
    baseAttack: 50,
    baseGold: 95,
    expReward: 42,
    unlockLevel: 16,
    zone: "Montagnes Draconiques",
    description: "Une hydre à deux têtes venimeuse",
  },

  // Zone Légendaire (Niveau 18+)
  {
    name: "Liche Ancienne",
    emoji: "💀👑",
    baseHp: 180,
    baseAttack: 55,
    baseGold: 120,
    expReward: 50,
    unlockLevel: 18,
    zone: "Royaume des Morts",
    description: "Un mage-roi mort-vivant",
    isElite: true,
  },
  {
    name: "Titan de Fer",
    emoji: "⚔️🗿",
    baseHp: 220,
    baseAttack: 60,
    baseGold: 140,
    expReward: 55,
    unlockLevel: 20,
    zone: "Royaume des Morts",
    description: "Un colosse de métal et de magie",
    isElite: true,
  },
  {
    name: "Phoenix Éternel",
    emoji: "🔥🦅",
    baseHp: 160,
    baseAttack: 65,
    baseGold: 150,
    expReward: 60,
    unlockLevel: 22,
    zone: "Royaume des Morts",
    description: "Un oiseau de feu immortel",
    isElite: true,
  },
];

// Système de donjons progressifs
const DUNGEON_ENEMIES = [
  {
    name: "Gardien de la Forêt",
    emoji: "🌳👹",
    hp: 180,
    attack: 35,
    goldReward: 150,
    expReward: 80,
    mythicChance: 2,
    unlockLevel: 5,
    zone: "Forêt Sombre",
    description: "Le protecteur corrompu de la forêt",
    type: "boss",
  },
  {
    name: "Roi des Orcs",
    emoji: "👑🧌",
    hp: 280,
    attack: 45,
    goldReward: 220,
    expReward: 120,
    mythicChance: 3,
    unlockLevel: 8,
    zone: "Terres Sauvages",
    description: "Le chef brutal de la tribu orc",
    type: "boss",
  },
  {
    name: "Seigneur Vampire",
    emoji: "🦇👑",
    hp: 380,
    attack: 55,
    goldReward: 300,
    expReward: 160,
    mythicChance: 4,
    unlockLevel: 12,
    zone: "Château Maudit",
    description: "Le maître du château des ténèbres",
    type: "boss",
  },
  {
    name: "Dragon Ancien",
    emoji: "🐲👑",
    hp: 500,
    attack: 70,
    goldReward: 420,
    expReward: 220,
    mythicChance: 6,
    unlockLevel: 16,
    zone: "Montagnes Draconiques",
    description: "Un dragon millénaire gardien de trésors",
    type: "boss",
  },
  {
    name: "Archliche Suprême",
    emoji: "💀⚡",
    hp: 650,
    attack: 85,
    goldReward: 550,
    expReward: 280,
    mythicChance: 8,
    unlockLevel: 20,
    zone: "Royaume des Morts",
    description: "Le nécromancien ultime des terres maudites",
    type: "boss",
  },
  {
    name: "Seigneur du Chaos",
    emoji: "👑🌌",
    hp: 1200,
    attack: 120,
    goldReward: 800,
    expReward: 400,
    mythicChance: 0,
    transcendentChance: 3,
    celestialChance: 1,
    entryCost: 500,
    unlockLevel: 25,
    zone: "Dimension du Chaos",
    description: "L'entité cosmique maîtresse du chaos",
    isUltraBoss: true,
    type: "ultra",
  },
  {
    name: "Créateur Primordial",
    emoji: "✨🌍",
    hp: 2000,
    attack: 150,
    goldReward: 1200,
    expReward: 600,
    transcendentChance: 5,
    celestialChance: 2,
    entryCost: 800,
    unlockLevel: 30,
    zone: "Nexus Primordial",
    description: "L'être originel créateur de toute existence",
    isUltraBoss: true,
    type: "cosmic",
    phases: 3,
  },
];

const EQUIPMENT_TYPES = {
  WEAPON: {
    name: "Arme",
    emoji: "⚔️",
    primaryStat: "attaque",
    stats: ["attaque", "critique"],
    bonusStats: ["luck"],
  },
  ARMOR: {
    name: "Armure",
    emoji: "🛡️",
    primaryStat: "défense",
    stats: ["défense", "vie"],
    bonusStats: ["luck"],
  },
  HELMET: {
    name: "Casque",
    emoji: "⛑️",
    primaryStat: "défense",
    stats: ["défense", "mana"],
    bonusStats: ["luck"],
  },
  BOOTS: {
    name: "Bottes",
    emoji: "👢",
    primaryStat: "agilité",
    stats: ["agilité", "esquive"],
    bonusStats: ["luck"],
  },
};

const MYTHIC_RARITY = {
  name: "Mythique",
  color: "#ff0080",
  statMultiplier: 6,
  emoji: "💖",
  key: "MYTHIC",
};

// Nouvelles raretés ultra rares
const TRANSCENDENT_RARITY = {
  name: "Transcendant",
  color: "#00ffff",
  statMultiplier: 10,
  emoji: "🌟",
  key: "TRANSCENDENT",
};

const CELESTIAL_RARITY = {
  name: "Céleste",
  color: "#ffffff",
  statMultiplier: 15,
  emoji: "✨",
  key: "CELESTIAL",
};

// Boss ultra difficile
const ULTRA_BOSS = {
  name: "Seigneur du Chaos",
  emoji: "👑",
  maxHp: 2000,
  currentHp: 2000,
  attack: 150,
  goldReward: 1000,
  transcendentChance: 3,
  celestialChance: 1,
  entryCost: 500,
  defeatedCount: 0,
  maxDefeats: 5, // Doit être tué 5 fois
};

function Combat({
  equippedItems,
  gold,
  setGold,
  onCombatStateChange,
  onEquipmentFound,
  companions,
  setCompanions,
  passiveAbilities,
  setPassiveAbilities,
  dungeonTickets = 0,
  setDungeonTickets,
  playerLevel,
  setPlayerLevel,
  experience,
  setExperience,
  gameStats,
  setGameStats,
}) {
  // État des onglets
  const [activeTab, setActiveTab] = useState("combat");
  // États du combat normal
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(0);
  const [isInCombat, setIsInCombat] = useState(false);
  const [combatLog, setCombatLog] = useState([]);
  const [maxPlayerHp, setMaxPlayerHp] = useState(100);

  // États du donjon
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHp, setBossHp] = useState(0);
  const [isInDungeon, setIsInDungeon] = useState(false);
  const [dungeonLog, setDungeonLog] = useState([]);
  const [foundMythic, setFoundMythic] = useState(null);

  // États des compagnons
  const [activeCompanion, setActiveCompanion] = useState(null);
  const [companionHp, setCompanionHp] = useState(0);
  const [maxCompanionHp, setMaxCompanionHp] = useState(0);

  // États pour les mécaniques avancées
  const [streakCount, setStreakCount] = useState(1);
  const [lastVictoryTime, setLastVictoryTime] = useState(0);
  const [combatEffects, setCombatEffects] = useState([]);

  // Fonctions pour l'XP et les niveaux
  const getExperienceForLevel = (level) => {
    // Formule progressive pour l'XP requise
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  const handleLevelUp = (newExperience) => {
    let currentLevel = playerLevel;
    let remainingExp = newExperience;

    // Vérifier s'il y a montée de niveau (peut être plusieurs niveaux)
    while (remainingExp >= getExperienceForLevel(currentLevel + 1)) {
      remainingExp -= getExperienceForLevel(currentLevel + 1);
      currentLevel++;

      // Afficher message de montée de niveau
      setCombatLog((prev) => [
        ...prev,
        `🎉 NIVEAU SUPÉRIEUR ! Vous êtes maintenant niveau ${currentLevel} !`,
        `✨ +10 PV max, +2 Attaque, +1 Défense !`,
      ]);

      // Mettre à jour les stats de base (bonus par niveau)
      setMaxPlayerHp((prev) => prev + 10);
      setPlayerHp((prev) => prev + 10); // Bonus de PV immédiat
    }

    // Mettre à jour le niveau et l'expérience
    if (currentLevel > playerLevel) {
      setPlayerLevel(currentLevel);
      setExperience(remainingExp);

      // Mettre à jour les statistiques de jeu
      setGameStats((prev) => ({
        ...prev,
        playerLevel: currentLevel,
      }));
    } else {
      setExperience(remainingExp);
    }
  };

  // Fonction pour obtenir les ennemis débloqués
  const getUnlockedEnemies = () => {
    return ENEMIES.filter((enemy) => enemy.unlockLevel <= playerLevel);
  };

  // Fonction pour obtenir les donjons débloqués
  const getUnlockedDungeons = () => {
    return DUNGEON_ENEMIES.filter(
      (dungeon) => dungeon.unlockLevel <= playerLevel
    );
  };

  // Fonction pour grouper les ennemis par zone
  const getEnemiesByZone = () => {
    const unlockedEnemies = getUnlockedEnemies();
    const zones = {};

    unlockedEnemies.forEach((enemy) => {
      if (!zones[enemy.zone]) {
        zones[enemy.zone] = [];
      }
      zones[enemy.zone].push(enemy);
    });

    return zones;
  };

  const getPlayerStats = () => {
    const baseStats = {
      attaque: 10,
      défense: 5,
      vie: 100,
      luck: 0,
      critique: 0,
      esquive: 0,
    };

    Object.values(equippedItems).forEach((item) => {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (baseStats.hasOwnProperty(stat)) {
          baseStats[stat] += value;
        }
      });
    });

    // Appliquer les bonus des compagnons actifs
    if (activeCompanion) {
      applyCompanionBonus(baseStats, activeCompanion);
    }

    // Appliquer les bonus des passifs
    passiveAbilities.forEach((passive) => {
      applyPassiveBonus(baseStats, passive);
    });

    return baseStats;
  };

  // Fonctions pour les compagnons
  const applyCompanionBonus = (stats, companion) => {
    switch (companion.passiveAbility) {
      case "DEFENSE_BOOST":
        stats.défense += 10;
        break;
      case "CRITICAL_BOOST":
        stats.critique += 15;
        break;
      case "MAGIC_DAMAGE":
        stats.attaque += 8;
        break;
    }
  };

  const applyPassiveBonus = (stats, passive) => {
    switch (passive.type) {
      case "COMBAT":
        if (passive.name === "Vol de Vie") {
          // Appliqué pendant le combat
        } else if (passive.name === "Rage du Berserker") {
          // Appliqué dynamiquement selon les PV
        }
        break;
      case "DEFENSE":
        if (passive.name === "Bouclier Magique") {
          stats.esquive += 10;
        }
        break;
    }
  };

  const activateCompanion = (companion) => {
    setActiveCompanion(companion);
    setCompanionHp(companion.hp);
    setMaxCompanionHp(companion.maxHp);
    setCombatLog((prev) => [
      ...prev,
      `✨ ${companion.emoji} ${companion.name} activé !`,
    ]);
  };

  // Fonctions du donjon
  const generateMythicEquipment = () => {
    const equipmentTypeKey =
      Object.keys(EQUIPMENT_TYPES)[
        Math.floor(Math.random() * Object.keys(EQUIPMENT_TYPES).length)
      ];
    const equipmentType = EQUIPMENT_TYPES[equipmentTypeKey];

    const baseStats = {
      attaque: { min: 15, max: 30 },
      défense: { min: 10, max: 25 },
      vie: { min: 50, max: 100 },
      mana: { min: 30, max: 60 },
      agilité: { min: 8, max: 15 },
      critique: { min: 5, max: 12 },
      esquive: { min: 4, max: 10 },
      luck: { min: 3, max: 8 },
    };

    const stats = {};

    // Génère les stats de base
    equipmentType.stats.forEach((statName) => {
      const baseStat = baseStats[statName];
      const baseValue =
        Math.floor(Math.random() * (baseStat.max - baseStat.min + 1)) +
        baseStat.min;
      stats[statName] = Math.floor(baseValue * MYTHIC_RARITY.statMultiplier);
    });

    // Toujours ajouter des stats bonus pour les mythiques
    equipmentType.bonusStats.forEach((bonusStat) => {
      if (baseStats[bonusStat]) {
        const baseStat = baseStats[bonusStat];
        const baseValue =
          Math.floor(Math.random() * (baseStat.max - baseStat.min + 1)) +
          baseStat.min;
        stats[bonusStat] = Math.floor(baseValue * MYTHIC_RARITY.statMultiplier);
      }
    });

    const value =
      Object.values(stats).reduce((sum, value) => sum + value, 0) * 10;

    return {
      id: Date.now(),
      name: `${MYTHIC_RARITY.name} ${equipmentType.name}`,
      type: equipmentType,
      rarity: MYTHIC_RARITY,
      stats,
      value,
      emoji: equipmentType.emoji,
    };
  };

  const generateUltraRareEquipment = (rarity) => {
    const equipmentTypeKey =
      Object.keys(EQUIPMENT_TYPES)[
        Math.floor(Math.random() * Object.keys(EQUIPMENT_TYPES).length)
      ];
    const equipmentType = EQUIPMENT_TYPES[equipmentTypeKey];

    const baseStats = {
      attaque: { min: 20, max: 40 },
      défense: { min: 15, max: 35 },
      vie: { min: 80, max: 150 },
      mana: { min: 50, max: 100 },
      agilité: { min: 12, max: 25 },
      critique: { min: 8, max: 20 },
      esquive: { min: 6, max: 15 },
      luck: { min: 5, max: 12 },
    };

    const stats = {};

    // Génère les stats de base avec le multiplicateur de la rareté
    equipmentType.stats.forEach((statName) => {
      const baseStat = baseStats[statName];
      const baseValue =
        Math.floor(Math.random() * (baseStat.max - baseStat.min + 1)) +
        baseStat.min;
      stats[statName] = Math.floor(baseValue * rarity.statMultiplier);
    });

    // Ajouter toutes les stats bonus pour les équipements ultra-rares
    equipmentType.bonusStats.forEach((bonusStat) => {
      if (baseStats[bonusStat]) {
        const baseStat = baseStats[bonusStat];
        const baseValue =
          Math.floor(Math.random() * (baseStat.max - baseStat.min + 1)) +
          baseStat.min;
        stats[bonusStat] = Math.floor(baseValue * rarity.statMultiplier);
      }
    });

    // Ajouter une stat bonus aléatoire supplémentaire
    const allStats = Object.keys(baseStats);
    const extraStat = allStats[Math.floor(Math.random() * allStats.length)];
    if (!stats[extraStat]) {
      const baseStat = baseStats[extraStat];
      const baseValue =
        Math.floor(Math.random() * (baseStat.max - baseStat.min + 1)) +
        baseStat.min;
      stats[extraStat] = Math.floor(baseValue * rarity.statMultiplier * 0.5);
    }

    const value =
      Object.values(stats).reduce((sum, value) => sum + value, 0) * 15;

    return {
      id: Date.now(),
      name: `${rarity.name} ${equipmentType.name}`,
      type: equipmentType,
      rarity: rarity,
      stats,
      value,
      emoji: equipmentType.emoji,
    };
  };

  // Fonction pour générer un équipement aléatoire avec rareté spécifiée
  const generateRandomEquipment = (rarityKey = "COMMON") => {
    const equipmentTypeKey =
      Object.keys(EQUIPMENT_TYPES)[
        Math.floor(Math.random() * Object.keys(EQUIPMENT_TYPES).length)
      ];
    const equipmentType = EQUIPMENT_TYPES[equipmentTypeKey];

    // Déterminer la rareté
    let rarity;
    switch (rarityKey) {
      case "MYTHIC":
        rarity = MYTHIC_RARITY;
        break;
      case "LEGENDARY":
        rarity = {
          name: "Légendaire",
          color: "#ff6b35",
          statMultiplier: 3,
          emoji: "⭐",
          key: "LEGENDARY",
        };
        break;
      case "EPIC":
        rarity = {
          name: "Épique",
          color: "#9b59b6",
          statMultiplier: 2.2,
          emoji: "💜",
          key: "EPIC",
        };
        break;
      case "RARE":
        rarity = {
          name: "Rare",
          color: "#3498db",
          statMultiplier: 1.7,
          emoji: "💙",
          key: "RARE",
        };
        break;
      default:
        rarity = {
          name: "Commun",
          color: "#95a5a6",
          statMultiplier: 1,
          emoji: "⚪",
          key: "COMMON",
        };
    }

    const baseStats = {
      attaque: { min: 5, max: 15 },
      défense: { min: 3, max: 12 },
      vie: { min: 20, max: 50 },
      mana: { min: 10, max: 30 },
      agilité: { min: 2, max: 8 },
      critique: { min: 1, max: 6 },
      esquive: { min: 1, max: 5 },
      luck: { min: 1, max: 4 },
    };

    const stats = {};

    // Générer les stats de base
    equipmentType.stats.forEach((statName) => {
      const baseStat = baseStats[statName];
      const baseValue =
        Math.floor(Math.random() * (baseStat.max - baseStat.min + 1)) +
        baseStat.min;
      stats[statName] = Math.floor(baseValue * rarity.statMultiplier);
    });

    // Chance d'avoir des stats bonus selon la rareté
    const bonusChance =
      rarity.statMultiplier > 2 ? 80 : rarity.statMultiplier > 1.5 ? 50 : 20;
    if (Math.random() * 100 < bonusChance) {
      equipmentType.bonusStats.forEach((bonusStat) => {
        if (baseStats[bonusStat] && Math.random() * 100 < 30) {
          const baseStat = baseStats[bonusStat];
          const baseValue =
            Math.floor(Math.random() * (baseStat.max - baseStat.min + 1)) +
            baseStat.min;
          stats[bonusStat] = Math.floor(
            baseValue * rarity.statMultiplier * 0.6
          );
        }
      });
    }

    const value =
      Object.values(stats).reduce((sum, value) => sum + value, 0) *
      Math.floor(rarity.statMultiplier * 3);

    return {
      id: Date.now() + Math.random(),
      name: `${rarity.name} ${equipmentType.name}`,
      type: equipmentType,
      rarity: rarity,
      stats,
      value,
      emoji: equipmentType.emoji,
    };
  };

  useEffect(() => {
    const playerStats = getPlayerStats();
    const newMaxHp = playerStats.vie;
    setMaxPlayerHp(newMaxHp);
    if (playerHp > newMaxHp) {
      setPlayerHp(newMaxHp);
    }
  }, [equippedItems]);
  // Gestion de l'état global du combat
  useEffect(() => {
    if (onCombatStateChange) {
      onCombatStateChange(isInCombat || isInDungeon);
    }
  }, [isInCombat, isInDungeon, onCombatStateChange]);

  // Effet de régénération du compagnon Guérisseur
  useEffect(() => {
    if (
      activeCompanion &&
      activeCompanion.passiveAbility === "REGENERATION" &&
      isInCombat
    ) {
      const regenInterval = setInterval(() => {
        setPlayerHp((prev) => {
          const healAmount = Math.floor(maxPlayerHp * 0.05); // 5% de régénération
          const newHp = Math.min(maxPlayerHp, prev + healAmount);
          if (newHp > prev) {
            setCombatLog((prevLog) => [
              ...prevLog,
              `💚 ${activeCompanion.emoji} Régénération : +${healAmount} PV !`,
            ]);
          }
          return newHp;
        });
      }, 3000); // Toutes les 3 secondes

      return () => clearInterval(regenInterval);
    }
  }, [activeCompanion, isInCombat, maxPlayerHp]); // Fonctions du donjon
  const startDungeon = (bossIndex) => {
    const boss = { ...DUNGEON_ENEMIES[bossIndex] };

    // Vérifier si c'est un boss ultime qui coûte de l'or
    if (boss.isUltraBoss) {
      const entryCost = boss.entryCost || 500;
      if (gold < entryCost) {
        alert(`Il faut ${entryCost} or pour défier ce boss ultime !`);
        return;
      }
      setGold((prev) => prev - entryCost);
    } else {
      // Boss normaux nécessitent un ticket
      if (dungeonTickets < 1) {
        alert(
          "Il faut un ticket de donjon pour entrer ! Battez des monstres pour en obtenir."
        );
        return;
      }
      setDungeonTickets((prev) => prev - 1);
    }

    setCurrentBoss(boss);
    setBossHp(boss.hp);
    setIsInDungeon(true);
    setPlayerHp(getPlayerStats().vie);
    setFoundMythic(null);

    if (boss.isUltraBoss) {
      setDungeonLog([
        `👑 DÉFI ULTIME ! Vous affrontez ${boss.emoji} ${boss.name} !`,
        `⚠️ Ce boss doit être vaincu 5 fois pour être définitivement terrassé !`,
      ]);
    } else {
      setDungeonLog([
        `🏰 Vous utilisez un ticket pour affronter ${boss.emoji} ${boss.name} !`,
        `🎫 Tickets restants : ${dungeonTickets - 1}`,
      ]);
    }
  };

  const playerAttackBoss = () => {
    const playerStats = getPlayerStats();
    const damage = Math.floor(Math.random() * 15) + playerStats.attaque;
    const isCritical = Math.random() * 100 < (playerStats.critique || 0) * 2;
    const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage;

    const newBossHp = Math.max(0, bossHp - finalDamage);
    setBossHp(newBossHp);

    const logMessage = isCritical
      ? `⚔️ Coup critique ! Vous infligez ${finalDamage} dégâts !`
      : `⚔️ Vous attaquez pour ${finalDamage} dégâts !`;

    setDungeonLog((prev) => [...prev, logMessage]);
    if (newBossHp <= 0) {
      // Victoire contre le boss
      const playerStats = getPlayerStats();
      const luckBonus = (playerStats.luck || 0) * 2;
      const mythicChance = currentBoss.mythicChance + luckBonus;
      const hasExpBoost = passiveAbilities.find(
        (p) => p.name === "Apprentissage Rapide"
      );

      // Récompenses d'or et d'XP
      setGold((prev) => prev + currentBoss.goldReward);

      let bossExpReward = currentBoss.expReward || 50;
      if (hasExpBoost) {
        bossExpReward = Math.floor(bossExpReward * 2);
      }

      // Gérer l'expérience et la montée de niveau
      const newTotalExperience = experience + bossExpReward;
      handleLevelUp(newTotalExperience);

      // Mettre à jour les stats de jeu
      setGameStats((prev) => ({
        ...prev,
        totalCombats: prev.totalCombats + 1,
        totalVictories: prev.totalVictories + 1,
        bossesDefeated: prev.bossesDefeated + 1,
        totalGoldEarned: prev.totalGoldEarned + currentBoss.goldReward,
      }));

      setDungeonLog((prev) =>
        [
          ...prev,
          `🎉 Victoire épique ! +${currentBoss.goldReward} or, +${bossExpReward} exp !`,
          hasExpBoost ? `📚 Apprentissage Rapide : XP doublée !` : null,
        ].filter(Boolean)
      );

      // Vérification des drops spéciaux
      if (currentBoss.isUltraBoss) {
        // Boss ultra : chances d'équipements Transcendants et Célestes
        const playerStats = getPlayerStats();
        const luckBonus = (playerStats.luck || 0) * 0.5; // Moins de bonus luck pour l'ultra boss

        const transcendentChance = currentBoss.transcendentChance + luckBonus;
        const celestialChance = currentBoss.celestialChance + luckBonus;

        if (Math.random() * 100 < celestialChance) {
          const celestialItem = generateUltraRareEquipment(CELESTIAL_RARITY);
          setFoundMythic(celestialItem);
          onEquipmentFound(celestialItem);
          setDungeonLog((prev) => [
            ...prev,
            `✨ MIRACLE ! Vous avez trouvé un équipement CÉLESTE ! ✨`,
          ]);
        } else if (Math.random() * 100 < transcendentChance) {
          const transcendentItem =
            generateUltraRareEquipment(TRANSCENDENT_RARITY);
          setFoundMythic(transcendentItem);
          onEquipmentFound(transcendentItem);
          setDungeonLog((prev) => [
            ...prev,
            `🌟 EXTRAORDINAIRE ! Vous avez trouvé un équipement TRANSCENDANT ! 🌟`,
          ]);
        } else {
          setDungeonLog((prev) => [
            ...prev,
            `💎 Pas d'équipement ultra-rare cette fois... (${transcendentChance.toFixed(
              1
            )}% Transcendant, ${celestialChance.toFixed(1)}% Céleste)`,
          ]);
        }
      } else {
        // Boss normal : chance d'équipement mythique
        const playerStats = getPlayerStats();
        const luckBonus = (playerStats.luck || 0) * 2;
        const mythicChance = currentBoss.mythicChance + luckBonus;

        if (Math.random() * 100 < mythicChance) {
          const mythicItem = generateMythicEquipment();
          setFoundMythic(mythicItem);
          onEquipmentFound(mythicItem);
          setDungeonLog((prev) => [
            ...prev,
            `✨ INCROYABLE ! Vous avez trouvé un équipement MYTHIQUE ! ✨`,
          ]);
        } else {
          setDungeonLog((prev) => [
            ...prev,
            `💎 Pas d'équipement mythique cette fois... (${mythicChance.toFixed(
              1
            )}% de chance)`,
          ]);
        }
      }

      setTimeout(() => {
        setIsInDungeon(false);
        setCurrentBoss(null);
        if (!foundMythic) {
          setDungeonLog([]);
        }
      }, 3000);
      return;
    }

    // Attaque du boss
    setTimeout(() => {
      bossAttack();
    }, 1000);
  };

  const bossAttack = () => {
    const playerStats = getPlayerStats();
    const damage = Math.max(
      1,
      currentBoss.attack - Math.floor(playerStats.défense / 2)
    );
    const dodge = Math.random() * 100 < (playerStats.esquive || 0) * 2;

    if (dodge) {
      setDungeonLog((prev) => [
        ...prev,
        `🌟 Vous esquivez l'attaque puissante !`,
      ]);
      return;
    }

    const newPlayerHp = Math.max(0, playerHp - damage);
    setPlayerHp(newPlayerHp);
    setDungeonLog((prev) => [
      ...prev,
      `💥 ${currentBoss.name} vous frappe pour ${damage} dégâts !`,
    ]);

    if (newPlayerHp <= 0) {
      // Défaite
      setDungeonLog((prev) => [
        ...prev,
        `💀 Défaite... Le donjon vous expulse !`,
      ]);
      setTimeout(() => {
        setIsInDungeon(false);
        setCurrentBoss(null);
        setDungeonLog([]);
      }, 2000);
    }
  };
  const closeMythicModal = () => {
    setFoundMythic(null);
    setDungeonLog([]);
  };
  const startCombat = (enemyIndex) => {
    const enemy = { ...ENEMIES[enemyIndex] };
    // Augmente la difficulté selon le niveau du joueur
    enemy.hp = Math.floor(enemy.baseHp * (1 + (playerLevel - 1) * 0.3));
    enemy.attack = Math.floor(enemy.baseAttack * (1 + (playerLevel - 1) * 0.2));
    enemy.goldReward = Math.floor(
      enemy.baseGold * (1 + (playerLevel - 1) * 0.5)
    );
    enemy.maxHp = enemy.hp; // Pour la barre de vie

    setCurrentEnemy(enemy);
    setEnemyHp(enemy.hp);
    setIsInCombat(true);
    setCombatLog([
      `🥊 Combat contre ${enemy.emoji} ${enemy.name} niveau ${playerLevel} !`,
    ]);
  };
  const playerAttack = () => {
    const playerStats = getPlayerStats();
    let damage = Math.floor(Math.random() * 10) + playerStats.attaque;

    // Appliquer les effets des passifs
    const berserkerRage = passiveAbilities.find(
      (p) => p.name === "Rage du Berserker"
    );
    if (berserkerRage && playerHp < maxPlayerHp * 0.5) {
      damage = Math.floor(damage * 1.5); // +50% de dégâts si PV < 50%
      setCombatLog((prev) => [...prev, `😤 Rage du Berserker activée !`]);
    }

    const luckyStrike = passiveAbilities.find(
      (p) => p.name === "Frappe Chanceuse"
    );
    const isLuckyStrike = luckyStrike && Math.random() * 100 < 5;

    const isCritical = Math.random() * 100 < (playerStats.critique || 0) * 2;

    let finalDamage = damage;

    if (isLuckyStrike) {
      finalDamage = Math.floor(damage * 3); // x3 pour frappe chanceuse
      setCombatLog((prev) => [
        ...prev,
        `🍀 Frappe Chanceuse ! Dégâts triplés !`,
      ]);
    } else if (isCritical) {
      finalDamage = Math.floor(damage * 1.5);
    }

    // Ajouter les dégâts du compagnon actif (système équilibré)
    if (activeCompanion && companionHp > 0) {
      const companionDamage = Math.floor(
        (Math.floor(Math.random() * 5) + activeCompanion.attack) *
          GameBalance.BASE_CONFIG.COMPANION_DAMAGE_BONUS
      );
      finalDamage += companionDamage;
      setCombatLog((prev) => [
        ...prev,
        `${activeCompanion.emoji} ${activeCompanion.name} aide (+${companionDamage} dégâts) !`,
      ]);
    }

    // Gestion des streaks de victoires
    const currentTime = Date.now();
    if (currentTime - lastVictoryTime < 30000) {
      // Moins de 30 secondes
      setStreakCount((prev) => prev + 1);
      if (streakCount > 0 && streakCount % 5 === 0) {
        const streakBonus = Math.floor(finalDamage * 0.1 * (streakCount / 5));
        finalDamage += streakBonus;
        setCombatLog((prev) => [
          ...prev,
          `🔥 Combo x${streakCount} ! +${streakBonus} dégâts bonus !`,
        ]);
      }
    } else {
      setStreakCount(1);
    }

    const newEnemyHp = Math.max(0, enemyHp - finalDamage);
    setEnemyHp(newEnemyHp);

    let logMessage;
    if (isLuckyStrike) {
      logMessage = `🍀 Frappe Chanceuse ! Vous infligez ${finalDamage} dégâts !`;
    } else if (isCritical) {
      logMessage = `⚔️ Coup critique ! Vous infligez ${finalDamage} dégâts !`;
    } else {
      logMessage = `⚔️ Vous attaquez pour ${finalDamage} dégâts !`;
    }

    setCombatLog((prev) => [...prev, logMessage]);

    // Effet Vol de Vie
    const lifeSteal = passiveAbilities.find((p) => p.name === "Vol de Vie");
    if (lifeSteal) {
      const healAmount = Math.floor(finalDamage * 0.2);
      setPlayerHp((prev) => Math.min(maxPlayerHp, prev + healAmount));
      setCombatLog((prev) => [...prev, `🩸 Vol de Vie : +${healAmount} PV !`]);
    }

    if (newEnemyHp <= 0) {
      handleVictory();
      return;
    }

    // Attaque de l'ennemi
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  };
  const enemyAttack = () => {
    const playerStats = getPlayerStats();

    // Calcul des dégâts avec nouveau système d'équilibrage
    const baseDamage = Math.max(
      1,
      currentEnemy.attack - Math.floor(playerStats.défense / 2)
    );
    let damage = Math.floor(baseDamage * (0.8 + Math.random() * 0.4)); // Variabilité ±20%

    // Vérifier le bouclier magique
    const spellShield = passiveAbilities.find(
      (p) => p.name === "Bouclier Magique"
    );
    const isShielded = spellShield && Math.random() * 100 < 30;

    if (isShielded) {
      setCombatLog((prev) => [
        ...prev,
        `🛡️ Bouclier Magique activé ! Dégâts ignorés !`,
      ]);
      return;
    }

    // Calcul d'esquive amélioré
    const dodgeChance = (playerStats.esquive || 0) * 2.5; // Légèrement réduit
    const dodge = Math.random() * 100 < dodgeChance;

    if (dodge) {
      setCombatLog((prev) => [
        ...prev,
        `🌟 Vous esquivez l'attaque ! (${dodgeChance.toFixed(1)}% chance)`,
      ]);
      return;
    }

    // Protection par compagnon avec système équilibré
    if (activeCompanion && companionHp > 0) {
      const protectionChance =
        GameBalance.BASE_CONFIG.COMPANION_PROTECTION_CHANCE;
      if (Math.random() * 100 < protectionChance) {
        const reducedDamage = Math.floor(damage * 0.7); // Compagnon réduit les dégâts
        const newCompanionHp = Math.max(0, companionHp - reducedDamage);
        setCompanionHp(newCompanionHp);

        setCombatLog((prev) => [
          ...prev,
          `🛡️ ${activeCompanion.emoji} ${activeCompanion.name} intervient ! Dégâts réduits à ${reducedDamage} !`,
        ]);

        if (newCompanionHp <= 0) {
          setCombatLog((prev) => [
            ...prev,
            `💀 ${activeCompanion.name} est KO ! Il a vaillamment protégé son maître !`,
          ]);
          // Bonus de rage temporaire quand compagnon meurt
          setCombatEffects((prev) => [
            ...prev,
            {
              type: "COMPANION_RAGE",
              duration: 3,
              effect: "+25% dégâts",
            },
          ]);
        }
        return;
      }
    }

    // Dégâts au joueur
    const newPlayerHp = Math.max(0, playerHp - damage);
    setPlayerHp(newPlayerHp);

    setCombatLog((prev) => [
      ...prev,
      `💢 ${currentEnemy.name} vous attaque pour ${damage} dégâts !`,
    ]);
    if (newPlayerHp <= 0) {
      handleDefeat();
    }
  };

  // Fonction de gestion de la défaite
  const handleDefeat = () => {
    const goldLoss = Math.floor(
      gold * GameBalance.BASE_CONFIG.DEFEAT_GOLD_LOSS
    );
    setGold((prev) => Math.max(0, prev - goldLoss));

    setCombatLog((prev) => [
      ...prev,
      `💀 Défaite ! Vous perdez ${goldLoss} or...`,
      `🔄 Vous vous réveillez au camp avec 1 PV.`,
    ]); // Réinitialiser les stats de combat
    setPlayerHp(1);
    setIsInCombat(false);
    setCurrentEnemy(null);

    // Réinitialiser les effets de combat
    setCombatEffects([]);
    setStreakCount(1); // Effet visuel de défaite
    setTimeout(() => {
      setCombatLog([]);
    }, 3000);
  }; // Fonction de gestion de la victoire
  const handleVictory = () => {
    const playerStats = getPlayerStats();
    const hasAvarice = passiveAbilities.find((p) => p.name === "Avarice");
    const hasExpBoost = passiveAbilities.find(
      (p) => p.name === "Apprentissage Rapide"
    );

    // Calculer les récompenses avec le système d'équilibrage
    const goldReward = GameBalance.calculateGoldReward(
      currentEnemy.goldReward || currentEnemy.baseGold,
      playerLevel,
      playerStats.luck || 0,
      hasAvarice
    );

    let expReward = currentEnemy.expReward || 10;

    // Appliquer le bonus d'XP si disponible
    if (hasExpBoost) {
      expReward = Math.floor(expReward * 2); // Double XP avec Apprentissage Rapide
    }

    // Appliquer les récompenses
    setGold((prev) => prev + goldReward);

    // Gérer l'expérience et la montée de niveau
    const newTotalExperience = experience + expReward;
    handleLevelUp(newTotalExperience);

    // Mettre à jour les statistiques de jeu
    setGameStats((prev) => ({
      ...prev,
      totalCombats: prev.totalCombats + 1,
      totalVictories: prev.totalVictories + 1,
      totalGoldEarned: prev.totalGoldEarned + goldReward,
    }));

    // Mettre à jour le temps de dernière victoire pour les streaks
    setLastVictoryTime(Date.now());

    setCombatLog((prev) =>
      [
        ...prev,
        `🎉 Victoire ! +${goldReward} or, +${expReward} exp !`,
        hasExpBoost ? `📚 Apprentissage Rapide : XP doublée !` : null,
      ].filter(Boolean)
    );

    // Combat individuel terminé
    setIsInCombat(false);
    setCurrentEnemy(null);

    // Réinitialiser les effets de combat après victoire
    setTimeout(() => {
      setCombatEffects([]);
    }, 2000);

    // Chance de drop de ticket de donjon
    const ticketChance = 5; // 5% de chance de base
    const luckBonus = (playerStats.luck || 0) * 0.8; // 0.8% par point de luck
    const totalTicketChance = ticketChance + luckBonus;

    if (Math.random() * 100 < totalTicketChance) {
      setDungeonTickets((prev) => prev + 1);
      setCombatLog((prev) => [
        ...prev,
        `🎫 Un ticket de donjon trouvé ! (${dungeonTickets + 1} au total)`,
      ]);
    } // Chance de drop d'équipement (améliorée)
    const dropChance = currentEnemy.isElite ? 15 : 8; // Élites ont plus de chance
    const equipmentLuckBonus = (playerStats.luck || 0) * 0.5;

    if (Math.random() * 100 < dropChance + equipmentLuckBonus) {
      // Utiliser le système d'équilibrage pour déterminer la rareté
      const rareDropChance = GameBalance.BASE_CONFIG.DROP_RATES;
      let rarity = "COMMON";

      const roll = Math.random() * 100;
      if (roll < rareDropChance.MYTHIC) {
        rarity = "MYTHIC";
      } else if (roll < rareDropChance.LEGENDARY) {
        rarity = "LEGENDARY";
      } else if (roll < rareDropChance.EPIC) {
        rarity = "EPIC";
      } else if (roll < rareDropChance.RARE) {
        rarity = "RARE";
      }

      // Générer équipement avec la rareté déterminée
      const equipment = generateRandomEquipment(rarity);
      onEquipmentFound(equipment);

      setCombatLog((prev) => [
        ...prev,
        `✨ Vous trouvez un équipement ${equipment.rarity.name} : ${equipment.name} !`,
      ]);
    }
  };

  const heal = () => {
    const healCost = 30;
    if (gold < healCost) {
      alert("Pas assez d'or pour se soigner !");
      return;
    }

    setGold((prev) => prev - healCost);
    setPlayerHp(maxPlayerHp);
    setCombatLog((prev) => [...prev, `💚 Vous vous soignez complètement !`]);
  };

  const playerStats = getPlayerStats();
  return (
    <div className="combat-container combat-modal-content">
      {" "}
      {/* Onglets */}
      <div className="combat-tabs">
        <button
          className={`combat-tab ${activeTab === "combat" ? "active" : ""}`}
          onClick={() => setActiveTab("combat")}
        >
          ⚔️ Combat
        </button>
        <button
          className={`combat-tab ${activeTab === "dungeon" ? "active" : ""}`}
          onClick={() => setActiveTab("dungeon")}
        >
          🏰 Donjons Mythiques
        </button>
      </div>
      {/* Contenu des onglets */}
      {activeTab === "combat" && (
        <div className="combat-tab-content">
          {" "}
          {/* Stats du joueur */}
          <div className="player-stats">
            <h3>🧙‍♂️ Vos Stats (Niveau {playerLevel})</h3>
            {/* Barre d'expérience */}
            <div className="experience-section">
              <div className="experience-info">
                <span>
                  ⭐ Expérience: {experience} /{" "}
                  {getExperienceForLevel(playerLevel + 1)}
                </span>
                <span>Niveau suivant: {playerLevel + 1}</span>
              </div>
              <div className="experience-bar">
                <div
                  className="experience-progress"
                  style={{
                    width: `${
                      (experience / getExperienceForLevel(playerLevel + 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="stats-display">
              <div className="stat">
                ❤️ Vie: {playerHp}/{maxPlayerHp}
              </div>
              <div className="stat">⚔️ Attaque: {playerStats.attaque}</div>
              <div className="stat">🛡️ Défense: {playerStats.défense}</div>
              {playerStats.critique && (
                <div className="stat">💥 Critique: {playerStats.critique}</div>
              )}
              {playerStats.esquive && (
                <div className="stat">🌟 Esquive: {playerStats.esquive}</div>
              )}
              {playerStats.luck && (
                <div className="stat">🍀 Luck: {playerStats.luck}</div>
              )}
            </div>{" "}
            <button
              className="heal-button"
              onClick={heal}
              disabled={playerHp === maxPlayerHp || gold < 30}
            >
              {" "}
              💚 Se soigner (30 or)
            </button>
          </div>
          {/* Tickets de donjon */}
          <div className="tickets-section">
            <h3>🎫 Tickets de Donjon</h3>
            <p>
              Battez des monstres pour obtenir des tickets permettant d'accéder
              aux donjons !
            </p>
            <div className="tickets-display">
              <span className="tickets-count">
                🎫 Tickets possédés : <strong>{dungeonTickets}</strong>
              </span>
              <div className="ticket-info">
                <small>
                  🍀 Votre luck ({playerStats.luck || 0}) augmente les chances
                  de drop
                </small>
              </div>
            </div>
          </div>
          {!isInCombat ? (
            <div className="enemy-selection">
              <h3>🎯 Zones d'exploration :</h3>
              <div className="zones-container">
                {Object.entries(getEnemiesByZone()).map(
                  ([zoneName, enemies]) => (
                    <div key={zoneName} className="zone-section">
                      <h4 className="zone-title">🗺️ {zoneName}</h4>
                      <div className="enemies-list">
                        {enemies.map((enemy, index) => {
                          const globalIndex = ENEMIES.findIndex(
                            (e) => e.name === enemy.name
                          );
                          const scaledHp = Math.floor(
                            enemy.baseHp * (1 + (playerLevel - 1) * 0.3)
                          );
                          const scaledAttack = Math.floor(
                            enemy.baseAttack * (1 + (playerLevel - 1) * 0.2)
                          );
                          const scaledGold = Math.floor(
                            enemy.baseGold * (1 + (playerLevel - 1) * 0.5)
                          );

                          return (
                            <div key={index} className="enemy-list-item">
                              <div className="enemy-info-compact">
                                <span className="enemy-emoji">
                                  {enemy.emoji}
                                </span>
                                <div className="enemy-details-list">
                                  <div className="enemy-name-row">
                                    <strong>{enemy.name}</strong>
                                    {enemy.isElite && (
                                      <span className="elite-badge">
                                        ⭐ Élite
                                      </span>
                                    )}
                                  </div>
                                  <div className="enemy-description">
                                    {enemy.description}
                                  </div>
                                  <div className="enemy-stats-compact">
                                    <span>❤️ {scaledHp}</span>
                                    <span>⚔️ {scaledAttack}</span>
                                    <span>💰 {scaledGold}</span>
                                    <span>⭐ {enemy.expReward} exp</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                className="fight-button-compact"
                                onClick={() => startCombat(globalIndex)}
                                disabled={playerHp <= 0}
                              >
                                ⚔️ Combattre
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Aperçu des ennemis non débloqués dans cette zone */}
                      {ENEMIES.filter(
                        (e) =>
                          e.zone === zoneName && e.unlockLevel > playerLevel
                      ).length > 0 && (
                        <div className="locked-enemies-preview">
                          <h5>🔒 À débloquer :</h5>
                          {ENEMIES.filter(
                            (e) =>
                              e.zone === zoneName && e.unlockLevel > playerLevel
                          )
                            .slice(0, 3)
                            .map((enemy, idx) => (
                              <div key={idx} className="locked-enemy-item">
                                <span className="enemy-emoji-locked">
                                  {enemy.emoji}
                                </span>
                                <span className="enemy-name-locked">
                                  {enemy.name}
                                </span>
                                <span className="unlock-level">
                                  Niv. {enemy.unlockLevel}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="combat-arena">
              <div className="combat-display">
                <div className="player-combat">
                  <div className="combat-character">🧙‍♂️</div>
                  <div className="hp-bar">
                    <div
                      className="hp-fill player-hp"
                      style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
                    ></div>
                  </div>
                  <div>
                    ❤️ {playerHp}/{maxPlayerHp}
                  </div>
                </div>
                <div className="vs">VS</div>{" "}
                <div className="enemy-combat">
                  <div className="combat-character">{currentEnemy.emoji}</div>
                  <div className="hp-bar">
                    <div
                      className="hp-fill enemy-hp"
                      style={{
                        width: `${
                          (enemyHp / (currentEnemy.maxHp || currentEnemy.hp)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div>
                    ❤️ {enemyHp}/{currentEnemy.maxHp || currentEnemy.hp}
                  </div>
                </div>
              </div>

              <button
                className="attack-button"
                onClick={playerAttack}
                disabled={playerHp <= 0 || enemyHp <= 0}
              >
                ⚔️ Attaquer
              </button>

              <div className="combat-log">
                {combatLog.map((log, index) => (
                  <div key={index} className="log-entry">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === "dungeon" && (
        <div className="dungeon-tab-content">
          {" "}
          <div className="dungeon-info">
            <p>🎫 Donjons normaux : Nécessitent 1 ticket de donjon</p>
            <p>👑 Boss ultimes : Coûtent de l'or (500-800)</p>
            <p>✨ Chance d'obtenir des équipements MYTHIQUES !</p>
            <p>🍀 Votre luck augmente les chances de drop !</p>
            <div className="current-tickets">
              <strong>🎫 Tickets possédés : {dungeonTickets}</strong>
            </div>
          </div>{" "}
          {!isInDungeon ? (
            <div className="boss-selection">
              <h3>🏰 Donjons Disponibles :</h3>
              <div className="dungeons-list">
                {" "}
                {getUnlockedDungeons().map((boss, index) => {
                  const luckBonus = (playerStats.luck || 0) * 2;
                  const globalIndex = DUNGEON_ENEMIES.findIndex(
                    (b) => b.name === boss.name
                  );

                  // Déterminer le coût et les conditions
                  let costInfo, canEnter;
                  if (boss.isUltraBoss) {
                    const entryCost = boss.entryCost || 500;
                    costInfo = `💰 ${entryCost} or`;
                    canEnter = gold >= entryCost;
                  } else {
                    costInfo = `🎫 1 ticket`;
                    canEnter = dungeonTickets >= 1;
                  }

                  let dropInfo;
                  if (boss.isUltraBoss) {
                    const transcendentChance =
                      boss.transcendentChance + (playerStats.luck || 0) * 0.5;
                    const celestialChance =
                      boss.celestialChance + (playerStats.luck || 0) * 0.5;
                    dropInfo = `🌟 ${transcendentChance.toFixed(
                      1
                    )}% Transcendant | ✨ ${celestialChance.toFixed(
                      1
                    )}% Céleste`;
                  } else {
                    const totalChance = boss.mythicChance + luckBonus;
                    dropInfo = `✨ ${totalChance.toFixed(1)}% Mythique`;
                  }

                  return (
                    <div
                      key={index}
                      className={`dungeon-list-item ${
                        boss.isUltraBoss ? "ultra-boss-item" : ""
                      }`}
                    >
                      <div className="dungeon-info-compact">
                        <div className="dungeon-header">
                          <span className="boss-emoji-large">{boss.emoji}</span>
                          <div className="dungeon-main-info">
                            <div className="dungeon-name-row">
                              <strong>{boss.name}</strong>
                              {boss.isUltraBoss && (
                                <span className="ultra-badge">👑 ULTIME</span>
                              )}
                            </div>
                            <div className="dungeon-zone">📍 {boss.zone}</div>
                            <div className="dungeon-description">
                              {boss.description}
                            </div>
                          </div>
                        </div>

                        <div className="dungeon-stats-grid">
                          <div className="stat-group">
                            <div className="stat-item">❤️ {boss.hp} PV</div>
                            <div className="stat-item">
                              ⚔️ {boss.attack} Attaque
                            </div>
                          </div>
                          <div className="stat-group">
                            <div className="stat-item">
                              💰 {boss.goldReward} or
                            </div>
                            <div className="stat-item">
                              ⭐ {boss.expReward} exp
                            </div>
                          </div>{" "}
                          <div className="stat-group">
                            <div className="stat-item">{costInfo}</div>
                            <div className="drop-info-compact">{dropInfo}</div>
                          </div>
                        </div>
                      </div>

                      <button
                        className={`challenge-button-compact ${
                          boss.isUltraBoss ? "ultra-challenge" : ""
                        }`}
                        onClick={() => startDungeon(globalIndex)}
                        disabled={!canEnter}
                      >
                        {boss.isUltraBoss ? "👑 Défier l'Ultime" : "🏰 Entrer"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Donjons verrouillés */}
              {DUNGEON_ENEMIES.filter((d) => d.unlockLevel > playerLevel)
                .length > 0 && (
                <div className="locked-dungeons">
                  <h4>🔒 Donjons à débloquer :</h4>
                  <div className="locked-dungeons-list">
                    {DUNGEON_ENEMIES.filter(
                      (d) => d.unlockLevel > playerLevel
                    ).map((boss, idx) => (
                      <div key={idx} className="locked-dungeon-item">
                        <span className="boss-emoji-locked">{boss.emoji}</span>
                        <div className="locked-dungeon-info">
                          <strong>{boss.name}</strong>
                          <div>{boss.zone}</div>
                          <div className="unlock-requirement">
                            Niveau {boss.unlockLevel} requis
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="dungeon-arena">
              <div className="boss-battle">
                <div className="battle-display">
                  <div className="player-battle">
                    <div className="battle-character">🧙‍♂️</div>
                    <div className="hp-bar">
                      <div
                        className="hp-fill player-hp"
                        style={{
                          width: `${(playerHp / playerStats.vie) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div>
                      ❤️ {playerHp}/{playerStats.vie}
                    </div>
                  </div>

                  <div className="vs-boss">⚡ VS ⚡</div>

                  <div className="boss-battle-display">
                    <div className="battle-character boss-char">
                      {currentBoss.emoji}
                    </div>
                    <div className="hp-bar boss-bar">
                      <div
                        className="hp-fill boss-hp"
                        style={{ width: `${(bossHp / currentBoss.hp) * 100}%` }}
                      ></div>
                    </div>
                    <div>
                      ❤️ {bossHp}/{currentBoss.hp}
                    </div>
                  </div>
                </div>

                <button
                  className="boss-attack-button"
                  onClick={playerAttackBoss}
                  disabled={playerHp <= 0 || bossHp <= 0}
                >
                  ⚔️ Attaquer le Boss
                </button>

                <div className="dungeon-log">
                  {dungeonLog.map((log, index) => (
                    <div key={index} className="log-entry">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}{" "}
        </div>
      )}
      {/* Modal pour équipement mythique */}
      {foundMythic && (
        <div className="mythic-modal-overlay" onClick={closeMythicModal}>
          <div className="mythic-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mythic-header">
              <h2>✨ ÉQUIPEMENT MYTHIQUE TROUVÉ ! ✨</h2>
            </div>

            <div className="mythic-item-display">
              <div className="mythic-item-icon">{foundMythic.emoji}</div>
              <h3 style={{ color: foundMythic.rarity.color }}>
                {foundMythic.rarity.emoji} {foundMythic.name}
              </h3>

              <div className="mythic-stats">
                {Object.entries(foundMythic.stats).map(([stat, value]) => (
                  <div key={stat} className="mythic-stat">
                    <span className="stat-name">{stat}:</span>
                    <span className="stat-value">+{value}</span>
                  </div>
                ))}
              </div>

              <div className="mythic-value">
                💰 Valeur: {foundMythic.value} or
              </div>
            </div>

            <button className="close-mythic-button" onClick={closeMythicModal}>
              🎒 Ajouter à l'inventaire
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Combat;
