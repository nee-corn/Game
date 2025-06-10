import { useState } from "react";
import "./Inventory.css";

function Inventory({
  items,
  equippedItems,
  onSellItem,
  onEquipItem,
  onUnequipItem,
  companions,
  setCompanions,
  onEquipToCompanion,
  onUnequipFromCompanion,
}) {
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEquipModal, setShowEquipModal] = useState(false);
  const [activeCompanions, setActiveCompanions] = useState([]);
  const [previewTarget, setPreviewTarget] = useState("player"); // "player" ou ID du compagnon
  const maxActiveCompanions = 5;

  const openItemModal = (item, isEquipped = false) => {
    setSelectedItem({ ...item, isEquipped });
    setShowItemModal(true);
    setPreviewTarget("player"); // Reset à "player" par défaut
  };
  const getComparisonItem = () => {
    if (!selectedItem || selectedItem.isEquipped) return null;

    // Si on compare pour un compagnon spécifique dans la modal d'équipement
    if (selectedItem.targetCompanionId) {
      const companion = companions.find(
        (c) => c.id === selectedItem.targetCompanionId
      );
      if (companion) {
        const slotType = getSlotTypeFromItem(selectedItem);
        return companion.equipment[slotType] || null;
      }
    }

    // Utiliser la cible de prévisualisation sélectionnée
    if (previewTarget === "player") {
      const equippedOfSameType = equippedItems[selectedItem.type.name];
      return equippedOfSameType || null;
    } else {
      // Compagnon spécifique sélectionné pour la prévisualisation
      const companion = companions.find((c) => c.id === previewTarget);
      if (companion) {
        const slotType = getSlotTypeFromItem(selectedItem);
        return companion.equipment[slotType] || null;
      }
    }

    return null;
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

  const getStatComparison = (stat, newValue) => {
    const comparisonItem = getComparisonItem();
    if (!comparisonItem) return { difference: 0, type: "neutral" };

    const currentValue = comparisonItem.stats[stat] || 0;
    const difference = newValue - currentValue;

    return {
      difference,
      type:
        difference > 0 ? "positive" : difference < 0 ? "negative" : "neutral",
    };
  };
  const closeItemModal = () => {
    setSelectedItem(null);
    setShowItemModal(false);
    setShowEquipModal(false);
    setPreviewTarget("player"); // Reset la cible de prévisualisation
  };
  const handleSell = () => {
    // Créer une copie de l'item avec toutes les informations nécessaires pour la vente
    const itemToSell = {
      ...selectedItem,
      companionId: selectedItem.companionId,
      slotType: selectedItem.slotType,
    };
    onSellItem(itemToSell, selectedItem.isEquipped);
    closeItemModal();
  };

  const handleEquip = () => {
    if (selectedItem.isEquipped) {
      onUnequipItem(selectedItem);
    } else {
      setShowEquipModal(true);
    }
  };

  const handleEquipToPlayer = () => {
    onEquipItem(selectedItem);
    closeItemModal();
  };
  const handleEquipToCompanion = (companionId) => {
    // Ajouter l'ID du compagnon cible pour la comparaison
    const itemWithTarget = {
      ...selectedItem,
      targetCompanionId: companionId,
    };
    setSelectedItem(itemWithTarget);
    onEquipToCompanion(selectedItem, companionId);
    closeItemModal();
  };

  const activateCompanion = (companion) => {
    if (activeCompanions.length >= maxActiveCompanions) {
      alert(
        `Vous ne pouvez avoir que ${maxActiveCompanions} compagnons actifs maximum !`
      );
      return;
    }

    if (activeCompanions.find((c) => c.id === companion.id)) {
      alert("Ce compagnon est déjà actif !");
      return;
    }

    setActiveCompanions((prev) => [...prev, companion]);
  };

  const deactivateCompanion = (companionId) => {
    setActiveCompanions((prev) => prev.filter((c) => c.id !== companionId));
  };

  const releaseCompanion = (companionId) => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir libérer ce compagnon ? Cette action est irréversible."
      )
    ) {
      setActiveCompanions((prev) => prev.filter((c) => c.id !== companionId));
      const updatedCompanions = companions.filter((c) => c.id !== companionId);
      setCompanions(updatedCompanions);
    }
  };
  const handleUnequip = () => {
    if (selectedItem.companionId) {
      // Déséquipement d'un compagnon
      onUnequipFromCompanion(selectedItem.companionId, selectedItem.slotType);
    } else {
      // Déséquipement du joueur
      onUnequipItem(selectedItem);
    }
    closeItemModal();
  };

  const statsIcons = {
    attaque: "⚔️",
    défense: "🛡️",
    vie: "❤️",
    mana: "💙",
    agilité: "💨",
    critique: "💥",
    esquive: "🌟",
    luck: "🍀",
  };

  const getEquippedStats = () => {
    const totalStats = {};
    Object.values(equippedItems).forEach((item) => {
      Object.entries(item.stats).forEach(([stat, value]) => {
        totalStats[stat] = (totalStats[stat] || 0) + value;
      });
    });
    return totalStats;
  };

  const getCompanionStats = (companion) => {
    let totalStats = {
      attaque: companion.baseAttack,
      défense: 0,
      vie: companion.baseHp,
      maxHp: companion.baseHp,
    };

    Object.values(companion.equipment).forEach((item) => {
      if (item) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          totalStats[stat] = (totalStats[stat] || 0) + value;
        });
      }
    });

    return totalStats;
  };

  const renderInventoryGrid = () => {
    const maxSlots = 20;
    const slots = [];

    for (let i = 0; i < maxSlots; i++) {
      const item = items[i];
      slots.push(
        <div
          key={i}
          className={`inventory-slot ${item ? "filled" : "empty"}`}
          onClick={() => item && openItemModal(item, false)}
        >
          {item && (
            <div
              className="slot-item"
              style={{ borderColor: item.rarity.color }}
            >
              <div className="item-emoji">{item.emoji}</div>
              <div
                className="rarity-indicator"
                style={{ backgroundColor: item.rarity.color }}
              >
                {item.rarity.emoji}
              </div>
            </div>
          )}
        </div>
      );
    }
    return slots;
  };

  const renderEquipmentSlots = () => {
    const equipmentTypes = ["Arme", "Armure", "Casque", "Bottes"];

    return equipmentTypes.map((type) => {
      const equippedItem = equippedItems[type];
      return (
        <div key={type} className="equipment-slot">
          <div className="slot-label">{type}</div>
          <div
            className={`inventory-slot ${
              equippedItem ? "filled" : "empty"
            } equipment`}
            onClick={() => equippedItem && openItemModal(equippedItem, true)}
          >
            {equippedItem && (
              <div
                className="slot-item"
                style={{ borderColor: equippedItem.rarity.color }}
              >
                <div className="item-emoji">{equippedItem.emoji}</div>
                <div
                  className="rarity-indicator"
                  style={{ backgroundColor: equippedItem.rarity.color }}
                >
                  {equippedItem.rarity.emoji}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="inventory-container">
      {" "}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          🎒 Inventaire ({items.length}/20)
        </button>
        <button
          className={`tab ${activeTab === "equipment" ? "active" : ""}`}
          onClick={() => setActiveTab("equipment")}
        >
          ⚔️ Équipement ({Object.keys(equippedItems).length}/4)
        </button>
        <button
          className={`tab ${activeTab === "companions" ? "active" : ""}`}
          onClick={() => setActiveTab("companions")}
        >
          👥 Compagnons ({companions ? companions.length : 0})
        </button>
        <button
          className={`tab ${activeTab === "guide" ? "active" : ""}`}
          onClick={() => setActiveTab("guide")}
        >
          📚 Guide Combat
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "inventory" && (
          <div className="inventory-tab">
            <div className="inventory-grid">{renderInventoryGrid()}</div>
          </div>
        )}{" "}
        {activeTab === "equipment" && (
          <div className="equipment-tab">
            {/* Équipement du joueur */}
            <div className="player-equipment-section">
              <h3>🤺 Équipement du Joueur</h3>
              <div className="equipment-slots">{renderEquipmentSlots()}</div>

              {Object.keys(equippedItems).length > 0 && (
                <div className="equipped-stats">
                  <h3>📈 Stats totales équipées :</h3>
                  <div className="stats-summary">
                    {Object.entries(getEquippedStats()).map(([stat, value]) => (
                      <div key={stat} className="equipped-stat">
                        <span className="stat-icon">
                          {statsIcons[stat] || "📊"}
                        </span>
                        <span className="stat-name">{stat}:</span>
                        <span className="stat-value">+{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Équipement des compagnons */}
            {companions && companions.length > 0 && (
              <div className="companions-equipment-section">
                <h3>👥 Équipement des Compagnons</h3>
                <div className="companions-equipment-grid">
                  {companions.map((companion) => {
                    const companionStats = getCompanionStats(companion);
                    const isActive = activeCompanions.find(
                      (c) => c.id === companion.id
                    );
                    return (
                      <div
                        key={companion.id}
                        className={`companion-equipment-card ${
                          isActive ? "active" : ""
                        }`}
                      >
                        <div className="companion-header-compact">
                          <span className="companion-emoji">
                            {companion.emoji}
                          </span>
                          <div className="companion-info">
                            <h4>{companion.name}</h4>
                            <div className="companion-level">
                              Niveau {companion.level}
                            </div>
                            {isActive && (
                              <span className="active-indicator">🏆 Actif</span>
                            )}
                          </div>
                        </div>

                        <div className="companion-equipment-slots-compact">
                          {["weapon", "armor", "helmet", "boots"].map(
                            (slotType) => {
                              const equippedItem =
                                companion.equipment[slotType];
                              const slotEmojis = {
                                weapon: "⚔️",
                                armor: "🛡️",
                                helmet: "⛑️",
                                boots: "👢",
                              };

                              return (
                                <div
                                  key={slotType}
                                  className="companion-equipment-slot-compact"
                                >
                                  <div className="slot-label-compact">
                                    {slotEmojis[slotType]}
                                  </div>
                                  <div
                                    className={`equipment-slot-companion-compact ${
                                      equippedItem ? "filled" : "empty"
                                    }`}
                                    onClick={() => {
                                      if (equippedItem) {
                                        // Créer un item temporaire avec flag pour compagnon
                                        const companionItem = {
                                          ...equippedItem,
                                          isEquipped: true,
                                          companionId: companion.id,
                                          slotType: slotType,
                                        };
                                        openItemModal(companionItem, true);
                                      }
                                    }}
                                    title={
                                      equippedItem
                                        ? equippedItem.name
                                        : "Slot vide"
                                    }
                                  >
                                    {equippedItem ? (
                                      <div
                                        className="slot-item-compact"
                                        style={{
                                          borderColor:
                                            equippedItem.rarity.color,
                                        }}
                                      >
                                        <div className="item-emoji-compact">
                                          {equippedItem.emoji}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="empty-slot-compact">
                                        <span>+</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>

                        <div className="companion-stats-compact">
                          <div className="stat-compact">
                            ❤️ {companionStats.vie}
                          </div>
                          <div className="stat-compact">
                            ⚔️ {companionStats.attaque}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "companions" && (
          <div className="companions-tab">
            {companions && companions.length > 0 ? (
              <div className="companions-management">
                <div className="active-companions-section">
                  <h3>
                    🏆 Compagnons Actifs ({activeCompanions.length}/
                    {maxActiveCompanions})
                  </h3>
                  <div className="active-companions-grid">
                    {activeCompanions.map((companion) => {
                      const companionStats = getCompanionStats(companion);
                      return (
                        <div
                          key={companion.id}
                          className="active-companion-card"
                        >
                          <div className="companion-header-small">
                            <span className="companion-emoji">
                              {companion.emoji}
                            </span>
                            <div className="companion-info">
                              <h4>{companion.name}</h4>
                              <div className="companion-level">
                                Niveau {companion.level}
                              </div>
                            </div>
                            <button
                              className="deactivate-btn"
                              onClick={() => deactivateCompanion(companion.id)}
                              title="Désactiver"
                            >
                              ✖️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {Array.from({
                      length: maxActiveCompanions - activeCompanions.length,
                    }).map((_, index) => (
                      <div key={index} className="empty-active-slot">
                        <span>+</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="all-companions-section">
                  <h3>📋 Tous les Compagnons</h3>
                  {companions.map((companion) => {
                    const companionStats = getCompanionStats(companion);
                    const isActive = activeCompanions.find(
                      (c) => c.id === companion.id
                    );
                    return (
                      <div
                        key={companion.id}
                        className={`companion-equipment-panel ${
                          isActive ? "active" : ""
                        }`}
                      >
                        <div className="companion-header">
                          <span className="companion-emoji">
                            {companion.emoji}
                          </span>
                          <div className="companion-info">
                            <h3>{companion.name}</h3>
                            <div className="companion-level">
                              Niveau {companion.level}
                            </div>
                            <div className="companion-stats-mini">
                              ❤️ {companionStats.vie} | ⚔️{" "}
                              {companionStats.attaque}
                            </div>
                          </div>
                          <div className="companion-actions">
                            {!isActive ? (
                              <button
                                className="activate-btn"
                                onClick={() => activateCompanion(companion)}
                                disabled={
                                  activeCompanions.length >= maxActiveCompanions
                                }
                              >
                                ✅ Activer
                              </button>
                            ) : (
                              <span className="active-badge">🏆 Actif</span>
                            )}
                            <button
                              className="release-btn"
                              onClick={() => releaseCompanion(companion.id)}
                            >
                              🗑️ Libérer
                            </button>
                          </div>
                        </div>

                        <div className="companion-equipment-slots">
                          {["weapon", "armor", "helmet", "boots"].map(
                            (slotType) => {
                              const equippedItem =
                                companion.equipment[slotType];
                              const slotEmojis = {
                                weapon: "⚔️",
                                armor: "🛡️",
                                helmet: "⛑️",
                                boots: "👢",
                              };

                              return (
                                <div
                                  key={slotType}
                                  className="companion-equipment-slot"
                                >
                                  <div className="slot-label">
                                    {slotEmojis[slotType]} {slotType}
                                  </div>{" "}
                                  <div
                                    className={`equipment-slot-companion ${
                                      equippedItem ? "filled" : "empty"
                                    }`}
                                    onClick={() => {
                                      if (equippedItem) {
                                        // Créer un item temporaire avec flag pour compagnon
                                        const companionItem = {
                                          ...equippedItem,
                                          isEquipped: true,
                                          companionId: companion.id,
                                          slotType: slotType,
                                        };
                                        openItemModal(companionItem, true);
                                      }
                                    }}
                                  >
                                    {equippedItem ? (
                                      <div
                                        className="slot-item"
                                        style={{
                                          borderColor:
                                            equippedItem.rarity.color,
                                        }}
                                      >
                                        <div className="item-emoji">
                                          {equippedItem.emoji}
                                        </div>
                                        <div className="item-name">
                                          {equippedItem.name}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="empty-slot">
                                        <span>+</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>

                        <div className="companion-total-stats">
                          <h4>📊 Stats totales :</h4>
                          <div className="stats-grid">
                            {Object.entries(companionStats).map(
                              ([stat, value]) => (
                                <div key={stat} className="stat-display">
                                  <span className="stat-name">{stat}:</span>
                                  <span className="stat-value">{value}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="no-companions">
                <p>🔮 Vous n'avez aucun compagnon invoqué.</p>
                <p>Allez dans la Forge → Compagnons pour en invoquer !</p>
              </div>
            )}
          </div>
        )}
        {activeTab === "guide" && (
          <div className="guide-tab">
            <div className="combat-guide">
              <h2>📚 Guide du Système de Combat avec Compagnons</h2>

              <div className="guide-section">
                <h3>🤺 Combat de Base</h3>
                <div className="guide-content">
                  <p>
                    Le combat se déroule entre vous et les ennemis, avec l'aide
                    potentielle de vos compagnons actifs.
                  </p>
                  <ul>
                    <li>
                      <strong>Attaque :</strong> Vos dégâts dépendent de votre
                      équipement et bonus
                    </li>
                    <li>
                      <strong>Défense :</strong> Réduit les dégâts subis
                    </li>
                    <li>
                      <strong>Esquive :</strong> Chance d'éviter complètement
                      une attaque
                    </li>
                    <li>
                      <strong>Critique :</strong> Chance d'infliger +50% de
                      dégâts
                    </li>
                  </ul>
                </div>
              </div>

              <div className="guide-section">
                <h3>👥 Système de Compagnons</h3>
                <div className="guide-content">
                  <p>
                    <strong>Un seul compagnon actif en combat !</strong>{" "}
                    Choisissez bien lequel activer.
                  </p>

                  <div className="companion-mechanics">
                    <div className="mechanic-card">
                      <h4>🛡️ Protection (25% de chance)</h4>
                      <p>
                        Votre compagnon peut intervenir pour vous protéger,
                        réduisant les dégâts de 30%
                      </p>
                    </div>

                    <div className="mechanic-card">
                      <h4>⚔️ Assistance d'Attaque</h4>
                      <p>
                        25% des dégâts de votre compagnon sont ajoutés à vos
                        attaques
                      </p>
                    </div>

                    <div className="mechanic-card">
                      <h4>📈 Bonus Passifs</h4>
                      <p>
                        Chaque type de compagnon apporte des bonus permanents :
                      </p>
                      <ul>
                        <li>
                          <strong>🛡️ Guerrier :</strong> +10 Défense
                        </li>
                        <li>
                          <strong>🔮 Mage :</strong> +15 Dégâts magiques
                        </li>
                        <li>
                          <strong>🗡️ Assassin :</strong> +15 Critique
                        </li>
                        <li>
                          <strong>💚 Guérisseur :</strong> Régénération
                          automatique
                        </li>
                        <li>
                          <strong>🔥 Berserker :</strong> +10 Esquive
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="guide-section">
                <h3>⚡ Mécaniques Avancées</h3>
                <div className="guide-content">
                  <div className="advanced-mechanics">
                    <div className="mechanic-card">
                      <h4>💀 Mort du Compagnon</h4>
                      <p>
                        Si votre compagnon meurt, vous obtenez un bonus de rage
                        temporaire (+25% dégâts pendant 3 tours)
                      </p>
                    </div>

                    <div className="mechanic-card">
                      <h4>💚 Régénération (Guérisseur)</h4>
                      <p>
                        Le compagnon Guérisseur régénère automatiquement des PV
                        au fil du temps
                      </p>
                    </div>

                    <div className="mechanic-card">
                      <h4>🎯 Stratégie</h4>
                      <p>
                        • Équipez vos compagnons pour maximiser leurs stats
                        <br />
                        • Activez le bon compagnon selon la situation
                        <br />• Un compagnion mort ne peut plus vous protéger !
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="guide-section">
                <h3>🎮 Conseils de Jeu</h3>
                <div className="guide-content">
                  <div className="tips-grid">
                    <div className="tip-card">
                      <h4>💡 Gestion des Compagnons</h4>
                      <p>
                        • Vous pouvez avoir 5 compagnons maximum
                        <br />
                        • Seul UN compagnon est actif en combat
                        <br />• Changez de compagnon actif selon vos besoins
                      </p>
                    </div>

                    <div className="tip-card">
                      <h4>⚔️ Optimisation de Combat</h4>
                      <p>
                        • Équipez vos compagnons avec de bons objets
                        <br />
                        • Utilisez le Guérisseur pour la survie
                        <br />• Utilisez l'Assassin pour les dégâts critiques
                      </p>
                    </div>

                    <div className="tip-card">
                      <h4>📊 Prévisualisation</h4>
                      <p>
                        • Utilisez la prévisualisation d'équipement
                        <br />
                        • Comparez les stats entre compagnons
                        <br />• Optimisez chaque slot d'équipement
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal de sélection d'équipement */}
      {showEquipModal && selectedItem && (
        <div className="modal-overlay" onClick={closeItemModal}>
          <div className="equip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚔️ Équiper : {selectedItem.name}</h3>
              <button className="close-button" onClick={closeItemModal}>
                ✕
              </button>
            </div>
            <div className="modal-content">
              <p>Où souhaitez-vous équiper cet objet ?</p>
              <div className="equip-options">
                <button
                  className="equip-option player-option"
                  onClick={handleEquipToPlayer}
                >
                  <div className="option-icon">🤺</div>
                  <div className="option-text">
                    <strong>Joueur</strong>
                    <span>Équiper sur votre personnage</span>
                  </div>
                </button>

                {companions && companions.length > 0 && (
                  <div className="companions-option">
                    <h4>👥 Ou choisir un compagnon :</h4>{" "}
                    <div className="companions-list">
                      {companions.map((companion) => {
                        const slotType = getSlotTypeFromItem(selectedItem);
                        const currentEquipment = companion.equipment[slotType];

                        return (
                          <button
                            key={companion.id}
                            className="equip-option companion-option"
                            onClick={() => handleEquipToCompanion(companion.id)}
                          >
                            <div className="option-icon">{companion.emoji}</div>
                            <div className="option-text">
                              <strong>{companion.name}</strong>
                              <span>Niveau {companion.level}</span>
                              {currentEquipment && (
                                <span className="current-equipment">
                                  📦 Remplace: {currentEquipment.name}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal d'informations d'objet */}
      {showItemModal && selectedItem && !showEquipModal && (
        <div className="modal-overlay" onClick={closeItemModal}>
          <div className="item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="item-title">
                <span className="item-emoji-large">{selectedItem.emoji}</span>
                <div>
                  <h3>{selectedItem.name}</h3>
                  <span
                    className="rarity-badge"
                    style={{ color: selectedItem.rarity.color }}
                  >
                    {selectedItem.rarity.emoji} {selectedItem.rarity.name}
                  </span>
                </div>
              </div>
              <button className="close-button" onClick={closeItemModal}>
                ✕
              </button>
            </div>{" "}
            <div className="modal-content">
              {/* Sélecteur de cible pour la prévisualisation */}
              {!selectedItem.isEquipped && (
                <div className="preview-target-selector">
                  <h4>🎯 Prévisualiser pour :</h4>
                  <div className="preview-options">
                    <button
                      className={`preview-option ${
                        previewTarget === "player" ? "active" : ""
                      }`}
                      onClick={() => setPreviewTarget("player")}
                    >
                      <span className="option-icon">🤺</span>
                      <span className="option-label">Joueur</span>
                    </button>
                    {companions && companions.length > 0 && (
                      <>
                        {companions.map((companion) => (
                          <button
                            key={companion.id}
                            className={`preview-option ${
                              previewTarget === companion.id ? "active" : ""
                            }`}
                            onClick={() => setPreviewTarget(companion.id)}
                          >
                            <span className="option-icon">
                              {companion.emoji}
                            </span>
                            <span className="option-label">
                              {companion.name}
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="item-stats-detailed">
                <h4>📊 Statistiques :</h4>
                {Object.entries(selectedItem.stats).map(([stat, value]) => {
                  const comparison = getStatComparison(stat, value);
                  return (
                    <div key={stat} className="stat-row">
                      <span className="stat-icon">
                        {statsIcons[stat] || "📊"}
                      </span>
                      <span className="stat-name">{stat}:</span>
                      <span className="stat-value">+{value}</span>
                      {!selectedItem.isEquipped &&
                        comparison.difference !== 0 && (
                          <span
                            className={`stat-comparison ${comparison.type}`}
                          >
                            ({comparison.difference > 0 ? "+" : ""}
                            {comparison.difference})
                          </span>
                        )}
                    </div>
                  );
                })}
              </div>{" "}
              {!selectedItem.isEquipped && getComparisonItem() && (
                <div className="comparison-section">
                  <h4>
                    🔄 Comparaison avec l'équipement actuel de{" "}
                    {previewTarget === "player"
                      ? "votre personnage"
                      : companions.find((c) => c.id === previewTarget)?.name}
                    :
                  </h4>
                  <div className="comparison-container">
                    <div className="comparison-current">
                      <h5>📦 Actuellement équipé :</h5>
                      <div className="comparison-item-header">
                        <span className="item-emoji-small">
                          {getComparisonItem().emoji}
                        </span>
                        <span className="item-name-small">
                          {getComparisonItem().name}
                        </span>
                      </div>
                      <div className="comparison-stats">
                        {Object.entries(getComparisonItem().stats).map(
                          ([stat, value]) => (
                            <div key={stat} className="comparison-stat">
                              <span className="stat-icon">
                                {statsIcons[stat] || "📊"}
                              </span>
                              <span className="stat-name">{stat}:</span>
                              <span className="stat-value">+{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="comparison-arrow">➜</div>

                    <div className="comparison-new">
                      <h5>✨ Nouveau :</h5>
                      <div className="comparison-item-header">
                        <span className="item-emoji-small">
                          {selectedItem.emoji}
                        </span>
                        <span className="item-name-small">
                          {selectedItem.name}
                        </span>
                      </div>
                      <div className="comparison-stats">
                        {Object.entries(selectedItem.stats).map(
                          ([stat, value]) => {
                            const comparison = getStatComparison(stat, value);
                            return (
                              <div
                                key={stat}
                                className={`comparison-stat ${comparison.type}`}
                              >
                                <span className="stat-icon">
                                  {statsIcons[stat] || "📊"}
                                </span>
                                <span className="stat-name">{stat}:</span>
                                <span className="stat-value">+{value}</span>
                                {comparison.difference !== 0 && (
                                  <span
                                    className={`stat-difference ${comparison.type}`}
                                  >
                                    ({comparison.difference > 0 ? "+" : ""}
                                    {comparison.difference})
                                  </span>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="item-value-display">
                💰 Valeur : {selectedItem.value} or
              </div>
            </div>
            <div className="modal-actions">
              {!selectedItem.isEquipped ? (
                <>
                  <button className="equip-button" onClick={handleEquip}>
                    ⚔️ Équiper
                  </button>
                  <button className="sell-button" onClick={handleSell}>
                    💸 Vendre ({Math.floor(selectedItem.value * 0.7)} or)
                  </button>
                </>
              ) : (
                <>
                  <button className="unequip-button" onClick={handleUnequip}>
                    📦 Déséquiper
                  </button>
                  <button className="sell-button" onClick={handleSell}>
                    💸 Vendre ({Math.floor(selectedItem.value * 0.7)} or)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
