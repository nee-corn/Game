import { useState, useEffect } from "react";
import EquipmentForge from "./components/EquipmentForge";
import Inventory from "./components/Inventory";
import Combat from "./components/Combat";
import SettingsModal from "./components/SettingsModal";
import { SaveSystem, useAutoSave } from "./utils/SaveSystem";
import "./components/SaveSystem.css";
import "./App.css";

function App() {
  // États de jeu initiaux
  const [inventory, setInventory] = useState([]);
  const [equippedItems, setEquippedItems] = useState({});
  const [gold, setGold] = useState(100);
  const [showCombatModal, setShowCombatModal] = useState(false);
  const [combatInProgress, setCombatInProgress] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [experience, setExperience] = useState(0);

  // États pour les compagnons et passifs
  const [companions, setCompanions] = useState([]);
  const [passiveAbilities, setPassiveAbilities] = useState([]);

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
  // États pour la sauvegarde
  const [isLoaded, setIsLoaded] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Charger la sauvegarde au démarrage
  useEffect(() => {
    const loadSaveData = async () => {
      const savedData = SaveSystem.loadGame();

      if (savedData) {
        // Fusionner avec les données par défaut pour compatibilité
        const mergedData = SaveSystem.mergeWithDefaults(savedData);

        // Charger les données
        setGold(mergedData.gold || 100);
        setInventory(mergedData.inventory || []);
        setEquippedItems(mergedData.equippedItems || {});
        setCompanions(mergedData.companions || []);
        setPassiveAbilities(mergedData.passiveAbilities || []);
        setPlayerLevel(mergedData.playerLevel || 1);
        setExperience(mergedData.experience || 0);
        setGameStats(mergedData.stats || SaveSystem.getDefaultGameData().stats);
        setGameSettings(
          mergedData.settings || SaveSystem.getDefaultGameData().settings
        );

        // Afficher message de bienvenue
        setShowWelcomeBack(true);
        setTimeout(() => setShowWelcomeBack(false), 3000);

        console.log("🎮 Partie chargée avec succès !");
      } else {
        console.log("🆕 Nouvelle partie !");
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
    stats: gameStats,
    settings: gameSettings,
  };

  // Utiliser le système de sauvegarde automatique
  const { lastSaveTime, saveStatus, manualSave } = useAutoSave(
    gameData,
    gameSettings.autoSave && isLoaded
  );

  // Fonctions pour mettre à jour les statistiques
  const updateStats = (statUpdates) => {
    setGameStats((prev) => ({
      ...prev,
      ...statUpdates,
    }));
  };

  // Fonction pour réinitialiser le jeu
  const resetGame = () => {
    if (
      window.confirm(
        "⚠️ Êtes-vous sûr de vouloir recommencer une nouvelle partie ? Toute progression sera perdue !"
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

      console.log("🔄 Nouvelle partie commencée !");
    }
  };

  // Sauvegarde avant fermeture de l'onglet
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoaded) {
        SaveSystem.saveGame(gameData);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [gameData, isLoaded]);

  // Ne pas afficher le jeu tant qu'il n'est pas chargé
  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1>🔨 Forge d'Équipements</h1>
          <div className="loading-spinner">⚙️</div>
          <p>Chargement de votre aventure...</p>
        </div>
      </div>
    );
  }

  const addToInventory = (equipment) => {
    setInventory((prev) => [...prev, equipment]);
  };

  const handleEquipmentFound = (equipment) => {
    addToInventory(equipment);
  };
  const sellEquipment = (item, isEquipped = false) => {
    const sellPrice = Math.floor(item.value * 0.7);
    setGold((prev) => prev + sellPrice);

    if (isEquipped) {
      if (item.companionId) {
        // Objet équipé sur un compagnon - le retirer de l'équipement du compagnon
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
        // Objet équipé sur le joueur
        setEquippedItems((prev) => {
          const newEquipped = { ...prev };
          delete newEquipped[item.type.name];
          return newEquipped;
        });
      }
    } else {
      // Objet dans l'inventaire
      setInventory((prev) => prev.filter((invItem) => invItem.id !== item.id));
    }
  };

  const equipItem = (item) => {
    // Retire l'objet de l'inventaire
    setInventory((prev) => prev.filter((invItem) => invItem.id !== item.id));

    // Si il y a déjà un objet équipé de ce type, le remet dans l'inventaire
    if (equippedItems[item.type.name]) {
      setInventory((prev) => [...prev, equippedItems[item.type.name]]);
    }

    // Équipe le nouvel objet
    setEquippedItems((prev) => ({
      ...prev,
      [item.type.name]: item,
    }));
  };
  const unequipItem = (item) => {
    // Retire l'objet des équipements
    setEquippedItems((prev) => {
      const newEquipped = { ...prev };
      delete newEquipped[item.type.name];
      return newEquipped;
    });

    // Remet l'objet dans l'inventaire
    setInventory((prev) => [...prev, item]);
  };

  // Fonctions pour l'équipement des compagnons
  const equipItemToCompanion = (item, companionId) => {
    const companion = companions.find((c) => c.id === companionId);
    if (!companion) return;

    const slotType = getSlotTypeFromItem(item);

    // Retire l'objet de l'inventaire
    setInventory((prev) => prev.filter((invItem) => invItem.id !== item.id));

    // Met à jour l'équipement du compagnon
    setCompanions((prev) =>
      prev.map((c) => {
        if (c.id === companionId) {
          const newEquipment = { ...c.equipment };

          // Si il y a déjà un équipement dans ce slot, le remet dans l'inventaire
          if (newEquipment[slotType]) {
            setInventory((prevInv) => [...prevInv, newEquipment[slotType]]);
          }

          // Équipe le nouvel objet
          newEquipment[slotType] = item;

          return { ...c, equipment: newEquipment };
        }
        return c;
      })
    );
  };

  const unequipCompanionItem = (companionId, slotType) => {
    const companion = companions.find((c) => c.id === companionId);
    if (!companion || !companion.equipment[slotType]) return;

    const item = companion.equipment[slotType];

    // Remet l'objet dans l'inventaire
    setInventory((prev) => [...prev, item]);

    // Retire l'objet du compagnon
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

  // Fonction utilitaire pour déterminer le type de slot
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
    <div className="app">
      {/* Message de bienvenue */}
      {showWelcomeBack && (
        <div className="welcome-back-notification">
          <div className="notification-content">
            <h3>👋 Bon retour !</h3>
            <p>Votre partie a été chargée avec succès</p>
            {lastSaveTime && (
              <p className="last-save">
                Dernière sauvegarde : {lastSaveTime.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      )}

      <header className="app-header">
        <h1>🔨 Forge d'Équipements</h1>
        <div className="header-info">
          <div className="gold-display">
            <span>💰 Or: {gold}</span>
            <span className="level-display">📈 Niveau: {playerLevel}</span>
          </div>
          <div className="save-info">
            {saveStatus === "saving" && (
              <span className="save-status saving">💾 Sauvegarde...</span>
            )}
            {saveStatus === "saved" && (
              <span className="save-status saved">✅ Sauvegardé</span>
            )}
            {saveStatus === "error" && (
              <span className="save-status error">❌ Erreur sauvegarde</span>
            )}
            {lastSaveTime && saveStatus === "idle" && (
              <span className="last-save-time">
                Dernière sauvegarde : {lastSaveTime.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="header-buttons">
            <button
              className="manual-save-button"
              onClick={manualSave}
              title="Sauvegarder manuellement"
            >
              💾
            </button>
            <button
              className="settings-button"
              onClick={() => setShowSettingsModal(true)}
              title="Paramètres"
            >
              ⚙️
            </button>
            <button
              className="combat-toggle-button"
              onClick={() => setShowCombatModal(true)}
            >
              ⚔️ Combat
            </button>
          </div>{" "}
        </div>
      </header>

      <main className="app-main">
        <EquipmentForge
          onEquipmentForged={addToInventory}
          gold={gold}
          setGold={setGold}
          companions={companions}
          setCompanions={setCompanions}
          passiveAbilities={passiveAbilities}
          setPassiveAbilities={setPassiveAbilities}
        />

        <Inventory
          items={inventory}
          equippedItems={equippedItems}
          onSellItem={sellEquipment}
          onEquipItem={equipItem}
          onUnequipItem={unequipItem}
          companions={companions}
          setCompanions={setCompanions}
          onEquipToCompanion={equipItemToCompanion}
          onUnequipFromCompanion={unequipCompanionItem}
        />
      </main>
      {/* Modal de Combat */}
      {showCombatModal && (
        <div className="combat-modal-overlay">
          <div className="combat-modal">
            <div className="combat-modal-header">
              <h2>⚔️ Zone de Combat</h2>
              <button
                className="combat-modal-minimize"
                onClick={() => setShowCombatModal(false)}
                title="Réduire"
              >
                ➖{" "}
              </button>
            </div>

            <Combat
              equippedItems={equippedItems}
              gold={gold}
              setGold={setGold}
              onCombatStateChange={setCombatInProgress}
              onEquipmentFound={handleEquipmentFound}
              companions={companions}
              setCompanions={setCompanions}
              passiveAbilities={passiveAbilities}
              setPassiveAbilities={setPassiveAbilities}
            />
          </div>
        </div>
      )}
      {/* Bande latérale pour combat en cours */}
      {combatInProgress && !showCombatModal && (
        <div className="combat-sidebar">
          <div className="combat-sidebar-content">
            <div className="combat-sidebar-icon">⚔️</div>
            <div className="combat-sidebar-text">
              <div className="combat-status">Combat en cours</div>
              <div className="combat-action">Cliquez pour ouvrir</div>
            </div>
          </div>
          <button
            className="combat-sidebar-button"
            onClick={() => setShowCombatModal(true)}
          >
            Ouvrir Combat
          </button>{" "}
        </div>
      )}

      {/* Modal des paramètres */}
      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          gameStats={gameStats}
          gameSettings={gameSettings}
          setGameSettings={setGameSettings}
          onResetGame={resetGame}
          manualSave={manualSave}
        />
      )}

      {/* Notification de bienvenue */}
      {showWelcomeBack && (
        <div className="welcome-notification">
          <div className="welcome-content">
            <h3>🎮 Bon retour !</h3>
            <p>Votre partie a été chargée avec succès.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
