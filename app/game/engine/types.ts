export type Direction = 'forward' | 'left' | 'right';

export interface TrackSegment {
  id: number;
  position: [number, number, number];
  direction: Direction;
  rotation: number; // Y-axis rotation in radians
  elevation: number;
  colorIndex: number;
  isTurn: boolean;
  turnDirection?: 'left' | 'right';
  isHill?: boolean;
  hillType?: 'peak' | 'valley';
}

export type GameState = 'idle' | 'playing' | 'gameover';

export interface GameData {
  state: GameState;
  score: number;
  highScore: number;
  speed: number;
  distance: number;
}

export interface InputState {
  isPressed: boolean;
  swipeDirection: 'left' | 'right' | null;
}
