'use client';

import { useCallback, useEffect, useRef } from 'react';
import GameScene from './components/GameScene';
import HUD from './components/HUD';
import StartScreen from './components/StartScreen';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameInput } from './hooks/useGameInput';

export default function GameClient() {
  const {
    gameData,
    segments,
    ballPosition,
    ballRotation,
    startGame,
    update,
  } = useGameLoop();

  const { inputState, consumeSwipe } = useGameInput();
  const rafRef = useRef<number>(0);

  const gameLoop = useCallback((time: number) => {
    update(time, inputState.isPressed, inputState.swipeDirection);
    if (inputState.swipeDirection) {
      consumeSwipe();
    }
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [update, inputState, consumeSwipe]);

  useEffect(() => {
    if (gameData.state === 'playing') {
      rafRef.current = requestAnimationFrame(gameLoop);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [gameData.state, gameLoop]);

  const handleStart = useCallback(() => {
    if (gameData.state !== 'playing') {
      startGame();
    }
  }, [gameData.state, startGame]);

  return (
    <div className="game-container">
      <GameScene
        segments={segments}
        ballPosition={ballPosition}
        ballRotation={ballRotation}
        speed={gameData.speed}
        gameState={gameData.state}
      />
      <HUD gameData={gameData} />
      <StartScreen
        gameState={gameData.state}
        score={gameData.score}
        highScore={gameData.highScore}
        onStart={handleStart}
      />
    </div>
  );
}
