"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaHome, FaRegQuestionCircle, FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-2xl w-full text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-12"
                >
                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <FaExclamationTriangle className="text-indigo-500 text-4xl" />
                    </div>

                    <h1 className="text-8xl md:text-9xl font-black text-white tracking-tighter mb-4 flex items-center justify-center gap-4">
                        4<span className="text-indigo-500 animate-pulse">0</span>4
                    </h1>

                    <h2 className="text-2xl md:text-3xl font-bold italic text-slate-200 mb-6">
                        Error en la Navegación <span className="text-indigo-500">·</span> Ruta No Encontrada
                    </h2>

                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs leading-relaxed max-w-md mx-auto">
                        El recurso que buscas ha sido movido, eliminado o nunca existió en esta dimensión digital.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-full transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20"
                    >
                        <FaHome /> Volver al Inicio
                    </Link>

                    <Link
                        href="/contacto"
                        className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-black uppercase tracking-[0.2em] text-[10px] rounded-full transition-all flex items-center justify-center gap-3"
                    >
                        <FaRegQuestionCircle /> Reportar Error
                    </Link>
                </motion.div>

                <div className="mt-20 pt-10 border-t border-white/5">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">
                        Next Level Software Pro · Ingeniería Digital de Élite
                    </p>
                </div>
            </div>
        </div>
    );
}
