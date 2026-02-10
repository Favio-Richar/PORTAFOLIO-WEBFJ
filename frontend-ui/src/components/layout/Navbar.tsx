"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { FaChevronDown, FaCode, FaPaintBrush, FaBullhorn, FaRocket, FaMobileAlt, FaServer, FaUserShield } from "react-icons/fa";

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
    { href: "/sobre-mi", label: "Sobre mí" },
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
    { href: "/blog", label: "Blog" },
    { href: "/clientes", label: "Clientes" },
    { href: "/contacto", label: "Contacto" },
  ];

  return (
    <>
      <nav
        ref={navRef}
        className="sticky top-0 z-[100] w-full bg-[#050505] border-b border-white/10 shadow-xl"
      >
        {/* SOLID TOP BORDER HIGHLIGHT */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600"></div>

        <div className="mx-auto max-w-[1400px] px-6 h-24 flex items-center justify-between relative">

          {/* LOGO AREA */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative w-12 h-12 bg-white flex items-center justify-center rounded-lg overflow-hidden border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-500">
              <img src="/img/logo.nextlevelsoftwarepro.jpg" alt="Logo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-black tracking-tighter text-lg leading-none group-hover:text-indigo-400 transition-colors drop-shadow-sm">NEXT LEVEL</h1>
              <span className="text-slate-400 font-bold tracking-[0.3em] text-[10px] leading-none group-hover:text-white transition-colors uppercase">Software Pro</span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center h-full">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative h-full flex items-center px-5 group/nav"
                onMouseEnter={() => setHoveredNav(link.label)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <Link
                  href={link.href}
                  className="text-slate-300 font-bold text-xs uppercase tracking-[0.25em] transition-all duration-300 group-hover/nav:text-white group-hover/nav:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] flex items-center gap-2 py-8"
                >
                  {link.label}
                  {link.hasDropdown && <FaChevronDown className={`text-[8px] transition-transform duration-300 ${hoveredNav === link.label ? "rotate-180 text-indigo-500" : "text-slate-500"}`} />}
                </Link>

                {/* SOLID HIGHLIGHT BAR */}
                <div className={`absolute bottom-0 left-0 w-full h-[3px] bg-indigo-500 transition-transform duration-300 origin-center ${hoveredNav === link.label ? "scale-x-100" : "scale-x-0"}`} />


                {/* MEGA MENU DROPDOWN (SOLID OPAQUE) */}
                <AnimatePresence>
                  {link.hasDropdown && hoveredNav === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden p-0 grid grid-cols-1"
                    >
                      {/* CYBER DECO LINE */}
                      <div className="h-1 w-full bg-gradient-to-r from-indigo-600 to-violet-600" />

                      <div className="p-8 grid grid-cols-3 gap-6">
                        {link.dropdownData?.map((item, idx) => (
                          <Link key={idx} href={link.href} className="group/item flex flex-col gap-3 p-4 rounded-md hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                            <div className="w-10 h-10 bg-[#111] border border-white/10 flex items-center justify-center text-indigo-400 text-lg rounded group-hover/item:scale-110 group-hover/item:border-indigo-500/50 transition-all">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-sm tracking-wide group-hover/item:text-indigo-400 transition-colors uppercase">{item.title}</h4>

                              <p className="text-slate-400 text-[10px] leading-relaxed mt-1 group-hover/item:text-slate-200 transition-colors">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* BOTTOM CTA */}
                      <div className="bg-[#0f0f0f] p-4 text-center border-t border-white/5">
                        <Link href={link.href} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 group/all">
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
            {/* ADMIN / MEMBER ACCESS BUTTON */}
            <Link
              href="/admin"
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-[#111] text-slate-300 hover:text-white hover:border-indigo-500 hover:bg-indigo-500/10 transition-all duration-300 group relative"
              title="Acceso Miembros / Admin"
            >

              <FaUserShield className="text-sm" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-white text-black px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                ADMIN
              </span>
            </Link>

            <Link
              href="/contacto"
              className="hidden lg:flex relative overflow-hidden group bg-transparent border border-white/40 text-white px-8 py-2.5 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500 items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(99,102,241,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center gap-3">
                Iniciar Proyecto <FaRocket className="text-xs text-indigo-400 group-hover:text-black transition-colors" />
              </span>
            </Link>


            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 group border border-white/10 bg-[#111] active:scale-95 transition-all"
            >
              <span className={`w-5 h-[2px] bg-white transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2 bg-indigo-500" : ""}`} />
              <span className={`w-5 h-[2px] bg-white transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`w-5 h-[2px] bg-white transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2 bg-indigo-500" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU FULLSCREEN SOLID OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: "circOut" }}
            className="fixed inset-0 z-[200] bg-[#050505] flex flex-col"
          >
            {/* MOBILE HEADER */}
            <div className="h-24 flex items-center justify-between px-6 border-b border-white/10 bg-[#050505]">
              <div className="flex flex-col">
                <span className="text-white font-black tracking-tighter text-lg leading-none">MENU</span>
                <span className="text-indigo-500 font-bold tracking-[0.3em] text-[10px]">NAVEGACIÓN</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-12 h-12 flex items-center justify-center border border-white/10 bg-[#111] text-white hover:text-indigo-400 transition-colors"
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
                    className="text-2xl font-black text-slate-200 hover:text-white hover:pl-4 transition-all uppercase tracking-tighter py-4 block group"
                  >
                    {link.label}
                    <span className="text-indigo-500 opacity-0 group-hover:opacity-100 ml-2 text-xl transition-opacity">●</span>
                  </Link>
                  {link.hasDropdown && (
                    <div className="grid grid-cols-1 gap-2 pl-4 mb-4">
                      {link.dropdownData?.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-indigo-400 py-1 flex items-center gap-2"
                        >
                          <span className="w-1 h-1 bg-white/20 rounded-full" /> {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* MOBILE ADMIN LINK */}
              <div className="border-b border-white/5 pb-2 mt-4">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold text-indigo-400 hover:text-indigo-300 hover:pl-4 transition-all uppercase tracking-widest py-4 flex items-center gap-2"
                >
                  <FaUserShield /> Acceso Admin
                </Link>
              </div>

            </div>

            {/* MOBILE FOOTER CTA */}
            <div className="p-8 border-t border-white/10 bg-[#0a0a0a]">
              <Link
                href="/contacto"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block bg-white text-black text-center py-5 font-black uppercase tracking-[0.25em] hover:bg-indigo-500 hover:text-white transition-colors"
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
