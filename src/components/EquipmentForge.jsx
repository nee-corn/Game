import { useState } from "react";
import { GameBalance } from "../utils/GameBalance";
import "./EquipmentForge.css";

// Types de compagnons
const COMPANION_TYPES = {
  WARRIOR: {
    name: "Guerrier",
    emoji: "🛡️",
    baseHp: 80,
    baseAttack: 15,
    passiveAbility: "DEFENSE_BOOST",
    description: "Augmente la défense du joueur",
    cost: 200,
    rarity: "Rare",
  },
  MAGE: {
    name: "Mage",
    emoji: "🔮",
    baseHp: 50,
    baseAttack: 25,
    passiveAbility: "MAGIC_DAMAGE",
    description: "Ajoute des dégâts magiques",
    cost: 250,
    rarity: "Épique",
  },
  ASSASSIN: {
    name: "Assassin",
    emoji: "🗡️",
    baseHp: 60,
    baseAttack: 20,
    passiveAbility: "CRITICAL_BOOST",
    description: "Augmente les chances de critique",
    cost: 300,
    rarity: "Légendaire",
  },
  HEALER: {
    name: "Guérisseur",
    emoji: "💚",
    baseHp: 70,
    baseAttack: 8,
    passiveAbility: "REGENERATION",
    description: "Régénère la vie progressivement",
    cost: 180,
    rarity: "Rare",
  },
  BERSERKER: {
    name: "Berserker",
    emoji: "🔥",
    baseHp: 90,
    baseAttack: 30,
    passiveAbility: "RAGE_MODE",
    description: "Plus de dégâts quand la vie est faible",
    cost: 400,
    rarity: "Mythique",
  },
};

// Capacités passives disponibles
const PASSIVE_ABILITIES = {
  DOUBLE_GOLD: {
    name: "Avarice",
    emoji: "💰",
    description: "Double l'or gagné en combat",
    cost: 150,
    type: "ECONOMIC",
  },
  LIFE_STEAL: {
    name: "Vol de Vie",
    emoji: "🩸",
    description: "Récupère 20% des dégâts infligés en PV",
    cost: 200,
    type: "COMBAT",
  },
  LUCKY_STRIKE: {
    name: "Frappe Chanceuse",
    emoji: "🍀",
    description: "5% de chance d'infliger 3x les dégâts",
    cost: 250,
    type: "COMBAT",
  },
  EXPERIENCE_BOOST: {
    name: "Apprentissage Rapide",
    emoji: "📚",
    description: "Double les chances de monter de niveau",
    cost: 180,
    type: "PROGRESSION",
  },
  SPELL_SHIELD: {
    name: "Bouclier Magique",
    emoji: "🛡️",
    description: "30% de chance d'ignorer les dégâts",
    cost: 300,
    type: "DEFENSE",
  },
  BERSERKER_RAGE: {
    name: "Rage du Berserker",
    emoji: "😤",
    description: "Plus de dégâts quand PV < 50%",
    cost: 220,
    type: "COMBAT",
  },
};

// Configuration des raretés équilibrées
const RARITIES = {
  COMMON: {
    name: "Commun",
    color: "#808080",
    chance: 45, // Réduit de 50%
    statMultiplier: 1,
    cost: 10,
    emoji: "⚪",
  },
  RARE: {
    name: "Rare",
    color: "#0066ff",
    chance: 30, // Identique
    statMultiplier: 1.6,
    cost: 30,
    emoji: "🔵",
  },
  EPIC: {
    name: "Épique",
    color: "#9900ff",
    chance: 20, // Augmenté de 15%
    statMultiplier: 2.4,
    cost: 60,
    emoji: "🟣",
  },
  LEGENDARY: {
    name: "Légendaire",
    color: "#ff6600",
    chance: 4.5, // Réduit de 5%
    statMultiplier: 3.5,
    cost: 120,
    emoji: "🟠",
  },
  MYTHIC: {
    name: "Mythique",
    color: "#ff0080",
    chance: 0.5, // Nouvelle chance minime
    statMultiplier: 5.0,
    cost: 0,
    emoji: "💖",
  },
};

// Types d'équipements
const EQUIPMENT_TYPES = {
  WEAPON: {
    name: "Arme",
    emoji: "⚔️",
    primaryStat: "attaque",
    stats: ["attaque", "critique"],
    bonusStats: ["luck"], // Stats bonus possibles
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

function EquipmentForge({
  onEquipmentForged,
  gold,
  setGold,
  companions,
  setCompanions,
  passiveAbilities,
  setPassiveAbilities,
  onCombatLog,
  playerLevel = 1,
}) {
  const [activeTab, setActiveTab] = useState("forge");
  const [isForging, setIsForging] = useState(false);
  const [lastForgedItem, setLastForgedItem] = useState(null);

  // Calculer le coût de forge dynamique
  const getCurrentForgeCost = () => {
    const currentForgeCount = parseInt(
      localStorage.getItem("forgeCount") || "0"
    );
    return GameBalance.calculateForgeCost(playerLevel, currentForgeCount);
  };

  const determineRarity = () => {
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const [key, rarity] of Object.entries(RARITIES)) {
      cumulative += rarity.chance;
      if (rand <= cumulative) {
        return { key, ...rarity };
      }
    }
    return { key: "COMMON", ...RARITIES.COMMON };
  };
  const generateStats = (equipmentType, rarity) => {
    const stats = {};
    const baseStats = {
      attaque: { min: 5, max: 15 },
      défense: { min: 3, max: 12 },
      vie: { min: 20, max: 50 },
      mana: { min: 10, max: 30 },
      agilité: { min: 2, max: 8 },
      critique: { min: 1, max: 5 },
      esquive: { min: 1, max: 4 },
      luck: { min: 1, max: 3 },
    };

    // Génère les stats de base
    equipmentType.stats.forEach((statName) => {
      const baseStat = baseStats[statName];
      const baseValue =
        Math.floor(Math.random() * (baseStat.max - baseStat.min + 1)) +
        baseStat.min;
      stats[statName] = Math.floor(baseValue * rarity.statMultiplier);
    });

    // Chance d'obtenir des stats bonus (luck) selon la rareté
    const bonusChance = {
      COMMON: 5,
      RARE: 15,
      EPIC: 30,
      LEGENDARY: 50,
      MYTHIC: 100,
    };

    if (
      equipmentType.bonusStats &&
      Math.random() * 100 < bonusChance[rarity.key]
    ) {
      equipmentType.bonusStats.forEach((bonusStat) => {
        if (baseStats[bonusStat] && Math.random() * 100 < 50) {
          // 50% de chance par stat bonus
          const baseStat = baseStats[bonusStat];
          const baseValue =
            Math.floor(Math.random() * (baseStat.max - baseStat.min + 1)) +
            baseStat.min;
          stats[bonusStat] = Math.floor(baseValue * rarity.statMultiplier);
        }
      });
    }

    return stats;
  };
  const calculateValue = (stats, rarity) => {
    const statSum = Object.values(stats).reduce((sum, value) => sum + value, 0);
    return Math.floor(statSum * rarity.statMultiplier * 2);
  };

  // Fonctions pour les compagnons
  const summonCompanion = (companionType) => {
    const companionKey = Object.keys(COMPANION_TYPES).find(
      (key) => COMPANION_TYPES[key].name === companionType
    );

    if (!companionKey) return;

    const companion = COMPANION_TYPES[companionKey];
    const currentCompanions = companions ? companions.length : 0;

    // Coût dynamique basé sur le nombre de compagnons
    const companionIndex = Object.keys(COMPANION_TYPES).indexOf(companionKey);
    const dynamicCost = GameBalance.calculateCompanionCost(
      companionIndex,
      currentCompanions
    );

    if (gold < dynamicCost) {
      alert(
        `Il faut ${dynamicCost} or pour invoquer ce compagnon ! (Coût augmente avec le nombre de compagnons)`
      );
      return;
    }

    // Limite de compagnons
    if (currentCompanions >= 5) {
      alert("Vous avez atteint la limite de 5 compagnons actifs !");
      return;
    }

    setGold((prev) => prev - dynamicCost);

    const newCompanion = {
      id: Date.now(),
      ...companion,
      level: 1,
      hp: companion.baseHp + Math.floor(Math.random() * 20), // Variabilité
      maxHp: companion.baseHp + Math.floor(Math.random() * 20),
      attack: companion.baseAttack + Math.floor(Math.random() * 10),
      cost: dynamicCost, // Sauvegarder le coût payé
      experience: 0,
      equipment: {
        weapon: null,
        armor: null,
        helmet: null,
        boots: null,
      },
    };

    setCompanions((prev) => [...prev, newCompanion]);
    if (onCombatLog) {
      onCombatLog(
        `🎉 ${companion.emoji} ${companion.name} invoqué pour ${dynamicCost} or !`
      );
    }

    // Achievement check
    if (currentCompanions + 1 === 5) {
      alert(
        "🏆 Achievement débloqué : Maître des Compagnons ! Vous avez 5 compagnons actifs !"
      );
    }
  };

  const learnPassiveAbility = (abilityKey) => {
    const ability = PASSIVE_ABILITIES[abilityKey];

    if (gold < ability.cost) {
      alert(`Il faut ${ability.cost} or pour apprendre cette capacité !`);
      return;
    }

    if (passiveAbilities.find((p) => p.name === ability.name)) {
      alert("Vous possédez déjà cette capacité !");
      return;
    }

    setGold((prev) => prev - ability.cost);
    setPassiveAbilities((prev) => [...prev, ability]);
    if (onCombatLog) {
      onCombatLog(`🌟 Capacité ${ability.emoji} ${ability.name} apprise !`);
    }
  };
  const forgeEquipment = () => {
    const currentForgeCount = parseInt(
      localStorage.getItem("forgeCount") || "0"
    );
    const forgeCost = getCurrentForgeCost();

    if (gold < forgeCost) {
      alert(`Pas assez d'or pour forger ! (Coût: ${forgeCost} or)`);
      return;
    }

    setIsForging(true);
    setGold((prev) => prev - forgeCost);

    // Sauvegarder le compte de forge
    localStorage.setItem("forgeCount", (currentForgeCount + 1).toString());

    setTimeout(() => {
      const rarity = determineRarity();
      const equipmentTypeKey =
        Object.keys(EQUIPMENT_TYPES)[
          Math.floor(Math.random() * Object.keys(EQUIPMENT_TYPES).length)
        ];
      const equipmentType = EQUIPMENT_TYPES[equipmentTypeKey];

      // Utiliser le nouveau système de génération équilibré
      const stats = GameBalance.generateBalancedStats(
        equipmentType,
        rarity.key,
        playerLevel
      );
      const value = calculateValue(stats, rarity);

      const newEquipment = {
        id: Date.now(),
        name: `${rarity.name} ${equipmentType.name}`,
        type: equipmentType,
        rarity,
        stats,
        value,
        emoji: equipmentType.emoji,
        level: playerLevel, // Marquer le niveau de création
        forgeBonus:
          currentForgeCount > 50 ? Math.floor(currentForgeCount / 50) : 0,
      };
      setLastForgedItem(newEquipment);
      onEquipmentForged(newEquipment);
      setIsForging(false);

      // Notification d'amélioration
      if (currentForgeCount > 0 && currentForgeCount % 10 === 0) {
        alert(
          `🎉 Forge Maître ! Vous avez forgé ${currentForgeCount} objets ! Coût légèrement augmenté.`
        );
      }
    }, 2000);
  };

  return (
    <div className="equipment-forge">
      <h2>🔥 Forge & Invocations</h2>

      {/* Onglets */}
      <div className="forge-tabs">
        <button
          className={`forge-tab ${activeTab === "forge" ? "active" : ""}`}
          onClick={() => setActiveTab("forge")}
        >
          🔨 Forge d'Équipement
        </button>
        <button
          className={`forge-tab ${activeTab === "companions" ? "active" : ""}`}
          onClick={() => setActiveTab("companions")}
        >
          👥 Compagnons
        </button>
        <button
          className={`forge-tab ${activeTab === "passives" ? "active" : ""}`}
          onClick={() => setActiveTab("passives")}
        >
          🌟 Capacités Passives
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "forge" && (
        <div className="forge-tab-content">
          <div className="forge-area">
            <div className="forge-button-container">
              {" "}
              <button
                className={`forge-button ${isForging ? "forging" : ""}`}
                onClick={forgeEquipment}
                disabled={isForging || gold < getCurrentForgeCost()}
              >
                {isForging ? (
                  <>
                    <span className="spinner">🔥</span>
                    Forge en cours...
                  </>
                ) : (
                  <>
                    🔨 Forger un équipement
                    <span className="cost">({getCurrentForgeCost()} or)</span>
                  </>
                )}
              </button>
            </div>

            {lastForgedItem && (
              <div className="last-forged">
                <h3>✨ Dernière création :</h3>
                <div
                  className="equipment-card"
                  style={{ borderColor: lastForgedItem.rarity.color }}
                >
                  <div className="equipment-header">
                    <span className="equipment-emoji">
                      {lastForgedItem.emoji}
                    </span>
                    <span className="equipment-name">
                      {lastForgedItem.name}
                    </span>
                    <span
                      className="rarity-badge"
                      style={{ color: lastForgedItem.rarity.color }}
                    >
                      {lastForgedItem.rarity.emoji} {lastForgedItem.rarity.name}
                    </span>
                  </div>

                  <div className="equipment-stats">
                    {Object.entries(lastForgedItem.stats).map(
                      ([stat, value]) => (
                        <div key={stat} className="stat">
                          <span className="stat-name">{stat}:</span>
                          <span className="stat-value">+{value}</span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="equipment-value">
                    💰 Valeur: {lastForgedItem.value} or
                  </div>
                </div>
              </div>
            )}

            <div className="forge-info">
              <h3>📋 Informations de forge</h3>

              {/* Informations sur le coût dynamique */}
              <div className="cost-info">
                <h4>💰 Coût de forge :</h4>
                <div className="cost-breakdown">
                  <div>
                    Coût actuel : <strong>{getCurrentForgeCost()} or</strong>
                  </div>
                  <div className="cost-factors">
                    <small>
                      • Coût de base : 25 or
                      <br />• Bonus niveau : +{Math.floor(playerLevel / 5) *
                        5}{" "}
                      or (tous les 5 niveaux)
                      <br />• Bonus fréquence : +
                      {Math.floor(
                        parseInt(localStorage.getItem("forgeCount") || "0") / 10
                      )}{" "}
                      or (toutes les 10 forges)
                    </small>
                  </div>
                </div>
              </div>

              <div className="rarity-chances">
                <h4>🎲 Chances de rareté :</h4>
                {Object.entries(RARITIES)
                  .filter(([key]) => key !== "MYTHIC")
                  .map(([key, rarity]) => (
                    <div key={key} className="rarity-info">
                      <span
                        className="rarity-name"
                        style={{ color: rarity.color }}
                      >
                        {rarity.emoji} {rarity.name}
                      </span>
                      <span className="rarity-chance">{rarity.chance}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "companions" && (
        <div className="forge-tab-content">
          <div className="companions-section">
            <h3>👥 Invocation de Compagnons</h3>
            <p>Invoquez des compagnons pour vous aider au combat !</p>{" "}
            {/* Compagnons disponibles */}
            <div className="companions-grid">
              {Object.values(COMPANION_TYPES).map((companion, index) => {
                const currentCompanions = companions ? companions.length : 0;
                const dynamicCost = GameBalance.calculateCompanionCost(
                  index,
                  currentCompanions
                );

                return (
                  <div key={index} className="companion-card">
                    <div className="companion-info">
                      <span className="companion-emoji">{companion.emoji}</span>
                      <div className="companion-details">
                        <strong>{companion.name}</strong>
                        <div className="companion-rarity">
                          {companion.rarity}
                        </div>
                        <div>❤️ {companion.baseHp} PV</div>
                        <div>⚔️ {companion.baseAttack} Attaque</div>
                        <div className="companion-ability">
                          {companion.description}
                        </div>
                        <div className="companion-cost">
                          💰 {dynamicCost} or
                          {currentCompanions > 0 && (
                            <span className="cost-increase">
                              (+{dynamicCost - companion.cost} dû aux{" "}
                              {currentCompanions} compagnons)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      className="summon-button"
                      onClick={() => summonCompanion(companion.name)}
                      disabled={gold < dynamicCost}
                    >
                      🔮 Invoquer
                    </button>
                  </div>
                );
              })}
            </div>
            {/* Compagnons possédés */}
            {companions && companions.length > 0 && (
              <div className="owned-companions">
                <h4>📜 Vos Compagnons</h4>
                <div className="companions-list">
                  {companions.map((companion) => (
                    <div key={companion.id} className="owned-companion-card">
                      <span className="companion-emoji">{companion.emoji}</span>
                      <div className="companion-info">
                        <strong>{companion.name}</strong>
                        <div>Niveau {companion.level}</div>
                        <div>
                          ❤️ {companion.hp}/{companion.maxHp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "passives" && (
        <div className="forge-tab-content">
          <div className="passives-section">
            <h3>🌟 Capacités Passives</h3>
            <p>Apprenez des capacités permanentes !</p>

            {/* Capacités disponibles */}
            <div className="passives-grid">
              {Object.entries(PASSIVE_ABILITIES).map(([key, ability]) => {
                const isOwned =
                  passiveAbilities &&
                  passiveAbilities.find((p) => p.name === ability.name);

                return (
                  <div key={key} className="passive-card">
                    <div className="passive-info">
                      <span className="passive-emoji">{ability.emoji}</span>
                      <div className="passive-details">
                        <strong>{ability.name}</strong>
                        <div className="passive-type">{ability.type}</div>
                        <div className="passive-description">
                          {ability.description}
                        </div>
                        <div className="passive-cost">💰 {ability.cost} or</div>
                      </div>
                    </div>
                    <button
                      className="learn-button"
                      onClick={() => learnPassiveAbility(key)}
                      disabled={gold < ability.cost || isOwned}
                    >
                      {isOwned ? "✅ Apprise" : "📚 Apprendre"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Capacités apprises */}
            {passiveAbilities && passiveAbilities.length > 0 && (
              <div className="learned-passives">
                <h4>🎓 Vos Capacités</h4>
                <div className="passives-list">
                  {passiveAbilities.map((ability, index) => (
                    <div key={index} className="learned-passive-card">
                      <span className="passive-emoji">{ability.emoji}</span>
                      <div className="passive-info">
                        <strong>{ability.name}</strong>
                        <div className="passive-description">
                          {ability.description}
                        </div>
                      </div>
                      <span className="passive-status">✅ Active</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EquipmentForge;
