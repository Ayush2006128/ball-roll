'use client';

import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Ball from './Ball';
import Track from './Track';
import SpaceEnvironment from './SpaceEnvironment';
import CameraController from './CameraController';
import { TrackSegment, GameState } from '@/engine/types';

interface GameSceneProps {
  segments: TrackSegment[];
  ballPosition: [number, number, number];
  ballRotation: number;
  speed: number;
  gameState: GameState;
}

export default function GameScene({
  segments,
  ballPosition,
  ballRotation,
  speed,
  gameState,
}: GameSceneProps) {
  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      camera={{ fov: 65, near: 0.1, far: 1000, position: [0, 10, 15] }}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        touchAction: 'none',
      }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#050510']} />
      <SpaceEnvironment />
      <Track segments={segments} />
      {gameState !== 'idle' && (
        <Ball position={ballPosition} speed={speed} />
      )}
      <CameraController
        target={ballPosition}
        rotation={ballRotation}
        isPlaying={gameState === 'playing'}
      />
    </Canvas>
  );
}
