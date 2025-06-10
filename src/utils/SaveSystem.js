import { useState, useEffect } from 'react';

// Système de sauvegarde automatique
export class SaveSystem {
  static SAVE_KEY = 'miniequip_save_data';
  static AUTO_SAVE_INTERVAL = 30000; // Sauvegarde toutes les 30 secondes

  // Sauvegarder les données du jeu
  static saveGame(gameData) {
    try {
      const saveData = {
        ...gameData,
        lastSaved: new Date().toISOString(),
        version: '1.0.0'
      };
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      console.log('✅ Jeu sauvegardé automatiquement');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      return false;
    }
  }

  // Charger les données du jeu
  static loadGame() {
    try {
      const savedData = localStorage.getItem(this.SAVE_KEY);
      if (savedData) {
        const gameData = JSON.parse(savedData);
        console.log('✅ Sauvegarde chargée du', new Date(gameData.lastSaved).toLocaleString());
        return gameData;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      return null;
    }
  }

  // Vérifier si une sauvegarde existe
  static hasSaveData() {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  // Supprimer la sauvegarde
  static deleteSave() {
    localStorage.removeItem(this.SAVE_KEY);
    console.log('🗑️ Sauvegarde supprimée');
  }

  // Exporter la sauvegarde (pour backup)
  static exportSave() {
    const saveData = this.loadGame();
    if (saveData) {
      const dataStr = JSON.stringify(saveData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `miniequip_save_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      console.log('📤 Sauvegarde exportée');
    }
  }

  // Importer une sauvegarde
  static importSave(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          this.saveGame(importedData);
          console.log('📥 Sauvegarde importée');
          resolve(importedData);
        } catch (error) {
          console.error('❌ Erreur lors de l\'importation:', error);
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
  // Créer les données par défaut
  static getDefaultGameData() {
    return {
      // Progression du joueur
      playerLevel: 1,
      experience: 0,
      gold: 100,
      
      // Inventaire et équipements
      inventory: [],
      equippedItems: {},
      
      // Compagnons
      companions: [],
      
      // Capacités passives
      passiveAbilities: [],
      
      // Système de donjon
      dungeonTickets: 0,
      
      // Statistiques de jeu
      stats: {
        totalCombats: 0,
        totalVictories: 0,
        totalGoldEarned: 0,
        bossesDefeated: 0,
        itemsForged: 0,
        companionsSummoned: 0,
        maxWaveReached: 1,
        playtimeMinutes: 0
      },
      
      // Paramètres
      settings: {
        autoSave: true,
        soundEnabled: true,
        animationsEnabled: true
      }
    };
  }

  // Fusionner les données sauvegardées avec les données par défaut
  static mergeWithDefaults(savedData) {
    const defaults = this.getDefaultGameData();
    return {
      ...defaults,
      ...savedData,
      stats: { ...defaults.stats, ...savedData.stats },
      settings: { ...defaults.settings, ...savedData.settings }
    };
  }
}

// Hook personnalisé pour la sauvegarde automatique
export function useAutoSave(gameData, enabled = true) {
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (gameData) {
        setSaveStatus('saving');
        const success = SaveSystem.saveGame(gameData);
        setSaveStatus(success ? 'saved' : 'error');
        setLastSaveTime(new Date());
        
        // Reset status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }, SaveSystem.AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [gameData, enabled]);

  // Sauvegarde manuelle
  const manualSave = () => {
    if (gameData) {
      setSaveStatus('saving');
      const success = SaveSystem.saveGame(gameData);
      setSaveStatus(success ? 'saved' : 'error');
      setLastSaveTime(new Date());
      setTimeout(() => setSaveStatus('idle'), 2000);
      return success;
    }
    return false;
  };

  return { lastSaveTime, saveStatus, manualSave };
}
