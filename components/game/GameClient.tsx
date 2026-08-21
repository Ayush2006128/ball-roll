'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import GameScene from './GameScene';
import HUD from './HUD';
import StartScreen from './StartScreen';
import SettingsDialog, { BALL_SKINS, GameSettings } from './SettingsDialog';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useGameInput } from '@/hooks/useGameInput';
import { setFxMuted } from '@/engine/audioManager';

const SETTINGS_STORAGE_KEY = 'ball-roll-settings';

function loadSettings(): GameSettings {
  if (typeof window === 'undefined') {
    return { skinId: 'default', fxMuted: false, musicMuted: false };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameSettings>;
      return {
        skinId: parsed.skinId ?? 'default',
        fxMuted: parsed.fxMuted ?? false,
        musicMuted: parsed.musicMuted ?? false,
      };
    }
  } catch {
    // ignore
  }
  return { skinId: 'default', fxMuted: false, musicMuted: false };
}

function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

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
  const inputRef = useRef(inputState);
  inputRef.current = inputState;

  // ── Settings state ──
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sync FX mute with audio manager whenever settings change
  useEffect(() => {
    setFxMuted(settings.fxMuted);
    saveSettings(settings);
  }, [settings]);

  const handleSettingsChange = useCallback((next: GameSettings) => {
    setSettings(next);
  }, []);

  // Resolve selected skin → texture path
  const selectedSkin = BALL_SKINS.find((s) => s.id === settings.skinId) ?? BALL_SKINS[0];
  const texturePath = selectedSkin.texture;

  const gameLoop = useCallback((time: number) => {
    const input = inputRef.current;
    update(time, input.isPressed, input.swipeDirection);
    if (input.swipeDirection) {
      consumeSwipe();
    }
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [update, consumeSwipe]);

  useEffect(() => {
    if (gameData.state === 'playing') {
      rafRef.current = requestAnimationFrame(gameLoop);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [gameData.state, gameLoop]);

  // Request fullscreen on first user interaction (browsers require a gesture)
  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (document.fullscreenElement) return;
    el.requestFullscreen?.().catch(() => {
      // Silently ignore — some browsers/contexts don't support it
    });
  }, []);

  // Start game on tap/click/key press when not playing
  // Ignore if the settings dialog is open so tapping inside it doesn't start a game
  useEffect(() => {
    if (inputState.isPressed && gameData.state !== 'playing' && !settingsOpen) {
      requestFullscreen();
      startGame();
    }
  }, [inputState.isPressed, gameData.state, startGame, settingsOpen, requestFullscreen]);

  return (
    <div className="game-container">
      <GameScene
        segments={segments}
        ballPosition={ballPosition}
        ballRotation={ballRotation}
        speed={gameData.speed}
        gameState={gameData.state}
        texturePath={texturePath}
      />
      <HUD gameData={gameData} />
      <StartScreen
        gameState={gameData.state}
        score={gameData.score}
        highScore={gameData.highScore}
      />

      {/* Settings gear — always visible */}
      <button
        className="settings-gear-btn"
        onClick={(e) => {
          e.stopPropagation();
          setSettingsOpen(true);
        }}
        aria-label="Open settings"
      >
        <Settings size={20} />
      </button>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
