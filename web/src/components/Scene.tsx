import React, { useRef, useState, useEffect } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Environment, Cylinder, Box, Sphere, Grid, Sky, Stars, OrbitControls, useHelper } from "@react-three/drei";
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

const SceneObjects: React.FC<{ onBoxClick: () => void, onGameOver: () => void }> = ({ onBoxClick, onGameOver }) => {
    const cylinderRef = useRef<THREE.Mesh | null>(null);
    const { camera } = useThree();
    const spotLightRef = useRef<THREE.SpotLight>(null);

    const [boxes, setBoxes] = useState<{ id: number, position: [number, number, number] }[]>([]);
    const [bloodParticles, setBloodParticles] = useState<BloodParticle[]>([]);
    const [bullets, setBullets] = useState<Bullet[]>([]);
    const [timeOfDay, setTimeOfDay] = useState(0);

    const manTexture = useLoader(THREE.TextureLoader, "/images/man.jpeg");

    useMouseFollow(cylinderRef, camera);

    // Time of day cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeOfDay((prev) => (prev + 0.01) % 24);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setBoxes(prevBoxes => {
                if (prevBoxes.length >= 10) {
                    onGameOver();
                    return prevBoxes;
                }
                return [
                    ...prevBoxes,
                    { id: Date.now(), position: [Math.random() * 20 - 10, 0, Math.random() * -10] }
                ];
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [onGameOver]);

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
        const numParticles = 20;
        const newParticles: BloodParticle[] = [];

        for (let i = 0; i < numParticles; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = Math.random() * 0.3 + 0.1;
            const upwardSpeed = Math.random() * 0.2 + 0.1;

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

    const handleBoxClick = (id: number, position: [number, number, number]) => {
        createBloodEffect(position);
        setBoxes(prevBoxes => prevBoxes.filter(box => box.id !== id));
        onBoxClick();
    };

    const shootBullet = () => {
        if (cylinderRef.current) {
            const position = cylinderRef.current.position.toArray() as [number, number, number];
            const direction = new THREE.Vector3();
            cylinderRef.current.getWorldDirection(direction);
            const velocity = [-1, 0, 0] as [number, number, number]; // Shooting direction aligned with cylinder
            setBullets(prevBullets => [
                ...prevBullets,
                { id: Date.now(), position, velocity }
            ]);
        }
    };

    // Calculate sun position and light intensity based on time of day
    const sunPosition: [number, number, number] = [
        Math.cos(timeOfDay * (Math.PI / 12)) * 100,
        Math.sin(timeOfDay * (Math.PI / 12)) * 100,
        0
    ];
    const lightIntensity = Math.max(0.2, Math.sin(timeOfDay * (Math.PI / 12)));

    return (
        <>
            {/* Dynamic Environment */}
            <Sky
                distance={450000}
                sunPosition={sunPosition}
                inclination={0.5}
                azimuth={0.25}
                mieCoefficient={0.001}
                mieDirectionalG={0.99}
                rayleigh={0.5}
                turbidity={10}
            />
            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />

            {/* Enhanced Lighting */}
            <ambientLight intensity={lightIntensity * 0.5} />
            <directionalLight
                position={sunPosition}
                intensity={lightIntensity}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <spotLight
                ref={spotLightRef}
                position={[0, 10, 0]}
                angle={0.5}
                penumbra={0.5}
                intensity={1}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />

            {/* Environment and Ground */}
            <Environment preset="sunset" background={false} />
            <Grid
                renderOrder={-1}
                position={[0, -0.01, 0]}
                args={[30, 30]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#6f6f6f"
                sectionSize={3}
                sectionThickness={1}
                sectionColor="#9d4b4b"
                fadeDistance={30}
                fadeStrength={1}
                followCamera={false}
            />
            <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial
                    color="#202020"
                    metalness={0.2}
                    roughness={0.8}
                />
            </mesh>

            {/* Gun Cylinder */}
            <Cylinder
                ref={cylinderRef}
                args={[0.125, 0.125, 5, 32]}
                position={[0, 1, 5]}
                rotation={[0, 0, Math.PI / 2]}
                onClick={shootBullet}
                castShadow
            >
                <meshStandardMaterial
                    color="#5f5959"
                    metalness={0.8}
                    roughness={0.2}
                    envMapIntensity={1}
                />
            </Cylinder>

            {/* Stick Men */}
            {boxes.map(box => (
                <Box
                    key={box.id}
                    args={[1.5, 4, 0.5]}
                    position={box.position}
                    onClick={() => handleBoxClick(box.id, box.position)}
                    castShadow
                    receiveShadow
                >
                    <meshStandardMaterial
                        map={manTexture}
                        metalness={0.1}
                        roughness={0.8}
                        envMapIntensity={1}
                    />
                </Box>
            ))}

            {/* Blood Particles */}
            {bloodParticles.map(particle => (
                <Sphere
                    key={particle.id}
                    args={[0.1]}
                    position={particle.position}
                    castShadow
                >
                    <meshStandardMaterial
                        color="#8B0000"
                        emissive="#310000"
                        emissiveIntensity={0.5}
                        metalness={0.3}
                        roughness={0.7}
                    />
                </Sphere>
            ))}

            {/* Bullets */}
            {bullets.map(bullet => (
                <Sphere
                    key={bullet.id}
                    args={[0.1]}
                    position={bullet.position}
                    castShadow
                >
                    <meshStandardMaterial
                        color="#FFD700"
                        metalness={0.8}
                        roughness={0.2}
                        emissive="#FFD700"
                        emissiveIntensity={0.2}
                    />
                </Sphere>
            ))}

            {/* Fog for depth effect */}
            <fog attach="fog" args={["#202020", 5, 30]} />
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
                camera={{ position: [0, 10, 15], fov: 75 }}
                shadows
                style={{ width: '100%', height: '100%' }}
            >
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={5}
                    maxDistance={30}
                    maxPolarAngle={Math.PI / 2}
                />
                <SceneObjects onBoxClick={incrementScore} onGameOver={handleGameOver} />
            </Canvas>
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                color: 'white',
                fontSize: '24px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
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
                                borderRadius: '5px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
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