import { useState, useEffect } from "react";
import EquipmentForge from "./components/EquipmentForge";
import Inventory from "./components/Inventory";
import Combat from "./components/Combat";
import AchievementsPanel from "./components/AchievementsPanel";
import SettingsModal from "./components/SettingsModal";
import { SaveSystem, useAutoSave } from "./utils/SaveSystem";
import "./styles/variables.css";
import "./components/SaveSystem.css";
import "./components/AccessibilityImprovements.css";
import "./components/CompactLayout.css";
import "./App.css";

function App() {
  // États de jeu initiaux
  const [inventory, setInventory] = useState([]);
  const [equippedItems, setEquippedItems] = useState({});
  const [gold, setGold] = useState(100);
  const [combatInProgress, setCombatInProgress] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [companions, setCompanions] = useState([]);
  const [passiveAbilities, setPassiveAbilities] = useState([]);
  const [dungeonTickets, setDungeonTickets] = useState(0);

  // États pour les statistiques
  const [gameStats, setGameStats] = useState({
    totalCombats: 0,
    totalVictories: 0,
    totalGoldEarned: 0,
    bossesDefeated: 0,
    itemsForged: 0,
    companionsSummoned: 0,
    maxWaveReached: 1,
    playtimeMinutes: 0,
  });

  // États pour les paramètres
  const [gameSettings, setGameSettings] = useState({
    autoSave: true,
    soundEnabled: true,
    animationsEnabled: true,
  });

  // État pour la navigation principale
  const [activeMainTab, setActiveMainTab] = useState("forge");

  // États pour les modales
  const [isLoaded, setIsLoaded] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  // Charger la sauvegarde au démarrage
  useEffect(() => {
    const loadSaveData = async () => {
      const savedData = SaveSystem.loadGame();

      if (savedData) {
        const mergedData = SaveSystem.mergeWithDefaults(savedData);
        setGold(mergedData.gold || 100);
        setInventory(mergedData.inventory || []);
        setEquippedItems(mergedData.equippedItems || {});
        setCompanions(mergedData.companions || []);
        setPassiveAbilities(mergedData.passiveAbilities || []);
        setPlayerLevel(mergedData.playerLevel || 1);
        setExperience(mergedData.experience || 0);
        setDungeonTickets(mergedData.dungeonTickets || 0);
        setGameStats(mergedData.stats || SaveSystem.getDefaultGameData().stats);
        setGameSettings(
          mergedData.settings || SaveSystem.getDefaultGameData().settings
        );

        setShowWelcomeBack(true);
        setTimeout(() => setShowWelcomeBack(false), 3000);
      }

      setIsLoaded(true);
    };

    loadSaveData();
  }, []);

  // Préparer les données pour la sauvegarde
  const gameData = {
    gold,
    inventory,
    equippedItems,
    companions,
    passiveAbilities,
    playerLevel,
    experience,
    dungeonTickets,
    stats: gameStats,
    settings: gameSettings,
  };

  // Utiliser le système de sauvegarde automatique
  const { lastSaveTime, saveStatus, manualSave } = useAutoSave(
    gameData,
    gameSettings.autoSave && isLoaded
  );

  // Fonction pour réclamer les récompenses d'achievements
  const handleRewardClaimed = (reward) => {
    if (reward.gold) {
      setGold((prev) => prev + reward.gold);
    }
    if (reward.masteryPoints) {
      console.log(`Reçu ${reward.masteryPoints} points de maîtrise`);
    }
    if (reward.inventorySlots) {
      console.log(`+${reward.inventorySlots} emplacements d'inventaire`);
    }
    if (reward.unlockPrestige) {
      console.log("Système de prestige débloqué !");
    }
    if (reward.goldMultiplier) {
      console.log(`Multiplicateur d'or: x${reward.goldMultiplier}`);
    }
  };

  // Fonction pour réinitialiser le jeu
  const resetGame = () => {
    if (
      window.confirm(
        "⚠️ Êtes-vous sûr de vouloir recommencer une nouvelle partie ?"
      )
    ) {
      SaveSystem.deleteSave();
      const defaultData = SaveSystem.getDefaultGameData();
      setGold(defaultData.gold);
      setInventory(defaultData.inventory);
      setEquippedItems(defaultData.equippedItems);
      setCompanions(defaultData.companions);
      setPassiveAbilities(defaultData.passiveAbilities);
      setPlayerLevel(defaultData.playerLevel);
      setExperience(defaultData.experience);
      setGameStats(defaultData.stats);
      setGameSettings(defaultData.settings);
    }
  };

  // Sauvegarde avant fermeture
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoaded) {
        SaveSystem.saveGame(gameData);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [gameData, isLoaded]);

  // Screen de chargement
  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1>🔨 MiniEquip</h1>
          <div className="loading-spinner">⚙️</div>
          <p>Chargement de votre aventure...</p>
        </div>
      </div>
    );
  }

  // Fonctions d'inventaire
  const addToInventory = (equipment) => {
    setInventory((prev) => [...prev, equipment]);
  };

  const sellItem = (item, isEquipped = false) => {
    const sellPrice = Math.floor(item.value * 0.7);
    setGold((prev) => prev + sellPrice);

    if (isEquipped) {
      if (item.companionId) {
        setCompanions((prev) =>
          prev.map((c) => {
            if (c.id === item.companionId) {
              const newEquipment = { ...c.equipment };
              delete newEquipment[item.slotType];
              return { ...c, equipment: newEquipment };
            }
            return c;
          })
        );
      } else {
        setEquippedItems((prev) => {
          const newEquipped = { ...prev };
          delete newEquipped[item.type.name];
          return newEquipped;
        });
      }
    } else {
      setInventory((prev) => prev.filter((invItem) => invItem.id !== item.id));
    }
  };

  const equipItem = (item) => {
    setInventory((prev) => prev.filter((invItem) => invItem.id !== item.id));

    if (equippedItems[item.type.name]) {
      setInventory((prev) => [...prev, equippedItems[item.type.name]]);
    }

    setEquippedItems((prev) => ({
      ...prev,
      [item.type.name]: item,
    }));
  };

  const unequipItem = (item) => {
    setEquippedItems((prev) => {
      const newEquipped = { ...prev };
      delete newEquipped[item.type.name];
      return newEquipped;
    });

    setInventory((prev) => [...prev, item]);
  };

  const equipToCompanion = (item, companionId) => {
    const companion = companions.find((c) => c.id === companionId);
    if (!companion) return;

    const slotType = getSlotTypeFromItem(item);
    setInventory((prev) => prev.filter((invItem) => invItem.id !== item.id));

    setCompanions((prev) =>
      prev.map((c) => {
        if (c.id === companionId) {
          const newEquipment = { ...c.equipment };
          if (newEquipment[slotType]) {
            setInventory((prevInv) => [...prevInv, newEquipment[slotType]]);
          }
          newEquipment[slotType] = item;
          return { ...c, equipment: newEquipment };
        }
        return c;
      })
    );
  };

  const unequipFromCompanion = (companionId, slotType) => {
    const companion = companions.find((c) => c.id === companionId);
    if (!companion || !companion.equipment[slotType]) return;

    const item = companion.equipment[slotType];
    setInventory((prev) => [...prev, item]);

    setCompanions((prev) =>
      prev.map((c) => {
        if (c.id === companionId) {
          const newEquipment = { ...c.equipment };
          delete newEquipment[slotType];
          return { ...c, equipment: newEquipment };
        }
        return c;
      })
    );
  };

  const getSlotTypeFromItem = (item) => {
    const typeMap = {
      Arme: "weapon",
      Armure: "armor",
      Casque: "helmet",
      Bottes: "boots",
    };
    return typeMap[item.type.name] || "weapon";
  };

  return (
    <div className="app-container">
      {/* Header compact avec stats principales */}
      <header className="app-header">
        <h1 className="app-title">⚔️ MiniEquip</h1>

        <div className="app-stats">
          <div className="stat-item">
            <span>💰</span>
            <span>{gold.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span>⭐</span>
            <span>Niv. {playerLevel}</span>
          </div>
          <div className="stat-item">
            <span>🎫</span>
            <span>{dungeonTickets}</span>
          </div>
          <div className="stat-item">
            <span>👥</span>
            <span>{companions.length}</span>
          </div>
          <div className="stat-item">
            <span>🎒</span>
            <span>{inventory.length}</span>
          </div>
        </div>

        <div className="header-buttons">
          {saveStatus === "saving" && (
            <span className="save-indicator">💾</span>
          )}
          {saveStatus === "saved" && <span className="save-indicator">✅</span>}
          <button
            className="compact-button"
            onClick={manualSave}
            title="Sauvegarder manuellement"
          >
            💾
          </button>
          <button
            className="compact-button"
            onClick={() => setShowSettingsModal(true)}
            title="Paramètres"
          >
            ⚙️
          </button>
          <button
            className="compact-button"
            onClick={() => setShowAchievementsModal(true)}
            title="Achievements"
          >
            🏆
          </button>
        </div>
      </header>

      {/* Navigation par onglets */}
      <nav className="main-tabs">
        <button
          className={`main-tab ${activeMainTab === "forge" ? "active" : ""}`}
          onClick={() => setActiveMainTab("forge")}
        >
          🔨 Forge
        </button>
        <button
          className={`main-tab ${
            activeMainTab === "inventory" ? "active" : ""
          }`}
          onClick={() => setActiveMainTab("inventory")}
        >
          🎒 Inventaire
        </button>
        <button
          className={`main-tab ${activeMainTab === "combat" ? "active" : ""}`}
          onClick={() => setActiveMainTab("combat")}
        >
          ⚔️ Combat
        </button>
      </nav>

      {/* Contenu principal */}
      <main className="main-content">
        {activeMainTab === "forge" && (
          <div className="content-single">
            <EquipmentForge
              onEquipmentForged={addToInventory}
              gold={gold}
              setGold={setGold}
              companions={companions}
              setCompanions={setCompanions}
              passiveAbilities={passiveAbilities}
              setPassiveAbilities={setPassiveAbilities}
              onCombatLog={(message) => console.log(message)}
              playerLevel={playerLevel}
            />
          </div>
        )}

        {activeMainTab === "inventory" && (
          <div className="content-single">
            <Inventory
              items={inventory}
              equippedItems={equippedItems}
              onSellItem={sellItem}
              onEquipItem={equipItem}
              onUnequipItem={unequipItem}
              companions={companions}
              setCompanions={setCompanions}
              onEquipToCompanion={equipToCompanion}
              onUnequipFromCompanion={unequipFromCompanion}
            />
          </div>
        )}

        {activeMainTab === "combat" && (
          <div className="content-single">
            <Combat
              equippedItems={equippedItems}
              gold={gold}
              setGold={setGold}
              onCombatStateChange={setCombatInProgress}
              onEquipmentFound={addToInventory}
              companions={companions}
              setCompanions={setCompanions}
              passiveAbilities={passiveAbilities}
              setPassiveAbilities={setPassiveAbilities}
              dungeonTickets={dungeonTickets}
              setDungeonTickets={setDungeonTickets}
              playerLevel={playerLevel}
              setPlayerLevel={setPlayerLevel}
              experience={experience}
              setExperience={setExperience}
              gameStats={gameStats}
              setGameStats={setGameStats}
            />
          </div>
        )}
      </main>

      {/* Modales */}
      {showSettingsModal && (
        <div className="compact-modal">
          <div className="compact-modal-content">
            <SettingsModal
              isOpen={showSettingsModal}
              onClose={() => setShowSettingsModal(false)}
              gameStats={gameStats}
              gameSettings={gameSettings}
              setGameSettings={setGameSettings}
              onResetGame={resetGame}
              manualSave={manualSave}
            />
          </div>
        </div>
      )}

      {showAchievementsModal && (
        <div className="compact-modal">
          <div className="compact-modal-content">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>🏆 Achievements & Quêtes</h2>
              <button
                className="compact-button"
                onClick={() => setShowAchievementsModal(false)}
              >
                ❌ Fermer
              </button>
            </div>
            <AchievementsPanel
              gameStats={gameStats}
              onRewardClaimed={handleRewardClaimed}
              playerLevel={playerLevel}
              totalGold={gold}
              inventory={inventory}
            />
          </div>
        </div>
      )}

      {/* Notification de bienvenue */}
      {showWelcomeBack && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "linear-gradient(135deg, #28a745, #20c997)",
            color: "white",
            padding: "15px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            zIndex: 2000,
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <h3 style={{ margin: "0 0 5px 0" }}>🎮 Bon retour !</h3>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Partie chargée avec succès
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
