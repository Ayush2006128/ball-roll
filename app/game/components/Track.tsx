'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { TrackSegment } from '../engine/types';
import { TRACK_WIDTH, TRACK_SEGMENT_LENGTH, RAINBOW_COLORS } from '../engine/constants';

interface TrackProps {
  segments: TrackSegment[];
}

function TrackPiece({
  segment,
  nextSegment,
}: {
  segment: TrackSegment;
  nextSegment?: TrackSegment;
}) {
  const color = RAINBOW_COLORS[segment.colorIndex];
  const endPosition: [number, number, number] = nextSegment
    ? nextSegment.position
    : ([
        segment.position[0] + Math.sin(segment.rotation) * TRACK_SEGMENT_LENGTH,
        segment.elevation,
        segment.position[2] - Math.cos(segment.rotation) * TRACK_SEGMENT_LENGTH,
      ] as [number, number, number]);
  const endElevation = nextSegment ? nextSegment.elevation : segment.elevation;

  const startRotation = segment.rotation;
  const endRotation = nextSegment ? nextSegment.rotation : segment.rotation;

  const sideOffset = TRACK_WIDTH / 2;
  const railOffset = sideOffset + 0.1;

  const startLeft = useMemo<[number, number, number]>(() => ([
    segment.position[0] + Math.cos(startRotation) * sideOffset,
    segment.elevation,
    segment.position[2] - Math.sin(startRotation) * sideOffset,
  ]), [segment.position, segment.elevation, startRotation, sideOffset]);

  const startRight = useMemo<[number, number, number]>(() => ([
    segment.position[0] - Math.cos(startRotation) * sideOffset,
    segment.elevation,
    segment.position[2] + Math.sin(startRotation) * sideOffset,
  ]), [segment.position, segment.elevation, startRotation, sideOffset]);

  const endLeft = useMemo<[number, number, number]>(() => ([
    endPosition[0] + Math.cos(endRotation) * sideOffset,
    endElevation,
    endPosition[2] - Math.sin(endRotation) * sideOffset,
  ]), [endPosition, endElevation, endRotation, sideOffset]);

  const endRight = useMemo<[number, number, number]>(() => ([
    endPosition[0] - Math.cos(endRotation) * sideOffset,
    endElevation,
    endPosition[2] + Math.sin(endRotation) * sideOffset,
  ]), [endPosition, endElevation, endRotation, sideOffset]);

  const trackGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      ...startLeft,
      ...startRight,
      ...endRight,
      ...endLeft,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    geo.computeVertexNormals();
    return geo;
  }, [startLeft, startRight, endRight, endLeft]);

  const startRailLeft: [number, number, number] = [
    segment.position[0] + Math.cos(startRotation) * railOffset,
    segment.elevation + 0.1,
    segment.position[2] - Math.sin(startRotation) * railOffset,
  ];
  const endRailLeft: [number, number, number] = [
    endPosition[0] + Math.cos(endRotation) * railOffset,
    endElevation + 0.1,
    endPosition[2] - Math.sin(endRotation) * railOffset,
  ];
  const startRailRight: [number, number, number] = [
    segment.position[0] - Math.cos(startRotation) * railOffset,
    segment.elevation + 0.1,
    segment.position[2] + Math.sin(startRotation) * railOffset,
  ];
  const endRailRight: [number, number, number] = [
    endPosition[0] - Math.cos(endRotation) * railOffset,
    endElevation + 0.1,
    endPosition[2] + Math.sin(endRotation) * railOffset,
  ];
  
  return (
    <group>
      <mesh
        geometry={trackGeometry}
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          emissive={color}
          emissiveIntensity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <RailBeam start={startRailLeft} end={endRailLeft} color={color} />
      <RailBeam start={startRailRight} end={endRailRight} color={color} />
      
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

function RailBeam({
  start,
  end,
  color,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const direction = endVec.clone().sub(startVec);
    const segmentLength = direction.length();
    const mid = startVec.clone().add(endVec).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize(),
    );
    return {
      position: [mid.x, mid.y, mid.z] as [number, number, number],
      quaternion: quat,
      length: segmentLength,
    };
  }, [start, end]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.075, 0.075, length, 10]} />
      <meshStandardMaterial
        color={color}
        metalness={0.6}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

export default function Track({ segments }: TrackProps) {
  return (
    <group>
      {segments.map((segment, index) => (
        <TrackPiece
          key={segment.id}
          segment={segment}
          nextSegment={segments[index + 1]}
        />
      ))}
    </group>
  );
}
