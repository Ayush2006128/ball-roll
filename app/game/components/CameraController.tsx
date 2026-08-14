'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  target: [number, number, number];
  rotation: number;
  isPlaying: boolean;
}

const CAMERA_OFFSET = new THREE.Vector3(0, 6, 10);
const CAMERA_LOOK_AHEAD = 8;
const LERP_SPEED = 3;

export default function CameraController({ target, rotation, isPlaying }: CameraControllerProps) {
  const { camera } = useThree();
  const currentPosRef = useRef(new THREE.Vector3(0, 10, 15));
  const currentLookRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    if (!isPlaying && !target) return;

    // Calculate desired camera position behind the ball
    const offsetX = -Math.sin(rotation) * CAMERA_OFFSET.z + Math.cos(rotation) * CAMERA_OFFSET.x;
    const offsetZ = Math.cos(rotation) * CAMERA_OFFSET.z + Math.sin(rotation) * CAMERA_OFFSET.x;

    const desiredPos = new THREE.Vector3(
      target[0] + offsetX,
      target[1] + CAMERA_OFFSET.y,
      target[2] + offsetZ,
    );

    // Look ahead of the ball
    const lookAheadX = target[0] + Math.sin(rotation) * CAMERA_LOOK_AHEAD;
    const lookAheadZ = target[2] - Math.cos(rotation) * CAMERA_LOOK_AHEAD;
    const desiredLook = new THREE.Vector3(lookAheadX, target[1], lookAheadZ);

    // Smooth follow
    const lerpFactor = 1 - Math.exp(-LERP_SPEED * delta);
    currentPosRef.current.lerp(desiredPos, lerpFactor);
    currentLookRef.current.lerp(desiredLook, lerpFactor);

    camera.position.copy(currentPosRef.current);
    camera.lookAt(currentLookRef.current);
  });

  return null;
}
