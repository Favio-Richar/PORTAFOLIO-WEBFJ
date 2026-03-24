"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaEnvelope, FaPhoneAlt, FaLinkedinIn, FaCalendarAlt } from 'react-icons/fa';
import { defaultContact, type ContactData } from '@/lib/data/contact';
import API_BASE from "@/lib/apiBase";
import '@/styles/home-elite.scss';

const BACKEND_URL = API_BASE;

const normalizeSocialUrl = (value: string): string => {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `https://${normalized}`;
};

export default function ContactO() {
  const [contactData, setContactData] = useState<ContactData>(defaultContact);

  useEffect(() => {
    let isMounted = true;

    const loadContactData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/contact`, { cache: 'no-store' });
        if (!response.ok) return;

        const data = await response.json();
        if (!isMounted || !data) return;

        setContactData((prev) => ({
          ...prev,
          ...data,
          email: String(data.email || prev.email || defaultContact.email).trim(),
          phone: String(data.phone || prev.phone || defaultContact.phone).trim(),
          whatsapp: String(data.whatsapp || data.phone || prev.whatsapp || defaultContact.whatsapp).trim(),
          linkedin: String(data.linkedin || prev.linkedin || defaultContact.linkedin).trim(),
        }));
      } catch (error) {
        console.error('Error loading home contact data:', error);
      }
    };

    void loadContactData();

    return () => {
      isMounted = false;
    };
  }, []);

  const phoneText = contactData.phone || defaultContact.phone;
  const emailText = contactData.email || defaultContact.email;
  const whatsappRaw = contactData.whatsapp || phoneText || defaultContact.whatsapp;
  const whatsappDigits = whatsappRaw.replace(/\D/g, '') || defaultContact.whatsapp.replace(/\D/g, '');
  const whatsappHref = `https://wa.me/${whatsappDigits}`;
  const phoneHref = `tel:${phoneText.replace(/\s+/g, '')}`;
  const emailHref = `mailto:${emailText}`;
  const linkedinHref = useMemo(
    () => normalizeSocialUrl(contactData.linkedin || defaultContact.linkedin),
    [contactData.linkedin]
  );

  return (
    <section id="contacto" className="py-24 px-6 relative overflow-hidden">
      {/* Bloqueamos el fondo para efecto visual si se desea */}
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 md:p-12 text-center border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-indigo-400 mono text-sm">06.</span>
            <span className="text-sm text-gray-400">Contacto</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white font-display">
            ¿Listo para <span className="gradient-text">transformar tu negocio?</span>
          </h2>

          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-display">
            Agenda una consultoría profesional y descubre cómo la tecnología puede impulsar tu empresa.
          </p>

          {/* Contact Methods - RAIN OF ICONS EFFECT */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {/* WhatsApp */}
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="contact-card-rain flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-green-500/20 hover:border-green-500/50 transition-all duration-300 group">
              <div className="glow-dot bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
              <div className="contact-icon-rain" aria-hidden="true">
                <FaWhatsapp className="rain-icon rain-fall text-green-300/70" style={{ left: '8%', animationDelay: '0s', animationDuration: '3.2s', fontSize: '15px' }} />
                <FaWhatsapp className="rain-icon rain-fall text-green-400/75" style={{ left: '22%', animationDelay: '0.35s', animationDuration: '3.8s', fontSize: '13px' }} />
                <FaWhatsapp className="rain-icon rain-fall text-green-300/70" style={{ left: '36%', animationDelay: '0.75s', animationDuration: '3.4s', fontSize: '12px' }} />
                <FaWhatsapp className="rain-icon rain-fall text-green-400/70" style={{ left: '52%', animationDelay: '1.1s', animationDuration: '4.1s', fontSize: '14px' }} />
                <FaWhatsapp className="rain-icon rain-fall text-green-300/70" style={{ left: '68%', animationDelay: '1.45s', animationDuration: '3.6s', fontSize: '12px' }} />
                <FaWhatsapp className="rain-icon rain-fall text-green-400/75" style={{ left: '84%', animationDelay: '1.8s', animationDuration: '4.2s', fontSize: '14px' }} />
                <FaWhatsapp className="rain-icon rain-bubble text-green-300/60" style={{ left: '14%', animationDelay: '0.55s', animationDuration: '5.1s', fontSize: '11px' }} />
                <FaWhatsapp className="rain-icon rain-bubble text-green-400/65" style={{ left: '44%', animationDelay: '1.25s', animationDuration: '5.6s', fontSize: '12px' }} />
                <FaWhatsapp className="rain-icon rain-bubble text-green-300/60" style={{ left: '74%', animationDelay: '1.95s', animationDuration: '5.2s', fontSize: '10px' }} />
              </div>
              <div className="contact-icon-orb w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaWhatsapp className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-center">
                <h4 className="text-green-400 font-bold uppercase tracking-wider text-sm mb-1">WhatsApp</h4>
                <span className="text-[10px] text-gray-500 font-mono">INSTANTÁNEO</span>
              </div>
            </a>

            {/* Email */}
            <a href={emailHref} className="contact-card-rain flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="glow-dot bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
              <div className="contact-icon-rain" aria-hidden="true">
                <FaEnvelope className="rain-icon rain-fall text-blue-300/70" style={{ left: '9%', animationDelay: '0.1s', animationDuration: '3.4s', fontSize: '14px' }} />
                <FaEnvelope className="rain-icon rain-fall text-blue-400/75" style={{ left: '24%', animationDelay: '0.45s', animationDuration: '3.9s', fontSize: '13px' }} />
                <FaEnvelope className="rain-icon rain-fall text-blue-300/70" style={{ left: '39%', animationDelay: '0.9s', animationDuration: '3.3s', fontSize: '11px' }} />
                <FaEnvelope className="rain-icon rain-fall text-blue-400/70" style={{ left: '54%', animationDelay: '1.2s', animationDuration: '4.2s', fontSize: '14px' }} />
                <FaEnvelope className="rain-icon rain-fall text-blue-300/70" style={{ left: '70%', animationDelay: '1.6s', animationDuration: '3.7s', fontSize: '12px' }} />
                <FaEnvelope className="rain-icon rain-fall text-blue-400/75" style={{ left: '86%', animationDelay: '1.95s', animationDuration: '4.3s', fontSize: '14px' }} />
                <FaEnvelope className="rain-icon rain-bubble text-blue-300/60" style={{ left: '16%', animationDelay: '0.8s', animationDuration: '5.3s', fontSize: '11px' }} />
                <FaEnvelope className="rain-icon rain-bubble text-blue-400/65" style={{ left: '46%', animationDelay: '1.4s', animationDuration: '5.8s', fontSize: '12px' }} />
                <FaEnvelope className="rain-icon rain-bubble text-blue-300/60" style={{ left: '76%', animationDelay: '2.05s', animationDuration: '5.4s', fontSize: '10px' }} />
              </div>
              <div className="contact-icon-orb w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-center">
                <h4 className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-1">Email</h4>
                <span className="text-[10px] text-gray-500 font-mono">CORPORATIVO</span>
              </div>
            </a>

            {/* Llamar */}
            <a href={phoneHref} className="contact-card-rain flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="glow-dot bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
              <div className="contact-icon-rain" aria-hidden="true">
                <FaPhoneAlt className="rain-icon rain-fall text-purple-300/70" style={{ left: '8%', animationDelay: '0s', animationDuration: '3.5s', fontSize: '14px' }} />
                <FaPhoneAlt className="rain-icon rain-fall text-purple-300/75" style={{ left: '23%', animationDelay: '0.4s', animationDuration: '3.9s', fontSize: '13px' }} />
                <FaPhoneAlt className="rain-icon rain-fall text-purple-300/70" style={{ left: '38%', animationDelay: '0.8s', animationDuration: '3.4s', fontSize: '11px' }} />
                <FaPhoneAlt className="rain-icon rain-fall text-purple-300/70" style={{ left: '53%', animationDelay: '1.15s', animationDuration: '4.2s', fontSize: '14px' }} />
                <FaPhoneAlt className="rain-icon rain-fall text-purple-300/70" style={{ left: '69%', animationDelay: '1.55s', animationDuration: '3.7s', fontSize: '12px' }} />
                <FaPhoneAlt className="rain-icon rain-fall text-purple-300/75" style={{ left: '85%', animationDelay: '1.9s', animationDuration: '4.4s', fontSize: '14px' }} />
                <FaPhoneAlt className="rain-icon rain-bubble text-purple-300/60" style={{ left: '15%', animationDelay: '0.65s', animationDuration: '5.2s', fontSize: '11px' }} />
                <FaPhoneAlt className="rain-icon rain-bubble text-purple-300/65" style={{ left: '45%', animationDelay: '1.35s', animationDuration: '5.7s', fontSize: '12px' }} />
                <FaPhoneAlt className="rain-icon rain-bubble text-purple-300/60" style={{ left: '75%', animationDelay: '2s', animationDuration: '5.3s', fontSize: '10px' }} />
              </div>
              <div className="contact-icon-orb w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaPhoneAlt className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-center">
                <h4 className="text-purple-400 font-bold uppercase tracking-wider text-sm mb-1">Llamar</h4>
                <span className="text-[10px] text-gray-500 font-mono">URGENTE</span>
              </div>
            </a>

            {/* LinkedIn */}
            <a href={linkedinHref || defaultContact.linkedin} target="_blank" rel="noopener noreferrer" className="contact-card-rain flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 group">
              <div className="glow-dot bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
              <div className="contact-icon-rain" aria-hidden="true">
                <FaLinkedinIn className="rain-icon rain-fall text-cyan-300/70" style={{ left: '9%', animationDelay: '0.05s', animationDuration: '3.3s', fontSize: '14px' }} />
                <FaLinkedinIn className="rain-icon rain-fall text-cyan-300/75" style={{ left: '24%', animationDelay: '0.4s', animationDuration: '3.8s', fontSize: '13px' }} />
                <FaLinkedinIn className="rain-icon rain-fall text-cyan-300/70" style={{ left: '39%', animationDelay: '0.85s', animationDuration: '3.5s', fontSize: '11px' }} />
                <FaLinkedinIn className="rain-icon rain-fall text-cyan-300/70" style={{ left: '54%', animationDelay: '1.2s', animationDuration: '4.1s', fontSize: '14px' }} />
                <FaLinkedinIn className="rain-icon rain-fall text-cyan-300/70" style={{ left: '70%', animationDelay: '1.6s', animationDuration: '3.6s', fontSize: '12px' }} />
                <FaLinkedinIn className="rain-icon rain-fall text-cyan-300/75" style={{ left: '86%', animationDelay: '1.95s', animationDuration: '4.3s', fontSize: '14px' }} />
                <FaLinkedinIn className="rain-icon rain-bubble text-cyan-300/60" style={{ left: '17%', animationDelay: '0.75s', animationDuration: '5.25s', fontSize: '11px' }} />
                <FaLinkedinIn className="rain-icon rain-bubble text-cyan-300/65" style={{ left: '47%', animationDelay: '1.45s', animationDuration: '5.85s', fontSize: '12px' }} />
                <FaLinkedinIn className="rain-icon rain-bubble text-cyan-300/60" style={{ left: '77%', animationDelay: '2.1s', animationDuration: '5.35s', fontSize: '10px' }} />
              </div>
              <div className="contact-icon-orb w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaLinkedinIn className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-center">
                <h4 className="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-1">LinkedIn</h4>
                <span className="text-[10px] text-gray-500 font-mono">NETWORKING</span>
              </div>
            </a>
          </div>

          {/* Primary CTA */}
          <div className="flex justify-center mb-6">
            <a
              href="https://calendly.com/favio"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-cta-btn group inline-flex items-center gap-2"
            >
              <span className="relative z-10">Agendar consultoría profesional</span>
              <FaCalendarAlt className="relative z-10 text-[18px] transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </div>

          <p className="text-center text-xs text-gray-500 font-mono">
            Respondo en menos de 24 horas • Consultoría inicial sin costo • Confidencialidad
          </p>
        </motion.div>
      </div>
    </section>
  );
}
