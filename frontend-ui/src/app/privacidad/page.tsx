"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";

export default function PrivacidadPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
            <div className="max-w-4xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors text-xs font-bold uppercase tracking-widest mb-8 group">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Volver al Inicio
                    </Link>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl">
                            <FaShieldAlt />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Política de <span className="text-indigo-500 text-shadow-glow">Privacidad</span></h1>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Última actualización: {new Date().toLocaleDateString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-12 text-slate-300 leading-relaxed"
                >
                    <section>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-4">1. Recopilación de Información</h2>
                        <p>En Next Level Software Pro, la privacidad de nuestros clientes es una prioridad. Recopilamos información personal únicamente cuando es estrictamente necesaria para proporcionar nuestros servicios de desarrollo de software, consultoría o para responder a consultas realizadas a través de nuestros formularios de contacto.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-4">2. Uso de los Datos</h2>
                        <p>Los datos proporcionados serán utilizados exclusivamente para:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-indigo-200/70">
                            <li>Gestionar y responder a solicitudes de cotización.</li>
                            <li>Coordinar sesiones de asesoría técnica.</li>
                            <li>Enviar información relevante sobre el estado de sus proyectos.</li>
                            <li>Mejorar la experiencia de usuario en nuestra plataforma.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-4">3. Seguridad de la Información</h2>
                        <p>Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra acceso no autorizado, alteración, divulgación o destrucción. Su información se almacena en servidores seguros y solo el personal autorizado tiene acceso a ella.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-4">4. Derechos del Usuario</h2>
                        <p>Usted tiene derecho a acceder, rectificar o eliminar sus datos personales en cualquier momento. Para ejercer estos derechos, puede ponerse en contacto con nuestro equipo a través de los canales oficiales proporcionados en la sección de Contacto.</p>
                    </section>

                    <footer className="pt-12 border-t border-white/5 text-xs text-slate-500 font-bold tracking-widest uppercase text-center">
                        Next Level Software Pro — Elevando los estándares de seguridad digital.
                    </footer>
                </motion.div>
            </div>
        </div>
    );
}
