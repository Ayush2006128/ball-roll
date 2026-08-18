'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { TrackSegment } from '../engine/types';
import { TRACK_WIDTH, TRACK_SEGMENT_LENGTH, RAINBOW_COLORS } from '../engine/constants';

interface TrackProps {
  segments: TrackSegment[];
}

function TrackPiece({ segment }: { segment: TrackSegment }) {
  const color = RAINBOW_COLORS[segment.colorIndex];
  
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(TRACK_WIDTH, 0.3, TRACK_SEGMENT_LENGTH);
    return geo;
  }, []);
  
  // Calculate the center position of this segment
  // The segment.position is the start; we need to offset to center
  const centerX = segment.position[0] + Math.sin(segment.rotation) * TRACK_SEGMENT_LENGTH / 2;
  const centerZ = segment.position[2] - Math.cos(segment.rotation) * TRACK_SEGMENT_LENGTH / 2;
  
  return (
    <group>
      {/* Main track surface */}
      <mesh
        position={[centerX, segment.elevation - 0.15, centerZ]}
        rotation={[0, segment.rotation, 0]}
        receiveShadow
        geometry={geometry}
      >
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
      
      {/* Side rails - left */}
      <mesh
        position={[
          centerX + Math.cos(segment.rotation) * (TRACK_WIDTH / 2 + 0.1),
          segment.elevation + 0.1,
          centerZ - Math.sin(segment.rotation) * (TRACK_WIDTH / 2 + 0.1),
        ]}
        rotation={[0, segment.rotation, 0]}
      >
        <boxGeometry args={[0.15, 0.5, TRACK_SEGMENT_LENGTH]} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Side rails - right */}
      <mesh
        position={[
          centerX - Math.cos(segment.rotation) * (TRACK_WIDTH / 2 + 0.1),
          segment.elevation + 0.1,
          centerZ + Math.sin(segment.rotation) * (TRACK_WIDTH / 2 + 0.1),
        ]}
        rotation={[0, segment.rotation, 0]}
      >
        <boxGeometry args={[0.15, 0.5, TRACK_SEGMENT_LENGTH]} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Turn indicator */}
      {segment.isTurn && (
        <mesh
          position={[
            segment.position[0] + Math.sin(segment.rotation) * TRACK_SEGMENT_LENGTH * 0.8,
            segment.elevation + 1.5,
            segment.position[2] - Math.cos(segment.rotation) * TRACK_SEGMENT_LENGTH * 0.8,
          ]}
        >
          <coneGeometry args={[0.3, 0.8, 4]} />
          <meshStandardMaterial
            color={segment.turnDirection === 'left' ? '#ff4444' : '#44ff44'}
            emissive={segment.turnDirection === 'left' ? '#ff4444' : '#44ff44'}
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

export default function Track({ segments }: TrackProps) {
  return (
    <group>
      {segments.map((segment) => (
        <TrackPiece key={segment.id} segment={segment} />
      ))}
    </group>
  );
}
