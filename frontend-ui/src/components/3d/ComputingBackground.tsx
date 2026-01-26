"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid, Float, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * BinaryStreams: Renders falling bits (0 and 1) as points to represent data flow.
 */
function BinaryStreams({ count = 3000 }) {
    const pointsRef = useRef<THREE.Points>(null);
    const particles = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 60; // X
            pos[i * 3 + 1] = Math.random() * 60 - 30; // Y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 60; // Z
            sizes[i] = Math.random();
        }
        return { pos, sizes };
    }, [count]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const time = state.clock.elapsedTime;

        // Vertical falling movement
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            positions[i * 3 + 1] -= 0.05 + Math.random() * 0.05; // Fall speed
            if (positions[i * 3 + 1] < -30) positions[i * 3 + 1] = 30; // Reset to top
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
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
 * TechnicalLattice: Connecting nodes that represent a network or system architecture.
 */
function TechnicalLattice({ count = 15 }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    });

    return (
        <group ref={groupRef}>
            {[...Array(count)].map((_, i) => {
                const pos: [number, number, number] = [
                    Math.sin(i) * 15,
                    Math.cos(i) * 10,
                    Math.sin(i * 0.5) * 10
                ];
                return (
                    <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1}>
                        <mesh position={pos}>
                            <octahedronGeometry args={[0.2, 0]} />
                            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
                        </mesh>
                    </Float>
                );
            })}
        </group>
    );
}

export default function ComputingBackground() {
    return (
        <group>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#06b6d4" />
            <pointLight position={[-10, -10, -10]} intensity={1.5} color="#0891b2" />

            {/* The infinite technical grid */}
            <Grid
                infiniteGrid
                fadeDistance={50}
                fadeStrength={5}
                cellSize={1}
                sectionSize={5}
                sectionThickness={1.5}
                sectionColor="#06b6d4"
                cellColor="#082f49"
                position={[0, -5, 0]}
            />

            {/* Another grid on top for verticality */}
            <Grid
                infiniteGrid
                fadeDistance={50}
                fadeStrength={5}
                cellSize={1}
                sectionSize={5}
                sectionThickness={1.5}
                sectionColor="#06b6d4"
                cellColor="#082f49"
                position={[0, 25, 0]}
                rotation={[Math.PI, 0, 0]}
            />

            <BinaryStreams count={4000} />
            <TechnicalLattice count={20} />

            <fog attach="fog" args={["#020617", 10, 50]} />
        </group>
    );
}
