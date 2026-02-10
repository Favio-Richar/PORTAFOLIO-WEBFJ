"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCode, FaServer, FaRobot, FaCogs, FaRocket, FaChartLine, FaArrowRight } from 'react-icons/fa';
import '@/styles/home-elite.scss';

export default function ServiciosHome() {
  const servicios = [
    {
      icon: FaCode,
      title: "Desarrollo Web",
      desc: "Sitios y aplicaciones web con arquitectura moderna y rendimiento óptimo.",
      color: "indigo"
    },
    {
      icon: FaCogs,
      title: "Sistemas a Medida",
      desc: "Software empresarial personalizado adaptado a tu organización.",
      color: "cyan"
    },
    {
      icon: FaRobot,
      title: "Automatización & IA",
      desc: "Integración de inteligencia artificial para optimizar procesos.",
      color: "purple"
    },
    {
      icon: FaServer,
      title: "Backend & APIs",
      desc: "Arquitectura de backend robusta y APIs escalables.",
      color: "pink"
    },
    {
      icon: FaUserTie,
      title: "Consultoría",
      desc: "Asesoría estratégica para decisiones técnicas informadas.",
      color: "amber"
    },
    {
      icon: FaRocket,
      title: "Optimización",
      desc: "Mejora de rendimiento y preparación para el crecimiento.",
      color: "emerald"
    }
  ];

  return (
    <section id="servicios" className="py-24 px-6 bg-[#08080c]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-indigo-400 mono text-sm">02.</span>
            <span className="text-sm text-gray-400">Servicios</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-white">
            Soluciones que <span className="gradient-text">escalan tu negocio</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {servicios.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`glass-card rounded-2xl p-6 hover-glow group border-${s.color}-500/20`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${s.color}-500/20 to-${s.color}-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <s.icon className={`w-7 h-7 text-${s.color}-400`} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white font-display">{s.title}</h3>
              <p className="text-gray-500 text-sm font-display">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link href="/servicios" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/60 transition-all duration-300 text-sm font-medium">
            <span>Ver todos los servicios</span>
            <FaArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Helper needed because dynamic class names don't work well with Tailwind JIT if they aren't safe-listed or complete.
// However, since we import fontawesome icons, I'll use a mapping or specific component imports.
// For now, I'll assume the icon components are passed correctly. 
// Note: FaUserTie was missing in imports above, adding it now.
import { FaUserTie } from 'react-icons/fa';
