import { TrackSegment, Direction } from './types';
import {
  TRACK_SEGMENT_LENGTH,
  TURN_PROBABILITY,
  HILL_PROBABILITY,
  HILL_HEIGHT,
  VALLEY_DEPTH,
  RAINBOW_COLORS,
} from './constants';

let segmentIdCounter = 0;
let currentDirection: Direction = 'forward';
let currentRotation = 0; // radians
let currentPosition: [number, number, number] = [0, 0, 0];
let currentColorIndex = 0;
let currentElevation = 0;
let lastTurnAt = 0;
let straightSegmentsSinceTurn = 0;

export function resetTrackGenerator() {
  segmentIdCounter = 0;
  currentDirection = 'forward';
  currentRotation = 0;
  currentPosition = [0, 0, 0];
  currentColorIndex = 0;
  currentElevation = 0;
  lastTurnAt = 0;
  straightSegmentsSinceTurn = 0;
}

export function generateSegment(): TrackSegment {
  const id = segmentIdCounter++;
  
  // Decide if this segment is a turn (not for the first 5 segments)
  let isTurn = false;
  let turnDirection: 'left' | 'right' | undefined;
  
  if (id > 5 && straightSegmentsSinceTurn >= 3 && Math.random() < TURN_PROBABILITY) {
    isTurn = true;
    turnDirection = Math.random() < 0.5 ? 'left' : 'right';
    straightSegmentsSinceTurn = 0;
  } else {
    straightSegmentsSinceTurn++;
  }
  
  // Decide elevation changes
  let isHill = false;
  let hillType: 'peak' | 'valley' | undefined;
  
  if (id > 3 && !isTurn && Math.random() < HILL_PROBABILITY) {
    isHill = true;
    hillType = Math.random() < 0.5 ? 'peak' : 'valley';
    const heightChange = hillType === 'peak' ? HILL_HEIGHT : -VALLEY_DEPTH;
    currentElevation += heightChange;
    // Clamp elevation so track doesn't go too far underground
    currentElevation = Math.max(-3, currentElevation);
  }
  
  const segment: TrackSegment = {
    id,
    position: [...currentPosition] as [number, number, number],
    direction: currentDirection,
    rotation: currentRotation,
    elevation: currentElevation,
    colorIndex: currentColorIndex % RAINBOW_COLORS.length,
    isTurn,
    turnDirection,
    isHill,
    hillType,
  };
  
  // Update position for next segment (advance in current segment's direction)
  const dx = Math.sin(currentRotation) * TRACK_SEGMENT_LENGTH;
  const dz = -Math.cos(currentRotation) * TRACK_SEGMENT_LENGTH;
  
  currentPosition = [
    currentPosition[0] + dx,
    currentElevation,
    currentPosition[2] + dz,
  ];
  
  // Apply turn rotation for next segment (after advancing position)
  if (isTurn && turnDirection) {
    currentRotation += turnDirection === 'left' ? -Math.PI / 2 : Math.PI / 2;
  }
  
  currentColorIndex++;
  
  return segment;
}

export function generateInitialTrack(count: number): TrackSegment[] {
  resetTrackGenerator();
  const segments: TrackSegment[] = [];
  for (let i = 0; i < count; i++) {
    segments.push(generateSegment());
  }
  return segments;
}
