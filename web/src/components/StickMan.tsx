import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';

interface StickManProps {
    position: [number, number, number];
    onClick: () => void;
}

const StickMan: React.FC<StickManProps> = ({ position, onClick }) => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);

    // Enhanced 3D materials with better depth
    const skinMaterial = new THREE.MeshStandardMaterial({
        color: "#E0B0A0",
        roughness: 0.3,
        metalness: 0.1,
        envMapIntensity: 1
    });

    const clothesMaterial = new THREE.MeshStandardMaterial({
        color: "#2A4B7C",
        roughness: 0.4,
        metalness: 0.2,
        envMapIntensity: 1
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
        color: "#2A1810",
        roughness: 0.6,
        metalness: 0.1,
        envMapIntensity: 0.8
    });

    useFrame((state) => {
        if (groupRef.current && bodyRef.current) {
            const t = state.clock.getElapsedTime();

            // Enhanced 3D animation
            groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;

            // More pronounced breathing effect
            bodyRef.current.scale.y = 1 + Math.sin(t * 2) * 0.02;
            bodyRef.current.scale.x = 1 - Math.sin(t * 2) * 0.015;
            bodyRef.current.scale.z = 1 + Math.sin(t * 2) * 0.015;
        }
    });

    return (
        <group ref={groupRef} position={position} onClick={onClick} scale={[2.2, 2.2, 2.2]}>
            {/* Head */}
            <group position={[0, 2.2, 0]}>
                {/* Base head - more spherical */}
                <Sphere args={[0.5, 32, 32]} scale={[1.1, 1.2, 1.1]}>
                    <meshStandardMaterial {...skinMaterial} />
                </Sphere>

                {/* Hair - more volume */}
                <group position={[0, 0.2, 0]}>
                    <Sphere args={[0.52, 32, 32]} scale={[1.12, 0.4, 1.12]}>
                        <meshStandardMaterial {...hairMaterial} />
                    </Sphere>
                    <Sphere args={[0.51, 32, 32]} position={[0, -0.1, -0.1]} scale={[1.1, 0.3, 0.8]}>
                        <meshStandardMaterial {...hairMaterial} />
                    </Sphere>
                </group>

                {/* Eyes - more depth */}
                <group position={[0, 0, 0.45]}>
                    {/* Eye sockets */}
                    <Sphere args={[0.12, 24, 24]} position={[0.2, 0.1, -0.05]} scale={[1, 1, 0.5]}>
                        <meshStandardMaterial color="#d3d3d3" />
                    </Sphere>
                    <Sphere args={[0.12, 24, 24]} position={[-0.2, 0.1, -0.05]} scale={[1, 1, 0.5]}>
                        <meshStandardMaterial color="#d3d3d3" />
                    </Sphere>
                    {/* Eyeballs */}
                    <Sphere args={[0.11, 24, 24]} position={[0.2, 0.1, 0]}>
                        <meshStandardMaterial color="white" />
                    </Sphere>
                    <Sphere args={[0.11, 24, 24]} position={[-0.2, 0.1, 0]}>
                        <meshStandardMaterial color="white" />
                    </Sphere>
                    {/* Pupils with depth */}
                    <Sphere args={[0.06, 16, 16]} position={[0.2, 0.1, 0.08]}>
                        <meshStandardMaterial color="#1B3461" />
                    </Sphere>
                    <Sphere args={[0.06, 16, 16]} position={[-0.2, 0.1, 0.08]}>
                        <meshStandardMaterial color="#1B3461" />
                    </Sphere>
                </group>
            </group>

            {/* Body */}
            <group ref={bodyRef}>
                {/* Neck - thicker */}
                <Cylinder args={[0.25, 0.3, 0.4, 16]} position={[0, 1.9, 0]}>
                    <meshStandardMaterial {...skinMaterial} />
                </Cylinder>

                {/* Torso - more volume */}
                <group position={[0, 1.3, 0]}>
                    {/* Upper body - more chest depth */}
                    <Box args={[1.6, 1.2, 1.0]} position={[0, 0.2, 0]}>
                        <meshStandardMaterial {...clothesMaterial} />
                    </Box>
                    {/* Lower body - wider hips */}
                    <Box args={[1.5, 0.8, 0.9]} position={[0, -0.4, 0]}>
                        <meshStandardMaterial color="#1B1B1B" />
                    </Box>
                </group>

                {/* Arms - thicker and more muscular */}
                <group position={[0, 1.5, 0]}>
                    {/* Left Arm */}
                    <group position={[0.9, 0, 0]}>
                        {/* Upper arm - sleeve */}
                        <Cylinder args={[0.28, 0.25, 0.7, 16]} position={[0, -0.35, 0]} rotation={[0, 0, 0.15]}>
                            <meshStandardMaterial {...clothesMaterial} />
                        </Cylinder>
                        {/* Lower arm - skin */}
                        <Cylinder args={[0.24, 0.22, 0.7, 16]} position={[0.1, -0.9, 0]} rotation={[0, 0, 0.3]}>
                            <meshStandardMaterial {...skinMaterial} />
                        </Cylinder>
                    </group>

                    {/* Right Arm */}
                    <group position={[-0.9, 0, 0]}>
                        {/* Upper arm - sleeve */}
                        <Cylinder args={[0.28, 0.25, 0.7, 16]} position={[0, -0.35, 0]} rotation={[0, 0, -0.15]}>
                            <meshStandardMaterial {...clothesMaterial} />
                        </Cylinder>
                        {/* Lower arm - skin */}
                        <Cylinder args={[0.24, 0.22, 0.7, 16]} position={[-0.1, -0.9, 0]} rotation={[0, 0, -0.3]}>
                            <meshStandardMaterial {...skinMaterial} />
                        </Cylinder>
                    </group>
                </group>

                {/* Legs - thicker and more muscular */}
                <group position={[0, 0.5, 0]}>
                    {/* Left Leg */}
                    <group position={[0.45, 0, 0]}>
                        {/* Upper leg - thigh */}
                        <Cylinder args={[0.35, 0.3, 0.9, 16]} position={[0, -0.45, 0]}>
                            <meshStandardMaterial color="#1B1B1B" />
                        </Cylinder>
                        {/* Lower leg - calf */}
                        <Cylinder args={[0.3, 0.25, 0.9, 16]} position={[0, -1.3, 0]}>
                            <meshStandardMaterial color="#1B1B1B" />
                        </Cylinder>
                        {/* Shoe - bigger */}
                        <Box args={[0.4, 0.2, 0.7]} position={[0, -1.8, 0.15]}>
                            <meshStandardMaterial color="#000000" />
                        </Box>
                    </group>

                    {/* Right Leg */}
                    <group position={[-0.45, 0, 0]}>
                        {/* Upper leg - thigh */}
                        <Cylinder args={[0.35, 0.3, 0.9, 16]} position={[0, -0.45, 0]}>
                            <meshStandardMaterial color="#1B1B1B" />
                        </Cylinder>
                        {/* Lower leg - calf */}
                        <Cylinder args={[0.3, 0.25, 0.9, 16]} position={[0, -1.3, 0]}>
                            <meshStandardMaterial color="#1B1B1B" />
                        </Cylinder>
                        {/* Shoe - bigger */}
                        <Box args={[0.4, 0.2, 0.7]} position={[0, -1.8, 0.15]}>
                            <meshStandardMaterial color="#000000" />
                        </Box>
                    </group>
                </group>
            </group>
        </group>
    );
};

export default StickMan; 