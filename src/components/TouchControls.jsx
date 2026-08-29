import { useEffect, useState } from 'react';

export default function TouchControls({ onDirection, onAction, onSecondary }) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect mobile touch capability or screen width
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  if (!isTouchDevice) return null;

  return (
    <div className="touch-controls-container">
      <div className="d-pad">
        <button
          className="d-btn up"
          onTouchStart={(e) => { e.preventDefault(); onDirection('up', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirection('up', false); }}
          onMouseDown={() => onDirection('up', true)}
          onMouseUp={() => onDirection('up', false)}
        >
          ▲
        </button>
        <div className="d-row">
          <button
            className="d-btn left"
            onTouchStart={(e) => { e.preventDefault(); onDirection('left', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirection('left', false); }}
            onMouseDown={() => onDirection('left', true)}
            onMouseUp={() => onDirection('left', false)}
          >
            ◀
          </button>
          <button
            className="d-btn right"
            onTouchStart={(e) => { e.preventDefault(); onDirection('right', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirection('right', false); }}
            onMouseDown={() => onDirection('right', true)}
            onMouseUp={() => onDirection('right', false)}
          >
            ▶
          </button>
        </div>
        <button
          className="d-btn down"
          onTouchStart={(e) => { e.preventDefault(); onDirection('down', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirection('down', false); }}
          onMouseDown={() => onDirection('down', true)}
          onMouseUp={() => onDirection('down', false)}
        >
          ▼
        </button>
      </div>

      <div className="action-pad">
        {onSecondary && (
          <button
            className="action-btn secondary"
            onTouchStart={(e) => { e.preventDefault(); onSecondary(true); }}
            onTouchEnd={(e) => { e.preventDefault(); onSecondary(false); }}
            onMouseDown={() => onSecondary(true)}
            onMouseUp={() => onSecondary(false)}
          >
            B
          </button>
        )}
        <button
          className="action-btn primary"
          onTouchStart={(e) => { e.preventDefault(); onAction(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onAction(false); }}
          onMouseDown={() => onAction(true)}
          onMouseUp={() => onAction(false)}
        >
          A
        </button>
      </div>
    </div>
  );
}
