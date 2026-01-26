"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import ComputingBackground from "@/components/3d/ComputingBackground";

export default function GlobalThemeBackground() {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return (
        <div className="fixed inset-0 -z-[10] bg-[#020617] overflow-hidden pointer-events-none" />
    );

    return (
        <div
            className="fixed inset-0 -z-[10] bg-[#020617] overflow-hidden pointer-events-none"
        >
            <Canvas
                camera={{ position: [0, 0, 20], fov: 60 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    <ComputingBackground />
                    <EffectComposer enableNormalPass={false}>
                        <Bloom
                            intensity={0.8}
                            luminanceThreshold={0.2}
                            luminanceSmoothing={0.9}
                            mipmapBlur
                        />
                        <ChromaticAberration
                            offset={new THREE.Vector2(0.0015, 0.0015)}
                            radialModulation={false}
                            modulationOffset={0}
                        />
                        <Vignette eskil={false} offset={0.5} darkness={0.5} />
                        <Noise opacity={0.05} />
                    </EffectComposer>
                </Suspense>
            </Canvas>

            {/* Technical Scanline Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400 scanline-anim"></div>
            </div>

            <style jsx>{`
                .scanline-anim {
                    animation: scan 8s linear infinite;
                }
                @keyframes scan {
                    0% { top: -5%; }
                    100% { top: 105%; }
                }
            `}</style>
        </div>
    );
}
