"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import {
    FaArrowRight,
    FaChartLine,
    FaClipboardCheck,
    FaCode,
    FaComments,
    FaHandshake,
    FaRocket,
    FaShieldAlt,
} from 'react-icons/fa';
import '@/styles/home-elite.scss';

type TrustSignal = {
    icon: IconType;
    title: string;
    desc: string;
};

type MethodStep = {
    num: string;
    title: string;
    eta: string;
    desc: string;
    deliverables: string[];
    icon: IconType;
    borderGradient: string;
    cardBackground: string;
    iconBackground: string;
    iconColor: string;
    glowColor: string;
};

const trustSignals: TrustSignal[] = [
    {
        icon: FaHandshake,
        title: 'Alcance claro',
        desc: 'Definimos que se construye, que no se incluye y los resultados esperados.',
    },
    {
        icon: FaComments,
        title: 'Comunicacion semanal',
        desc: 'Recibes avances, bloqueos y proximos pasos sin perder visibilidad del proyecto.',
    },
    {
        icon: FaShieldAlt,
        title: 'Trabajo con respaldo',
        desc: 'Control de cambios, pruebas y entregables documentados para reducir riesgo.',
    },
    {
        icon: FaChartLine,
        title: 'Enfoque en ventas',
        desc: 'Cada decision tecnica se conecta con conversion, operacion y crecimiento real.',
    },
];

const steps: MethodStep[] = [
    {
        num: '01',
        title: 'Diagnostico del negocio',
        eta: '2 a 4 dias',
        desc: 'Analizo tu tipo de negocio, servicios, precios, promociones, proceso comercial y perfil de cliente ideal para detectar oportunidades reales.',
        deliverables: [
            'Brief estrategico del negocio',
            'Mapa de oferta y propuesta de valor',
            'Objetivos priorizados por impacto',
        ],
        icon: FaClipboardCheck,
        borderGradient: 'linear-gradient(135deg, rgba(99,102,241,0.75), rgba(67,56,202,0.35))',
        cardBackground: 'linear-gradient(165deg, rgba(30,41,59,0.5), rgba(8,14,28,0.95) 62%)',
        iconBackground: 'rgba(99,102,241,0.2)',
        iconColor: '#c7d2fe',
        glowColor: 'rgba(99,102,241,0.3)',
    },
    {
        num: '02',
        title: 'Estrategia y alcance',
        eta: '2 a 3 dias',
        desc: 'Aterrizamos un plan realista: funcionalidades, prioridades, etapas, tiempos y presupuesto para evitar cambios sorpresa.',
        deliverables: [
            'Plan por fases y roadmap',
            'Backlog priorizado',
            'Rango de inversion y cronograma',
        ],
        icon: FaChartLine,
        borderGradient: 'linear-gradient(135deg, rgba(34,211,238,0.75), rgba(14,116,144,0.35))',
        cardBackground: 'linear-gradient(165deg, rgba(8,47,73,0.45), rgba(8,14,28,0.95) 62%)',
        iconBackground: 'rgba(34,211,238,0.22)',
        iconColor: '#a5f3fc',
        glowColor: 'rgba(34,211,238,0.3)',
    },
    {
        num: '03',
        title: 'UX, arquitectura y prototipo',
        eta: '3 a 6 dias',
        desc: 'Diseno la experiencia y la base tecnica antes de programar para validar la idea y reducir retrabajo.',
        deliverables: [
            'Flujo de pantallas y contenido',
            'Prototipo validado contigo',
            'Arquitectura tecnica inicial',
        ],
        icon: FaCode,
        borderGradient: 'linear-gradient(135deg, rgba(168,85,247,0.72), rgba(126,34,206,0.35))',
        cardBackground: 'linear-gradient(165deg, rgba(76,29,149,0.42), rgba(8,14,28,0.95) 62%)',
        iconBackground: 'rgba(168,85,247,0.22)',
        iconColor: '#e9d5ff',
        glowColor: 'rgba(168,85,247,0.3)',
    },
    {
        num: '04',
        title: 'Desarrollo y QA continuo',
        eta: '2 a 6 semanas',
        desc: 'Implemento en sprints cortos con revision constante, pruebas funcionales y control de calidad tecnico.',
        deliverables: [
            'Avances semanales visibles',
            'Pruebas funcionales y performance',
            'Integraciones y automatizaciones',
        ],
        icon: FaShieldAlt,
        borderGradient: 'linear-gradient(135deg, rgba(244,114,182,0.72), rgba(190,24,93,0.35))',
        cardBackground: 'linear-gradient(165deg, rgba(131,24,67,0.4), rgba(8,14,28,0.95) 62%)',
        iconBackground: 'rgba(244,114,182,0.22)',
        iconColor: '#fbcfe8',
        glowColor: 'rgba(244,114,182,0.28)',
    },
    {
        num: '05',
        title: 'Lanzamiento y optimizacion',
        eta: '3 a 7 dias',
        desc: 'Publicamos con checklist completo y quedamos midiendo resultados para mejorar conversion y operacion.',
        deliverables: [
            'Deploy, analytics y handoff',
            'Capacitacion y documentacion',
            'Soporte inicial y mejoras',
        ],
        icon: FaRocket,
        borderGradient: 'linear-gradient(135deg, rgba(45,212,191,0.75), rgba(13,148,136,0.35))',
        cardBackground: 'linear-gradient(165deg, rgba(17,94,89,0.42), rgba(8,14,28,0.95) 62%)',
        iconBackground: 'rgba(45,212,191,0.22)',
        iconColor: '#99f6e4',
        glowColor: 'rgba(45,212,191,0.28)',
    },
];

export default function Metodologia() {
    return (
        <section id="metodologia" className="relative py-24 px-6 bg-[#08080c] overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full bg-indigo-500/10 blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 border-cyan-400/25">
                        <span className="text-cyan-300 mono text-sm">04.</span>
                        <span className="text-sm text-slate-300">Metodologia</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-white">
                        Metodo real para <span className="gradient-text">vender mas y operar mejor</span>
                    </h2>
                    <p className="max-w-3xl mx-auto text-base md:text-lg text-slate-300 font-display leading-relaxed">
                        Este proceso no es solo desarrollo tecnico. Primero entendemos tu negocio, luego construimos una solucion enfocada en conversion, control operativo y crecimiento medible.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {trustSignals.map((signal, i) => (
                        <motion.div
                            key={signal.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: i * 0.06 }}
                            className="glass-card rounded-xl p-4 border-white/10"
                        >
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center mb-3">
                                <signal.icon className="text-cyan-300 text-base" />
                            </div>
                            <h3 className="text-sm font-bold text-white font-display mb-1">{signal.title}</h3>
                            <p className="text-xs text-slate-300 leading-relaxed font-display">{signal.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55, delay: i * 0.07 }}
                            className="group rounded-2xl p-[1px] overflow-hidden"
                            style={{ background: step.borderGradient }}
                        >
                            <div
                                className="relative rounded-2xl p-6 h-full transition-all duration-300 group-hover:-translate-y-1"
                                style={{
                                    background: step.cardBackground,
                                    boxShadow: `0 14px 30px ${step.glowColor}`,
                                }}
                            >
                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/10 via-transparent to-white/10 pointer-events-none"></span>

                                <div className="relative flex items-center justify-between mb-5">
                                    <span className="inline-flex px-3 py-1 rounded-full border border-white/20 bg-white/5 text-sm font-black text-white mono">{step.num}</span>
                                    <div
                                        className="w-11 h-11 rounded-xl border flex items-center justify-center"
                                        style={{ background: step.iconBackground, borderColor: `${step.iconColor}66` }}
                                    >
                                        <step.icon style={{ color: step.iconColor }} className="text-lg" />
                                    </div>
                                </div>

                                <h3 className="relative text-xl font-semibold mb-3 text-white font-display">{step.title}</h3>
                                <p className="relative inline-flex items-center px-2.5 py-1 rounded-lg border border-cyan-300/25 bg-cyan-400/10 text-cyan-200 text-xs font-bold tracking-wide mb-3">
                                    Tiempo estimado: {step.eta}
                                </p>
                                <p className="relative text-slate-300 text-sm md:text-[15px] leading-relaxed font-display mb-4">{step.desc}</p>

                                <div className="relative">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">Entregables</p>
                                    <ul className="space-y-2">
                                        {step.deliverables.map((item) => (
                                            <li key={item} className="text-sm text-slate-200/95 font-display leading-relaxed flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-300 shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-emerald-500/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <p className="text-xs uppercase tracking-[0.22em] font-bold text-cyan-300 mb-2">Inicio ordenado del proyecto</p>
                        <h3 className="text-xl md:text-2xl font-bold text-white font-display mb-2">Trabajemos con plan, fechas y objetivos claros</h3>
                        <p className="text-slate-200/90 text-sm md:text-base font-display max-w-2xl">
                            Si quieres una web o sistema que venda mejor y te ahorre tiempo operativo, empezamos con un diagnostico estrategico y una hoja de ruta realista.
                        </p>
                    </div>

                    <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.98 }}>
                        <Link href="/cotizar" className="services-cta-animated inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold">
                            <span>Agendar diagnostico</span>
                            <FaArrowRight size={14} />
                        </Link>
                    </motion.div>
                </div>
                <p className="mt-4 text-center text-xs text-slate-400 font-display">
                    Tiempos referenciales. El plazo final se define segun alcance, integraciones y prioridad del proyecto.
                </p>
            </div>
        </section>
    );
}

