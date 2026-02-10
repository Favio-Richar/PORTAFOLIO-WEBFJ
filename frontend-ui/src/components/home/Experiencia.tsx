"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaLaptopCode, FaRobot, FaBuilding, FaUserTie } from 'react-icons/fa';
import '@/styles/home-elite.scss';

export default function Experiencia() {
  return (
    <section className="py-20 px-6" id="sobre-mi">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <span className="text-indigo-400 mono text-sm">01.</span>
              <span className="text-sm text-gray-400">Sobre mí</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold leading-tight font-display" id="about-title">
              Arquitectura con propósito.<br />
              <span className="gradient-text">Tecnología que impulsa negocios.</span>
            </h2>

            <p className="text-lg text-gray-400 leading-relaxed font-display">
              Ingeniero de software con más de 8 años de experiencia construyendo soluciones digitales que transforman empresas. Mi enfoque combina arquitectura robusta, código limpio y una obsesión por la experiencia de usuario.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl glass-card hover-glow">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <FaLaptopCode className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-sm font-medium text-white font-display">Full Stack</span>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl glass-card hover-glow">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <FaRobot className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-sm font-medium text-white font-display">Automatización & IA</span>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl glass-card hover-glow">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FaBuilding className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-white font-display">Sistemas Empresariales</span>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl glass-card hover-glow">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <FaUserTie className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-sm font-medium text-white font-display">Consultoría</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="glass-card rounded-3xl p-8">
              <div className="bg-[#0a0a0f] rounded-2xl p-6 text-sm font-mono border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-400 text-xs overflow-x-auto">
                  <span className="text-purple-400">const</span> <span className="text-yellow-200">developer</span> = {'{'}<br />
                  &nbsp;&nbsp;<span className="text-indigo-300">name</span>: <span className="text-green-400">"Favio"</span>,<br />
                  &nbsp;&nbsp;<span className="text-indigo-300">role</span>: <span className="text-green-400">"Full Stack"</span>,<br />
                  &nbsp;&nbsp;<span className="text-indigo-300">skills</span>: [<span className="text-green-400">"Web"</span>, <span className="text-green-400">"IA"</span>]<br />
                  {'}'};
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center animate-float shadow-lg shadow-indigo-500/30">
                <FaLaptopCode className="w-10 h-10 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
