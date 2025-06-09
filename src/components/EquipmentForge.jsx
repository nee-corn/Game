import { useState } from "react";
import "./EquipmentForge.css";

// Configuration des raretés
const RARITIES = {
  COMMON: {
    name: "Commun",
    color: "#808080",
    chance: 50,
    statMultiplier: 1,
    cost: 10,
    emoji: "⚪",
  },
  RARE: {
    name: "Rare",
    color: "#0066ff",
    chance: 30,
    statMultiplier: 1.5,
    cost: 25,
    emoji: "🔵",
  },
  EPIC: {
    name: "Épique",
    color: "#9900ff",
    chance: 15,
    statMultiplier: 2.5,
    cost: 50,
    emoji: "🟣",
  },
  LEGENDARY: {
    name: "Légendaire",
    color: "#ff6600",
    chance: 5,
    statMultiplier: 4,
    cost: 100,
    emoji: "🟠",
  },
};

// Types d'équipements
const EQUIPMENT_TYPES = {
  WEAPON: {
    name: "Arme",
    emoji: "⚔️",
    primaryStat: "attaque",
    stats: ["attaque", "critique"],
  },
  ARMOR: {
    name: "Armure",
    emoji: "🛡️",
    primaryStat: "défense",
    stats: ["défense", "vie"],
  },
  HELMET: {
    name: "Casque",
    emoji: "⛑️",
    primaryStat: "défense",
    stats: ["défense", "mana"],
  },
  BOOTS: {
    name: "Bottes",
    emoji: "👢",
    primaryStat: "agilité",
    stats: ["agilité", "esquive"],
  },
};

function EquipmentForge({ onEquipmentForged, gold, setGold }) {
  const [isForging, setIsForging] = useState(false);
  const [lastForgedItem, setLastForgedItem] = useState(null);

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
    };

    equipmentType.stats.forEach((statName) => {
      const baseStat = baseStats[statName];
      const baseValue =
        Math.floor(Math.random() * (baseStat.max - baseStat.min + 1)) +
        baseStat.min;
      stats[statName] = Math.floor(baseValue * rarity.statMultiplier);
    });

    return stats;
  };

  const calculateValue = (stats, rarity) => {
    const statSum = Object.values(stats).reduce((sum, value) => sum + value, 0);
    return Math.floor(statSum * rarity.statMultiplier * 2);
  };

  const forgeEquipment = () => {
    const forgeCost = 20;

    if (gold < forgeCost) {
      alert("Pas assez d'or pour forger ! (Coût: 20 or)");
      return;
    }

    setIsForging(true);
    setGold((prev) => prev - forgeCost);

    setTimeout(() => {
      const rarity = determineRarity();
      const equipmentTypeKey =
        Object.keys(EQUIPMENT_TYPES)[
          Math.floor(Math.random() * Object.keys(EQUIPMENT_TYPES).length)
        ];
      const equipmentType = EQUIPMENT_TYPES[equipmentTypeKey];

      const stats = generateStats(equipmentType, rarity);
      const value = calculateValue(stats, rarity);

      const newEquipment = {
        id: Date.now(),
        name: `${rarity.name} ${equipmentType.name}`,
        type: equipmentType,
        rarity,
        stats,
        value,
        emoji: equipmentType.emoji,
      };

      setLastForgedItem(newEquipment);
      onEquipmentForged(newEquipment);
      setIsForging(false);
    }, 2000);
  };

  return (
    <div className="equipment-forge">
      <h2>🔥 Forge</h2>

      <div className="forge-area">
        <div className="forge-button-container">
          <button
            className={`forge-button ${isForging ? "forging" : ""}`}
            onClick={forgeEquipment}
            disabled={isForging || gold < 20}
          >
            {isForging ? (
              <>
                <span className="spinner">🔥</span>
                Forge en cours...
              </>
            ) : (
              <>
                🔨 Forger un équipement
                <span className="cost">(20 or)</span>
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
                <span className="equipment-emoji">{lastForgedItem.emoji}</span>
                <span className="equipment-name">{lastForgedItem.name}</span>
                <span
                  className="rarity-badge"
                  style={{ color: lastForgedItem.rarity.color }}
                >
                  {lastForgedItem.rarity.emoji} {lastForgedItem.rarity.name}
                </span>
              </div>

              <div className="equipment-stats">
                {Object.entries(lastForgedItem.stats).map(([stat, value]) => (
                  <div key={stat} className="stat">
                    <span className="stat-name">{stat}:</span>
                    <span className="stat-value">+{value}</span>
                  </div>
                ))}
              </div>

              <div className="equipment-value">
                💰 Valeur: {lastForgedItem.value} or
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rarity-info">
        <h3>📊 Chances de rareté :</h3>
        <div className="rarity-list">
          {Object.entries(RARITIES).map(([key, rarity]) => (
            <div key={key} className="rarity-item">
              <span style={{ color: rarity.color }}>
                {rarity.emoji} {rarity.name}
              </span>
              <span className="rarity-chance">{rarity.chance}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EquipmentForge;
