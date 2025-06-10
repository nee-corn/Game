import { useState, useRef } from "react";
import { SaveSystem } from "../utils/SaveSystem";
import "./SaveSystem.css";

function SettingsModal({
  isOpen,
  onClose,
  gameSettings,
  setGameSettings,
  gameStats,
  onResetGame,
  manualSave,
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSettingToggle = (setting) => {
    setGameSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleExport = () => {
    SaveSystem.exportSave();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await SaveSystem.importSave(file);
        alert(
          "✅ Sauvegarde importée avec succès ! Rechargez la page pour voir les changements."
        );
      } catch (error) {
        alert("❌ Erreur lors de l'importation de la sauvegarde.");
      }
    }
    event.target.value = ""; // Reset input
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2>⚙️ Paramètres du Jeu</h2>

        {/* Paramètres généraux */}
        <div className="settings-section">
          <h3>🎮 Général</h3>

          <div className="setting-item">
            <span>Sauvegarde automatique</span>
            <button
              className={`setting-toggle ${
                gameSettings.autoSave ? "active" : ""
              }`}
              onClick={() => handleSettingToggle("autoSave")}
            >
              {gameSettings.autoSave ? "✅ Activé" : "❌ Désactivé"}
            </button>
          </div>

          <div className="setting-item">
            <span>Sons (à venir)</span>
            <button
              className={`setting-toggle ${
                gameSettings.soundEnabled ? "active" : ""
              }`}
              onClick={() => handleSettingToggle("soundEnabled")}
            >
              {gameSettings.soundEnabled ? "🔊 Activé" : "🔇 Désactivé"}
            </button>
          </div>

          <div className="setting-item">
            <span>Animations (à venir)</span>
            <button
              className={`setting-toggle ${
                gameSettings.animationsEnabled ? "active" : ""
              }`}
              onClick={() => handleSettingToggle("animationsEnabled")}
            >
              {gameSettings.animationsEnabled ? "✨ Activé" : "⏹️ Désactivé"}
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="settings-section">
          <h3>📊 Statistiques</h3>
          <div className="game-stats">
            <div className="stat-item">
              <div className="stat-value">{gameStats.totalCombats}</div>
              <div className="stat-label">Combats</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{gameStats.totalVictories}</div>
              <div className="stat-label">Victoires</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{gameStats.totalGoldEarned}</div>
              <div className="stat-label">Or gagné</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{gameStats.bossesDefeated}</div>
              <div className="stat-label">Boss vaincus</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{gameStats.itemsForged}</div>
              <div className="stat-label">Objets forgés</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{gameStats.companionsSummoned}</div>
              <div className="stat-label">Compagnons</div>
            </div>
          </div>
        </div>

        {/* Actions de sauvegarde */}
        <div className="settings-section">
          <h3>💾 Sauvegarde</h3>
          <div className="settings-actions">
            <button
              className="settings-button save-button"
              onClick={manualSave}
            >
              💾 Sauvegarder
            </button>
            <button
              className="settings-button export-button"
              onClick={handleExport}
            >
              📤 Exporter
            </button>
            <button
              className="settings-button import-button"
              onClick={handleImportClick}
            >
              📥 Importer
            </button>
          </div>
        </div>

        {/* Zone de danger */}
        <div className="settings-section">
          <h3>⚠️ Zone de Danger</h3>
          <div className="settings-actions">
            <button
              className="settings-button reset-button"
              onClick={onResetGame}
            >
              🔄 Nouvelle Partie
            </button>
            <button className="settings-button close-button" onClick={onClose}>
              ✖️ Fermer
            </button>
          </div>
        </div>

        {/* Input caché pour l'importation */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden-file-input"
          onChange={handleImport}
        />
      </div>
    </div>
  );
}

export default SettingsModal;
