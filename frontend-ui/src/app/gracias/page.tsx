'use client';

import Link from "next/link";
import { FaCheckCircle, FaArrowRight, FaSpinner } from "react-icons/fa";
import { useEffect, useState } from "react";
import API_BASE from "@/lib/apiBase";

export default function PagosGraciasPage() {
  const [confirming, setConfirming] = useState(false);
  const [isContact, setIsContact] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("booking_id");
    
    if (bookingId) {
      setIsContact(false);
      setConfirming(true);
      // Notifica al backend que el pago en Stripe fue exitoso
      fetch(`${API_BASE}/api/asesoria/bookings/${bookingId}/confirm-payment`, {
        method: "POST"
      })
      .catch(err => console.error("Error al confirmar reserva:", err))
      .finally(() => setConfirming(false));
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#040917] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10 text-center space-y-8 p-10 bg-black/40 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="mx-auto w-20 h-20 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center animate-bounce">
          <FaCheckCircle className="text-4xl text-emerald-400" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-emerald-50">
            {isContact ? "¡Mensaje Recibido!" : "¡Pago Exitoso!"}
          </h1>
          <p className="text-slate-300 leading-relaxed text-sm">
            {isContact 
              ? "Hemos recibido tu consulta técnica. Nuestro equipo de ingeniería revisará tu requerimiento y te contactará en un máximo de 24 horas."
              : "Hemos recibido la confirmación de tu pago de forma segura por parte de Stripe. En breve recibirás el enlace de la reunión en tu correo electrónico."}
          </p>
          
          {confirming && (
             <p className="text-xs text-emerald-300 flex items-center justify-center gap-2 mt-4">
               <FaSpinner className="animate-spin" /> Verificando confirmación en el servidor...
             </p>
          )}
        </div>

        <Link
          href="/"
          className="mx-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black px-6 py-4 text-sm font-black uppercase tracking-wider transition hover:bg-slate-200"
        >
          Volver al Inicio
          <FaArrowRight className="text-xs" />
        </Link>
      </div>
    </main>
  );
}
