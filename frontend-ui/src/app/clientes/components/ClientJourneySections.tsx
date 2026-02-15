"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import {
  PROCESS_STEPS,
  COMPARISONS,
  CLIENT_ONBOARDING,
  CLIENT_PROMISES,
  CLIENT_EVOLUTION_STAGES,
  CLIENT_RELATIONSHIP_STATS,
} from "../data";
import FadeInUp from "./FadeInUp";

export default function ClientJourneySections() {
  return (
    <>
      {/* 6. PROCESS SECTION (CORPORATE REDESIGN) */}
      <section className="corporate-process-section py-24 px-6 relative overflow-hidden">
        {/* High-Fidelity SVG Wavy Background */}
        <div className="wavy-bg-svg-container">
          <svg viewBox="0 0 1440 800" preserveAspectRatio="none" className="wavy-svg">
            <defs>
              <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5b7a8a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2c3e50" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4d5c66" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#141e26" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="waveGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1a2a33" stopOpacity="1" />
                <stop offset="100%" stopColor="#0d141a" stopOpacity="1" />
              </linearGradient>
            </defs>

            <rect width="1440" height="800" fill="#0f172a" />

            {/* Path 1: Top-Right Sweep */}
            <path d="M1440 0C1100 0 800 200 600 500C400 800 100 800 0 800V0H1440Z" fill="url(#waveGrad1)" opacity="0.6" />

            {/* Path 2: Bottom-Left Sweep */}
            <path d="M0 800C300 800 600 600 800 300C1000 0 1300 0 1440 0V800H0Z" fill="url(#waveGrad2)" opacity="0.8" />

            {/* Path 3: Bottom Accent */}
            <path d="M1440 800C1100 800 900 600 700 700C500 800 200 800 0 700V800H1440Z" fill="url(#waveGrad3)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto z-10 relative">
          <div className="text-center mb-16">
            <FadeInUp>
              <h2 className="section-title">Como Trabajamos</h2>
              <p className="section-description">
                Aplicamos un proceso estructurado y orientado a resultados que permite a pequeñas y medianas empresas implementar tecnología con claridad, control y crecimiento sostenible.
              </p>
            </FadeInUp>
          </div>

          <div className="corporate-grid">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="step-card group"
              >
                <div className="step-header">
                  <div className="watermark">{step.number}</div>
                  <div className="icon-circle">
                    {step.icon}
                  </div>
                </div>

                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.description}</p>
                  <p className="step-extra">{step.extra}</p>
                </div>

                <div className="step-footer">
                  <span className="duration-tag">{step.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. COMPARISON SECTION - MODERN TWO-COLUMN LAYOUT */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <FadeInUp>
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 rounded-full mb-8 shadow-lg shadow-cyan-500/30">
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-300">💎 VENTAJA COMPETITIVA</span>
              </div>
              <h2 className="text-6xl font-black tracking-tighter mb-6 uppercase" style={{ color: '#22d3ee' }}>Más que un Servicio, un Aliado Digital</h2>
              <p className="text-2xl font-bold max-w-4xl mx-auto leading-relaxed" style={{ color: '#e2e8f0' }}>Acompañamos a empresas y emprendedores a construir una presencia profesional que inspire confianza y genere oportunidades reales.</p>
            </FadeInUp>
          </div>

          {/* TWO COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* LEFT: COMPARISON TABLE */}
            <FadeInUp>
              <div className="p-10 md:p-12 rounded-[3rem] border-2 border-cyan-400/40 bg-gradient-to-br from-[#0a0f1e]/95 to-[#0f1829]/90 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-cyan-500/20">
                {/* Header */}

                {/* Header */}
                <div className="relative grid grid-cols-3 gap-6 mb-10 items-center text-center">
                  <span className="text-white/50 font-black uppercase text-xs tracking-[0.25em]">OTROS</span>
                  <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-orange-400 rounded-full" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-black uppercase text-xs tracking-[0.25em]">NOSOTROS</span>
                </div>

                {/* Comparison Items */}
                <div className="relative space-y-4">
                  {COMPARISONS.map((comp, i) => (
                    <div key={i} className="comparison-card group p-5 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border-2 border-cyan-500/20 hover:border-cyan-400/60 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="text-3xl w-12 flex justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                          {comp.icon}
                        </div>

                        {/* Before/After */}
                        <div className="flex-1 grid grid-cols-3 items-center gap-3">
                          <span className="text-right text-white/40 line-through text-xs font-bold uppercase tracking-wide">
                            {comp.before}
                          </span>
                          <div className="flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-500 flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg shadow-cyan-500/50">
                              <FaArrowRight className="text-white text-xs" />
                            </div>
                          </div>
                          <span className="text-left text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 font-black text-sm uppercase tracking-tight drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                            {comp.after}
                          </span>
                        </div>

                        {/* Label */}
                        <div className="w-32 text-right">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-400/70 group-hover:text-orange-300 transition-colors drop-shadow-[0_0_8px_rgba(255,107,0,0.4)]">
                            {comp.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInUp>

            {/* RIGHT: DESCRIPTIVE TEXT BOX */}
            <FadeInUp delay={0.2}>
              <div className="h-full flex flex-col gap-6">
                {/* Main Description Card */}
                <div className="p-10 rounded-[3rem] bg-gradient-to-br from-blue-500/5 via-transparent to-orange-500/5 border-2 border-blue-400/20 backdrop-blur-sm relative overflow-hidden">
                  <div className="relative">
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-orange-300 mb-6 uppercase tracking-tight">Excelencia Garantizada</h3>
                    <p className="text-lg text-white/90 leading-relaxed mb-8">
                      No somos solo otro proveedor de tecnología. Somos tu <span className="text-cyan-300 font-black drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]">socio estratégico</span> en transformación digital, comprometidos con resultados medibles y soluciones que escalan con tu negocio.
                    </p>

                    {/* Key Benefits */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 flex items-center justify-center flex-shrink-0 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/40">
                          <FaCheckCircle className="text-cyan-300 text-lg drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                        </div>
                        <div>
                          <h4 className="text-white font-black mb-1">Arquitectura Enterprise</h4>
                          <p className="text-sm text-white/70">Soluciones escalables diseñadas para crecer con tu empresa</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 flex items-center justify-center flex-shrink-0 border-2 border-blue-400/60 shadow-lg shadow-blue-500/40">
                          <FaCheckCircle className="text-blue-300 text-lg drop-shadow-[0_0_8px_rgba(0,0,255,0.8)]" />
                        </div>
                        <div>
                          <h4 className="text-white font-black mb-1">Soporte 24/7 Dedicado</h4>
                          <p className="text-sm text-white/70">Equipo técnico siempre disponible para resolver cualquier incidencia</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 flex items-center justify-center flex-shrink-0 border-2 border-orange-400/60 shadow-lg shadow-orange-500/40">
                          <FaCheckCircle className="text-orange-300 text-lg drop-shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
                        </div>
                        <div>
                          <h4 className="text-white font-black mb-1">Resultados que se Notan</h4>
                          <p className="text-sm text-white/70">Estrategia, diseño y tecnología alineados para posicionar tu marca, generar confianza y convertir visitantes en clientes.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-2 border-cyan-400/40 text-center backdrop-blur-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-400 mb-2">99.9%</div>
                    <div className="text-xs font-bold text-cyan-300/80 uppercase tracking-wider">Uptime</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-2 border-blue-400/40 text-center backdrop-blur-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-400 mb-2">200+</div>
                    <div className="text-xs font-bold text-blue-300/80 uppercase tracking-wider">Proyectos</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#0a0f1e]/80 border-2 border-orange-400/40 text-center backdrop-blur-sm shadow-lg shadow-orange-500/10 hover:shadow-orange-500/30 transition-all">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-400 mb-2">4.9★</div>
                    <div className="text-xs font-bold text-orange-300/80 uppercase tracking-wider">Rating</div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* 8. CLIENT ONBOARDING SECTION */}
      <section className="py-32 px-6 bg-[radial-gradient(circle_at_top,_rgba(180,83,9,0.18),_rgba(10,10,14,0.95)_45%,_rgba(9,9,11,1)_100%)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <FadeInUp>
              <h2 className="text-5xl font-black text-amber-100 tracking-tighter mb-4 uppercase">Onboarding de Clientes</h2>
              <p className="text-stone-400 max-w-3xl mx-auto leading-relaxed">
                Conoce el flujo operativo y los entregables que recibes en cada etapa para iniciar el proyecto con control y claridad.
              </p>
            </FadeInUp>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {CLIENT_ONBOARDING.map((step, i) => (
                <FadeInUp key={step.title} delay={i * 0.08}>
                  <div className="h-full p-8 rounded-[2.2rem] border border-amber-900/45 bg-[#121217]/90 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.45)] hover:border-amber-600/45 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-700/40 flex items-center justify-center text-2xl">
                        {step.icon}
                      </div>
                      <span className="text-[10px] font-black tracking-[0.25em] uppercase text-amber-300/90">
                        {step.timing}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-amber-50 mb-3">{step.title}</h3>
                    <p className="text-sm text-stone-300/85 leading-relaxed mb-5">{step.description}</p>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300/90">
                      {step.deliverable}
                    </div>
                  </div>
                </FadeInUp>
              ))}
            </div>

            <FadeInUp delay={0.2}>
              <div className="h-full p-10 rounded-[2.5rem] border border-amber-900/50 bg-[linear-gradient(160deg,rgba(120,53,15,0.28),rgba(18,18,24,0.92)_45%,rgba(9,9,12,0.98))] backdrop-blur-xl shadow-[0_26px_70px_rgba(0,0,0,0.45)]">
                <div className="inline-block px-4 py-2 rounded-full bg-amber-950/45 border border-amber-700/45 mb-6">
                  <span className="text-[10px] font-black tracking-[0.25em] uppercase text-amber-300">Para Nuevos Clientes</span>
                </div>
                <h3 className="text-3xl font-black text-amber-100 leading-tight mb-6">Que recibes desde el dia uno</h3>
                <div className="space-y-4 mb-8">
                  {CLIENT_PROMISES.map((promise) => (
                    <div key={promise.label} className="flex items-start gap-3 p-4 rounded-2xl border border-[#3b3224] bg-[#141419]/85">
                      {promise.icon}
                      <span className="text-sm text-stone-300/95 leading-relaxed">{promise.label}</span>
                    </div>
                  ))}
                </div>
                <div className="p-5 rounded-2xl border border-[#4a3a26] bg-[#0f0f13]/95">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300/90 mb-2">
                    Objetivo del bloque
                  </p>
                  <p className="text-sm text-stone-400">
                    Reducir dudas y mostrar confianza antes de que el cliente llegue al formulario.
                  </p>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section >

      {/* 11. CLIENT EVOLUTION SECTION */}
      < section className="py-32 px-6 bg-[linear-gradient(180deg,#0e1015_0%,#12151d_48%,#0d1016_100%)]" >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <FadeInUp>
              <div className="inline-block px-6 py-2 rounded-full border border-amber-700/40 bg-amber-950/30 mb-7">
                <span className="text-[10px] font-black tracking-[0.35em] uppercase text-amber-300">Evolucion Real</span>
              </div>
              <h2 className="text-5xl font-black text-stone-100 tracking-tight mb-5 uppercase">
                Como Crecen Nuestros Clientes
              </h2>
              <p className="text-stone-400 max-w-3xl mx-auto leading-relaxed">
                Este bloque muestra progreso real en el tiempo: orden operativo, crecimiento comercial y consolidacion de largo plazo.
              </p>
            </FadeInUp>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              {CLIENT_EVOLUTION_STAGES.map((stage, i) => {
                const StageIcon = stage.icon;
                return (
                  <FadeInUp key={stage.phase} delay={i * 0.1}>
                    <div className="group relative overflow-hidden rounded-[2.4rem] border border-[#3f3426] bg-[linear-gradient(160deg,rgba(31,24,17,0.26),rgba(21,24,31,0.92)_50%,rgba(11,14,19,0.98))] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-500/55 hover:shadow-[0_34px_90px_rgba(0,0,0,0.6)]">
                      <div className="pointer-events-none absolute -top-28 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl opacity-60 transition-all duration-500 group-hover:scale-125 group-hover:opacity-95" />
                      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl opacity-60 transition-all duration-500 group-hover:scale-125 group-hover:opacity-95" />
                      <div className="pointer-events-none absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-200/70 to-transparent opacity-70" />
                      <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-xl border flex items-center justify-center text-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                            style={{
                              borderColor: stage.iconBorder,
                              backgroundColor: stage.iconBg,
                              boxShadow: `0 0 22px ${stage.iconGlow}`,
                            }}
                          >
                            <StageIcon className="text-xl" style={{ color: stage.iconColor }} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black tracking-[0.24em] uppercase text-amber-300/90 mb-2">{stage.phase}</p>
                            <h3 className="text-2xl font-black text-stone-100 mb-2 transition-colors duration-300 group-hover:text-amber-100">{stage.title}</h3>
                            <p className="text-sm text-stone-400 leading-relaxed">{stage.context}</p>
                          </div>
                        </div>
                        <div className="inline-flex px-4 py-2 rounded-full border border-emerald-700/35 bg-emerald-900/20 text-[10px] font-black tracking-[0.17em] uppercase text-emerald-300 transition-all duration-500 group-hover:border-emerald-500/60 group-hover:bg-emerald-900/35 group-hover:shadow-[0_0_28px_rgba(16,185,129,0.22)]">
                          {stage.metric}
                        </div>
                      </div>

                      <div className="relative mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-[#3b3329] bg-[#12141a]/95 transition-all duration-300 hover:-translate-y-1 hover:border-amber-600/45 hover:bg-[#161821]">
                          <p className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-[0.18em] uppercase text-rose-300 border border-rose-500/45 bg-rose-900/25 mb-2">
                            Antes
                          </p>
                          <p className="text-sm text-stone-300/90 leading-relaxed">{stage.before}</p>
                        </div>
                        <div className="p-4 rounded-2xl border border-emerald-900/35 bg-[#121a16]/95 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/45 hover:bg-[#14201a]">
                          <p className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-[0.18em] uppercase text-emerald-200 border border-emerald-500/45 bg-emerald-900/25 mb-2">
                            Despues
                          </p>
                          <p className="text-sm text-stone-200/90 leading-relaxed">{stage.after}</p>
                        </div>
                      </div>
                    </div>
                  </FadeInUp>
                );
              })}
            </div>

            <FadeInUp delay={0.2}>
              <div className="group relative overflow-hidden rounded-[2.4rem] border border-[#433625] bg-[linear-gradient(170deg,rgba(99,55,21,0.26),rgba(21,24,31,0.92)_45%,rgba(14,16,22,0.98))] p-8 h-full shadow-[0_26px_70px_rgba(0,0,0,0.45)] transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-500/55 hover:shadow-[0_34px_90px_rgba(0,0,0,0.6)]">
                <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl opacity-70 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-emerald-500/12 blur-3xl opacity-55 transition-all duration-500 group-hover:scale-125 group-hover:opacity-90" />
                <div className="relative">
                  <h3 className="text-3xl font-black text-amber-100 leading-tight mb-3">Clientes que se Quedan</h3>
                  <p className="text-sm text-stone-400 leading-relaxed mb-8">
                    Mas alla de un proyecto puntual, construimos relaciones de trabajo estables y medibles en el tiempo.
                  </p>

                  <div className="space-y-4 mb-8">
                    {CLIENT_RELATIONSHIP_STATS.map((stat) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={stat.label} className="group p-4 rounded-2xl border border-[#4a3b2a] bg-[#121419]/90 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/55 hover:bg-[#171b25] hover:shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-xl border flex items-center justify-center text-lg transition-all duration-300 group-hover:scale-110"
                              style={{
                                borderColor: stat.iconBorder,
                                backgroundColor: stat.iconBg,
                                boxShadow: `0 0 18px ${stat.iconGlow}`,
                              }}
                            >
                              <StatIcon style={{ color: stat.iconColor }} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-300">{stat.label}</p>
                          </div>
                          <p className="text-3xl font-black text-amber-200 mb-2 transition-colors duration-300 group-hover:text-amber-100">{stat.value}</p>
                          <p className="text-xs text-stone-400 leading-relaxed">{stat.detail}</p>
                        </div>
                      );
                    })}
                  </div>

                  <Link
                    href="/clientes/casos-completos"
                    className="group inline-flex items-center justify-center gap-2 w-full py-4 rounded-full border border-amber-700/45 text-amber-200 font-black uppercase tracking-[0.18em] text-xs hover:bg-amber-900/25 hover:border-amber-500/70 transition-all duration-300"
                  >
                    Ver Casos Completos
                    <FaArrowRight className="text-[11px] transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section >

    </>
  );
}

