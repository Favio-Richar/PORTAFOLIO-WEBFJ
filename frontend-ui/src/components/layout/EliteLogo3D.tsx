"use client";
import React from "react";
import { motion } from "framer-motion";

export default function EliteLogo3D() {
    return (
        <div className="logo-elite-container group select-none flex-row items-center gap-3">
            {/* Animated Status Indicator */}
            <div className="relative flex items-center justify-center w-8 h-8 mr-1">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-500/20 rounded-full blur-md"
                />
                <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#38bdf8]"></div>
            </div>

            {/* Text Area */}
            <div className="logo-3d-wrapper text-left">
                <h1 className="main-text-elite gradient-text-elite text-xl md:text-2xl leading-none">
                    Next Level
                </h1>

                {/* Decorative Divider */}
                <div className="flex items-center justify-start gap-2 my-0.5">
                    <div className="h-px w-6 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-1.5 h-1.5 bg-indigo-400 rotate-45 rounded-[1px] shadow-[0_0_5px_rgba(99,102,241,0.8)]"
                    />
                    <div className="h-px w-6 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                </div>

                <p className="secondary-text-elite text-[8px] md:text-[9px] tracking-[0.3em] leading-none uppercase">
                    Software Pro
                </p>
            </div>

            {/* Animated Accents */}
            <div className="hidden lg:flex flex-col gap-1 ml-1">
                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></div>
                <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
        </div>
    );
}
