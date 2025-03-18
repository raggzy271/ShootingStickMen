import React, { useRef, useState, useEffect } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Environment, Cylinder, Box, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { useMouseFollow } from "../hooks/mousefollow";

interface BloodParticle {
    id: number;
    position: [number, number, number];
    velocity: [number, number, number];
}

interface Bullet {
    id: number;
    position: [number, number, number];
    velocity: [number, number, number];
}

interface Box {
    id: number;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    isDying: boolean;
    deathTime: number;
}

interface ZombieParticle {
    id: number;
    position: [number, number, number];
    velocity: [number, number, number];
    scale: number;
    color: string;
}

const SceneObjects: React.FC<{ onBoxClick: () => void, onGameOver: () => void }> = ({ onBoxClick, onGameOver }) => {
    const cylinderRef = useRef<THREE.Mesh | null>(null);
    const { camera } = useThree();

    const [boxes, setBoxes] = useState<Box[]>([]);
    const [bloodParticles, setBloodParticles] = useState<BloodParticle[]>([]);
    const [bullets, setBullets] = useState<Bullet[]>([]);
    const [zombieParticles, setZombieParticles] = useState<ZombieParticle[]>([]);

    const manTexture = useLoader(THREE.TextureLoader, "/images/man.jpeg");

    useMouseFollow(cylinderRef, camera);

    useEffect(() => {
        const interval = setInterval(() => {
            setBoxes(prevBoxes => {
                if (prevBoxes.length >= 10) {
                    onGameOver();
                    return prevBoxes;
                }
                return [
                    ...prevBoxes,
                    {
                        id: Date.now(),
                        position: [Math.random() * 20 - 10, 0, Math.random() * -10],
                        rotation: [0, 0, 0],
                        scale: [1, 1, 1],
                        isDying: false,
                        deathTime: 0
                    }
                ];
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [onGameOver]);

    // Update animations with zombie-like death
    useEffect(() => {
        let animationFrameId: number;

        const updateAnimations = () => {
            setBoxes(prevBoxes => {
                return prevBoxes.map(box => {
                    if (box.isDying) {
                        const timeSinceDeath = Date.now() - box.deathTime;
                        const animationDuration = 2500; // 2.5 seconds animation

                        if (timeSinceDeath >= animationDuration) {
                            return null;
                        }

                        const progress = timeSinceDeath / animationDuration;

                        // Slower, creepier fall animation
                        const fallRotation = (Math.PI / 2) * Math.pow(progress, 2); // Slower fall
                        const zombieWobble = Math.sin(progress * Math.PI * 2) * 0.1 * (1 - progress); // Subtle wobble

                        // Disturbing scale changes
                        const baseScaleY = 1 - (progress * 0.6); // Slower squish
                        const pulseEffect = Math.sin(progress * Math.PI * 4) * 0.1 * (1 - progress);
                        const scaleY = baseScaleY + pulseEffect; // Pulsing effect
                        const scaleX = 1 + Math.sin(progress * Math.PI * 2) * 0.15; // Breathing effect
                        const scaleZ = 1 + Math.cos(progress * Math.PI * 2) * 0.15;

                        // Create zombie particles periodically
                        if (Math.random() < 0.1) { // Adjust probability for particle frequency
                            createZombieParticle(box.position);
                        }

                        return {
                            ...box,
                            rotation: [
                                fallRotation, // Slow fall
                                box.rotation[1] + zombieWobble, // Subtle twist
                                box.rotation[2] + zombieWobble * 0.5 // Slight tilt
                            ],
                            scale: [scaleX, scaleY, scaleZ],
                            position: [
                                box.position[0] + Math.sin(progress * Math.PI) * 0.1, // Subtle horizontal movement
                                box.position[1] - (progress * 0.8), // Slower fall
                                box.position[2] + Math.cos(progress * Math.PI) * 0.1
                            ]
                        };
                    }
                    return box;
                }).filter(Boolean) as Box[];
            });

            // Update zombie particles
            setZombieParticles(prevParticles => {
                return prevParticles
                    .map(particle => ({
                        ...particle,
                        position: [
                            particle.position[0] + particle.velocity[0],
                            particle.position[1] + particle.velocity[1],
                            particle.position[2] + particle.velocity[2]
                        ] as [number, number, number],
                        scale: particle.scale * 0.98, // Slowly shrink
                        velocity: [
                            particle.velocity[0] * 0.98,
                            particle.velocity[1] - 0.01, // Slow fall
                            particle.velocity[2] * 0.98
                        ] as [number, number, number]
                    }))
                    .filter(particle => particle.scale > 0.1); // Remove when too small
            });

            animationFrameId = requestAnimationFrame(updateAnimations);
        };

        animationFrameId = requestAnimationFrame(updateAnimations);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const createZombieParticle = (position: [number, number, number]) => {
        const colors = ['#4a6741', '#3d5a35', '#2d4326', '#1f2d1a']; // Zombie green variations
        const newParticles: ZombieParticle[] = [];

        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.1;
            newParticles.push({
                id: Date.now() + i,
                position: [...position] as [number, number, number],
                velocity: [
                    Math.cos(angle) * speed,
                    Math.random() * 0.1, // Slow upward drift
                    Math.sin(angle) * speed
                ] as [number, number, number],
                scale: Math.random() * 0.3 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        setZombieParticles(prev => [...prev, ...newParticles]);
    };

    // Update blood particles
    useEffect(() => {
        let animationFrameId: number;

        const updateParticles = () => {
            setBloodParticles(prevParticles => {
                const gravity = -0.05;
                return prevParticles
                    .map(particle => ({
                        ...particle,
                        position: [
                            particle.position[0] + particle.velocity[0],
                            particle.position[1] + particle.velocity[1],
                            particle.position[2] + particle.velocity[2]
                        ] as [number, number, number],
                        velocity: [
                            particle.velocity[0] * 0.98,
                            particle.velocity[1] + gravity,
                            particle.velocity[2] * 0.98
                        ] as [number, number, number]
                    }))
                    .filter(particle => particle.position[1] > -10);
            });

            setBullets(prevBullets => {
                return prevBullets
                    .map(bullet => ({
                        ...bullet,
                        position: [
                            bullet.position[0] + bullet.velocity[0],
                            bullet.position[1] + bullet.velocity[1],
                            bullet.position[2] + bullet.velocity[2]
                        ] as [number, number, number]
                    }))
                    .filter(bullet => bullet.position[2] > -10);
            });

            animationFrameId = requestAnimationFrame(updateParticles);
        };

        animationFrameId = requestAnimationFrame(updateParticles);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const createBloodEffect = (position: [number, number, number]) => {
        const numParticles = 30; // More particles
        const newParticles: BloodParticle[] = [];

        for (let i = 0; i < numParticles; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = Math.random() * 0.5 + 0.2; // Faster particles
            const upwardSpeed = Math.random() * 0.4 + 0.2; // Higher upward speed

            newParticles.push({
                id: Date.now() + i,
                position: [...position] as [number, number, number],
                velocity: [
                    Math.cos(angle) * speed,
                    upwardSpeed,
                    Math.sin(angle) * speed
                ] as [number, number, number]
            });
        }

        setBloodParticles(prev => [...prev, ...newParticles]);
    };

    const handleBoxHit = (box: Box) => {
        createBloodEffect(box.position);
        setBoxes(prevBoxes =>
            prevBoxes.map(b =>
                b.id === box.id
                    ? { ...b, isDying: true, deathTime: Date.now() }
                    : b
            )
        );
        onBoxClick();
    };

    const shootBullet = () => {
        if (cylinderRef.current) {
            const position = cylinderRef.current.position.toArray() as [number, number, number];
            const velocity = [0, 0, -1] as [number, number, number]; // Shoot forward
            setBullets(prevBullets => [
                ...prevBullets,
                { id: Date.now(), position, velocity }
            ]);
        }
    };

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Gun Cylinder */}
            <Cylinder
                ref={cylinderRef}
                args={[0.125, 0.125, 5, 32]}
                position={[0, -4, 1]}
                rotation={[Math.PI / 2, 0, 0]}
                onClick={shootBullet}
            >
                <meshStandardMaterial color="#5f5959" />
            </Cylinder>

            {boxes.map(box => (
                <Box
                    key={box.id}
                    args={[1.5, 4, 0.5]}
                    position={box.position}
                    rotation={box.rotation}
                    scale={box.scale}
                    onClick={() => handleBoxHit(box)}
                >
                    <meshStandardMaterial
                        map={manTexture}
                        emissive={box.isDying ? "#447744" : "#000000"}
                        emissiveIntensity={box.isDying ? 0.5 : 0}
                        transparent
                        opacity={box.isDying ? Math.max(0.4, 1 - ((Date.now() - box.deathTime) / 2500)) : 1}
                        metalness={box.isDying ? 0.3 : 0.1}
                        roughness={box.isDying ? 0.9 : 0.8}
                    />
                </Box>
            ))}

            {/* Zombie Particles */}
            {zombieParticles.map(particle => (
                <Sphere
                    key={particle.id}
                    args={[0.2]}
                    position={particle.position}
                    scale={particle.scale}
                >
                    <meshStandardMaterial
                        color={particle.color}
                        transparent
                        opacity={0.8}
                        emissive={particle.color}
                        emissiveIntensity={0.2}
                    />
                </Sphere>
            ))}

            {/* Blood Particles */}
            {bloodParticles.map(particle => (
                <Sphere
                    key={particle.id}
                    args={[0.15]} // Larger blood particles
                    position={particle.position}
                >
                    <meshStandardMaterial
                        color="#8B0000"
                        emissive="#310000"
                        emissiveIntensity={0.8}
                        metalness={0.3}
                        roughness={0.2}
                    />
                </Sphere>
            ))}

            {/* Bullets */}
            {bullets.map(bullet => (
                <Sphere
                    key={bullet.id}
                    args={[0.1]}
                    position={bullet.position}
                >
                    <meshStandardMaterial
                        color="#FFD700"
                    />
                </Sphere>
            ))}

            <Environment files="/hdrs/lilienstein_2k.hdr" background />
        </>
    );
};

const Scene: React.FC = () => {
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    const incrementScore = () => {
        if (!isGameOver) {
            setScore(prevScore => prevScore + 1);
        }
    };

    const handleGameOver = () => {
        setIsGameOver(true);
    };

    const restartGame = () => {
        window.location.reload();
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <Canvas
                camera={{ position: [0, -2, 5], fov: 75 }}
                style={{ width: '100%', height: '100%' }}
            >
                <SceneObjects onBoxClick={incrementScore} onGameOver={handleGameOver} />
            </Canvas>
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                color: 'white',
                fontSize: '24px'
            }}>
                Score: {score}
            </div>
            {isGameOver && (
                <div style={{
                    position: 'absolute',
                    zIndex: 1000,
                    top: '0',
                    left: '0',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    color: 'white',
                    height: '100vh',
                    width: '100vw'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
                            Game Over!
                        </div>
                        <div style={{ fontSize: '24px', marginBottom: '20px' }}>
                            Final Score: {score}
                        </div>
                        <button
                            onClick={restartGame}
                            style={{
                                backgroundColor: '#4CAF50',
                                border: 'none',
                                color: 'white',
                                padding: '15px 32px',
                                textAlign: 'center',
                                textDecoration: 'none',
                                display: 'inline-block',
                                fontSize: '16px',
                                margin: '4px 2px',
                                cursor: 'pointer',
                                borderRadius: '5px'
                            }}
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scene;