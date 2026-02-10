"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaLaptopCode, FaRobot, FaBrain, FaArrowRight } from 'react-icons/fa';
import '@/styles/home-elite.scss';

export default function BlogHome() {
    return (
        <section id="blog" className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                        <span className="text-indigo-400 mono text-sm">05.</span>
                        <span className="text-sm text-gray-400">Blog</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-white">
                        Artículos & <span className="gradient-text">Recursos</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Article 1 */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-card rounded-2xl overflow-hidden hover-glow group"
                    >
                        <div className="aspect-video bg-gradient-to-br from-indigo-900/30 to-purple-900/30 relative flex items-center justify-center border-b border-indigo-500/10">
                            <FaLaptopCode className="w-16 h-16 text-indigo-500/30 group-hover:text-indigo-500/50 transition-colors" />
                        </div>
                        <div className="p-6">
                            <time className="text-xs text-gray-500 mono">15 Dic 2024</time>
                            <h3 className="text-lg font-semibold mt-2 mb-3 text-white font-display">Arquitectura Web Moderna</h3>
                            <p className="text-gray-500 text-sm mb-4 font-display">Explora los patrones más efectivos para aplicaciones escalables.</p>
                            <a href="#" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                                <span>Leer</span> <FaArrowRight size={12} />
                            </a>
                        </div>
                    </motion.article>

                    {/* Article 2 */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-2xl overflow-hidden hover-glow group"
                    >
                        <div className="aspect-video bg-gradient-to-br from-cyan-900/30 to-emerald-900/30 relative flex items-center justify-center border-b border-cyan-500/10">
                            <FaRobot className="w-16 h-16 text-cyan-500/30 group-hover:text-cyan-500/50 transition-colors" />
                        </div>
                        <div className="p-6">
                            <time className="text-xs text-gray-500 mono">10 Dic 2024</time>
                            <h3 className="text-lg font-semibold mt-2 mb-3 text-white font-display">Automatización Empresarial</h3>
                            <p className="text-gray-500 text-sm mb-4 font-display">Identifica oportunidades y maximiza ROI de tu inversión.</p>
                            <a href="#" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                                <span>Leer</span> <FaArrowRight size={12} />
                            </a>
                        </div>
                    </motion.article>

                    {/* Article 3 */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-2xl overflow-hidden hover-glow group"
                    >
                        <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-pink-900/30 relative flex items-center justify-center border-b border-purple-500/10">
                            <FaBrain className="w-16 h-16 text-purple-500/30 group-hover:text-purple-500/50 transition-colors" />
                        </div>
                        <div className="p-6">
                            <time className="text-xs text-gray-500 mono">05 Dic 2024</time>
                            <h3 className="text-lg font-semibold mt-2 mb-3 text-white font-display">IA Aplicada a Negocios</h3>
                            <p className="text-gray-500 text-sm mb-4 font-display">Casos de uso reales y cómo implementar hoy mismo.</p>
                            <a href="#" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium">
                                <span>Leer</span> <FaArrowRight size={12} />
                            </a>
                        </div>
                    </motion.article>
                </div>
            </div>
        </section>
    );
}
