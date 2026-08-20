'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { GameState, GameData, TrackSegment } from '@/engine/types';
import { generateInitialTrack, generateSegment, resetTrackGenerator } from '@/engine/trackGenerator';
import { getHighScore, setHighScore } from '@/engine/scoreManager';
import { playHighScoreSound, playGameOverSound, playTurnSound } from '@/engine/audioManager';
import {
  MAX_SPEED,
  ACCELERATION,
  DECELERATION,
  GRAVITY,
  SEGMENTS_AHEAD,
  SEGMENTS_BEHIND,
  TRACK_SEGMENT_LENGTH,
  TRACK_WIDTH,
  BALL_RADIUS,
  STOP_TIMEOUT,
  MIN_SPEED_THRESHOLD,
} from '@/engine/constants';

interface BallPhysics {
  position: [number, number, number];
  velocity: number;
  rotation: number; // current heading
  verticalVelocity: number;
  isOnGround: boolean;
  currentSegmentIndex: number;
  segmentProgress: number; // 0-1 progress through current segment
}

export function useGameLoop() {
  const [gameData, setGameData] = useState<GameData>({
    state: 'idle',
    score: 0,
    highScore: getHighScore(),
    speed: 0,
    distance: 0,
  });
  
  const [segments, setSegments] = useState<TrackSegment[]>([]);
  const [ballPosition, setBallPosition] = useState<[number, number, number]>([0, BALL_RADIUS, 0]);
  const [ballRotation, setBallRotation] = useState(0);
  
  const physicsRef = useRef<BallPhysics>({
    position: [0, BALL_RADIUS, 0],
    velocity: 0,
    rotation: 0,
    verticalVelocity: 0,
    isOnGround: true,
    currentSegmentIndex: 0,
    segmentProgress: 0,
  });
  
  const segmentsRef = useRef<TrackSegment[]>([]);
  const gameStateRef = useRef<GameState>('idle');
  const stoppedTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(getHighScore());
  const isPressedRef = useRef(false);
  const pendingTurnRef = useRef<'left' | 'right' | null>(null);
  const hasNewHighScoreRef = useRef(false);
  
  const startGame = useCallback(() => {
    resetTrackGenerator();
    const initial = generateInitialTrack(SEGMENTS_AHEAD + 5);
    segmentsRef.current = initial;
    setSegments([...initial]);
    
    physicsRef.current = {
      position: [0, BALL_RADIUS, 0],
      velocity: 0,
      rotation: 0,
      verticalVelocity: 0,
      isOnGround: true,
      currentSegmentIndex: 0,
      segmentProgress: 0,
    };
    
    scoreRef.current = 0;
    stoppedTimeRef.current = null;
    hasNewHighScoreRef.current = false;
    gameStateRef.current = 'playing';
    lastTimeRef.current = performance.now();
    
    setGameData({
      state: 'playing',
      score: 0,
      highScore: highScoreRef.current,
      speed: 0,
      distance: 0,
    });
    
    setBallPosition([0, BALL_RADIUS, 0]);
    setBallRotation(0);
  }, []);
  
  const endGame = useCallback(() => {
    gameStateRef.current = 'gameover';
    const finalScore = Math.floor(scoreRef.current);
    const isNew = setHighScore(finalScore);
    if (isNew) {
      highScoreRef.current = finalScore;
      playHighScoreSound();
    } else {
      playGameOverSound();
    }
    setGameData(prev => ({
      ...prev,
      state: 'gameover',
      score: finalScore,
      highScore: Math.max(highScoreRef.current, finalScore),
    }));
  }, []);
  
  const getTrackElevationAt = useCallback((segIndex: number, progress: number): number => {
    const segs = segmentsRef.current;
    if (segIndex < 0 || segIndex >= segs.length) return 0;
    
    const seg = segs[segIndex];
    const nextSeg = segIndex + 1 < segs.length ? segs[segIndex + 1] : null;
    
    const currentElev = seg.elevation;
    const nextElev = nextSeg ? nextSeg.elevation : currentElev;
    
    // Smooth interpolation between elevations
    // Use a sine curve for smooth hills
    const t = progress;
    const smoothT = t * t * (3 - 2 * t); // smoothstep
    return currentElev + (nextElev - currentElev) * smoothT;
  }, []);
  
  const getTrackSlope = useCallback((segIndex: number, progress: number): number => {
    const segs = segmentsRef.current;
    if (segIndex < 0 || segIndex >= segs.length) return 0;
    
    const seg = segs[segIndex];
    const nextSeg = segIndex + 1 < segs.length ? segs[segIndex + 1] : null;
    
    const currentElev = seg.elevation;
    const nextElev = nextSeg ? nextSeg.elevation : currentElev;
    
    // Derivative of smoothstep for slope
    const elevDiff = nextElev - currentElev;
    const t = progress;
    const slopeT = 6 * t * (1 - t); // derivative of smoothstep
    return (elevDiff * slopeT) / TRACK_SEGMENT_LENGTH;
  }, []);
  
  const update = useCallback((time: number, isPressed: boolean, swipeDir: 'left' | 'right' | null) => {
    if (gameStateRef.current !== 'playing') return;
    
    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05); // cap dt
    lastTimeRef.current = time;
    
    const physics = physicsRef.current;
    const segs = segmentsRef.current;
    
    if (segs.length === 0) return;
    
    // --- Acceleration / Deceleration ---
    if (isPressed) {
      physics.velocity = Math.min(physics.velocity + ACCELERATION * dt, MAX_SPEED);
      stoppedTimeRef.current = null;
    } else {
      physics.velocity = Math.max(physics.velocity - DECELERATION * dt, 0);
    }
    
    // --- Slope physics ---
    const slope = getTrackSlope(physics.currentSegmentIndex, physics.segmentProgress);
    // Gravity effect on speed based on slope
    // Positive slope = uphill = slower, negative slope = downhill = faster
    physics.velocity += GRAVITY * slope * dt;
    physics.velocity = Math.max(0, Math.min(physics.velocity, MAX_SPEED * 1.3));
    
    // --- Check stopped timeout ---
    if (physics.velocity < MIN_SPEED_THRESHOLD) {
      if (stoppedTimeRef.current === null) {
        stoppedTimeRef.current = time;
      } else if (time - stoppedTimeRef.current > STOP_TIMEOUT) {
        endGame();
        return;
      }
    } else {
      stoppedTimeRef.current = null;
    }
    
    // --- Movement ---
    const distanceMoved = physics.velocity * dt;
    physics.segmentProgress += distanceMoved / TRACK_SEGMENT_LENGTH;
    
    // Handle turn at segment boundary
    while (physics.segmentProgress >= 1 && physics.currentSegmentIndex < segs.length - 1) {
      const currentSeg = segs[physics.currentSegmentIndex];
      
      // Check if this segment has a turn
      if (currentSeg.isTurn && currentSeg.turnDirection) {
        const expectedDir = currentSeg.turnDirection;
        
        if (pendingTurnRef.current === expectedDir) {
          // Correct turn!
          const turnAngle = expectedDir === 'left' ? -Math.PI / 2 : Math.PI / 2;
          physics.rotation += turnAngle;
          pendingTurnRef.current = null;
          playTurnSound();
        } else {
          // Missed the turn - fell off!
          endGame();
          return;
        }
      }
      
      physics.segmentProgress -= 1;
      physics.currentSegmentIndex++;
    }
    
    // Handle swipe input for turns
    if (swipeDir) {
      pendingTurnRef.current = swipeDir;
    }
    
    // --- Position calculation ---
    const segIdx = physics.currentSegmentIndex;
    if (segIdx >= segs.length) {
      endGame();
      return;
    }
    
    const seg = segs[segIdx];
    const progress = physics.segmentProgress;
    
    // Calculate position along the track
    const trackElev = getTrackElevationAt(segIdx, progress);
    const forwardX = Math.sin(physics.rotation) * progress * TRACK_SEGMENT_LENGTH;
    const forwardZ = -Math.cos(physics.rotation) * progress * TRACK_SEGMENT_LENGTH;
    
    physics.position = [
      seg.position[0] + forwardX,
      trackElev + BALL_RADIUS,
      seg.position[2] + forwardZ,
    ];
    
    // --- Score ---
    scoreRef.current += distanceMoved * 2;
    
    // --- Check for new high score during play ---
    if (!hasNewHighScoreRef.current && scoreRef.current > highScoreRef.current && highScoreRef.current > 0) {
      hasNewHighScoreRef.current = true;
      playHighScoreSound();
    }
    
    // --- Generate new segments ahead ---
    while (segs.length - segIdx < SEGMENTS_AHEAD) {
      segs.push(generateSegment());
    }
    
    // --- Remove old segments ---
    if (segIdx > SEGMENTS_BEHIND) {
      const removeCount = segIdx - SEGMENTS_BEHIND;
      segs.splice(0, removeCount);
      physics.currentSegmentIndex -= removeCount;
    }
    
    // --- Update React state (throttled) ---
    segmentsRef.current = segs;
    setBallPosition([...physics.position] as [number, number, number]);
    setBallRotation(physics.rotation);
    setSegments([...segs]);
    setGameData({
      state: 'playing',
      score: Math.floor(scoreRef.current),
      highScore: Math.max(highScoreRef.current, Math.floor(scoreRef.current)),
      speed: Math.round(physics.velocity),
      distance: Math.floor(scoreRef.current / 2),
    });
  }, [endGame, getTrackElevationAt, getTrackSlope]);
  
  return {
    gameData,
    segments,
    ballPosition,
    ballRotation,
    startGame,
    endGame,
    update,
  };
}
