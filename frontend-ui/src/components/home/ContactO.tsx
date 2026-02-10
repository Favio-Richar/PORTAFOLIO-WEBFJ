"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaEnvelope, FaPhoneAlt, FaLinkedinIn, FaCalendarAlt } from 'react-icons/fa';
import '@/styles/home-elite.scss';

export default function ContactO() {
  return (
    <section id="contacto" className="py-24 px-6 relative overflow-hidden">
      {/* Bloqueamos el fondo para efecto visual si se desea */}
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 md:p-12 text-center border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-indigo-400 mono text-sm">06.</span>
            <span className="text-sm text-gray-400">Contacto</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white font-display">
            ¿Listo para <span className="gradient-text">transformar tu negocio?</span>
          </h2>

          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-display">
            Agenda una consultoría profesional y descubre cómo la tecnología puede impulsar tu empresa.
          </p>

          {/* Contact Methods - RAIN OF ICONS EFFECT */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {/* WhatsApp */}
            <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer" className="contact-card-rain flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-green-500/20 hover:border-green-500/50 transition-all duration-300 group">
              <div className="glow-dot bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaWhatsapp className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-center">
                <h4 className="text-green-400 font-bold uppercase tracking-wider text-sm mb-1">WhatsApp</h4>
                <span className="text-[10px] text-gray-500 font-mono">INSTANTÁNEO</span>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:favio@example.com" className="contact-card-rain flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="glow-dot bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-center">
                <h4 className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-1">Email</h4>
                <span className="text-[10px] text-gray-500 font-mono">CORPORATIVO</span>
              </div>
            </a>

            {/* Llamar */}
            <a href="tel:+573001234567" className="contact-card-rain flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="glow-dot bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaPhoneAlt className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-center">
                <h4 className="text-purple-400 font-bold uppercase tracking-wider text-sm mb-1">Llamar</h4>
                <span className="text-[10px] text-gray-500 font-mono">URGENTE</span>
              </div>
            </a>

            {/* LinkedIn */}
            <a href="https://linkedin.com/in/faviojiminez" target="_blank" rel="noopener noreferrer" className="contact-card-rain flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 group">
              <div className="glow-dot bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaLinkedinIn className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-center">
                <h4 className="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-1">LinkedIn</h4>
                <span className="text-[10px] text-gray-500 font-mono">NETWORKING</span>
              </div>
            </a>
          </div>

          {/* Primary CTA */}
          <div className="flex justify-center mb-6">
            <a href="https://calendly.com/favio" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-primary font-medium text-base hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
              <span>Agendar consultoría profesional</span>
              <FaCalendarAlt size={18} />
            </a>
          </div>

          <p className="text-center text-xs text-gray-500 font-mono">
            ⏱ Respondo en menos de 24 horas • 💰 Consultoría inicial sin costo • 🔒 Confidencialidad
          </p>
        </motion.div>
      </div>
    </section>
  );
}
