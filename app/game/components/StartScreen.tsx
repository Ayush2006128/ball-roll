'use client';

import { GameState } from '../engine/types';

interface StartScreenProps {
  gameState: GameState;
  score: number;
  highScore: number;
}

export default function StartScreen({ gameState, score, highScore }: StartScreenProps) {
  if (gameState === 'playing') return null;

  return (
    <div className="overlay-container">
      <div className="overlay-content">
        {gameState === 'idle' ? (
          <>
            <h1 className="game-title">BALL ROLL</h1>
            <p className="game-subtitle">Endless Space Runner</p>
            <div className="start-prompt">
              <div className="tap-circle">
                <div className="tap-circle-inner" />
              </div>
              <p>TAP TO START</p>
            </div>
            <div className="controls-info">
              <div className="control-item">
                <span className="control-icon">👆</span>
                <span>Hold to accelerate</span>
              </div>
              <div className="control-item">
                <span className="control-icon">👈👉</span>
                <span>Swipe to turn</span>
              </div>
            </div>
            {highScore > 0 && (
              <div className="best-score">
                <span className="best-score-icon">★</span>
                Best: {highScore.toLocaleString()}
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="gameover-title">GAME OVER</h1>
            <div className="gameover-scores">
              <div className="gameover-score">
                <div className="gameover-score-label">SCORE</div>
                <div className="gameover-score-value">{score.toLocaleString()}</div>
              </div>
              <div className="gameover-divider" />
              <div className="gameover-score">
                <div className="gameover-score-label">BEST</div>
                <div className="gameover-score-value gameover-best">{highScore.toLocaleString()}</div>
              </div>
            </div>
            {score >= highScore && score > 0 && (
              <div className="new-highscore-badge">🏆 NEW HIGH SCORE!</div>
            )}
            <div className="start-prompt">
              <p>TAP TO PLAY AGAIN</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
