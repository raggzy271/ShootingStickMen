import { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Camera, Group, Mesh } from 'three';

export const useMouseFollow = (
    ref: RefObject<Group | Mesh | null>,
    camera: Camera
) => {
    // ... existing code ...
} 