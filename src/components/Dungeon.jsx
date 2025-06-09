import { useState } from "react";
import "./Dungeon.css";

const DUNGEON_ENEMIES = [
  {
    name: "Gardien Ancien",
    emoji: "🗿",
    hp: 200,
    attack: 40,
    goldReward: 150,
    mythicChance: 2, // 2% de base
  },
  {
    name: "Seigneur des Ombres",
    emoji: "👤",
    hp: 350,
    attack: 60,
    goldReward: 250,
    mythicChance: 5, // 5% de base
  },
  {
    name: "Dragon Ancien",
    emoji: "🐲",
    hp: 500,
    attack: 80,
    goldReward: 400,
    mythicChance: 8, // 8% de base
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

function Dungeon({ equippedItems, gold, setGold, onEquipmentFound }) {
  const [currentBoss, setCurrentBoss] = useState(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(0);
  const [isInDungeon, setIsInDungeon] = useState(false);
  const [dungeonLog, setDungeonLog] = useState([]);
  const [foundMythic, setFoundMythic] = useState(null);

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

    return baseStats;
  };

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

  const startDungeon = (bossIndex) => {
    const entryCost = 100;
    if (gold < entryCost) {
      alert("Il faut 100 or pour entrer dans le donjon !");
      return;
    }

    setGold((prev) => prev - entryCost);
    const boss = { ...DUNGEON_ENEMIES[bossIndex] };
    setCurrentBoss(boss);
    setBossHp(boss.hp);
    setIsInDungeon(true);
    setPlayerHp(getPlayerStats().vie);
    setFoundMythic(null);
    setDungeonLog([
      `🏰 Vous entrez dans le donjon pour affronter ${boss.emoji} ${boss.name} !`,
    ]);
  };

  const playerAttack = () => {
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
      const luckBonus = (playerStats.luck || 0) * 2; // 2% de bonus par point de luck pour les mythiques
      const mythicChance = currentBoss.mythicChance + luckBonus;

      setGold((prev) => prev + currentBoss.goldReward);
      setDungeonLog((prev) => [
        ...prev,
        `🎉 Victoire épique ! +${currentBoss.goldReward} or reçu !`,
      ]);

      // Vérification du drop mythique
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
    const dodge = Math.random() * 100 < (playerStats.esquive || 0) * 2; // Moins de chance d'esquiver contre un boss

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

  const playerStats = getPlayerStats();

  return (
    <div className="dungeon-container">
      <h2>🏰 Donjons Mythiques</h2>

      <div className="dungeon-info">
        <p>💰 Coût d'entrée : 100 or</p>
        <p>✨ Chance d'obtenir des équipements MYTHIQUES !</p>
        <p>🍀 Votre luck augmente les chances de drop !</p>
      </div>

      {!isInDungeon ? (
        <div className="boss-selection">
          <h3>👹 Choisissez votre défi :</h3>
          <div className="bosses-grid">
            {DUNGEON_ENEMIES.map((boss, index) => {
              const luckBonus = (playerStats.luck || 0) * 2;
              const totalChance = boss.mythicChance + luckBonus;

              return (
                <div key={index} className="boss-card">
                  <div className="boss-info">
                    <span className="boss-emoji">{boss.emoji}</span>
                    <div className="boss-details">
                      <strong>{boss.name}</strong>
                      <div>❤️ {boss.hp} PV</div>
                      <div>⚔️ {boss.attack} Attaque</div>
                      <div>💰 {boss.goldReward} or</div>
                      <div className="mythic-chance">
                        ✨ {totalChance.toFixed(1)}% mythique
                        {luckBonus > 0 && (
                          <span className="luck-bonus">
                            {" "}
                            (+{luckBonus.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className="challenge-button"
                    onClick={() => startDungeon(index)}
                    disabled={gold < 100}
                  >
                    🏰 Défier
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
                    style={{ width: `${(playerHp / playerStats.vie) * 100}%` }}
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
              onClick={playerAttack}
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

export default Dungeon;
