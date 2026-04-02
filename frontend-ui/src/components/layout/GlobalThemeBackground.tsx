"use client";

import { useEffect, useState } from "react";

export default function GlobalThemeBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="fixed inset-0 -z-50 bg-[#0f172a]" />;

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            {/* Base Background */}
            <div className="absolute inset-0 bg-[var(--background)]" />

            {/* Abstract Gradient Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[100px] animate-pulse-slow delay-700" />
            <div className="absolute top-[30%] right-[-10%] w-[30%] h-[30%] bg-indigo-400/5 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

            {/* NOISE OVERLAY - Fixed */}
            <div
                className="fixed inset-0 z-[1] pointer-events-none mix-blend-overlay opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }}
            />

            {/* Subtle Gradient Overlay - Adjusted for dynamic theme */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/10 via-transparent to-[var(--background)]/40" />

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-20px, 20px); }
                }
                .animate-float {
                    animation: float 10s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
