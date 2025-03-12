import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Box, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface StickManProps {
    position: [number, number, number];
    onClick: () => void;
}

const StickMan: React.FC<StickManProps> = ({ position, onClick }) => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);

    // Enhanced materials
    const skinMaterial = new THREE.MeshStandardMaterial({
        color: "#E0B0A0",
        roughness: 0.3,
        metalness: 0.1,
    });

    const clothesMaterial = new THREE.MeshStandardMaterial({
        color: "#2A4B7C",
        roughness: 0.6,
        metalness: 0.1,
        envMapIntensity: 0.5,
    });

    const shoesMaterial = new THREE.MeshPhongMaterial({
        color: "#111111",
        shininess: 70,
    });

    useFrame((state) => {
        if (groupRef.current && bodyRef.current) {
            const t = state.clock.getElapsedTime();

            // Smooth body sway
            groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;

            // Subtle breathing animation
            bodyRef.current.scale.y = 1 + Math.sin(t * 2) * 0.02;
            bodyRef.current.scale.x = 1 - Math.sin(t * 2) * 0.01;

            // Gentle floating motion
            groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.1;

            // Arms swing slightly
            const armGroups = bodyRef.current.children.filter(child =>
                child.name === "leftArm" || child.name === "rightArm"
            );

            armGroups.forEach((arm, index) => {
                const isLeft = index === 0;
                const offset = isLeft ? 0 : Math.PI;
                arm.rotation.x = Math.sin(t * 2 + offset) * 0.1;
            });
        }
    });

    return (
        <group ref={groupRef} position={position} scale={[1.3, 1.3, 1.3]} onClick={onClick}>
            {/* Head with improved details */}
            <group position={[0, 2.2, 0]}>
                {/* Skull base */}
                <Sphere args={[0.5, 32, 32]} scale={[0.9, 1, 0.9]}>
                    <meshStandardMaterial {...skinMaterial} />
                </Sphere>

                {/* Face features */}
                <group position={[0, 0, 0.35]}>
                    {/* Eyes */}
                    <group position={[0.2, 0.1, 0.1]}>
                        <Sphere args={[0.09, 24, 24]}>
                            <meshStandardMaterial color="white" metalness={0.2} roughness={0.3} />
                        </Sphere>
                        <Sphere args={[0.045, 24, 24]} position={[0, 0, 0.05]}>
                            <meshStandardMaterial color="#1B3461" metalness={0.5} roughness={0.2} />
                        </Sphere>
                    </group>
                    <group position={[-0.2, 0.1, 0.1]}>
                        <Sphere args={[0.09, 24, 24]}>
                            <meshStandardMaterial color="white" metalness={0.2} roughness={0.3} />
                        </Sphere>
                        <Sphere args={[0.045, 24, 24]} position={[0, 0, 0.05]}>
                            <meshStandardMaterial color="#1B3461" metalness={0.5} roughness={0.2} />
                        </Sphere>
                    </group>

                    {/* Nose */}
                    <Sphere args={[0.12, 16, 16]} position={[0, 0, 0.2]} scale={[0.6, 0.8, 0.6]}>
                        <meshStandardMaterial {...skinMaterial} />
                    </Sphere>
                </group>

                {/* Hair */}
                <group position={[0, 0.2, -0.05]}>
                    <Sphere args={[0.52, 32, 32]} scale={[0.9, 0.7, 0.7]}>
                        <meshStandardMaterial
                            color="#1A1A1A"
                            roughness={0.8}
                            metalness={0.1}
                        />
                    </Sphere>
                </group>
            </group>

            {/* Body structure */}
            <group ref={bodyRef}>
                {/* Neck */}
                <Cylinder args={[0.2, 0.25, 0.3, 16]} position={[0, 1.9, 0]}>
                    <meshStandardMaterial {...skinMaterial} />
                </Cylinder>

                {/* Torso */}
                <group position={[0, 1.3, 0]}>
                    {/* Upper body */}
                    <Box args={[1.2, 0.9, 0.7]} position={[0, 0.2, 0]}>
                        <meshStandardMaterial {...clothesMaterial} />
                    </Box>
                    {/* Lower body */}
                    <Box args={[1.1, 0.7, 0.65]} position={[0, -0.4, 0]}>
                        <meshStandardMaterial {...clothesMaterial} />
                    </Box>
                </group>

                {/* Arms with better joints */}
                <group position={[0, 1.5, 0]}>
                    {/* Left Arm */}
                    <group name="leftArm" position={[0.65, 0, 0]}>
                        <Cylinder args={[0.2, 0.18, 0.7, 16]} position={[0, -0.35, 0]} rotation={[0, 0, 0.1]}>
                            <meshStandardMaterial {...clothesMaterial} />
                        </Cylinder>
                        <group position={[0.05, -0.7, 0]}>
                            <Cylinder args={[0.17, 0.15, 0.6, 16]} rotation={[0, 0, 0.2]}>
                                <meshStandardMaterial {...skinMaterial} />
                            </Cylinder>
                        </group>
                    </group>

                    {/* Right Arm */}
                    <group name="rightArm" position={[-0.65, 0, 0]}>
                        <Cylinder args={[0.2, 0.18, 0.7, 16]} position={[0, -0.35, 0]} rotation={[0, 0, -0.1]}>
                            <meshStandardMaterial {...clothesMaterial} />
                        </Cylinder>
                        <group position={[-0.05, -0.7, 0]}>
                            <Cylinder args={[0.17, 0.15, 0.6, 16]} rotation={[0, 0, -0.2]}>
                                <meshStandardMaterial {...skinMaterial} />
                            </Cylinder>
                        </group>
                    </group>
                </group>

                {/* Legs with better proportions */}
                <group position={[0, 0.5, 0]}>
                    {/* Left Leg */}
                    <group position={[0.35, 0, 0]}>
                        <Cylinder args={[0.25, 0.22, 0.9, 16]} position={[0, -0.45, 0]}>
                            <meshStandardMaterial {...clothesMaterial} />
                        </Cylinder>
                        <Cylinder args={[0.22, 0.2, 0.9, 16]} position={[0, -1.35, 0]}>
                            <meshStandardMaterial {...clothesMaterial} />
                        </Cylinder>
                        <group position={[0, -1.85, 0.1]}>
                            <Box args={[0.3, 0.15, 0.6]}>
                                <meshStandardMaterial {...shoesMaterial} />
                            </Box>
                        </group>
                    </group>

                    {/* Right Leg */}
                    <group position={[-0.35, 0, 0]}>
                        <Cylinder args={[0.25, 0.22, 0.9, 16]} position={[0, -0.45, 0]}>
                            <meshStandardMaterial {...clothesMaterial} />
                        </Cylinder>
                        <Cylinder args={[0.22, 0.2, 0.9, 16]} position={[0, -1.35, 0]}>
                            <meshStandardMaterial {...clothesMaterial} />
                        </Cylinder>
                        <group position={[0, -1.85, 0.1]}>
                            <Box args={[0.3, 0.15, 0.6]}>
                                <meshStandardMaterial {...shoesMaterial} />
                            </Box>
                        </group>
                    </group>
                </group>
            </group>
        </group>
    );
};

export default StickMan; 