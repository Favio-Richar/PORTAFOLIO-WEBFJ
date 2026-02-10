"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaChartLine, FaShoppingCart, FaUsersCog } from 'react-icons/fa';
import '@/styles/home-elite.scss';

export default function ProyectosHome() {
  return (
    <section id="proyectos" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-indigo-400 mono text-sm">03.</span>
            <span className="text-sm text-gray-400">Proyectos</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-white">
            Proyectos <span className="gradient-text">destacados</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Proyecto 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative glass-card rounded-2xl overflow-hidden hover-glow"
          >
            <div className="aspect-video bg-gradient-to-br from-indigo-900/50 to-purple-900/50 relative flex items-center justify-center border-b border-indigo-500/10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <FaChartLine className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-medium border border-indigo-500/30">Sistema</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white font-display">Dashboard Analytics</h3>
              <p className="text-gray-500 text-sm mb-4 font-display">Plataforma de análisis en tiempo real con predicciones basadas en IA.</p>
              <a href="#" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                <span>Ver más</span> <FaArrowRight size={12} />
              </a>
            </div>
          </motion.div>

          {/* Proyecto 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative glass-card rounded-2xl overflow-hidden hover-glow"
          >
            <div className="aspect-video bg-gradient-to-br from-cyan-900/50 to-emerald-900/50 relative flex items-center justify-center border-b border-cyan-500/10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                <FaShoppingCart className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30">E-commerce</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white font-display">E-Commerce Enterprise</h3>
              <p className="text-gray-500 text-sm mb-4 font-display">Plataforma completa con gestión de inventario y pagos.</p>
              <a href="#" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                <span>Ver más</span> <FaArrowRight size={12} />
              </a>
            </div>
          </motion.div>

          {/* Proyecto 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative glass-card rounded-2xl overflow-hidden hover-glow"
          >
            <div className="aspect-video bg-gradient-to-br from-pink-900/50 to-amber-900/50 relative flex items-center justify-center border-b border-pink-500/10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center">
                <FaUsersCog className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs font-medium border border-pink-500/30">CRM</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white font-display">CRM Automation Suite</h3>
              <p className="text-gray-500 text-sm mb-4 font-display">Sistema con automatización de flujos que redujo 60% de tiempo.</p>
              <a href="#" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 text-sm font-medium">
                <span>Ver más</span> <FaArrowRight size={12} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
