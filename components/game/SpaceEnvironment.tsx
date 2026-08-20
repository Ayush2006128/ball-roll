'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STAR_COUNT } from '@/engine/constants';

export default function SpaceEnvironment() {
  const starsRef = useRef<THREE.Points>(null);

  const starPositions = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;
      // Distribute stars in a large sphere
      const radius = 200 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Slightly colored stars
      const colorChoice = Math.random();
      if (colorChoice < 0.1) {
        colors[i3] = 0.8; colors[i3 + 1] = 0.9; colors[i3 + 2] = 1.0; // blue-white
      } else if (colorChoice < 0.15) {
        colors[i3] = 1.0; colors[i3 + 1] = 0.85; colors[i3 + 2] = 0.6; // warm
      } else {
        colors[i3] = 1.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 1.0; // white
      }
    }

    return { positions, colors };
  }, []);

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.00005;
    }
  });

  return (
    <>
      {/* Stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[starPositions.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.5}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Ambient light - dim for space */}
      <ambientLight intensity={0.3} color="#334466" />

      {/* Main directional light - distant star */}
      <directionalLight
        position={[50, 100, 50]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Colored accent lights */}
      <pointLight position={[-30, 20, -30]} color="#ff00ff" intensity={0.3} distance={100} />
      <pointLight position={[30, 20, 30]} color="#00ffff" intensity={0.3} distance={100} />

      {/* Fog-like atmosphere */}
      <fog attach="fog" args={['#050510', 50, 400]} />
    </>
  );
}
