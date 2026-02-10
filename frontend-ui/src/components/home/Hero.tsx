"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaChevronDown } from 'react-icons/fa';
import '@/styles/home-elite.scss';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
      {/* Floating Background Elements (Managed in Page or Global Layout usually, but included here for completeness) */}

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-300">Disponible para proyectos</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 font-display"
          id="hero-name"
        >
          <span className="text-white">Favio</span>
          <span className="gradient-text"> Jiménez</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl sm:text-2xl md:text-3xl text-gray-400 mb-8 font-display"
          id="hero-role"
        >
          Desarrollador <span className="text-indigo-400">Full Stack</span> & <span className="text-cyan-400">Consultor Tecnológico</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 font-display"
        >
          Transformo ideas en soluciones digitales escalables. Arquitectura moderna, código limpio y resultados medibles.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="#contacto" id="cta-primary" className="btn-primary px-8 py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2">
            <span>Iniciar proyecto</span>
            <FaArrowRight size={18} />
          </Link>
          <Link href="#proyectos" id="cta-secondary" className="btn-secondary px-8 py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2">
            <span>Ver portafolio</span>
            <FaChevronDown size={18} className="-rotate-90" />
          </Link>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 scroll-indicator">
          <FaChevronDown className="w-6 h-6 text-gray-500" />
        </div>
      </div>
    </section>
  );
}
