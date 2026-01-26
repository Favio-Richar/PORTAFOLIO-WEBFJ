"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import AetherisEngine from "./AetherisEngine";

function DataParticles({ count = 2000 }) {
    const points = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 50;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        return pos;
    }, [count]);

    useFrame((state) => {
        if (!points.current) return;
        const time = state.clock.elapsedTime;

        // Base rotation
        points.current.rotation.y = time * 0.05;
        points.current.rotation.x = Math.sin(time * 0.1) * 0.1;

        // Mouse interactivity: subtle shift based on mouse position
        points.current.position.x = THREE.MathUtils.lerp(points.current.position.x, state.mouse.x * 2, 0.05);
        points.current.position.y = THREE.MathUtils.lerp(points.current.position.y, state.mouse.y * 2, 0.05);
    });

    return (
        <Points ref={points} positions={particles} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#38bdf8"
                size={0.15}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.4}
            />
        </Points>
    );
}

function EnergyFlow() {
    const flowPoints = useRef<THREE.Group>(null);

    useFrame(() => {
        if (!flowPoints.current) return;
        flowPoints.current.rotation.z += 0.01;
    });

    return (
        <group ref={flowPoints}>
            {[...Array(5)].map((_, i) => (
                <Float key={i} speed={5 + i} rotationIntensity={2} floatIntensity={1}>
                    <mesh position={[Math.sin(i) * 10, Math.cos(i) * 10, -5]}>
                        <sphereGeometry args={[0.1, 8, 8]} />
                        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={5} />
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

function FloatingGrid() {
    return (
        <group position={[0, 0, -10]}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <mesh rotation={[Math.PI / 4, 0, 0]}>
                    <octahedronGeometry args={[5, 0]} />
                    <meshStandardMaterial
                        color="#06b6d4"
                        wireframe
                        transparent
                        opacity={0.15}
                        emissive="#06b6d4"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            </Float>
            <Float speed={3} rotationIntensity={1} floatIntensity={2}>
                <mesh position={[10, 5, -5]} rotation={[0, Math.PI / 3, 0]}>
                    <icosahedronGeometry args={[2, 1]} />
                    <meshStandardMaterial
                        color="#8b5cf6"
                        wireframe
                        transparent
                        opacity={0.1}
                        emissive="#8b5cf6"
                        emissiveIntensity={0.3}
                    />
                </mesh>
            </Float>
        </group>
    );
}

export default function ElitePro3DScene() {
    return (
        <group>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
                <DataParticles count={3500} />
                <AetherisEngine />
                <EnergyFlow />
                <FloatingGrid />
            </Float>
            <fog attach="fog" args={["#020617", 5, 45]} />
        </group>
    );
}
