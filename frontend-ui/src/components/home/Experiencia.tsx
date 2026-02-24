"use client";

import React from 'react';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import { FaLaptopCode, FaRobot, FaBuilding, FaUserTie } from 'react-icons/fa';
import '@/styles/home-elite.scss';

type CapabilityCard = {
  icon: IconType;
  label: string;
  cardClass: string;
  iconWrapClass: string;
  iconClass: string;
};

const capabilityCards: CapabilityCard[] = [
  {
    icon: FaLaptopCode,
    label: 'Ingenieria Full Stack',
    cardClass:
      'border-cyan-400/35 bg-gradient-to-br from-cyan-500/12 via-slate-900/85 to-slate-950 shadow-[0_12px_30px_rgba(8,145,178,0.22)] hover:shadow-[0_18px_42px_rgba(8,145,178,0.35)]',
    iconWrapClass: 'bg-cyan-500/20 border border-cyan-300/35',
    iconClass: 'text-cyan-300',
  },
  {
    icon: FaRobot,
    label: 'Automatizacion e IA',
    cardClass:
      'border-emerald-400/35 bg-gradient-to-br from-emerald-500/12 via-slate-900/85 to-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.22)] hover:shadow-[0_18px_42px_rgba(16,185,129,0.35)]',
    iconWrapClass: 'bg-emerald-500/20 border border-emerald-300/35',
    iconClass: 'text-emerald-300',
  },
  {
    icon: FaBuilding,
    label: 'Sistemas Empresariales',
    cardClass:
      'border-amber-400/35 bg-gradient-to-br from-amber-500/12 via-slate-900/85 to-slate-950 shadow-[0_12px_30px_rgba(245,158,11,0.2)] hover:shadow-[0_18px_42px_rgba(245,158,11,0.32)]',
    iconWrapClass: 'bg-amber-500/20 border border-amber-300/35',
    iconClass: 'text-amber-300',
  },
  {
    icon: FaUserTie,
    label: 'Consultoria Tecnologica',
    cardClass:
      'border-blue-400/35 bg-gradient-to-br from-blue-500/12 via-slate-900/85 to-slate-950 shadow-[0_12px_30px_rgba(59,130,246,0.2)] hover:shadow-[0_18px_42px_rgba(59,130,246,0.32)]',
    iconWrapClass: 'bg-blue-500/20 border border-blue-300/35',
    iconClass: 'text-blue-300',
  },
];

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-cyan-400/25">
              <span className="text-cyan-300 mono text-sm">01.</span>
              <span className="text-sm text-slate-300">Sobre mi y la empresa</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold leading-tight font-display" id="about-title">
              Digital Systems FJ con arquitectura con proposito.
              <br />
              <span className="gradient-text">Tecnologia que impulsa negocios reales.</span>
            </h2>

            <p className="text-lg text-slate-300 leading-relaxed font-display">
              Soy Favio Jimenez, ingeniero full stack y consultor tecnologico. Lidero Digital Systems FJ para construir soluciones web y empresariales que mejoran la operacion, el control y la toma de decisiones.
            </p>

            <p className="text-base text-slate-400 leading-relaxed font-display">
              Combinamos desarrollo, automatizacion e integracion de sistemas para convertir objetivos comerciales en plataformas escalables, estables y medibles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {capabilityCards.map((card) => {
                const CardIcon = card.icon;
                return (
                  <div
                    key={card.label}
                    className={`group relative overflow-hidden flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${card.cardClass}`}
                  >
                    <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/8 via-transparent to-white/8"></span>
                    <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center ${card.iconWrapClass}`}>
                      <CardIcon className={`w-5 h-5 ${card.iconClass}`} />
                    </div>
                    <span className="relative text-sm font-semibold text-white font-display">{card.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="glass-card rounded-3xl p-8 border border-cyan-400/20 shadow-[0_24px_50px_rgba(14,165,233,0.12)]">
              <div className="bg-[#050811] rounded-2xl p-6 text-sm font-mono border border-cyan-400/15">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-slate-300 text-xs overflow-x-auto">
                  <span className="text-cyan-300">const</span> <span className="text-amber-200">digitalSystemsFJ</span> = {'{'}
                  <br />
                  &nbsp;&nbsp;<span className="text-sky-300">founder</span>: <span className="text-emerald-300">&quot;Favio Jimenez&quot;</span>,
                  <br />
                  &nbsp;&nbsp;<span className="text-sky-300">profile</span>: <span className="text-emerald-300">&quot;Full Stack + Consultoria&quot;</span>,
                  <br />
                  &nbsp;&nbsp;<span className="text-sky-300">focus</span>: [<span className="text-emerald-300">&quot;Web&quot;</span>, <span className="text-emerald-300">&quot;Automatizacion&quot;</span>, <span className="text-emerald-300">&quot;Escalamiento&quot;</span>]
                  <br />
                  {'}'};
                  <br />
                  <br />
                  <span className="text-cyan-300">async function</span> <span className="text-amber-200">deliverBusinessValue</span>() {'{'}
                  <br />
                  &nbsp;&nbsp;<span className="text-cyan-300">const</span> <span className="text-sky-300">diagnosis</span> = <span className="text-emerald-300">&quot;completed&quot;</span>;
                  <br />
                  &nbsp;&nbsp;<span className="text-cyan-300">const</span> <span className="text-sky-300">architecture</span> = <span className="text-emerald-300">&quot;validated&quot;</span>;
                  <br />
                  &nbsp;&nbsp;<span className="text-cyan-300">const</span> <span className="text-sky-300">deployment</span> = <span className="text-emerald-300">&quot;production-ready&quot;</span>;
                  <br />
                  &nbsp;&nbsp;<span className="text-cyan-300">return</span> {'{'} <span className="text-sky-300">status</span>: <span className="text-emerald-300">&quot;EXITO_TOTAL&quot;</span>, <span className="text-sky-300">impact</span>: <span className="text-emerald-300">&quot;medible&quot;</span> {'}'};
                  <br />
                  {'}'}
                </div>
                <div className="mt-4 rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-3 text-[11px]">
                  <span className="text-emerald-300">$ resultado =&gt; EXITO_TOTAL | Plataforma operativa y cliente satisfecho</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
