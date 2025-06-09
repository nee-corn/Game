import { useState, useEffect } from "react";
import "./Combat.css";

const ENEMIES = [
  { name: "Gobelin", emoji: "👹", hp: 30, attack: 8, goldReward: 15, level: 1 },
  { name: "Orc", emoji: "🧌", hp: 50, attack: 12, goldReward: 25, level: 2 },
  { name: "Troll", emoji: "👺", hp: 80, attack: 18, goldReward: 40, level: 3 },
  {
    name: "Dragon",
    emoji: "🐉",
    hp: 120,
    attack: 25,
    goldReward: 60,
    level: 4,
  },
  {
    name: "Démon",
    emoji: "😈",
    hp: 180,
    attack: 35,
    goldReward: 100,
    level: 5,
  },
];

function Combat({ equippedItems, gold, setGold }) {
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(0);
  const [isInCombat, setIsInCombat] = useState(false);
  const [combatLog, setCombatLog] = useState([]);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [maxPlayerHp, setMaxPlayerHp] = useState(100);

  const getPlayerStats = () => {
    const baseStats = {
      attaque: 10,
      défense: 5,
      vie: 100,
      luck: 0,
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

  useEffect(() => {
    const playerStats = getPlayerStats();
    const newMaxHp = playerStats.vie;
    setMaxPlayerHp(newMaxHp);
    if (playerHp > newMaxHp) {
      setPlayerHp(newMaxHp);
    }
  }, [equippedItems]);

  const startCombat = (enemyIndex) => {
    const enemy = { ...ENEMIES[enemyIndex] };
    // Augmente la difficulté selon le niveau du joueur
    enemy.hp = Math.floor(enemy.hp * (1 + (playerLevel - 1) * 0.3));
    enemy.attack = Math.floor(enemy.attack * (1 + (playerLevel - 1) * 0.2));
    enemy.goldReward = Math.floor(
      enemy.goldReward * (1 + (playerLevel - 1) * 0.5)
    );

    setCurrentEnemy(enemy);
    setEnemyHp(enemy.hp);
    setIsInCombat(true);
    setCombatLog([
      `🥊 Combat contre ${enemy.emoji} ${enemy.name} niveau ${playerLevel} !`,
    ]);
  };

  const playerAttack = () => {
    const playerStats = getPlayerStats();
    const damage = Math.floor(Math.random() * 10) + playerStats.attaque;
    const isCritical = Math.random() * 100 < (playerStats.critique || 0) * 2;
    const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage;

    const newEnemyHp = Math.max(0, enemyHp - finalDamage);
    setEnemyHp(newEnemyHp);

    const logMessage = isCritical
      ? `⚔️ Coup critique ! Vous infligez ${finalDamage} dégâts !`
      : `⚔️ Vous attaquez pour ${finalDamage} dégâts !`;

    setCombatLog((prev) => [...prev, logMessage]);

    if (newEnemyHp <= 0) {
      // Victoire
      const playerStats = getPlayerStats();
      const luckBonus = (playerStats.luck || 0) * 5; // 5% de bonus par point de luck
      const goldGained = Math.floor(
        currentEnemy.goldReward * (1 + luckBonus / 100)
      );

      setGold((prev) => prev + goldGained);
      setCombatLog((prev) => [
        ...prev,
        `🎉 Victoire ! +${goldGained} or reçu !`,
      ]);

      // Chance de level up
      if (Math.random() * 100 < 20) {
        setPlayerLevel((prev) => prev + 1);
        setCombatLog((prev) => [
          ...prev,
          `📈 Niveau augmenté ! Niveau ${playerLevel + 1}`,
        ]);
      }

      setTimeout(() => {
        setIsInCombat(false);
        setCurrentEnemy(null);
        setCombatLog([]);
      }, 2000);
      return;
    }

    // Attaque de l'ennemi
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  };

  const enemyAttack = () => {
    const playerStats = getPlayerStats();
    const damage = Math.max(
      1,
      currentEnemy.attack - Math.floor(playerStats.défense / 2)
    );
    const dodge = Math.random() * 100 < (playerStats.esquive || 0) * 3;

    if (dodge) {
      setCombatLog((prev) => [...prev, `🌟 Vous esquivez l'attaque !`]);
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
        setIsInCombat(false);
        setCurrentEnemy(null);
        setPlayerHp(maxPlayerHp);
        setCombatLog([]);
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
    <div className="combat-container">
      <h2>⚔️ Zone de Combat</h2>

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
        </div>

        <button
          className="heal-button"
          onClick={heal}
          disabled={playerHp === maxPlayerHp || gold < 30}
        >
          💚 Se soigner (30 or)
        </button>
      </div>

      {!isInCombat ? (
        <div className="enemy-selection">
          <h3>🎯 Choisissez votre adversaire :</h3>
          <div className="enemies-grid">
            {ENEMIES.map((enemy, index) => (
              <div key={index} className="enemy-card">
                <div className="enemy-info">
                  <span className="enemy-emoji">{enemy.emoji}</span>
                  <div className="enemy-details">
                    <strong>{enemy.name}</strong>
                    <div>
                      ❤️ {Math.floor(enemy.hp * (1 + (playerLevel - 1) * 0.3))}
                    </div>
                    <div>
                      ⚔️{" "}
                      {Math.floor(enemy.attack * (1 + (playerLevel - 1) * 0.2))}
                    </div>
                    <div>
                      💰{" "}
                      {Math.floor(
                        enemy.goldReward * (1 + (playerLevel - 1) * 0.5)
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

            <div className="vs">VS</div>

            <div className="enemy-combat">
              <div className="combat-character">{currentEnemy.emoji}</div>
              <div className="hp-bar">
                <div
                  className="hp-fill enemy-hp"
                  style={{ width: `${(enemyHp / currentEnemy.hp) * 100}%` }}
                ></div>
              </div>
              <div>
                ❤️ {enemyHp}/{currentEnemy.hp}
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
  );
}

export default Combat;
