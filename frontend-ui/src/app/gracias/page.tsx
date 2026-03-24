"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCheckCircle, FaRocket, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import confetti from "canvas-confetti";

export default function GraciasPage() {
    useEffect(() => {
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ["#6366f1", "#a855f7"]
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ["#6366f1", "#a855f7"]
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)] z-0" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-12 rounded-[3rem] text-center relative z-10 shadow-2xl"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                    className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-5xl text-emerald-500 mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                    <FaCheckCircle />
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                    ¡Solicitud <span className="text-indigo-500">Recibida!</span>
                </h1>

                <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                    Hemos procesado tu información con éxito. Un ingeniero de nuestro equipo revisará tu requerimiento y te contactará en menos de <span className="text-white font-bold">24 horas</span>.
                </p>

                <div className="grid grid-cols-1 gap-4 mb-10">
                    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl text-left">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <FaCalendarAlt />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Paso Siguiente</h4>
                            <p className="text-xs text-slate-300 font-bold">Revisa tu bandeja de entrada o WhatsApp.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/" className="flex-1 px-8 py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                        Volver al Inicio
                    </Link>
                    <Link href="/asesoria" className="flex-1 px-8 py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all duration-300 flex items-center justify-center gap-2 group">
                        Reservar Asesoría <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="mt-12 flex items-center justify-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    <FaRocket className="text-indigo-500/50" /> Next Level Software Pro · Ingeniería Digital de Élite
                </div>
            </motion.div>
        </div>
    );
}
