import { useState, useEffect } from "react";
import { GameBalance, MetaProgression } from "../utils/GameBalance";
import "./AchievementsPanel.css";

function AchievementsPanel({
  gameStats,
  onRewardClaimed,
  playerLevel,
  totalGold,
  inventory,
}) {
  const [achievements, setAchievements] = useState([]);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [questProgress, setQuestProgress] = useState({});
  const [activeTab, setActiveTab] = useState("achievements");

  // Initialiser les achievements et quêtes
  useEffect(() => {
    loadAchievements();
    loadDailyQuests();
  }, []);

  // Vérifier les achievements
  useEffect(() => {
    checkAchievements();
  }, [gameStats, playerLevel, totalGold, inventory]);

  const loadAchievements = () => {
    const savedAchievements = JSON.parse(
      localStorage.getItem("achievements") || "[]"
    );
    setAchievements(savedAchievements);
  };

  const loadDailyQuests = () => {
    const today = new Date().toDateString();
    const savedQuests = JSON.parse(localStorage.getItem("dailyQuests") || "{}");

    if (savedQuests.date !== today) {
      // Nouvelles quêtes journalières
      const newQuests = GameBalance.generateDailyQuests(playerLevel);
      const questData = {
        date: today,
        quests: newQuests,
        progress: {},
      };

      localStorage.setItem("dailyQuests", JSON.stringify(questData));
      setDailyQuests(newQuests);
      setQuestProgress({});
    } else {
      setDailyQuests(savedQuests.quests || []);
      setQuestProgress(savedQuests.progress || {});
    }
  };

  const checkAchievements = () => {
    const currentAchievements = [...achievements];
    let hasNewAchievement = false;

    // Vérifier chaque achievement
    Object.entries(GameBalance.ACHIEVEMENTS).forEach(([key, achievement]) => {
      const existing = currentAchievements.find((a) => a.id === key);
      if (existing && existing.completed) return;

      let isCompleted = false;

      switch (key) {
        case "FIRST_LEGENDARY":
          isCompleted = inventory.some(
            (item) => item.rarity && item.rarity.key === "LEGENDARY"
          );
          break;

        case "WAVE_MASTER":
          isCompleted = gameStats.maxWaveReached >= 50;
          break;

        case "BOSS_SLAYER":
          isCompleted = gameStats.bossesDefeated >= 20;
          break;

        case "WEALTHY":
          isCompleted =
            totalGold >= 10000 || gameStats.totalGoldEarned >= 10000;
          break;

        case "COLLECTOR":
          isCompleted = inventory.length >= 50;
          break;
      }

      if (isCompleted) {
        if (existing) {
          existing.completed = true;
          existing.completedAt = new Date().toISOString();
        } else {
          currentAchievements.push({
            id: key,
            ...achievement,
            completed: true,
            completedAt: new Date().toISOString(),
          });
        }
        hasNewAchievement = true;

        // Notifier le joueur
        showAchievementNotification(achievement);
      }
    });

    if (hasNewAchievement) {
      setAchievements(currentAchievements);
      localStorage.setItem("achievements", JSON.stringify(currentAchievements));
    }
  };

  const showAchievementNotification = (achievement) => {
    const notification = document.createElement("div");
    notification.className = "achievement-notification";
    notification.innerHTML = `
      <div class="achievement-content">
        <h3>🏆 Achievement Débloqué !</h3>
        <p><strong>${achievement.name}</strong></p>
        <p>${achievement.description}</p>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 4000);
  };

  const claimAchievementReward = (achievementId) => {
    const achievement = achievements.find((a) => a.id === achievementId);
    if (!achievement || achievement.claimed) return;

    achievement.claimed = true;
    setAchievements([...achievements]);
    localStorage.setItem("achievements", JSON.stringify(achievements));

    if (onRewardClaimed) {
      onRewardClaimed(achievement.reward);
    }

    alert(`🎁 Récompense réclamée ! ${JSON.stringify(achievement.reward)}`);
  };

  const updateQuestProgress = (questType, amount = 1) => {
    const newProgress = { ...questProgress };
    if (!newProgress[questType]) {
      newProgress[questType] = 0;
    }

    newProgress[questType] += amount;
    setQuestProgress(newProgress);

    // Sauvegarder
    const savedQuests = JSON.parse(localStorage.getItem("dailyQuests") || "{}");
    savedQuests.progress = newProgress;
    localStorage.setItem("dailyQuests", JSON.stringify(savedQuests));
  };

  const claimQuestReward = (questIndex) => {
    const quest = dailyQuests[questIndex];
    if (!quest || quest.completed) return;

    const progress = questProgress[quest.type] || 0;
    if (progress < quest.target) return;

    quest.completed = true;
    setDailyQuests([...dailyQuests]);

    if (onRewardClaimed) {
      onRewardClaimed(quest.reward);
    }

    alert(`🎁 Quête terminée ! ${JSON.stringify(quest.reward)}`);
  };

  return (
    <div className="achievements-panel">
      <div className="achievements-tabs">
        <button
          className={`tab ${activeTab === "achievements" ? "active" : ""}`}
          onClick={() => setActiveTab("achievements")}
        >
          🏆 Achievements
        </button>
        <button
          className={`tab ${activeTab === "dailyQuests" ? "active" : ""}`}
          onClick={() => setActiveTab("dailyQuests")}
        >
          📋 Quêtes Journalières
        </button>
      </div>

      {activeTab === "achievements" && (
        <div className="achievements-content">
          <h3>🏆 Vos Achievements</h3>
          <div className="achievements-grid">
            {Object.entries(GameBalance.ACHIEVEMENTS).map(
              ([key, achievement]) => {
                const userAchievement = achievements.find((a) => a.id === key);
                const isCompleted =
                  userAchievement && userAchievement.completed;
                const isClaimed = userAchievement && userAchievement.claimed;

                return (
                  <div
                    key={key}
                    className={`achievement-card ${
                      isCompleted ? "completed" : "locked"
                    }`}
                  >
                    <div className="achievement-icon">
                      {isCompleted ? "🏆" : "🔒"}
                    </div>
                    <div className="achievement-info">
                      <h4>{achievement.name}</h4>
                      <p>{achievement.description}</p>
                      <div className="achievement-reward">
                        🎁 Récompense: {JSON.stringify(achievement.reward)}
                      </div>
                    </div>
                    {isCompleted && !isClaimed && (
                      <button
                        className="claim-button"
                        onClick={() => claimAchievementReward(key)}
                      >
                        🎁 Réclamer
                      </button>
                    )}
                    {isClaimed && (
                      <div className="claimed-badge">✅ Réclamé</div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {activeTab === "dailyQuests" && (
        <div className="daily-quests-content">
          <h3>📋 Quêtes du Jour</h3>
          <p>Se renouvellent chaque jour !</p>

          <div className="quests-grid">
            {dailyQuests.map((quest, index) => {
              const progress = questProgress[quest.type] || 0;
              const isCompleted = progress >= quest.target;
              const progressPercent = Math.min(
                100,
                (progress / quest.target) * 100
              );

              return (
                <div
                  key={index}
                  className={`quest-card ${isCompleted ? "completed" : ""}`}
                >
                  <div className="quest-info">
                    <h4>
                      {quest.description.replace("{target}", quest.target)}
                    </h4>
                    <div className="quest-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {progress} / {quest.target}
                      </span>
                    </div>
                    <div className="quest-reward">
                      🎁 {JSON.stringify(quest.reward)}
                    </div>
                  </div>
                  {isCompleted && !quest.completed && (
                    <button
                      className="claim-quest-button"
                      onClick={() => claimQuestReward(index)}
                    >
                      🎁 Réclamer
                    </button>
                  )}
                  {quest.completed && (
                    <div className="completed-badge">✅ Terminé</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AchievementsPanel;
