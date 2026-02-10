"use client";

import React from 'react';

import FloatingChat from '@/components/layout/FloatingChat';
import Hero from '@/components/home/Hero';
import Experiencia from '@/components/home/Experiencia';
import ServiciosHome from '@/components/home/ServiciosHome';
import ProyectosHome from '@/components/home/ProyectosHome';
import Metodologia from '@/components/home/Metodologia';
import BlogHome from '@/components/home/BlogHome';
import Testimonios from '@/components/home/Testimonios';
import ContactO from '@/components/home/ContactO';
import '@/styles/home-elite.scss';

export default function HomePage() {
  return (
    <div className="w-full min-h-screen grid-bg bg-[#0a0a0f] text-[#f0f0f5] overflow-x-hidden font-display">

      {/* Background Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>



      <main className="relative z-10 w-full">
        {/* 1. Hero Section */}
        <Hero />

        <div className="section-divider w-full" />

        {/* 2. Sobre Mí (Experiencia) */}
        <Experiencia />

        <div className="section-divider w-full" />

        {/* 3. Servicios */}
        <ServiciosHome />

        <div className="section-divider w-full" />

        {/* 4. Proyectos */}
        <ProyectosHome />

        <div className="section-divider w-full" />

        {/* 5. Metodología */}
        <Metodologia />

        <div className="section-divider w-full" />

        {/* 6. Blog */}
        <BlogHome />

        <div className="section-divider w-full" />

        {/* 7. Confianza (Stats + Testimonios/Logos) */}
        <Testimonios />

        <div className="section-divider w-full" />

        {/* 8. Contacto */}
        <ContactO />
      </main>

      <FloatingChat />

    </div>
  );
}
