// Physics
export const GRAVITY = -20;
export const MAX_SPEED = 45;
export const ACCELERATION = 28;
export const DECELERATION = 6;
export const TURN_SPEED = 5;
export const BALL_RADIUS = 0.5;
export const TRACK_WIDTH = 4;
export const TRACK_SEGMENT_LENGTH = 8;
export const SEGMENTS_AHEAD = 25;
export const SEGMENTS_BEHIND = 5;
export const STOP_TIMEOUT = 3000; // ms
export const MIN_SPEED_THRESHOLD = 0.3;

// Track generation
export const TURN_PROBABILITY = 0.18;
export const HILL_PROBABILITY = 0.3;
export const HILL_HEIGHT = 3;
export const VALLEY_DEPTH = 2;

// Visual
export const RAINBOW_COLORS = [
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'
] as const;

export const STAR_COUNT = 2000;
