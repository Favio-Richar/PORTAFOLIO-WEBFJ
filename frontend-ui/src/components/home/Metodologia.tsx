"use client";

import React from 'react';
import { motion } from 'framer-motion';
import '@/styles/home-elite.scss';

export default function Metodologia() {
    const steps = [
        { num: "01", title: "Análisis", desc: "Entendimiento profundo del negocio e identificación de necesidades.", color: "indigo" },
        { num: "02", title: "Diseño", desc: "Arquitectura técnica y prototipo de la solución.", color: "cyan" },
        { num: "03", title: "Desarrollo", desc: "Desarrollo iterativo con sprints ágiles y testing.", color: "purple" },
        { num: "04", title: "Entrega", desc: "Deploy, documentación y soporte continuo.", color: "pink" }
    ];

    return (
        <section id="metodologia" className="py-24 px-6 bg-[#08080c]">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                        <span className="text-indigo-400 mono text-sm">04.</span>
                        <span className="text-sm text-gray-400">Metodología</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-white">
                        Proceso <span className="gradient-text">probado y eficiente</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card rounded-2xl p-6 hover-glow relative overflow-hidden"
                        >
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 flex items-center justify-center mb-6 shadow-lg shadow-${step.color}-500/30`}>
                                <span className="text-2xl font-bold text-white font-mono">{step.num}</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-white font-display">{step.title}</h3>
                            <p className="text-gray-500 text-sm font-display">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
