"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import { FaArrowRight, FaGlobe, FaCogs, FaRobot, FaServer, FaRocket, FaUserTie } from 'react-icons/fa';
import '@/styles/home-elite.scss';

type ServiceCard = {
  icon: IconType;
  title: string;
  desc: string;
  borderGradient: string;
  cardBackground: string;
  iconBackground: string;
  iconColor: string;
  glowColor: string;
};

const servicios: ServiceCard[] = [
  {
    icon: FaGlobe,
    title: 'Desarrollo Web',
    desc: 'Plataformas enfocadas en conversión, velocidad y experiencia consistente para tus clientes.',
    borderGradient: 'linear-gradient(135deg, rgba(56,189,248,0.7), rgba(14,116,144,0.35))',
    cardBackground: 'linear-gradient(170deg, rgba(8,47,73,0.35), rgba(8,14,28,0.94) 60%)',
    iconBackground: 'rgba(56,189,248,0.2)',
    iconColor: '#7dd3fc',
    glowColor: 'rgba(56,189,248,0.3)',
  },
  {
    icon: FaCogs,
    title: 'Sistemas a Medida',
    desc: 'Automatiza operaciones internas con sistemas hechos para tus procesos críticos.',
    borderGradient: 'linear-gradient(135deg, rgba(34,197,94,0.7), rgba(21,128,61,0.35))',
    cardBackground: 'linear-gradient(170deg, rgba(6,78,59,0.34), rgba(8,14,28,0.94) 60%)',
    iconBackground: 'rgba(34,197,94,0.2)',
    iconColor: '#86efac',
    glowColor: 'rgba(34,197,94,0.28)',
  },
  {
    icon: FaRobot,
    title: 'Automatización e IA',
    desc: 'Bots, integraciones y analítica que reducen tiempos y multiplican eficiencia.',
    borderGradient: 'linear-gradient(135deg, rgba(168,85,247,0.7), rgba(126,34,206,0.35))',
    cardBackground: 'linear-gradient(170deg, rgba(76,29,149,0.33), rgba(8,14,28,0.94) 60%)',
    iconBackground: 'rgba(168,85,247,0.2)',
    iconColor: '#d8b4fe',
    glowColor: 'rgba(168,85,247,0.3)',
  },
  {
    icon: FaServer,
    title: 'Backend y APIs',
    desc: 'Integraciones seguras con ERP/CRM, pagos y servicios externos listos para escalar.',
    borderGradient: 'linear-gradient(135deg, rgba(244,114,182,0.7), rgba(190,24,93,0.35))',
    cardBackground: 'linear-gradient(170deg, rgba(131,24,67,0.32), rgba(8,14,28,0.94) 60%)',
    iconBackground: 'rgba(244,114,182,0.2)',
    iconColor: '#f9a8d4',
    glowColor: 'rgba(244,114,182,0.28)',
  },
  {
    icon: FaUserTie,
    title: 'Consultoría Tecnológica',
    desc: 'Diagnóstico, roadmap y decisiones técnicas con foco en impacto de negocio.',
    borderGradient: 'linear-gradient(135deg, rgba(250,204,21,0.72), rgba(202,138,4,0.35))',
    cardBackground: 'linear-gradient(170deg, rgba(120,53,15,0.34), rgba(8,14,28,0.94) 60%)',
    iconBackground: 'rgba(250,204,21,0.22)',
    iconColor: '#fde68a',
    glowColor: 'rgba(250,204,21,0.3)',
  },
  {
    icon: FaRocket,
    title: 'Optimización',
    desc: 'Performance, SEO técnico y estabilidad operativa para sostener resultados.',
    borderGradient: 'linear-gradient(135deg, rgba(45,212,191,0.7), rgba(13,148,136,0.35))',
    cardBackground: 'linear-gradient(170deg, rgba(17,94,89,0.34), rgba(8,14,28,0.94) 60%)',
    iconBackground: 'rgba(45,212,191,0.2)',
    iconColor: '#99f6e4',
    glowColor: 'rgba(45,212,191,0.28)',
  },
];

export default function ServiciosHome() {
  return (
    <section id="servicios" className="py-24 px-6 bg-[#08080c]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 border-cyan-400/25">
            <span className="text-cyan-300 mono text-sm">02.</span>
            <span className="text-sm text-slate-300">Servicios</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-white">
            Soluciones digitales para <span className="gradient-text">crecer con control</span>
          </h2>

          <p className="max-w-3xl mx-auto text-base md:text-lg text-slate-300 font-display leading-relaxed">
            Diseñamos, automatizamos y mantenemos sistemas que venden, integran operaciones y sostienen el crecimiento con métricas claras.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {servicios.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="group rounded-2xl p-[1px] overflow-hidden"
              style={{ background: s.borderGradient }}
            >
              <div
                className="relative rounded-2xl p-6 h-full transition-all duration-300 group-hover:-translate-y-1"
                style={{
                  background: s.cardBackground,
                  boxShadow: `0 14px 30px ${s.glowColor}`,
                }}
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/7 via-transparent to-white/7 pointer-events-none"></span>

                <div
                  className="relative w-14 h-14 rounded-xl flex items-center justify-center mb-6 border"
                  style={{ background: s.iconBackground, borderColor: `${s.iconColor}66` }}
                >
                  <s.icon className="w-7 h-7" style={{ color: s.iconColor }} />
                </div>

                <h3 className="relative text-xl font-semibold mb-3 font-display text-sky-200">{s.title}</h3>
                <p className="relative text-slate-300 text-base font-display leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/servicios"
              className="services-cta-animated inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm md:text-base font-semibold"
            >
              <span>Ver todos los servicios</span>
              <FaArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
