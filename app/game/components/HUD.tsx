'use client';

import { GameData } from '../engine/types';

interface HUDProps {
  gameData: GameData;
}

export default function HUD({ gameData }: HUDProps) {
  if (gameData.state !== 'playing') return null;

  return (
    <div className="hud-container">
      <div className="hud-score">
        <div className="hud-score-label">SCORE</div>
        <div className="hud-score-value">{gameData.score.toLocaleString()}</div>
      </div>

      <div className="hud-right">
        <div className="hud-speed">
          <div className="hud-speed-bar">
            <div
              className="hud-speed-fill"
              style={{ width: `${Math.min((gameData.speed / 45) * 100, 100)}%` }}
            />
          </div>
          <div className="hud-speed-label">{gameData.speed} km/h</div>
        </div>

        <div className="hud-highscore">
          <span className="hud-highscore-icon">★</span>
          <span>{gameData.highScore.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
