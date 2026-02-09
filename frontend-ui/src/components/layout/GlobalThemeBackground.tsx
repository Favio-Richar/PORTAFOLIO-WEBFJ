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
            <div className="absolute inset-0 bg-slate-900" />

            {/* Abstract Gradient Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-slate-800/40 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-900/20 rounded-full blur-[100px] mix-blend-screen animate-float" />

            {/* Noise Overlay for Texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] mix-blend-overlay" />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900/80" />

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
