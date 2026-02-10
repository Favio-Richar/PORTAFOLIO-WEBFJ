"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FaRocket,
  FaCheck,
  FaCode,
  FaLightbulb,
  FaEye,
  FaChevronDown,
  FaShieldAlt,
  FaArrowRight,
  FaLaptopCode,
  FaGlobe,
  FaChartLine,
  FaHandsHelping,
  FaLock,
  FaGem,
  FaHandshake,
  FaStar,
  FaMedal,
  FaEnvelope,
  FaPhone,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaBullseye,
  FaMobileAlt,
  FaTools
} from 'react-icons/fa';
import FloatingChat from '@/components/layout/FloatingChat';
import '@/styles/about-elite.scss';

export default function SobreNosotrosPage() {
  const fadeInUp: any = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const scaleIn: any = {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="about-elite-container w-full overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="blob w-96 h-96 bg-blue-600/20 top-0 left-0" style={{ animationDelay: '0s' }}></div>
        <div className="blob w-80 h-80 bg-indigo-600/20 bottom-0 right-0" style={{ animationDelay: '2s' }}></div>
        <div className="blob w-64 h-64 bg-purple-500/20 top-1/2 left-1/2" style={{ animationDelay: '4s' }}></div>
        <div className="grid-overlay opacity-20"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <span id="company-badge" className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-medium mb-6 backdrop-blur-sm">
              <FaRocket className="inline mr-2 animate-pulse" /> TechSolutions Elite
            </span>
          </motion.div>
          <motion.h1 id="hero-title" className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" {...fadeInUp} transition={{ delay: 0.1, duration: 0.8 }}>
            Sobre <span className="gradient-text">Nosotros</span>
          </motion.h1>
          <motion.p id="hero-subtitle" className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed" {...fadeInUp} transition={{ delay: 0.2, duration: 0.8 }}>
            Somos expertos en transformación digital. Creamos sistemas, páginas web y soluciones tecnológicas que impulsan el éxito de tu negocio con estándares de alta gama.
          </motion.p>
          <motion.div className="flex flex-wrap gap-4 justify-center" {...fadeInUp} transition={{ delay: 0.3, duration: 0.8 }}>
            <Link href="#servicios" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1">
              Nuestros Servicios
            </Link>
            <Link href="#contacto" id="cta-button" className="px-8 py-4 bg-white/5 backdrop-blur border border-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
              Contáctanos
            </Link>
          </motion.div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <FaChevronDown className="w-6 h-6 text-blue-400 opacity-50" />
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="relative py-20 border-y border-white/5 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: "8+", label: "Años de Experiencia" },
              { val: "150+", label: "Proyectos Completados" },
              { val: "98%", label: "Clientes Satisfechos" },
              { val: "24/7", label: "Soporte Técnico" }
            ].map((stat, i) => (
              <motion.div key={i} className="text-center p-6 rounded-2xl bg-slate-800/20 backdrop-blur border border-white/5 card-hover" {...scaleIn} transition={{ delay: i * 0.1 }}>
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.val}</div>
                <div className="text-slate-400 text-sm md:text-base font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. About Content (¿Quiénes Somos?) */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <span className="text-blue-400 font-semibold text-sm tracking-widest uppercase mb-4 block">¿Quiénes Somos?</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                Ingeniería Informática al Servicio de tu <span className="gradient-text">Negocio</span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6 font-medium">
                Fundada por profesionales apasionados por la tecnología, nuestra empresa nació con el objetivo de brindar soluciones tecnológicas integrales y de alta calidad. Como Ingenieros Informáticos, lideramos un equipo comprometido con la excelencia y la innovación constante.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                Nos especializamos en el desarrollo de sistemas a medida, creación de páginas web profesionales, soporte técnico avanzado y mantenimiento preventivo. Cada proyecto es una oportunidad para superar expectativas y construir relaciones duraderas con nuestros clientes.
              </p>
              <div className="space-y-4">
                {[
                  { icon: FaCheck, text: "Soluciones personalizadas para cada cliente" },
                  { icon: FaLaptopCode, text: "Tecnologías modernas y escalables" },
                  { icon: FaShieldAlt, text: "Compromiso con la calidad y los plazos" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                      <item.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-slate-300 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div className="relative" {...scaleIn}>
              <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="bg-slate-950 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 border-b border-white/5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-4 text-slate-500 text-xs font-mono">desarrollo.js</span>
                  </div>
                  <div className="p-6 font-mono text-[13px] leading-relaxed">
                    <div className="text-slate-600 italic">// Transformando ideas en código Elite</div>
                    <div className="mt-2">
                      <span className="text-purple-400">const</span>
                      <span className="text-blue-400"> solucion</span>
                      <span className="text-white"> = </span>
                      <span className="text-yellow-400">{"{"}</span>
                    </div>
                    <div className="ml-4">
                      <span className="text-teal-400">innovacion</span>
                      <span className="text-white">: </span>
                      <span className="text-orange-300">true</span>
                      <span className="text-white">,</span>
                    </div>
                    <div className="ml-4">
                      <span className="text-teal-400">calidad</span>
                      <span className="text-white">: </span>
                      <span className="text-green-300">"Excelente"</span>
                      <span className="text-white">,</span>
                    </div>
                    <div className="ml-4">
                      <span className="text-teal-400">soporte</span>
                      <span className="text-white">: </span>
                      <span className="text-blue-300">"24/7"</span>
                    </div>
                    <div className="text-yellow-400">{"}"}</div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl border border-white/20">
                  <FaCode className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-3xl transform rotate-3 -z-10 blur-sm"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Mission & Vision */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span className="text-blue-400 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>Nuestro Propósito</motion.span>
            <motion.h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4" {...fadeInUp} transition={{ delay: 0.1 }}>
              Misión y <span className="gradient-text">Visión</span>
            </motion.h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div className="group relative p-8 rounded-3xl bg-slate-800/40 border border-white/5 card-hover overflow-hidden" {...fadeInUp} transition={{ delay: 0.2 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 service-icon border border-blue-500/20">
                  <FaBullseye className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-4">Nuestra Misión</h3>
                <p id="mission-text" className="text-slate-300 leading-relaxed">
                  Proporcionar soluciones tecnológicas innovadoras y de alta calidad que impulsen el crecimiento y la eficiencia de nuestros clientes. Nos comprometemos a entregar proyectos que superen las expectativas, utilizando las mejores prácticas de la industria y manteniendo una comunicación transparente en todo momento.
                </p>
              </div>
            </motion.div>
            <motion.div className="group relative p-8 rounded-3xl bg-slate-800/40 border border-white/5 card-hover overflow-hidden" {...fadeInUp} transition={{ delay: 0.3 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 service-icon border border-indigo-500/20">
                  <FaEye className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-4">Nuestra Visión</h3>
                <p id="vision-text" className="text-slate-300 leading-relaxed">
                  Ser reconocidos como líderes en el desarrollo de soluciones tecnológicas personalizadas, destacando por nuestra capacidad de innovación, excelencia técnica y compromiso con el éxito de cada cliente. Aspiramos a transformar digitalmente a empresas de todos los tamaños.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Services Section (Lo Que Hacemos) */}
      <section id="servicios" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span className="text-blue-400 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>Lo Que Hacemos</motion.span>
            <motion.h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6" {...fadeInUp} transition={{ delay: 0.1 }}>
              Nuestros <span className="gradient-text">Servicios</span>
            </motion.h2>
            <motion.p className="text-slate-400 max-w-2xl mx-auto" {...fadeInUp} transition={{ delay: 0.2 }}>
              Ofrecemos un portafolio completo de servicios tecnológicos para cubrir todas las necesidades de tu negocio.
            </motion.p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FaLaptopCode, title: "Desarrollo de Sistemas", desc: "Creamos sistemas de gestión, ERP, CRM y aplicaciones empresariales a medida según tus necesidades específicas.", color: "from-blue-500 to-blue-600" },
              { icon: FaGlobe, title: "Diseño Web", desc: "Páginas web profesionales, responsivas y optimizadas para SEO que convierten visitantes en clientes.", color: "from-indigo-500 to-indigo-600" },
              { icon: FaMobileAlt, title: "Apps Móviles", desc: "Desarrollo de aplicaciones móviles nativas e híbridas para iOS y Android con experiencia de usuario excepcional.", color: "from-purple-500 to-purple-600" },
              { icon: FaHandsHelping, title: "Soporte Técnico", desc: "Asistencia técnica 24/7, resolución de problemas y optimización de sistemas existentes.", color: "from-emerald-500 to-emerald-600" },
              { icon: FaTools, title: "Mantenimiento", desc: "Mantenimiento preventivo y correctivo de sistemas, servidores y equipos informáticos.", color: "from-amber-500 to-amber-600" },
              { icon: FaLock, title: "Ciberseguridad", desc: "Protección de datos, auditorías de seguridad e implementación de protocolos para mantener tu información segura.", color: "from-rose-500 to-rose-600" }
            ].map((s, i) => (
              <motion.div key={i} className="group p-8 rounded-3xl bg-slate-800/40 border border-white/5 card-hover relative overflow-hidden" {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6 service-icon shadow-lg relative z-10`}>
                  <s.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-4 relative z-10">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed relative z-10">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Values Section (Lo Que Nos Define) */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span className="text-blue-400 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>Lo Que Nos Define</motion.span>
            <motion.h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6" {...fadeInUp} transition={{ delay: 0.1 }}>Nuestros <span className="gradient-text">Valores</span></motion.h2>
          </div>
          <div className="values-grid">
            {[
              { icon: FaLightbulb, title: "Innovación", desc: "Siempre buscando nuevas soluciones y tecnologías", emoji: "💡" },
              { icon: FaRocket, title: "Compromiso", desc: "Dedicación total a cada proyecto y cliente", emoji: "🎯" },
              { icon: FaGem, title: "Excelencia", desc: "Estándares de calidad en cada línea de código", emoji: "⭐" },
              { icon: FaHandshake, title: "Confianza", desc: "Relaciones transparentes y duraderas", emoji: "🤝" }
            ].map((v, i) => (
              <motion.div key={i} className="value-item" {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <div className="value-icon">
                  <span className="text-4xl">{v.emoji}</span>
                </div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Clients Section (Empresas) */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span className="text-blue-400 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>Confianza Ganada</motion.span>
            <motion.h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6" {...fadeInUp} transition={{ delay: 0.1 }}>Empresas que nos <span className="gradient-text">Confían</span></motion.h2>
          </div>
          <div className="companies-grid">
            {[
              { name: "TECH", type: "StartUp" }, { name: "NEXUS", type: "Empresa" },
              { name: "DIGITAL", type: "Agencia" }, { name: "INNOVATE", type: "Solutions" },
              { name: "SMART", type: "Business" }, { name: "VISION", type: "Group" },
              { name: "FUTURE", type: "Systems" }, { name: "APEX", type: "Tech" }
            ].map((c, i) => (
              <motion.div key={i} className="company-card" {...scaleIn} transition={{ delay: i * 0.05 }}>
                <span className="company-name">{c.name}</span>
                <span className="company-type font-mono">{c.type}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span className="text-blue-400 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>Lo Que Dicen</motion.span>
            <motion.h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6" {...fadeInUp} transition={{ delay: 0.1 }}>Testimonios de <span className="gradient-text">Clientes</span></motion.h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Juan Martínez", role: "Director, Tech Solutions", text: "Excelente equipo de trabajo. Desarrollaron nuestro sistema ERP en tiempo récord. Recomendado al 100%, muy profesionales.", initials: "JM" },
              { name: "María Campos", role: "CEO, Digital Marketing", text: "Nuestra página web mejoró significativamente después de su rediseño. Aumentamos conversiones en un 45%. ¡Increíble trabajo!", initials: "MC" },
              { name: "Carlos Rodríguez", role: "Gerente, E-commerce Plus", text: "El soporte técnico disponible 24/7 nos ha salvado en varias ocasiones. Equipo muy responsable y atento siempre.", initials: "CR" },
              { name: "Andrea Pérez", role: "Fundadora, StartUp Fintech", text: "Desarrollaron nuestra app móvil con exactitud. El resultado fue mucho mejor de lo esperado. ¡Muy satisfechos!", initials: "AP" },
              { name: "Roberto Silva", role: "CTO, Banking Solutions", text: "Excelente asesoría en ciberseguridad. Nos ayudaron a fortalecer nuestros sistemas. Totalmente recomendados.", initials: "RS" },
              { name: "Laura Pinto", role: "Directora IT, Retail Corp", text: "Mantenimiento perfecto de nuestros servidores. Cero tiempos de inactividad. El mejor equipo de soporte que tenemos.", initials: "LP" }
            ].map((t, i) => (
              <motion.div key={i} className="p-8 rounded-3xl bg-slate-800/60 border border-white/5 card-hover" {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <div className="flex gap-1 text-yellow-500 mb-4">
                  {[...Array(5)].map((_, j) => <FaStar key={j} size={14} />)}
                </div>
                <p className="text-slate-300 mb-6 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{t.name}</h4>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Certifications & Stack Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span className="text-blue-400 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>Expertise</motion.span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6" {...fadeInUp}>Certificaciones y <span className="gradient-text">Tecnologías</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-16">
            {/* Certifications */}
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-8">Certificaciones</h3>
              <div className="certifications-list">
                {[
                  { title: "ISO 27001", org: "Seguridad de la Información" },
                  { title: "AWS Solutions Architect", org: "Amazon Web Services" },
                  { title: "Google Cloud Professional", org: "Certificación en Nube" },
                  { title: "Microsoft Certified Developer", org: "Programación .NET" }
                ].map((c, i) => (
                  <motion.div key={i} className="cert-item" {...fadeInUp} transition={{ delay: i * 0.1 }}>
                    <div className="cert-icon"><FaMedal /></div>
                    <div className="cert-info">
                      <h4>{c.title}</h4>
                      <p>{c.org}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Tech Stack */}
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-8">Stack Tecnológico</h3>
              <div className="skill-bars">
                {[
                  { label: "Frontend", tags: "React, Vue, Angular", p: 95 },
                  { label: "Backend", tags: "Node.js, Python, Java", p: 90 },
                  { label: "Bases de Datos", tags: "PostgreSQL, MongoDB, MySQL", p: 92 },
                  { label: "DevOps & Cloud", tags: "Docker, AWS, Azure", p: 88 },
                  { label: "Ciberseguridad", tags: "OWASP, Pentesting", p: 85 }
                ].map((s, i) => (
                  <div key={i} className="skill-item">
                    <div className="skill-header">
                      <span>{s.label}</span>
                      <span className="skill-tags">{s.tags}</span>
                    </div>
                    <div className="bar-bg">
                      <motion.div
                        className="bar-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.p}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Final CTA Section (Contacto) */}
      <section id="contacto" className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="blob w-64 h-64 bg-blue-500/20 -top-20 -left-20"></div>
        <div className="blob w-64 h-64 bg-indigo-500/20 -bottom-20 -right-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6" {...fadeInUp}>¿Listo para <span className="gradient-text">Comenzar</span>?</motion.h2>
          <motion.p className="text-slate-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed" {...fadeInUp} transition={{ delay: 0.1 }}>
            Transformemos juntos tu visión en realidad. Contáctanos hoy y descubre cómo podemos ayudarte a alcanzar tus objetivos tecnológicos.
          </motion.p>
          <motion.div className="flex flex-wrap gap-6 justify-center" {...fadeInUp} transition={{ delay: 0.2 }}>
            <Link href="mailto:contacto@techsolutions.com" className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1">
              <FaEnvelope /> Enviar Email
            </Link>
            <Link href="tel:+1234567890" className="group flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300">
              <FaPhone /> Llamar Ahora
            </Link>
          </motion.div>
          {/* Social Links from HTML */}
          <motion.div className="flex justify-center gap-4 mt-12" {...fadeInUp} transition={{ delay: 0.3 }}>
            {[
              { icon: FaTwitter, href: "#" },
              { icon: FaLinkedin, href: "#" },
              { icon: FaGithub, href: "#" }
            ].map((social, i) => (
              <Link key={i} href={social.href} className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500/50 transition-all duration-300">
                <social.icon size={20} />
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 11. Footer Section */}
      <footer className="py-12 px-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <FaCode className="text-white" />
            </div>
            <span id="footer-company" className="font-display font-bold text-xl text-white tracking-tight">TechSolutions Elite</span>
          </div>
          <p className="text-slate-500 text-sm font-medium text-center md:text-right">
            © 2024 Todos los derechos reservados. Desarrollado con 💜 por un Ingeniero Informático.
          </p>
        </div>
      </footer>

      {/* 12. Floating Chat Widget (Componente Separado) */}
      <FloatingChat />
    </div>
  );
}
