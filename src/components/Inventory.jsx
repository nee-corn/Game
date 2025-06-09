import { useState } from "react";
import "./Inventory.css";

function Inventory({
  items,
  equippedItems,
  onSellItem,
  onEquipItem,
  onUnequipItem,
}) {
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);

  const openItemModal = (item, isEquipped = false) => {
    setSelectedItem({ ...item, isEquipped });
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setShowItemModal(false);
  };

  const handleSell = () => {
    onSellItem(selectedItem, selectedItem.isEquipped);
    closeItemModal();
  };

  const handleEquip = () => {
    onEquipItem(selectedItem);
    closeItemModal();
  };

  const handleUnequip = () => {
    onUnequipItem(selectedItem);
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
      </div>

      <div className="tab-content">
        {activeTab === "inventory" && (
          <div className="inventory-tab">
            <div className="inventory-grid">{renderInventoryGrid()}</div>
          </div>
        )}

        {activeTab === "equipment" && (
          <div className="equipment-tab">
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
        )}
      </div>

      {showItemModal && selectedItem && (
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
            </div>

            <div className="modal-content">
              <div className="item-stats-detailed">
                <h4>📊 Statistiques :</h4>
                {Object.entries(selectedItem.stats).map(([stat, value]) => (
                  <div key={stat} className="stat-row">
                    <span className="stat-icon">
                      {statsIcons[stat] || "📊"}
                    </span>
                    <span className="stat-name">{stat}:</span>
                    <span className="stat-value">+{value}</span>
                  </div>
                ))}
              </div>

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
