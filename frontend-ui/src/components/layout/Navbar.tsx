"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (logoRef.current) {
      const scanline = logoRef.current.querySelector(".logo-scanline");
      const glow = logoRef.current.querySelector(".logo-glow");

      gsap.to(scanline, {
        x: "300%",
        duration: 1.5,
        repeat: -1,
        repeatDelay: 2,
        ease: "power4.inOut",
      });

      gsap.to(logoRef.current, {
        y: -4,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(logoRef.current, {
        filter: "drop-shadow(0 0 15px var(--primary)) brightness(1.1)",
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }
  }, []);

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/sobre-mi", label: "Sobre mí" },
    { href: "/proyectos", label: "Proyectos" },
    { href: "/servicios", label: "Servicios" },
    { href: "/blog", label: "Blog" },
    { href: "/clientes", label: "Clientes" },
    { href: "/contacto", label: "Contacto" },
  ];

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-[100] w-full bg-black/80 backdrop-blur-2xl border-b border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
    >
      {/* SCANLINE EFFECT */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-scan"></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-50"></div>

      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between relative font-black">

        {/* LOGO ELITE */}
        <Link
          ref={logoRef}
          href="/"
          className="relative z-10 flex items-center group overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-1.5 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          <img
            src="/img/logo.nextlevelsoftwarepro.jpg"
            alt="Favio Jiménez Logo"
            className="h-11 w-auto object-contain transition-all duration-700 group-hover:brightness-125"
          />
          <div className="logo-scanline absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full pointer-events-none skew-x-12 opacity-30"></div>
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </Link>

        {/* BOTÓN MÓVIL */}
        <button
          aria-label="Abrir menú"
          className="md:hidden w-12 h-12 flex items-center justify-center rounded-full glass-light border border-white/10 text-white hover:text-cyan-400 transition-all z-10"
          onClick={() => setOpen(!open)}
        >
          {!open ? "☰" : "✕"}
        </button>

        {/* LINKS DESKTOP */}
        <div
          ref={linksRef}
          className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] relative z-10 perspective-1000"
        >
          {links.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} />
          ))}

          <AdminButton />
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-cyan-500/20 bg-black/95 backdrop-blur-3xl overflow-hidden"
          >
            <div className="flex flex-col px-8 py-10 gap-4 font-black text-xs tracking-[0.3em] uppercase">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-cyan-400 transition-all duration-300 px-6 py-4 rounded-3xl hover:bg-white/5 flex items-center justify-between group"
                >
                  <span>{item.label}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-0 group-hover:opacity-100 shadow-[0_0_10px_#06b6d4]"></div>
                </Link>
              ))}
              <div className="mt-8">
                <AdminButton isMobile onClick={() => setOpen(false)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  const itemRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    if (!itemRef.current) return;
    const el = itemRef.current;

    const onMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      gsap.to(el, {
        rotateX: -y * 15,
        rotateY: x * 15,
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out"
      });
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <Link
      ref={itemRef}
      href={href}
      className="nav-fireball group relative px-5 py-2.5 transition-all duration-300 rounded-full flex items-center justify-center overflow-visible"
    >
      <div className="nav-fireball-bg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 text-gray-400 group-hover:text-white transition-colors duration-300">
        {label}
      </span>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
    </Link>
  );
}

function AdminButton({ isMobile, onClick }: { isMobile?: boolean; onClick?: () => void }) {
  const btnRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    if (!btnRef.current || isMobile) return;
    const el = btnRef.current;

    const onMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      gsap.to(el, {
        rotateX: -y * 25,
        rotateY: x * 25,
        z: 20,
        scale: 1.1,
        duration: 0.2,
      });
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        z: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [isMobile]);

  return (
    <Link
      ref={btnRef}
      href="/admin"
      onClick={onClick}
      className={`relative flex items-center justify-center ${isMobile ? "w-full py-5" : "ml-6 px-10 py-3 text-[11px]"} rounded-full border border-cyan-500/40 text-cyan-400 btn-alive btn-shimmer btn-border-glow hover:bg-cyan-500 hover:text-black transition-all duration-500 shadow-[0_0_30px_rgba(6,182,212,0.2)] font-black tracking-widest overflow-visible nav-fireball`}
    >
      <div className="nav-fireball-bg" />
      <span className="relative z-10">{isMobile ? "ADMIN PANEL" : "ADMIN AREA"}</span>
    </Link>
  );
}
