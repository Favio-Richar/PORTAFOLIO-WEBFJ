"use client";

import React from 'react';
import { motion } from 'framer-motion';
import '@/styles/home-elite.scss';

export default function Testimonios() {
  return (
    <section id="confianza" className="py-24 px-6 bg-[#08080c]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold gradient-text mb-2 font-display">50+</div>
            <p className="text-gray-500 text-sm font-display">Proyectos</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold gradient-text mb-2 font-display">8+</div>
            <p className="text-gray-500 text-sm font-display">Años</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold gradient-text mb-2 font-display">100%</div>
            <p className="text-gray-500 text-sm font-display">Satisfacción</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold gradient-text mb-2 font-display">24/7</div>
            <p className="text-gray-500 text-sm font-display">Soporte</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-semibold mb-6 text-white font-display">Empresas que confían en mi trabajo</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 mb-8">
            <div className="w-24 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-medium font-mono">CLIENTE 1</span>
            </div>
            <div className="w-24 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-medium font-mono">CLIENTE 2</span>
            </div>
            <div className="w-24 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-medium font-mono">CLIENTE 3</span>
            </div>
            <div className="w-24 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-medium font-mono">CLIENTE 4</span>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-light text-gray-300 italic font-display">
            "Soluciones reales, no promesas. <span className="gradient-text font-normal">Tecnología que escala.</span>"
          </p>
        </motion.div>
      </div>
    </section>
  );
}
