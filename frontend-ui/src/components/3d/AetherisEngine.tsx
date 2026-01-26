"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Float, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * DataVortex: A dense swarm of 10,000 points flowing in a spiral towards the core.
 */
function DataVortex({ count = 10000 }) {
    const pointsRef = useRef<THREE.Points>(null);
    const particles = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const velocities = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const radius = 5 + Math.random() * 15;
            const angle = Math.random() * Math.PI * 2;
            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
            pos[i * 3 + 2] = Math.sin(angle) * radius;
            velocities[i] = 0.5 + Math.random();
        }
        return { pos, velocities };
    }, [count]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const time = state.clock.elapsedTime;

        // Speed modulation based on time
        const speedMultiplier = 1 + Math.sin(time * 0.2) * 0.3;
        pointsRef.current.rotation.y = time * 0.05 * speedMultiplier;

        // Slight vertical oscillation
        pointsRef.current.position.y = Math.sin(time * 0.2) * 2;
    });

    return (
        <Points ref={pointsRef} positions={particles.pos} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#06b6d4"
                size={0.08}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.3}
            />
        </Points>
    );
}

/**
 * MechanicalCore: The titanium heart using high metalness/low roughness.
 */
function MechanicalCore() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;
        groupRef.current.rotation.y = time * 0.3;

        // Breathing effect: scale oscillation
        const scale = 1 + Math.sin(time * 0.5) * 0.05;
        groupRef.current.scale.set(scale, scale, scale);
    });

    return (
        <group ref={groupRef}>
            {/* Main Octahedron */}
            <mesh>
                <octahedronGeometry args={[2.5, 0]} />
                <meshStandardMaterial
                    color="#475569"
                    metalness={1}
                    roughness={0.1}
                    emissive="#06b6d4"
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Mechanical Rings */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3.2, 0.02, 16, 100]} />
                <meshStandardMaterial color="#ffffff" metalness={1} roughness={0} />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[3.5, 0.02, 16, 100]} />
                <meshStandardMaterial color="#ffffff" metalness={1} roughness={0} />
            </mesh>
        </group>
    );
}

/**
 * GlassChamber: A refractive shell using MeshPhysicalMaterial for realism.
 */
function GlassChamber() {
    return (
        <mesh>
            <sphereGeometry args={[4.5, 64, 64]} />
            <meshPhysicalMaterial
                transparent
                transmission={0.95}
                thickness={2.5}
                roughness={0.02}
                metalness={0.1}
                clearcoat={1}
                clearcoatRoughness={0}
                ior={1.8}
                color="#ffffff"
                attenuationColor="#ffffff"
                attenuationDistance={2}
                envMapIntensity={2}
            />
        </mesh>
    );
}

export default function AetherisEngine() {
    return (
        <group>
            {/* Environment map is CRITICAL for reflections on metal/glass */}
            <Environment preset="night" />

            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <group>
                    <MechanicalCore />
                    <GlassChamber />
                </group>
            </Float>

            <DataVortex count={12000} />

            {/* Intense Core Light */}
            <pointLight intensity={30} distance={15} color="#06b6d4" />
            <pointLight position={[10, 10, 10]} intensity={10} color="#8b5cf6" />

            {/* Ground Contact for realism */}
            <mesh position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#020617" transparent opacity={0.5} roughness={1} />
            </mesh>
        </group>
    );
}
