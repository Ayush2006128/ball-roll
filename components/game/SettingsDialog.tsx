'use client';

import { useState, useCallback } from 'react';
import { Settings, X, ChevronLeft, ChevronRight, Volume2, VolumeOff, Headphones, HeadphoneOff } from 'lucide-react';

export interface BallSkin {
  id: string;
  name: string;
  /** null = use the original material (no texture) */
  texture: string | null;
  /** Accent colour used for the preview ring & glow */
  accent: string;
}

export const BALL_SKINS: BallSkin[] = [
  { id: 'default', name: 'Default',  texture: null,                                accent: '#6c63ff' },
  { id: 'earth',   name: 'Earth',    texture: '/assets/textures/earth_txmap.jpg',   accent: '#4488ff' },
  { id: 'mars',    name: 'Mars',     texture: '/assets/textures/mars_txmap.jpg',    accent: '#e05030' },
  { id: 'moon',    name: 'Moon',     texture: '/assets/textures/moon_txmap.jpg',    accent: '#aaaacc' },
  { id: 'venus',   name: 'Venus',    texture: '/assets/textures/venus_txmap.jpg',   accent: '#d4a84a' },
];

export interface GameSettings {
  skinId: string;
  fxMuted: boolean;
  musicMuted: boolean;
}

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

export default function SettingsDialog({
  open,
  onClose,
  settings,
  onSettingsChange,
}: SettingsDialogProps) {
  const currentIndex = BALL_SKINS.findIndex((s) => s.id === settings.skinId);
  const [previewIndex, setPreviewIndex] = useState(currentIndex === -1 ? 0 : currentIndex);

  const skin = BALL_SKINS[previewIndex];

  const prev = useCallback(() => {
    setPreviewIndex((i) => (i - 1 + BALL_SKINS.length) % BALL_SKINS.length);
  }, []);

  const next = useCallback(() => {
    setPreviewIndex((i) => (i + 1) % BALL_SKINS.length);
  }, []);

  const selectSkin = useCallback(() => {
    onSettingsChange({ ...settings, skinId: skin.id });
  }, [onSettingsChange, settings, skin.id]);

  const toggleFx = useCallback(() => {
    onSettingsChange({ ...settings, fxMuted: !settings.fxMuted });
  }, [onSettingsChange, settings]);

  const toggleMusic = useCallback(() => {
    onSettingsChange({ ...settings, musicMuted: !settings.musicMuted });
  }, [onSettingsChange, settings]);

  if (!open) return null;

  const isSelected = settings.skinId === skin.id;

  return (
    <div className="settings-backdrop" data-ui onClick={onClose}>
      <div
        className="settings-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="settings-header">
          <div className="settings-title-row">
            <Settings size={18} />
            <h2 className="settings-title">Settings</h2>
          </div>
          <button className="settings-close" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        {/* ── Ball Skin Carousel ── */}
        <div className="settings-section">
          <h3 className="settings-section-label">BALL SKIN</h3>

          <div className="skin-carousel">
            <button className="carousel-arrow" onClick={prev} aria-label="Previous skin">
              <ChevronLeft size={22} />
            </button>

            <div className="skin-preview-wrapper">
              {/* Preview circle – shows the texture as a background-image sphere */}
              <div
                className="skin-preview"
                style={{
                  backgroundImage: skin.texture ? `url(${skin.texture})` : undefined,
                  backgroundColor: skin.texture ? undefined : '#2a2a40',
                  boxShadow: `0 0 28px ${skin.accent}44, inset 0 0 20px ${skin.accent}22`,
                  borderColor: isSelected ? skin.accent : 'var(--color-glass-border)',
                }}
              >
                {!skin.texture && (
                  <div className="skin-preview-default-gradient" />
                )}
              </div>

              <span className="skin-name">{skin.name}</span>
              <span className="skin-counter">
                {previewIndex + 1} / {BALL_SKINS.length}
              </span>
            </div>

            <button className="carousel-arrow" onClick={next} aria-label="Next skin">
              <ChevronRight size={22} />
            </button>
          </div>

          <button
            className={`skin-select-btn ${isSelected ? 'skin-selected' : ''}`}
            onClick={selectSkin}
            disabled={isSelected}
            style={{
              '--btn-accent': skin.accent,
            } as React.CSSProperties}
          >
            {isSelected ? '✓ Equipped' : 'Equip'}
          </button>
        </div>

        {/* ── Audio Toggles ── */}
        <div className="settings-section">
          <h3 className="settings-section-label">AUDIO</h3>

          <div className="settings-toggles">
            {/* FX toggle */}
            <div className="toggle-row">
              <div className="toggle-label-group">
                {settings.fxMuted
                  ? <VolumeOff size={16} className="toggle-icon muted" />
                  : <Volume2 size={16} className="toggle-icon" />}
                <span className="toggle-label">Sound FX</span>
              </div>
              <button
                className={`toggle-switch ${!settings.fxMuted ? 'toggle-on' : ''}`}
                onClick={toggleFx}
                role="switch"
                aria-checked={!settings.fxMuted}
                aria-label="Toggle sound effects"
              >
                <span className="toggle-knob" />
              </button>
            </div>

            {/* Music toggle */}
            <div className="toggle-row">
              <div className="toggle-label-group">
                {settings.musicMuted
                  ? <HeadphoneOff size={16} className="toggle-icon muted" />
                  : <Headphones size={16} className="toggle-icon" />}
                <span className="toggle-label">Music</span>
              </div>
              <button
                className={`toggle-switch ${!settings.musicMuted ? 'toggle-on' : ''}`}
                onClick={toggleMusic}
                role="switch"
                aria-checked={!settings.musicMuted}
                aria-label="Toggle music"
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
