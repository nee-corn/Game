import { useState } from "react";
import EquipmentForge from "./components/EquipmentForge";
import Inventory from "./components/Inventory";
import Combat from "./components/Combat";
import Dungeon from "./components/Dungeon";
import "./App.css";

function App() {
  const [inventory, setInventory] = useState([]);
  const [equippedItems, setEquippedItems] = useState({});
  const [gold, setGold] = useState(100);

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
      setEquippedItems((prev) => {
        const newEquipped = { ...prev };
        delete newEquipped[item.type.name];
        return newEquipped;
      });
    } else {
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔨 Forge d'Équipements</h1>
        <div className="gold-display">
          <span>💰 Or: {gold}</span>
        </div>
      </header>

      <main className="app-main">
        <EquipmentForge
          onEquipmentForged={addToInventory}
          gold={gold}
          setGold={setGold}
        />
        <Combat equippedItems={equippedItems} gold={gold} setGold={setGold} />
        <Dungeon
          equippedItems={equippedItems}
          gold={gold}
          setGold={setGold}
          onEquipmentFound={handleEquipmentFound}
        />
        <Inventory
          items={inventory}
          equippedItems={equippedItems}
          onSellItem={sellEquipment}
          onEquipItem={equipItem}
          onUnequipItem={unequipItem}
        />
      </main>
    </div>
  );
}

export default App;
