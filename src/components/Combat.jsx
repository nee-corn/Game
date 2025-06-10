import { useState, useEffect } from "react";
import "./Combat.css";

const ENEMIES = [
  { name: "Gobelin", emoji: "👹", baseHp: 30, baseAttack: 8, baseGold: 15 },
  { name: "Orc", emoji: "🧌", baseHp: 50, baseAttack: 12, baseGold: 25 },
  { name: "Troll", emoji: "👺", baseHp: 80, baseAttack: 18, baseGold: 40 },
  { name: "Dragon", emoji: "🐉", baseHp: 120, baseAttack: 25, baseGold: 60 },
  { name: "Démon", emoji: "😈", baseHp: 180, baseAttack: 35, baseGold: 100 },
  { name: "Spectre", emoji: "👻", baseHp: 45, baseAttack: 15, baseGold: 30 },
  { name: "Squelette", emoji: "💀", baseHp: 35, baseAttack: 10, baseGold: 20 },
  { name: "Vampire", emoji: "🧛", baseHp: 90, baseAttack: 22, baseGold: 50 },
  {
    name: "Sorcier Noir",
    emoji: "🧙‍♂️",
    baseHp: 70,
    baseAttack: 28,
    baseGold: 45,
  },
  { name: "Golem", emoji: "🗿", baseHp: 150, baseAttack: 20, baseGold: 70 },
  { name: "Hydre", emoji: "🐍", baseHp: 110, baseAttack: 30, baseGold: 55 },
  { name: "Phoenix", emoji: "🔥", baseHp: 100, baseAttack: 35, baseGold: 65 },
];

// Données du donjon
const DUNGEON_ENEMIES = [
  {
    name: "Gardien Ancien",
    emoji: "🗿",
    hp: 200,
    attack: 40,
    goldReward: 150,
    mythicChance: 2,
  },
  {
    name: "Seigneur des Ombres",
    emoji: "👤",
    hp: 350,
    attack: 60,
    goldReward: 250,
    mythicChance: 5,
  },
  {
    name: "Dragon Ancien",
    emoji: "🐲",
    hp: 500,
    attack: 80,
    goldReward: 400,
    mythicChance: 8,
  },
  {
    name: "Seigneur du Chaos",
    emoji: "👑",
    hp: 2000,
    attack: 150,
    goldReward: 1000,
    mythicChance: 0, // Pas de mythique, mais équipements ultra-rares
    transcendentChance: 3,
    celestialChance: 1,
    entryCost: 500,
    isUltraBoss: true,
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
}) {
  // État des onglets
  const [activeTab, setActiveTab] = useState("combat");
  // États du combat normal
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(0);
  const [isInCombat, setIsInCombat] = useState(false);
  const [combatLog, setCombatLog] = useState([]);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [maxPlayerHp, setMaxPlayerHp] = useState(100);
  const [experience, setExperience] = useState(0);

  // États du système de vagues
  const [waveNumber, setWaveNumber] = useState(1);
  const [totalKills, setTotalKills] = useState(0);
  const [isInWaveMode, setIsInWaveMode] = useState(false);
  const [waveProgress, setWaveProgress] = useState(0);
  const [enemiesPerWave] = useState(5); // 5 ennemis par vague

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
  }, [activeCompanion, isInCombat, maxPlayerHp]);
  // Fonctions du donjon
  const startDungeon = (bossIndex) => {
    const boss = { ...DUNGEON_ENEMIES[bossIndex] };
    const entryCost = boss.entryCost || 100;

    if (gold < entryCost) {
      alert(`Il faut ${entryCost} or pour entrer dans ce donjon !`);
      return;
    }

    setGold((prev) => prev - entryCost);
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
        `🏰 Vous entrez dans le donjon pour affronter ${boss.emoji} ${boss.name} !`,
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

      setGold((prev) => prev + currentBoss.goldReward);
      setDungeonLog((prev) => [
        ...prev,
        `🎉 Victoire épique ! +${currentBoss.goldReward} or reçu !`,
      ]);

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

  // Fonctions du système de vagues
  const generateRandomEnemy = (waveNumber) => {
    const randomIndex = Math.floor(Math.random() * ENEMIES.length);
    const baseEnemy = { ...ENEMIES[randomIndex] };

    // Scaling basé sur le numéro de vague
    const waveMultiplier = 1 + (waveNumber - 1) * 0.4; // +40% par vague
    const levelMultiplier = 1 + (playerLevel - 1) * 0.2; // +20% par niveau joueur
    const totalMultiplier = waveMultiplier * levelMultiplier;

    return {
      ...baseEnemy,
      hp: Math.floor(baseEnemy.baseHp * totalMultiplier),
      attack: Math.floor(baseEnemy.baseAttack * totalMultiplier),
      goldReward: Math.floor(baseEnemy.baseGold * totalMultiplier),
      maxHp: Math.floor(baseEnemy.baseHp * totalMultiplier), // Pour la barre de vie
    };
  };

  const startWaveMode = () => {
    setIsInWaveMode(true);
    setWaveNumber(1);
    setTotalKills(0);
    setWaveProgress(0);
    setPlayerHp(getPlayerStats().vie);
    setCombatLog([`🌊 Mode Vagues démarré ! Vague 1 commence...`]);

    // Démarre avec le premier ennemi
    const firstEnemy = generateRandomEnemy(1);
    setCurrentEnemy(firstEnemy);
    setEnemyHp(firstEnemy.hp);
    setIsInCombat(true);
  };

  const stopWaveMode = () => {
    setIsInWaveMode(false);
    setIsInCombat(false);
    setCurrentEnemy(null);
    setWaveNumber(1);
    setTotalKills(0);
    setWaveProgress(0);
    setCombatLog([]);
  };

  const nextWaveEnemy = () => {
    const newProgress = waveProgress + 1;
    setWaveProgress(newProgress);
    setTotalKills((prev) => prev + 1);

    if (newProgress >= enemiesPerWave) {
      // Passer à la vague suivante
      const nextWave = waveNumber + 1;
      setWaveNumber(nextWave);
      setWaveProgress(0);
      setCombatLog((prev) => [
        ...prev,
        `🎉 Vague ${waveNumber} terminée ! Vague ${nextWave} commence...`,
      ]);

      // Bonus de vie entre les vagues
      const healAmount = Math.floor(maxPlayerHp * 0.3); // 30% de soin
      setPlayerHp((prev) => Math.min(maxPlayerHp, prev + healAmount));
      setCombatLog((prev) => [
        ...prev,
        `💚 Vous récupérez ${healAmount} PV entre les vagues !`,
      ]);
    }

    // Générer le prochain ennemi
    setTimeout(() => {
      const nextEnemy = generateRandomEnemy(waveNumber);
      setCurrentEnemy(nextEnemy);
      setEnemyHp(nextEnemy.hp);

      if (newProgress < enemiesPerWave) {
        setCombatLog((prev) => [
          ...prev,
          `⚔️ Prochain ennemi : ${nextEnemy.emoji} ${nextEnemy.name} !`,
        ]);
      } else {
        setCombatLog((prev) => [
          ...prev,
          `⚔️ Premier ennemi de la vague ${waveNumber} : ${nextEnemy.emoji} ${nextEnemy.name} !`,
        ]);
      }
    }, 1500);
  };
  const startCombat = (enemyIndex) => {
    if (isInWaveMode) return; // Ne permet pas de démarrer un combat individuel en mode vague

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

    // Ajouter les dégâts du compagnon actif
    if (activeCompanion && companionHp > 0) {
      const companionDamage =
        Math.floor(Math.random() * 5) + activeCompanion.attack;
      finalDamage += companionDamage;
      setCombatLog((prev) => [
        ...prev,
        `${activeCompanion.emoji} ${activeCompanion.name} aide (+${companionDamage} dégâts) !`,
      ]);
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
      // Victoire
      const playerStats = getPlayerStats();
      let luckBonus = (playerStats.luck || 0) * 5; // 5% de bonus par point de luck

      // Appliquer le passif Double Gold
      const doubleGold = passiveAbilities.find((p) => p.name === "Avarice");
      let goldMultiplier = 1;
      if (doubleGold) {
        goldMultiplier = 2;
        setCombatLog((prev) => [...prev, `💰 Avarice activée ! Or doublé !`]);
      }

      const goldGained = Math.floor(
        currentEnemy.goldReward * (1 + luckBonus / 100) * goldMultiplier
      );

      setGold((prev) => prev + goldGained);
      setCombatLog((prev) => [
        ...prev,
        `🎉 Victoire ! +${goldGained} or reçu !`,
      ]);

      // Chance de level up avec bonus d'expérience
      const expBoost = passiveAbilities.find(
        (p) => p.name === "Apprentissage Rapide"
      );
      let levelUpChance = 20;
      if (expBoost) {
        levelUpChance = 40; // Double les chances
        setCombatLog((prev) => [
          ...prev,
          `📚 Apprentissage Rapide : chances de niveau doublées !`,
        ]);
      }

      if (Math.random() * 100 < levelUpChance) {
        setPlayerLevel((prev) => prev + 1);
        setCombatLog((prev) => [
          ...prev,
          `📈 Niveau augmenté ! Niveau ${playerLevel + 1}`,
        ]);
      }

      if (isInWaveMode) {
        // Mode vague : passer à l'ennemi suivant
        nextWaveEnemy();
      } else {
        // Combat individuel : terminer le combat
        setTimeout(() => {
          setIsInCombat(false);
          setCurrentEnemy(null);
          setCombatLog([]);
        }, 2000);
      }
      return;
    }

    // Attaque de l'ennemi
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  };
  const enemyAttack = () => {
    const playerStats = getPlayerStats();
    let damage = Math.max(
      1,
      currentEnemy.attack - Math.floor(playerStats.défense / 2)
    );

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

    const dodge = Math.random() * 100 < (playerStats.esquive || 0) * 3;

    if (dodge) {
      setCombatLog((prev) => [...prev, `🌟 Vous esquivez l'attaque !`]);
      return;
    }

    // Le compagnon peut aussi prendre des dégâts
    if (activeCompanion && companionHp > 0 && Math.random() * 100 < 30) {
      // 30% de chance que le compagnon soit touché à la place
      const newCompanionHp = Math.max(0, companionHp - damage);
      setCompanionHp(newCompanionHp);
      setCombatLog((prev) => [
        ...prev,
        `🛡️ ${activeCompanion.emoji} ${activeCompanion.name} protège et prend ${damage} dégâts !`,
      ]);

      if (newCompanionHp <= 0) {
        setCombatLog((prev) => [
          ...prev,
          `💀 ${activeCompanion.name} est KO !`,
        ]);
      }
      return;
    }

    const newPlayerHp = Math.max(0, playerHp - damage);
    setPlayerHp(newPlayerHp);
    setCombatLog((prev) => [
      ...prev,
      `💢 ${currentEnemy.name} vous attaque pour ${damage} dégâts !`,
    ]);
    if (newPlayerHp <= 0) {
      // Défaite
      setCombatLog((prev) => [
        ...prev,
        `💀 Défaite ! Vous perdez la moitié de votre or...`,
      ]);
      setGold((prev) => Math.floor(prev / 2));

      setTimeout(() => {
        if (isInWaveMode) {
          // En mode vague, arrêter complètement le mode vague
          stopWaveMode();
          setCombatLog((prev) => [
            ...prev,
            `🌊 Mode Vagues terminé ! Vous avez survécu à ${totalKills} ennemis.`,
          ]);
        } else {
          // Combat individuel
          setIsInCombat(false);
          setCurrentEnemy(null);
          setCombatLog([]);
        }
        setPlayerHp(maxPlayerHp);
      }, 2000);
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
          {/* Stats du joueur */}
          <div className="player-stats">
            <h3>🧙‍♂️ Vos Stats (Niveau {playerLevel})</h3>
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
              💚 Se soigner (30 or)
            </button>
          </div>
          {/* Mode Vagues */}
          <div className="wave-mode-section">
            <h3>🌊 Mode Vagues</h3>
            <p>
              Affrontez des ennemis en continu avec une difficulté croissante !
            </p>

            {isInWaveMode && (
              <div className="wave-info">
                <div className="wave-stats">
                  <span>🌊 Vague: {waveNumber}</span>
                  <span>⚔️ Ennemis tués: {totalKills}</span>
                  <span>
                    📊 Progression: {waveProgress}/{enemiesPerWave}
                  </span>
                </div>
                <div className="wave-progress-bar">
                  <div
                    className="wave-progress-fill"
                    style={{
                      width: `${(waveProgress / enemiesPerWave) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div className="wave-controls">
              {!isInWaveMode && !isInCombat ? (
                <button
                  className="start-wave-button"
                  onClick={startWaveMode}
                  disabled={playerHp <= 0}
                >
                  🌊 Démarrer Mode Vagues
                </button>
              ) : isInWaveMode ? (
                <button className="stop-wave-button" onClick={stopWaveMode}>
                  🛑 Arrêter Mode Vagues
                </button>
              ) : null}
            </div>
          </div>{" "}
          {!isInCombat && !isInWaveMode ? (
            <div className="enemy-selection">
              <h3>🎯 Choisissez votre adversaire :</h3>
              <div className="enemies-grid">
                {ENEMIES.map((enemy, index) => (
                  <div key={index} className="enemy-card">
                    <div className="enemy-info">
                      <span className="enemy-emoji">{enemy.emoji}</span>
                      <div className="enemy-details">
                        <strong>{enemy.name}</strong>{" "}
                        <div>
                          ❤️{" "}
                          {Math.floor(
                            enemy.baseHp * (1 + (playerLevel - 1) * 0.3)
                          )}
                        </div>
                        <div>
                          ⚔️{" "}
                          {Math.floor(
                            enemy.baseAttack * (1 + (playerLevel - 1) * 0.2)
                          )}
                        </div>
                        <div>
                          💰{" "}
                          {Math.floor(
                            enemy.baseGold * (1 + (playerLevel - 1) * 0.5)
                          )}{" "}
                          or
                        </div>
                      </div>
                    </div>
                    <button
                      className="fight-button"
                      onClick={() => startCombat(index)}
                      disabled={playerHp <= 0}
                    >
                      ⚔️ Combattre
                    </button>
                  </div>
                ))}
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
          <div className="dungeon-info">
            <p>💰 Coût d'entrée : 100 or</p>
            <p>✨ Chance d'obtenir des équipements MYTHIQUES !</p>
            <p>🍀 Votre luck augmente les chances de drop !</p>
          </div>
          {!isInDungeon ? (
            <div className="boss-selection">
              <h3>👹 Choisissez votre défi :</h3>{" "}
              <div className="bosses-grid">
                {DUNGEON_ENEMIES.map((boss, index) => {
                  const luckBonus = (playerStats.luck || 0) * 2;
                  const entryCost = boss.entryCost || 100;

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
                    dropInfo = `✨ ${totalChance.toFixed(1)}% mythique`;
                  }

                  return (
                    <div
                      key={index}
                      className={`boss-card ${
                        boss.isUltraBoss ? "ultra-boss" : ""
                      }`}
                    >
                      <div className="boss-info">
                        <span className="boss-emoji">{boss.emoji}</span>
                        <div className="boss-details">
                          <strong>{boss.name}</strong>
                          {boss.isUltraBoss && (
                            <div className="ultra-boss-label">
                              👑 BOSS ULTIME
                            </div>
                          )}
                          <div>❤️ {boss.hp} PV</div>
                          <div>⚔️ {boss.attack} Attaque</div>
                          <div>💰 {boss.goldReward} or</div>
                          <div className="drop-chance">
                            {dropInfo}
                            {luckBonus > 0 && !boss.isUltraBoss && (
                              <span className="luck-bonus">
                                {" "}
                                (+{luckBonus.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                          <div className="entry-cost">
                            🎫 Entrée: {entryCost} or
                          </div>
                        </div>
                      </div>
                      <button
                        className="challenge-button"
                        onClick={() => startDungeon(index)}
                        disabled={gold < entryCost}
                      >
                        {boss.isUltraBoss ? "👑 Défier l'Ultime" : "🏰 Défier"}
                      </button>
                    </div>
                  );
                })}
              </div>
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
