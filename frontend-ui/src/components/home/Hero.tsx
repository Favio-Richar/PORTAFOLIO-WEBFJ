import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaChevronDown } from 'react-icons/fa';
import '@/styles/home-elite.scss';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center px-6 pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16">
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-300">Agenda abierta · Diagnostico en 24h</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 font-display leading-tight"
              id="hero-name"
            >
              <span className="gradient-text block">FJ Digital</span>
              <span className="text-slate-100 block">Engineering</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-6 font-display"
              id="hero-role"
            >
              Ingenieria <span className="text-indigo-400">digital</span>, <span className="text-cyan-400">automatizacion</span> y consultoria tecnologica
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg text-gray-400 max-w-xl mb-4 font-display"
            >
              En FJ Digital Engineering ayudamos a empresas a construir plataformas que venden, automatizar procesos criticos y escalar operaciones con criterio tecnico senior.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-base sm:text-lg text-gray-500 max-w-xl mb-10 font-display"
            >
              Disenamos sistemas a medida, automatizaciones de alto impacto e integraciones seguras, con foco en conversion, control operativo y continuidad real.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-start"
            >
              <Link
                href="#contacto"
                id="cta-primary"
                className="px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300"
                style={{
                  color: '#04131f',
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                  boxShadow: '0 14px 35px rgba(20, 184, 166, 0.28)',
                  textTransform: 'none',
                  letterSpacing: '0.01em',
                }}
              >
                <span>Agendar diagnostico</span>
                <FaArrowRight size={18} />
              </Link>
              <Link
                href="#proyectos"
                id="cta-secondary"
                className="px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300"
                style={{
                  color: '#cbd5e1',
                  border: '1px solid rgba(56, 189, 248, 0.42)',
                  background: 'rgba(2, 12, 28, 0.52)',
                  textTransform: 'none',
                  letterSpacing: '0.01em',
                }}
              >
                <span>Ver casos reales</span>
                <FaChevronDown size={18} className="-rotate-90" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-semibold"
            >
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-white/5">
                Respuesta &lt; 24h
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-white/5">
                Sistemas en produccion
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-white/5">
                Soporte y evolucion continua
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="relative w-full flex justify-center lg:justify-end"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-fuchsia-500/15 blur-3xl opacity-70"></div>
            <motion.img
              src="/img/webdev.jpg"
              alt="Ingenieria de FJ Digital Engineering"
              className="relative w-full max-w-[660px] h-auto select-none pointer-events-none"
              draggable={false}
              style={{
                WebkitMaskImage: 'radial-gradient(88% 88% at 50% 50%, black 62%, transparent 100%)',
                maskImage: 'radial-gradient(88% 88% at 50% 50%, black 62%, transparent 100%)',
              }}
            />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 scroll-indicator">
        <FaChevronDown className="w-6 h-6 text-gray-500" />
      </div>
    </section>
  );
}
