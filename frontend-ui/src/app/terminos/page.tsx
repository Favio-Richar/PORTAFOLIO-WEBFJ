"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaFileContract, FaArrowLeft } from "react-icons/fa";

export default function TerminosPage() {
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
                            <FaFileContract />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Términos y <span className="text-indigo-500 text-shadow-glow">Condiciones</span></h1>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Vigencia desde: {new Date().toLocaleDateString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-12 text-slate-300 leading-relaxed"
                >
                    <section>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-4">1. Aceptación de Términos</h2>
                        <p>Al acceder y utilizar este sitio web, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, le solicitamos que no utilice nuestros servicios.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-4">2. Propiedad Intelectual</h2>
                        <p>Todo el contenido, diseños, algoritmos y código fuente presentados en este sitio son propiedad exclusiva de Next Level Software Pro o se utilizan bajo licencia. Queda estrictamente prohibida la reproducción total o parcial sin autorización expresa.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-4">3. Servicios y Cotizaciones</h2>
                        <p>Las cotizaciones generadas a través de nuestro sistema tienen un carácter informativo y una vigencia estándar de 30 días, a menos que se indique lo contrario. El inicio de cualquier proyecto requiere la firma de un contrato formal específico.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-4">4. Responsabilidad</h2>
                        <p>Next Level Software Pro se compromete a entregar soluciones de alta calidad, pero no se hace responsable por daños indirectos derivados del uso incorrecto de las herramientas proporcionadas o por fallos en infraestructuras de terceros.</p>
                    </section>

                    <footer className="pt-12 border-t border-white/5 text-xs text-slate-500 font-bold tracking-widest uppercase text-center">
                        Next Level Software Pro — Compromiso con la Excelencia técnica.
                    </footer>
                </motion.div>
            </div>
        </div>
    );
}
