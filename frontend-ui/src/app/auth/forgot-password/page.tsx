"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaSpinner, FaArrowLeft, FaCheckCircle, FaKey, FaLock } from "react-icons/fa";
import AdCarousel from "@/components/auth/AdCarousel";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1); // 1: Email, 2: Code + New Pass
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");

    // Step 1: Send Code
    async function handleSendCode(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const emailInput = formData.get("email") as string;

        try {
            const res = await fetch("http://localhost:8000/api/auth/recover-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailInput }),
            });

            if (!res.ok) throw new Error("Error al procesar la solicitud");

            setEmail(emailInput);
            setStep(2);
        } catch (err) {
            setError("Error al enviar código. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    }

    // Step 2: Reset Password
    async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const code = formData.get("code") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, new_password: newPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Error al restablecer contraseña");

            // Success! Redirect to login
            router.push("/auth/login");
        } catch (err: any) {
            setError(err.message || "Código inválido o expirado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-[#0f1115]">
            {/* Left Side: Form (5/12) */}
            <div className="w-full lg:w-5/12 flex items-center justify-center p-8 lg:p-16 relative z-10 overflow-hidden">
                {/* Background: Deep Black Luxe */}
                <div className="absolute top-0 left-0 w-full h-full bg-[#050505] z-0" />

                {/* Golden Animated Wave Background */}
                <div className="absolute inset-x-0 bottom-0 z-0 opacity-20 pointer-events-none transform translate-y-1/4">
                    <svg viewBox="0 0 1440 320" className="w-full h-auto fill-amber-500/20">
                        <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>

                <div className="w-full max-w-md relative z-20">
                    <div className="mb-14">
                        {/* Logo - Matte Gold Luxe */}
                        <div className="px-6 h-12 bg-amber-600 border-b-4 border-amber-800 rounded-lg mb-10 flex items-center justify-center font-black text-lg text-black uppercase tracking-tighter">
                            Next Level
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black text-white mb-5 tracking-tighter leading-none select-none">
                            Next Level
                            <span className="text-amber-500">.</span>
                        </h1>
                        <p className="text-amber-500/60 text-lg font-medium tracking-wide border-l-2 border-amber-600/30 pl-4 py-1 leading-relaxed">
                            {step === 1
                                ? "Protocolo de recuperación Next Level."
                                : "Actualización de acceso maestro Next Level."}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-amber-950/20 backdrop-blur-xl border border-amber-500/20 text-amber-500 p-5 rounded-2xl mb-10 text-xs font-black uppercase tracking-widest flex items-center gap-4 animate-shake">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendCode} className="space-y-10">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase text-amber-500/50 font-black tracking-[0.3em] ml-1">Digital Identity</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-amber-500 transition-all duration-500">
                                        <FaEnvelope />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full bg-black border-2 border-amber-600/20 rounded-lg py-5 pl-16 pr-6 text-white placeholder-slate-800 focus:outline-none focus:border-amber-500 transition-all duration-300 font-medium hover:border-amber-600/40"
                                        placeholder="correo@corporativo.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-[0.3em] rounded-lg border-b-4 border-amber-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-4 transform active:translate-y-1 active:border-b-0 mt-4"
                            >
                                {loading ? <FaSpinner className="animate-spin text-xl text-black" /> : "Generar Código"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase text-amber-500/50 font-black tracking-[0.3em] ml-1">Criptosecuencia (OTP)</label>
                                <input
                                    name="code"
                                    type="text"
                                    maxLength={6}
                                    required
                                    className="w-full bg-black border-2 border-amber-600/20 rounded-lg py-6 px-6 text-center text-white text-4xl tracking-[0.6em] font-black placeholder-slate-900 focus:outline-none focus:border-amber-500 transition-all duration-300 hover:border-amber-600/40"
                                    placeholder="000000"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] uppercase text-amber-500/50 font-black tracking-[0.3em] ml-1">Nueva Firma Digital</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-amber-500 transition-all duration-500">
                                        <FaLock />
                                    </div>
                                    <input
                                        name="newPassword"
                                        type="password"
                                        required
                                        className="w-full bg-black border-2 border-amber-600/20 rounded-lg py-5 pl-16 pr-6 text-white placeholder-slate-800 focus:outline-none focus:border-amber-500 transition-all duration-300 font-medium hover:border-amber-600/40"
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] uppercase text-amber-500/50 font-black tracking-[0.3em] ml-1">Validar Firma</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-amber-500 transition-all duration-500">
                                        <FaLock />
                                    </div>
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="w-full bg-black border-2 border-amber-600/20 rounded-lg py-5 pl-16 pr-6 text-white placeholder-slate-800 focus:outline-none focus:border-amber-500 transition-all duration-300 font-medium hover:border-amber-600/40"
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-[0.3em] rounded-lg border-b-4 border-amber-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-4 transform active:translate-y-1 active:border-b-0 mt-4"
                            >
                                {loading ? <FaSpinner className="animate-spin text-xl text-black" /> : "Confirmar Acceso"}
                            </button>
                        </form>
                    )}

                    <div className="mt-16 text-center border-t border-white/[0.03] pt-10">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-3 text-slate-500 hover:text-amber-400 transition-all font-black text-[10px] tracking-[0.3em] uppercase group"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-2 transition-transform duration-500" />
                            [ BACK_TO_INITIAL_PHASE ]
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side: Ads Carousel (7/12) */}
            <div className="hidden lg:block w-7/12 relative bg-black">
                <div className="absolute inset-0 z-0">
                    <AdCarousel position="login_hero" />
                </div>
                {/* Overlay Gradient for smooth Transition */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f1115] via-transparent to-transparent z-10 w-32 pointer-events-none" />
            </div>
        </div>
    );
}
