"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FaQuoteLeft, FaStar, FaCheckCircle } from "react-icons/fa";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import SectionTitle from "@/components/ui/SectionTitle";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

export default function Testimonios() {
  const data = [
    {
      name: "Luis Fernández",
      role: "CEO – Startup Chile",
      stars: 5,
      text: "Favio desarrolló nuestra app completa. Profesional, rápido y confiable. Nos entregó un producto escalable y moderno.",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      logo: "/testimonials/logo1.png",
      date: "Dic 2025",
      location: "Santiago, Chile"
    },
    {
      name: "María González",
      role: "Gerente TI – PYMEs",
      stars: 5,
      text: "Nuestra empresa mejoró sus procesos al 100% gracias a su ERP. Excelente comunicación y compromiso.",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
      logo: "/testimonials/logo2.png",
      date: "Nov 2025",
      location: "Viña del Mar, Chile"
    },
    {
      name: "Carlos Méndez",
      role: "Dueño – Servicios Pyme",
      stars: 4,
      text: "Su sistema de inventario nos permitió digitalizar el negocio. El soporte es de primera.",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
      logo: "/testimonials/logo3.png",
      date: "Oct 2025",
      location: "Concepción, Chile"
    },
    {
      name: "Ana Rojas",
      role: "Fundadora – Agencia Creativa",
      stars: 5,
      text: "Desarrolló nuestro sitio profesional con una UX increíble. Aumento inmediato en conversión.",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
      logo: "/testimonials/logo4.png",
      date: "Sep 2025",
      location: "Remoto"
    },
  ];

  useGSAP(() => {
    gsap.to(".testimonials-swiper", {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".testimonials-swiper",
        start: "top 80%",
      }
    });
  }, []);

  return (
    <section className="py-32 relative max-w-7xl mx-auto px-6 overflow-hidden">
      <SectionTitle
        badge="Confianza de Clientes"
        title="Lo Que Dicen De Mí"
        subtitle="Testimonios reales de impacto y compromiso profesional."
        align="center"
      />

      {/* SWIPER ULTRA PRO */}
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 20,
          depth: 150,
          modifier: 1,
          slideShadows: false,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Autoplay, Pagination]}
        className="w-full pb-20 testimonials-swiper"
      >
        {data.map((t, i) => (
          <SwiperSlide key={i} className="max-w-[500px] py-10 perspective-1000 testimonial-slide">
            <TestimonialCard t={t} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
function TestimonialCard({ t }: { t: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="glass-card-pro p-10 relative overflow-hidden group cursor-grab active:cursor-grabbing border border-white/10 hover:border-cyan-500/30 transition-colors duration-500"
    >
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <FaQuoteLeft className="text-cyan-500/40 text-5xl" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">{t.date}</span>
            <div className="flex gap-1">
              {Array(t.stars).fill(0).map((_, idx) => (
                <FaStar key={idx} className="text-yellow-400 text-sm text-glow-gold" />
              ))}
            </div>
          </div>
        </div>

        <p className="text-white/80 italic text-xl leading-relaxed mb-10 font-medium">
          “{t.text}”
        </p>

        <div className="flex items-center gap-5 pt-8 border-t border-white/5">
          <div className="relative w-20 h-20 client-aura">
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20 shadow-2xl z-10 bg-black/40">
              <Image
                src={t.img}
                alt={t.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="title-fire text-white font-black text-xl leading-none">{t.name}</h4>
              <FaCheckCircle className="text-cyan-400 text-sm" title="Cliente Verificado" />
            </div>
            <p className="text-cyan-400/80 text-xs font-bold tracking-wider uppercase mb-1">{t.role}</p>
            <p className="text-white/20 text-[10px] font-bold uppercase">{t.location}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
