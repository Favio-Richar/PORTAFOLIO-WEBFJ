"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaCode, FaPaintBrush, FaBullhorn, FaRocket, FaMobileAlt, FaServer, FaUserShield } from "react-icons/fa";
import EliteLogo3D from "./EliteLogo3D";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [mobileMenuOpen]);

  // Hide Navbar on Auth and Admin pages (Admin has its own Sidebar)
  if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/sobre-mi", label: "Sobre Mí" },
    {
      href: "/proyectos",
      label: "Proyectos",
      hasDropdown: true,
      dropdownData: [
        { title: "Desarrollo Web", desc: "Plataformas corporativas y SaaS.", icon: <FaCode /> },
        { title: "Apps Móviles", desc: "iOS y Android nativo.", icon: <FaMobileAlt /> },
        { title: "E-Commerce", desc: "Tiendas online de alto rendimiento.", icon: <FaRocket /> },
      ]
    },
    {
      href: "/servicios",
      label: "Servicios",
      hasDropdown: true,
      dropdownData: [
        { title: "Consultoría TI", desc: "Auditoría y arquitectura de software.", icon: <FaServer /> },
        { title: "Diseño UX/UI", desc: "Interfaces modernas y funcionales.", icon: <FaPaintBrush /> },
        { title: "Marketing Digital", desc: "SEO, SEM y campañas de impacto.", icon: <FaBullhorn /> },
      ]
    },
    { href: "/asesoria", label: "Asesoría" },
    { href: "/blog", label: "Blog" },
    { href: "/clientes", label: "Clientes" },
    { href: "/contacto", label: "Contacto" },
  ];

  return (
    <>
      <nav
        ref={navRef}
        className="sticky top-0 z-[100] w-full bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all duration-300"
      >
        {/* REFINED TOP HIGHLIGHT */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

        <div className="mx-auto max-w-[1400px] px-4 h-24 flex items-center justify-between relative gap-4">

          {/* LOGO AREA */}
          <Link href="/" className="flex-shrink-0 flex items-center group overflow-visible">
            <EliteLogo3D />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center h-full">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative h-full flex items-center px-4 group/nav"
                onMouseEnter={() => setHoveredNav(link.label)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <Link
                  href={link.href}
                  className="text-slate-400 font-medium text-[11px] uppercase tracking-[0.2em] transition-all duration-300 group-hover/nav:text-white flex items-center gap-2 py-8"
                >
                  {link.label}
                  {link.hasDropdown && (
                    <FaChevronDown className={`text-[7px] transition-transform duration-300 ${hoveredNav === link.label ? "rotate-180 text-indigo-400" : "text-slate-500"}`} />
                  )}
                </Link>

                {/* SLOW REFINED HIGHLIGHT INDICATOR */}
                <motion.div
                  initial={false}
                  animate={{
                    scaleX: hoveredNav === link.label ? 1 : 0,
                    opacity: hoveredNav === link.label ? 1 : 0
                  }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-indigo-500 rounded-full"
                  transition={{ duration: 0.3 }}
                />

                {/* MEGA MENU DROPDOWN */}
                <AnimatePresence>
                  {link.hasDropdown && hoveredNav === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] bg-slate-950/95 backdrop-blur-2xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden p-0"
                    >
                      {/* CYBER DECO LINE */}
                      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-600 to-violet-600" />

                      <div className="p-8 grid grid-cols-3 gap-6">
                        {link.dropdownData?.map((item, idx) => (
                          <Link
                            key={idx}
                            href={link.href}
                            className="group/item flex flex-col gap-3 p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                          >
                            <div className="w-10 h-10 bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400 text-lg rounded-lg group-hover/item:scale-110 group-hover/item:border-indigo-500/50 group-hover/item:bg-indigo-500/10 transition-all">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-[10px] tracking-wider group-hover/item:text-indigo-400 transition-colors uppercase">
                                {item.title}
                              </h4>
                              <p className="text-slate-500 text-[10px] leading-relaxed mt-1 group-hover/item:text-slate-300 transition-colors">
                                {item.desc}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* BOTTOM CTA */}
                      <div className="bg-white/5 p-4 text-center border-t border-white/5">
                        <Link
                          href={link.href}
                          className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 group/all"
                        >
                          Ver todo en {link.label} <span className="group-hover/all:translate-x-1 transition-transform">→</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA BUTTONS & MOBILE TOGGLE */}
          <div className="flex items-center gap-4">
            {/* ADMIN ACCESS */}
            <Link
              href="/admin"
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 group relative"
              title="Panel Administrativo"
            >
              <FaUserShield className="text-sm" />
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-white text-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                ADMIN
              </span>
            </Link>

            <Link
              href="/contacto"
              className="hidden lg:flex relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:scale-105 transition-all duration-300 items-center justify-center shadow-lg shadow-indigo-500/20"
            >
              <span className="relative z-10 flex items-center gap-3">
                Iniciar Proyecto <FaRocket className="text-xs group-hover:animate-pulse" />
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 group border border-white/10 bg-white/5 rounded-full active:scale-95 transition-all"
            >
              <span className={`w-5 h-[2px] bg-white transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2 bg-indigo-500" : ""}`} />
              <span className={`w-5 h-[2px] bg-white transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`w-5 h-[2px] bg-white transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2 bg-indigo-500" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
          >
            {/* MOBILE HEADER */}
            <div className="h-24 flex items-center justify-between px-6 border-b border-white/10">
              <div className="flex flex-col">
                <span className="text-white font-black tracking-widest text-lg uppercase">Menu</span>
                <span className="text-indigo-500 font-bold tracking-[0.3em] text-[10px] uppercase">Navegación</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:text-indigo-400 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* MOBILE LINKS */}
            <div className="flex-1 overflow-y-auto py-10 px-8 flex flex-col gap-2">
              {navLinks.map((link, idx) => (
                <div key={idx} className="border-b border-white/5 pb-2">
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-black text-slate-200 hover:text-white transition-all uppercase tracking-tighter py-4 block flex items-center justify-between group"
                  >
                    {link.label}
                    <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">●</span>
                  </Link>
                  {link.hasDropdown && (
                    <div className="grid grid-cols-1 gap-3 pl-4 mb-4">
                      {link.dropdownData?.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-indigo-400 py-1 flex items-center gap-3"
                        >
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-8">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-indigo-400 font-bold uppercase tracking-widest"
                >
                  <FaUserShield /> Acceso Admin
                </Link>
              </div>
            </div>

            {/* MOBILE FOOTER CTA */}
            <div className="p-8 border-t border-white/10 bg-slate-950">
              <Link
                href="/contacto"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20"
              >
                Iniciar Proyecto Ahora
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
