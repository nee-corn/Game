import React from "react";
import "./CompactLayout.css";

function VictoryScreen({ victoryRewards, onClose, onRestartCombat }) {
  if (!victoryRewards) return null;

  const {
    enemy,
    goldReward,
    expReward,
    hasExpBoost,
    droppedMaterials,
    droppedEquipment,
  } = victoryRewards;

  return (
    <div className="compact-modal">
      <div className="compact-modal-content">
        <div className="victory-screen">
          <h2 className="victory-title">🎉 Victoire ! 🎉</h2>

          <div
            style={{
              fontSize: "1.2rem",
              margin: "10px 0",
              color: "#d35400",
            }}
          >
            Vous avez vaincu {enemy.emoji} {enemy.name} !
          </div>

          <div className="victory-rewards">
            {/* Récompenses principales */}
            <div className="victory-reward">
              <div style={{ fontSize: "1.5rem" }}>💰</div>
              <div>
                <strong>+{goldReward}</strong>
                <div style={{ fontSize: "0.8rem", color: "#666" }}>Or</div>
              </div>
            </div>

            <div className="victory-reward">
              <div style={{ fontSize: "1.5rem" }}>⭐</div>
              <div>
                <strong>+{expReward}</strong>
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  Expérience{hasExpBoost ? " (x2)" : ""}
                </div>
              </div>
            </div>

            {/* Matériaux spéciaux */}
            {droppedMaterials && droppedMaterials.length > 0 && (
              <div className="victory-reward">
                <div style={{ fontSize: "1.5rem" }}>🔷</div>
                <div>
                  <strong>{droppedMaterials.length}</strong>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    Matériau{droppedMaterials.length > 1 ? "x" : ""}
                  </div>
                </div>
              </div>
            )}

            {/* Équipement */}
            {droppedEquipment && (
              <div className="victory-reward">
                <div style={{ fontSize: "1.5rem" }}>
                  {droppedEquipment.emoji}
                </div>
                <div>
                  <strong>{droppedEquipment.rarity.name}</strong>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: droppedEquipment.rarity.color,
                    }}
                  >
                    {droppedEquipment.type.name}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Détails des matériaux */}
          {droppedMaterials && droppedMaterials.length > 0 && (
            <div
              style={{
                margin: "15px 0",
                padding: "10px",
                background: "rgba(52, 152, 219, 0.1)",
                borderRadius: "6px",
                border: "1px solid #3498db",
              }}
            >
              {droppedMaterials.map((mat, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    margin: "5px 0",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{mat.emoji}</span>
                  <div>
                    <strong>{mat.name}</strong>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                      {mat.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="victory-actions">
            <button
              className="compact-button primary"
              onClick={onRestartCombat}
              style={{ marginRight: "10px" }}
            >
              🔄 Relancer le combat
            </button>
            <button className="compact-button" onClick={onClose}>
              🏠 Retour au camp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VictoryScreen;
