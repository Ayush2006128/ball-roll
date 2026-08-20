'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BALL_RADIUS } from '@/engine/constants';

interface BallProps {
  position: [number, number, number];
  speed: number;
}

export default function Ball({ position, speed }: BallProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Spin the ball based on speed
      meshRef.current.rotation.x += speed * delta * 0.5;
    }
    if (glowRef.current) {
      // Pulsing glow
      glowRef.current.intensity = 2 + Math.sin(Date.now() * 0.005) * 0.5;
    }
  });
  
  return (
    <group position={position}>
      {/* Main ball */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.9}
          roughness={0.1}
          emissive="#4488ff"
          emissiveIntensity={0.3}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Inner glow */}
      <pointLight
        ref={glowRef}
        color="#66aaff"
        intensity={2}
        distance={8}
        decay={2}
      />
      
      {/* Trail effect - subtle glow behind */}
      <mesh position={[0, 0, BALL_RADIUS * 1.5]}>
        <sphereGeometry args={[BALL_RADIUS * 0.6, 16, 16]} />
        <meshBasicMaterial
          color="#4488ff"
          transparent
          opacity={Math.min(speed / 30, 0.4)}
        />
      </mesh>
    </group>
  );
}
