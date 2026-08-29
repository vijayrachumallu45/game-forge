import { sound } from '../utils/soundEngine';

export default function KeyboardShortcutsModal({ onClose }) {
  const controlsList = [
    { key: '⬆️ ⬇️ ⬅️ ➡️ / WASD', action: 'Move / Steer Ship or Snake' },
    { key: 'SPACEBAR', action: 'Shoot Laser / Jump / Boost' },
    { key: 'P / ESC', action: 'Pause / Resume Game' },
    { key: 'M', action: 'Toggle Sound Effects Mute' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⌨️ KEYBOARD CONTROLS & SHORTCUTS</h2>
          <button
            className="close-btn"
            onClick={() => {
              sound.playSound('bounce');
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        <div className="shortcuts-body">
          <ul className="shortcuts-list" style={{ listStyle: 'none', padding: 0, margin: '20px 0' }}>
            {controlsList.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#00ffff' }}>
                  {item.key}
                </span>
                <span style={{ color: '#e0e0e0', fontSize: '0.95rem' }}>
                  {item.action}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="modal-footer">
          <button
            className="action-btn"
            onClick={() => {
              sound.playSound('bounce');
              onClose();
            }}
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
