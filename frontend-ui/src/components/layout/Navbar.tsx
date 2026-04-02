"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaCode, FaPaintBrush, FaBullhorn, FaRocket, FaMobileAlt, FaServer, FaUserShield, FaSun, FaMoon } from "react-icons/fa";
import EliteLogo3D from "./EliteLogo3D";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [navVisible, setNavVisible] = useState(true);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Initialize theme from body class (set by layout script)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLight = document.body.classList.contains('light-mode');
      setTheme(isLight ? 'light' : 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (tickingRef.current) return;
      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        const previousScrollY = lastScrollYRef.current;
        const delta = currentScrollY - previousScrollY;

        if (mobileMenuOpen) {
          setNavVisible(true);
          lastScrollYRef.current = currentScrollY;
          tickingRef.current = false;
          return;
        }

        if (currentScrollY <= 24) {
          setNavVisible(true);
          lastScrollYRef.current = currentScrollY;
          tickingRef.current = false;
          return;
        }

        if (delta > 6) {
          setNavVisible(false);
        } else if (delta < -6) {
          setNavVisible(true);
        }

        lastScrollYRef.current = currentScrollY;
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      tickingRef.current = false;
    };
  }, [mobileMenuOpen]);

  // Hide Navbar on Auth, Admin and Tracking pages
  if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin") || pathname?.includes("/seguimiento")) {
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
      <motion.nav
        ref={navRef}
        className="fixed inset-x-0 top-0 z-[100] w-full bg-[var(--background-card)]/80 backdrop-blur-xl border-b border-[var(--border)] shadow-2xl transition-all duration-300"
        initial={false}
        animate={{ y: navVisible ? 0 : -120, opacity: navVisible ? 1 : 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
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
                  className="text-[var(--text-muted)] font-medium text-[11px] uppercase tracking-[0.2em] transition-all duration-300 group-hover/nav:text-[var(--text-title)] flex items-center gap-2 py-8"
                >
                  {link.label}
                  {link.hasDropdown && (
                    <FaChevronDown className={`text-[7px] transition-transform duration-300 ${hoveredNav === link.label ? "rotate-180 text-indigo-400" : "text-[var(--text-muted)]"}`} />
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
                      className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] bg-[var(--background-card)]/95 backdrop-blur-2xl border border-[var(--border-strong)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden p-0"
                    >
                      {/* CYBER DECO LINE */}
                      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-600 to-violet-600" />

                      <div className="p-8 grid grid-cols-3 gap-6">
                        {link.dropdownData?.map((item, idx) => (
                          <Link
                            key={idx}
                            href={link.href}
                            className="group/item flex flex-col gap-3 p-4 rounded-xl hover:bg-[var(--background-soft)] transition-all border border-transparent hover:border-[var(--border)]"
                          >
                            <div className="w-10 h-10 bg-[var(--background-card)] border border-[var(--border)] flex items-center justify-center text-indigo-400 text-lg rounded-lg group-hover/item:scale-110 group-hover/item:border-indigo-500/50 group-hover/item:bg-indigo-500/10 transition-all">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="text-[var(--text-title)] font-bold text-[10px] tracking-wider group-hover/item:text-indigo-400 transition-colors uppercase">
                                {item.title}
                              </h4>
                              <p className="text-[var(--text-muted)] text-[10px] leading-relaxed mt-1 group-hover/item:text-[var(--text-body)] transition-colors">
                                {item.desc}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* BOTTOM CTA */}
                      <div className="bg-[var(--background-soft)] p-4 text-center border-t border-[var(--border)]">
                        <Link
                          href={link.href}
                          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-title)] transition-colors flex items-center justify-center gap-2 group/all"
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
          <div className="flex items-center gap-3">
            {/* THEME TOGGLE */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--background-card)] text-[var(--text-muted)] hover:text-indigo-400 hover:border-indigo-500/50 transition-all duration-300 active:scale-90"
                title={theme === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              >
                {theme === 'dark' ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
              </button>

              <Link
                href="/admin"
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--background-card)] text-[var(--text-muted)] hover:text-[var(--text-title)] hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 group relative"
                title="Panel Administrativo"
              >
                <FaUserShield className="text-sm" />
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-[var(--background-card)] text-[var(--text-title)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-[var(--border)]">
                  ADMIN
                </span>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 group border border-[var(--border)] bg-[var(--background-card)] rounded-full active:scale-95 transition-all"
              >
                <span className={`w-5 h-[2px] bg-[var(--text-title)] transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2 bg-indigo-500" : ""}`} />
                <span className={`w-5 h-[2px] bg-[var(--text-title)] transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`w-5 h-[2px] bg-[var(--text-title)] transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2 bg-indigo-500" : ""}`} />
              </button>
          </div>
        </div>
      </motion.nav>

      <div className="h-24" aria-hidden="true" />

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-[var(--background)] flex flex-col"
          >
            {/* MOBILE HEADER */}
            <div className="h-24 flex items-center justify-between px-6 border-b border-[var(--border)]">
              <div className="flex flex-col">
                <span className="text-[var(--text-title)] font-black tracking-widest text-lg uppercase">Menu</span>
                <span className="text-indigo-500 font-bold tracking-[0.3em] text-[10px] uppercase">Navegación</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background-card)] text-[var(--text-title)] hover:text-indigo-400 transition-colors"
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
                    className="text-2xl font-black text-[var(--text-title)] hover:text-indigo-400 transition-all uppercase tracking-tighter py-4 block flex items-center justify-between group"
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
                          className="text-[var(--text-body)] text-[10px] font-bold uppercase tracking-[0.2em] hover:text-indigo-400 py-1 flex items-center gap-3"
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
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--background-card)] border border-[var(--border)] text-indigo-400 font-bold uppercase tracking-widest"
                >
                  <FaUserShield /> Acceso Admin
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
