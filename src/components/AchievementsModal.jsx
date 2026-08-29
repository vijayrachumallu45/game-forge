import { getAllAchievements } from '../utils/storage';

export default function AchievementsModal({ onClose }) {
  const achievements = getAllAchievements();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎖️ ARCADE ACHIEVEMENTS</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="achievements-summary">
          <span>Unlocked: <strong>{unlockedCount} / {achievements.length}</strong> Badges</span>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="achievements-list">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`achievement-card ${item.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">{item.icon}</div>
              <div className="achievement-info">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
              <div className="achievement-status">
                {item.unlocked ? '✅ UNLOCKED' : '🔒 LOCKED'}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="action-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
